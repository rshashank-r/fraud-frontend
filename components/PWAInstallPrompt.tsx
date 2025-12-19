import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const PWAInstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Check if already installed as PWA
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as any).standalone
            || document.referrer.includes('android-app://');

        if (isStandalone) {
            // Already running as PWA, don't show prompt
            return;
        }

        // Check if on mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (!isMobile) {
            // Not on mobile, don't show prompt
            return;
        }

        // Check if user already dismissed the prompt
        const dismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (dismissed === 'true') {
            return;
        }

        // Listen for beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // For iOS (doesn't support beforeinstallprompt)
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        if (isIOS && !isStandalone) {
            setShowPrompt(true);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            // iOS manual instructions
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('PWA installed');
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
        localStorage.setItem('pwa-prompt-dismissed', 'true');
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-prompt-dismissed', 'true');
    };

    if (!showPrompt) return null;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    return (
        <div
            className="fixed bottom-4 left-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-2xl p-4 animate-slide-up"
            style={{ maxWidth: '400px', margin: '0 auto' }}
        >
            <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 text-white/80 hover:text-white"
            >
                <X size={20} />
            </button>

            <div className="mb-3">
                <h3 className="font-bold text-lg mb-1">📱 Install FraudGuard App</h3>
                <p className="text-sm text-white/90">
                    Get faster access and offline support!
                </p>
            </div>

            {isIOS ? (
                <div className="text-xs text-white/80 mb-3 bg-white/10 rounded p-2">
                    <p className="mb-1">To install:</p>
                    <p>1. Tap the Share button <span className="inline-block">⎘</span></p>
                    <p>2. Select "Add to Home Screen"</p>
                </div>
            ) : (
                <button
                    onClick={handleInstallClick}
                    className="w-full bg-white text-purple-600 font-semibold py-2 px-4 rounded-lg hover:bg-purple-50 transition-colors"
                >
                    Install Now
                </button>
            )}

            <button
                onClick={handleDismiss}
                className="w-full mt-2 text-white/80 text-sm hover:text-white"
            >
                Maybe Later
            </button>
        </div>
    );
};

export default PWAInstallPrompt;
