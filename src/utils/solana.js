import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

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


