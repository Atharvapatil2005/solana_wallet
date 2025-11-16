import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Download } from 'lucide-react';
import { hasBackupDownloaded, setBackupDownloaded } from '../utils/walletStorage.js';

const LOCAL_STORAGE_KEY = 'solana_wallet_secret';

export default function BackupReminder({ address, onDownload }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!address) {
      setIsVisible(false);
      setIsDismissed(false);
      return;
    }

    // Reset dismissal state when address changes
    setIsDismissed(false);

    // Check if dismissed for this session
    const sessionKey = `backup_reminder_dismissed_${address}`;
    const sessionDismissed = sessionStorage.getItem(sessionKey);
    
    if (sessionDismissed === 'true') {
      setIsDismissed(true);
      setIsVisible(false);
      return;
    }

    // Check if backup has been downloaded
    const backupDownloaded = hasBackupDownloaded(address);
    
    setIsVisible(!backupDownloaded);
  }, [address]);

  const handleDismiss = () => {
    if (!address) return;
    const sessionKey = `backup_reminder_dismissed_${address}`;
    sessionStorage.setItem(sessionKey, 'true');
    setIsDismissed(true);
    setIsVisible(false);
  };

  const handleDownload = () => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) {
      console.warn('No wallet found in localStorage');
      return;
    }

    try {
      // Download the wallet.json file
      const blob = new Blob([JSON.stringify(JSON.parse(saved), null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wallet.json';
      a.click();
      URL.revokeObjectURL(url);

      // Mark backup as downloaded
      if (address) {
        setBackupDownloaded(address);
        
        // Re-check visibility after setting flag
        setIsVisible(false);
      }

      // Call the optional callback
      onDownload?.();
    } catch (error) {
      console.error('Failed to download wallet backup:', error);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative rounded-2xl p-4 mb-6 border overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(202, 138, 4, 0.1) 100%)',
            borderColor: 'rgba(234, 179, 8, 0.3)',
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <AlertTriangle 
                size={20} 
                className="text-yellow-500"
                style={{ filter: 'drop-shadow(0 0 4px rgba(234, 179, 8, 0.4))' }}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Remember to download your wallet.json backup.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-sm font-semibold text-white shadow-lg hover:shadow-yellow-500/25 transition-all duration-200"
              >
                <Download size={16} />
                Download Backup
              </button>
              
              <button
                onClick={handleDismiss}
                className="p-2 rounded-xl hover:bg-black/10 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="Dismiss"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

