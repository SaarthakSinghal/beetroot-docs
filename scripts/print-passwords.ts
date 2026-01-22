/**
 * Print all workshop passwords
 * Run this script to see all auto-generated passwords for your workshop chapters
 *
 * Usage:
 *   bun run scripts/print-passwords.ts
 */

import { printAllPasswords } from '../lib/workshopPasswords';

console.log('Generating passwords for all workshop chapters...\n');

printAllPasswords();
