import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Plus, Pencil, Download, Trash2, Check } from 'lucide-react';
import { getWallets, getActiveWallet, setActiveWallet, removeWallet, exportWallet, updateWallet } from '../utils/walletManager.js';
import RenameWalletModal from './RenameWalletModal.jsx';
import DeleteWalletModal from './DeleteWalletModal.jsx';

export default function WalletSwitcher({ onWalletChange, onAddWallet }) {
  const [isOpen, setIsOpen] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [activeWallet, setActiveWalletState] = useState(null);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const dropdownRef = useRef(null);

  // Load wallets and active wallet
  useEffect(() => {
    loadWallets();
    
    // Listen for storage changes to update when wallets change
    const handleStorageChange = () => {
      loadWallets();
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom wallet change events
    window.addEventListener('walletChanged', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('walletChanged', handleStorageChange);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  function loadWallets() {
    const allWallets = getWallets();
    const active = getActiveWallet();
    setWallets(allWallets);
    setActiveWalletState(active);
  }

  function handleSwitchWallet(walletId) {
    setActiveWallet(walletId);
    loadWallets();
    setIsOpen(false);
    onWalletChange?.();
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('walletChanged'));
  }

  function handleRename(wallet) {
    setSelectedWallet(wallet);
    setRenameModalOpen(true);
  }

  function handleDelete(wallet) {
    setSelectedWallet(wallet);
    setDeleteModalOpen(true);
  }

  async function handleExport(wallet) {
    try {
      await exportWallet(wallet.id);
      loadWallets(); // Refresh to update backupDownloaded flag
    } catch (error) {
      console.error('Export failed:', error);
    }
  }

  function handleRenameComplete() {
    setRenameModalOpen(false);
    setSelectedWallet(null);
    loadWallets();
    onWalletChange?.();
  }

  function handleDeleteComplete(wasActive, nextWallet) {
    setDeleteModalOpen(false);
    setSelectedWallet(null);
    loadWallets();
    
    if (wasActive) {
      onWalletChange?.();
      window.dispatchEvent(new CustomEvent('walletChanged'));
    }
  }

  // Shorten public key for display
  function shortenAddress(address) {
    if (!address) return '';
    if (address.length <= 8) return address;
    return `${address.slice(0, 4)}…${address.slice(-4)}`;
  }

  if (!activeWallet) {
    // No wallet, show add button
    return (
      <button
        onClick={() => {
          setIsOpen(false);
          onAddWallet?.();
        }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-white/10 transition-all duration-200"
        style={{ color: 'var(--text-secondary)' }}
      >
        <Plus size={18} />
        <span className="text-sm font-medium">Add Wallet</span>
      </button>
    );
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-white/10 transition-all duration-200 group"
          style={{ 
            color: 'var(--text-primary)',
            border: isOpen ? '1px solid var(--border-color)' : '1px solid transparent'
          }}
        >
          <Wallet size={18} />
          <div className="text-left">
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {activeWallet.label || 'Wallet'}
            </div>
            <div className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
              {shortenAddress(activeWallet.publicKey)}
            </div>
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
                style={{ background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(4px)' }}
              />

              {/* Dropdown */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute top-full left-0 mt-2 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden"
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="p-4">
                  <div className="text-xs font-semibold mb-3 px-2" style={{ color: 'var(--text-tertiary)' }}>
                    WALLETS ({wallets.length})
                  </div>

                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {wallets.map((wallet) => {
                      const isActive = wallet.id === activeWallet?.id;
                      
                      return (
                        <motion.div
                          key={wallet.id}
                          whileHover={{ scale: 1.01 }}
                          className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                            isActive 
                              ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20' 
                              : 'hover:bg-white/5'
                          }`}
                          style={{
                            border: isActive ? '1px solid var(--accent-emerald)' : '1px solid transparent',
                            boxShadow: isActive ? '0 0 20px rgba(34, 197, 94, 0.2)' : 'none'
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div 
                              className="flex-1 min-w-0 cursor-pointer"
                              onClick={() => !isActive && handleSwitchWallet(wallet.id)}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                {isActive && (
                                  <Check size={14} className="text-emerald-400" />
                                )}
                                <span 
                                  className="text-sm font-medium truncate"
                                  style={{ color: isActive ? 'var(--accent-emerald)' : 'var(--text-primary)' }}
                                >
                                  {wallet.label || 'Unnamed Wallet'}
                                </span>
                              </div>
                              <div 
                                className="text-xs font-mono"
                                style={{ color: 'var(--text-tertiary)' }}
                              >
                                {shortenAddress(wallet.publicKey)}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRename(wallet);
                                }}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                style={{ color: 'var(--text-secondary)' }}
                                title="Rename"
                              >
                                <Pencil size={14} />
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExport(wallet);
                                }}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                style={{ color: 'var(--text-secondary)' }}
                                title="Export"
                              >
                                <Download size={14} />
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(wallet);
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                                style={{ color: 'var(--text-secondary)' }}
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onAddWallet?.();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-sm font-semibold text-white transition-all duration-200"
                    >
                      <Plus size={16} />
                      Add New Wallet
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      {selectedWallet && (
        <>
          <RenameWalletModal
            open={renameModalOpen}
            onOpenChange={setRenameModalOpen}
            wallet={selectedWallet}
            onComplete={handleRenameComplete}
          />
          <DeleteWalletModal
            open={deleteModalOpen}
            onOpenChange={setDeleteModalOpen}
            wallet={selectedWallet}
            activeWalletId={activeWallet?.id}
            onComplete={handleDeleteComplete}
          />
        </>
      )}
    </>
  );
}

