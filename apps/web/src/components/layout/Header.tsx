'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Bell, User, School, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, locale, setLocale, t } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shrink-0">
          <School className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight font-gujarati truncate">
            {locale === 'gu' ? user?.schoolNameGu : user?.schoolNameEn}
          </h1>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[11px] bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded-full border border-amber-300/80">
              શૈક્ષણિક વર્ષ: ૨૦૨૬-૨૭
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              (GSEB Gujarat Board)
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Language Switcher */}
        <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
          <button
            onClick={() => setLocale('gu')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all font-gujarati ${
              locale === 'gu'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ગુજરાતી
          </button>
          <button
            onClick={() => setLocale('en')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              locale === 'en'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            English
          </button>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-semibold text-sm">
            <User className="w-5 h-5 text-slate-600" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-none">
              {user?.email || 'admin@ssvm.edu.in'}
            </p>
            <p className="text-[10px] text-blue-600 font-bold uppercase mt-1">
              {user?.role?.replace('_', ' ') || 'SCHOOL ADMIN'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
