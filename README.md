# FollowPilot

FollowPilot turns meeting transcripts into evidence-backed CRM updates for HubSpot. It identifies proposed changes with Gemini, keeps every decision under human control, and writes only approved updates to HubSpot.

## What it does

- Firebase email/password and Google authentication
- HubSpot OAuth connection with encrypted, HTTP-only token storage
- Contact and associated-deal lookup from HubSpot
- Gemini-powered transcript analysis
- Review, edit, reject, or manually add CRM changes before applying them
- Completed-meeting archive with a read-only audit view
- Workspace settings, integration status, onboarding, and sample review flow

## Local setup

Requirements: Node.js 20+ and npm.

```bash
npm install
cp .env.example .env.local
```

Add the following values to `.env.local`:

```bash
# Firebase web app
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# HubSpot OAuth app
HUBSPOT_CLIENT_ID=
HUBSPOT_CLIENT_SECRET=
HUBSPOT_REDIRECT_URI=http://localhost:3000/api/hubspot/callback
# Generate with: openssl rand -base64 32
HUBSPOT_TOKEN_ENCRYPTION_KEY=

# Gemini
GEMINI_API_KEY=
```

Start the app:

```bash
npm run dev
```

Open http://localhost:3000.

## Provider configuration

### Firebase

1. Create a Firebase project and register a web app.
2. Enable **Email/Password** and **Google** sign-in under Authentication.
3. Copy the web app configuration into `.env.local`.
4. Add your production domain to Firebase Authentication’s authorized domains before deploying.

### HubSpot

1. Create a HubSpot public app with OAuth.
2. Add `http://localhost:3000/api/hubspot/callback` as the local redirect URL.
3. Request the CRM contact, company, and deal read/write scopes.
4. Add the client ID, client secret, callback URL, and a unique encryption key to `.env.local`.
5. Sign in to FollowPilot and use **Connect HubSpot** from Onboarding or Integrations.

### Gemini

Create a Gemini API key and assign it to `GEMINI_API_KEY`. The key is used only by the server-side analysis route.

## Review flow

1. Sign in and connect HubSpot.
2. Add a meeting transcript, name, attendees, and the HubSpot contact.
3. Select an associated deal and choose **Analyze now**.
4. Confirm the matched opportunity, then approve, edit, reject, or add changes.
5. Review final changes and apply them to HubSpot.
6. Open the completed meeting’s **View audit** page to inspect the read-only completion result and audit history.

The sample meeting lets users explore the workflow without writing CRM data.

## Scripts

```bash
npm run dev    # Start the local development server
npm run lint   # Run ESLint
npm run build  # Create a production build
npm run start  # Run the production server after building
```

## Data handling

- HubSpot OAuth tokens are encrypted before being stored in an HTTP-only cookie.
- Only approved changes are sent to HubSpot.
- Meeting archive and UI preferences are stored locally in the browser for the current user session/workspace.
- The app never applies suggested CRM changes automatically.
