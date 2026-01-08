import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Lock, Zap, ArrowRight, Menu, X,
  Globe, CreditCard, Smartphone, Bell,
  BarChart3, Wallet, Users, Layout, ChevronRight, CheckCircle,
  Play, Hexagon, Fingerprint
} from 'lucide-react';
import { Button } from '../components/ui';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Shield,
      title: "AI Fraud Protection",
      desc: "Real-time transaction monitoring with 99.9% accuracy.",
      color: "from-cyan-400 to-blue-500"
    },
    {
      icon: Zap,
      title: "Instant Transfers",
      desc: "Lightning fast global payments with zero latency.",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: Lock,
      title: "Bank-Grade Security",
      desc: "256-bit encryption and biometric authentication.",
      color: "from-emerald-400 to-green-500"
    }
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-cyan-500/30 overflow-x-hidden font-sans">

      {/* === AURORA BACKGROUND === */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] mix-blend-screen animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[30%] w-[700px] h-[700px] bg-blue-900/10 rounded-full blur-[150px] mix-blend-screen animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.2]"></div>
      </div>

      {/* === NAVIGATION === */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/50 backdrop-blur-2xl border-b border-white/5 py-4' : 'bg-transparent py-6'
        }`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-black p-2 rounded-lg border border-white/10">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight">SecureBank</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Security', 'About'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                {item}
              </a>
            ))}
            <div className="h-4 w-px bg-white/10"></div>
            <button onClick={() => navigate('/login')} className="text-sm font-bold text-white hover:text-cyan-400 transition-colors">
              Log In
            </button>
            <Button
              onClick={() => navigate('/register')}
              className="bg-white text-black hover:bg-gray-100 font-bold px-6 py-2.5 rounded-full shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all hover:scale-105"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* === MOBILE MENU === */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-24 px-6 md:hidden">
          <div className="flex flex-col gap-6 text-center">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">Features</a>
            <a href="#security" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">Security</a>
            <div className="h-px bg-white/10 w-full my-4"></div>
            <Button onClick={() => navigate('/login')} className="w-full bg-white/10 text-white py-4 text-lg hover:bg-white/20 transition-colors">Log In</Button>
            <Button onClick={() => navigate('/register')} className="w-full bg-cyan-500 py-4 text-lg">Get Started</Button>
          </div>
        </div>
      )}

      {/* === HERO SECTION === */}
      <section className="relative pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: Content */}
          <div className="space-y-8 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-xs font-semibold tracking-wider uppercase text-cyan-300">New Feature: AI Insights</span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-bold leading-[1.1] tracking-tight">
              Banking for the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x">
                Digital Age
              </span>
            </h1>

            <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
              Experience the future of finance with our AI-powered security systems.
              Zero fraud liability, instant transfers, and insights that help you grow.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => navigate('/register')}
                className="h-14 px-8 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-lg shadow-lg shadow-cyan-500/25 flex items-center gap-2 group"
              >
                Open Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="h-14 px-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold backdrop-blur-md flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                How it Works
              </Button>
            </div>

            <div className="pt-8 flex items-center gap-8 border-t border-white/5">
              <div>
                <h3 className="text-3xl font-bold text-white">99.9%</h3>
                <p className="text-sm text-gray-500 uppercase tracking-widest">Uptime</p>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div>
                <h3 className="text-3xl font-bold text-white">50M+</h3>
                <p className="text-sm text-gray-500 uppercase tracking-widest">Protected</p>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div>
                <h3 className="text-3xl font-bold text-white">0s</h3>
                <p className="text-sm text-gray-500 uppercase tracking-widest">Latency</p>
              </div>
            </div>
          </div>

          {/* Right: 3D Card Visual */}
          <div className="relative perspective-1000 group">
            {/* Glow behind card */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-[2rem] blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>

            {/* The Card */}
            <div className="relative bg-gradient-to-br from-slate-900/90 to-black/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl transform rotate-y-12 rotate-x-6 hover:rotate-0 transition-transform duration-700 ease-out preserve-3d">
              <div className="flex justify-between items-start mb-12">
                <Shield className="w-12 h-12 text-cyan-400" />
                <Fingerprint className="w-12 h-12 text-gray-600" />
              </div>

              <div className="space-y-2 mb-12">
                <p className="text-2xl font-mono tracking-widest text-gray-400">4582  ••••  ••••  9928</p>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Card Holder</p>
                  <p className="text-lg font-bold text-white">SHASHANK G</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Expires</p>
                  <p className="text-lg font-bold text-white">12/29</p>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -right-8 top-20 bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-xl flex items-center gap-3 animate-float">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Transaction Verified</p>
                  <p className="text-sm font-bold text-white">+$5,240.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === FEATURES GRID === */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Built for the <span className="text-cyan-400">Bold</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We've reimagined the banking stack from the ground up.
              Every feature is designed to give you more control, security, and peace of mind.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} p-0.5 mb-6 group-hover:scale-110 transition-transform`}>
                  <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>

                <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 rounded-3xl transition-colors pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === TRUST / STATS === */}
      <section className="py-20 border-y border-white/5 bg-black/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              ['Active Users', '2M+'],
              ['Countries', '150+'],
              ['Transactions', '$10B+'],
              ['Trust Score', '4.9/5']
            ].map(([label, value]) => (
              <div key={label}>
                <h4 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 mb-2">{value}</h4>
                <p className="text-gray-500 font-medium uppercase tracking-widest text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === CTA SECTION === */}
      <section className="py-32 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/10 to-transparent"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready to start your journey?</h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Join millions of users who trust SecureBank for their financial future.
            Open an account in less than 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button
              onClick={() => navigate('/register')}
              className="h-16 px-10 rounded-full bg-white text-black hover:bg-gray-200 text-lg font-bold shadow-2xl transition-all hover:scale-105"
            >
              Create Free Account
            </Button>
          </div>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="py-12 border-t border-white/10 bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-gray-600" />
            <span className="font-bold text-gray-500">SecureBank &copy; 2025</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-600">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* === STYLES === */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .perspective-1000 {
           perspective: 1000px;
        }
        .preserve-3d {
           transform-style: preserve-3d;
        }
        @keyframes float {
           0%, 100% { transform: translateY(0); }
           50% { transform: translateY(-20px); }
        }
        .animate-float {
           animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Landing;
