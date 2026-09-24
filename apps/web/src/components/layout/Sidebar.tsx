'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  GraduationCap,
  CalendarCheck,
  UserCheck,
  CalendarDays,
  Award,
  ReceiptIndianRupee,
  BookOpenCheck,
  Scale,
  Users,
  FileSpreadsheet,
  Settings,
  LogOut,
  ArrowUpCircle,
  FileText,
  Upload,
  Landmark,
  X,
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { t, logout } = useAuth();

  const menuItems = [
    { href: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { href: '/', label: 'મુખ્ય પોર્ટલ (Portal)', icon: Landmark, badge: 'Home' },
    { href: '/students', label: t.nav.students, icon: GraduationCap },
    { href: '/students/promote', label: t.nav.studentPromotion || 'વિદ્યાર્થી પ્રમોશન', icon: ArrowUpCircle },
    { href: '/students/transfer', label: t.nav.studentTransfer || 'શાળા બદલી / LC', icon: FileText },
    { href: '/students/import', label: t.nav.studentImport || 'એક્સેલ આયાત (Import)', icon: Upload },
    { href: '/staff', label: t.nav.staff, icon: Users },
    { href: '/attendance', label: t.nav.attendance, icon: CalendarCheck },
    { href: '/attendance/staff', label: t.nav.staffAttendance || 'શિક્ષક/સ્ટાફ હાજરી', icon: UserCheck },
    { href: '/timetable', label: t.nav.timetable || 'સમયપત્રક (Timetable)', icon: CalendarDays },
    { href: '/exam', label: t.nav.exam || 'પરીક્ષા & પરિણામ', icon: Award },
    { href: '/fees', label: t.nav.fees, icon: ReceiptIndianRupee },
    { href: '/rojmel', label: t.nav.rojmel, icon: BookOpenCheck, badge: 'ગુજરાતી' },
    { href: '/accounting', label: t.nav.accounting, icon: Scale },
    { href: '/grants', label: t.nav.grants || 'અનુદાન & ગ્રાન્ટ', icon: Landmark },
    { href: '/reports', label: t.nav.reports, icon: FileSpreadsheet },
    { href: '/settings', label: t.nav.settings, icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col justify-between shrink-0 h-full min-h-screen border-r border-slate-800 shadow-xl md:shadow-none">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Banner */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-amber-400 tracking-wider">
              Apna
            </span>
            <span className="text-xl font-black text-blue-400 tracking-wider font-gujarati">
              સ્કૂલ
            </span>
            <span className="text-[10px] bg-blue-900/60 text-blue-300 font-bold px-1.5 py-0.5 rounded border border-blue-700">
              GUJARAT
            </span>
          </div>
          {/* Mobile Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation Menu */}
        <nav className="p-3 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all font-gujarati ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="text-xs">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors font-gujarati"
        >
          <LogOut className="w-4 h-4 text-red-400" />
          <span>{t.nav.logout}</span>
        </button>
      </div>
    </aside>
  );
}
