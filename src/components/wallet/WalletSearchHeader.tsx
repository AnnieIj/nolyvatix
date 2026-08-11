import React, { useState } from 'react';
import { Search, Wallet, ShieldCheck, Copy, Check, ExternalLink, ArrowRight, Zap } from 'lucide-react';

interface WalletSearchHeaderProps {
  searchedAddress: string;
  onSearch: (address: string) => void;
  isLoading: boolean;
}

// Popular Stellar public addresses for quick test/demo
const PRESET_ACCOUNTS = [
  {
    label: 'Mainnet Active Account',
    address: 'GAUA7XL5K54CC2DDGP77FJ2YBHRJLT36CPZDXWPM6MP7MANOGG77PNJU',
    tag: 'Active Ledger',
  },
  {
    label: 'Primary Horizon Hub',
    address: 'GB6YM6S6NW5UDYQASFDFXHCIVLY7BEPRLYVUBXWME6K7YZKKA4VE2Q7C',
    tag: 'Liquidity Hub',
  },
  {
    label: 'Anchor Gateway',
    address: 'GBLVLKGRDU66WLWY4XRORJXCC4LDZ347AQTUYBEPBABIZTVITW2OAGIP',
    tag: 'Anchor Gateway',
  },
  {
    label: 'Stellar High Volume',
    address: 'GAOO2DYIPGMLB2VI35AOSVBCGXX7R6V4YY2FLJSIUL7L6ZTI6EFFN2HL',
    tag: 'Payment Node',
  },
];

export const WalletSearchHeader: React.FC<WalletSearchHeaderProps> = ({
  searchedAddress,
  onSearch,
  isLoading,
}) => {
  const [inputVal, setInputVal] = useState(searchedAddress);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a Stellar account public address.');
      return;
    }
    if (!trimmed.startsWith('G') || trimmed.length !== 56) {
      setErrorMsg('Invalid Stellar public address. Must start with G and be 56 characters long.');
      return;
    }
    setErrorMsg('');
    onSearch(trimmed);
  };

  const handlePresetSelect = (addr: string) => {
    setInputVal(addr);
    setErrorMsg('');
    onSearch(addr);
  };

  const handleCopy = () => {
    if (searchedAddress) {
      navigator.clipboard.writeText(searchedAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-xl backdrop-blur-sm">
      {/* Top Title & Active Search Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Wallet & Account Intelligence
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-400 uppercase tracking-wider">
                Sprint 4
              </span>
            </h1>
            <p className="text-xs text-zinc-400">
              Deep-dive address analytics, trustline audits, payment flows, and transaction telemetry.
            </p>
          </div>
        </div>

        {searchedAddress && (
          <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 self-start md:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
            <span className="text-xs font-mono text-zinc-300">
              {searchedAddress.slice(0, 8)}...{searchedAddress.slice(-8)}
            </span>
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              aria-label={copied ? 'Address copied to clipboard' : 'Copy wallet address to clipboard'}
              aria-pressed={copied}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
            </button>
            <a
              href={`https://stellar.expert/explorer/public/account/${searchedAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-sky-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              aria-label="View this account on StellarExpert explorer (opens in new tab)"
            >
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        )}
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <div className="relative flex-1">
          <label htmlFor="wallet-address-search" className="sr-only">
            Enter Stellar ED25519 public wallet address to analyze
          </label>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" aria-hidden="true" />
          <input
            id="wallet-address-search"
            type="text"
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            placeholder="Enter Stellar ED25519 Public Address (G... 56 chars)"
            aria-invalid={Boolean(errorMsg)}
            aria-describedby={errorMsg ? 'wallet-search-error' : undefined}
            className="w-full pl-10 pr-24 py-2.5 bg-zinc-950 text-white placeholder-zinc-500 text-xs font-mono rounded-lg border border-zinc-800 focus:outline-none focus:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-500 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          aria-label={isLoading ? 'Fetching account data...' : 'Analyze this Stellar wallet address'}
          className="absolute right-1.5 px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          {isLoading ? (
            <span className="animate-pulse">Fetching...</span>
          ) : (
            <>
              <span>Analyze</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      {errorMsg && <p id="wallet-search-error" role="alert" className="text-xs text-rose-400 font-mono">{errorMsg}</p>}

      {/* Quick Select Presets */}
      <div role="group" aria-label="Quick preset account addresses" className="flex items-center gap-2 flex-wrap pt-1">
        <span className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" aria-hidden="true" /> Quick Accounts:
        </span>
        {PRESET_ACCOUNTS.map((acc) => (
          <button
            key={acc.address}
            onClick={() => handlePresetSelect(acc.address)}
            aria-label={`Load preset account: ${acc.label} (${acc.tag})`}
            className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-md text-[11px] text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <span className="font-medium">{acc.label}</span>
            <span className="px-1 py-0.2 bg-zinc-800 rounded text-[9px] text-zinc-400 font-mono">
              {acc.tag}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
