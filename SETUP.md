# NarxTop — setup guide

## 1. Install and run

```bash
npm install
cp .env.example .env.local     # then fill in your own keys
npm run server                 # terminal 1 → API + MongoDB (port 5000)
npm run dev                    # terminal 2 → website (http://127.0.0.1:5173)
```

Open the site at **http://127.0.0.1:5173** (the Vite config binds to 127.0.0.1).
The website also works if the API server is off — it then uses the texts
bundled in `shared/translations.js`.

## 2. Supabase — fixes the "error page" after confirming your email

The confirm button in the email is handled by **Supabase**, not by your code.
If the address it redirects to is not on Supabase's allow-list, you get an error page.

Supabase Dashboard → **Authentication → URL Configuration**

| Field | Value |
|-------|-------|
| Site URL | `http://127.0.0.1:5173` (later: your real domain) |
| Redirect URLs | `http://127.0.0.1:5173/**`  ·  `http://localhost:5173/**`  ·  `https://YOUR-DOMAIN/**` |

Also check **Authentication → Email Templates → Confirm signup**: the button link must
use `{{ .ConfirmationURL }}`.

The app sends users to `/auth/confirm`, which shows "Email confirmed", counts down
5 seconds and closes itself. If the browser refuses to close the tab
(browsers only allow `window.close()` on tabs opened by a script), the page goes to the
website instead. Opening `/auth/confirm` again later shows "already confirmed" and
redirects to the home page.

Supabase's built-in email sender is rate-limited (a few emails per hour). For real
traffic add your own SMTP server: **Project Settings → Authentication → SMTP**.

## 3. Google sign-in (needs YOUR Google credentials)

1. Google Cloud Console → **APIs & Services → OAuth consent screen** → configure the app.
2. **Credentials → Create credentials → OAuth client ID → Web application**.
   - Authorized redirect URI: `https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback`
3. Supabase → **Authentication → Providers → Google** → enable, paste the
   **Client ID** and **Client Secret**, save.
4. Make sure the Redirect URLs from step 2 are set (Google returns to `/`).

The code is already in place (`signInWithGoogle` in `src/context/AuthContext.jsx`) —
the button works as soon as the provider is enabled.

## 4. Languages in MongoDB

On start, `server/index.js` copies every text from `shared/translations.js` into the
`translations` collection (one document per language: `uz`, `ru`). The website loads
them from `GET /api/translations/:lang`. To change a text without redeploying, edit it
in MongoDB (keys use `|` instead of `.`, e.g. `nav|home`) — note that the next server
start re-seeds keys that exist in `shared/translations.js`, so edit that file too for
permanent changes.

## 5. Notes

- Guests (not signed in) see a "register to continue" card instead of products,
  product pages, cart and search.
- Cart is saved per user in the browser (`localStorage`).
- The old Mongo-based login (`MongoAuthContext`, `server/auth.js`) was removed: it was
  never connected (`server/auth.js` was a copy of `index.js`). Supabase handles all auth.
