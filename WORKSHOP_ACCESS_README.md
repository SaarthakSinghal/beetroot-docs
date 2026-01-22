# Workshop Access Control System

This implementation provides a secure, server-side enforced chapter locking system for your Fumadocs workshop.

## Features

- **Server-side enforcement**: Chapters are locked at the middleware level - impossible to bypass via client-side manipulation
- **Sequential unlocking**: Users unlock chapters in order; unlocking chapter N also unlocks all previous chapters
- **Secure session management**: Uses HttpOnly, signed cookies with iron-session
- **Visual indicators**: Lock icons appear in sidebar and on locked navigation links
- **Graceful UX**: Locked chapters redirect to an unlock page instead of showing errors

## Architecture

### Core Components

1. **`middleware.ts`** - Server-side access control
   - Intercepts all requests to `/docs/*`
   - Checks session cookie for max unlocked index
   - Redirects to `/unlock` if chapter is locked

2. **`lib/session.ts`** - Session management
   - Uses iron-session for encrypted, signed cookies
   - Stores `maxUnlockedIndex` (the highest chapter unlocked)
   - Cookie name: `ws_unlock`

3. **`lib/workshopAccess.ts`** - Workshop configuration
   - Defines ordered list of all chapters
   - Helper functions to check if a doc is accessible
   - Maps slugs to indices

4. **`lib/workshopPasswords.ts`** - Password validation (server-only)
   - Reads passwords from environment variables
   - Supports per-chapter passwords or comma-separated list
   - Never exposed to client

5. **`app/api/unlock/route.ts`** - Unlock API
   - Validates passwords
   - Updates session on successful unlock
   - Includes rate limiting (10 requests per minute per IP)

6. **`app/unlock/page.tsx`** - Unlock page UI
   - Clean, Fumadocs-styled interface
   - Password input with error handling
   - Redirects to target chapter on success

7. **`components/sidebar-lock-indicator.tsx`** - Sidebar lock icons
   - Client-side component that adds lock icons to sidebar
   - Intercepts clicks on locked chapters

8. **`components/nav-lock-handler.tsx`** - Next/Prev navigation locks
   - Adds lock icons to next/prev links
   - Intercepts navigation to locked chapters

## Setup Instructions

### 1. Configure Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Required: Session secret (min 32 characters)
WORKSHOP_SESSION_SECRET=your-super-secret-key-at-least-32-chars

# Option 1: Individual passwords per chapter
WORKSHOP_PW_0=chapter1-password
WORKSHOP_PW_1=chapter2-password
# ... etc

# Option 2: Comma-separated list
WORKSHOP_PASSWORDS=pass1,pass2,pass3,...
```

**Important**: Never commit `.env.local` to version control!

### 2. Generate a Secure Session Secret

For production, use a cryptographically secure random string:

```bash
# On Linux/Mac:
openssl rand -base64 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Define Workshop Chapters

Edit `lib/workshopAccess.ts` to match your workshop structure:

```typescript
export const workshopDocs: WorkshopDoc[] = [
  { slug: 'workshop/01-overview', title: 'Project Overview', index: 0, fullPath: '/docs/workshop/01-overview' },
  { slug: 'workshop/02-aws-resources', title: 'AWS Resources', index: 1, fullPath: '/docs/workshop/02-aws-resources' },
  // ... add your chapters
];
```

The `index` determines the unlock order. Chapter 0 is unlocked by default.

### 4. Verify File Structure

Ensure your MDX files exist at:
```
content/docs/
  workshop/
    01-overview.mdx
    02-aws-resources.mdx
    03-iam.mdx
    ...
```

And that `content/docs/workshop/meta.json` lists them in order.

## How It Works

### User Flow

1. **First visit**: User lands on `/docs` (chapter 0 is unlocked by default)
2. **Attempting locked chapter**: User tries to access chapter 3
3. **Middleware check**: Middleware sees `maxUnlockedIndex` is 0, redirects to `/unlock?next=/docs/workshop/03-iam`
4. **Unlock page**: User enters password for chapter 3
5. **API validation**: API validates password server-side
6. **Session update**: On success, `maxUnlockedIndex` becomes 3 (unlocking chapters 0-3)
7. **Redirect**: User is redirected to chapter 3
8. **Subsequent access**: All chapters 0-3 are now accessible (even after refresh)

### Security Guarantees

- **Cannot bypass via URL**: Direct URL access to locked chapters is blocked by middleware
- **Cannot bypass via DevTools**: Session cookie is HttpOnly and signed
- **Cannot skip ahead**: Sequential model only allows advancing forward
- **Cannot manipulate session**: Cookie is encrypted and signed with server secret
- **Rate limiting**: API limits unlock attempts to prevent brute force

### What's Unlocked by Default

- Chapter 0 (index 0) is always accessible
- Non-workshop docs (index === -1) are always accessible
- All other chapters require password

## Customization

### Change Default Unlocked Chapter

In `lib/session.ts`, modify the default value:

```typescript
export async function getMaxUnlockedIndex(): Promise<number> {
  const session = await getSession();
  return session.maxUnlockedIndex ?? -1; // -1 = nothing unlocked, 0 = first chapter
}
```

### Adjust Rate Limiting

In `app/api/unlock/route.ts`:

```typescript
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;   // 10 attempts
```

### Customize Lock Icon Appearance

Edit `components/sidebar-lock-indicator.tsx` to change icon styling:

```typescript
icon.className = 'inline-block w-3.5 h-3.5 mr-1.5 text-red-500'; // Red lock icon
link.classList.add('opacity-60', 'text-muted-foreground'); // Dimmed text
```

## Testing

### 1. Test with Default Passwords

If you don't set `WORKSHOP_PW_*` env vars, the system uses defaults:
- Chapter 0: `chapter0`
- Chapter 1: `chapter1`
- etc.

### 2. Test Middleware Enforcement

```bash
# Direct URL attempt (should redirect to /unlock)
curl -I http://localhost:3000/docs/workshop/05-s3-trigger
```

### 3. Test Unlock Flow

1. Visit `/docs/workshop/01-overview` (should work)
2. Click on chapter 2 in sidebar (should redirect to `/unlock`)
3. Enter correct password (should unlock and redirect)
4. Refresh page (chapter should remain unlocked)

### 4. Test Session Persistence

1. Unlock a chapter
2. Close browser
3. Reopen and visit that chapter (should still be unlocked)

## Troubleshooting

### "Too many attempts" error

Wait 1 minute for rate limit to reset, or restart dev server.

### Chapters still locked after correct password

Check browser console for errors. Ensure cookies are enabled.

### Middleware not working

Ensure `middleware.ts` is in the project root (next to `package.json`).

### Lock icons not appearing

Check that `SidebarLockIndicator` and `NavLockHandler` components are properly imported.

## Production Considerations

1. **Use HTTPS**: Required for secure cookies in production
2. **Strong session secret**: Generate cryptographically secure secret
3. **Environment variables**: Never commit `.env.local`
4. **Monitor abuse**: Consider Redis-backed rate limiting for production
5. **Password complexity**: Use strong, unique passwords per chapter
6. **Cookie security**: Current config uses `Secure` flag in production

## File Reference

```
project-root/
├── middleware.ts                          # Server-side access control
├── lib/
│   ├── session.ts                        # Cookie/session management
│   ├── workshopAccess.ts                 # Chapter definitions and helpers
│   └── workshopPasswords.ts              # Password validation (server-only)
├── app/
│   ├── api/unlock/route.ts              # Unlock API endpoint
│   ├── unlock/page.tsx                  # Unlock page UI
│   └── docs/
│       ├── layout.tsx                   # Docs layout (with session state)
│       └── [[...slug]]/page.tsx         # Docs page (with nav lock handler)
├── components/
│   ├── sidebar-lock-indicator.tsx       # Sidebar lock icons
│   └── nav-lock-handler.tsx             # Next/prev lock handling
└── .env.example                          # Environment variable template
```

## License

This implementation is provided as-is for workshop and educational purposes.
