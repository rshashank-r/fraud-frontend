# FraudGuard Frontend 💻

A modern, responsive React + Vite application for the FraudGuard platform. It provides separate dashboards for Users (Banking/Payments) and Admins (Monitoring/Rules), featuring real-time updates and advanced security visualizations.

## 🚀 Features

- **Double Dashboard Architecture**:
  - **User Dashboard**: Bank transfers context, 2FA setup, Transaction History, Notifications.
  - **Admin Dashboard**: Real-time stats, Fraud Rule management, User/Transaction Search & pagination.
- **Security UX**:
  - **Client Fingerprinting**: Sends Screen/Timezone/Webdriver data to backend.
  - **Smart Auth**: Immediate redirect on session expiry.
  - **2FA Nudge**: Gentle modals encouraging security adoption.
- **Rich UI**:
  - Built with **Tailwind CSS** + **Lucide Icons**.
  - Glassmorphism effects and smooth animations (Framer Motion / CSS).
  - Mobile-responsive layouts.

## 🛠️ Setup & Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file (optional if defaults work):
   ```env
   VITE_API_URL=http://localhost:5000
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   App runs on `http://localhost:5173`.

## 📂 Project Structure

- `src/pages`:
  - `UserDashboard.tsx`: Main user interface.
  - `AdminDashboard.tsx`: Admin monitoring console.
  - `Auth.tsx`: Login/Register flows.
- `src/services/`:
  - `api.ts`: Axios configuration with Interceptors and Security Headers.
- `src/components/ui/`: Reusable UI components (Cards, Buttons, Inputs).

## 🔑 Key Workflows

- **Login**: Redirects to `/dashboard` (User) or `/admin` (Admin) based on role.
- **Payment**: Supports UPI, Card, Netbanking. Includes OTP/2FA verification steps.
- **Admin Resolve**: Admins can approve/reject "Unlock Requests" directly from the dashboard.

## 📱 Mobile Support
The application is fully responsive. The sidebar collapses into a bottom/hamburger menu on mobile devices.
