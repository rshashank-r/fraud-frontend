import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Lock, Brain, TrendingUp, Users, CheckCircle,
  ArrowRight, Mail, Phone, MapPin, Menu, X, Zap,
  Eye, DollarSign, Globe, Award, Star, CreditCard,
  Smartphone, Bell, BarChart3, Wallet, ArrowUpRight
} from 'lucide-react';
import { Button } from '../components/ui';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1400ms' }}></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/95 backdrop-blur-lg border-b border-cyan-500/20 shadow-xl' : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-gradient-to-br from-cyan-500 to-purple-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-lg">
                <Shield className="w-5 h-5 sm:w-6 md:w-8 sm:h-6 md:h-8" />
              </div>
              <span className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                SecureBank
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              <a href="#features" className="text-gray-300 hover:text-cyan-400 transition-colors">Features</a>
              <a href="#security" className="text-gray-300 hover:text-cyan-400 transition-colors">Security</a>
              <a href="#about" className="text-gray-300 hover:text-cyan-400 transition-colors">About</a>
              <a href="#contact" className="text-gray-300 hover:text-cyan-400 transition-colors">Contact</a>
              <Button
                onClick={() => navigate('/login')}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-600 px-6 py-2"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 px-6 py-2 shadow-lg"
              >
                Open Account
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
            }`}
        >
          <div className="bg-slate-900/98 backdrop-blur-lg border-t border-cyan-500/20">
            <div className="px-4 py-6 space-y-4">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-300 hover:text-cyan-400 transition-colors">Features</a>
              <a href="#security" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-300 hover:text-cyan-400 transition-colors">Security</a>
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-300 hover:text-cyan-400 transition-colors">About</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-300 hover:text-cyan-400 transition-colors">Contact</a>
              <div className="pt-4 space-y-2">
                <Button onClick={() => navigate('/login')} className="w-full bg-slate-800 border border-slate-600">
                  Login
                </Button>
                <Button onClick={() => navigate('/register')} className="w-full bg-gradient-to-r from-cyan-600 to-purple-600">
                  Open Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 lg:pt-40 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 sm:space-y-8 z-10 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-xs sm:text-sm text-cyan-300">AI-Powered Banking Platform</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Banking with <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Uncompromised Security
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Experience secure, instant banking powered by advanced AI fraud detection.
                Your money, protected 24/7 with military-grade encryption.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg group shadow-xl"
                >
                  Open Free Account
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg"
                >
                  Explore Features
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8">
                {[
                  { value: '99.7%', label: 'Fraud Detection' },
                  { value: '<50ms', label: 'Processing' },
                  { value: '24/7', label: 'Protection' }
                ].map((stat, i) => (
                  <div key={i} className="text-center lg:text-left">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-cyan-400">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-gray-400 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Interactive Card Visual */}
            <div className="relative h-[300px] sm:h-[400px] lg:h-[500px]">
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Main Card */}
                <div className="relative w-full max-w-[280px] sm:max-w-sm">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>
                  <div
                    className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl transform hover:scale-105 transition-all duration-300"
                    style={{ animation: 'float 3s ease-in-out infinite' }}
                  >
                    <div className="flex justify-between items-start mb-6 sm:mb-8">
                      <div>
                        <p className="text-gray-400 text-xs sm:text-sm">Total Balance</p>
                        <p className="text-2xl sm:text-3xl font-bold mt-1">₹1,24,500</p>
                      </div>
                      <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
                    </div>

                    <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-400">Card Number</span>
                        <span>**** **** **** 4829</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-400">Valid Thru</span>
                        <span>12/28</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-400">JOHN DOE</p>
                      </div>
                      <Lock className="w-5 h-5 text-purple-400" />
                    </div>

                    {/* Security Badge */}
                    <div className="absolute -top-3 -right-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-2 sm:p-3 shadow-lg">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                </div>

                {/* Floating Icons */}
                <div className="hidden sm:block absolute top-10 left-0 bg-slate-800/80 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-3 shadow-xl animate-bounce" style={{ animationDelay: '0.5s' }}>
                  <Shield className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="hidden sm:block absolute bottom-10 right-0 bg-slate-800/80 backdrop-blur-sm border border-purple-500/30 rounded-xl p-3 shadow-xl animate-bounce" style={{ animationDelay: '1s' }}>
                  <Lock className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Features Showcase */}
      <section id="features" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              Banking Made Secure & Simple
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto px-4">
              Advanced technology meets seamless user experience
            </p>
          </div>

          {/* Interactive Feature Tabs REMOVED for simplicity */}

          {/* Feature Grid */}

          {/* Feature Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                icon: CreditCard,
                title: 'Virtual Cards',
                description: 'Create instant virtual cards for secure online shopping',
                color: 'cyan'
              },
              {
                icon: Smartphone,
                title: 'Mobile Banking',
                description: 'Bank on-the-go with our intuitive mobile app',
                color: 'purple'
              },
              {
                icon: Bell,
                title: 'Smart Alerts',
                description: 'Real-time notifications for every transaction',
                color: 'cyan'
              },
              {
                icon: BarChart3,
                title: 'Spending Analytics',
                description: 'Track and analyze your spending patterns',
                color: 'purple'
              },
              {
                icon: Wallet,
                title: 'Multi-Currency',
                description: 'Support for international transactions',
                color: 'cyan'
              },
              {
                icon: Users,
                title: 'Easy Transfers',
                description: 'Send money to anyone instantly via UPI, card, or account',
                color: 'purple'
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="group bg-slate-900 border border-slate-700 hover:border-cyan-500/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className={`inline-flex p-2 sm:p-3 rounded-lg sm:rounded-xl bg-${feature.color}-500/10 mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 sm:w-8 sm:h-8 text-${feature.color}-400`} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {[
                  { icon: Shield, title: '256-bit Encryption', desc: 'Bank-level security' },
                  { icon: Lock, title: 'Multi-Factor Auth', desc: 'Extra layer of protection' },
                  { icon: Eye, title: 'Real-time Monitoring', desc: '24/7 fraud detection' },
                  { icon: CheckCircle, title: 'Secure Transactions', desc: '100% safe payments' }
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-slate-900 border border-slate-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-cyan-500/50 transition-all hover:transform hover:scale-105"
                  >
                    <item.icon className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400 mb-3 sm:mb-4" />
                    <h4 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">{item.title}</h4>
                    <p className="text-xs sm:text-sm text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                Your Security is Our <span className="text-cyan-400">Priority</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-6 sm:mb-8">
                We use advanced AI and machine learning to protect your money from fraud and unauthorized access.
                Every transaction is monitored in real-time to ensure maximum security.
              </p>
              <div className="space-y-3 sm:space-y-4">
                {[
                  'AI-powered fraud detection',
                  'End-to-end encryption',
                  'Biometric authentication',
                  'Instant transaction alerts'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 justify-center lg:justify-start">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-xl sm:text-2xl font-bold mb-2">Trusted by Thousands</h3>
            <p className="text-sm sm:text-base text-gray-400">Join our growing community of secure banking users</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { value: '50K+', label: 'Active Users' },
              { value: '₹500Cr+', label: 'Transactions' },
              { value: '99.9%', label: 'Uptime' },
              { value: '4.9★', label: 'Rating' }
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 sm:p-6 bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-700">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-400 mb-1 sm:mb-2">{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            Ready to Experience Secure Banking?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-6 sm:mb-8 px-4">
            Open your free account in minutes and start banking with complete peace of mind
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12">
            <Button
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg shadow-xl"
            >
              Open Free Account
            </Button>
            <Button
              onClick={() => navigate('/login')}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg"
            >
              Login to Account
            </Button>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 pt-8 sm:pt-12 border-t border-slate-800">
            {[
              { icon: Mail, text: 'support@securebank.com' },
              { icon: Phone, text: '1800-SECURE-BANK' },
              { icon: MapPin, text: 'Mumbai, India' }
            ].map((contact, i) => (
              <div key={i} className="flex items-center justify-center gap-2 sm:gap-3 text-gray-400 hover:text-cyan-400 transition-colors">
                <contact.icon className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm">{contact.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 sm:py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-br from-cyan-500 to-purple-600 p-1.5 rounded-lg">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-base sm:text-lg font-bold">SecureBank</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 text-center">
              &copy; 2025 SecureBank. All rights reserved. | Secured by AI
            </p>
            <div className="flex gap-4 sm:gap-6 text-gray-400 text-xs sm:text-sm">
              <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default Landing;
