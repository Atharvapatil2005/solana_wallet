import React, { useMemo, useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { getBalance, getRecentTransactionsDetailed, getRecentTransactionsWidget, sendSol } from './utils/solana.js';
import Sidebar from './components/Sidebar.jsx';
import BalanceCard from './components/BalanceCard.jsx';
import Dashboard from './components/Dashboard.jsx';
import PriceCard from './components/PriceCard.jsx';
import CandleCard from './components/CandleCard.jsx';
import RecentTransactionsWidget from './components/RecentTransactionsWidget.jsx';
import TransactionTable from './components/TransactionTable.jsx';
import SendModal from './components/SendModal.jsx';
import ReceiveModal from './components/ReceiveModal.jsx';
import Settings from './components/Settings.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import BackupReminder from './components/BackupReminder.jsx';
import { clearBackupFlag } from './utils/walletStorage.js';

const LOCAL_STORAGE_KEY = 'solana_wallet_secret';

export default function App() {
  const rpcUrl = `http://${window.location.hostname}:8899`;
  const [active, setActive] = useState('dashboard');
  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [balance, setBalance] = useState(null);
  const [txRows, setTxRows] = useState([]);
  const [recentTxWidget, setRecentTxWidget] = useState([]);
  const [theme, setTheme] = useState('dark');

  const keypair = useMemo(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) return null;
    try { return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(saved))); } catch (_) { return null; }
  }, []);

  const address = keypair?.publicKey?.toBase58();

  async function refresh() {
    if (!keypair) return;
    try {
      const lamports = await getBalance(keypair.publicKey);
      setBalance(lamports / LAMPORTS_PER_SOL);
      const rows = await getRecentTransactionsDetailed(keypair.publicKey, 10);
      setTxRows(rows);
      const widgetData = await getRecentTransactionsWidget(keypair.publicKey, 3);
      setRecentTxWidget(widgetData);
    } catch (e) {
      toast.error(e.message);
    }
  }

  useEffect(() => { refresh(); }, [address]);

  // Load theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('solana_wallet_theme') || 'dark';
    setTheme(savedTheme);
    document.body.className = `theme-${savedTheme}`;
  }, []);

  // Watch for theme changes
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
    if (!keypair) return toast.info('Create or import a wallet first');
    try {
      const lamports = Math.round(parseFloat(amount) * LAMPORTS_PER_SOL);
      const sig = await sendSol(keypair, new PublicKey(to), lamports);
      toast.success(`Sent: ${sig}`);
      await refresh();
      setSendOpen(false);
    } catch (e) { toast.error(e.message); }
  }

  function handleCopy() {
    if (!address) return;
    navigator.clipboard.writeText(address);
    toast.success('Address copied');
  }

  function clearLocal() {
    // Clear backup flag before removing wallet
    if (address) {
      clearBackupFlag(address);
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    window.location.reload();
  }

  return (
    <div className="min-h-screen app-bg" style={{ 
      color: 'var(--text-primary)'
    }}>
      <div className="flex">
        <Sidebar active={active} onChange={(k) => {
          if (k === 'send') setSendOpen(true);
          else if (k === 'receive') setReceiveOpen(true);
          else setActive(k);
        }} />
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"></div>
              <span>Connected to: {rpcUrl}</span>
            </div>
            <ThemeToggle />
          </div>

          {active === 'dashboard' && (
            <>
              <BackupReminder address={address} onDownload={refresh} />
              <BalanceCard balanceSol={balance} onSend={() => setSendOpen(true)} onReceive={() => setReceiveOpen(true)} />
              <div className="grid md:grid-cols-2 gap-6">
                <PriceCard />
                <CandleCard />
              </div>
              <RecentTransactionsWidget transactions={recentTxWidget} onRefresh={refresh} />
            </>
          )}

          {active === 'transactions' && (
            <TransactionTable rows={txRows} />
          )}

          {active === 'settings' && (
            <Settings address={address} rpcUrl={rpcUrl} onClearLocal={clearLocal} onWalletImported={refresh} />
          )}
        </main>
      </div>
      <SendModal open={sendOpen} onOpenChange={setSendOpen} onConfirm={handleSend} />
      <ReceiveModal open={receiveOpen} onOpenChange={setReceiveOpen} address={address} onCopy={handleCopy} />
      <ToastContainer 
        position="top-right" 
        autoClose={2500} 
        theme={theme === 'light' ? 'light' : 'dark'} 
      />
    </div>
  );
}


