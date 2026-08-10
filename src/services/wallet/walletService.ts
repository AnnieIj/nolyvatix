/**
 * Nolyvatix Web3 Wallet Service
 *
 * Real Stellar wallet connectivity for the two supported providers:
 *  - Freighter  (browser extension, via @stellar/freighter-api)
 *  - Albedo     (web-based intent flow, via @albedo-link/intent)
 *
 * This replaces the previous mock wallet. The service only ever reads the
 * user's public key (authentication); it never requests signing or funds.
 * Native XLM balance is resolved from the Nolyvatix backend Horizon proxy.
 */

import {
  isConnected as freighterIsConnected,
  requestAccess as freighterRequestAccess,
  getNetwork as freighterGetNetwork,
} from '@stellar/freighter-api';
import albedo from '@albedo-link/intent';
import { backendApiClient } from '../api/horizon';

export type WalletProvider = 'Freighter' | 'Albedo';

export interface ConnectedWallet {
  publicKey: string;
  name: WalletProvider;
  network: string;
  balanceXLM: number;
}

/**
 * Thrown for any user-facing wallet failure (extension missing, rejected
 * authorization, etc.). The message is safe to surface directly in the UI.
 */
export class WalletError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WalletError';
  }
}

/**
 * Resolves the native (XLM) balance for a public key via the backend Horizon
 * proxy. Unfunded or unknown accounts resolve to 0 rather than throwing.
 */
async function fetchNativeBalance(publicKey: string): Promise<number> {
  try {
    const balances = await backendApiClient.getAccountBalances(publicKey);
    if (!Array.isArray(balances)) return 0;
    const native = balances.find(
      (b: { assetType?: string; asset_type?: string }) =>
        b.assetType === 'native' || b.asset_type === 'native'
    );
    const raw = (native as { balance?: string | number })?.balance ?? 0;
    const value = parseFloat(String(raw));
    return Number.isFinite(value) ? value : 0;
  } catch {
    // Account not found / unfunded / offline — treat as zero balance.
    return 0;
  }
}

/**
 * Connect the Freighter browser extension. Requests read access to the
 * account and returns the authenticated public key + network.
 */
export async function connectFreighter(): Promise<ConnectedWallet> {
  const connection = await freighterIsConnected().catch(() => ({ isConnected: false }));
  if (!connection?.isConnected) {
    throw new WalletError(
      'Freighter extension not detected. Install it from freighter.app and refresh.'
    );
  }

  const access = await freighterRequestAccess();
  if (access.error || !access.address) {
    throw new WalletError(
      access.error?.message || 'Freighter access request was denied.'
    );
  }

  const networkResult = await freighterGetNetwork().catch(() => null);
  const network = networkResult?.network?.toLowerCase() || 'public';

  const balanceXLM = await fetchNativeBalance(access.address);

  return { publicKey: access.address, name: 'Freighter', network, balanceXLM };
}

/**
 * Connect via Albedo's web intent flow. Uses the `publicKey` intent with a
 * random verification token so the returned signature proves key ownership.
 */
export async function connectAlbedo(): Promise<ConnectedWallet> {
  try {
    const token =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `nolyvatix-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const result = await albedo.publicKey({ token });
    if (!result?.pubkey) {
      throw new WalletError('Albedo did not return a public key.');
    }

    const balanceXLM = await fetchNativeBalance(result.pubkey);
    return { publicKey: result.pubkey, name: 'Albedo', network: 'public', balanceXLM };
  } catch (err) {
    if (err instanceof WalletError) throw err;
    const message =
      err instanceof Error ? err.message : 'Albedo authorization was cancelled.';
    throw new WalletError(message);
  }
}

/**
 * Unified connect entry point used by the store.
 */
export async function connectWalletProvider(
  provider: WalletProvider
): Promise<ConnectedWallet> {
  return provider === 'Freighter' ? connectFreighter() : connectAlbedo();
}
