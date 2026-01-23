/**
 * Print workshop passwords
 * Run this script to see auto-generated passwords for your workshop chapters
 *
 * Usage:
 *   bun run passwords                    # Show all passwords
 *   bun run passwords --index 2         # Show password for chapter at index 2
 *   bun run passwords -i 2              # Short form
 */

import {
  getAllPasswords,
  getPasswordByIndex,
  generateDeterministicPassword,
} from "../lib/workshopPasswords";
import { workshopDocs } from "../lib/workshopAccess";

// Parse command line arguments
const args = process.argv.slice(2);
const indexFlagIndex = args.findIndex(
  (arg) => arg === "--index" || arg === "-i",
);

if (indexFlagIndex !== -1 && args[indexFlagIndex + 1]) {
  // Show specific chapter by index
  const index = parseInt(args[indexFlagIndex + 1], 10);

  if (isNaN(index)) {
    console.error("Error: Index must be a number");
    console.error("Usage: bun run passwords --index <number>");
    process.exit(1);
  }

  const doc = workshopDocs.find((d: any) => d.index === index);

  if (!doc) {
    console.error(`Error: No chapter found at index ${index}`);
    console.error(`Available indices: 0 to ${workshopDocs.length - 1}`);
    process.exit(1);
  }

  const customPassword = getPasswordByIndex(index);
  const password =
    customPassword || generateDeterministicPassword(doc.title, index);

  console.log("\n== WORKSHOP PASSWORD ==\n");
  console.log(`Chapter ${index + 1}: ${doc.title}`);
  console.log(`Slug: ${doc.slug}`);
  console.log(`Password: ${password}`);
  console.log(`\nFull path: ${doc.fullPath}`);
  console.log("\n========================\n");
} else {
  // Show all passwords
  console.log("Generating passwords for all workshop chapters...\n");
  const passwords = getAllPasswords();

  console.log("=== WORKSHOP PASSWORDS ===\n");

  passwords.forEach((pw: any) => {
    console.log(`Chapter ${pw.index + 1}: ${pw.title}`);
    console.log(`  Password: ${pw.password}`);
    console.log(`  Slug: ${pw.slug}`);
    console.log("");
  });

  console.log("========================\n");
}
