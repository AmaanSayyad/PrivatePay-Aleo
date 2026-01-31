/**
 * Send & Withdraw page.
 * - Send: Transfer ALEO from your Leo wallet to any address (e.g. treasury).
 * - Withdraw: Withdraw your credited balance from the treasury to your Leo wallet (relayer executes the transfer).
 */
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardBody, Button } from '@nextui-org/react';
import { Send, ArrowDownToLine, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { WalletMultiButton } from '@demox-labs/aleo-wallet-adapter-reactui';
import { executeAleoOperation, OPERATION_TYPES, TREASURY_ADDRESS } from '../lib/aleo/aleoTransactionHelper';
import { getUserBalance, withdrawFunds, getUserByWallet } from '../lib/supabase.js';
import { useAppWallet } from '../hooks/useAppWallet.js';

// When VITE_BACKEND_URL is set (e.g. local backend on 3400), use it; else use same-origin /api (Vercel serverless)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';
const WITHDRAW_URL = BACKEND_URL ? `${BACKEND_URL}/withdraw` : '/api/withdraw';

export default function SendPage() {
  const location = useLocation();
  const hash = (location.hash || '#send').replace('#', '') || 'send';
  const [activeTab, setActiveTab] = useState(hash === 'withdraw' ? 'withdraw' : 'send');

  useEffect(() => {
    const h = (location.hash || '#send').replace('#', '') || 'send';
    setActiveTab(h === 'withdraw' ? 'withdraw' : 'send');
  }, [location.hash]);

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-light-white pb-24 pt-6 px-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-6">
          <img src="/aleo-logos/SVG/primary-logo-dark.svg" alt="Aleo" className="h-10 w-auto object-contain" />
          <h1 className="font-aleo text-2xl font-bold text-gray-900">Send & Withdraw</h1>
        </div>

        <div className="flex rounded-2xl bg-primary-100 p-1 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('send')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'send' ? 'bg-primary text-white shadow' : 'text-primary-700 hover:bg-primary-50'
            }`}
          >
            <Send className="size-5" />
            Send
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'withdraw' ? 'bg-primary text-white shadow' : 'text-primary-700 hover:bg-primary-50'
            }`}
          >
            <ArrowDownToLine className="size-5" />
            Withdraw
          </button>
        </div>

        {activeTab === 'send' ? <SendTab /> : <WithdrawTab />}
      </div>
    </div>
  );
}

function SendTab() {
  const { publicKey, connected, requestTransaction, transactionStatus } = useWallet();
  const [recipient, setRecipient] = useState(TREASURY_ADDRESS);
  const [amount, setAmount] = useState('0.001');
  const [transferLoading, setTransferLoading] = useState(false);
  const [lastTx, setLastTx] = useState(null);

  const handleTransfer = async () => {
    if (!connected) {
      toast.error('Please connect your wallet');
      return;
    }
    if (!recipient || !amount) {
      toast.error('Please fill all fields');
      return;
    }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Invalid amount');
      return;
    }

    try {
      setTransferLoading(true);
      toast.loading('Submitting transaction...', { id: 'tx-loading' });

      const result = await executeAleoOperation(
        requestTransaction,
        publicKey,
        OPERATION_TYPES.TRANSFER,
        { recipient, amount, type: 'Private Transfer' },
        transactionStatus
      );

      toast.dismiss('tx-loading');
      setLastTx(result);

      if (result.isRealTxId) {
        toast.success(
          <div>
            <p className="font-bold">Transfer confirmed!</p>
            <p className="text-xs text-gray-600">TX: {result.txHash?.substring(0, 20)}...</p>
            <a href={result.explorerLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 underline flex items-center gap-1">
              View on Explorer <ExternalLink size={12} />
            </a>
          </div>
        );
      } else {
        toast.success(
          <div>
            <p className="font-bold">Transaction submitted!</p>
            <p className="text-xs text-gray-600">Waiting for confirmation...</p>
            <a href={result.explorerLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 underline flex items-center gap-1">
              View Address <ExternalLink size={12} />
            </a>
          </div>
        );
      }
    } catch (error) {
      toast.dismiss('tx-loading');
      console.error('[Send] Transfer failed:', error);
      if (error.message?.includes('rejected') || error.message?.includes('cancelled')) {
        toast.error('Transaction cancelled');
      } else {
        toast.error(error.message || 'Transfer failed');
      }
    } finally {
      setTransferLoading(false);
    }
  };

  if (!connected) {
    return (
      <Card className="bg-white border border-gray-200 shadow-md rounded-3xl">
        <CardBody className="p-8 flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center p-3">
            <img src="/aleo-logos/SVG/secondary-icon-dark.svg" alt="Aleo" className="w-full h-full object-contain" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-aleo text-xl font-bold text-gray-900">Connect wallet to send</h3>
            <p className="text-gray-500 text-sm">Connect your Leo Wallet to transfer ALEO.</p>
          </div>
          <WalletMultiButton className="!w-full !bg-primary hover:!bg-primary-800 !text-white !font-bold !h-12 !rounded-2xl" />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-md rounded-3xl">
      <CardBody className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-primary-50 flex items-center justify-center p-2">
            <img src="/aleo-logos/SVG/secondary-icon-dark.svg" alt="Aleo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h3 className="font-aleo text-lg font-bold text-gray-900">Send from wallet</h3>
            <p className="text-xs text-gray-500">Transfer ALEO from your Leo wallet to an address (e.g. treasury)</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Recipient address</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="aleo1..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Amount (ALEO)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              step="0.000001"
              min="0"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
          {lastTx && (
            <div className={`p-4 rounded-2xl border ${lastTx.isRealTxId ? 'bg-primary-50 border-primary-100' : 'bg-amber-50 border-amber-100'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-5 h-5 ${lastTx.isRealTxId ? 'text-primary' : 'text-amber-600'}`} />
                  <span className={`text-sm font-bold ${lastTx.isRealTxId ? 'text-primary-900' : 'text-amber-900'}`}>
                    {lastTx.isRealTxId ? 'Transfer confirmed' : 'Transaction submitted'}
                  </span>
                </div>
                <a href={lastTx.explorerLink} target="_blank" rel="noopener noreferrer" className="text-xs underline flex items-center gap-1 text-primary-700">
                  View <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}
          <Button
            onClick={handleTransfer}
            isLoading={transferLoading}
            isDisabled={!recipient || !amount || transferLoading}
            className="w-full bg-primary hover:bg-primary-800 text-white font-semibold h-12 rounded-2xl"
            startContent={!transferLoading && <Send size={18} />}
          >
            {transferLoading ? 'Sending...' : 'Send'}
          </Button>
          <p className="text-xs text-gray-500 text-center">Private transaction using zk-SNARKs • Fee ~0.1 credit</p>
        </div>
      </CardBody>
    </Card>
  );
}

function WithdrawTab() {
  const { account, isConnected } = useAppWallet();
  const [username, setUsername] = useState('');
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(true);

  useEffect(() => {
    if (!account) {
      setLoadingBalance(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const un = localStorage.getItem(`aleo_username_${account}`) || account?.slice(-8) || 'user';
      if (!cancelled) setUsername(un);
      try {
        const user = await getUserByWallet(account);
        const resolvedUsername = user?.username ?? un;
        if (!cancelled) setUsername(resolvedUsername);
        const balanceData = await getUserBalance(resolvedUsername);
        const bal = Number(balanceData?.available_balance || 0);
        if (!cancelled) {
          setBalance(bal);
          setDestination(account);
        }
      } catch (e) {
        if (!cancelled) setBalance(0);
      } finally {
        if (!cancelled) setLoadingBalance(false);
      }
    })();
    return () => { cancelled = true; };
  }, [account]);

  const setMaxAmount = () => {
    const max = Math.max(0, balance - 0.0001);
    setAmount(String(max.toFixed(4)));
  };

  const handleWithdraw = async () => {
    if (!isConnected || !account) {
      toast.error('Connect your wallet first');
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (amt > balance) {
      toast.error('Insufficient balance');
      return;
    }
    if (!destination?.trim()) {
      toast.error('Enter destination address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(WITHDRAW_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          amount: amt,
          destinationAddress: destination.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.txHash) {
        await withdrawFunds(username, amt, destination.trim(), data.txHash);
        window.dispatchEvent(new Event('balance-updated'));
        window.dispatchEvent(new Event('transactions-updated'));
        toast.success(`Withdrew ${amt.toFixed(4)} ALEO to your wallet`);
        setAmount('');
        setBalance((b) => Math.max(0, b - amt));
      } else if (res.status === 501 || data.error === 'not_configured') {
        toast.error(
          'Withdrawal relayer is not configured. Run the relayer (see docs/TREASURY_RELAYER.md) to process withdrawals from the treasury.',
          { duration: 6000 }
        );
      } else {
        const msg = data.message || data.error || (res.status === 502 ? 'Relayer unavailable' : 'Withdrawal failed');
        toast.error(msg);
      }
    } catch (err) {
      console.error('[Withdraw]', err);
      if (err.message?.includes('Insufficient balance')) {
        toast.error('Insufficient balance');
      } else if (err.message?.includes('Supabase')) {
        toast.error('Could not update balance. Check your connection.');
      } else if (err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
        toast.error(
          'Relayer not reachable. Start it with: cd backend && npm run dev',
          { duration: 6000 }
        );
      } else {
        toast.error('Withdrawal request failed. Is the relayer running?');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="bg-white border border-gray-200 shadow-md rounded-3xl">
        <CardBody className="p-8 flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center p-3">
            <img src="/aleo-logos/SVG/secondary-icon-dark.svg" alt="Aleo" className="w-full h-full object-contain" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-aleo text-xl font-bold text-gray-900">Connect wallet to withdraw</h3>
            <p className="text-gray-500 text-sm">Withdraw your credited balance from the treasury to your Leo wallet.</p>
          </div>
          <WalletMultiButton className="!w-full !bg-primary hover:!bg-primary-800 !text-white !font-bold !h-12 !rounded-2xl" />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-md rounded-3xl">
      <CardBody className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-primary-50 flex items-center justify-center p-2">
            <img src="/aleo-logos/SVG/secondary-icon-dark.svg" alt="Aleo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h3 className="font-aleo text-lg font-bold text-gray-900">Withdraw from treasury</h3>
            <p className="text-xs text-gray-500">Move your credited balance from the treasury to your Leo wallet</p>
          </div>
        </div>

        <div className="mb-4 p-4 rounded-2xl bg-primary-50 border border-primary-100">
          <p className="text-xs text-primary-700 font-medium">Your credited balance (from payments sent to you)</p>
          {loadingBalance ? (
            <p className="text-xl font-bold text-primary-900">...</p>
          ) : (
            <p className="text-xl font-bold text-primary-900">{balance.toFixed(4)} ALEO</p>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Amount (ALEO)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                step="0.0001"
                min="0"
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
              <Button size="sm" variant="flat" className="bg-primary-100 text-primary font-semibold rounded-2xl" onPress={setMaxAmount}>
                Max
              </Button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Destination (your Leo wallet)</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="aleo1..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
            />
          </div>

          <div className="p-4 rounded-2xl bg-primary-50 border border-primary-100 flex gap-3">
            <AlertCircle className="size-5 text-primary-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-primary-800">
              The relayer sends ALEO from the single treasury to your wallet. Your balance is what senders have credited to you.
            </p>
          </div>

          <Button
            onClick={handleWithdraw}
            isLoading={loading}
            isDisabled={loadingBalance || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance || !destination?.trim()}
            className="w-full bg-primary hover:bg-primary-800 text-white font-semibold h-12 rounded-2xl"
            startContent={!loading && <ArrowDownToLine size={18} />}
          >
            {loading ? 'Processing...' : 'Withdraw'}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
