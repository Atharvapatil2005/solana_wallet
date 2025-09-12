# Solana Wallet

A simple educational Solana wallet web app for local development. Not production-ready.

## Tech Stack
- Vite + React
- Tailwind CSS
- @solana/web3.js
- react-toastify
- Node.js 18+

## Features (MVP)
- Connects to localnet at http://127.0.0.1:8899
- Create/Download wallet (Keypair -> wallet.json) and store in localStorage (temporary)
- Import wallet from `wallet.json` or secret key array
- Show wallet address and balance
- Airdrop 1 SOL
- Send SOL (recipient + amount)
- Recent transactions (last 10 signatures)
- Clear balance (send all to null address `11111111111111111111111111111111`)
- Loading/error states with toasts
- Security warning displayed in UI

## Prerequisites
- Node.js 18+
- Solana CLI

## Install Solana CLI
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

## Start local validator
```bash
solana-test-validator
```

## Configure Solana CLI
```bash
solana config set --url http://127.0.0.1:8899
```

## Project setup
```bash
npm install
npm run dev
```
Vite will print a local URL to open in your browser.

## Test flow
1. Create a wallet, request an airdrop, verify balance
2. Import another wallet in a separate browser profile (e.g., incognito), airdrop, send SOL
3. Verify balances and recent transaction signatures
4. Use "Clear Balance" and confirm balance is ~0 SOL

## Troubleshooting
- Ensure `solana-test-validator` is running and reachable at `http://127.0.0.1:8899`.
- If airdrops fail, try restarting the validator, then retry.
- If balances don’t update immediately, click Refresh or wait a few seconds after actions.
- Clear site data/localStorage to reset wallets between tests.

## Security Notice
For demo only — keys are not stored securely. Do not use with real funds.

## Scripts
- `npm run dev` – start dev server
- `npm run build` – production build
- `npm run preview` – preview built app

## Project Structure
```
/ (root)
  index.html
  package.json
  postcss.config.js
  tailwind.config.js
  vite.config.js
  /public
    index.html
  /src
    index.css
    main.jsx
    App.jsx
    /components
      WalletPanel.jsx
      SendForm.jsx
      TxHistory.jsx
    /utils
      solana.js
```

## Notes on Implementation
- Connection exported in `src/utils/solana.js` points to `http://127.0.0.1:8899`.
- All blockchain functions use `async/await` and `try/catch` with clear error messages.
- Airdrop uses `connection.requestAirdrop(pubkey, 1 * LAMPORTS_PER_SOL)`.
- Transfers use `SystemProgram.transfer` and are signed and sent.
- Transaction history uses `getSignaturesForAddress(pubkey, { limit: 10 })`.
- Clear balance transfers all lamports to the null address, accounting for fees.

## Run locally
```bash
# 1) Start validator in a separate terminal
solana-test-validator

# 2) Configure CLI to localnet
solana config set --url http://127.0.0.1:8899

# 3) Install deps and run
npm install
npm run dev
```


