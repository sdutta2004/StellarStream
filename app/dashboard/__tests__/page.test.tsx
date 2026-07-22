/**
 * Dashboard Page Unit Tests
 *
 * Tests that the Dashboard page:
 * - Shows a "Connect Wallet" prompt when disconnected
 * - Renders the correct heading
 * - Shows the wallet address display when connected
 * - Displays a balance value when connected
 *
 * Zustand stores and hooks are mocked to isolate UI rendering.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Mock Zustand stores and hooks to avoid Stellar network calls in tests.
const mockWalletStore = {
  isConnected: false,
  address: null as string | null,
  balance: null as string | null,
  network: null as string | null,
  isConnecting: false,
  error: null as string | null,
};

vi.mock('@/store/wallet-store', () => ({
  useWalletStore: () => mockWalletStore,
}));

vi.mock('@/store/transaction-store', () => ({
  useTransactionStore: () => ({
    getRecentTransactions: () => [],
  }),
}));

vi.mock('@/hooks/useWallet', () => ({
  useWallet: () => ({
    ...mockWalletStore,
    connect: vi.fn(),
    disconnect: vi.fn(),
    refreshBalance: vi.fn(),
    restoreWallet: vi.fn(),
    rewardBalance: null,
  }),
}));

vi.mock('@/lib/stellar/config', () => ({
  STELLAR_CONFIG: {
    network: 'testnet',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    networkPassphrase: 'Test SDF Network ; September 2015',
    horizonUrl: 'https://horizon-testnet.stellar.org',
    contractId: 'CBWUQRGPLGVWNXSUNO7GGET4RMWQBYQRGGJFLLBUHTG6JYN3LUZOSCHQ',
    rewardTokenId: 'CBLCBZNJBLS3SSMVZUAPIK53QOCPOYXMJPMS3L7TZSFH7SGKRWEGM66M',
  },
  DEPLOYER_ADDRESS: 'GBVLCPD3N67ZMJ7KEMN577ZJLNZLPD77VWYLTYO56QPXUPH7V4B4CMZO',
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/dashboard',
}));

// ── Import component under test ───────────────────────────────────────────────
// Dynamic import after mocks are set up
import DashboardPage from '../page';

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Dashboard Page', () => {
  beforeEach(() => {
    // Reset to disconnected state before each test
    mockWalletStore.isConnected = false;
    mockWalletStore.address = null;
    mockWalletStore.balance = null;
    mockWalletStore.error = null;
    mockWalletStore.isConnecting = false;
  });

  it('renders the page heading "Wallet Dashboard"', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Wallet Dashboard')).toBeInTheDocument();
  });

  it('shows "Connect Your Wallet" prompt when wallet is not connected', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Connect Your Wallet')).toBeInTheDocument();
  });

  it('shows "Connect Wallet" button when disconnected', () => {
    render(<DashboardPage />);
    const btn = screen.getByRole('button', { name: /Connect Wallet/i });
    expect(btn).toBeInTheDocument();
  });

  it('does NOT show wallet address when disconnected', () => {
    render(<DashboardPage />);
    expect(screen.queryByText(/GBVLC/)).not.toBeInTheDocument();
  });

  it('shows wallet address input when connected', () => {
    mockWalletStore.isConnected = true;
    mockWalletStore.address = 'GBVLCPD3N67ZMJ7KEMN577ZJLNZLPD77VWYLTYO56QPXUPH7V4B4CMZO';
    mockWalletStore.balance = '1234.5678';
    render(<DashboardPage />);
    expect(
      screen.getByText('GBVLCPD3N67ZMJ7KEMN577ZJLNZLPD77VWYLTYO56QPXUPH7V4B4CMZO')
    ).toBeInTheDocument();
  });

  it('shows the XLM balance when connected', () => {
    mockWalletStore.isConnected = true;
    mockWalletStore.address = 'GBVLCPD3N67ZMJ7KEMN577ZJLNZLPD77VWYLTYO56QPXUPH7V4B4CMZO';
    mockWalletStore.balance = '9999.1234';
    render(<DashboardPage />);
    // Balance is shown as parseFloat(balance).toFixed(4)
    expect(screen.getByText('9999.1234')).toBeInTheDocument();
  });

  it('shows an error alert when there is a connection error', () => {
    mockWalletStore.error = 'Connection refused';
    render(<DashboardPage />);
    expect(screen.getByText('Connection Error')).toBeInTheDocument();
    expect(screen.getByText('Connection refused')).toBeInTheDocument();
  });

  it('shows "Recent Transactions" section when connected with no transactions', () => {
    mockWalletStore.isConnected = true;
    mockWalletStore.address = 'GBVLCPD3N67ZMJ7KEMN577ZJLNZLPD77VWYLTYO56QPXUPH7V4B4CMZO';
    render(<DashboardPage />);
    expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
    expect(screen.getByText(/No transactions recorded yet/i)).toBeInTheDocument();
  });
});
