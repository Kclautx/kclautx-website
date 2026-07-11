# Referral deep links — setup & handoff

Shareable referral links look like:

    https://kclautx.com/r/K-7F3KQ9A2

- **App installed** → OS opens the KclautX app directly (Universal Links / App
  Links), app pre-fills the code at signup.
- **App not installed** → browser shows `referral.html` (branded page: code +
  copy button) and routes the user to the right store. On Android the Play
  Store URL carries `&referrer=code%3DK-XXX`, so the code survives the install
  (Install Referrer API). On iOS the user copies the code first (no native
  equivalent), then pastes at signup.

## 1. nginx (website server) — required

Add inside the `kclautx.com` 443 server block, next to the existing static
config:

```nginx
# Referral deep links: /r/<code> serves the landing page (JS reads the code
# from the path).
location ^~ /r/ {
    try_files /referral.html =404;
}

# Apple requires this file served as JSON with NO extension.
location = /.well-known/apple-app-site-association {
    default_type application/json;
}
# assetlinks.json already ends in .json — no special handling needed.
```

Then `sudo nginx -t && sudo systemctl reload nginx`.

Verify:
- https://kclautx.com/r/K-TEST1234 → landing page showing "K-TEST1234"
- https://kclautx.com/.well-known/apple-app-site-association → raw JSON,
  `content-type: application/json`
- https://kclautx.com/.well-known/assetlinks.json → raw JSON

## 2. Mobile team — required before links open the app

### Fill in the placeholders (this repo)
- `.well-known/apple-app-site-association` → replace `REPLACE_TEAMID` with the
  Apple **Team ID** (bundle id assumed `com.kclautx.app` — fix if different).
- `.well-known/assetlinks.json` → replace the SHA-256 placeholder with the
  **release signing key fingerprint**
  (`keytool -list -v -keystore release.keystore` → SHA256, or from Play Console
  → App integrity if using Play App Signing — use the *App signing* cert).
- `referral.html` CONFIG block → set `APP_STORE_URL`, confirm
  `ANDROID_PACKAGE`, flip `STORES_LIVE = true` once the app is live on both
  stores (until then the page routes to /app/).

### In the app
- **iOS**: add Associated Domains entitlement `applinks:kclautx.com`; handle
  incoming URLs matching `/r/<code>` → stash the code → pre-fill the signup
  "referral code" (`referee`) field. First-launch: offer "Paste referral code"
  (reads clipboard; iOS shows a paste prompt).
- **Android**: intent filter for `https://kclautx.com/r/*` with
  `android:autoVerify="true"`; handle the URL the same way. Implement the
  **Play Install Referrer** library — on first launch read the referrer string
  (`code=K-XXX`) and pre-fill signup automatically.
- Signup submits the code as the existing `referee` field on
  `POST /user/register` — no backend change needed.

## 3. Sharing from the app (referrer side)

Share text should use the link form so it deep-links:

    Join me on KclautX! Sign up with my code K-7F3KQ9A2 → https://kclautx.com/r/K-7F3KQ9A2

The user's own code comes from `GET /user/get-user-data` → `data.referal_code`.

## Testing checklist
1. Link on a phone **without** the app → landing page → correct store.
2. Android fresh install via the referral Play link → code auto-fills at signup.
3. Link on a phone **with** the app → app opens directly with the code
   (verify AASA/assetlinks are valid first: Apple CDN caches AASA for ~hours;
   Android: `adb shell pm verify-app-links --re-verify com.kclautx.app`).
4. Desktop → landing page shows both store buttons.
