'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function SchoolLetterpadPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State matching Reference Image 1
  const [schoolNameGu, setSchoolNameGu] = useState('શ્રી સરસ્વતી વિદ્યા મંદિર');
  const [schoolNameEn, setSchoolNameEn] = useState('Shree Saraswati Vidya Mandir');
  const [district, setDistrict] = useState('ભાવનગર');
  const [taluka, setTaluka] = useState('ભાવનગર');
  const [villageGu, setVillageGu] = useState('ભાવનગર');
  const [villageEn, setVillageEn] = useState('Bhavnagar');
  const [diseCode, setDiseCode] = useState('24140100101');
  const [centerSchoolName, setCenterSchoolName] = useState('પે. સેન્ટર શાળા નં. ૧');
  const [crcName, setCrcName] = useState('ભાવનગર સી.આર.સી.');
  const [managedBy, setManagedBy] = useState('ભાવનગર જિલ્લા પંચાયત સંચાલિત');
  const [email, setEmail] = useState('admin@ssvm.edu.in');
  const [establishedDate, setEstablishedDate] = useState('01/06/1995');
  const [slogan, setSlogan] = useState('સા વિદ્યા યા વિમુક્તયે');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const gujaratDistricts = [
    'અમદાવાદ', 'અમરેલી', 'આણંદ', 'અરવલ્લી', 'બનાસકાંઠા', 'ભરૂચ', 'ભાવનગર', 'બોટાદ',
    'છોટા ઉદેપુર', 'દાહોદ', 'ડાંગ', 'દેવભૂમિ દ્વારકા', 'ગાંધીનગર', 'ગીર સોમનાથ', 'જામનગર',
    'જૂનાગઢ', 'કચ્છ', 'ખેડા', 'મહીસાગર', 'મહેસાણા', 'મોરબી', 'નર્મદા', 'નવસારી',
    'પંચમહાલ', 'પાટણ', 'પોરબંદર', 'રાજકોટ', 'સાબરકાંઠા', 'સુરત', 'સુરેન્દ્રનગર', 'તાપી', 'વડોદરા', 'વલસાડ'
  ];

  const standardSlogans = [
    'સા વિદ્યા યા વિમુક્તયે',
    'તમસો મા જ્યોતિર્ગમય',
    'જ્ઞાનં પરમં બલમ્',
    'વિદ્યા વિનયેન શોભતે',
    'શિક્ષણ એ જ જીવન',
    'સત્યમેવ જયતે',
    'ન હિ જ્ઞાનેન સદૃશં પવિત્રમિહ વિદ્યતે',
  ];

  useEffect(() => {
    try {
      const saved = localStorage.getItem('apna_school_details');
      if (saved) {
        const d = JSON.parse(saved);
        if (d.schoolNameGu) setSchoolNameGu(d.schoolNameGu);
        if (d.schoolNameEn) setSchoolNameEn(d.schoolNameEn);
        if (d.district) setDistrict(d.district);
        if (d.taluka) setTaluka(d.taluka);
        if (d.villageGu) setVillageGu(d.villageGu);
        if (d.villageEn) setVillageEn(d.villageEn);
        if (d.diseCode) setDiseCode(d.diseCode);
        if (d.centerSchoolName) setCenterSchoolName(d.centerSchoolName);
        if (d.crcName) setCrcName(d.crcName);
        if (d.managedBy) setManagedBy(d.managedBy);
        if (d.email) setEmail(d.email);
        if (d.establishedDate) setEstablishedDate(d.establishedDate);
        if (d.slogan) setSlogan(d.slogan);
      }
    } catch (e) {}
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      schoolNameGu,
      schoolNameEn,
      district,
      taluka,
      villageGu,
      villageEn,
      diseCode,
      centerSchoolName,
      crcName,
      managedBy,
      email,
      establishedDate,
      slogan,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem('apna_school_details', JSON.stringify(data));
    } catch (e) {}
    showToast('શાળાની વિગત સફળતાપૂર્વક સાચવવામાં આવી છે!');
  };

  const handleDownloadLetterpad = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#212529] font-gujarati antialiased pb-16">
      {/* TOP HEADER */}
      <header className="bg-white border-b border-[#dee2e6] py-3 px-4 sm:px-8 sticky top-0 z-30 no-print">
        <div className="max-w-[1320px] w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <Link href="/dashboard" className="inline-flex items-center text-[25px] font-bold tracking-tight">
              <span className="text-[#007ed4]">શાળા</span>
              <span className="text-[#f59e0b] ml-1.5">સાગર</span>
            </Link>
            <Link
              href="/dashboard"
              className="text-[#6c757d] hover:text-[#212529] text-[15px] font-normal font-sans hidden sm:inline-block transition-colors"
            >
              Dashboard
            </Link>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 text-[14.5px] text-[#495057] hover:text-[#212529] font-normal py-1.5 px-2.5 rounded transition-colors cursor-pointer"
            >
              <span>Shravan Panchal</span>
              <i className="bi bi-caret-down-fill text-[10px] text-[#6c757d]"></i>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-[4px] shadow-lg border border-[#dee2e6] py-1.5 z-50 text-[14px]">
                <Link
                  href="/user/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="block px-4 py-2 text-[#212529] hover:bg-[#f8f9fa] font-normal"
                >
                  યુઝરની વિગત
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout?.();
                  }}
                  className="w-full text-left px-4 py-2 text-[#dc3545] hover:bg-[#f8f9fa] font-normal"
                >
                  લોગ-આઉટ
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* TOAST MESSAGE */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-[#198754] text-white text-xs font-semibold px-4 py-2.5 rounded shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 no-print">
          <i className="bi bi-check-circle-fill text-base"></i>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="max-w-[1100px] w-full mx-auto px-4 py-6">
        {/* Top Warning Alert matching Reference Image 1 */}
        <div className="bg-[#f8d7da] border border-[#f5c2c7] text-[#842029] px-4 py-3 rounded-[4px] text-[14.5px] font-normal mb-6 no-print">
          કૃપા કરીને પહેલા શાળાની વિગતો ભરો.
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[13px] text-[#6c757d] mb-2 no-print">
          <Link href="/dashboard" className="text-[#0d6efd] hover:underline flex items-center gap-1">
            <i className="bi bi-house-door"></i>
          </Link>
          <span>/</span>
          <span>શાળાની વિગત</span>
        </div>

        {/* Title and Download Button Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#dee2e6] mb-4">
          <h1 className="text-[22px] font-normal text-[#212529]">
            શાળાની વિગત
          </h1>
          <button
            type="button"
            onClick={handleDownloadLetterpad}
            className="bg-[#ffc107] hover:bg-[#ffca2c] text-[#000000] text-[13.5px] font-medium px-4 py-1.5 rounded-[4px] shadow-none transition-colors cursor-pointer no-print flex items-center gap-1.5"
          >
            <i className="bi bi-download text-xs"></i>
            ડાઉનલોડ
          </button>
        </div>

        {/* Instructions */}
        <div className="text-[13px] text-[#212529] mb-4 space-y-1 no-print">
          <p>
            માત્ર <span className="text-[#dc3545] font-bold">*</span> કરેલ વિગત જ ઉમેરવી ફરજીયાત છે. દરેક વિગતો અલગ-અલગ જગ્યાએ કામમાં આવે છે, જેથી શક્ય હોય તો ઉમેરવી.
          </p>
        </div>

        {/* Form Body matching Reference Image 1 (Hidden on print) */}
        <form onSubmit={handleSubmit} className="space-y-4 no-print">
          {/* Row 1: School Name Gu & En */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-normal text-[#212529] mb-1">
                શાળાનું નામ <span className="text-[#dc3545]">*</span>
              </label>
              <input
                type="text"
                required
                value={schoolNameGu}
                onChange={(e) => setSchoolNameGu(e.target.value)}
                className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-normal text-[#212529] mb-1">
                શાળાનું નામ (English)
              </label>
              <input
                type="text"
                value={schoolNameEn}
                onChange={(e) => setSchoolNameEn(e.target.value)}
                className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
              />
            </div>
          </div>

          {/* Security Note matching Reference Image 1 */}
          <p className="text-[12px] text-[#dc3545] font-normal -mt-2">
            નોંધ: સિક્યોરીટી કારણોસર એક વાર શાળાનું નામ બદલાયા બાદ 24 કલાક પછી જ બદલાવી શકાશે, જેથી ધ્યાનથી ઉમેરવું.
          </p>

          {/* Row 2: District, Taluka, Village Gu, Village En */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[13px] font-normal text-[#212529] mb-1">
                જિલ્લો <span className="text-[#dc3545]">*</span>
              </label>
              <div className="relative">
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe] appearance-none pr-8 cursor-pointer"
                >
                  <option value="">પસંદ કરો...</option>
                  {gujaratDistricts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <i className="bi bi-chevron-down absolute right-3 top-2.5 text-xs text-[#6c757d] pointer-events-none"></i>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-normal text-[#212529] mb-1">
                તાલુકો <span className="text-[#dc3545]">*</span>
              </label>
              <div className="relative">
                <select
                  value={taluka}
                  onChange={(e) => setTaluka(e.target.value)}
                  required
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe] appearance-none pr-8 cursor-pointer"
                >
                  <option value="">પસંદ કરો...</option>
                  <option value={taluka}>{taluka}</option>
                  <option value="અમદાવાદ શહેર">અમદાવાદ શહેર</option>
                  <option value="ભાવનગર">ભાવનગર</option>
                  <option value="સિહોર">સિહોર</option>
                  <option value="તળાજા">તળાજા</option>
                  <option value="મહુવા">મહુવા</option>
                  <option value="રાજકોટ">રાજકોટ</option>
                  <option value="સુરત">સુરત</option>
                  <option value="વડોદરા">વડોદરા</option>
                </select>
                <i className="bi bi-chevron-down absolute right-3 top-2.5 text-xs text-[#6c757d] pointer-events-none"></i>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-normal text-[#212529] mb-1">
                ગામનું/શહેરનું નામ <span className="text-[#dc3545]">*</span>
              </label>
              <input
                type="text"
                required
                value={villageGu}
                onChange={(e) => setVillageGu(e.target.value)}
                className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-normal text-[#212529] mb-1">
                ગામનું/શહેરનું નામ (English)
              </label>
              <input
                type="text"
                value={villageEn}
                onChange={(e) => setVillageEn(e.target.value)}
                className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
              />
            </div>
          </div>

          {/* Row 3: DISE Code, Pay Center Name, CRC Name */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[13px] font-normal text-[#212529] mb-1">
                DISE કોડ <span className="text-[#dc3545]">*</span>
              </label>
              <input
                type="text"
                required
                value={diseCode}
                onChange={(e) => setDiseCode(e.target.value)}
                placeholder="24140100101"
                className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-normal text-[#212529] mb-1">
                પે. સેન્ટર શાળાનું નામ <span className="text-[#dc3545]">*</span>
              </label>
              <input
                type="text"
                required
                value={centerSchoolName}
                onChange={(e) => setCenterSchoolName(e.target.value)}
                className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-normal text-[#212529] mb-1">
                CRC નામ <span className="text-[#dc3545]">*</span>
              </label>
              <input
                type="text"
                required
                value={crcName}
                onChange={(e) => setCrcName(e.target.value)}
                className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
              />
            </div>
          </div>

          {/* Row 4: Managed By */}
          <div>
            <label className="block text-[13px] font-normal text-[#212529] mb-1">
              સંચાલિત <span className="text-[#dc3545]">*</span>
            </label>
            <input
              type="text"
              required
              value={managedBy}
              onChange={(e) => setManagedBy(e.target.value)}
              className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
            />
            <p className="text-[11.5px] text-[#6c757d] mt-1">
              ઉદાહરણ : ભાવનગર જિલ્લા પંચાયત સંચાલિત
            </p>
          </div>

          {/* Row 5: Email, Established Date, Slogan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[13px] font-normal text-[#212529] mb-1">
                ઈ-મેઇલ
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-normal text-[#212529] mb-1">
                સ્થાપના તારીખ
              </label>
              <input
                type="text"
                placeholder="ઉદા. 01/01/1990"
                value={establishedDate}
                onChange={(e) => setEstablishedDate(e.target.value)}
                className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-normal text-[#212529] mb-1">
                શાળા સ્લોગન
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="ઉદા. સા વિદ્યા યા વિમુક્તયે"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
                <select
                  onChange={(e) => {
                    if (e.target.value) setSlogan(e.target.value);
                  }}
                  className="h-[38px] px-2 border border-[#dee2e6] rounded-[4px] text-[13px] text-[#212529] bg-white focus:outline-none cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>પસંદ કરો ▾</option>
                  {standardSlogans.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Row 6: Logo Upload */}
          <div>
            <label className="block text-[13px] font-normal text-[#212529] mb-1">
              શાળાનો લોગો
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleLogoChange}
                className="w-full h-[38px] px-2 py-1 border border-[#dee2e6] rounded-[4px] text-[13px] text-[#212529] bg-white focus:outline-none file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
              />
              {logoPreview && (
                <img
                  src={logoPreview}
                  alt="School Logo"
                  className="w-10 h-10 object-contain border border-[#dee2e6] rounded p-0.5 bg-white"
                />
              )}
            </div>
            <p className="text-[11.5px] text-[#6c757d] mt-1">
              ફક્ત PNG ફોર્મેટ માન્ય (મહત્તમ સાઈઝ 3 MB)
            </p>
          </div>

          {/* Action Button matching Reference Image 1 */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full bg-[#0d6efd] hover:bg-[#0b5ed7] text-white text-[15px] font-normal py-2.5 rounded-[4px] transition-colors cursor-pointer text-center shadow-none"
            >
              સુધારો
            </button>
          </div>
        </form>

        {/* PRINTABLE LETTERHEAD PREVIEW SECTION (When Printing) */}
        <div className="hidden print:block bg-white text-black p-8 max-w-[800px] mx-auto border border-black/20 my-6">
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <p className="text-xs text-gray-600 mb-1">{managedBy}</p>
            <h1 className="text-2xl font-bold">{schoolNameGu}</h1>
            <h2 className="text-sm font-semibold">{schoolNameEn}</h2>
            <p className="text-xs text-gray-700 mt-1">
              ગામ/શહેર: {villageGu}, તા. {taluka}, જી. {district} | DISE: {diseCode}
            </p>
            <p className="text-[11px] italic text-gray-600 mt-0.5">"{slogan}"</p>
          </div>
          <div className="flex justify-between text-xs mb-8">
            <p>જાવક નં. : _________________</p>
            <p>તારીખ: {new Date().toLocaleDateString('gu-IN')}</p>
          </div>
          <div className="min-h-[400px]">
            {/* Letter Content Area */}
          </div>
          <div className="flex justify-between items-end text-xs pt-12 border-t border-gray-300">
            <div>
              <p>ઈ-મેઈલ: {email}</p>
              <p>સ્થાપના: {establishedDate}</p>
            </div>
            <div className="text-center">
              <p className="font-bold">આચાર્યશ્રી</p>
              <p>{schoolNameGu}</p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="pt-8 pb-2 flex items-center justify-between text-[13px] text-[#6c757d] font-normal no-print border-t border-[#dee2e6] mt-8">
          <p>સંપર્ક: support@apnaschool.in</p>
          <p className="text-[#212529]">શાળા સાગર</p>
        </footer>
      </main>
    </div>
  );
}
