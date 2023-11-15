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
import { useCallback, useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import {
  MultiMintSelector,
  useMultiMintSelectorState,
} from "../MultiMintSelector";
import { UpdateUAuthTransactionButton } from "../UpdateUAuthTransactionButton";
import { UpdateUAuthWithSquadsTransactionButton } from "../UpdateUAuthWithSquadsTransactionButton";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export const MainForm = () => {
  const [targetWallet, setTargetWallet] = useState<string>("");
  const [multisig, setMultisig] = useState<string>("Czbae1anvuJYCtrEgpTFVQu1eqhcQF37XdRQ8p54UVAL");

  const { publicKey } = useWallet();

  const newUpdateAuthority = usePublicKeyOrNull(targetWallet);

  const multisigPublicKey = usePublicKeyOrNull(multisig);

  useEffect(() => setTargetWallet(publicKey?.toBase58() ?? ""), [publicKey]);

  const state = useMultiMintSelectorState();

  const { mintIds } = state;
  return (
    <div className="flex flex-col gap-2 z-auto">
      <WalletMultiButtonDynamic />
      <h1 className="text-xl font-bold">Bulk Update Uauth</h1>
      <div className="fontsize-2xl p-2">Input hashlist of mints below:</div>

      <div>New update auth</div>
      <input
        placeholder="target wallet"
        value={targetWallet}
        onChange={(e) => setTargetWallet(e.currentTarget.value)}
      ></input>

      <div>multisig</div>
      <input
        placeholder="multisig"
        value={multisig}
        onChange={(e) => setMultisig(e.currentTarget.value)}
      ></input>
      <MultiMintSelector {...state} />
      {newUpdateAuthority && multisigPublicKey && (
        <UpdateUAuthWithSquadsTransactionButton
          params={{
            mintIds,
            newUpdateAuthority,
            multisig: multisigPublicKey,
          }}
        />
      )}
    </div>
  );
};
