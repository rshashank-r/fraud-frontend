import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, CheckCircle, Filter, RefreshCw } from 'lucide-react';

interface SecurityEvent {
    id: number;
    event_type: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    details: string;
    user_id: string | null;
    ip_address: string | null;
    timestamp: string;
    resolved: boolean;
    resolution_notes?: string;
}

export const SecurityEventsTab: React.FC = () => {
    const [events, setEvents] = useState<SecurityEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        severity: '',
        event_type: '',
        resolved: false
    });

    useEffect(() => {
        fetchEvents();
    }, [filters]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (filters.severity) params.append('severity', filters.severity);
            if (filters.event_type) params.append('event_type', filters.event_type);
            params.append('resolved', String(filters.resolved));

            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/security-events?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            setEvents(data.events || []);
        } catch (error) {
            console.error('Failed to fetch security events:', error);
        } finally {
            setLoading(false);
        }
    };

    const resolveEvent = async (eventId: number) => {
        const notes = prompt('Enter resolution notes:');
        if (!notes) return;

        try {
            const token = localStorage.getItem('token');
            await fetch(`${import.meta.env.VITE_API_URL}/admin/security-events/${eventId}/resolve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ notes })
            });

            fetchEvents(); // Refresh list
        } catch (error) {
            console.error('Failed to resolve event:', error);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'bg-red-50 border-red-300 text-red-800';
            case 'WARNING': return 'bg-yellow-50 border-yellow-300 text-yellow-800';
            case 'INFO': return 'bg-blue-50 border-blue-300 text-blue-800';
            default: return 'bg-gray-50 border-gray-300 text-gray-800';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return '🚨';
            case 'WARNING': return '⚠️';
            case 'INFO': return 'ℹ️';
            default: return '📋';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-cyan-600" />
                    <h2 className="text-2xl font-bold text-gray-800">Security Events</h2>
                </div>
                <button
                    onClick={fetchEvents}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-700">Filters</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                        <select
                            value={filters.severity}
                            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="">All Severities</option>
                            <option value="INFO">Info</option>
                            <option value="WARNING">Warning</option>
                            <option value="CRITICAL">Critical</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                        <select
                            value={filters.event_type}
                            onChange={(e) => setFilters({ ...filters, event_type: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="">All Types</option>
                            <option value="LOGIN_ANOMALY">Login Anomaly</option>
                            <option value="DEVICE_MISMATCH">Device Mismatch</option>
                            <option value="REPLAY_ATTACK">Replay Attack</option>
                            <option value="IMPOSSIBLE_TRAVEL">Impossible Travel</option>
                            <option value="ACCOUNT_FREEZE">Account Freeze</option>
                            <option value="BOT_DETECTED">Bot Detected</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={String(filters.resolved)}
                            onChange={(e) => setFilters({ ...filters, resolved: e.target.value === 'true' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="false">Unresolved</option>
                            <option value="true">Resolved</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Events List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-600 border-t-transparent"></div>
                        <p className="mt-2 text-gray-600">Loading events...</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <p className="text-gray-600">No security events found</p>
                    </div>
                ) : (
                    events.map((event) => (
                        <div
                            key={event.id}
                            className={`p-4 rounded-lg border-2 ${getSeverityColor(event.severity)}`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-2xl">{getSeverityIcon(event.severity)}</span>
                                        <h4 className="font-semibold text-lg">
                                            {event.event_type.replace(/_/g, ' ')}
                                        </h4>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${event.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                                                event.severity === 'WARNING' ? 'bg-yellow-600 text-white' :
                                                    'bg-blue-600 text-white'
                                            }`}>
                                            {event.severity}
                                        </span>
                                    </div>

                                    <p className="text-sm mb-2">{event.details}</p>

                                    <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                                        <span>📅 {new Date(event.timestamp).toLocaleString()}</span>
                                        {event.ip_address && <span>🌐 IP: {event.ip_address}</span>}
                                        {event.user_id && <span>👤 User: {event.user_id.slice(0, 8)}...</span>}
                                    </div>

                                    {event.resolved && event.resolution_notes && (
                                        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm">
                                            <p className="font-medium text-green-800">✅ Resolved</p>
                                            <p className="text-green-700">{event.resolution_notes}</p>
                                        </div>
                                    )}
                                </div>

                                {!event.resolved && (
                                    <button
                                        onClick={() => resolveEvent(event.id)}
                                        className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                                    >
                                        Resolve
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SecurityEventsTab;
