import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { StatusChip } from '../ui/StatusChip';
import { Modal } from '../ui/Modal';
import { CommandPaletteModal } from '../common/CommandPaletteModal';
import { truncateAddress } from '../../lib/utils';
import {
  Activity,
  Search,
  Wallet,
  Sparkles,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  CheckCircle2,
  LogOut,
  Command,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export const AppHeader: React.FC = () => {
  const {
    theme,
    toggleTheme,
    stellarNetwork,
    setStellarNetwork,
    networkTelemetry,
    wallet,
    connectMockWallet,
    disconnectWallet,
    toggleAICopilot,
    aiCopilotOpen,
    setActiveRoute,
  } = useAppStore();

  const { user: authUser, loading: authLoading } = useAuth();

  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [networkDropdownOpen, setNetworkDropdownOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState('');

  // Global keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInputValue.trim()) {
      setActiveRoute('search-center');
    } else {
      setCommandPaletteOpen(true);
    }
  };

  return (
    <>
      <header className="h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 px-4 flex items-center justify-between gap-4">
        {/* Left Search Bar & Command Palette Trigger */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              onClick={() => setCommandPaletteOpen(true)}
              placeholder="Search Ledger #, Account (G...), Tx, Contract (C...), or press ⌘K"
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-md pl-9 pr-14 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 font-mono focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 transition-colors cursor-pointer"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-zinc-800 border border-zinc-700/60 rounded text-[10px] font-mono text-zinc-400 pointer-events-none">
              <span>⌘K</span>
            </div>
          </form>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Realtime Ledger Telemetry Pulse */}
          <div className="hidden lg:flex items-center gap-2.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-xs font-mono">
            <StatusChip status={networkTelemetry.horizonStatus} label="LIVE STREAM" />
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-400">
              Ledger <span className="text-white font-semibold">#{networkTelemetry.currentLedgerSequence}</span>
            </span>
            <span className="text-zinc-500">|</span>
            <span className="text-emerald-400 font-semibold">{networkTelemetry.tps} TPS</span>
          </div>

          {/* Stellar Network Switcher */}
          <div className="relative">
            <button
              onClick={() => setNetworkDropdownOpen(!networkDropdownOpen)}
              className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md text-xs font-mono font-medium text-zinc-300 flex items-center gap-1.5 transition-colors"
              aria-label="Stellar Network Selector"
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span className="capitalize">{stellarNetwork}</span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>

            {networkDropdownOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-zinc-900 border border-zinc-800 rounded-md shadow-xl py-1 z-50 text-xs font-mono">
                <button
                  onClick={() => {
                    setStellarNetwork('mainnet');
                    setNetworkDropdownOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  <span>Mainnet</span>
                  {stellarNetwork === 'mainnet' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
                <button
                  onClick={() => {
                    setStellarNetwork('testnet');
                    setNetworkDropdownOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  <span>Testnet</span>
                  {stellarNetwork === 'testnet' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              </div>
            )}
          </div>

          {/* Tenant Auth Status */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-[11px] font-mono text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-zinc-300 font-medium">
              {authUser ? (authUser.isAnonymous ? `Anon:${authUser.uid.slice(0, 5)}` : authUser.email || authUser.uid.slice(0, 6)) : 'Auth: Active'}
            </span>
          </div>

          {/* AI Co-Pilot Trigger Button */}
          <Button
            variant={aiCopilotOpen ? 'primary' : 'glass'}
            size="sm"
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-sky-400" />}
            onClick={toggleAICopilot}
            className="hidden sm:inline-flex"
            aria-label="Open Gemini AI Co-Pilot"
          >
            AI Co-Pilot
          </Button>

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Web3 Wallet Status / Connect Button */}
          {wallet.isConnected ? (
            <button
              onClick={() => setWalletModalOpen(true)}
              className="px-3 py-1.5 bg-sky-500/10 border border-sky-500/30 text-sky-300 rounded-md text-xs font-mono font-medium flex items-center gap-2 hover:bg-sky-500/20 transition-colors"
            >
              <Wallet className="w-3.5 h-3.5 text-sky-400" />
              <span>{truncateAddress(wallet.publicKey)}</span>
            </button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Wallet className="w-3.5 h-3.5" />}
              onClick={() => setWalletModalOpen(true)}
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </header>

      {/* Global Command Palette Modal */}
      <CommandPaletteModal
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Wallet Management Modal */}
      <Modal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        title="Stellar Web3 Wallet"
        subtitle="Cryptographic verification for workspaces & alerts"
        maxWidth="sm"
      >
        {wallet.isConnected ? (
          <div className="space-y-4">
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Wallet Provider</span>
                <Badge variant="info">{wallet.name}</Badge>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Public Key</span>
                <span className="text-white font-semibold">{truncateAddress(wallet.publicKey, 6, 6)}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>XLM Balance</span>
                <span className="text-emerald-400 font-semibold">{wallet.balanceXLM} XLM</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="danger"
                size="md"
                leftIcon={<LogOut className="w-4 h-4" />}
                onClick={() => {
                  disconnectWallet();
                  setWalletModalOpen(false);
                }}
                className="w-full"
              >
                Disconnect Wallet
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 font-mono">
            <p className="text-xs text-zinc-400 mb-2">Select your Stellar browser extension wallet:</p>
            <button
              onClick={() => {
                connectMockWallet('Freighter');
                setWalletModalOpen(false);
              }}
              className="w-full p-3 bg-zinc-900 border border-zinc-800 hover:border-sky-500/50 rounded-lg flex items-center justify-between text-xs text-white hover:bg-zinc-850 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  F
                </div>
                <span>Freighter Wallet</span>
              </div>
              <Badge variant="success">Recommended</Badge>
            </button>

            <button
              onClick={() => {
                connectMockWallet('Albedo');
                setWalletModalOpen(false);
              }}
              className="w-full p-3 bg-zinc-900 border border-zinc-800 hover:border-sky-500/50 rounded-lg flex items-center justify-between text-xs text-white hover:bg-zinc-850 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                  A
                </div>
                <span>Albedo Link</span>
              </div>
              <span className="text-zinc-500 text-[10px]">Web Auth</span>
            </button>
          </div>
        )}
      </Modal>
    </>
  );
};
