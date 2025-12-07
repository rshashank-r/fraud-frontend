import React from 'react';
import {
    Shield, CreditCard, Send, Bell, User, Lock,
    Home, BarChart3, Settings, LogOut, Menu, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    activeTab,
    setActiveTab,
    isOpen,
    setIsOpen,
    onLogout
}) => {
    const navigate = useNavigate();

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: Home },
        { id: 'transactions', label: 'Transactions', icon: BarChart3 },
        { id: 'cards', label: 'My Cards', icon: CreditCard },
        { id: 'transfer', label: 'Transfer', icon: Send },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'profile', label: 'Profile', icon: User },
        // { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 
        bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 
        transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                <div className="flex flex-col h-full p-6">
                    {/* Logo */}
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="bg-gradient-to-br from-cyan-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-cyan-500/20">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                SecureBank
                            </span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="lg:hidden p-2 text-gray-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group
                  ${activeTab === item.id
                                        ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 text-white shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                                        : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                                    }
                `}
                            >
                                <item.icon
                                    className={`w-5 h-5 transition-colors duration-300
                    ${activeTab === item.id ? 'text-cyan-400' : 'text-gray-500 group-hover:text-cyan-400'}
                  `}
                                />
                                <span className="font-medium">{item.label}</span>

                                {/* Active Indicator */}
                                {activeTab === item.id && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* User Profile / Logout */}
                    <div className="pt-6 border-t border-slate-800">
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
