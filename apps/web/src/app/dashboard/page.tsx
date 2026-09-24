'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

interface DashboardCardItem {
  id: string;
  title: string;
  iconClass: string;
  href: string;
  desc?: string;
  badge?: string;
  badgeColor?: string;
  tag?: string;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({
    gunotsav: true,
    rojnishi_sem1_3to8: true,
    varg_mulyankan: true,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('apna_school_favs');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('apna_school_favs', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // 1. શિક્ષક બોર્ડ (Teacher Board) - 12 items
  const teacherBoardItems: DashboardCardItem[] = [
    {
      id: 'gunotsav',
      title: 'ગુણોત્સવ',
      iconClass: 'bi bi-file-earmark-arrow-up',
      badge: 'NEW',
      badgeColor: 'bg-[#dc3545]',
      href: '/pricing?feature=gunotsav',
    },
    {
      id: 'rojnishi_sem1_3to8',
      title: 'રોજનીશી (સત્ર-૧) (3 to 8)',
      iconClass: 'bi bi-calendar3',
      href: '/pricing?feature=rojnishi',
    },
    {
      id: 'balvatika_rojnishi',
      title: 'બાલવાટિકા રોજનીશી (સત્ર-૧)',
      iconClass: 'bi bi-grid-3x3',
      href: '/pricing?feature=balvatika_rojnishi',
    },
    {
      id: 'std1_rojnishi',
      title: 'ધોરણ 1 રોજનીશી (26-27)',
      iconClass: 'bi bi-grid-3x3',
      href: '/pricing?feature=std1_rojnishi',
    },
    {
      id: 'std2_rojnishi',
      title: 'ધોરણ 2 રોજનીશી (26-27)',
      iconClass: 'bi bi-grid-3x3',
      href: '/pricing?feature=std2_rojnishi',
    },
    {
      id: 'aheval',
      title: 'અહેવાલ',
      iconClass: 'bi bi-card-text',
      href: '/pricing?feature=aheval',
    },
    {
      id: 'patrak_a_papers',
      title: 'પત્રક-A પ્રશ્નપેપર્સ',
      iconClass: 'bi bi-p-square',
      href: '/exam/patrak-a',
    },
    {
      id: 'samaypatrak',
      title: 'સમયપત્રક',
      iconClass: 'bi bi-calendar3',
      href: '/pricing?feature=samaypatrak',
    },
    {
      id: 'exam_result',
      title: 'પરીક્ષા પરિણામ',
      iconClass: 'bi bi-card-checklist',
      href: '/pricing?feature=exam_result',
    },
    {
      id: 'past_year_result',
      title: 'અગાઉ વર્ષનું પરીક્ષા પરિણામ',
      iconClass: 'bi bi-card-checklist',
      href: '/pricing?feature=past_year_result',
    },
    {
      id: 'egr',
      title: 'જનરલ રજીસ્ટર',
      tag: '(eGR)',
      iconClass: 'bi bi-book',
      href: '/pricing?feature=egr',
    },
    {
      id: 'rojmel',
      title: 'રોજમેળ',
      iconClass: 'bi bi-book',
      href: '/pricing?feature=rojmel',
    },
  ];

  // 2. શિક્ષક ઉપયોગી સાધનો (Teacher Utility Tools) - 15 items
  const teacherUtilityItems: DashboardCardItem[] = [
    {
      id: 'bachat_bank',
      title: 'બચત બેંક',
      iconClass: 'bi bi-currency-rupee',
      desc: 'વિદ્યાર્થીઓની ખાતાની વિગતોનું સરળ મેનેજમેન્ટ',
      badge: 'NEW',
      badgeColor: 'bg-[#198754]',
      href: '/accounting',
    },
    {
      id: 'e_library',
      title: 'ઈ-પુસ્તકાલય',
      iconClass: 'bi bi-book-half',
      desc: 'તમારી શાળાના પુસ્તકાલયનું સંચાલન કરો',
      href: '/reports',
    },
    {
      id: 'file_label_maker',
      title: 'ફાઇલ લેબલ મેકર',
      iconClass: 'bi bi-file-earmark-text',
      desc: 'ફાઈલો માટે આકર્ષક લેબલ્સ પ્રિન્ટ કરો',
      badge: 'NEW',
      badgeColor: 'bg-[#198754]',
      href: '/reports',
    },
    {
      id: 'lc_download',
      title: 'LC ડાઉનલોડ કરો',
      iconClass: 'bi bi-person-vcard',
      desc: 'નવા ગુજરાતી/અંગ્રેજી ફોર્મેટ મુજબ',
      href: '/students/transfer',
    },
    {
      id: 'balvatika_hpc',
      title: 'બાલવાટિકા HPC પરિણામ',
      iconClass: 'bi bi-balloon',
      desc: 'નવા ફોર્મેટ મુજબ',
      href: '/hpc/balvatika',
    },
    {
      id: 'std1_hpc',
      title: 'ધોરણ-1 HPC પરિણામ',
      iconClass: 'bi bi-1-circle',
      desc: 'નવા ફોર્મેટ મુજબ',
      href: '/hpc/std1',
    },
    {
      id: 'std2_hpc',
      title: 'ધોરણ-2 HPC પરિણામ',
      iconClass: 'bi bi-2-circle',
      desc: 'નવા ફોર્મેટ મુજબ',
      href: '/hpc/std2',
    },
    {
      id: 'teacher_profile',
      title: 'શિક્ષક પ્રોફાઇલ',
      iconClass: 'bi bi-person-circle',
      desc: 'તમારી દરેક વિગત સાચવો/પ્રિન્ટ કરો',
      href: '/staff',
    },
    {
      id: 'trimasik_exam',
      title: 'ત્રિમાસિક પરીક્ષા',
      iconClass: 'bi bi-pencil-square',
      desc: 'ગુણ સ્લીપ અને વિશ્લેષણ સાથે',
      href: '/exam/trimasik',
    },
    {
      id: 'patrak_a_print',
      title: 'પત્રક A પ્રિન્ટ',
      iconClass: 'bi bi-card-text',
      desc: 'અધ્યયન નિષ્પત્તિ + વિદ્યાર્થી સાથે પત્રક A તૈયાર કરો',
      href: '/exam/patrak-a',
    },
    {
      id: 'school_logo_maker',
      title: 'શાળા લોગો બનાવો',
      iconClass: 'bi bi-flower1',
      desc: 'તમારી શાળાનો આકર્ષક લોગો બનાવો',
      href: '/settings',
    },
    {
      id: 'school_letterhead',
      title: 'શાળા લેટરપેડ',
      iconClass: 'bi bi-card-heading',
      desc: 'તમારી શાળાનું આકર્ષક લેટરપેડ બનાવો',
      href: '/reports/letterpad',
    },
    {
      id: 'wali_survey_form',
      title: 'વાલી ફોર્મ/સર્વે ફોર્મ',
      iconClass: 'bi bi-card-checklist',
      desc: 'PDF ડાઉનલોડ સાથે',
      href: '/students/survey',
    },
    {
      id: 'leave_report',
      title: 'રજા રિપોર્ટ',
      iconClass: 'bi bi-file-earmark-ruled',
      desc: 'PDF ડાઉનલોડ સાથે',
      href: '/attendance/staff/leave-report',
    },
    {
      id: 'dipak_frame',
      title: 'આજનું ગુલાબ / દિપક ફ્રેમ બનાવો',
      iconClass: 'bi bi-image',
      desc: 'વિદ્યાર્થીની તસવીર માટે સુંદર ફ્રેમ બનાવો',
      href: '/reports/frame-generator',
    },
  ];

  // 3. શાળા અને વર્ગખંડ વિગત (School & Classroom Details) - 4 items
  const schoolClassroomItems: DashboardCardItem[] = [
    {
      id: 'student_management',
      title: 'વિદ્યાર્થી મેનેજમેન્ટ',
      iconClass: 'bi bi-person',
      desc: 'દરેક ધોરણ અને વર્ગમાં રહેલ વિદ્યાર્થીની વિગત જુઓ અને બદલાવો.',
      href: '/students',
    },
    {
      id: 'school_details',
      title: 'શાળા વિગત ઉમેરો',
      iconClass: 'bi bi-building',
      desc: 'આ વિગત તમને દરેક જગ્યાએ PDF બનાવવામાં મદદરૂપ થશે',
      href: '/reports/letterpad',
    },
    {
      id: 'classroom_details',
      title: 'વર્ગખંડની વિગત',
      iconClass: 'bi bi-layout-split',
      desc: 'આ વિગત તમને દરેક જગ્યાએ PDF બનાવવામાં મદદરૂપ થશે',
      href: '/user/classroom',
    },
    {
      id: 'downloads',
      title: 'ડાઉનલોડ્સ',
      iconClass: 'bi bi-download',
      desc: 'અપના સ્કૂલમાં જનરેટ કરેલ PDF અહીં જોઈ શકાશે.',
      href: '/reports',
    },
  ];

  // 4. આચાર્ય વિભાગ (Principal Section)
  const principalItems: DashboardCardItem[] = [
    {
      id: 'varg_mulyankan',
      title: 'વર્ગ મૂલ્યાંકન',
      iconClass: 'bi bi-file-earmark-ruled',
      desc: 'Log Book',
      href: '/timetable',
    },
  ];

  // All dashboard items for dynamic favorite lookup
  const allDashboardItems: DashboardCardItem[] = [
    ...teacherBoardItems,
    ...teacherUtilityItems,
    ...schoolClassroomItems,
    ...principalItems,
  ];

  const starredItems = allDashboardItems.filter((item) => !!favorites[item.id]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#212529] font-gujarati antialiased pb-12">
      {/* TOP HEADER */}
      <header className="bg-white border-b border-[#dee2e6] py-3 px-4 sm:px-8 sticky top-0 z-30 shadow-none">
        <div className="max-w-[1320px] w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <Link href="/dashboard" className="inline-flex items-center text-[25px] font-bold tracking-tight">
              <span className="text-[#007ed4]">અપના</span>
              <span className="text-[#f59e0b] ml-1.5">સ્કૂલ</span>
            </Link>
            <span className="text-[#6c757d] text-[15px] font-normal font-sans hidden sm:inline-block">
              Dashboard
            </span>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 text-[14.5px] text-[#495057] hover:text-[#212529] font-normal py-1.5 px-2.5 rounded transition-colors"
            >
              <span>Shravan Panchal</span>
              <i className="bi bi-caret-down-fill text-[10px] text-[#6c757d]"></i>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-[4px] shadow-lg border border-[#dee2e6] py-1.5 z-50 text-[14px] animate-in fade-in zoom-in-95">
                <Link
                  href="/user/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="block px-4 py-2 text-[#212529] hover:bg-[#f8f9fa] font-normal"
                >
                  યુઝરની વિગત
                </Link>
                <div className="border-t border-[#dee2e6] my-1"></div>
                <Link
                  href="/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="block px-4 py-2 text-[#212529] hover:bg-[#f8f9fa] font-normal"
                >
                  શાળાની વિગત
                </Link>
                <Link
                  href="/user/classroom"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="block px-4 py-2 text-[#212529] hover:bg-[#f8f9fa] font-normal"
                >
                  વર્ગખંડની વિગત
                </Link>
                <div className="border-t border-[#dee2e6] my-1"></div>
                <Link
                  href="/user/payment/history"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="block px-4 py-2 text-[#212529] hover:bg-[#f8f9fa] font-normal"
                >
                  પેમેન્ટ વિગત
                </Link>
                <div className="border-t border-[#dee2e6] my-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-[#212529] hover:bg-[#f8f9fa] font-normal"
                >
                  લોગ-આઉટ
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-[1320px] w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8 sm:space-y-10">
        {/* TOP BANNERS CONTAINER */}
        <div className="flex flex-col gap-3">
          {/* BANNER 1: Yellow Mobile App Banner */}
          <a
            href="https://play.google.com/store"
            target="_blank"
            rel="noreferrer"
            className="block bg-[#ffc107] hover:bg-[#ffca2c] text-[#000000] text-center py-2.5 px-4 rounded-[6px] font-bold text-[14.5px] sm:text-[15px] shadow-none transition-all cursor-pointer"
          >
            📲 અપના સ્કૂલની એન્ડ્રોઈડ એપ અહીં ક્લિક કરી ઇન્સ્ટોલ કરો.
          </a>

          {/* BANNER 2: Blue Exam Banner */}
          <a
            href="#exam"
            className="block bg-[#0d6efd] hover:bg-[#0b5ed7] text-white text-center py-2.5 px-4 rounded-[6px] font-bold text-[14.5px] sm:text-[15px] shadow-none transition-all flex items-center justify-center gap-2"
          >
            <span>✔ હવે HTAT અને સ્પર્ધાત્મક પરીક્ષાની તૈયારી કરો પરીક્ષા મોડ્યુલ સાથે</span>
            <i className="bi bi-box-arrow-up-right text-[12px]"></i>
          </a>
        </div>

        {/* FAVORITES / STARRED SECTION: મનપસંદ લિંક્સ */}
        {starredItems.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <i className="bi bi-star-fill text-[#f59e0b] text-xl"></i>
              <h2 className="text-[19px] font-bold text-[#f59e0b]">
                મનપસંદ લિંક્સ
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 pt-1">
              {starredItems.map((item) => (
                <Link
                  key={`fav-${item.id}`}
                  href={item.href}
                  className="bg-white rounded-[6px] border border-[#dee2e6] px-4 py-3 hover:border-[#b0c4de] hover:shadow-xs transition-all flex items-center justify-between group min-h-[48px]"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-1">
                    <i className={`${item.iconClass} text-[#0d6efd] text-[17px] shrink-0 leading-none`}></i>
                    <span className="text-[14.5px] sm:text-[15px] font-normal text-[#212529] group-hover:text-[#0d6efd] transition-colors truncate">
                      {item.title}
                    </span>
                    {item.tag && (
                      <span className="text-[12.5px] text-[#0d6efd] font-normal shrink-0 font-sans">
                        {item.tag}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Separator between favorites and regular sections */}
            <hr className="border-t border-[#dee2e6] mt-6 mb-2" />
          </section>
        )}

        {/* SECTION 1: શિક્ષક બોર્ડ */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <i className="bi bi-window text-[#0d6efd] text-xl shrink-0"></i>
            <h2 className="text-[18.5px] font-bold text-[#212529]">
              શિક્ષક બોર્ડ
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 pt-2">
            {teacherBoardItems.map((item) => {
              const isFav = !!favorites[item.id];
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="bg-white rounded-[6px] border border-[#dee2e6] px-4 py-3 hover:border-[#b0c4de] hover:shadow-xs transition-all flex items-center justify-between relative group min-h-[48px]"
                >
                  {item.badge && (
                    <span
                      className={`absolute -top-2.5 left-3 ${item.badgeColor} text-white text-[9.5px] font-bold px-2 py-0.5 rounded-full tracking-wider shadow-sm z-10`}
                    >
                      {item.badge}
                    </span>
                  )}

                  <div className="flex items-center gap-2.5 min-w-0 pr-1">
                    <i className={`${item.iconClass} text-[#0d6efd] text-[17px] shrink-0 leading-none`}></i>
                    <span className="text-[14.5px] sm:text-[15px] font-normal text-[#212529] group-hover:text-[#0d6efd] transition-colors truncate">
                      {item.title}
                    </span>
                    {item.tag && (
                      <span className="text-[12.5px] text-[#0d6efd] font-normal shrink-0 font-sans">
                        {item.tag}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(item.id, e)}
                    className="text-[#ced4da] hover:text-[#ffc107] p-0.5 shrink-0 transition-colors"
                    aria-label="Toggle Favorite"
                  >
                    <i
                      className={`bi ${
                        isFav ? 'bi-star-fill text-[#ffc107]' : 'bi-star'
                      } text-[16px]`}
                    ></i>
                  </button>
                </Link>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: શિક્ષક ઉપયોગી સાધનો + Free */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-1.5 h-5 bg-[#0d6efd] rounded-full inline-block shrink-0"></span>
            <h2 className="text-[18.5px] font-bold text-[#212529]">
              શિક્ષક ઉપયોગી સાધનો
            </h2>
            <span className="bg-[#198754] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full ml-1">
              + Free
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 pt-2">
            {teacherUtilityItems.map((item) => {
              const isFav = !!favorites[item.id];
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="bg-white rounded-[6px] border border-[#dee2e6] p-3.5 px-4 hover:border-[#b0c4de] hover:shadow-xs transition-all flex flex-col justify-between relative group min-h-[78px]"
                >
                  {item.badge && (
                    <span
                      className={`absolute -top-2.5 left-3 ${item.badgeColor} text-white text-[9.5px] font-bold px-2 py-0.5 rounded-full tracking-wider shadow-sm z-10`}
                    >
                      {item.badge}
                    </span>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <i className={`${item.iconClass} text-[#0d6efd] text-[17px] leading-none shrink-0`}></i>
                      <span className="text-[14.5px] sm:text-[15px] font-normal text-[#212529] group-hover:text-[#0d6efd] transition-colors truncate">
                        {item.title}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(item.id, e)}
                      className="text-[#ced4da] hover:text-[#ffc107] p-0.5 shrink-0 transition-colors"
                      aria-label="Toggle Favorite"
                    >
                      <i
                        className={`bi ${
                          isFav ? 'bi-star-fill text-[#ffc107]' : 'bi-star'
                        } text-[16px]`}
                      ></i>
                    </button>
                  </div>

                  <p className="text-[12.5px] sm:text-[13px] text-[#6c757d] mt-1.5 leading-normal font-normal line-clamp-1">
                    {item.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: શાળા અને વર્ગખંડ વિગત + Free */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-1.5 h-5 bg-[#0d6efd] rounded-full inline-block shrink-0"></span>
            <h2 className="text-[18.5px] font-bold text-[#212529]">
              શાળા અને વર્ગખંડ વિગત
            </h2>
            <span className="bg-[#198754] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full ml-1">
              + Free
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 pt-2">
            {schoolClassroomItems.map((item) => {
              const isFav = !!favorites[item.id];
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="bg-white rounded-[6px] border border-[#dee2e6] p-3.5 px-4 hover:border-[#b0c4de] hover:shadow-xs transition-all flex flex-col justify-between relative group min-h-[78px]"
                >
                  {item.badge && (
                    <span
                      className={`absolute -top-2.5 left-3 ${item.badgeColor} text-white text-[9.5px] font-bold px-2 py-0.5 rounded-full tracking-wider shadow-sm z-10`}
                    >
                      {item.badge}
                    </span>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <i className={`${item.iconClass} text-[#0d6efd] text-[17px] leading-none shrink-0`}></i>
                      <span className="text-[14.5px] sm:text-[15px] font-normal text-[#212529] group-hover:text-[#0d6efd] transition-colors truncate">
                        {item.title}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(item.id, e)}
                      className="text-[#ced4da] hover:text-[#ffc107] p-0.5 shrink-0 transition-colors"
                      aria-label="Toggle Favorite"
                    >
                      <i
                        className={`bi ${
                          isFav ? 'bi-star-fill text-[#ffc107]' : 'bi-star'
                        } text-[16px]`}
                      ></i>
                    </button>
                  </div>

                  <p className="text-[12.5px] sm:text-[13px] text-[#6c757d] mt-1.5 leading-normal font-normal line-clamp-1">
                    {item.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* SECTION 4: આચાર્ય વિભાગ + Free */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-1.5 h-5 bg-[#0d6efd] rounded-full inline-block shrink-0"></span>
            <h2 className="text-[18.5px] font-bold text-[#212529]">
              આચાર્ય વિભાગ
            </h2>
            <span className="bg-[#198754] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full ml-1">
              + Free
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 pt-2">
            {principalItems.map((item) => {
              const isFav = !!favorites[item.id];
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="bg-white rounded-[6px] border border-[#dee2e6] p-3.5 px-4 hover:border-[#b0c4de] hover:shadow-xs transition-all flex flex-col justify-between relative group min-h-[78px]"
                >
                  {item.badge && (
                    <span
                      className={`absolute -top-2.5 left-3 ${item.badgeColor} text-white text-[9.5px] font-bold px-2 py-0.5 rounded-full tracking-wider shadow-sm z-10`}
                    >
                      {item.badge}
                    </span>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <i className={`${item.iconClass} text-[#0d6efd] text-[17px] leading-none shrink-0`}></i>
                      <span className="text-[14.5px] sm:text-[15px] font-normal text-[#212529] group-hover:text-[#0d6efd] transition-colors truncate">
                        {item.title}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(item.id, e)}
                      className="text-[#ced4da] hover:text-[#ffc107] p-0.5 shrink-0 transition-colors"
                      aria-label="Toggle Favorite"
                    >
                      <i
                        className={`bi ${
                          isFav ? 'bi-star-fill text-[#ffc107]' : 'bi-star'
                        } text-[16px]`}
                      ></i>
                    </button>
                  </div>

                  <p className="text-[12.5px] sm:text-[13px] text-[#6c757d] mt-1.5 leading-normal font-normal line-clamp-1">
                    {item.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* SECURITY WARNING ALERT BANNER (Red) */}
        <div className="bg-[#dc3545] text-white text-center py-3 px-4 rounded-[6px] text-[13.5px] font-medium shadow-none mt-4">
          ⚠ અપના સ્કૂલ દ્વારા ક્યારે પણ ફોન કરી OTP પૂછવામાં આવતો નથી. સાયબર ફ્રોડથી સાવચેત રહો.
        </div>

        {/* CLEAN DASHBOARD FOOTER */}
        <footer className="pt-6 pb-6 flex items-center justify-between text-[13px] text-[#6c757d] border-t border-[#dee2e6] font-normal mt-6">
          <p>સંપર્ક: support@apnaschool.in</p>
          <p className="text-[#212529] font-normal">અપના સ્કૂલ (Apna School)</p>
        </footer>
      </main>
    </div>
  );
}
