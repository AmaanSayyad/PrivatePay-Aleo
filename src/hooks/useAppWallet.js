/**
 * App wallet hook — Aleo (Leo Wallet) only.
 * Exposes { account, isConnected, connect, disconnect, requestTransaction, transactionStatus }
 * for use anywhere we previously used useAptos.
 */
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';

export function useAppWallet() {
  const {
    publicKey,
    connected,
    connect,
    disconnect,
    requestTransaction,
    transactionStatus,
    wallet,
  } = useWallet();

  return {
    account: publicKey?.toString() ?? null,
    isConnected: connected,
    connect: connect ? (() => connect()) : (async () => {}),
    disconnect: disconnect ? (() => disconnect()) : (async () => {}),
    requestTransaction,
    transactionStatus,
    wallet,
    publicKey,
  };
}
