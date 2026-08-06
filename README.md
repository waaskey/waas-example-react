# React embedded wallet

Email-OTP login → non-custodial MPC wallet created in the browser (the device party
runs in WASM) → wallet widget (assets / receive / send / activity).

```bash
cp .env.example .env.local   # fill in your API key AND your deployment's API URL
pnpm start                   # vite dev server
```

`VITE_WAASKEY_BASE_URL` is required: the SDK's built-in default does not resolve and there
is no public sandbox, so point it at your own WAASKey deployment (including the `/api`
prefix).

The device share is sealed with AES-256-GCM into IndexedDB; the sealing secret here is
derived from the end-user session (use a passkey PRF for the strongest posture).
