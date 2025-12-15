# FraudGuard Frontend 💻

A modern, responsive React + TypeScript + Vite application for the FraudGuard platform. Features dual dashboards (User & Admin), enhanced device security detection, real-time fraud monitoring, and advanced security visualizations.

## 🚀 Key Features

### **User Dashboard**
- **Multi-Payment Support**: UPI, Card, Net Banking, Wallet payments
- **Transaction History**: Paginated view with fraud score details and explanations
- **Security Management**: 2FA/TOTP setup, device management, password breach alerts
- **Real-Time Notifications**: In-app and email alerts for transactions and security events
- **Card Management**: Save cards, lock/unlock, set daily limits
- **Travel Notices**: Submit travel plans to prevent false fraud flags
- **Dispute Resolution**: File disputes for blocked transactions

### **Admin Dashboard**
- **Real-Time Stats**: Users, transactions, fraud rate, locked accounts
- **Transaction Management**: Search, filter, approve/reject, refund
- **User Management**: View profiles, lock/unlock accounts, trust scores
- **Fraud Rules Engine**: Create and manage dynamic fraud detection rules
- **Security Monitoring**: View security events, IP reputation, device analysis
- **Analytics**: Risk distribution, fraud trends, geographic analysis
- **Dispute Resolution**: Review and process user disputes

### **Enhanced Security Features** 🆕
- **Device Detection**: Automatically detect developer tools, emulators, and rooted devices
- **Enhanced Fingerprinting**: Canvas, WebGL, browser, and OS-level identification
- **Security Alerts**: Clear user-facing messages for blocked login attempts
- **Smart Error Handling**: Distinguish between login denial and account freeze
- **Risk-Based UX**: Dynamic authentication flows based on risk assessment

## 🛠️ Setup & Installation

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Configuration**
Update `constants.ts` with your backend URL:
```typescript
export const API_BASE_URL = "https://your-backend-url.com";
// For local development: "http://localhost:5000"
```

### 3. **Run Development Server**
```bash
npm run dev
```
App runs on `http://localhost:3000`

### 4. **Build for Production**
```bash
npm run build
```

## 📂 Project Structure

```
fraud-frontend/
├── pages/
│   ├── Auth.tsx                # Login/Register with security checks
│   ├── UserDashboard.tsx       # Main user interface
│   └── AdminDashboard.tsx      # Admin monitoring console
├── components/
│   ├── ui/                     # Reusable components
│   ├── Captcha.tsx             # CAPTCHA verification
│   └── SecurePayment.tsx       # Payment form
├── services/
│   └── api.ts                  # Axios with security interceptors
├── utils/
│   └── securityUtils.ts        # Device detection & fingerprinting
├── context/
│   └── AuthContext.tsx         # Authentication state
└── constants.ts                # API configuration
```

## 🔒 Security Features

### **Device Security Detection** 🆕
```typescript
// Developer Tools Detection
- Window size delta analysis
- Debugger timing checks
- Console property detection

// Emulator/Bot Detection
- WebDriver flag checking
- Automation framework detection
- Headless browser indicators
- Plugin count validation

// Rooted Device Detection
- Android root indicators
- iOS jailbreak detection
- UserAgent pattern analysis
```

### **Enhanced Fingerprinting**
Collects comprehensive device data:
- **Browser**: Name, version, user agent, platform
- **OS**: Name, version, architecture
- **Hardware**: Canvas fingerprint (rendering signature)
- **Graphics**: WebGL fingerprint (GPU hash)
- **Security Flags**: Developer tools, emulator, root status
- **Preferences**: Timezone, language, screen resolution

### **Security Interceptors**
All API requests include:
- JWT authorization tokens
- Client timezone headers
- Screen resolution data
- WebDriver detection flags
- Automatic token refresh
- Session expiry handling

## 🔑 Key Workflows

### **Login Flow**
1. User enters credentials
2. Frontend collects enhanced fingerprint (browser, OS, canvas, WebGL, security flags)
3. Security checks performed:
   - ❌ Developer tools → Access denied  
   - ❌ Emulator detected → Access denied
   - ❌ Rooted device → Access denied
   - ⚠️ VPN detected → Requires OTP
4. Backend calculates risk score
5. Dynamic authentication:
   - Low risk (< 0.2): ✅ Direct login
   - Medium risk (0.2-0.5): 📧 Email OTP required
   - High risk (0.5-0.8): 🔐 Email OTP + new device verification
   - Critical risk (> 0.8): 🚫 Access temporarily denied

### **Payment Flow**
1. User selects payment method and enters details
2. Frontend requests GPS location (user permission)
3. Transaction submitted with nonce and fingerprint
4. Backend fraud analysis
5. Based on risk score:
   - **Low**: Instant approval
   - **Medium**: OTP verification
   - **High**: Transaction blocked, fraud alert sent

### **Admin Operations**
- Monitor all transactions in real-time
- Create/modify fraud detection rules
- Review security events and IP reputation
- Approve/reject unlock requests
- Manage user accounts and trust scores

## 🌐 Deployment

### **Production URL**: Connected to `https://fraud-backend-y9xq.onrender.com`

### **Deployment Steps**
1. Update `constants.ts` with production backend URL
2. Build: `npm run build`
3. Deploy `dist/` folder to:
   - **Vercel**: `vercel --prod`
   - **Netlify**: Drag & drop `dist/` folder
   - **Render**: Connect GitHub repo with build command `npm run build`

## 📱 Responsive Design

- **Desktop**: Full sidebar navigation with expanded features
- **Tablet**: Collapsed sidebar with icons
- **Mobile**: Bottom navigation bar or hamburger menu
- **Touch-Optimized**: Large tap targets, swipe gestures

## 🎨 UI/UX Highlights

- **Modern Design**: Glassmorphism effects, gradient accents
- **Smooth Animations**: Framer Motion for transitions
- **Dark Theme**: Eye-friendly color palette
- **Accessibility**: ARIA labels, keyboard navigation
- **Loading States**: Skeleton screens, progress indicators

## 📊 Performance

- **Initial Load**: < 1s (code splitting)
- **Route Transitions**: < 100ms
- **API Response Handling**: Optimistic UI updates
- **Bundle Size**: < 500KB (gzipped)

## 🔧 Development Tools

- **TypeScript**: Full type safety
- **ESLint**: Code quality enforcement
- **Vite**: Fast HMR and builds
- **React DevTools**: Component inspection
- **Axios DevTools**: Network request monitoring

## ⚠️ Troubleshooting

- **Login Issues**: Check backend URL in `constants.ts`, verify CORS settings
- **White Screen**: Check browser console for errors, clear cache
- **API Errors**: Verify backend is running, check network tab
- **Fingerprinting Errors**: Ensure browser allows Canvas/WebGL access
- **Build Errors**: Delete `node_modules` and `package-lock.json`, reinstall

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Pull requests welcome! Please ensure:
- TypeScript types are properly defined
- Components follow existing patterns
- Security features are tested
- UI remains responsive across devices
