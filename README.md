# Safe Harbor — HackDavis 2026

A privacy-first web platform for survivors of domestic violence. The real app is disguised as one of three everyday utilities (Calculator, News, Weather) to protect survivors on shared or monitored devices.

**"Safety, beautifully disguised."**

---

## Visual Design System (iPhone Sanctuary Edition)

Safe Harbor features an ultra-modern, premium UI designed to feel like a native iOS "sanctuary."

- **Aesthetic:** Heavy glassmorphism (`backdrop-filter: blur`), squircle corners, and luminous atmosphere.
- **Palette:** Warm Cream (`#f6f0e4`), Off-white Paper (`#fcfaf7`), Charcoal Ink (`#362e28`), and Clay Rust (`#c97d57`).
- **Typography:** Bold, high-contrast "Inter" stacks with precise display spacing.
- **Motion:** Seamless, infinite-scrolling marquees and cubic-bezier transitions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend / SSR | Next.js 14 (Pages Router) |
| Backend | Node.js + custom HTTP server |
| Real-time | Socket.io |
| Database | MongoDB Atlas via Mongoose |
| Auth | JWT in HTTP-only session cookies |
| PWA | Web App Manifests + custom Service Worker |

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd "HackDavis 2026"
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in each value. Instructions for every key are in `.env.example`. The minimum required to boot:

| Key | How to get it |
|---|---|
| `MONGODB_URI` | MongoDB Atlas → Connect → Drivers. Ask Lead for the org invite. |
| `JWT_SECRET` | Run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `NEXT_PUBLIC_SAFE_EXIT_URL` | Any safe redirect URL (default: `https://www.google.com`) |

### 3. Run

```bash
npm run dev        # development (http://localhost:3000)
npm run build      # production build
npm start          # production server
```

### 4. Verify startup

A healthy boot prints this sequence to the terminal:

```
[PwaFeature] PWA ready. Safe-exit URL: ...
[AuthFeature] Zero-trace auth system initialized.
[ChatFeature] Friend-gated persistent chat enabled.
[JournalFeature] Private evidence journal initialized.
[JournalFeature] Attachment storage: MongoDB GridFS (journal_attachments).
[AiChatFeature] AI support chat initialized.
[BookmarkFeature] Bookmark system initialized.
[BookmarkFeature] Attachment storage: MongoDB GridFS (bookmark_attachments).
[ButtonFeature] Discreet SOS chat button enabled.
[GeolocationFeature] Opt-in latest-location storage enabled.
[SOSFeature] Trusted-contact SOS messaging enabled.
> Ready on http://localhost:3000 [dev]
[AuthFeature] MongoDB connected.
```

If you see `JWT_SECRET is missing` or `MONGODB_URI is missing`, your `.env` is incomplete.

---

## Project Structure

```
HackDavis 2026/
├── server.js                  ← Entry point. Boots Next.js + Socket.io + features.
├── next.config.js             ← Security headers, reactStrictMode.
├── package.json
├── .env                       ← Local secrets. NEVER commit.
├── .env.example               ← Committed template with instructions per key.
│
├── public/
│   ├── manifests/
│   │   ├── calculator.json    ← PWA manifest: "Calculator Pro"
│   │   ├── news.json          ← PWA manifest: "Daily News Reader"
│   │   └── weather.json       ← PWA manifest: "Weather Now"
│   ├── sw.js                  ← Privacy-first service worker (network-only, no cache)
│   └── resources/images/logos/ ← App icons (32, 48, 192, 512px per theme)
│
└── src/
    ├── app.js                 ← Feature orchestrator. Only place features are activated.
    ├── config/
    │   ├── config.json        ← Public feature toggles. Safe to commit.
    │   └── config.js          ← Singleton bridge: merges config.json + .env.
    ├── features/
    │   ├── auth_feature.js    ← Zero-trace auth: register, login, logout controllers.
    │   ├── chat_feature.js    ← Anonymous Socket.io chat rooms.
    │   ├── journal_feature.js ← Private evidence journal init + readiness logging.
    │   ├── ai_chat_feature.js ← AI support chat init (validates CLAUDE_API_KEY).
    │   ├── bookmark_feature.js← Bookmark system init + readiness logging.
    │   ├── geolocation_feature.js ← Opt-in latest-location storage readiness logging.
    │   ├── button.js          ← Discreet SOS chat access button readiness logging.
    │   └── pwa_feature.js     ← Validates PWA manifests exist at startup.
    ├── models/
    │   ├── User.js            ← Mongoose schema: username, bcrypt hashes, display name.
    │   ├── JournalEntry.js    ← Schema: title, content, incidentDate, attachments[].
    │   ├── Bookmark.js        ← Schema: content, title, type, image, tags.
    │   └── UserLocation.js    ← Schema: one latest GeoJSON location per user.
    ├── lib/
    │   ├── db.js              ← Cached Mongoose connection (survives hot reloads).
    │   ├── withAuth.js        ← getServerSideProps wrapper — protects pages.
    │   ├── requireAuth.js     ← API route wrapper — enforces auth on endpoints.
    │   ├── gridfs.js          ← Lazy GridFS buckets: journal_attachments + bookmark_attachments.
    │   ├── multerHelper.js    ← Multer adapter for Next.js: memoryStorage, 50MB, MIME guard.
    │   └── anthropic.js       ← Lazy Anthropic client singleton (reads CLAUDE_API_KEY).
    ├── middleware/
    │   └── securityHeaders.js ← Cache-prevention + security headers for auth routes.
    ├── hooks/
    │   ├── usePrivacyMode.js  ← SW registration, history lock, session wipe on hide.
    │   ├── useChat.js         ← Socket.io client hook: connect, join room, messages.
    │   ├── useSpeechToText.js ← Web Speech API hook. ⚠ NOT YET WORKING — needs investigation.
    │   └── useGeolocation.js  ← Browser watchPosition + latest-location API calls.
    ├── components/
    │   ├── PanicExit.jsx      ← Always-on quick-exit (Escape / quadruple-tap / button).
    │   ├── ChatRoom.jsx       ← Anonymous real-time chat UI.
    │   ├── LocationCapture.jsx ← Live coordinate tester + clear control.
    │   ├── Button.jsx         ← Discreet SOS chat access control.
    │   ├── CalculatorCover.jsx ← Calculator disguise UI.
    │   ├── NewsCover.jsx      ← News disguise UI.
    │   └── WeatherCover.jsx   ← Weather disguise UI.
    ├── pages/
    │   ├── _app.jsx           ← Global CSS import.
    │   ├── index.jsx          ← Landing page: describes app, links to 3 PWA installs.
    │   ├── login.jsx          ← Login / Register page (toggles between modes).
    │   ├── dev-test.jsx       ← ⚠ DEV ONLY — delete before shipping. Tests AI chat, bookmarks, STT.
    │   ├── app/
    │   │   └── [theme].jsx    ← Auth-gated app shell for calculator | news | weather.
    │   ├── api/auth/
    │   │   ├── register.js
    │   │   ├── login.js
    │   │   └── logout.js
    │   ├── api/journal/
    │   │   ├── index.js           ← GET (list, paginated) + POST (create entry)
    │   │   ├── [id].js            ← GET / PUT / DELETE a single entry
    │   │   └── attachment/
    │   │       ├── index.js       ← POST upload (multipart/form-data)
    │   │       └── [fileId].js    ← GET stream + DELETE a file
    │   ├── api/ai-chat/
    │   │   └── index.js           ← POST — sends conversation to Claude, returns response
    │   ├── api/bookmarks/
    │   │   ├── index.js           ← GET (list, paginated + type filter) + POST (create)
    │   │   ├── [id].js            ← GET / PUT / DELETE a single bookmark
    │   │   ├── from-chat.js       ← POST — auto-creates bookmark from an AI response
    │   │   └── image/
    │   │       ├── index.js       ← POST upload image (images only, replaces previous)
    │   │       └── [fileId].js    ← GET inline stream + DELETE
    │   ├── api/geolocation/
    │   │   └── index.js       ← GET latest + POST upsert + DELETE clear.
    │   ├── api/news/
    │   │   └── headlines.js   ← News cover headline API.
    └── styles/
        ├── globals.css           ← CSS custom properties, resets.
        ├── Marketing.module.css  ← Landing page premium "Sanctuary" styles.
        ├── Landing.module.css    ← App selection (Downloads) page styles.
        ├── Login.module.css      ← Login/Register page styles.
        ├── ChatRoom.module.css   ← Chat UI styles.
        ├── CalculatorCover.module.css
        ├── NewsCover.module.css
        └── WeatherCover.module.css
```

---

## Feature Toggle Architecture

All feature flags live in `src/config/config.json`. Set a flag to `true` to activate a feature, `false` to disable it completely — no code from a disabled feature ever executes.

```json
{
  "features": {
    "enable_pwa": true,
    "enable_auth_system": true,
    "enable_anonymous_chat": true,
    "enable_journal": true,
    "enable_ai_chat": true,
    "enable_bookmarks": true,
    "enable_button": true,
    "enable_geolocation": true,
    "enable_sos": true,
    "enable_safety_alert": false,
    "enable_resource_directory": false,
    "enable_crisis_escalation": false
  }
}
```

### How the pipeline works

```
server.js
  └── src/app.js (orchestrator)
        ├── config.features.enable_pwa       → PwaFeature.init()
        ├── config.features.enable_auth      → AuthFeature.init()
        ├── config.features.enable_chat      → ChatFeature.init(io)
        ├── config.features.enable_journal   → JournalFeature.init()
        ├── config.features.enable_ai_chat   → AiChatFeature.init()
        ├── config.features.enable_bookmarks → BookmarkFeature.init()
        ├── config.features.enable_button    → ButtonFeature.init()
        └── config.features.enable_geolocation → GeolocationFeature.init()
```

`src/config/config.js` is the **singleton bridge** — it merges `config.json` (public flags, committed) with `.env` (private secrets, local-only). Every `require('./config/config')` across the app returns the same cached object.

### Adding a new feature

1. Create `src/features/your_feature.js` with a `static init()` method.
2. Add `"enable_your_feature": false` to `src/config/config.json`.
3. Add the toggle + init call to `src/app.js` (follow the existing pattern).
4. Flip the flag to `true` when ready to test.

```javascript
// src/features/your_feature.js
class YourFeature {
  static init(io) {
    console.log('[YourFeature] Initialized.');
    // register routes, connect DB collections, set up listeners, etc.
  }
}
module.exports = { YourFeature };
```

---

## Auth System

### Endpoints

| Method | Route | Body |
|---|---|---|
| POST | `/api/auth/register` | `{ username, password, duressPassword? }` |
| POST | `/api/auth/login` | `{ username, password }` |
| POST | `/api/auth/logout` | _(none)_ |

### Zero-trace rules

- Auth token lives in an **HTTP-only, SameSite=Strict cookie** — JavaScript cannot read it.
- Cookie has **no `Max-Age` or `Expires`** — it is deleted when the browser closes.
- `Secure` flag is set in production (HTTPS only).
- No "Remember Me", no localStorage, no sessionStorage for auth.
- All auth routes return `Cache-Control: no-store` so responses are never cached.

### Duress password

Each user can optionally set a second password. When the duress password is used at login:
- The JWT payload carries `{ duressMode: true }`.
- The client can use this to silently wipe sensitive content or show a decoy screen.
- The abuser sees a normal-looking app. The survivor gets a safe view.

### Protecting pages — `withAuth`

Wrap `getServerSideProps` on any page that requires a valid session:

```javascript
const { withAuth } = require('../../lib/withAuth');

export const getServerSideProps = withAuth(async (context, session) => {
  // session = { sub, displayName, duressMode }
  return { props: { anything: true } };
});
```

Redirects to `/login` if the cookie is missing or expired. On expiry, clears the stale cookie automatically.

### Protecting API routes — `requireAuth`

Wrap any API route handler that needs a verified session:

```javascript
const { requireAuth } = require('../../../lib/requireAuth');

export default requireAuth(async (req, res) => {
  const { sub, displayName } = req.session;
  res.json({ displayName });
});
```

Returns `401` with a JSON error if the token is missing or invalid.

### User flow

```
/ (landing)
  └── /app/[theme]  →  withAuth check
        ↓ no valid cookie
      /login  →  POST /api/auth/login  →  cookie set
        ↓ success
      /app/[theme]  (authenticated)
```

The login page also skips itself if a valid cookie already exists (redirects straight to `/app/calculator`).

---

## PWA & Privacy Architecture

### Three cover identities

| Cover name | Start URL | Manifest |
|---|---|---|
| Calculator Pro | `/app/calculator` | `public/manifests/calculator.json` |
| Daily News Reader | `/app/news` | `public/manifests/news.json` |
| Weather Now | `/app/weather` | `public/manifests/weather.json` |

Chrome distinguishes the three as separate installed apps via the `"id"` field in each manifest.

### Installing on a device

1. Open `http://localhost:3000` (or the deployed URL).
2. Tap one of the three app cards.
3. The browser navigates to `/app/[theme]` which links the correct manifest.
4. Chrome/Safari shows "Add to Home Screen" — install from there.
5. The app appears on the home screen with its cover icon and name.

### Privacy protections active in the app shell

| Protection | Implementation |
|---|---|
| No caching | Service worker (`public/sw.js`) uses network-only fetch; HTTP headers add `no-store` |
| Cache purge on hide | `usePrivacyMode` posts `PURGE_CACHE` to SW when tab is backgrounded |
| History lock | `usePrivacyMode` traps `popstate` — the back button goes nowhere |
| Session wipe on hide | `sessionStorage.clear()` fires on `visibilitychange: hidden` |
| Panic exit — Escape key | Single keypress redirects immediately |
| Panic exit — horizontal swipe | Large horizontal swipe on touch surface (disabled when typing) |
| Panic exit — corner button | Discreet fixed `✕` button, bottom-right |
| Panic exit — quadruple tap | Detects rapid quadruple tap on screen to trigger safe exit |
| Panic redirect | Calls `POST /api/auth/logout` (`keepalive: true`) to clear the auth cookie, then `window.location.replace(NEXT_PUBLIC_SAFE_EXIT_URL)` — removes history entry |
| No indexing | `<meta name="robots" content="noindex, nofollow">` on app shell pages |
| No referrer leakage | `Referrer-Policy: no-referrer` site-wide |
| No autofill | `autocomplete="off"` / `autocomplete="new-password"` on all auth inputs |
| Password visibility toggle | Show/Hide button on each password field — no clipboard or autofill exposure |
| Opt-in geolocation | Browser permission required; latest location stored only after user action |

---

## Discreet SOS Button

The app shell includes a small, unlabeled `Button` component that appears after a user is authenticated and viewing one of the disguise screens.

### Purpose

The button is not a login button. It is an in-app switch from the current cover identity into the SOS chat.

### Flow

```
/ (landing)
  -> click one app card / install one cover identity
  -> /app/[theme]
  -> withAuth check
  -> /login?returnTo=/app/[theme] if there is no valid cookie
  -> login success returns to /app/[theme]
  -> click discreet Button
  -> SOS chat
```

### Files

| File | Responsibility |
|---|---|
| `src/features/button_feature.js` | Feature init and startup log for the button feature. |
| `src/components/Button.jsx` | Small fixed-position button that calls the app shell's chat toggle handler. |
| `src/pages/app/[theme].jsx` | Owns the local state that switches from cover UI to `ChatRoom`. |

The button is controlled by `config.features.enable_button`. Keep the component low-contrast and unlabeled so the disguise remains the default visible experience.

---

## SOS Feature

The SOS feature sends an emergency message with the user's current browser location to all accepted trusted contacts.

### Flow

```
PrivateModeShell SOS tab
  -> user taps Send SOS
  -> browser requests current location
  -> POST /api/sos
  -> server verifies auth + enable_sos
  -> server finds accepted Friend relationships
  -> server writes one ChatMessage per trusted contact chat
  -> online contacts receive the message through Socket.io
```

### Files

| File | Responsibility |
|---|---|
| `src/features/sos_feature.js` | Feature init, startup log, and Socket.io reference registration. |
| `src/pages/api/sos/index.js` | Protected SOS endpoint that validates location and sends chat messages. |
| `src/lib/socketServer.js` | Singleton bridge for sharing the Socket.io server with API routes. |
| `src/components/PrivateModeShell.jsx` | Gets browser location and calls `/api/sos` from the SOS tab. |

The feature is controlled by `config.features.enable_sos`. If disabled, `/api/sos` returns `404` and the SOS panel disables sending.

---

## Git Workflow

### Branch naming

```bash
git checkout -b feature/feature_name   # new feature
git checkout -b fix/bug_description    # bug fix
```

### Committing and pushing

```bash
git add <specific files>              # never use git add -A blindly
git commit -m "type: brief description"
git push origin feature/feature_name
```

### Pull Requests

All code enters `main` through a PR — never push directly to `main`. Open the PR on GitHub and request a review from the Lead before merging.

### Branch cleanup (after PR is merged)

```bash
git branch -d feature/feature_name          # safe delete
git branch -D feature/feature_name          # force delete — ask Lead first
```

### Commit types

| Prefix | When to use |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `chore:` | Config, deps, tooling |
| `refactor:` | Code change with no behavior change |
| `docs:` | README, comments only |

---

## Friend-Gated Chat

The chat system is live end-to-end and persistent. A user can only join a chat when the `roomId` is an accepted `Friend` relationship ID that includes their authenticated account.

Socket auth uses the existing HTTP-only `auth_token` cookie. Real usernames are never sent through chat payloads; messages use anonymous display names and user IDs.

### How it works

| Layer | File | Responsibility |
|---|---|---|
| Server events | `src/features/chat_feature.js` | Authenticates sockets, checks accepted friendship, persists messages |
| Model | `src/models/ChatMessage.js` | MongoDB message history by friend relationship |
| Client hook | `src/hooks/useChat.js` | Socket.io connection, friend-room join, history state |
| UI component | `src/components/ChatRoom.jsx` | Message list, composer, own/other bubble detection |

### Socket events

| Direction | Event | Payload |
|---|---|---|
| Client → Server | `join_room` | `{ roomId: friendRelationshipId }` |
| Client → Server | `send_message` | `{ roomId: friendRelationshipId, message }` |
| Server → Client | `chat_history` | `{ roomId, currentUserId, messages }` |
| Server → Client | `receive_message` | `{ id, senderId, senderDisplayName, message, timestamp }` |
| Server → Client | `user_joined` | `{ roomId }` |
| Server → Client | `chat_error` | `{ error }` |

Message ownership is determined by comparing `msg.senderId` to `currentUserId` from `chat_history`.

### Persistence

| Data | Location |
|---|---|
| Message text | MongoDB `chatmessages` collection |
| Friend gate | Accepted `Friend` document |
| History loaded on join | Latest 100 messages, oldest first |

The server rechecks the accepted friendship before every send. If the friend relationship is removed or no longer accepted, the socket cannot send into that room.

### Using ChatRoom in a page

```jsx
import ChatRoom from '../components/ChatRoom';

// friend.id comes from GET /api/friends and must have status: "accepted"
<ChatRoom roomId={friend.id} displayName={session.displayName} />
```

Arbitrary chat rooms such as `general` or `sos` are rejected by the socket server unless they match an accepted friend relationship.

---

## AI Support Chat

Survivors can have a private conversation with a Claude-powered assistant that provides emotional support, safety planning, and local resource referrals (lawyers, shelters, therapists, hotlines).

### Env var required

```
CLAUDE_API_KEY=sk-ant-...
```

Add this to `.env` locally and to Railway environment variables in production. Get a key from the shared Anthropic workspace or create one at console.anthropic.com.

### API

| Method | Route | Description |
|---|---|---|
| POST | `/api/ai-chat` | Send conversation history, receive assistant reply |

**Request body:**
```json
{ "messages": [{ "role": "user", "content": "I need help finding a lawyer in Sacramento" }] }
```

**Response:**
```json
{ "message": "Here are some legal aid options in Sacramento...", "role": "assistant" }
```

### System prompt behavior

The assistant is instructed to:
- Be trauma-informed and non-judgmental
- Surface the National DV Hotline (`1-800-799-7233`) when immediate danger is mentioned
- Ask for city/state when suggesting local resources
- Never diagnose mental health conditions
- Keep responses concise (survivors may be reading quickly)

The system prompt is server-side only — never exposed to the client.

### Model

`claude-haiku-4-5-20251001` — fast and cost-efficient for a support chat context.

---

## Bookmarks

Survivors can save AI suggestions, resource links, and personal notes. Each bookmark can optionally have an image attachment.

### API routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/bookmarks` | Paginated list (`?page=&limit=&type=`) |
| POST | `/api/bookmarks` | Create bookmark (`{ content, title?, type?, tags? }`) |
| GET | `/api/bookmarks/:id` | Fetch single bookmark |
| PUT | `/api/bookmarks/:id` | Update title, content, tags |
| DELETE | `/api/bookmarks/:id` | Delete bookmark + image from GridFS |
| POST | `/api/bookmarks/from-chat` | Auto-create bookmark from an AI response (title auto-generated) |
| POST | `/api/bookmarks/image?bookmarkId=` | Upload image (images only, replaces previous) |
| GET | `/api/bookmarks/image/:fileId` | Serve image inline |
| DELETE | `/api/bookmarks/image/:fileId` | Remove image |

### Bookmark types

| Type | When to use |
|---|---|
| `ai_suggestion` | Saved from AI chat via `from-chat` endpoint |
| `resource` | A lawyer, shelter, hotline the user wants to remember |
| `note` | Freeform user note |

### Auto-bookmark from chat

`POST /api/bookmarks/from-chat` takes `{ content }` (the AI message text), auto-generates a title from the first sentence, sets type to `ai_suggestion`, and tags it `["chat"]`. Used by the chat UI's 📌 bookmark button.

---

## Speech to Text

⚠ **Not yet working** — hook is implemented (`src/hooks/useSpeechToText.js`) but `onresult` is not firing in testing. Needs further investigation (possible Chrome Web Speech API / network access issue). Do not block UI work on this.

### Hook API (when fixed)

```jsx
import { useSpeechToText } from '../hooks/useSpeechToText';

const { transcript, listening, supported, startListening, stopListening, clearTranscript } = useSpeechToText();
```

| Return | Type | Description |
|---|---|---|
| `transcript` | string | Accumulated text from current session |
| `listening` | boolean | True while mic is active |
| `supported` | boolean | False on Firefox / Safari — hide the button |
| `startListening()` | fn | Begin capture |
| `stopListening()` | fn | End capture |
| `clearTranscript()` | fn | Reset to `''` |

---

## Dev Test Page

`src/pages/dev-test.jsx` — **delete before shipping.**

Accessible at `/dev-test` (must be logged in). Tests AI chat with live voice input, bookmark CRUD with image upload, and standalone STT. Used during backend development before UI is designed.

---

## Geolocation

The geolocation feature is an opt-in foundation for future trusted-contact sharing. The app can request the survivor's current browser location, save the latest coordinates for their own account, and show live coordinates in the app for testing.

No friends/trusted-contact access exists yet. That sharing layer should be added later with explicit relationship and consent checks.

### API routes

All geolocation routes are protected by `requireAuth`, so requests require a valid HTTP-only auth cookie.

| Method | Route | Description |
|---|---|---|
| GET | `/api/geolocation` | Return the signed-in user's saved latest location, or `null` |
| POST | `/api/geolocation` | Upsert latest location from browser coordinates |
| DELETE | `/api/geolocation` | Clear the signed-in user's saved location |

### POST body

```json
{
  "latitude": 38.5449,
  "longitude": -121.7405,
  "accuracy": 25,
  "altitude": null,
  "altitudeAccuracy": null,
  "heading": null,
  "speed": null,
  "capturedAt": "2026-05-09T22:00:00.000Z"
}
```

Validation rules:
- `latitude` must be between `-90` and `90`.
- `longitude` must be between `-180` and `180`.
- `capturedAt` must be a valid date.
- Coordinates older than 5 minutes are rejected.
- Future timestamps more than 5 minutes ahead are rejected.

### Storage

| Data | Location |
|---|---|
| Latest location | MongoDB `userlocations` collection |
| User ownership | `userId` references the authenticated `User` |
| Coordinates | GeoJSON Point stored as `[longitude, latitude]` |
| Optional metadata | accuracy, altitude, altitudeAccuracy, heading, speed |

The model enforces one location document per user with a unique `userId`. Every save overwrites the previous location, so the app does not store a movement history.

### Client behavior

| Layer | File | Responsibility |
|---|---|---|
| Feature init | `src/features/geolocation_feature.js` | Logs readiness when enabled |
| API route | `src/pages/api/geolocation/index.js` | GET / POST / DELETE latest location |
| Model | `src/models/UserLocation.js` | Mongoose schema + GeoJSON index |
| Hook | `src/hooks/useGeolocation.js` | Uses `navigator.geolocation.watchPosition` |
| UI | `src/components/LocationCapture.jsx` | Live coordinates, stop live, clear |

The UI exposes a `Live coordinates` button. It starts `watchPosition`, displays latitude/longitude, and posts each browser-provided update to `/api/geolocation`.

There is no fixed update interval. Browsers send `watchPosition` updates when the device/location provider has a new reading. On laptops, updates may be infrequent; on phones, updates are more likely while moving.

### Privacy notes

- Browser location permission is required before coordinates are collected.
- The app does not load third-party map tiles for this feature.
- Only the latest location is stored.
- `DELETE /api/geolocation` clears the saved location.
- Friend/trusted-contact sharing is not implemented yet.

---

## Evidence Journal

Survivors can privately document experiences and attach proof-of-abuse media. All data is user-scoped — no entry or file is accessible by any other account.

### API routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/journal` | Paginated list of the user's entries (`?page=1&limit=20`) |
| POST | `/api/journal` | Create entry (`{ title?, content, incidentDate? }`) |
| GET | `/api/journal/:id` | Fetch a single entry |
| PUT | `/api/journal/:id` | Update text fields (`title`, `content`, `incidentDate`) |
| DELETE | `/api/journal/:id` | Delete entry and all its attachments from GridFS |
| POST | `/api/journal/attachment?entryId=` | Upload a file (multipart `file` field) |
| GET | `/api/journal/attachment/:fileId` | Stream the file to the client (force-download) |
| DELETE | `/api/journal/attachment/:fileId` | Remove a single attachment |

### Storage

| Data | Location |
|---|---|
| Entry text + metadata | MongoDB `journalentries` collection |
| Binary files | MongoDB GridFS `journal_attachments` bucket |

### File constraints

- **Max size:** 50 MB per file
- **Allowed types:** `image/*`, `video/*`, `audio/*`, `application/pdf`

### Privacy notes

- Attachment downloads use `Content-Disposition: attachment` to force a Save dialog rather than inline rendering, reducing browser history exposure.
- DELETE on an entry cascades through GridFS — no orphaned files left behind.
- All queries include `{ userId }` as a predicate; mismatched IDs return 404 (no data leakage).

---

## Cover Pages

The app supports three disguise cover pages through the shared `/app/[theme]` route. Each cover is selected by the `theme` URL param and keeps the protected app shell, PWA manifest, privacy hooks, panic exit, and login button behavior intact.

**Calculator Cover**
Route: `/app/calculator`

The calculator cover renders a functional basic calculator UI inside the authenticated app shell. It is built as a local React component and does not use external APIs or third-party services.

**News Cover**
Route: `/app/news`

The news cover renders a dark, mobile-friendly news reader UI. It uses live headline data from NewsAPI.ai through a protected server-side API route.

**Weather Cover**
Route: `/app/weather`

The weather cover renders a lightweight Weather Now screen. It provides a disguised weather landing page with an `Open forecast` link.

#MAIN PAGE 
# Safe Harbor — Technical Documentation

## Pages Overview

---

## 1. HOME PAGE (`src/pages/index.jsx`)

### Purpose
Marketing landing page that introduces Safe Harbor and its core features to new visitors.

### Route
- **URL**: `/`
- **Public**: Yes (no auth required)

### Components Used
- Custom SVG icons (ShieldIcon, GhostIcon, LockIcon, ChatIcon, ExitIcon, CloudIcon)
- Next.js `Head` for SEO
- Next.js `Link` for navigation

### Key Sections
1. **Header** — Brand logo + "Get Protected" CTA button
2. **Hero Section** — Headline, subheading, gradient text, primary CTA
3. **Ticker** — Animated feature highlights (infinite scroll)
4. **Feature Grid (Bento)** — 6-card layout showcasing:
   - The Shield (Disguise)
   - Zero Trace (Privacy)
   - Evidence (Vault)
   - Connect (Chat)
   - Panic Exit
   - Cloud (Sync)
5. **Mission Section** — Empathy-driven message
6. **Footer** — Links + emergency hotline disclaimer

### Styling
- **Module**: `src/styles/Marketing.module.css`
- **Design**: Minimalist, empathy-focused, warm earth tones
- **Responsive**: Mobile-first, uses `clamp()` for fluid typography

### State Management
- No client-side state (purely presentational)

### API Calls
- None

### Key Features
- ✅ Responsive hero with gradient text
- ✅ Ticker animation (seamless loop)
- ✅ Bento grid layout
- ✅ Accessibility: semantic HTML, ARIA labels
- ✅ SEO optimized with meta tags

### File Size
- Component: ~200 lines (includes custom icons)
- Styling: ~400 lines

### Future Enhancements
- Add testimonial carousel
- Integrate analytics for CTA clicks
- Implement A/B testing variants

---

## 2. LOGIN / REGISTER PAGE (`src/pages/login.jsx`)

### Purpose
Unified authentication page for user login and registration with duress password support.

### Route
- **URL**: `/login`
- **Public**: Yes (no auth required)
- **Query Params**: `?returnTo=` (safe redirect after login)

### Components Used
- `PanicExit` (hidden exit button overlay)
- React hooks (useState, useRouter)

### Features
1. **Dual Mode** — Toggle between "Login" and "Register"
2. **Standard Login** — Username + Password
3. **Duress Password** (optional) — Emergency account that logs in fake data
4. **Password Visibility Toggle** — Show/hide password
5. **Form Validation** — Client-side checks
6. **Error Handling** — User-friendly error messages
7. **Loading State** — Disabled submit during request
8. **Auto-signin** — Registers then immediately logs in

### Styling
- **Module**: `src/styles/Login.module.css`
- **Design**: Clean, minimal, matches brand
- **Focus States**: High contrast for accessibility

### State Management
```javascript
mode          // 'login' | 'register'
fields        // { username, password, duressPassword }
showPassword  // boolean
showDuress    // boolean
error         // error message string
notice        // success/info message
loading       // boolean (during API call)
```

### API Calls
- `POST /api/auth/register` — Create new account
- `POST /api/auth/login` — Authenticate user
- `GET /api/auth/logout` — Sign out

### Security Features
- ✅ Duress password (fake account for coercion)
- ✅ Safe return redirect (prevents open redirect)
- ✅ Credentials sent with `same-origin` policy
- ✅ Password never logged
- ✅ No password stored in state longer than necessary

### Key Functions
- `getSafeReturnTo()` — Validates redirect URL to prevent phishing
- `handleSubmit()` — Handles both register + login flows

### File Size
- Component: ~150 lines
- Styling: ~300 lines

### Future Enhancements
- Add OAuth (Google, Apple sign-in)
- Email-based recovery
- TOTP 2FA option
- Biometric login

---

## 3. DOWNLOADS PAGE (`src/pages/downloads.jsx`)

### Purpose
App selection page where users choose which cover app identity to install/use.

### Route
- **URL**: `/downloads`
- **Public**: Yes (no auth required)

### Components Used
- Next.js `Head`, `Link`
- APPS constant (configuration array)

### Features
1. **App Cards** — 3 selectable disguises:
   - Calculator Pro
   - Daily News Reader
   - Weather Now
2. **Each Card Shows**:
   - Icon (PNG from public folder)
   - Name
   - Description
   - Installation instructions
3. **Install Modal** — Steps for PWA installation (iOS vs Android)
4. **Installation Banner** — Persistent CTA

### Styling
- **Module**: `src/styles/Landing.module.css`
- **Design**: Card-based layout, hover effects
- **Responsive**: Grid adapts to mobile/tablet

### State Management
- Local: Modal visibility, selected app

### API Calls
- None (purely client-side navigation)

### Key Data Structure (APPS)
```javascript
{
  theme: 'calculator' | 'news' | 'weather',
  name: string,
  description: string,
  icon: string (path to PNG)
}
```

### Navigation Flow
- User selects app → Navigates to `/app/[theme]`
- Example: Selecting Calculator → `/app/calculator`

### File Size
- Component: ~100 lines
- Styling: ~200 lines

### Future Enhancements
- Add app ratings/reviews
- Show install progress indicator
- Custom installation per platform
- Add more cover apps

---

## 4. APP SHELL / PRIVATE MODE (`src/pages/app/[theme].jsx`)

### Purpose
Main application container that renders the chosen cover app or the hidden private mode shell.

### Route
- **URL**: `/app/[theme]`
- **Dynamic Param**: `[theme]` — calculator, news, or weather
- **Protected**: Yes (requires auth via `withAuth`)

### Components Used
- Cover components: `CalculatorCover`, `NewsCover`, `WeatherCover`
- `PrivateModeShell` — Main hidden interface
- `PanicExit` — Emergency exit button
- `Button` — SOS activation button
- `LocationCapture` — Geolocation opt-in
- `InstallModal` — PWA installation guidance
- Custom `ShieldIcon`

### Features
1. **Dynamic Theme Rendering**
   - Validates theme from URL
   - Returns 404 if invalid
2. **Cover Apps** — Fully functional disguises
3. **Private Mode Shell** — Hidden safe space (activated via SOS button)
4. **PWA Installation**
   - `beforeinstallprompt` event handling
   - Platform detection (iOS vs Android)
   - Install modal with instructions
5. **Install Banner** — Persistent bottom banner
6. **Geolocation Opt-in** — If enabled in config

### Styling
- **Module**: `src/styles/Landing.module.css`
- **Inline Styles**: Banners (for dynamic positioning)
- **Design**: Minimal, matches cover app theme

### State Management
```javascript
installPrompt      // beforeinstallprompt event
showModal          // Modal visibility
platform           // 'ios' | 'android' | 'other'
installed          // Boolean (PWA installed?)
showPrivateMode    // Boolean (hidden shell active?)
```

### Server-Side Props
```javascript
{
  themeKey: string,
  appName: string,
  manifestUrl: string,
  themeColor: string,
  appleTouchIcon: string,
  geolocationEnabled: boolean
}
```

### API Calls
- None (but depends on auth middleware)

### Key Functions
- `renderCover()` — Conditionally renders cover app
- `triggerNativeInstall()` — Prompts PWA install
- `withAuth()` — Server-side auth guard

### Security Features
- ✅ Auth required (blocks unauthenticated access)
- ✅ Safe redirects (no external links)
- ✅ Content Security Policy headers
- ✅ Robots metadata prevents indexing
- ✅ No-cache headers for auth routes

### File Size
- Component: ~286 lines
- Styling: ~200 lines

### THEMES Configuration
```javascript
calculator: {
  themeKey: 'calculator',
  appName: 'Calculator Pro',
  manifestUrl: '/manifests/calculator.json',
  themeColor: '#1a1a2e',
  appleTouchIcon: '/resources/images/logos/calculator_icon_192x192.png'
}
// ... news, weather variants
```

### Future Enhancements
- Add theme switching UI
- Implement app-specific settings
- Add offline mode detection
- Add crash recovery

---

## 5. JOURNAL PANEL (`src/components/JournalPanel.jsx`)

### Purpose
Evidence documentation interface with media, audio, and text entries.

### Integration
- Used within `PrivateModeShell` or as standalone component

### Features
1. **Three Upload Types**:
   - **Media** (Photo + Video combined) — "Photo or video"
   - **Audio** — "Record now"
   - **Text** (new) — "Write a note"
2. **Entry Management**:
   - Create entries
   - Display recent entries
   - Show entry type & timestamp
3. **Security Notice** — Encryption info banner
4. **Empty State** — Helpful message when no entries

### Styling
- **Module**: `src/styles/JournalPanel.module.css`
- **Design**: 3-column button grid, card-based entries
- **Responsive**: Mobile-optimized

### State Management
```javascript
entries        // Array of entry objects
loading        // Boolean (during upload)
showInput      // Boolean (text input expanded?)
text           // String (textarea content)
isSubmitting   // Boolean (text submit pending)
```

### API Calls
- `POST /api/journal` — Create journal entry
- `POST /api/journal/attachment?entryId=...` — Upload file attachment

### Entry Types
- `'media'` — Photo or video file
- `'audio'` — Audio recording
- `'text'` — Text note

### Key Components
- `UploadButton` — Media/Audio file input
- `TextButton` — Toggleable textarea with submit
- `EntryCard` — Displays saved entry with metadata

### File Size
- Component: ~238 lines
- Styling: ~297 lines

### Future Enhancements
- Add video preview thumbnails
- Implement audio playback
- Add full-text search
- Add entry tagging/categories
- Implement entry deletion with confirmation
- Add offline storage (IndexedDB)

---

## 6. COVER APPS

### CalculatorCover (`src/components/CalculatorCover.jsx`)

**Purpose**: Fully functional calculator that serves as visual disguise.

**Features**:
- Basic arithmetic (+ - × ÷)
- Percentage, negation, decimal support
- Error handling (division by zero)
- Display formatting

**State**:
- `display` — Current display value
- `previousValue` — Operand for operation
- `operation` — Current operator
- `waitingForOperand` — Input state flag

**Styling**: `src/styles/CalculatorCover.module.css`

---

### NewsCover (`src/components/NewsCover.jsx`)

**Purpose**: News reader interface.

**Features**:
- Fetch headlines from API
- Display article list
- Expandable article details

**State**:
- `headlines` — Array of news items
- `loading` — Fetch state

---

### WeatherCover (`src/components/WeatherCover.jsx`)

**Purpose**: Weather display interface.

**Features**:
- Fetch weather data
- Show current conditions + forecast
- Location detection

**State**:
- `weather` — Current weather data
- `forecast` — 5-day forecast
- `loading` — Fetch state

---

## PRIVATE MODE SHELL (`src/components/PrivateModeShell.jsx`)

### Purpose
Main hidden interface where users access real safety tools (journal, chat, bookmarks, etc.).

### Activation
- Triggered by SOS button click
- Requires correct PIN entry
- Panic exit available at all times

### Features
1. **Tabbed Navigation**:
   - Journal (evidence documentation)
   - Chat (peer support)
   - Bookmarks (resource collection)
   - AI Chat (support conversations)
   - Settings
2. **Security**:
   - PIN entry modal
   - Session timeout
   - Clear data on exit
3. **User Profile** — Display name in header

### Styling
- **Module**: `src/styles/PrivateModeShell.module.css`
- **Design**: Dark, minimal, professional
- **Layout**: Tab-based navigation

### State Management
- Active tab
- Session status
- User data

---

## DATA FLOW ARCHITECTURE

```
User visits `/` (Home)
    ↓
Click "Get Started Privately"
    ↓
Navigate to `/downloads` (Choose Disguise)
    ↓
Select app (e.g., Calculator)
    ↓
Navigate to `/login` (Auth)
    ↓
Register or Login
    ↓
Redirected to `/app/calculator`
    ↓
[Cover App Shown] — Full calculator UI
    ↓
Click SOS Button
    ↓
[Private Mode Activated] — Hidden Shell Shown
    ↓
PIN Entry Modal
    ↓
Access Journal, Chat, Bookmarks, etc.
    ↓
(Panic Exit) ← Returns to calculator instantly
```

---

## AUTHENTICATION FLOW

```
1. User fills login/register form
2. Submit → POST /api/auth/register or /api/auth/login
3. Server validates credentials
4. Server creates session (JWT or session cookie)
5. Client receives session token
6. Subsequent requests include auth middleware
7. Middleware validates token
8. If valid → access granted, else → redirect to /login
```

---

## SECURITY HEADERS

Applied via `next.config.js`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- `X-XSS-Protection: 1; mode=block`
- `Cache-Control: no-store, no-cache` (auth routes)

---

## CONFIGURATION

All feature flags in `src/config/config.js`:
- `enable_journal` — Enable journal feature
- `enable_geolocation` — Allow location storage
- `enable_ai_chat` — AI support chat
- `enable_bookmarks` — Resource bookmarks
- etc.

---

## ENVIRONMENT VARIABLES

```
MONGODB_URI        # MongoDB connection string
JWT_SECRET         # Session signing key
NODE_ENV           # production | development
PORT               # Server port (default 3000)
```

---

## DEPLOYMENT

### Build
```bash
npm run build
```

### Production Start
```bash
NODE_ENV=production npm start
```

### Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["npm", "start"]
```

---

## TESTING CHECKLIST

- [ ] Home page loads & links work
- [ ] Downloads page shows 3 apps
- [ ] Login/Register flow completes
- [ ] Calculator, News, Weather fully functional
- [ ] SOS button activates private mode
- [ ] Journal entries save & display
- [ ] Chat messages persist
- [ ] PWA installs on mobile
- [ ] Panic exit clears session
- [ ] Auth middleware blocks unauthenticated access

---

## PERFORMANCE METRICS

**Target Metrics**:
- Home page: <2s initial load
- App shell: <1s route navigation
- Journal upload: <3s for 5MB file
- Mobile Lighthouse: 90+ score

**Optimization**:
- Image optimization (next/image)
- Code splitting per route
- CSS module scoping
- Service Worker caching

---

## ACCESSIBILITY

- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation support
- ✅ Color contrast ratios ≥4.5:1
- ✅ Focus indicators visible
- ✅ Semantic HTML structure
- ✅ Alt text on images

---

## FUTURE ROADMAP

- [ ] Add more cover apps (Notes, Reminders, etc.)
- [ ] Implement encrypted cloud sync
- [ ] Add video evidence redaction
- [ ] Integration with hotlines/resources
- [ ] Offline-first sync
- [ ] Multi-device support
- [ ] Voice journal entries
- [ ] ML-powered safety recommendations

---

**Last Updated**: May 10, 2026
**Version**: 1.0.0
**Maintainer**: Safe Harbor Team

