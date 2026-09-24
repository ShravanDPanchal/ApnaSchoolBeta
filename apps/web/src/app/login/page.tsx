'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api-client';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  // Mode: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Register sub-step: 1 = Enter Name, Mobile, Password; 2 = Enter 6-digit OTP
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);

  // Forgot password sub-step: 1 = Enter Mobile; 2 = Enter OTP + New Password
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);

  // Form states
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle mobile input with auto-cleanup of +91 / 0
  const handleMobileChange = (val: string) => {
    let cleaned = val.replace(/\D/g, '');
    if (cleaned.startsWith('91') && cleaned.length > 10) {
      cleaned = cleaned.slice(2);
    } else if (cleaned.startsWith('0') && cleaned.length > 10) {
      cleaned = cleaned.slice(1);
    }
    setMobile(cleaned.slice(0, 10));
  };

  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'register') {
      setMode('register');
      setRegisterStep(1);
    } else {
      setMode('login');
    }
  }, [searchParams]);

  // 1. Real Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const cleanIdentifier = mobile.trim();
      const res = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          identifier: cleanIdentifier,
          password: password,
        }),
      });

      if (res.success && res.data?.token) {
        localStorage.setItem('apna_token', res.data.token);
        localStorage.setItem('apna_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        router.push('/dashboard');
        return;
      }
      throw new Error(res.message || 'લૉગીન કરવામાં ક્ષતિ આવી.');
    } catch (err: any) {
      setError(err.message || 'અમાન્ય મોબાઈલ નંબર અથવા પાસવર્ડ. કૃપા કરી ફરી પ્રયાસ કરો.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Real Register - Step 1: Send OTP
  const handleRegisterGetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setError('કૃપા કરી માન્ય ૧૦ અંકનો મોબાઈલ નંબર દાખલ કરો.');
      return;
    }

    if (!name.trim()) {
      setError('કૃપા કરી તમારું નામ દાખલ કરો.');
      return;
    }

    if (password.length < 4) {
      setError('પાસવર્ડ ઓછામાં ઓછો ૪ અક્ષરનો હોવો જોઈએ.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetchApi('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: cleanMobile,
          purpose: 'REGISTRATION',
        }),
      });

      if (res.success) {
        setRegisterStep(2);
        setOtp('');
        setSuccessMsg(`મોબાઈલ નંબર ${cleanMobile} પર ૬ અંકનો OTP મોકલવામાં આવ્યો છે.`);
      }
    } catch (err: any) {
      setError(err.message || 'OTP મોકલવામાં ક્ષતિ આવી. કૃપા કરી ફરી પ્રયાસ કરો.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Real Register - Step 2: Verify OTP & Create Real Account
  const handleRegisterVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanMobile = mobile.replace(/\D/g, '');
    const cleanOtp = otp.trim();

    if (cleanOtp.length !== 6) {
      setError('કૃપા કરી ૬ અંકનો સાચો OTP દાખલ કરો.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          mobile: cleanMobile,
          password: password,
          schoolNameGu: `શ્રી ${name.trim()} વિદ્યાલય`,
          schoolNameEn: `Shree ${name.trim()} School`,
          otp: cleanOtp,
        }),
      });

      if (res.success && res.data?.token) {
        localStorage.setItem('apna_token', res.data.token);
        localStorage.setItem('apna_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        setSuccessMsg('એકાઉન્ટ સફળતાપૂર્વક રજીસ્ટર થઈ ગયું! ડેશબોર્ડ પર લઈ જઈ રહ્યા છીએ...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      }
    } catch (err: any) {
      setError(err.message || 'OTP અમાન્ય છે અથવા નોંધણી નિષ્ફળ રહી.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Real Forgot Password - Step 1: Send OTP
  const handleForgotGetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setError('કૃપા કરી માન્ય ૧૦ અંકનો મોબાઈલ નંબર દાખલ કરો.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetchApi('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: cleanMobile,
          purpose: 'FORGOT_PASSWORD',
        }),
      });

      if (res.success) {
        setForgotStep(2);
        setOtp('');
        setSuccessMsg(`મોબાઈલ નંબર ${cleanMobile} પર ૬ અંકનો OTP મોકલવામાં આવ્યો છે.`);
      }
    } catch (err: any) {
      setError(err.message || 'આ મોબાઈલ નંબર સાથે કોઈ એકાઉન્ટ મળ્યું નથી.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Real Forgot Password - Step 2: Reset Password
  const handleForgotResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanMobile = mobile.replace(/\D/g, '');
    const cleanOtp = otp.trim();

    if (cleanOtp.length !== 6) {
      setError('કૃપા કરી ૬ અંકનો OTP દાખલ કરો.');
      return;
    }

    if (newPassword.length < 4) {
      setError('નવો પાસવર્ડ ઓછામાં ઓછો ૪ અક્ષરનો હોવો જોઈએ.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetchApi('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({
          identifier: cleanMobile,
          otp: cleanOtp,
          newPassword: newPassword,
        }),
      });

      if (res.success) {
        setSuccessMsg('પાસવર્ડ સફળતાપૂર્વક બદલાઈ ગયો છે! કૃપા કરી નવા પાસવર્ડથી લૉગીન કરો.');
        setMode('login');
        setPassword('');
        setForgotStep(1);
      }
    } catch (err: any) {
      setError(err.message || 'OTP અમાન્ય છે અથવા પાસવર્ડ રીસેટ કરવામાં ક્ષતિ આવી.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="p-4 sm:p-6 max-w-lg mx-auto flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1 font-gujarati">
          <span className="text-2xl sm:text-3xl font-black text-[#EEAA00] tracking-tight">
            અપના
          </span>
          <span className="text-2xl sm:text-3xl font-black text-[#389CE0] tracking-tight">
            સ્કૂલ
          </span>
        </Link>

        {mode === 'login' ? (
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setRegisterStep(1);
              setError('');
              setSuccessMsg('');
            }}
            className="text-[#0d6efd] border border-[#0d6efd] hover:bg-blue-50 font-gujarati text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
          >
            નવું એકાઉન્ટ
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setSuccessMsg('');
            }}
            className="text-[#0d6efd] border border-[#0d6efd] hover:bg-blue-50 font-gujarati text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
          >
            લૉગીન
          </button>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-6 py-6 sm:py-10 font-gujarati">
        {/* 1. LOGIN SCREEN */}
        {mode === 'login' && (
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              લૉગીન
            </h1>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-bold">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  મોબાઈલ નંબર અથવા ઈમેલ
                </label>
                <input
                  type="text"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:border-transparent transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  પાસવર્ડ
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:border-transparent transition-all font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#0d6efd] hover:bg-blue-700 text-white font-bold text-base rounded-lg shadow-sm transition-all text-center flex items-center justify-center"
              >
                {loading ? 'ચકાસણી...' : 'લૉગીન'}
              </button>
            </form>

            {/* Switch to Register */}
            <div className="flex items-center gap-2 text-sm text-slate-700 pt-2">
              <span>અથવા</span>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setRegisterStep(1);
                  setError('');
                  setSuccessMsg('');
                }}
                className="bg-[#5a6268] hover:bg-[#4e555b] text-white text-xs font-bold px-3 py-1.5 rounded-md transition-colors"
              >
                નવું એકાઉન્ટ બનાવો
              </button>
            </div>

            {/* Forgot Password */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  setMode('forgot');
                  setForgotStep(1);
                  setError('');
                  setSuccessMsg('');
                }}
                className="text-sm font-semibold text-[#0d6efd] hover:underline"
              >
                પાસવર્ડ ભૂલી ગયા છો?
              </button>
            </div>
          </div>
        )}

        {/* 2. REGISTER SCREEN */}
        {mode === 'register' && (
          <div className="space-y-6">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              નવું એકાઉન્ટ રજીસ્ટર કરો
            </h1>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-bold">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold">
                {successMsg}
              </div>
            )}

            {registerStep === 1 ? (
              /* Step 1: Name, Mobile, Password */
              <form onSubmit={handleRegisterGetOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    નામ
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="તમારું પૂરું નામ"
                    className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    મોબાઈલ નંબર
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3.5 rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 text-slate-700 font-bold text-sm font-sans select-none gap-1.5">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => handleMobileChange(e.target.value)}
                      placeholder="8849728901"
                      className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:border-transparent transition-all font-sans"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    માત્ર ૧૦ અંકનો મોબાઈલ નંબર દાખલ કરો (દેશ કોડ +91 પહેલેથી જ સિલેક્ટ છે).
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    નવો પાસવર્ડ
                  </label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:border-transparent transition-all font-sans"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    પાસવર્ડ ઓછામાં ઓછો 4 અક્ષરનો હોવો જોઈએ.
                  </p>
                </div>

                <div className="pt-2 text-xs text-slate-600 font-sans">
                  By continuing, you agree to our{' '}
                  <Link href="/" className="text-[#0d6efd] underline">
                    Terms
                  </Link>{' '}
                  and{' '}
                  <Link href="/" className="text-[#0d6efd] underline">
                    Privacy Policy
                  </Link>
                  .
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#0d6efd] hover:bg-blue-700 text-white font-bold text-base rounded-lg shadow-sm transition-all text-center flex items-center justify-center mt-3"
                >
                  {loading ? 'પ્રક્રિયા ચાલુ છે...' : 'OTP મેળવો'}
                </button>
              </form>
            ) : (
              /* Step 2: OTP Entry */
              <form onSubmit={handleRegisterVerifySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    ૬ અંકનો OTP દાખલ કરો
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-3.5 py-2.5 text-xl font-bold tracking-widest border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:border-transparent transition-all font-sans text-center"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    મોબાઈલ {mobile} પર મોકલેલ ૬ અંકનો OTP દાખલ કરો.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3 bg-[#0d6efd] hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-base rounded-lg shadow-sm transition-all text-center flex items-center justify-center mt-3"
                >
                  {loading ? 'ચકાસણી ચાલુ છે...' : 'નોંધણી પૂર્ણ કરો'}
                </button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setRegisterStep(1)}
                    className="text-[#0d6efd] hover:underline font-semibold"
                  >
                    ← વિગતો બદલો
                  </button>

                  <button
                    type="button"
                    onClick={handleRegisterGetOtp}
                    className="text-slate-600 hover:text-slate-900 font-semibold"
                  >
                    ફરી OTP મોકલો
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 3. FORGOT PASSWORD SCREEN */}
        {mode === 'forgot' && (
          <div className="space-y-6">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              પાસવર્ડ રીસેટ કરો
            </h1>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-bold">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold">
                {successMsg}
              </div>
            )}

            {forgotStep === 1 ? (
              /* Forgot Step 1: Mobile */
              <form onSubmit={handleForgotGetOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    રજીસ્ટર્ડ મોબાઈલ નંબર
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3.5 rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 text-slate-700 font-bold text-sm font-sans select-none gap-1.5">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => handleMobileChange(e.target.value)}
                      placeholder="8849728901"
                      className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:border-transparent transition-all font-sans"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    પાસવર્ડ રીસેટ કરવા માટે ૧૦ અંકનો રજીસ્ટર્ડ નંબર દાખલ કરો.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#0d6efd] hover:bg-blue-700 text-white font-bold text-base rounded-lg shadow-sm transition-all text-center flex items-center justify-center mt-3"
                >
                  {loading ? 'મોકલી રહ્યા છીએ...' : 'OTP મેળવો'}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                    }}
                    className="text-xs text-[#0d6efd] font-semibold hover:underline"
                  >
                    ← પાછા લૉગીન પર જાઓ
                  </button>
                </div>
              </form>
            ) : (
              /* Forgot Step 2: OTP + New Password */
              <form onSubmit={handleForgotResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    ૬ અંકનો OTP
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-3.5 py-2.5 text-xl font-bold tracking-widest border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:border-transparent transition-all font-sans text-center"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    નવો પાસવર્ડ
                  </label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:border-transparent transition-all font-sans"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    નવો પાસવર્ડ ઓછામાં ઓછો 4 અક્ષરનો હોવો જોઈએ.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3 bg-[#0d6efd] hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-base rounded-lg shadow-sm transition-all text-center flex items-center justify-center mt-3"
                >
                  {loading ? 'રીસેટ થઈ રહ્યું છે...' : 'પાસવર્ડ બદલો'}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                    }}
                    className="text-xs text-[#0d6efd] font-semibold hover:underline"
                  >
                    ← પાછા લૉગીન પર જાઓ
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
