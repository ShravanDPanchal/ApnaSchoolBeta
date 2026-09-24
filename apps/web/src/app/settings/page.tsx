'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api-client';
import { CheckCircle2, AlertTriangle, Building2, Phone, Mail, MapPin, Hash, Sparkles } from 'lucide-react';

export default function SchoolSettingsPage() {
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [schoolNameGu, setSchoolNameGu] = useState('');
  const [schoolNameEn, setSchoolNameEn] = useState('');
  const [principalName, setPrincipalName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('અમદાવાદ');
  const [taluka, setTaluka] = useState('અમદાવાદ સિટી');
  const [villageGu, setVillageGu] = useState('અમદાવાદ');
  const [villageEn, setVillageEn] = useState('Ahmedabad');
  const [addressLine1, setAddressLine1] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [diseCode, setDiseCode] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [email, setEmail] = useState('');
  const [slogan, setSlogan] = useState('સા વિદ્યા યા વિમુક્તયે');
  const [sloganDropdownOpen, setSloganDropdownOpen] = useState(false);

  const gujaratDistricts = [
    'અમદાવાદ', 'અમરેલી', 'આણંદ', 'અરવલ્લી', 'બનાસકાંઠા', 'ભરૂચ', 'ભાવનગર', 'બોટાદ',
    'છોટા ઉદેપુર', 'દાહોદ', 'ડાંગ', 'દેવભૂમિ દ્વારકા', 'ગાંધીનગર', 'ગીર સોમનાથ', 'જામનગર',
    'જૂનાગઢ', 'કચ્છ', 'ખેડા', 'મહીસાગર', 'મહેસાણા', 'મોરબી', 'નર્મદા', 'નવસારી',
    'પંચમહાલ', 'પાટણ', 'પોરબંદર', 'રાજકોટ', 'સાબરકાંઠા', 'સુરત', 'સુરેન્દ્રનગર',
    'તાપી', 'વડોદરા', 'વલસાડ'
  ];

  const popularSlogans = [
    'સા વિદ્યા યા વિમુક્તયે',
    'તમસો મા જ્યોતિર્ગમય',
    'શિક્ષણ એ જ સાચું ધન',
    'જ્ઞાન એ જ જીવનનું તેજ',
    'વિદ્યા વિનયેન શોભતે',
    'સત્યમેવ જયતે',
  ];

  useEffect(() => {
    async function loadSchoolProfile() {
      setLoading(true);
      try {
        const res = await fetchApi('/school');
        if (res.success && res.data) {
          const s = res.data;
          setSchoolNameGu(s.nameGu || '');
          setSchoolNameEn(s.nameEn || '');
          setPrincipalName(s.principalName || '');
          setPhone(s.phone || '');
          setEmail(s.email || '');
          setAddressLine1(s.addressLine1 || '');
          setDistrict(s.district || 'અમદાવાદ');
          setTaluka(s.taluka || '');
          setVillageGu(s.city || '');
          setVillageEn(s.city || '');
          setPinCode(s.pinCode || '');
          setDiseCode(s.diseCode || '');
          setRegistrationNo(s.registrationNo || '');
        }
      } catch (err: any) {
        setErrorMessage('શાળાની પ્રોફાઇલ લોડ કરવામાં સમસ્યા આવી.');
      } finally {
        setLoading(false);
      }
    }
    loadSchoolProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSavedSuccess(false);

    // Strict Validations
    if (!schoolNameGu.trim()) {
      setErrorMessage('કૃપા કરીને શાળાનું ગુજરાતી નામ દાખલ કરો.');
      return;
    }
    if (!schoolNameEn.trim()) {
      setErrorMessage('કૃપા કરીને શાળાનું અંગ્રેજી નામ દાખલ કરો.');
      return;
    }
    if (diseCode && !/^\d{11}$/.test(diseCode.trim())) {
      setErrorMessage('DISE કોડ બરાબર ૧૧ અંકનો હોવો જરૂરી છે (ઉ.દા. 24070100101).');
      return;
    }
    if (phone && !/^[6-9]\d{9}$/.test(phone.trim())) {
      setErrorMessage('સંપર્ક મોબાઈલ નંબર માન્ય ૧૦ અંકનો હોવો જોઈએ (6, 7, 8, અથવા 9 થી શરૂ થતો).');
      return;
    }
    if (pinCode && !/^\d{6}$/.test(pinCode.trim())) {
      setErrorMessage('પીનકોડ બરાબર ૬ અંકનો હોવો જોઈએ.');
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('માન્ય ઈ-મેઈલ એડ્રેસ દાખલ કરો.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetchApi('/school', {
        method: 'PATCH',
        body: JSON.stringify({
          nameGu: schoolNameGu.trim(),
          nameEn: schoolNameEn.trim(),
          principalName: principalName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          addressLine1: addressLine1.trim(),
          city: villageGu.trim() || villageEn.trim(),
          district: district.trim(),
          taluka: taluka.trim(),
          pinCode: pinCode.trim(),
          diseCode: diseCode.trim(),
          registrationNo: registrationNo.trim(),
        }),
      });

      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'શાળાની વિગતો સાચવવામાં નિષ્ફળતા મળી.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#212529] font-sans antialiased pb-12 flex flex-col justify-between font-gujarati">
      {/* TOP HEADER */}
      <header className="bg-white border-b border-[#dee2e6] py-3 px-4 sm:px-6 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1360px] w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#EEAA00] tracking-tight">
                અપના
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#389CE0] tracking-tight">
                સ્કૂલ
              </span>
            </Link>
            <Link
              href="/dashboard"
              className="text-xs text-[#6c757d] hover:text-[#0d6efd] font-normal pl-2 hidden sm:inline"
            >
              Dashboard
            </Link>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 text-sm text-[#495057] hover:text-[#212529] font-semibold py-1 px-2.5 rounded hover:bg-slate-100 transition-colors"
            >
              <span>{user?.nameEn || 'Shravan Panchal'}</span>
              <span className="text-xs text-slate-400">▼</span>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl border border-[#dee2e6] py-1 z-50 animate-in fade-in zoom-in-95 text-sm">
                <Link
                  href="/user/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="block px-4 py-2.5 text-[#212529] hover:bg-[#f8f9fa] font-medium"
                >
                  યુઝરની વિગત
                </Link>
                <div className="border-t border-[#dee2e6] my-0.5"></div>
                <Link
                  href="/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="block px-4 py-2.5 text-[#212529] hover:bg-[#f8f9fa] font-medium"
                >
                  શાળાની વિગત
                </Link>
                <Link
                  href="/user/classroom"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="block px-4 py-2.5 text-[#212529] hover:bg-[#f8f9fa] font-medium"
                >
                  વર્ગખંડની વિગત
                </Link>
                <div className="border-t border-[#dee2e6] my-0.5"></div>
                <Link
                  href="/user/payment/history"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="block px-4 py-2.5 text-[#212529] hover:bg-[#f8f9fa] font-medium"
                >
                  પેમેન્ટ વિગત
                </Link>
                <div className="border-t border-[#dee2e6] my-0.5"></div>
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2.5 text-[#212529] hover:bg-[#f8f9fa] font-medium"
                >
                  લોગ-આઉટ
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-6 flex-1">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-xs text-[#6c757d] mb-3">
          <Link href="/dashboard" className="text-[#0d6efd] hover:underline">
            Dashboard
          </Link>
          <span>/</span>
          <span>શાળાની વિગત (School Profile)</span>
        </div>

        {/* TITLE ROW WITH YELLOW PRINT BUTTON */}
        <div className="flex items-center justify-between gap-4 mb-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#212529] flex items-center gap-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            શાળાની વિગત (School Profile)
          </h1>

          <button
            type="button"
            onClick={() => window.print()}
            className="bg-[#ffc107] hover:bg-[#ffca2c] text-black font-bold text-xs px-4 py-2 rounded-[4px] shadow-none transition-colors"
          >
            ડાઉનલોડ / પ્રિન્ટ
          </button>
        </div>

        {/* NOTICE */}
        <p className="text-xs text-[#6c757d] mb-4">
          માત્ર <span className="text-[#dc3545] font-bold">*</span> કરેલ વિગત જ ઉમેરવી ફરજીયાત છે. દરેક વિગતો પત્રકો, એલ.સી. અને રિપોર્ટમાં ઉપયોગમાં લેવાય છે.
        </p>

        {errorMessage && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {savedSuccess && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>શાળાની વિગતો સફળતાપૂર્વક સાચવવામાં આવી છે!</span>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-bold text-sm">
            શાળા પ્રોફાઇલ લોડ થઈ રહી છે...
          </div>
        ) : (
          /* SCHOOL DETAILS FORM */
          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            {/* Row 1: School Name (Gu + En) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">
                  શાળાનું નામ (ગુજરાતી) <span className="text-[#dc3545]">*</span>
                </label>
                <input
                  type="text"
                  value={schoolNameGu}
                  onChange={(e) => setSchoolNameGu(e.target.value)}
                  className="w-full border border-[#ced4da] rounded-[4px] px-3.5 py-2 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">
                  શાળાનું નામ (English) <span className="text-[#dc3545]">*</span>
                </label>
                <input
                  type="text"
                  value={schoolNameEn}
                  onChange={(e) => setSchoolNameEn(e.target.value)}
                  className="w-full border border-[#ced4da] rounded-[4px] px-3.5 py-2 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Row 2: Principal Name & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">
                  આચાર્યશ્રીનું નામ (Principal Name)
                </label>
                <input
                  type="text"
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  className="w-full border border-[#ced4da] rounded-[4px] px-3.5 py-2 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">
                  સંપર્ક ફોન / મોબાઈલ નંબર (૧૦ અંક)
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3.5 py-2 text-sm bg-white focus:border-[#0d6efd] focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Row 3: District, Taluka, Village (Gu + En) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">
                  જિલ્લો <span className="text-[#dc3545]">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-2 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
                  required
                >
                  <option value="">પસંદ કરો...</option>
                  {gujaratDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">
                  તાલુકો <span className="text-[#dc3545]">*</span>
                </label>
                <input
                  type="text"
                  value={taluka}
                  onChange={(e) => setTaluka(e.target.value)}
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-2 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">
                  ગામનું/શહેરનું નામ <span className="text-[#dc3545]">*</span>
                </label>
                <input
                  type="text"
                  value={villageGu}
                  onChange={(e) => setVillageGu(e.target.value)}
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-2 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">
                  પીનકોડ (PIN Code)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="380001"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-2 text-sm bg-white focus:border-[#0d6efd] focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Row 4: DISE Code, Registration No, Email */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">
                  UDISE / DISE કોડ (૧૧ અંક) <span className="text-[#dc3545]">*</span>
                </label>
                <input
                  type="text"
                  maxLength={11}
                  value={diseCode}
                  onChange={(e) => setDiseCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="24070100101"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-2 text-sm bg-white focus:border-[#0d6efd] focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">
                  શાળા નોંધણી ક્રમાંક (Registration No)
                </label>
                <input
                  type="text"
                  value={registrationNo}
                  onChange={(e) => setRegistrationNo(e.target.value)}
                  placeholder="SCH/2020/001"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-2 text-sm bg-white focus:border-[#0d6efd] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">
                  ઈ-મેઈલ (School Email)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="school@example.com"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3.5 py-2 text-sm bg-white focus:border-[#0d6efd] focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Row 5: Address Line 1 */}
            <div>
              <label className="block text-xs font-bold text-[#212529] mb-1">
                શાળાનું સરનામું (School Address)
              </label>
              <input
                type="text"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="મુ. પોસ્ટ, રસ્તો, વિસ્તાર"
                className="w-full border border-[#ced4da] rounded-[4px] px-3.5 py-2 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
              />
            </div>

            {/* Row 6: Slogan */}
            <div className="relative">
              <label className="block text-xs font-bold text-[#212529] mb-1">
                શાળા સ્લોગન (School Slogan / Motto)
              </label>
              <div className="flex">
                <input
                  type="text"
                  placeholder="ઉ.દા. સા વિદ્યા યા વિમુક્તયે"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full border border-[#ced4da] rounded-l-[4px] px-3.5 py-2 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setSloganDropdownOpen((prev) => !prev)}
                  className="bg-gray-100 hover:bg-gray-200 border border-l-0 border-[#ced4da] rounded-r-[4px] px-3 text-xs font-semibold text-gray-700 shrink-0 flex items-center gap-1"
                >
                  <span>પસંદ કરો</span>
                  <span className="text-[10px]">▼</span>
                </button>
              </div>

              {sloganDropdownOpen && (
                <div className="absolute right-0 mt-1 w-full bg-white rounded shadow-lg border border-[#dee2e6] py-1 z-30 text-xs">
                  {popularSlogans.map((slog, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSlogan(slog);
                        setSloganDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-[#f8f9fa] text-[#212529]"
                    >
                      {slog}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#0d6efd] hover:bg-[#0b5ed7] text-white font-bold text-sm sm:text-base py-2.5 rounded-[4px] shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{saving ? 'સાચવી રહ્યું છે...' : 'માહિતી સુધારો / સાચવો (Update Settings)'}</span>
              </button>
            </div>
          </form>
        )}
      </main>

      {/* FOOTER */}
      <footer className="pt-6 pb-6 px-4 sm:px-6 max-w-[1360px] w-full mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-[#6c757d] border-t border-[#dee2e6] gap-2">
        <p>સંપર્ક: support@apnaschool.in</p>
        <p className="font-bold text-[#212529]">અપના સ્કૂલ - GSEB Certified ERP</p>
      </footer>
    </div>
  );
}
