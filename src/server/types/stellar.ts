/**
 * Nolyvatix Stellar Data Engine - Core Domain Types
 */

export type NetworkType = 'mainnet' | 'testnet' | 'futurenet';

export interface HorizonConfig {
  network: NetworkType;
  baseUrl: string;
  timeoutMs: number;
  maxRetries: number;
  rateLimitPerMin: number;
}

export interface SorobanConfig {
  network: NetworkType;
  rpcUrl: string;
  timeoutMs: number;
  maxRetries: number;
}

export interface StellarLedger {
  id: string;
  sequence: number;
  hash: string;
  prevHash: string;
  transactionCount: number;
  successfulTransactionCount: number;
  failedTransactionCount: number;
  operationCount: number;
  txSetOperationCount: number;
  closedAt: string;
  totalCoins: string;
  feePool: string;
  baseFee: number;
  baseReserve: number;
  maxTxSetSize: number;
  protocolVersion: number;
  headerXdr: string;
}

export interface StellarTransaction {
  id: string;
  hash: string;
  ledgerSequence: number;
  createdAt: string;
  sourceAccount: string;
  sourceAccountSequence: string;
  feeCharged: number;
  maxFee: number;
  operationCount: number;
  memo?: string;
  memoType?: 'none' | 'text' | 'id' | 'hash' | 'return';
  signatures: string[];
  successful: boolean;
  resultXdr: string;
  envelopeXdr: string;
  resultMetaXdr?: string;
  feeBump?: boolean;
  innerTransactionHash?: string;
}

export type OperationType =
  | 'create_account'
  | 'payment'
  | 'path_payment_strict_receive'
  | 'path_payment_strict_send'
  | 'manage_sell_offer'
  | 'create_passive_sell_offer'
  | 'set_options'
  | 'change_trust'
  | 'allow_trust'
  | 'account_merge'
  | 'inflation'
  | 'manage_data'
  | 'bump_sequence'
  | 'manage_buy_offer'
  | 'path_payment'
  | 'create_claimable_balance'
  | 'claim_claimable_balance'
  | 'begin_sponsoring_future_reserves'
  | 'end_sponsoring_future_reserves'
  | 'revoke_sponsorship'
  | 'clawback'
  | 'clawback_claimable_balance'
  | 'set_trust_line_flags'
  | 'liquidity_pool_deposit'
  | 'liquidity_pool_withdraw'
  | 'invoke_host_function';

export interface BaseOperation {
  id: string;
  pagingToken: string;
  transactionHash: string;
  transactionSuccessful: boolean;
  sourceAccount: string;
  type: OperationType;
  typeI: number;
  createdAt: string;
}

export interface PaymentOperation extends BaseOperation {
  type: 'payment';
  assetType: string;
  assetCode?: string;
  assetIssuer?: string;
  from: string;
  to: string;
  amount: string;
}

export interface CreateAccountOperation extends BaseOperation {
  type: 'create_account';
  funder: string;
  account: string;
  startingBalance: string;
}

export interface ChangeTrustOperation extends BaseOperation {
  type: 'change_trust';
  assetType: string;
  assetCode?: string;
  assetIssuer?: string;
  limit: string;
  trustor: string;
  trustee?: string;
}

export interface InvokeHostFunctionOperation extends BaseOperation {
  type: 'invoke_host_function';
  function: 'HostFunctionTypeInvokeContract' | 'HostFunctionTypeCreateContract' | string;
  address?: string;
  salt?: string;
}

export type StellarOperation =
  | PaymentOperation
  | CreateAccountOperation
  | ChangeTrustOperation
  | InvokeHostFunctionOperation
  | (BaseOperation & Record<string, unknown>);

export interface AccountBalance {
  balance: string;
  buyingLiabilities: string;
  sellingLiabilities: string;
  limit?: string;
  assetType: 'native' | 'credit_alphanum4' | 'credit_alphanum12' | 'liquidity_pool_shares';
  assetCode?: string;
  assetIssuer?: string;
  liquidityPoolId?: string;
}

export interface AccountSigner {
  weight: number;
  key: string;
  type: string;
}

export interface StellarAccount {
  id: string;
  accountId: string;
  sequence: string;
  subaccountCount: number;
  inflationDestination?: string;
  balances: AccountBalance[];
  signers: AccountSigner[];
  flags: {
    authRequired: boolean;
    authRevocable: boolean;
    authImmutable: boolean;
    authClawbackEnabled: boolean;
  };
  thresholds: {
    lowThreshold: number;
    medThreshold: number;
    highThreshold: number;
  };
  data: Record<string, string>;
}

export interface StellarAsset {
  assetType: 'credit_alphanum4' | 'credit_alphanum12';
  assetCode: string;
  assetIssuer: string;
  pagingToken: string;
  numAccounts: number;
  numClaimableBalances: number;
  numLiquidityPools: number;
  amount: string;
  accounts: {
    authorized: number;
    authorizedToMaintainLiabilities: number;
    unauthorized: number;
  };
  claimableBalancesAmount: string;
  liquidityPoolsAmount: string;
  flags: {
    authRequired: boolean;
    authRevocable: boolean;
    authImmutable: boolean;
    authClawbackEnabled: boolean;
  };
}

export interface StellarLiquidityPool {
  id: string;
  pagingToken: string;
  feeBP: number;
  type: 'constant_product';
  totalShares: string;
  totalTrustlines: number;
  reserves: {
    asset: string;
    amount: string;
  }[];
}

export interface SorobanEvent {
  id: string;
  type: 'contract' | 'system' | 'diagnostic';
  ledger: number;
  ledgerClosedAt: string;
  contractId: string;
  topic: string[];
  value: unknown;
  inSuccessfulContractCall: boolean;
  pagingToken: string;
}

export interface SorobanContractSummary {
  contractId: string;
  wasmHash?: string;
  status: 'active' | 'archived' | 'unknown';
  lastInvocationLedger?: number;
  totalInvocations24h?: number;
  estimatedCpuInstructions?: number;
  estimatedMemoryBytes?: number;
}

export interface NetworkHealth {
  status: 'healthy' | 'degraded' | 'down';
  network: NetworkType;
  horizonStatus: 'healthy' | 'degraded' | 'down';
  sorobanRpcStatus: 'healthy' | 'degraded' | 'down';
  currentLedgerSequence: number;
  latestLedgerClosedAt: string;
  tps: number;
  avgLedgerCloseSeconds: number;
  protocolVersion: number;
  timestamp: string;
}

export interface OrderBookItem {
  price: string;
  amount: string;
  priceR?: { n: number; d: number };
  depthCumulative?: number;
}

export interface StellarOrderBook {
  bids: OrderBookItem[];
  asks: OrderBookItem[];
  baseAsset: string;
  counterAsset: string;
  spread: number;
  spreadPercentage: number;
}

export interface StellarTrade {
  id: string;
  pagingToken: string;
  ledgerCloseTime: string;
  tradeType: string;
  baseAccount: string;
  baseAmount: string;
  baseAssetType: string;
  baseAssetCode: string;
  baseAssetIssuer?: string;
  counterAccount: string;
  counterAmount: string;
  counterAssetType: string;
  counterAssetCode: string;
  counterAssetIssuer?: string;
  price: number;
}

export interface TradeAggregation {
  timestamp: number;
  dateStr: string;
  open: number;
  high: number;
  low: number;
  close: number;
  baseVolume: number;
  counterVolume: number;
  tradeCount: number;
}

export interface PaginationParams {
  cursor?: string;
  order?: 'asc' | 'desc';
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

export interface ApiPaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    cursor?: string;
    nextCursor?: string;
    prevCursor?: string;
    limit: number;
    hasMore: boolean;
  };
}
