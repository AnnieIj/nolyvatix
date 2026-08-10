import React from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useLedgerDetail } from '../../hooks/useNetworkData';
import {
  formatDateTime,
  truncateAddress,
  copyToClipboard,
  formatNumber,
} from '../../lib/utils';
import { Layers, Copy, Check, ExternalLink, Hash, Clock, Coins } from 'lucide-react';

interface LedgerDetailModalProps {
  sequence: number | null;
  onClose: () => void;
}

export const LedgerDetailModal: React.FC<LedgerDetailModalProps> = ({
  sequence,
  onClose,
}) => {
  const [copiedHash, setCopiedHash] = React.useState(false);
  const { data, isLoading, isError } = useLedgerDetail(sequence);

  if (!sequence) return null;

  const handleCopy = (text: string) => {
    copyToClipboard(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const ledger = data?.ledger;
  const transactions = data?.transactions || [];

  return (
    <Modal
      isOpen={sequence !== null}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-sky-400" />
          <span>Ledger Sequence #{sequence}</span>
        </div>
      }
      size="xl"
    >
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-400 font-mono">Loading ledger #{sequence} details from Horizon...</p>
        </div>
      ) : isError || !ledger ? (
        <div className="py-8 text-center text-xs text-rose-400 font-mono">
          Failed to load ledger details for #{sequence}.
        </div>
      ) : (
        <div className="space-y-5 font-mono text-xs">
          {/* Header Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-lg">
              <span className="text-[10px] text-zinc-500 block uppercase">Closed At</span>
              <span className="text-xs text-zinc-200 font-semibold">{formatDateTime(ledger.closedAt)}</span>
            </div>

            <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-lg">
              <span className="text-[10px] text-zinc-500 block uppercase">Transactions</span>
              <span className="text-xs text-emerald-400 font-semibold">{ledger.successfulTransactionCount} Successful</span>
            </div>

            <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-lg">
              <span className="text-[10px] text-zinc-500 block uppercase">Operations</span>
              <span className="text-xs text-sky-400 font-semibold">{ledger.operationCount} Executed</span>
            </div>

            <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-lg">
              <span className="text-[10px] text-zinc-500 block uppercase">Base Fee</span>
              <span className="text-xs text-amber-400 font-semibold">{ledger.baseFee} Stroops</span>
            </div>
          </div>

          {/* Hashes Section */}
          <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 uppercase">Ledger Hash:</span>
              <button
                onClick={() => handleCopy(ledger.hash)}
                className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedHash ? 'Copied' : 'Copy Hash'}
              </button>
            </div>
            <p className="text-[11px] text-zinc-300 break-all bg-zinc-900/80 p-2 rounded border border-zinc-800">
              {ledger.hash}
            </p>

            <span className="text-[10px] text-zinc-500 uppercase block pt-1">Previous Hash:</span>
            <p className="text-[11px] text-zinc-400 break-all bg-zinc-900/50 p-2 rounded border border-zinc-800/60">
              {ledger.prevHash}
            </p>
          </div>

          {/* Ledger Transactions Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-300 uppercase text-xs">
                Ledger Transactions ({transactions.length})
              </span>
            </div>

            {transactions.length === 0 ? (
              <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded text-center text-zinc-500 text-xs">
                No transactions recorded in this ledger
              </div>
            ) : (
              <div className="overflow-x-auto max-h-60 border border-zinc-800 rounded-lg scrollbar-thin scrollbar-thumb-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900 text-zinc-400 text-[10px] uppercase border-b border-zinc-800 sticky top-0">
                    <tr>
                      <th className="p-2.5">Tx Hash</th>
                      <th className="p-2.5">Source Account</th>
                      <th className="p-2.5">Ops</th>
                      <th className="p-2.5">Fee</th>
                      <th className="p-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/80">
                    {transactions.map((tx: any) => (
                      <tr key={tx.id || tx.hash} className="hover:bg-zinc-900/60 transition-colors">
                        <td className="p-2.5 font-bold text-sky-400">
                          {truncateAddress(tx.hash, 6, 6)}
                        </td>
                        <td className="p-2.5 text-zinc-300">
                          {truncateAddress(tx.sourceAccount, 4, 4)}
                        </td>
                        <td className="p-2.5 text-emerald-400">{tx.operationCount}</td>
                        <td className="p-2.5 text-zinc-400">{tx.feeCharged} stroops</td>
                        <td className="p-2.5 text-right">
                          <Badge variant={tx.successful ? 'success' : 'error'} size="sm">
                            {tx.successful ? 'SUCCESS' : 'FAILED'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
