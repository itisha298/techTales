import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describeJsonError, EDITABLE_FILES, validateContent, type Issue, type RawContent } from '../src/content/schema.ts';

export const EDITABLE_DIR = path.resolve('src/content/editable');
const PUBLIC_DIR = path.resolve('public');
/** UTF-8 byte-order mark, which some editors add when saving. */
const BOM = new RegExp(`^${String.fromCharCode(0xfeff)}`);

/** Reads and validates every editable JSON file from disk. */
export function checkEditableContent(dir = EDITABLE_DIR, publicDir = PUBLIC_DIR): Issue[] {
  const raw: Partial<RawContent> = {};
  const parseIssues: Issue[] = [];
  for (const file of EDITABLE_FILES) {
    const full = path.join(dir, file);
    if (!existsSync(full)) {
      parseIssues.push({ severity: 'error', file, field: '(whole file)', message: `is missing from ${path.relative(process.cwd(), dir)}.` });
      continue;
    }
    const source = readFileSync(full, 'utf8');
    try {
      raw[file] = JSON.parse(source.replace(BOM, ''));
    } catch (e) {
      parseIssues.push(describeJsonError(file, source, e));
    }
  }
  if (parseIssues.length) return parseIssues;
  return validateContent(raw, { fileExists: (p) => existsSync(path.join(publicDir, p)) });
}
