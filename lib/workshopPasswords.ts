/**
 * Server-only password storage for workshop chapters
 *
 * IMPORTANT: This file must NEVER be imported by client components.
 * It should only be used in API routes and middleware.
 *
 * PASSWORD STRATEGY (in order of priority):
 * 1. Environment variable WORKSHOP_PW_<INDEX>
 * 2. Auto-generated 6-character password with alphanumeric + special char
 * 3. Fallback: "chapter{index}"
 *
 * Auto-generated format: 6 characters (uppercase, lowercase, number, special char)
 * Example: "K9$mP2", "B7#xL4", "T5@qR8"
 */

// Simple password map using environment variables
// In production, you might want to hash these, but for a workshop context,
// simple string comparison is acceptable since they're short-lived session secrets

/**
 * Generate a random 6-character password with alphanumeric and special characters
 * Format: Exactly 6 characters including:
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character (!@#$%^&*)
 *
 * Examples: "K9$mP2", "B7#xL4", "T5@qR8", "A3&fZ9"
 */
function generateSixCharPassword(): string {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // No I, O to avoid confusion
  const lowercase = 'abcdefghjkmnpqrstuvwxyz'; // No i, l, o to avoid confusion
  const numbers = '23456789'; // No 0, 1 to avoid confusion
  const special = '!@#$%^&*';

  // Start with one of each required type
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill remaining 2 characters with random mix
  const allChars = uppercase + lowercase + numbers + special;
  for (let i = 0; i < 2; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password characters
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * Generate password from title (DEPRECATED - kept for backward compatibility)
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

export function getPasswordByIndex(index: number): string | null {
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

  // No custom password - use the deterministic password based on index and title
  // We generate a consistent password for each doc by using the doc's title as a seed
  const { workshopDocs } = require('./workshopAccess');
  const doc = workshopDocs.find((d: any) => d.index === index);

  if (!doc) {
    // Fallback if doc not found
    const fallbackPassword = `chapter${index}`;
    return password === fallbackPassword;
  }

  // Generate a deterministic password based on the doc title
  // This ensures the same doc always has the same password
  const deterministicPassword = generateDeterministicPassword(doc.title, index);

  return password === deterministicPassword;
}

/**
 * Generate a deterministic 6-character password based on title and index
 * This ensures the same doc always gets the same password
 */
export function generateDeterministicPassword(title: string, index: number): string {
  // Create a simple seed from title and index
  const seed = title.length + index + title.charCodeAt(0);

  // Use the seed to pick characters
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghjkmnpqrstuvwxyz';
  const numbers = '23456789';
  const special = '!@#$%^&*';

  const allChars = uppercase + lowercase + numbers + special;

  let password = '';
  let seededRandom = seed;

  // Generate 6 characters using seeded random
  for (let i = 0; i < 6; i++) {
    seededRandom = (seededRandom * 9301 + 49297) % 233280;
    const index = Math.floor((seededRandom / 233280) * allChars.length);
    password += allChars[index];
  }

  return password;
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
    const password = customPassword || generateDeterministicPassword(doc.title, doc.index);

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
