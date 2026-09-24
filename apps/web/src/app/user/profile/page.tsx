'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function UserProfilePage() {
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [teacherName, setTeacherName] = useState(
    user?.schoolNameGu ? 'Shravan Panchal' : 'Shravan Panchal'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

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
              <span>{teacherName}</span>
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
          <span>યુઝરની વિગત</span>
        </div>

        {/* PAGE TITLE */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#212529] mb-6">
          યુઝરની વિગત
        </h1>

        {/* FORM CARD */}
        <div className="bg-white border border-[#dee2e6] rounded-[8px] p-6 sm:p-8 max-w-4xl shadow-sm">
          {savedSuccess && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded text-sm font-semibold flex items-center gap-2">
              <i className="bi bi-check-circle-fill"></i>
              <span>પ્રોફાઇલ સફળતાપૂર્વક અપડેટ થઈ ગઈ છે!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="teacherName" className="block font-bold text-sm text-[#212529] mb-1.5">
                શિક્ષકનું નામ
              </label>
              <input
                id="teacherName"
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full border border-[#ced4da] rounded-[4px] px-3.5 py-2 text-sm text-[#212529] focus:border-[#0d6efd] focus:ring-1 focus:ring-[#0d6efd] focus:outline-none transition-colors"
                placeholder="શિક્ષકનું નામ દાખલ કરો"
                required
              />
              <p className="text-xs text-[#6c757d] mt-2 leading-relaxed">
                અહીંયા તમારું પૂરું નામ રાખવું કે જે તમે રિપોર્ટ્સ અને અન્ય જગ્યાએ લખવા માંગતા હોવ (જેમ કે રોજનીશીમાં)
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white font-bold text-sm px-5 py-2.5 rounded-[4px] shadow-sm transition-all"
              >
                પ્રોફાઈલ સુધારો
              </button>
            </div>
          </form>
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
