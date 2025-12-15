import React, { useState, useEffect } from 'react';
import { Globe, Ban, RefreshCw, AlertTriangle } from 'lucide-react';

interface IPReputation {
    id: number;
    ip_address: string;
    reputation_score: number;
    fraud_attempts: number;
    successful_transactions: number;
    is_blacklisted: boolean;
    blacklist_reason?: string;
    last_seen: string;
}

export const IPReputationTab: React.FC = () => {
    const [ips, setIPs] = useState<IPReputation[]>([]);
    const [loading, setLoading] = useState(false);
    const [showBlacklistedOnly, setShowBlacklistedOnly] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchIPs();
    }, [page, showBlacklistedOnly]);

    const fetchIPs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                page: String(page),
                per_page: '20',
                blacklisted_only: String(showBlacklistedOnly)
            });

            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/ip-reputation?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            setIPs(data.ips || []);
            setTotalPages(data.pages || 1);
        } catch (error) {
            console.error('Failed to fetch IP reputations:', error);
        } finally {
            setLoading(false);
        }
    };

    const blacklistIP = async () => {
        const ip = prompt('Enter IP address to blacklist:');
        if (!ip) return;

        const reason = prompt('Blacklist reason:');
        if (!reason) return;

        try {
            const token = localStorage.getItem('token');
            await fetch(`${import.meta.env.VITE_API_URL}/admin/ip-reputation/blacklist`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ip_address: ip, reason })
            });

            fetchIPs();
            alert(`IP ${ip} has been blacklisted`);
        } catch (error) {
            console.error('Failed to blacklist IP:', error);
            alert('Failed to blacklist IP');
        }
    };

    const getReputationColor = (score: number) => {
        if (score >= 700) return 'bg-green-500';
        if (score >= 500) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getReputationLabel = (score: number) => {
        if (score >= 700) return 'Excellent';
        if (score >= 500) return 'Good';
        if (score >= 300) return 'Fair';
        if (score >= 100) return 'Poor';
        return 'Very Poor';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Globe className="w-6 h-6 text-cyan-600" />
                    <h2 className="text-2xl font-bold text-gray-800">IP Reputation</h2>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchIPs}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={blacklistIP}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        <Ban className="w-4 h-4" />
                        Blacklist IP
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showBlacklistedOnly}
                        onChange={(e) => {
                            setShowBlacklistedOnly(e.target.checked);
                            setPage(1);
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Show blacklisted IPs only</span>
                </label>
            </div>

            {/* IP Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reputation</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fraud Attempts</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Success TX</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Seen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-600 border-t-transparent"></div>
                                    </td>
                                </tr>
                            ) : ips.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                        No IP addresses found
                                    </td>
                                </tr>
                            ) : (
                                ips.map((ip) => (
                                    <tr key={ip.id} className={ip.is_blacklisted ? 'bg-red-50' : 'hover:bg-gray-50'}>
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-sm font-medium text-gray-900">
                                                {ip.ip_address}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1">
                                                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${getReputationColor(ip.reputation_score)}`}
                                                            style={{ width: `${(ip.reputation_score / 1000) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {ip.reputation_score}/1000
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {getReputationLabel(ip.reputation_score)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {ip.fraud_attempts > 0 ? (
                                                <div className="flex items-center gap-1 text-red-600">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    <span className="text-sm font-medium">{ip.fraud_attempts}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500">0</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-900">{ip.successful_transactions}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {ip.is_blacklisted ? (
                                                <div>
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded text-xs font-medium">
                                                        <Ban className="w-3 h-3" />
                                                        Blacklisted
                                                    </span>
                                                    {ip.blacklist_reason && (
                                                        <p className="text-xs text-gray-600 mt-1">{ip.blacklist_reason}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="inline-flex px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-600">
                                                {new Date(ip.last_seen).toLocaleDateString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IPReputationTab;
