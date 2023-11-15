import { usePublicKeyOrNull } from "@/hooks/usePublicKeyOrNull";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { MainForm } from "./MainForm";

const ReactUIWalletModalProviderDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletModalProvider,
  { ssr: false }
);

export const Desquadinator = () => {
  const wallets = useMemo(
    () => [new SolflareWalletAdapter(), new PhantomWalletAdapter()],
    []
  );

  return process.env.NEXT_PUBLIC_RPC_ENDPOINT ? (
    <ConnectionProvider endpoint={process.env.NEXT_PUBLIC_RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <ReactUIWalletModalProviderDynamic>
          <MainForm />
        </ReactUIWalletModalProviderDynamic>
      </WalletProvider>
    </ConnectionProvider>
  ) : (
    <div>NEXT_PUBLIC_RPC_ENDPOINT not configured</div>
  );
};
