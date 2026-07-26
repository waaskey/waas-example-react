import { useMemo, useState } from 'react';
import { WaasProvider, ConnectModal, WalletWidget, useCreateWallet, EncryptedShareStore, WasmMpcCore, loadClientWasm, generateRecoveryCode } from '@waaskey/react';
import type { EmbeddedSession, Wallet } from '@waaskey/react';

/**
 * Embedded wallet demo: email-OTP login (ConnectModal) → create a non-custodial MPC
 * wallet (the browser runs the device party in WASM) → render the wallet widget.
 *
 * The device-share sealing secret here is derived from the logged-in session — fine
 * for a demo. For the strongest posture derive it from a passkey PRF
 * (`PasskeyPrfSecretProvider`) — see the SDK README.
 */
function Demo({ email }: { email: string }) {
  const { create, error, isPending } = useCreateWallet();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);

  async function onCreate() {
    // Recovery material sealing the user_backup share — show the code to the user once.
    const code = generateRecoveryCode();
    const created = await create({ chain: 'ethereum' }, { backup: { recoveryCode: code, totpSecret: 'JBSWY3DPEHPK3PXP', email } });
    setRecoveryCode(code);
    setWallet(created);
  }

  return (
    <main style={{ maxWidth: 480, margin: '4rem auto', fontFamily: 'system-ui' }}>
      <h1>Waaskey embedded wallet</h1>
      {wallet ? (
        <>
          {recoveryCode ? (
            <p>
              Recovery code (shown once — store it safely): <code>{recoveryCode}</code>
            </p>
          ) : null}
          <WalletWidget walletId={wallet.id} chains={['ethereum']} />
        </>
      ) : (
        <>
          <button onClick={onCreate} disabled={isPending}>
            {isPending ? 'Running the MPC ceremony…' : 'Create wallet'}
          </button>
          {error ? <p role="alert">{error.message}</p> : null}
        </>
      )}
    </main>
  );
}

export default function App() {
  const [session, setSession] = useState<EmbeddedSession | null>(null);
  const [open, setOpen] = useState(true);

  const options = useMemo(() => {
    const base = {
      apiKey: import.meta.env.VITE_WAASKEY_API_KEY as string,
      baseUrl: import.meta.env.VITE_WAASKEY_BASE_URL as string | undefined,
    };
    if (!session) return base;
    // Once logged in, wire the MPC core + a share store sealed with a session-derived secret.
    return {
      ...base,
      mpc: new WasmMpcCore(loadClientWasm),
      shareStore: EncryptedShareStore.browser(`${session.token.slice(0, 32)}:demo-pad`),
    };
  }, [session]);

  return (
    <WaasProvider options={options}>
      {session ? (
        <Demo email={session.endUser.email ?? 'demo@example.com'} />
      ) : (
        <ConnectModal
          open={open}
          onClose={() => setOpen(false)}
          onConnect={(s) => {
            setSession(s);
            setOpen(false);
          }}
        />
      )}
    </WaasProvider>
  );
}
