'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function PaymentHistoryPage() {
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2026');

  const years = ['2026', '2025', '2024', '2023', '2022', '2021'];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#212529] font-sans antialiased pb-12 flex flex-col justify-between">
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
      <main className="max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-6 font-gujarati flex-1">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-xs text-[#6c757d] mb-3">
          <Link href="/dashboard" className="text-[#0d6efd] hover:underline flex items-center gap-1">
            <i className="bi bi-house-door"></i>
          </Link>
          <span>/</span>
          <span>Payment History</span>
        </div>

        {/* PAGE TITLE AND YEAR FILTER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#212529]">
            અપના સ્કૂલ પર કરેલ પેમેન્ટ
          </h1>

          <div className="flex items-center gap-2">
            <label htmlFor="yearSelect" className="text-sm font-semibold text-[#212529]">
              વર્ષ
            </label>
            <select
              id="yearSelect"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white text-[#212529] font-medium focus:border-[#0d6efd] focus:outline-none"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SUBTITLE WITH LINK TO PROFILE */}
        <p className="text-xs sm:text-sm text-[#6c757d] mb-5">
          પહોંચમાં જે નામ જોઈતું હોય તે નામ સેટ કરવા{' '}
          <Link href="/user/profile" className="text-[#0d6efd] underline font-medium hover:text-blue-700">
            અહીંથી નામ
          </Link>{' '}
          બદલો.
        </p>

        {/* PAYMENT HISTORY CARD BOX (Empty State / Data) */}
        <div className="bg-white border border-[#dee2e6] rounded-[8px] p-8 sm:p-12 text-center shadow-sm min-h-[140px] flex items-center justify-center">
          <p className="text-sm text-[#6c757d] font-normal">
            {selectedYear} માં કોઈ પેમેન્ટ હિસ્ટરી મળી નથી.
          </p>
        </div>
      </main>

      {/* CLEAN FOOTER */}
      <footer className="pt-6 pb-6 px-4 sm:px-6 max-w-[1360px] w-full mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-[#6c757d] border-t border-[#dee2e6] gap-2 font-gujarati">
        <p>સંપર્ક: support@apnaschool.in</p>
        <p className="font-bold text-[#212529]">અપના સ્કૂલ</p>
      </footer>
    </div>
  );
}
