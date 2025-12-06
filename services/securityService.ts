import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { UAParser } from 'ua-parser-js';

// ✅ Export the interface
export interface DeviceFingerprint {
  visitorId: string;
  confidence: {
    score: number;
  };
  components: any;
  isVPN: boolean;
  isEmulator: boolean;
  isSuspicious: boolean;
  browserInfo: any;
  incognito?: boolean;
}

class SecurityService {
  private static fpPromise: Promise<any> | null = null;
  private static requestCounts: Map<string, { count: number; timestamp: number }> = new Map();

  // Initialize Fingerprint
  static async initFingerprint() {
    if (!this.fpPromise) {
      this.fpPromise = FingerprintJS.load();
    }
    return this.fpPromise;
  }

  // Get Device Fingerprint with VPN & Emulator Detection
  static async getDeviceFingerprint(): Promise<DeviceFingerprint> {
    try {
      const fp = await this.initFingerprint();
      const result = await fp.get();
      const parser = new UAParser();
      const browserInfo = parser.getResult();

      // VPN Detection Heuristics
      const isVPN = this.detectVPN(result.components);

      // Emulator Detection
      const isEmulator = this.detectEmulator(result.components, browserInfo);

      // Overall Suspicion Score (only VPN or Emulator)
      const isSuspicious = isVPN || isEmulator;

      return {
        visitorId: result.visitorId,
        confidence: {
          score: result.confidence.score
        },
        components: result.components,
        isVPN,
        isEmulator,
        isSuspicious,
        browserInfo,
        incognito: isVPN
      };
    } catch (error) {
      console.error('Fingerprint Error:', error);
      return {
        visitorId: 'unknown',
        confidence: {
          score: 0
        },
        components: {},
        isVPN: false,
        isEmulator: false,
        isSuspicious: false,
        browserInfo: {},
        incognito: false
      };
    }
  }

  // VPN Detection
  private static detectVPN(components: any): boolean {
    const indicators: boolean[] = [];

    // 1. Timezone Mismatch
    if (components.timezone?.value) {
      const reportedTz = components.timezone.value;
      const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      indicators.push(reportedTz !== browserTz);
    }

    // 2. Language Mismatch
    if (components.languages?.value) {
      const languages = components.languages.value;
      const navigatorLang = navigator.language;
      indicators.push(!languages.includes(navigatorLang));
    }

    // VPN detected if 2+ indicators are true
    return indicators.filter(Boolean).length >= 2;
  }

  // Emulator Detection
  private static detectEmulator(components: any, browserInfo: any): boolean {
    const indicators: boolean[] = [];

    // 1. Check for common emulator user agents
    const emulatorAgents = [
      'Android SDK built for x86',
      'Genymotion',
      'Android Emulator',
      'BlueStacks',
      'NoxPlayer',
      'MEmu',
      'LDPlayer'
    ];

    const userAgent = navigator.userAgent;
    indicators.push(emulatorAgents.some(agent => userAgent.includes(agent)));

    // 2. Hardware Concurrency (Emulators often have unusual values)
    const cores = navigator.hardwareConcurrency;
    if (cores) {
      indicators.push(cores === 1 || cores > 16);
    }

    // 3. Touch Support Mismatch
    const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);
    if (isMobile && !hasTouchSupport) {
      indicators.push(true);
    }

    // 4. WebGL Vendor (Emulators often use generic renderers)
    if (components.webgl?.value) {
      const renderer = components.webgl.value.renderer || '';
      const emulatorRenderers = ['llvmpipe', 'SwiftShader', 'VMware', 'VirtualBox'];
      indicators.push(emulatorRenderers.some(emu => renderer.includes(emu)));
    }

    // Emulator detected if 2+ indicators are true
    return indicators.filter(Boolean).length >= 2;
  }

  // Rate Limiting
  static checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.requestCounts.get(identifier);

    if (!record || now - record.timestamp > windowMs) {
      this.requestCounts.set(identifier, { count: 1, timestamp: now });
      return true;
    }

    if (record.count >= maxRequests) {
      console.warn(`🚨 Rate limit exceeded for ${identifier}`);
      return false;
    }

    record.count++;
    return true;
  }

  // Clear old rate limit records
  static cleanupRateLimits() {
    const now = Date.now();
    const windowMs = 60000;
    for (const [key, record] of this.requestCounts.entries()) {
      if (now - record.timestamp > windowMs) {
        this.requestCounts.delete(key);
      }
    }
  }

  // Get WebRTC Local IP
  static async getWebRTCIP(): Promise<string[]> {
    return new Promise((resolve) => {
      const ips: string[] = [];
      const RTCPeerConnection = (window as any).RTCPeerConnection ||
        (window as any).webkitRTCPeerConnection ||
        (window as any).mozRTCPeerConnection;

      if (!RTCPeerConnection) {
        resolve([]);
        return;
      }

      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel('');
      pc.createOffer().then((offer: any) => pc.setLocalDescription(offer));

      pc.onicecandidate = (event: any) => {
        if (!event || !event.candidate || !event.candidate.candidate) {
          resolve(ips);
          return;
        }

        const match = /([0-9]{1,3}\.){3}[0-9]{1,3}/.exec(event.candidate.candidate);
        if (match) {
          ips.push(match[0]);
        }
      };

      setTimeout(() => {
        pc.close();
        resolve(ips);
      }, 1000);
    });
  }
}

// ✅ Export both the class and convenience function
export default SecurityService;

// ✅ Export convenience function for easier imports
export const getDeviceFingerprint = () => SecurityService.getDeviceFingerprint();
export const checkRateLimit = (identifier: string, maxRequests?: number, windowMs?: number) => 
  SecurityService.checkRateLimit(identifier, maxRequests, windowMs);
