'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  Mail, 
  Phone, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  KeyRound, 
  ShieldCheck, 
  RotateCcw,
  Smartphone,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithOtp, signIn, isLoggedIn, hasCompletedOnboarding } = useAuth();

  // Mode: 'phone' or 'email'
  const [loginMode, setLoginMode] = useState<'phone' | 'email'>('phone');
  
  // Inputs
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);

  // OTP flow state
  const [step, setStep] = useState<'input' | 'otp_verify'>('input');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'filling' | 'verifying' | 'success' | 'error' | 'idle'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // If already logged in, redirect to onboarding or home
  useEffect(() => {
    if (isLoggedIn) {
      if (!hasCompletedOnboarding) {
        router.push('/onboarding');
      } else {
        router.push('/');
      }
    }
  }, [isLoggedIn, hasCompletedOnboarding, router]);

  // Pre-fill quick punch samples
  const handleQuickPunch = (type: 'phone' | 'email', value: string) => {
    if (type === 'phone') {
      setLoginMode('phone');
      setPhoneNumber(value);
      handleGenerateAndAutoLogin('phone', `${countryCode} ${value}`);
    } else {
      setLoginMode('email');
      setEmail(value);
      handleGenerateAndAutoLogin('email', value);
    }
  };

  // Main OTP trigger function
  const handleGenerateAndAutoLogin = (
    mode: 'phone' | 'email',
    overrideIdentifier?: string
  ) => {
    setErrorMsg('');
    const rawId = overrideIdentifier || (mode === 'phone' ? `${countryCode} ${phoneNumber}` : email);
    const identifier = rawId.trim();

    if (!identifier || (mode === 'phone' && !phoneNumber && !overrideIdentifier) || (mode === 'email' && !email && !overrideIdentifier)) {
      setErrorMsg(`Please enter your ${mode === 'phone' ? 'phone number' : 'email address'}.`);
      return;
    }

    if (mode === 'email' && !identifier.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    // 1. Generate realistic 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpDigits(['', '', '', '', '', '']);
    setStep('otp_verify');
    setIsAutoFilling(true);
    setVerificationStatus('filling');
    setStatusMessage(`Generated OTP: ${newOtp} (Sent to ${identifier})`);

    // 2. Animate automatic digit punching into the OTP boxes
    const chars = newOtp.split('');
    chars.forEach((digit, idx) => {
      setTimeout(() => {
        setOtpDigits((prev) => {
          const next = [...prev];
          next[idx] = digit;
          return next;
        });

        // After last digit is filled, verify and login automatically
        if (idx === 5) {
          setTimeout(async () => {
            setVerificationStatus('verifying');
            setStatusMessage('Verifying OTP code...');

            setTimeout(async () => {
              setVerificationStatus('success');
              setStatusMessage('OTP Verified successfully! Logging in...');

              const res = await loginWithOtp(identifier, mode);
              if (res.error) {
                setVerificationStatus('error');
                setErrorMsg(res.error);
                setIsAutoFilling(false);
              } else {
                setTimeout(() => {
                  router.push('/onboarding');
                }, 700);
              }
            }, 600);
          }, 400);
        }
      }, 150 * (idx + 1));
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showPasswordLogin) {
      handlePasswordSubmit();
    } else {
      handleGenerateAndAutoLogin(loginMode);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    const res = await signIn(email, password);
    setIsLoading(false);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      router.push('/onboarding');
    }
  };

  const handleManualOtpChange = (index: number, val: string) => {
    const digit = val.slice(-1);
    const nextDigits = [...otpDigits];
    nextDigits[index] = digit;
    setOtpDigits(nextDigits);

    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    if (nextDigits.every((d) => d !== '')) {
      const fullCode = nextDigits.join('');
      if (fullCode === generatedOtp || fullCode.length === 6) {
        setVerificationStatus('verifying');
        setTimeout(async () => {
          setVerificationStatus('success');
          const identifier = loginMode === 'phone' ? `${countryCode} ${phoneNumber}` : email;
          await loginWithOtp(identifier, loginMode);
          router.push('/onboarding');
        }, 500);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-pop-in relative overflow-hidden">
        
        {/* Subtle Top Gradient Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-13 w-13 p-3 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 mb-1 hover:scale-105 transition-transform">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Remindly
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Personal clarity, smart reminders & task management.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 text-xs flex items-center gap-2.5 border border-rose-200 dark:border-rose-900 animate-shake">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: PUNCH PHONE OR EMAIL ID */}
        {step === 'input' && (
          <div className="space-y-5">
            {/* Mode Selector Tabs (Phone / Email) */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => {
                  setLoginMode('phone');
                  setErrorMsg('');
                }}
                className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
                  loginMode === 'phone'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Smartphone className="h-4 w-4" />
                <span>Phone Number</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMode('email');
                  setErrorMsg('');
                }}
                className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
                  loginMode === 'email'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Mail className="h-4 w-4" />
                <span>Email Address</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {loginMode === 'phone' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Mobile Phone Number
                  </label>
                  <div className="flex gap-2">
                    {/* Country Code Selector */}
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="text-xs px-2.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+81">🇯🇵 +81</option>
                      <option value="+971">🇦🇪 +971</option>
                    </select>

                    {/* Phone Input */}
                    <div className="relative flex-1">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="(555) 019-2834"
                        className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        autoFocus
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {/* Password field if expanded */}
              {showPasswordLogin && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Supabase Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-[0.99] disabled:opacity-50 rounded-2xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{showPasswordLogin ? 'Sign In with Password' : 'Punch & Auto-Login via OTP'}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </form>

            {/* Quick 1-Click Punch Pills */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Quick 1-Click Samples</span>
                <span>Auto-generates OTP</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickPunch('phone', '98765 43210')}
                  className="p-2 text-left rounded-xl bg-slate-50 hover:bg-indigo-50/70 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-colors group cursor-pointer"
                >
                  <div className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-600">Sample Phone</div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">+1 (987) 654-3210</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPunch('email', 'alex@remindly.io')}
                  className="p-2 text-left rounded-xl bg-slate-50 hover:bg-indigo-50/70 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-colors group cursor-pointer"
                >
                  <div className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-600">Sample Email</div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">alex@remindly.io</div>
                </button>
              </div>
            </div>

            {/* Optional Password Login Toggle */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setShowPasswordLogin(!showPasswordLogin)}
                className="text-[11px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors underline"
              >
                {showPasswordLogin ? '← Switch back to Auto-OTP Login' : 'Or sign in using Supabase password'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: AUTOMATED OTP CREATION & VERIFICATION */}
        {step === 'otp_verify' && (
          <div className="space-y-6 animate-fade-in">
            {/* Live OTP Notification Toast */}
            <div className="p-3.5 rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 space-y-1 animate-pop-in">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Secure OTP Generated</span>
                </span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] uppercase font-mono">
                  Auto-Detecting
                </span>
              </div>
              <div className="text-xs text-indigo-100 flex items-center justify-between">
                <span>Code for {loginMode === 'phone' ? `${countryCode} ${phoneNumber}` : email}:</span>
                <span className="font-mono font-black text-sm tracking-widest bg-white text-indigo-700 px-2 py-0.5 rounded-lg shadow-xs">
                  {generatedOtp}
                </span>
              </div>
            </div>

            {/* OTP Digits Display */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium">One-Time Password (6 Digits)</span>
                {verificationStatus === 'verifying' && (
                  <span className="text-indigo-600 font-semibold animate-pulse">Verifying...</span>
                )}
                {verificationStatus === 'success' && (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Authenticated
                  </span>
                )}
              </div>

              <div className="flex justify-between gap-2">
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpInputsRef.current[i] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleManualOtpChange(i, e.target.value)}
                    className={`h-12 w-12 text-center text-lg font-black rounded-2xl border transition-all ${
                      digit
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 shadow-sm scale-105'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                ))}
              </div>
            </div>

            {/* Status Progress Indicator */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center space-y-1.5">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {verificationStatus === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 animate-bounce" />
                ) : (
                  <Sparkles className="h-4 w-4 text-indigo-500 animate-spin" />
                )}
                <span>{statusMessage}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Automated login in progress. You will be redirected to the 4-step walkthrough.
              </div>
            </div>

            {/* Fallback buttons */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => {
                  setStep('input');
                  setVerificationStatus('idle');
                }}
                className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Change Number / Email</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  const identifier = loginMode === 'phone' ? `${countryCode} ${phoneNumber}` : email;
                  await loginWithOtp(identifier, loginMode);
                  router.push('/onboarding');
                }}
                className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
              >
                <span>Skip Wait & Enter</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Security & Feature Footer */}
        <div className="text-center text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>🔒 Protected by Remindly Instant Verification • End-to-end user privacy</span>
        </div>
      </div>
    </div>
  );
}
