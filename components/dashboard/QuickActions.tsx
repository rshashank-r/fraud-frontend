import React from 'react';
import { Send, CreditCard, Smartphone, Wallet, Plus, Download } from 'lucide-react';
import { Button } from '../../components/ui';

interface QuickActionsProps {
    onAction: (action: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
    const actions = [
        { id: 'transfer', label: 'Transfer', icon: Send, color: 'cyan', desc: 'Send Money' },
        { id: 'pay', label: 'Payments', icon: CreditCard, color: 'purple', desc: 'Pay Bills' },
        { id: 'scan', label: 'Scan QR', icon: Smartphone, color: 'blue', desc: 'Scan & Pay' },
        { id: 'add_money', label: 'Add Money', icon: Plus, color: 'green', desc: 'Top-up' },
    ];

    return (
        <div className="mb-8">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {actions.map((action) => (
                    <button
                        key={action.id}
                        onClick={() => onAction(action.id)}
                        className="group relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 text-left transition-all duration-300 hover:border-cyan-500/30 hover:shadow-lg"
                    >
                        <div className={`p-3 rounded-lg bg-${action.color}-500/10 w-fit mb-3 group-hover:scale-110 transition-transform duration-300`}>
                            <action.icon className={`w-6 h-6 text-${action.color}-400`} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-200">{action.label}</p>
                            <p className="text-xs text-gray-500 mt-1">{action.desc}</p>
                        </div>

                        {/* Hover Glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    </button>
                ))}
            </div>

            <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .group:hover .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
        </div>
    );
};

export default QuickActions;
