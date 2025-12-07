import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatIndianCurrency } from '../../src/utils/formatters';

interface Transaction {
    id: string;
    amount: number;
    type: string;
    status: string;
    timestamp: string;
    receiver_name?: string;
    sender_name?: string;
    merchant_name?: string;
}

interface RecentTransactionsProps {
    transactions: Transaction[];
    onViewAll: () => void;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions, onViewAll }) => {
    return (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
                <button
                    onClick={onViewAll}
                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                    View All
                </button>
            </div>

            <div className="space-y-4">
                {transactions.length > 0 ? (
                    transactions.map((tx) => (
                        <div
                            key={tx.id}
                            className="group flex items-center justify-between p-4 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50 transition-all duration-200"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${tx.type === 'CREDIT' ? 'bg-green-500/10' : 'bg-red-500/10'
                                    }`}>
                                    {tx.type === 'CREDIT' ? (
                                        <ArrowDownLeft className="w-5 h-5 text-green-400" />
                                    ) : (
                                        <ArrowUpRight className="w-5 h-5 text-red-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-white">
                                        {tx.merchant_name || tx.receiver_name || tx.sender_name || 'Transfer'}
                                    </p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(tx.timestamp).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className={`font-bold ${tx.type === 'CREDIT' ? 'text-green-400' : 'text-white'
                                    }`}>
                                    {tx.type === 'CREDIT' ? '+' : '-'}{formatIndianCurrency(tx.amount)}
                                </p>
                                <div className="flex items-center justify-end gap-1 mt-1">
                                    {tx.status === 'COMPLETED' ? (
                                        <span className="text-xs text-green-500 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Success
                                        </span>
                                    ) : (
                                        <span className="text-xs text-red-500 flex items-center gap-1">
                                            <XCircle className="w-3 h-3" /> {tx.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No recent transactions
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentTransactions;
