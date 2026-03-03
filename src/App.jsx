import React, { useMemo, useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
  getBalance,
  getRecentTransactionsDetailed,
  getRecentTransactionsWidget,
  sendSol,
} from './utils/solana.js';
import { getActiveWallet, getActiveKeypair } from './utils/walletManager.js';
import { useRpc } from './providers.jsx';
import Sidebar from './components/Sidebar.jsx';
import WalletCard from './components/WalletCard.jsx';
import PriceCard from './components/PriceCard.jsx';
import CandleCard from './components/CandleCard.jsx';
import RecentTransactionsWidget from './components/RecentTransactionsWidget.jsx';
import TransactionTable from './components/TransactionTable.jsx';
import SendModal from './components/SendModal.jsx';
import ReceiveModal from './components/ReceiveModal.jsx';
import Settings from './components/Settings.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import BackupReminder from './components/BackupReminder.jsx';
import WalletSwitcher from './components/WalletSwitcher.jsx';

export default function App() {
  const { rpcUrl, setRpcUrl } = useRpc();
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction, connecting, disconnecting } = useWallet();

  const [active, setActive] = useState('dashboard');
  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [balance, setBalance] = useState(null);
  const [txRows, setTxRows] = useState([]);
  const [recentTxWidget, setRecentTxWidget] = useState([]);
  const [theme, setTheme] = useState('dark');
  const [walletRefreshKey, setWalletRefreshKey] = useState(0);
  const [walletMode, setWalletMode] = useState('internal');

  const activeWallet = useMemo(() => getActiveWallet(), [walletRefreshKey]);
  const keypair = useMemo(() => getActiveKeypair(), [walletRefreshKey]);

  const externalAddress = publicKey?.toBase58();
  const internalAddress = activeWallet?.publicKey || keypair?.publicKey?.toBase58();
  const usingExternalWallet = walletMode === 'external' && connected && !!publicKey;

  const effectivePublicKey = useMemo(() => {
    if (usingExternalWallet) return publicKey;
    return keypair?.publicKey || null;
  }, [usingExternalWallet, publicKey, keypair]);

  const address = usingExternalWallet ? externalAddress : internalAddress;

  const walletLabel = useMemo(() => {
    if (usingExternalWallet) return 'External Wallet';
    return activeWallet?.label;
  }, [usingExternalWallet, activeWallet]);

  async function refresh() {
    if (!effectivePublicKey) return;
    try {
      const lamports = await getBalance(effectivePublicKey);
      setBalance(lamports / LAMPORTS_PER_SOL);
      const rows = await getRecentTransactionsDetailed(effectivePublicKey, 10);
      setTxRows(rows);
      const widgetData = await getRecentTransactionsWidget(effectivePublicKey, 3);
      setRecentTxWidget(widgetData);
    } catch (e) {
      toast.error(e.message);
    }
  }

  useEffect(() => {
    if (effectivePublicKey) {
      refresh();
    } else {
      setBalance(null);
      setTxRows([]);
      setRecentTxWidget([]);
    }
  }, [walletRefreshKey, rpcUrl, walletMode, externalAddress, internalAddress]);

  useEffect(() => {
    const handleWalletChange = () => {
      setWalletRefreshKey((prev) => prev + 1);
    };

    window.addEventListener('walletChanged', handleWalletChange);
    return () => window.removeEventListener('walletChanged', handleWalletChange);
  }, []);

  useEffect(() => {
    if (!connected && walletMode === 'external') {
      setBalance(null);
      setTxRows([]);
      setRecentTxWidget([]);
    }
  }, [connected, walletMode]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('solana_wallet_theme') || 'dark';
    setTheme(savedTheme);
    document.body.className = `theme-${savedTheme}`;
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const bodyTheme = document.body.className.includes('theme-light') ? 'light' : 'dark';
      if (bodyTheme !== theme) {
        setTheme(bodyTheme);
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [theme]);

  async function handleSend({ to, amount }) {
    try {
      const lamports = Math.round(parseFloat(amount) * LAMPORTS_PER_SOL);
      if (!Number.isFinite(lamports) || lamports <= 0) {
        throw new Error('Enter a valid amount');
      }

      if (usingExternalWallet) {
        if (!publicKey || !sendTransaction) {
          toast.info('Connect an external wallet first');
          return;
        }

        const tx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey(to),
            lamports,
          })
        );

        const signature = await sendTransaction(tx, connection, {
          preflightCommitment: 'confirmed',
          skipPreflight: false,
        });

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
        await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');

        toast.success(`Sent: ${signature}`);
      } else {
        if (!keypair) {
          toast.info('Create or import an internal wallet first');
          return;
        }
        const sig = await sendSol(keypair, new PublicKey(to), lamports);
        toast.success(`Sent: ${sig}`);
      }

      await refresh();
      setSendOpen(false);
    } catch (e) {
      toast.error(e.message || 'Failed to send transaction');
    }
  }

  function handleCopy() {
    if (!address) return;
    navigator.clipboard.writeText(address);
    toast.success('Address copied');
  }

  function handleWalletChange() {
    setWalletRefreshKey((prev) => prev + 1);
  }

  function handleAddWallet() {
    setActive('settings');
  }

  function handleRpcChange(nextRpcUrl) {
    try {
      setRpcUrl(nextRpcUrl);
      if (address) {
        refresh();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to switch RPC endpoint');
    }
  }

  return (
    <div className="min-h-screen app-bg" style={{ color: 'var(--text-primary)' }}>
      <div className="flex">
        <Sidebar
          active={active}
          onChange={(k) => {
            if (k === 'send') setSendOpen(true);
            else if (k === 'receive') setReceiveOpen(true);
            else setActive(k);
          }}
        />
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
          <div className="flex items-start justify-between mb-2 gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 px-2 py-1">
                  <button
                    onClick={() => setWalletMode('internal')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      walletMode === 'internal' ? 'bg-emerald-600 text-white' : 'bg-transparent text-neutral-300'
                    }`}
                  >
                    Internal Wallet
                  </button>
                  <button
                    onClick={() => setWalletMode('external')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      walletMode === 'external' ? 'bg-cyan-600 text-white' : 'bg-transparent text-neutral-300'
                    }`}
                  >
                    External Wallet
                  </button>
                </div>

                {walletMode === 'internal' ? (
                  <WalletSwitcher onWalletChange={handleWalletChange} onAddWallet={handleAddWallet} />
                ) : (
                  <WalletMultiButton />
                )}

                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"></div>
                  <span>Connected to: {rpcUrl}</span>
                </div>
              </div>

              {walletMode === 'external' && (connecting || disconnecting) && (
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {connecting ? 'Connecting external wallet...' : 'Disconnecting external wallet...'}
                </div>
              )}
            </div>

            <ThemeToggle />
          </div>

          {active === 'dashboard' && (
            <>
              {walletMode === 'internal' && <BackupReminder address={address} onDownload={refresh} />}
              <WalletCard
                balanceSol={balance}
                address={address}
                walletLabel={walletLabel}
                onSend={() => setSendOpen(true)}
                onReceive={() => setReceiveOpen(true)}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <PriceCard />
                <CandleCard />
              </div>
              <RecentTransactionsWidget transactions={recentTxWidget} onRefresh={refresh} />
            </>
          )}

          {active === 'transactions' && <TransactionTable rows={txRows} />}

          {active === 'settings' && (
            <Settings
              address={address}
              rpcUrl={rpcUrl}
              onRpcChange={handleRpcChange}
              onWalletImported={handleWalletChange}
              activeWallet={activeWallet}
            />
          )}
        </main>
      </div>
      <SendModal open={sendOpen} onOpenChange={setSendOpen} onConfirm={handleSend} />
      <ReceiveModal
        open={receiveOpen}
        onOpenChange={setReceiveOpen}
        address={address}
        onCopy={handleCopy}
        secretKeyArray={walletMode === 'internal' ? activeWallet?.secretKey : null}
      />
      <ToastContainer position="top-right" autoClose={2500} theme={theme === 'light' ? 'light' : 'dark'} />
    </div>
  );
}
