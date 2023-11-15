import {
  Metaplex,
  irysStorage,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";
import { TransactionInstruction } from "@solana/web3.js";

import { Connection, PublicKey } from "@solana/web3.js";

import { toast } from "react-toastify";
import {
  GenericTransactionButton,
  GenericTransactionButtonProps,
  IExecutorParams,
  ITransactionTemplate,
} from "./executor/executor";

export interface IExecuteTrade {
  mintIds: PublicKey[];
  newUpdateAuthority: PublicKey;
}

export const updateUAuth = async (
  { wallet, params }: IExecutorParams<IExecuteTrade>,
  connection: Connection
): Promise<{
  data?: ITransactionTemplate[];
  error?: any;
}> => {
  const data: ITransactionTemplate[] = [];



  const { mintIds, newUpdateAuthority } = params;

  const metaplex = Metaplex.make(connection)
    .use(walletAdapterIdentity(wallet))
    .use(irysStorage());

  for (const mint of mintIds) {
    const instructions: TransactionInstruction[] = [];

    console.log('asdasd');
    const nft = await metaplex.nfts().findByMint({
      mintAddress: mint,
    });
    
    console.log('asdasd');
    const blockhash = await connection.getLatestBlockhash();

    console.log('add instruction');
    instructions.push(
      ...(
        await metaplex.nfts().builders().update({
          nftOrSft: nft,
          newUpdateAuthority,
        })
      ).getInstructions()
    );

    console.log('added instruction');
    data.push({
      instructions,
      description: `Update uauth`,
      signers: [],
      blockhash,
    });
  }

  console.log({ data });

  return {
    data,
  };
};

export const UpdateUAuthTransactionButton = (
  props: Omit<
    GenericTransactionButtonProps<IExecuteTrade>,
    "transactionGenerator"
  >
) => {
  return (
    <GenericTransactionButton<IExecuteTrade>
      text={`Update (${props.params.mintIds.length} mint)`}
      transactionGenerator={updateUAuth}
      onError={(msg) => toast.error(msg ?? "Unknown error")}
      {...props}
    />
  );
};
