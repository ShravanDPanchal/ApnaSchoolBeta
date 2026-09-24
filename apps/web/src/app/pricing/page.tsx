'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

function PricingContent() {
  const { user, logout } = useAuth();
  const searchParams = useSearchParams();
  const featureParam = searchParams.get('feature') || 'gunotsav';

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [featureModalOpen, setFeatureModalOpen] = useState<string | null>(null);

  // Map query parameter to Gujarati display name
  const featureNameMap: { [key: string]: string } = {
    gunotsav: 'ગુણોત્સવ',
    rojnishi: 'રોજનીશી',
    balvatika_rojnishi: 'બાલવાટિકા રોજનીશી',
    std1_rojnishi: 'ધોરણ 1 રોજનીશી',
    std2_rojnishi: 'ધોરણ 2 રોજનીશી',
    aheval: 'અહેવાલ',
    patrak_a: 'પત્રક-A',
    samaypatrak: 'સમયપત્રક',
    exam_result: 'પરીક્ષા પરિણામ',
    past_year_result: 'અગાઉ વર્ષનું પરીક્ષા પરિણામ',
    egr: 'જનરલ રજીસ્ટર (eGR)',
    rojmel: 'રોજમેળ',
  };

  const currentFeatureName = featureNameMap[featureParam] || 'ગુણોત્સવ';

  const handleBuy = (productName: string) => {
    setSelectedProduct(productName);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#212529] font-sans antialiased pb-12">
      {/* TOP HEADER */}
      <header className="bg-white border-b border-[#dee2e6] py-3 px-4 sm:px-6 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1360px] w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 font-gujarati">
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
              className="flex items-center gap-2 text-sm text-[#495057] hover:text-[#212529] font-semibold font-gujarati py-1 px-2.5 rounded hover:bg-slate-100 transition-colors"
            >
              <span>{user?.schoolNameGu ? 'Shravan Panchal' : 'Shravan Panchal'}</span>
              <i className="bi bi-chevron-down text-xs text-slate-500"></i>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl border border-[#dee2e6] py-1 z-50 font-gujarati animate-in fade-in zoom-in-95 text-sm">
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
                  href="/students"
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
      <main className="max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-5 font-gujarati space-y-6">
        {/* PINK / RED NOTICE ALERT BANNER */}
        <div className="bg-[#f8d7da] text-[#842029] border border-[#f5c2c7] rounded-[6px] py-2.5 px-4 text-xs sm:text-sm font-medium">
          માફ કરશો પરંતુ {currentFeatureName}ના રિપોર્ટ્સ બનાવવા માટે પ્રોડક્ટ ખરીદવી જરૂરી છે જે તમે નીચે આપેલ લિંક પરથી ખરીદી શકો છો.
        </div>

        {/* PAGE TITLE & NOTICE */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#212529]">
            અપના સ્કૂલ પેઈડ સુવિધાઓ
          </h1>
          <p className="text-xs sm:text-sm text-[#6c757d]">
            નોંધ : અહીં આપવામાં આવતી તમામ સુવિધાઓ વહીવટી/શૈક્ષણિક સોફ્ટવેર છે, તેનો વિવેકપૂર્ણ ઉપયોગ કરવો.
          </p>
        </div>

        {/* SECTION 1: ગુણોત્સવ */}
        <section className="space-y-2.5">
          <h2 className="text-lg sm:text-xl font-bold text-[#212529]">
            ગુણોત્સવ
          </h2>
          <div className="bg-white rounded-[8px] border border-[#dee2e6] p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-base text-[#212529]">
                ગુણોત્સવ (શૈક્ષણિક વર્ષ ૨૦૨૬-૨૭)
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[#0d6efd] font-bold text-lg">₹ 999</span>
                <span className="text-xs text-[#6c757d] font-normal">
                  (તા. 30-04-2027 સુધી)
                </span>
              </div>
            </div>
            <div>
              <button
                type="button"
                onClick={() => handleBuy('ગુણોત્સવ (શૈક્ષણિક વર્ષ ૨૦૨૬-૨૭)')}
                className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white font-bold text-sm px-5 py-2 rounded-[6px] flex items-center gap-2 shadow-sm transition-all"
              >
                <i className="bi bi-cart3"></i>
                <span>ખરીદો</span>
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: રોજનીશી */}
        <section className="space-y-2.5">
          <h2 className="text-lg sm:text-xl font-bold text-[#212529]">
            રોજનીશી
          </h2>
          <div className="bg-white rounded-[8px] border border-[#dee2e6] p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <h3 className="font-bold text-base text-[#212529]">
                રોજનીશી (સત્ર-1) (ધો. 3 થી 8)
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[#0d6efd] font-bold text-lg">₹ 399</span>
                <span className="text-xs text-[#6c757d] font-normal">
                  (તા. 08-06-2026 થી 04-11-2026 સુધીની)
                </span>
              </div>
              <p className="text-xs text-[#6c757d]">
                આ વર્ષે સરકાર દ્વારા સુધારેલ નવા ફોર્મેટ મુજબ
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setFeatureModalOpen('રોજનીશી')}
                  className="border border-[#0d6efd] text-[#0d6efd] hover:bg-blue-50 px-3 py-1.5 rounded-[4px] text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <i className="bi bi-list-task"></i>
                  <span>સુવિધાઓ જુઓ</span>
                </button>
              </div>
            </div>
            <div>
              <button
                type="button"
                onClick={() => handleBuy('રોજનીશી (સત્ર-1) (ધો. 3 થી 8)')}
                className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white font-bold text-sm px-5 py-2 rounded-[6px] flex items-center gap-2 shadow-sm transition-all"
              >
                <i className="bi bi-cart3"></i>
                <span>ખરીદો</span>
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 3: સમયપત્રક */}
        <section className="space-y-2.5">
          <h2 className="text-lg sm:text-xl font-bold text-[#212529]">
            સમયપત્રક
          </h2>
          <div className="bg-white rounded-[8px] border border-[#dee2e6] p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-base text-[#212529]">
                સમયપત્રક (શૈક્ષણિક વર્ષ 2026-27 માટે)
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[#0d6efd] font-bold text-lg">₹ 299</span>
              </div>
              <p className="text-xs text-[#6c757d]">ધોરણ 3 થી 8 માટે</p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2">
              <button
                type="button"
                onClick={() => handleBuy('સમયપત્રક (શૈક્ષણિક વર્ષ 2026-27)')}
                className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white font-bold text-sm px-5 py-2 rounded-[6px] flex items-center gap-2 shadow-sm transition-all w-full sm:w-auto justify-center"
              >
                <i className="bi bi-cart3"></i>
                <span>ખરીદો</span>
              </button>
              <a
                href="/sample-timetable.pdf"
                download
                className="bg-[#6c757d] hover:bg-[#5c636a] text-white px-3.5 py-1.5 rounded-[4px] text-xs font-semibold flex items-center gap-1.5 transition-colors w-full sm:w-auto justify-center"
              >
                <i className="bi bi-file-earmark-pdf"></i>
                <span>ડેમો PDF ડાઉનલોડ</span>
              </a>
            </div>
          </div>
        </section>

        {/* SECTION 4: પરીક્ષા પરિણામ */}
        <section className="space-y-2.5">
          <h2 className="text-lg sm:text-xl font-bold text-[#212529]">
            પરીક્ષા પરિણામ
          </h2>
          <div className="bg-white rounded-[8px] border border-[#dee2e6] p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-md">
              <h3 className="font-bold text-base text-[#212529]">
                પરીક્ષા પરિણામ
              </h3>
              <p className="text-xs text-[#6c757d]">
                પ્રથમ સત્ર + દ્વિતીય સત્ર (વર્ષ 2026-27 માટે)
              </p>
              <p className="text-sm font-semibold text-[#212529]">
                કોઈપણ એક ધોરણ માટે{' '}
                <span className="text-[#0d6efd] font-bold text-base">₹ 99</span>
              </p>
              <p className="text-xs text-[#6c757d]">
                એક કરતા વધુ ધોરણ તમે ખરીદી શકશો
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setFeatureModalOpen('પરીક્ષા પરિણામ')}
                  className="border border-[#0d6efd] text-[#0d6efd] hover:bg-blue-50 px-3 py-1.5 rounded-[4px] text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <i className="bi bi-list-task"></i>
                  <span>સુવિધાઓ જુઓ</span>
                </button>
              </div>
            </div>

            {/* Multiple Grade & Bundle Buy Buttons */}
            <div className="space-y-2 font-gujarati">
              {/* Row 1: Single Grades */}
              <div className="flex flex-wrap gap-1.5">
                {[3, 4, 5, 6, 7, 8].map((std) => (
                  <button
                    key={std}
                    type="button"
                    onClick={() => handleBuy(`પરીક્ષા પરિણામ - ધોરણ ${std}`)}
                    className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white text-xs font-bold px-3 py-2 rounded-[4px] transition-all shadow-sm flex items-center gap-1"
                  >
                    <span>ધોરણ {std} ખરીદો</span>
                  </button>
                ))}
              </div>

              {/* Row 2: Medium Combos */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleBuy('પરીક્ષા પરિણામ - ધોરણ 3 થી 5')}
                  className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white text-xs font-bold px-3.5 py-2 rounded-[4px] transition-all shadow-sm"
                >
                  <span>ધોરણ 3 થી 5 (₹ 250 <span className="line-through opacity-75 font-normal">₹297</span>)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleBuy('પરીક્ષા પરિણામ - ધોરણ 6 થી 8')}
                  className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white text-xs font-bold px-3.5 py-2 rounded-[4px] transition-all shadow-sm"
                >
                  <span>ધોરણ 6 થી 8 (₹ 250 <span className="line-through opacity-75 font-normal">₹297</span>)</span>
                </button>
              </div>

              {/* Row 3: Full Combo */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleBuy('પરીક્ષા પરિણામ - ધોરણ 3 થી 8 (ઓલ ઇન વન)')}
                  className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white text-xs font-bold px-4 py-2 rounded-[4px] transition-all shadow-sm"
                >
                  <span>ધોરણ 3 થી 8 (₹ 498 <span className="line-through opacity-75 font-normal">₹594</span>)</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: જનરલ રજીસ્ટર (eGR) */}
        <section className="space-y-2.5">
          <h2 className="text-lg sm:text-xl font-bold text-[#212529]">
            જનરલ રજીસ્ટર (eGR)
          </h2>
          <div className="bg-white rounded-[8px] border border-[#dee2e6] p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <h3 className="font-bold text-base text-[#212529]">
                જનરલ રજીસ્ટર <span className="text-[#0d6efd] text-xs font-bold">(eGR)</span>
              </h3>
              <p className="text-sm font-semibold text-[#212529]">
                3 વર્ષ માટે <span className="text-[#0d6efd] font-bold text-base">₹ 499</span>
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setFeatureModalOpen('જનરલ રજીસ્ટર')}
                  className="border border-[#0d6efd] text-[#0d6efd] hover:bg-blue-50 px-3 py-1.5 rounded-[4px] text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <i className="bi bi-list-task"></i>
                  <span>સુવિધાઓ જુઓ</span>
                </button>
              </div>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2">
              <button
                type="button"
                onClick={() => handleBuy('જનરલ રજીસ્ટર (eGR) - 3 વર્ષ')}
                className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white font-bold text-sm px-5 py-2 rounded-[6px] flex items-center gap-2 shadow-sm transition-all w-full sm:w-auto justify-center"
              >
                <i className="bi bi-cart3"></i>
                <span>ખરીદો</span>
              </button>
              <a
                href="/sample-egr.pdf"
                download
                className="bg-[#6c757d] hover:bg-[#5c636a] text-white px-3.5 py-1.5 rounded-[4px] text-xs font-semibold flex items-center gap-1.5 transition-colors w-full sm:w-auto justify-center"
              >
                <i className="bi bi-file-earmark-pdf"></i>
                <span>ડેમો PDF ડાઉનલોડ</span>
              </a>
            </div>
          </div>
        </section>

        {/* SECTION 6: રોજમેળ */}
        <section className="space-y-2.5">
          <h2 className="text-lg sm:text-xl font-bold text-[#212529]">
            રોજમેળ
          </h2>
          <div className="bg-white rounded-[8px] border border-[#dee2e6] p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <h3 className="font-bold text-base text-[#212529]">
                રોજમેળ
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[#0d6efd] font-bold text-lg">₹ 398</span>
              </div>
              <p className="text-xs text-[#6c757d]">
                (કુલ ચાર રોજમેળ બનાવી શકશો)
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setFeatureModalOpen('રોજમેળ')}
                  className="border border-[#0d6efd] text-[#0d6efd] hover:bg-blue-50 px-3 py-1.5 rounded-[4px] text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <i className="bi bi-list-task"></i>
                  <span>સુવિધાઓ જુઓ</span>
                </button>
              </div>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2">
              <button
                type="button"
                onClick={() => handleBuy('રોજમેળ (4 રોજમેળ લાઇસન્સ)')}
                className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white font-bold text-sm px-5 py-2 rounded-[6px] flex items-center gap-2 shadow-sm transition-all w-full sm:w-auto justify-center"
              >
                <i className="bi bi-cart3"></i>
                <span>ખરીદો</span>
              </button>
              <a
                href="/sample-rojmel.pdf"
                download
                className="bg-[#6c757d] hover:bg-[#5c636a] text-white px-3.5 py-1.5 rounded-[4px] text-xs font-semibold flex items-center gap-1.5 transition-colors w-full sm:w-auto justify-center"
              >
                <i className="bi bi-file-earmark-pdf"></i>
                <span>ડેમો PDF ડાઉનલોડ</span>
              </a>
            </div>
          </div>
        </section>

        {/* SECTION 7: બંડલ */}
        <section className="space-y-2.5">
          <h2 className="text-lg sm:text-xl font-bold text-[#212529]">
            બંડલ
          </h2>
          <div className="bg-white rounded-[8px] border border-[#dee2e6] p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-base text-[#212529]">
                આચાર્ય બંડલ
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[#0d6efd] font-bold text-lg">₹ 999</span>
              </div>
              <p className="text-xs text-[#6c757d]">
                સમયપત્રક (શૈક્ષણિક વર્ષ 2026-27) + રોજમેળ (4 રોજમેળ) + જનરલ રજીસ્ટર
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => handleBuy('આચાર્ય બંડલ (ઓલ-ઇન-વન પેકેજ)')}
                className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white font-bold text-sm px-5 py-2 rounded-[6px] flex items-center gap-2 shadow-sm transition-all"
              >
                <i className="bi bi-cart3"></i>
                <span>ખરીદો</span>
              </button>
            </div>
          </div>
        </section>

        {/* CLEAN FOOTER */}
        <footer className="pt-6 pb-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6c757d] border-t border-[#dee2e6] gap-2">
          <p>સંપર્ક: support@apnaschool.in</p>
          <p className="font-bold text-[#212529]">અપના સ્કૂલ</p>
        </footer>
      </main>

      {/* CHECKOUT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 font-gujarati animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 space-y-4 border border-[#dee2e6]">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-[#212529] flex items-center gap-2">
                <i className="bi bi-bag-check-fill text-[#0d6efd]"></i>
                <span>ઓનલાઈન પેમેન્ટ (Checkout)</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-md p-3.5 space-y-1 text-xs">
              <p className="font-bold text-[#0d6efd] text-sm">{selectedProduct}</p>
              <p className="text-gray-600">શાળા: {user?.schoolNameGu || 'પ્રાથમિક શાળા'}</p>
              <p className="text-gray-600">શિક્ષક: Shravan Panchal</p>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-gray-700">પેમેન્ટ પદ્ધતિ પસંદ કરો:</p>
              <div className="grid grid-cols-2 gap-2">
                <label className="border border-[#0d6efd] bg-blue-50/50 rounded p-2.5 flex items-center gap-2 cursor-pointer font-semibold text-gray-800">
                  <input type="radio" name="pay" defaultChecked />
                  <span>UPI / QR કોડ</span>
                </label>
                <label className="border border-gray-200 rounded p-2.5 flex items-center gap-2 cursor-pointer text-gray-600">
                  <input type="radio" name="pay" />
                  <span>નેટ બેંકિંગ / કાર્ડ</span>
                </label>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  alert(`સફળતાપૂર્વક ચૂકવણી થઈ! '${selectedProduct}' સક્રિય કરવામાં આવ્યું છે.`);
                  setModalOpen(false);
                }}
                className="flex-1 bg-[#198754] hover:bg-[#157347] text-white font-bold py-2.5 px-4 rounded-md text-sm transition-all shadow-sm"
              >
                પેમેન્ટ પૂર્ણ કરો
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-md text-sm transition-colors"
              >
                રદ કરો
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FEATURE DETAILS MODAL */}
      {featureModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 font-gujarati animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6 space-y-4 border border-[#dee2e6]">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-[#212529]">
                {featureModalOpen} - ઉપલબ્ધ મુખ્ય સુવિધાઓ
              </h3>
              <button
                type="button"
                onClick={() => setFeatureModalOpen(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <ul className="space-y-2 text-xs sm:text-sm text-gray-700 list-disc list-inside">
              <li>સરકાર માન્ય પરિપત્રો મુજબ ૧૦૦% પ્રમાણિત ફોર્મેટ</li>
              <li>સિંગલ ક્લિક પીડીએફ (PDF) ડાઉનલોડ અને પ્રિન્ટ વિકલ્પ</li>
              <li>દૈનિક ઓટો-ગણતરી અને ભૂલ રહિત ડેટા જનરેશન</li>
              <li>અમર્યાદિત સુધારા (Edit) અને સુરક્ષિત ક્લાઉડ સ્ટોરેજ</li>
            </ul>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setFeatureModalOpen(null)}
                className="w-full bg-[#0d6efd] text-white font-bold py-2 px-4 rounded-md text-sm hover:bg-[#0b5ed7] transition-all"
              >
                બંધ કરો
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center font-gujarati">લોડ થઈ રહ્યું છે...</div>}>
      <PricingContent />
    </Suspense>
  );
}
