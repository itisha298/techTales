/**
 * npm run validate:content
 * Checks src/content/editable/*.json and explains exactly what to fix.
 * Optional: pass a folder to validate a copy, e.g. `node scripts/validate-content.ts some/folder`.
 */
import { formatIssues } from '../src/content/schema.ts';
import { checkEditableContent, EDITABLE_DIR } from './content-files.ts';

const dir = process.argv[2] ?? EDITABLE_DIR;
const issues = checkEditableContent(dir);
const errors = issues.filter((i) => i.severity === 'error');
console.log(formatIssues(issues));
if (errors.length) {
  console.error(`\n${errors.length} problem(s) must be fixed before this content can be published.`);
  process.exit(1);
}
console.log(issues.length ? '\nContent is valid (with warnings).' : '');
