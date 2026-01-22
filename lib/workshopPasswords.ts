/**
 * Server-only password storage for workshop chapters
 *
 * IMPORTANT: This file must NEVER be imported by client components.
 * It should only be used in API routes and middleware.
 *
 * PASSWORD STRATEGY (in order of priority):
 * 1. Environment variable WORKSHOP_PW_<INDEX>
 * 2. Auto-generated from title: "{title}-chapter{index}"
 * 3. Fallback: "chapter{index}"
 *
 * For example:
 * - Title: "AWS Resources", Index: 1 → Password: "aws-resources-chapter1"
 * - Title: "IAM Setup", Index: 2 → Password: "iam-setup-chapter2"
 */

// Simple password map using environment variables
// In production, you might want to hash these, but for a workshop context,
// simple string comparison is acceptable since they're short-lived session secrets

/**
 * Generate password from title
 * Formula: {lowercase-title-with-hyphens}-chapter{index}
 * Example: "AWS Resources" + index 1 → "aws-resources-chapter1"
 */
function generatePasswordFromTitle(title: string, index: number): string {
  const normalizedTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  return `${normalizedTitle}-chapter${index}`;
}

function getPasswordByIndex(index: number): string | null {
  // Try WORKSHOP_PW_<INDEX> first (e.g., WORKSHOP_PW_0)
  const envKey = `WORKSHOP_PW_${index}`;
  const password = process.env[envKey];

  if (password) {
    return password;
  }

  // Try WORKSHOP_PASSWORDS as a comma-separated list
  const passwordsList = process.env.WORKSHOP_PASSWORDS;
  if (passwordsList) {
    const passwords = passwordsList.split(',').map(p => p.trim());
    return passwords[index] || null;
  }

  return null;
}

function getPasswordBySlug(slug: string): string | null {
  // Convert slug to env variable format
  // e.g., "workshop/01-overview" -> "WORKSHOP_PW_WORKSHOP_01_OVERVIEW"
  const normalizedSlug = slug
    .replace(/\//g, '_')
    .replace(/-/g, '_')
    .toUpperCase();

  const envKey = `WORKSHOP_PW_${normalizedSlug}`;
  return process.env[envKey] || null;
}

/**
 * Validate password for a given doc index
 * @param index - The doc chapter index
 * @param password - The password to validate
 * @returns true if password is correct
 */
export function validatePasswordByIndex(index: number, password: string): boolean {
  // First, check if there's a custom password in env vars
  const correctPassword = getPasswordByIndex(index);

  if (correctPassword) {
    // Use custom password from env var
    if (password.length !== correctPassword.length) {
      return false;
    }
    let result = 0;
    for (let i = 0; i < password.length; i++) {
      result |= password.charCodeAt(i) ^ correctPassword.charCodeAt(i);
    }
    return result === 0;
  }

  // No custom password - generate from title
  const { workshopDocs } = require('./workshopAccess');
  const doc = workshopDocs.find((d: any) => d.index === index);

  if (!doc) {
    // Fallback if doc not found
    const fallbackPassword = `chapter${index}`;
    console.log(`[Password Check] Index: ${index}, Expected (fallback): "${fallbackPassword}", Got: "${password}"`);
    return password === fallbackPassword;
  }

  // Generate password from title
  const generatedPassword = generatePasswordFromTitle(doc.title, index);
  console.log(`[Password Check] Index: ${index}, Title: "${doc.title}", Expected: "${generatedPassword}", Got: "${password}"`);

  return password === generatedPassword;
}

/**
 * Validate password for a given doc slug
 * @param slug - The doc slug (e.g., "workshop/01-overview")
 * @param password - The password to validate
 * @returns true if password is correct
 */
export function validatePasswordBySlug(slug: string, password: string): boolean {
  // First try by slug
  const passwordBySlug = getPasswordBySlug(slug);
  if (passwordBySlug) {
    if (password.length !== passwordBySlug.length) {
      return false;
    }
    let result = 0;
    for (let i = 0; i < password.length; i++) {
      result |= password.charCodeAt(i) ^ passwordBySlug.charCodeAt(i);
    }
    return result === 0;
  }

  // If not found by slug, get the index and try by index
  const { getDocIndex } = require('./workshopAccess');
  const index = getDocIndex(slug);

  if (index === -1) {
    return false;
  }

  return validatePasswordByIndex(index, password);
}

/**
 * Check if a password is configured for a given index
 */
export function hasPasswordConfigured(index: number): boolean {
  return getPasswordByIndex(index) !== null || process.env.WORKSHOP_PASSWORDS !== undefined;
}

/**
 * Get all configured password indices
 */
export function getConfiguredPasswordIndices(): number[] {
  const indices: number[] = [];

  // Check WORKSHOP_PASSWORDS
  const passwordsList = process.env.WORKSHOP_PASSWORDS;
  if (passwordsList) {
    const count = passwordsList.split(',').length;
    for (let i = 0; i < count; i++) {
      indices.push(i);
    }
    return indices;
  }

  // Check individual WORKSHOP_PW_* variables
  let index = 0;
  while (true) {
    if (process.env[`WORKSHOP_PW_${index}`]) {
      indices.push(index);
      index++;
    } else {
      break;
    }
  }

  return indices;
}

/**
 * Get all passwords for workshop chapters
 * Useful for printing out a password list for workshop participants
 */
export function getAllPasswords(): Array<{ index: number; title: string; slug: string; password: string }> {
  const { workshopDocs } = require('./workshopAccess');

  return workshopDocs.map((doc: any) => {
    const customPassword = getPasswordByIndex(doc.index);
    const password = customPassword || generatePasswordFromTitle(doc.title, doc.index);

    return {
      index: doc.index,
      title: doc.title,
      slug: doc.slug,
      password,
    };
  });
}

/**
 * Print all passwords to console (for debugging/workshop setup)
 */
export function printAllPasswords(): void {
  const passwords = getAllPasswords();

  console.log('\n=== WORKSHOP PASSWORDS ===\n');

  passwords.forEach((pw: any) => {
    console.log(`Chapter ${pw.index + 1}: ${pw.title}`);
    console.log(`  Password: ${pw.password}`);
    console.log(`  Slug: ${pw.slug}`);
    console.log('');
  });

  console.log('========================\n');
}
