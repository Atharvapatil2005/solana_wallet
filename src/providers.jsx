import React, { createContext, useContext, useMemo, useState } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useStandardWalletAdapters } from '@solana/wallet-standard-wallet-adapter-react';
import { toast } from 'react-toastify';
import { getRpcEndpoint, setRpcEndpoint } from './utils/solana.js';

const RpcContext = createContext({
  rpcUrl: '',
  setRpcUrl: () => {},
});

export function useRpc() {
  return useContext(RpcContext);
}

export function AppProviders({ children }) {
  const [rpcUrl, setRpcUrlState] = useState(() => getRpcEndpoint());

  const baseWallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );
  const wallets = useStandardWalletAdapters(baseWallets);

  const setRpcUrl = (nextRpcUrl) => {
    const updatedRpcUrl = setRpcEndpoint(nextRpcUrl);
    setRpcUrlState(updatedRpcUrl);
    return updatedRpcUrl;
  };

  const rpcContextValue = useMemo(
    () => ({
      rpcUrl,
      setRpcUrl,
    }),
    [rpcUrl]
  );

  return (
    <RpcContext.Provider value={rpcContextValue}>
      <ConnectionProvider endpoint={rpcUrl}>
        <WalletProvider
          wallets={wallets}
          autoConnect
          onError={(error) => {
            toast.error(error?.message || 'Wallet connection failed');
          }}
        >
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </RpcContext.Provider>
  );
}
