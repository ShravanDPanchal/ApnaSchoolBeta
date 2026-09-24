'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function ClassroomDetailsPage() {
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [openStandard, setOpenStandard] = useState<string | null>('balvatika');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const standards = [
    { id: 'balvatika', name: 'બાલવાટિકા' },
    { id: 'std1', name: 'ધોરણ 1' },
    { id: 'std2', name: 'ધોરણ 2' },
    { id: 'std3', name: 'ધોરણ 3' },
    { id: 'std4', name: 'ધોરણ 4' },
    { id: 'std5', name: 'ધોરણ 5' },
    { id: 'std6', name: 'ધોરણ 6' },
    { id: 'std7', name: 'ધોરણ 7' },
    { id: 'std8', name: 'ધોરણ 8' },
  ];

  const sections = ['A', 'B', 'C', 'D', 'E'];

  // State for teacher names per standard and section
  const [teacherData, setTeacherData] = useState<{ [key: string]: string }>({
    'balvatika-A': '',
    'balvatika-B': '',
    'balvatika-C': '',
    'balvatika-D': '',
    'balvatika-E': '',
  });

  const handleTeacherChange = (stdId: string, sec: string, value: string) => {
    setTeacherData((prev) => ({
      ...prev,
      [`${stdId}-${sec}`]: value,
    }));
  };

  const toggleAccordion = (id: string) => {
    setOpenStandard((prev) => (prev === id ? null : id));
  };

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
                  className="block px-4 py-2.5 text-[#0d6efd] bg-blue-50/50 hover:bg-[#f8f9fa] font-bold"
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
          <span>વર્ગની વિગત</span>
        </div>

        {/* PAGE TITLE */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#212529] mb-6">
          વર્ગની વિગત
        </h1>

        {savedSuccess && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded text-sm font-semibold flex items-center gap-2">
            <i className="bi bi-check-circle-fill"></i>
            <span>વર્ગખંડની વિગતો સફળતાપૂર્વક સાચવવામાં આવી છે!</span>
          </div>
        )}

        {/* ACCORDION CONTAINER */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {standards.map((std) => {
            const isOpen = openStandard === std.id;
            return (
              <div
                key={std.id}
                className="bg-white rounded-[4px] border border-[#dee2e6] overflow-hidden shadow-none transition-all"
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleAccordion(std.id)}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between font-bold text-base transition-colors ${
                    isOpen
                      ? 'bg-[#cfe2ff] text-[#084298]'
                      : 'bg-white text-[#212529] hover:bg-slate-50'
                  }`}
                >
                  <span>{std.name}</span>
                  <i
                    className={`bi ${
                      isOpen ? 'bi-chevron-up' : 'bi-chevron-down'
                    } text-sm`}
                  ></i>
                </button>

                {/* Accordion Content (Class A to E inputs) */}
                {isOpen && (
                  <div className="p-4 sm:p-5 space-y-3.5 bg-white border-t border-[#dee2e6]">
                    {sections.map((sec) => (
                      <div
                        key={sec}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center"
                      >
                        <label
                          htmlFor={`${std.id}-${sec}`}
                          className="sm:col-span-3 text-xs sm:text-sm font-semibold text-[#212529]"
                        >
                          વર્ગ {sec} શિક્ષકનું નામ
                        </label>
                        <div className="sm:col-span-9">
                          <input
                            id={`${std.id}-${sec}`}
                            type="text"
                            value={teacherData[`${std.id}-${sec}`] || ''}
                            onChange={(e) =>
                              handleTeacherChange(std.id, sec, e.target.value)
                            }
                            className="w-full border border-[#ced4da] rounded-[4px] px-3.5 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* SUBMIT BUTTON */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-[#0d6efd] hover:bg-[#0b5ed7] text-white font-bold text-sm sm:text-base py-2.5 rounded-[4px] shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>સુધારો</span>
            </button>
          </div>
        </form>
      </main>

      {/* CLEAN FOOTER */}
      <footer className="pt-6 pb-6 px-4 sm:px-6 max-w-[1360px] w-full mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-[#6c757d] border-t border-[#dee2e6] gap-2 font-gujarati">
        <p>સંપર્ક: support@apnaschool.in</p>
        <p className="font-bold text-[#212529]">અપના સ્કૂલ</p>
      </footer>
    </div>
  );
}
