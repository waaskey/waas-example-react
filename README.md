# React embedded wallet

Email-OTP login → non-custodial MPC wallet created in the browser (the device party
runs in WASM) → wallet widget (assets / receive / send / activity).

```bash
cp .env.example .env.local   # fill in your key
pnpm start                   # vite dev server
```

The device share is sealed with AES-256-GCM into IndexedDB; the sealing secret here is
derived from the end-user session (use a passkey PRF for the strongest posture).
