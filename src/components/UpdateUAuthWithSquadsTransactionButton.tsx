import {
  Metaplex,
  irysStorage,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";
import {
  AccountMeta,
  Keypair,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";

const sha256 = require("js-sha256");

import { Connection, PublicKey } from "@solana/web3.js";

import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { toBufferLE } from "bigint-buffer";
import { toast } from "react-toastify";
import { LibreWallet } from "./LibreWallet";
import {
  GenericTransactionButton,
  GenericTransactionButtonProps,
  IExecutorParams,
  ITransactionTemplate,
} from "./executor/executor";
import { createUpdateMetadataPointerInstruction } from "@solana/spl-token";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import {
  UpdateMetadataAccountV2Struct,
  createUpdateMetadataAccountV2Instruction,
  updateMetadataAccountV2InstructionDiscriminator,
} from "./legacy/updateInstruction";

export interface IExecuteTrade {
  mintIds: PublicKey[];
  newUpdateAuthority: PublicKey;
  multisig: PublicKey;
}

export const METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
export const SQUADS_PROGRAM_ID = new PublicKey(
  "SMPLecH534NA9acpos4G6x7uf3LWbCAwZQE9e8ZekMu"
);

export const updateUAuth = async (
  { wallet, params }: IExecutorParams<IExecuteTrade>,
  connection: Connection
): Promise<{
  data?: ITransactionTemplate[];
  error?: any;
}> => {
  const data: ITransactionTemplate[] = [];

  const libreWallet = new LibreWallet(Keypair.generate());
  const provider = new AnchorProvider(connection, libreWallet, {});
  // the squads-mpl program on both mainnet and devnet have the same address
  const squadsProgram = await Program.at(SQUADS_PROGRAM_ID, provider);

  const { mintIds, newUpdateAuthority, multisig } = params;

  const metaplex = Metaplex.make(connection)
    .use(walletAdapterIdentity(wallet))
    .use(irysStorage());

  const authorityIndex = BigInt(1);
  const squadAuth = PublicKey.findProgramAddressSync(
    [
      Buffer.from("squad"),
      multisig.toBuffer(),
      toBufferLE(authorityIndex, 4),
      Buffer.from("authority"),
    ],
    SQUADS_PROGRAM_ID
  )[0];

  toast.info(`Authority index ${squadAuth.toBase58()}, idx: ${authorityIndex}`);

  const multisigAccount = await squadsProgram.account.ms.fetch(multisig);

  // get the next expected transactionIndex
  let transactionIndex = new BN((multisigAccount.transactionIndex as any) + 1);
  const blockhash = await connection.getLatestBlockhash();
  for (const mint of mintIds) {
    // get the transaction PDA
    const transaction = PublicKey.findProgramAddressSync(
      [
        Buffer.from("squad"),
        multisig.toBuffer(),
        toBufferLE(transactionIndex, 4),
        Buffer.from("transaction"),
      ],
      SQUADS_PROGRAM_ID
    )[0];

    // get the public key of the payer/creator
    const creator = wallet.publicKey;

    const createSquadsTxIx = await squadsProgram.methods
      .createTransaction(1) //using authorityIndex of 1
      .accounts({
        multisig, // the multisig PDA
        transaction, // the transaction PDA
        creator, // the creator/payer of the transaction acccount
      })
      .instruction();

    // data.push({

    //   description: `Create transaction`,
    //   signers: [],
    //   blockhash,
    // });

    console.log("asdasd");
    const nft = await metaplex.nfts().findByMint({
      mintAddress: mint,
    });

    // console.log("asdasd");

    // console.log("add instruction");

    const instructionIndex = new BN(1);
    const [instruction] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("squad"),
        transaction.toBuffer(),
        toBufferLE(instructionIndex, 1),
        Buffer.from("instruction"),
      ],
      squadsProgram.programId
    );

    // metaplex
    // .nfts()
    // .builders()
    // .update({
    //   nftOrSft: nft,
    //   name: 'THUG #1406a',
    //   // newUpdateAuthority,
    //   // authority: undefined,
    // }).setTransactionOptions({})

    // .getInstructions()[0]

    const [metadata] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    );

    const [master_edition] = PublicKey.findProgramAddressSync(
      [Buffer.from("edition"), METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      METADATA_PROGRAM_ID
    );
    console.log("added instruction");

    const args = {
      updateMetadataAccountArgsV2: {
        data: null,
        updateAuthority: newUpdateAuthority,
        primarySaleHappened: null,
        isMutable: null,
      },
    };
    const [instructionData] = UpdateMetadataAccountV2Struct.serialize({
      instructionDiscriminator: updateMetadataAccountV2InstructionDiscriminator,
      ...args,
    });

    data.push({
      instructions: [
        createSquadsTxIx,
        await squadsProgram.methods
          .addInstruction(
            createUpdateMetadataAccountV2Instruction(
              {
                metadata,
                updateAuthority: squadAuth,
              },
              {
                updateMetadataAccountArgsV2: {
                  data: null,
                  updateAuthority: newUpdateAuthority,
                  primarySaleHappened: null,
                  isMutable: null,
                },
              }
            )
            // new TransactionInstruction({
            //   keys: [
            //     {
            //       pubkey: squadAuth,
            //       isSigner: true,
            //       isWritable: true,
            //     },
            //     {
            //       pubkey: METADATA_PROGRAM_ID,
            //       isSigner: false,
            //       isWritable: false,
            //     },
            //     {
            //       pubkey: METADATA_PROGRAM_ID,
            //       isSigner: false,
            //       isWritable: false,
            //     },
            //     {
            //       pubkey: mint,
            //       isSigner: false,
            //       isWritable: false,
            //     },
            //     {
            //       pubkey: metadata,
            //       isSigner: false,
            //       isWritable: true,
            //     },
            //     {
            //       pubkey: master_edition,
            //       isSigner: false,
            //       isWritable: false,
            //     },
            //     {
            //       pubkey: squadAuth,
            //       isSigner: true,
            //       isWritable: true,
            //     },
            //     {
            //       pubkey: SystemProgram.programId,
            //       isSigner: false,
            //       isWritable: false,
            //     },
            //     {
            //       pubkey: SYSVAR_INSTRUCTIONS_PUBKEY,
            //       isSigner: false,
            //       isWritable: false,
            //     },
            //     {
            //       pubkey: new PublicKey(
            //         "auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg"
            //       ),
            //       isSigner: false,
            //       isWritable: false,
            //     },
            //     {
            //       pubkey: METADATA_PROGRAM_ID,
            //       isSigner: false,
            //       isWritable: false,
            //     },
            //   ],
            //   programId: METADATA_PROGRAM_ID,
            //   data: instructionData
            // })
          )
          .accounts({
            multisig,
            transaction,
            instruction,
            creator: wallet.publicKey,
          })
          .instruction(),
        await squadsProgram.methods
          .activateTransaction()
          .accounts({
            multisig,
            transaction,
            creator,
          })
          .instruction(),
      ],
      description: `Update uauth`,
      signers: [],
      blockhash,
    });
    transactionIndex++;
  }

  console.log({ data });

  return {
    data,
  };
};

export const UpdateUAuthWithSquadsTransactionButton = (
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
