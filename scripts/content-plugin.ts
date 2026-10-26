import type { Plugin } from 'vite';
import { formatIssues } from '../src/content/schema.ts';
import { checkEditableContent } from './content-files.ts';

/**
 * Validates src/content/editable/*.json at build time (the build fails with a
 * readable list of problems) and while editing locally (errors appear in the
 * browser overlay as soon as a file is saved).
 */
export function contentValidation(): Plugin {
  return {
    name: 'meridian-content-validation',
    buildStart() {
      const issues = checkEditableContent();
      const errors = issues.filter((i) => i.severity === 'error');
      if (issues.length) this.warn(`\n${formatIssues(issues.filter((i) => i.severity === 'warning'))}`);
      if (errors.length) this.error(`Editable content has ${errors.length} problem(s):\n${formatIssues(errors)}`);
    },
    handleHotUpdate(ctx) {
      if (!/src[/\\]content[/\\]editable[/\\].+\.json$/.test(ctx.file)) return;
      const errors = checkEditableContent().filter((i) => i.severity === 'error');
      if (errors.length) {
        ctx.server.ws.send({ type: 'error', err: { message: `Editable content has problems:\n${formatIssues(errors)}`, stack: '' } });
        return [];
      }
    },
  };
}
