

import { IExecutorParams } from "../executor/Executor";
import { useExecutor } from "../executor/useExecutor";
import { Connection } from "@solana/web3.js";
import { ReactNode, useCallback } from "react";
import { ITransactionTemplate } from "./ITransactionTemplate";
import React from "react";
import { Spinner } from "@/components/Spinner";

export interface GenericTransactionButtonProps<P> {
  params: P;
  beforeClick?: () => any;
  afterSign?: () => any;
  transactionGenerator: (
    { wallet, params }: IExecutorParams<P>,
    connection: Connection,
    cluster: string
  ) => Promise<{
    data?: ITransactionTemplate[];
    error?: any;
  }>;
  onSuccess?: (msg: string | undefined) => any;
  onError?: (msg: string | undefined) => any;
}


export const useGenericTransactionClick = <P extends unknown>({
  params,
  transactionGenerator,
  onSuccess,
  onError,
  beforeClick,
  afterSign
}: Omit<GenericTransactionButtonProps<P>, "formatting" | "text">) => {

  
  const { onClick, isExecuting: isExecuting } = useExecutor(
    transactionGenerator,
    
    params,
    "confirmed",
    (msg) => {
      onSuccess && onSuccess(msg);
    },
    (msg) => {
      onError && onError(msg);
    },
    undefined, 
    afterSign,
  );

  const wrappedClick = useCallback(async () => {
    beforeClick && (await beforeClick());
    await onClick();
  }, [beforeClick, onClick]);

  return { onClick: wrappedClick, isExecuting };
};

export const GenericTransactionButton = <P extends unknown>({
  params,
  text,
  transactionGenerator,
  onSuccess,
  onError,
  beforeClick,
  afterSign
}: GenericTransactionButtonProps<P> & { text: ReactNode }) => {

  const { onClick, isExecuting } = useGenericTransactionClick({
    params,
    beforeClick,
    transactionGenerator,
    onSuccess,
    onError,
    afterSign
  });
  
  return (
    <button
      disabled={isExecuting}
      onClick={onClick}
    >
      {isExecuting ? <Spinner /> : text}
    </button>
  );
};
