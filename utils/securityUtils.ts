/**
 * Security Utilities for Frontend
 * Handles nonce generation, enhanced fingerprinting, and security features
 */

/**
 * Generate a unique nonce (UUID v4)
 * Used for replay attack prevention
 */
export const generateNonce = (): string => {
    return crypto.randomUUID();
};

/**
 * Detect if developer tools are open
 * Uses multiple detection methods for reliability
 */
const checkDeveloperTools = (): boolean => {
    try {
        // Method 1: Check window size difference (DevTools docked)
        const widthThreshold = 160;
        const heightThreshold = 160;
        if (
            window.outerWidth - window.innerWidth > widthThreshold ||
            window.outerHeight - window.innerHeight > heightThreshold
        ) {
            return true;
        }

        // Method 2: Console detection trick (no debugger statement)
        const devtools = { isOpen: false };
        const element = new Image();
        Object.defineProperty(element, 'id', {
            get: function () {
                devtools.isOpen = true;
                return 'devtools-detector';
            }
        });

        // Only log in development
        if (process.env.NODE_ENV === 'development') {
            console.log('%c', element);
            console.clear();
        }

        return devtools.isOpen;
    } catch (e) {
        return false;
    }
};

/**
 * Detect if running in an emulator or automated browser
 * Checks for WebDriver, headless Chrome, and automation indicators
 */
const checkEmulator = (): boolean => {
    try {
        // Method 1: WebDriver detection (Selenium, Puppeteer)
        if (navigator.webdriver) {
            return true;
        }

        // Method 2: Check for automation properties
        if ((window as any).__nightmare || (window as any)._phantom || (window as any).callPhantom) {
            return true;
        }

        // Method 3: Headless Chrome detection
        if ((navigator as any).webdriver || (navigator as any).__webdriver_script_fn) {
            return true;
        }

        // Method 4: User agent analysis
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('headless') || ua.includes('phantom') || ua.includes('selenium')) {
            return true;
        }

        // Method 5: Check for missing languages (headless browsers)
        if (!navigator.languages || navigator.languages.length === 0) {
            return true;
        }

        // REMOVED: Plugin count check (causes false positives in modern browsers)

        return false;
    } catch (e) {
        return false;
    }
};

/**
 * Detect if device is rooted/jailbroken
 * Note: Browser-based detection is limited; this provides basic checks
 */
const checkRootedDevice = (): boolean => {
    // Note: Browser-based root/jailbreak detection is highly unreliable
    // True detection requires native code access
    // This check is informational only and should not be relied upon
    return false;
};


/**
 * Enhanced Device Fingerprinting
 * Collects browser, OS, canvas, WebGL data for session tracking
 */
export const getEnhancedFingerprint = async (): Promise<any> => {
    const fingerprint: any = {
        // Browser information
        browser_name: getBrowserName(),
        browser_version: getBrowserVersion(),

        // OS information
        os_name: getOSName(),
        os_version: navigator.platform,

        // User preferences
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,

        // Screen information
        screen_resolution: `${window.screen.width}x${window.screen.height}`,

        // Canvas fingerprint
        canvas_fingerprint: await getCanvasFingerprint(),

        // WebGL fingerprint
        webgl_fingerprint: await getWebGLFingerprint(),

        // Security checks
        developer_tools_enabled: checkDeveloperTools(),
        is_emulator: checkEmulator(),
        is_rooted: checkRootedDevice()
    };

    return fingerprint;
};

/**
 * Get browser name from user agent
 */
const getBrowserName = (): string => {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Opera')) return 'Opera';
    return 'Unknown';
};

/**
 * Get browser version
 */
const getBrowserVersion = (): string => {
    const ua = navigator.userAgent;
    const match = ua.match(/(Firefox|Chrome|Safari|Opera|Edg)\/(\d+)/);
    return match ? match[2] : 'Unknown';
};

/**
 * Get OS name from user agent
 */
const getOSName = (): string => {
    const ua = navigator.userAgent;
    if (ua.includes('Win')) return 'Windows';
    if (ua.includes('Mac')) return 'MacOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
};

/**
 * Generate Canvas fingerprint
 * Canvas rendering is hardware/software dependent and very stable
 */
const getCanvasFingerprint = async (): Promise<string> => {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) return 'unsupported';

        // Draw text with various styles
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('FraudGuard 🛡️', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('Security', 4, 17);

        // Get image data and hash it
        const dataURL = canvas.toDataURL();
        return await hashString(dataURL);
    } catch (e) {
        return 'error';
    }
};

/**
 * Generate WebGL fingerprint
 * GPU-specific rendering signatures
 */
const getWebGLFingerprint = async (): Promise<string> => {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!gl) return 'unsupported';

        const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
        if (!debugInfo) return 'no_debug_info';

        const vendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

        const signature = `${vendor}|${renderer}`;
        return await hashString(signature);
    } catch (e) {
        return 'error';
    }
};

/**
 * Hash a string using SHA-256
 */
const hashString = async (str: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
};

/**
 * Get user's geolocation
 * Returns promise with {lat, lon} or null if denied
 */
export const getGeolocation = (): Promise<{ lat: number, lon: number } | null> => {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(null);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                });
            },
            (error) => {
                console.warn('Geolocation denied or unavailable:', error);
                resolve(null);
            },
            {
                timeout: 5000,
                enableHighAccuracy: false
            }
        );
    });
};

/**
 * Track behavioral biometrics
 * Returns typing speed and mouse movement data
 */
export class BiometricsTracker {
    private keystrokes: number[] = [];
    private mouseMovements: { x: number, y: number, timestamp: number }[] = [];

    startTracking() {
        document.addEventListener('keydown', this.handleKeydown);
        document.addEventListener('mousemove', this.handleMousemove);
    }

    stopTracking() {
        document.removeEventListener('keydown', this.handleKeydown);
        document.removeEventListener('mousemove', this.handleMousemove);
    }

    private handleKeydown = () => {
        this.keystrokes.push(Date.now());
        // Keep only last 20 keystrokes
        if (this.keystrokes.length > 20) {
            this.keystrokes.shift();
        }
    };

    private handleMousemove = (e: MouseEvent) => {
        this.mouseMovements.push({
            x: e.clientX,
            y: e.clientY,
            timestamp: Date.now()
        });
        // Keep only last 50 movements
        if (this.mouseMovements.length > 50) {
            this.mouseMovements.shift();
        }
    };

    getBiometrics() {
        // Calculate average typing speed
        let avgTypingSpeed = 0;
        if (this.keystrokes.length > 1) {
            const intervals = [];
            for (let i = 1; i < this.keystrokes.length; i++) {
                intervals.push(this.keystrokes[i] - this.keystrokes[i - 1]);
            }
            avgTypingSpeed = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        }

        // Calculate mouse movement variance
        let mouseVariance = 0;
        if (this.mouseMovements.length > 2) {
            const distances = [];
            for (let i = 1; i < this.mouseMovements.length; i++) {
                const dx = this.mouseMovements[i].x - this.mouseMovements[i - 1].x;
                const dy = this.mouseMovements[i].y - this.mouseMovements[i - 1].y;
                distances.push(Math.sqrt(dx * dx + dy * dy));
            }
            const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
            const variance = distances.map(d => Math.pow(d - avgDistance, 2)).reduce((a, b) => a + b, 0) / distances.length;
            mouseVariance = Math.sqrt(variance);
        }

        return {
            avg_typing_speed_ms: avgTypingSpeed,
            mouse_variance: mouseVariance
        };
    }
}

/**
 * Format risk score for display
 */
export const formatRiskScore = (score: number): {
    level: string;
    color: string;
    emoji: string;
} => {
    if (score < 0.2) {
        return { level: 'Low', color: 'green', emoji: '✅' };
    } else if (score < 0.5) {
        return { level: 'Medium', color: 'yellow', emoji: '⚠️' };
    } else if (score < 0.8) {
        return { level: 'High', color: 'orange', emoji: '🔶' };
    } else {
        return { level: 'Critical', color: 'red', emoji: '🚨' };
    }
};
