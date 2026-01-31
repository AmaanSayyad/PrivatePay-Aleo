import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody, Chip, Button } from '@nextui-org/react';
import { ExternalLink, CheckCircle, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { WalletMultiButton } from '@demox-labs/aleo-wallet-adapter-reactui';
import { executeAleoOperation, OPERATION_TYPES, TREASURY_ADDRESS } from '../lib/aleo/aleoTransactionHelper';



export default function AleoPage() {
    const { publicKey, wallet, connected, requestTransaction, transactionStatus } = useWallet();
    const [blockHeight, setBlockHeight] = useState('--');
    const [recipient, setRecipient] = useState(TREASURY_ADDRESS);
    const [amount, setAmount] = useState('0.001');
    const [transferLoading, setTransferLoading] = useState(false);
    const [lastTx, setLastTx] = useState(null);

    useEffect(() => {
        const fetchBlockHeight = async () => {
            try {
                const response = await fetch('https://api.explorer.provable.com/v1/testnet/latest/height');
                if (response.ok) {
                    const height = await response.json();
                    setBlockHeight(height.toLocaleString());
                }
            } catch (error) {
                console.debug('[Aleo] Block height fetch error:', error);
            }
        };
        fetchBlockHeight();
        const interval = setInterval(fetchBlockHeight, 30000);
        return () => clearInterval(interval);
    }, []);

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
                transactionStatus // Pass transactionStatus for polling
            );
            
            toast.dismiss('tx-loading');
            setLastTx(result);
            
            if (result.isRealTxId) {
                toast.success(
                    <div>
                        <p className="font-bold">Transfer confirmed!</p>
                        <p className="text-xs text-gray-600">TX: {result.txHash.substring(0, 20)}...</p>
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
            console.error('[Aleo] Transfer failed:', error);
            if (error.message?.includes('rejected') || error.message?.includes('cancelled')) {
                toast.error('Transaction cancelled');
            } else {
                toast.error(error.message || 'Transfer failed');
            }
        } finally {
            setTransferLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-start w-full gap-6 p-4 md:p-6 pt-24 pb-28 md:pb-24 bg-light-white min-h-screen">
            {/* Header — single title */}
            <div className="flex flex-col items-center gap-2 mb-4">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                    <h1 className="font-aleo text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Aleo</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <Chip size="sm" variant="flat" color="secondary" className="font-bold text-[10px]">ZERO-KNOWLEDGE</Chip>
                        <Chip size="sm" variant="flat" color="warning" className="font-bold text-[10px]">TESTNET</Chip>
                    </div>
                </motion.div>
            </div>

            {!connected ? (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-md w-full">
                    <Card className="bg-white border border-gray-200 shadow-lg rounded-3xl">
                        <CardBody className="flex flex-col items-center justify-center py-16 gap-8">
                            <div className="w-20 h-20 rounded-3xl bg-primary-50 flex items-center justify-center p-4">
                                <img src="/aleo-logos/SVG/secondary-icon-dark.svg" alt="Aleo" className="w-full h-full object-contain" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="font-aleo text-2xl font-black text-gray-900">Connect Aleo Wallet</h3>
                                <p className="text-gray-500 text-sm max-w-[280px] leading-relaxed mx-auto">
                                    Connect your Leo Wallet to access zero-knowledge privacy on Aleo.
                                </p>
                            </div>
                            <div className="w-full space-y-4">
                                <WalletMultiButton className="!w-full !bg-primary hover:!bg-primary-800 !text-white !font-bold !h-12 !rounded-2xl !shadow-md hover:!shadow-lg !transition-all" />
                                <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100">
                                    <p className="text-xs text-primary-800 leading-relaxed">
                                        Don't have Leo Wallet?{' '}
                                        <a href="https://leo.app/" target="_blank" rel="noopener noreferrer" className="font-bold underline">Download here</a>
                                    </p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>
            ) : (
                <div className="flex flex-col w-full max-w-6xl gap-6">
                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-white border border-gray-200 shadow-md rounded-3xl">
                            <CardBody className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-primary-50 flex items-center justify-center p-2">
                                            <img src="/aleo-logos/SVG/secondary-icon-dark.svg" alt="Aleo" className="w-full h-full object-contain" />
                                        </div>
                                        <div><h3 className="font-aleo text-lg font-bold text-gray-900">Network Status</h3><p className="text-xs text-gray-500">Aleo Testnet</p></div>
                                    </div>
                                    <Chip size="sm" color="success" variant="flat" className="font-bold text-[10px]">LIVE</Chip>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Block Height</span><span className="text-gray-900 font-bold">#{blockHeight}</span></div>
                                    <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Network</span><span className="text-gray-900 font-bold">TESTNET BETA</span></div>
                                    <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Status</span><span className="text-primary font-bold flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary animate-pulse" />ONLINE</span></div>
                                </div>
                            </CardBody>
                        </Card>
                        <Card className="bg-white border border-gray-200 shadow-md rounded-3xl">
                            <CardBody className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-2xl bg-primary-50 flex items-center justify-center p-2">
                                        <img src="/aleo-logos/SVG/secondary-icon-dark.svg" alt="Aleo" className="w-full h-full object-contain" />
                                    </div>
                                    <div><h3 className="font-aleo text-lg font-bold text-gray-900">Privacy Features</h3><p className="text-xs text-gray-500">Zero-Knowledge Proofs</p></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl"><span className="text-sm text-gray-700">Private by Default</span><CheckCircle size={16} className="text-primary" /></div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl"><span className="text-sm text-gray-700">Programmable Privacy</span><CheckCircle size={16} className="text-primary" /></div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl"><span className="text-sm text-gray-700">Scalable ZK Proofs</span><CheckCircle size={16} className="text-primary" /></div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* DeFi Features Grid */}
                    <div className="w-full">
                        <h2 className="font-aleo text-2xl font-bold text-gray-900 mb-4">Aleo DeFi Features</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card isPressable onPress={() => window.location.href = '/aleo/darkpool'} className="bg-gradient-to-br from-primary to-primary-700 border-0 shadow-lg rounded-3xl hover:scale-[1.02] transition-transform relative overflow-hidden">
                                <CardBody className="p-6">
                                    <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center p-1.5">
                                        <img src="/aleo-logos/SVG/tertiary-icon-light.svg" alt="Aleo" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center p-2">
                                            <img src="/aleo-logos/SVG/tertiary-icon-light.svg" alt="Aleo" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1"><h3 className="font-aleo text-lg font-bold text-white mb-1">Dark Pool</h3><p className="text-xs text-white/80">Private order execution</p></div>
                                    </div>
                                    <p className="text-xs text-white/70 leading-relaxed">Trade with complete privacy using encrypted orders</p>
                                </CardBody>
                            </Card>
                            <Card isPressable onPress={() => window.location.href = '/aleo/amm'} className="bg-gradient-to-br from-primary to-primary-700 border-0 shadow-lg rounded-3xl hover:scale-[1.02] transition-transform relative overflow-hidden">
                                <CardBody className="p-6">
                                    <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center p-1.5">
                                        <img src="/aleo-logos/SVG/tertiary-icon-light.svg" alt="Aleo" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center p-2">
                                            <img src="/aleo-logos/SVG/tertiary-icon-light.svg" alt="Aleo" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1"><h3 className="font-aleo text-lg font-bold text-white mb-1">Shielded AMM</h3><p className="text-xs text-white/80">Private token swaps</p></div>
                                    </div>
                                    <p className="text-xs text-white/70 leading-relaxed">Swap tokens with zero-knowledge privacy</p>
                                </CardBody>
                            </Card>
                            <Card isPressable onPress={() => window.location.href = '/aleo/credit'} className="bg-gradient-to-br from-primary to-primary-700 border-0 shadow-lg rounded-3xl hover:scale-[1.02] transition-transform relative overflow-hidden">
                                <CardBody className="p-6">
                                    <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center p-1.5">
                                        <img src="/aleo-logos/SVG/tertiary-icon-light.svg" alt="Aleo" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center p-2">
                                            <img src="/aleo-logos/SVG/tertiary-icon-light.svg" alt="Aleo" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1"><h3 className="font-aleo text-lg font-bold text-white mb-1">ZK Credit</h3><p className="text-xs text-white/80">Private credit score</p></div>
                                    </div>
                                    <p className="text-xs text-white/70 leading-relaxed">Build credit while maintaining privacy</p>
                                </CardBody>
                            </Card>
                            <Card isPressable onPress={() => window.location.href = '/aleo/lending'} className="bg-gradient-to-br from-primary to-primary-800 border-0 shadow-lg rounded-3xl hover:scale-[1.02] transition-transform relative overflow-hidden">
                                <CardBody className="p-6">
                                    <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center p-1.5">
                                        <img src="/aleo-logos/SVG/tertiary-icon-light.svg" alt="Aleo" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center p-2">
                                            <img src="/aleo-logos/SVG/tertiary-icon-light.svg" alt="Aleo" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1"><h3 className="font-aleo text-lg font-bold text-white mb-1">Private Lending</h3><p className="text-xs text-white/80">Supply & borrow</p></div>
                                    </div>
                                    <p className="text-xs text-white/70 leading-relaxed">Earn yield or borrow with privacy</p>
                                </CardBody>
                            </Card>
                            <Card isPressable onPress={() => window.location.href = '/aleo/vaults'} className="bg-gradient-to-br from-primary to-primary-700 border-0 shadow-lg rounded-3xl hover:scale-[1.02] transition-transform relative overflow-hidden">
                                <CardBody className="p-6">
                                    <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center p-1.5">
                                        <img src="/aleo-logos/SVG/tertiary-icon-light.svg" alt="Aleo" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center p-2">
                                            <img src="/aleo-logos/SVG/tertiary-icon-light.svg" alt="Aleo" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1"><h3 className="font-aleo text-lg font-bold text-white mb-1">Vaults</h3><p className="text-xs text-white/80">Yield farming</p></div>
                                    </div>
                                    <p className="text-xs text-white/70 leading-relaxed">Cross-chain yield strategies up to 28.7% APY</p>
                                </CardBody>
                            </Card>
                            <Card isPressable onPress={() => window.location.href = '/aleo/treasury'} className="bg-gradient-to-br from-primary to-primary-800 border-0 shadow-lg rounded-3xl hover:scale-[1.02] transition-transform relative overflow-hidden">
                                <CardBody className="p-6">
                                    <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center p-1.5">
                                        <img src="/aleo-logos/SVG/tertiary-icon-light.svg" alt="Aleo" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center p-2">
                                            <img src="/aleo-logos/SVG/tertiary-icon-light.svg" alt="Aleo" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1"><h3 className="font-aleo text-lg font-bold text-white mb-1">Treasury</h3><p className="text-xs text-white/80">Multi-sig management</p></div>
                                    </div>
                                    <p className="text-xs text-white/70 leading-relaxed">Institutional fund management with privacy</p>
                                </CardBody>
                            </Card>
                        </div>
                    </div>

                    {/* Private Transfer */}
                    <Card className="bg-white border border-gray-200 shadow-md rounded-3xl">
                        <CardBody className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-2xl bg-primary-50 flex items-center justify-center p-2">
                                    <img src="/aleo-logos/SVG/secondary-icon-dark.svg" alt="Aleo" className="w-full h-full object-contain" />
                                </div>
                                <div><h3 className="font-aleo text-lg font-bold text-gray-900">Private Transfer</h3><p className="text-xs text-gray-500">Send ALEO credits on Aleo Testnet</p></div>
                            </div>
                            <p className="text-xs text-gray-600 mb-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                Connect your Leo Wallet, enter any Aleo address and amount. Click Send — Leo Wallet will prompt you to sign. The transfer is sent on-chain (credits.aleo) and you get a link to the explorer when it confirms. Minimum 0.1 ALEO; network fee applies.
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Recipient Address</label>
                                    <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="aleo1..." className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Amount (Credits)</label>
                                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0" step="0.000001" min="0" className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
                                </div>
                                {lastTx && (
                                    <div className={`p-4 rounded-2xl border ${lastTx.isRealTxId ? 'bg-primary-50 border-primary-100' : 'bg-amber-50 border-amber-100'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className={`w-5 h-5 ${lastTx.isRealTxId ? 'text-primary' : 'text-amber-600'}`} />
                                                <span className={`text-sm font-bold ${lastTx.isRealTxId ? 'text-primary-900' : 'text-amber-900'}`}>
                                                    {lastTx.isRealTxId ? 'Transfer Confirmed' : 'Transaction Submitted'}
                                                </span>
                                            </div>
                                            <a href={lastTx.explorerLink} target="_blank" rel="noopener noreferrer" className={`text-xs underline flex items-center gap-1 ${lastTx.isRealTxId ? 'text-primary-700' : 'text-amber-700'}`}>
                                                {lastTx.isRealTxId ? `${lastTx.txHash?.substring(0, 15)}...` : 'View Address'} <ExternalLink size={12} />
                                            </a>
                                        </div>
                                    </div>
                                )}
                                <Button onClick={handleTransfer} isLoading={transferLoading} isDisabled={!recipient || !amount || transferLoading} className="w-full bg-primary hover:bg-primary-800 text-white font-semibold h-12 rounded-2xl" startContent={!transferLoading && <Send size={18} />}>
                                    {transferLoading ? 'Sending...' : 'Send Private Transfer'}
                                </Button>
                                <p className="text-xs text-gray-500 text-center">Network fee: ~0.3 ALEO • Executed on Aleo Testnet via Leo Wallet</p>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            )}
        </div>
    );
}
