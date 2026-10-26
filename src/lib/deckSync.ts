/**
 * Optional same-machine window synchronisation over BroadcastChannel.
 *
 * - No server: BroadcastChannel only links windows/tabs of the same origin
 *   in the same browser profile (e.g. audience window + presenter window).
 * - Opt-in per window. Windows that are not linked, or browsers without
 *   BroadcastChannel, keep working completely independently.
 * - Last action wins; remote updates are applied without being re-broadcast.
 */

export const SYNC_CHANNEL = 'meridian-deck-sync-v1';
const PEER_TIMEOUT_MS = 9000;
const HEARTBEAT_MS = 3000;
/** A newly linked window only adopts a peer's position within this window. */
const ADOPT_WINDOW_MS = 1500;

export interface DeckPosition {
  index: number;
  step: number;
}

type Message =
  | { type: 'state'; from: string; index: number; step: number; reply?: boolean }
  | { type: 'hello'; from: string }
  | { type: 'ping'; from: string }
  | { type: 'bye'; from: string };

export const syncSupported = () => typeof BroadcastChannel !== 'undefined';

export class DeckSync {
  readonly id = Math.random().toString(36).slice(2, 10);
  private channel: BroadcastChannel | null = null;
  private peers = new Map<string, number>();
  private heartbeat: ReturnType<typeof setInterval> | undefined;
  private lastRemote: DeckPosition | null = null;
  private adoptedHello = false;
  private adoptTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly handlers: {
      /** Apply a position received from another window. */
      onRemote: (pos: DeckPosition) => void;
      /** Current local position (used to answer newcomers). */
      getPosition: () => DeckPosition;
      /** Linked-window count changed. */
      onPeers?: (count: number) => void;
    },
    private readonly channelName = SYNC_CHANNEL,
    private readonly now: () => number = () => Date.now(),
  ) {}

  get active() {
    return this.channel !== null;
  }

  start() {
    if (this.channel || !syncSupported()) return false;
    this.channel = new BroadcastChannel(this.channelName);
    this.channel.onmessage = (e: MessageEvent<Message>) => this.receive(e.data);
    this.adoptedHello = false;
    this.adoptTimer = setTimeout(() => (this.adoptedHello = true), ADOPT_WINDOW_MS);
    this.post({ type: 'hello', from: this.id });
    this.heartbeat = setInterval(() => {
      this.post({ type: 'ping', from: this.id });
      this.prunePeers();
    }, HEARTBEAT_MS);
    return true;
  }

  stop() {
    if (!this.channel) return;
    this.post({ type: 'bye', from: this.id });
    clearInterval(this.heartbeat);
    clearTimeout(this.adoptTimer);
    this.channel.close();
    this.channel = null;
    this.peers.clear();
    this.handlers.onPeers?.(0);
  }

  /** Call after every local position change. Echoes of remote updates are skipped. */
  publish(pos: DeckPosition) {
    if (!this.channel) return;
    if (this.lastRemote && this.lastRemote.index === pos.index && this.lastRemote.step === pos.step) {
      this.lastRemote = null;
      return;
    }
    this.lastRemote = null;
    this.post({ type: 'state', from: this.id, ...pos });
  }

  get peerCount() {
    return this.peers.size;
  }

  private post(msg: Message) {
    try {
      this.channel?.postMessage(msg);
    } catch {
      // A closed channel must never break navigation.
    }
  }

  private seen(from: string) {
    const isNew = !this.peers.has(from);
    this.peers.set(from, this.now());
    if (isNew) this.handlers.onPeers?.(this.peers.size);
  }

  private prunePeers() {
    const cutoff = this.now() - PEER_TIMEOUT_MS;
    let changed = false;
    for (const [id, at] of this.peers) {
      if (at < cutoff) {
        this.peers.delete(id);
        changed = true;
      }
    }
    if (changed) this.handlers.onPeers?.(this.peers.size);
  }

  private receive(msg: Message) {
    if (!msg || msg.from === this.id) return;
    if (msg.type === 'bye') {
      if (this.peers.delete(msg.from)) this.handlers.onPeers?.(this.peers.size);
      return;
    }
    this.seen(msg.from);
    if (msg.type === 'hello') {
      // Tell the newcomer where we are.
      this.post({ type: 'state', from: this.id, ...this.handlers.getPosition(), reply: true });
      return;
    }
    if (msg.type === 'state') {
      // A newly linked window adopts the first reply only; existing windows ignore replies.
      if (msg.reply) {
        if (this.adoptedHello) return;
        this.adoptedHello = true;
      }
      const pos = { index: msg.index, step: msg.step };
      const cur = this.handlers.getPosition();
      if (cur.index === pos.index && cur.step === pos.step) return;
      this.lastRemote = pos;
      this.handlers.onRemote(pos);
    }
  }
}
