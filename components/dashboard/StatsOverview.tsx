import React from 'react';
import { Shield, TrendingUp, AlertTriangle, CheckCircle, ArrowUpRight } from 'lucide-react';
import { formatIndianCurrency } from '../../src/utils/formatters';

interface StatsOverviewProps {
    user: any;
    summary: any;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ user, summary }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Total Balance Card */}
            <div className="relative group overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp className="w-24 h-24 text-cyan-400" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-cyan-400 mb-2">
                        <div className="p-1.5 bg-cyan-500/10 rounded-lg">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium tracking-wide">TOTAL BALANCE</span>
                    </div>

                    <h3 className="text-3xl lg:text-4xl font-bold text-white mb-1">
                        {formatIndianCurrency(user?.balance || 0)}
                    </h3>
                    <p className="text-sm text-gray-400">Available Funds</p>
                </div>

                {/* Decorative Line */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0 opacity-50" />
            </div>

            {/* Trust Score Card */}
            <div className="relative group overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 transition-all duration-300 hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Shield className="w-24 h-24 text-purple-400" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-purple-400 mb-2">
                        <div className="p-1.5 bg-purple-500/10 rounded-lg">
                            <Shield className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium tracking-wide">TRUST SCORE</span>
                    </div>

                    <div className="flex items-end gap-3 mb-1">
                        <h3 className="text-3xl lg:text-4xl font-bold text-white">
                            {summary?.trust_score || 0}
                        </h3>
                        <span className="text-sm text-gray-400 mb-1.5">/ 100</span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        {summary?.trust_score >= 80 ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                                <CheckCircle className="w-3 h-3" /> Excellent
                            </span>
                        ) : summary?.trust_score >= 50 ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                <AlertTriangle className="w-3 h-3" /> Good
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                                <AlertTriangle className="w-3 h-3" /> Risks Detected
                            </span>
                        )}
                        <span className="text-xs text-gray-500">Updated just now</span>
                    </div>
                </div>
            </div>

            {/* Monthly Spending Card */}
            <div className="relative group overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 transition-all duration-300 hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ArrowUpRight className="w-24 h-24 text-blue-400" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                        <div className="p-1.5 bg-blue-500/10 rounded-lg">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium tracking-wide">MONTHLY SPEND</span>
                    </div>

                    <h3 className="text-3xl lg:text-4xl font-bold text-white mb-1">
                        {formatIndianCurrency(summary?.monthly_spending || 0)}
                    </h3>
                    <p className="text-sm text-gray-400">Total Outgoing</p>
                </div>
            </div>
        </div>
    );
};

export default StatsOverview;
