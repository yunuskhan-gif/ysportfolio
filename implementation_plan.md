# Implementation Plan - Single Password Gate (Bypass/Redirect & FII DII Auth Cleanup)

Simplify the security architecture by:
1. Removing the old "Protected Access" card from `PasswordGate.tsx` and redirecting any unauthorized access to `/`.
2. Deleting the redundant, separate user login/register form and auth handlers from `fii-dii-tracker/page.tsx`, relying solely on the main welcome page password gate for security.

## User Review Required

> [!IMPORTANT]
> The separate login form inside the FII DII Tracker will be completely removed, and the tracker will render directly. The global portal password check on `/` will serve as the single security check for the entire application.

## Proposed Changes

---

### Password Gate

#### [MODIFY] [PasswordGate.tsx](file:///c:/Users/Mohd%20Aftab/Desktop/ys%2520portfolio/ysportfolio/src/components/auth/PasswordGate.tsx)
- Import `useRouter` from `next/navigation`.
- Add an effect to redirect unauthorized users (`isVerified === false` and `pathname !== "/"`) to the home page (`/`).
- Delete the old "Protected Access" card layout and copyright message entirely.
- Render a loading spinner during redirects and session checks.

---

### FII DII Sector Tracker

#### [MODIFY] [page.tsx](file:///c:/Users/Mohd%20Aftab/Desktop/ys%2520portfolio/ysportfolio/src/app/fii-dii-tracker/page.tsx)
- Remove separate authentication inputs and handlers:
  - Delete `isLogin`, `usernameInput`, `passwordInput`, and `submitLoading` states.
  - Delete `fetchUser`, `handleAuthSubmit`, and `handleLogout` functions.
  - Keep `token` and `user` state variables set to default values (`"default_token"` and `"Admin"`) to ensure watchlists and other API features function without changes.
- Delete any redundant auth page/form check markup.

---

### Welcome Page

#### [MODIFY] [page.tsx](file:///c:/Users/Mohd%2520Aftab/Desktop/ys%2520portfolio/ysportfolio/src/app/page.tsx)
- Ensure the login input on `/` acts as the single entry point.
- Redirect successfully authenticated sessions to `/dashboard`.

## Verification Plan

### Automated Build & Test
- Run `npx tsc --noEmit` to verify type safety.
- Run `npm run build` to verify Next.js Turbopack compilation.

### Manual Verification
- Clear cookies/localStorage.
- Go to `/dashboard` directly and verify you are redirected to `/` (welcome page).
- Log in on `/` with the correct password. Verify that you are redirected to `/dashboard` and the page loads without any other password prompts.
- Navigate to FII DII Sector Tracker and verify it renders directly without showing any separate login page.
