import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { formatTimestamp, formatRelativeTimestamp } from './time.js';

// Dynamic connection to local validator based on current hostname
// For demo only. In production, use a reliable RPC and connection options.
const rpcUrl = `http://${window.location.hostname}:8899`;
export const connection = new Connection(rpcUrl, 'confirmed');

// Returns balance in lamports for a given public key
export async function getBalance(pubkey) {
  try {
    return await connection.getBalance(pubkey, { commitment: 'confirmed' });
  } catch (error) {
    throw new Error(`getBalance failed: ${error.message}`);
  }
}

// Requests an airdrop of SOLAmountSOL SOL to pubkey
export async function requestAirdrop(pubkey, solAmount = 1) {
  try {
    const sig = await connection.requestAirdrop(pubkey, solAmount * LAMPORTS_PER_SOL);
    await connection.confirmTransaction({ signature: sig, ...(await connection.getLatestBlockhash()) }, 'confirmed');
    return sig;
  } catch (error) {
    throw new Error(`requestAirdrop failed: ${error.message}`);
  }
}

// Transfers lamports from fromKeypair to toPubkey
export async function sendSol(fromKeypair, toPubkey, lamports) {
  try {
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    const tx = new Transaction({ recentBlockhash: blockhash, feePayer: fromKeypair.publicKey }).add(
      SystemProgram.transfer({ fromPubkey: fromKeypair.publicKey, toPubkey, lamports })
    );
    const sig = await sendAndConfirmTransaction(connection, tx, [fromKeypair], {
      commitment: 'confirmed',
      maxRetries: 3,
      minContextSlot: undefined,
    });
    return sig;
  } catch (error) {
    throw new Error(`sendSol failed: ${error.message}`);
  }
}

// Sends entire balance (minus fee) to null address 11111111111111111111111111111111
export async function transferAllToNull(fromKeypair) {
  try {
    const nullAddress = new PublicKey('11111111111111111111111111111111');
    const balance = await connection.getBalance(fromKeypair.publicKey);

    // Estimate fee with a 1-instruction transfer transaction
    const { blockhash } = await connection.getLatestBlockhash();
    const dummyTx = new Transaction({ recentBlockhash: blockhash, feePayer: fromKeypair.publicKey }).add(
      SystemProgram.transfer({ fromPubkey: fromKeypair.publicKey, toPubkey: nullAddress, lamports: 0 })
    );
    dummyTx.sign(fromKeypair);
    const fee = (await connection.getFeeForMessage(dummyTx.compileMessage(), { commitment: 'confirmed' })).value ?? 5000;

    const amount = Math.max(0, balance - fee);
    if (amount === 0) throw new Error('Nothing to clear');

    return await sendSol(fromKeypair, nullAddress, amount);
  } catch (error) {
    throw new Error(`transferAllToNull failed: ${error.message}`);
  }
}

// Returns last `limit` transaction signatures for given address
export async function getRecentTransactions(pubkey, limit = 10) {
  try {
    const sigInfos = await connection.getSignaturesForAddress(pubkey, { limit });
    return sigInfos.map((s) => s.signature);
  } catch (error) {
    throw new Error(`getRecentTransactions failed: ${error.message}`);
  }
}

function resolveBlockTimeSeconds(tx, sigInfo) {
  if (tx?.blockTime) return tx.blockTime;
  if (tx?.meta?.blockTime) return tx.meta.blockTime;
  if (sigInfo?.blockTime) return sigInfo.blockTime;
  return null;
}

// Returns a richer transaction view (date, amount if known, direction)
export async function getRecentTransactionsDetailed(pubkey, limit = 10) {
  try {
    const sigInfos = await connection.getSignaturesForAddress(pubkey, { limit });
    const signatures = sigInfos.map((s) => s.signature);
    const sigInfoMap = new Map(sigInfos.map((info) => [info.signature, info]));
    const results = [];
    for (const sig of signatures) {
      const tx = await connection.getTransaction(sig, { commitment: 'confirmed' });
      const sigInfo = sigInfoMap.get(sig);
      const blockTimeSeconds = resolveBlockTimeSeconds(tx, sigInfo);
      const timestampMs = blockTimeSeconds ? blockTimeSeconds * 1000 : Date.now();
      const date = formatTimestamp(timestampMs);
      let amount = '—';
      let type = 'Transfer';
      if (tx?.meta) {
        const pre = tx.meta.preBalances?.[0] ?? 0;
        const post = tx.meta.postBalances?.[0] ?? pre;
        const diff = post - pre; // lamports change for fee payer
        if (diff < 0) { type = 'Send'; amount = `${(-diff) / LAMPORTS_PER_SOL} SOL`; }
        if (diff > 0) { type = 'Receive'; amount = `${diff / LAMPORTS_PER_SOL} SOL`; }
      }
      results.push({ signature: sig, date, type, amount, status: tx?.meta?.err ? 'Failed' : 'Confirmed' });
    }
    return results;
  } catch (error) {
    return [];
  }
}

// Returns last 3 transactions formatted for dashboard widget
export async function getRecentTransactionsWidget(pubkey, limit = 3) {
  try {
    const sigInfos = await connection.getSignaturesForAddress(pubkey, { limit });
    if (!sigInfos || sigInfos.length === 0) return [];
    
    const results = [];
    for (const sigInfo of sigInfos) {
      const sig = sigInfo.signature;
      const tx = await connection.getTransaction(sig, { commitment: 'confirmed' });
      
      // Determine type and amount
      let type = 'Transfer';
      let amountSol = 0;
      let status = 'Pending';
      
      if (tx?.meta) {
        const pre = tx.meta.preBalances?.[0] ?? 0;
        const post = tx.meta.postBalances?.[0] ?? pre;
        const diff = post - pre;
        
        if (diff < 0) {
          type = 'Send';
          amountSol = (-diff) / LAMPORTS_PER_SOL;
        } else if (diff > 0) {
          type = 'Receive';
          amountSol = diff / LAMPORTS_PER_SOL;
        }
        
        status = tx.meta.err ? 'Failed' : 'Confirmed';
      } else {
        status = sigInfo.confirmationStatus === 'confirmed' ? 'Confirmed' : 'Pending';
      }
      
      // Calculate timestamps
      const blockTimeSeconds = resolveBlockTimeSeconds(tx, sigInfo);
      const timestampMs = blockTimeSeconds ? blockTimeSeconds * 1000 : Date.now();
      const relativeTime = formatRelativeTimestamp(timestampMs);
      const absoluteTime = formatTimestamp(timestampMs);
      
      // Short signature (first 4 + last 4 chars)
      const shortSig = sig.length > 8 ? `${sig.slice(0, 4)}...${sig.slice(-4)}` : sig;
      
      results.push({
        signature: sig,
        type,
        amountSol,
        status,
        relativeTime,
        absoluteTime,
        shortSig,
      });
    }
    
    return results;
  } catch (error) {
    console.error('getRecentTransactionsWidget failed:', error);
    return [];
  }
}


