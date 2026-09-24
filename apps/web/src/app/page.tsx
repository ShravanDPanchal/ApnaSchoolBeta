'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Layers,
  Scale,
  ShieldCheck,
  Smartphone,
  UserCheck,
  Users,
  Award,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Clock,
  Music,
  FileCheck,
  MessageSquare,
  TrendingUp,
  Shirt,
  Sparkles,
  HelpCircle,
  Home,
  LogIn,
  UserPlus,
  Receipt,
} from 'lucide-react';

export default function HomePage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const premiumFeatures = [
    {
      title: 'રોજનીશી લેખન',
      desc: 'દૈનિક ઓનલાઇન નોંધ, દૈનિક ડાયરી અને સપ્તાહવાર શૈક્ષણિક સમયપત્રક આયોજન.',
      icon: BookOpen,
      href: '/login',
    },
    {
      title: 'પ્રોગ્રામ અહેવાલ પત્રક',
      desc: 'શાળામાં ઉજવાયેલા વિવિધ કાર્યક્રમો અને રાષ્ટ્રીય તહેવારોના રેડીમેડ અહેવાલો બનાવો.',
      icon: FileText,
      href: '/login',
    },
    {
      title: 'અધ્યયન નિષ્પત્તિ પ્રશ્ન બેંક',
      desc: 'તમારા ધોરણ, વિષય અને અધ્યયન નિષ્પત્તિ મુજબ આદર્શ પ્રશ્નપત્ર તૈયાર કરો.',
      icon: Layers,
      href: '/login',
    },
    {
      title: 'ઓટોમેટિક સમયપત્રક (Timetable)',
      desc: 'શાળાના શિક્ષકો અને ધોરણો મુજબ માત્ર ૫ સ્ટેપમાં શાળા સમયપત્રક વિભાજન.',
      icon: Calendar,
      href: '/login',
    },
    {
      title: 'સત્રાંત પરીક્ષા પરિણામ',
      desc: 'પ્રથમ અને દ્વિતીય સત્રાંત પરીક્ષાના માર્ક્સ એન્ટ્રી અને વિદ્યાર્થી પ્રોગ્રેસ કાર્ડ.',
      icon: Award,
      href: '/login',
    },
    {
      title: 'જનરલ રજીસ્ટર (e-GR)',
      desc: 'ડિજિટલ જનરલ રજીસ્ટર. કોઈપણ વિદ્યાર્થીનું નામ અથવા જી.આર. નંબર એક સેકન્ડમાં શોધો.',
      icon: GraduationCap,
      href: '/login',
    },
    {
      title: 'શાળા દૈનિક રોજમેળ',
      desc: 'હિસાબી હિસાબ કીતાબ એકદમ સરળ અને ઝડપી ઓટો-ગણતરી પદ્ધતિ સાથે રોજમેળ બનાવો.',
      icon: Scale,
      href: '/login',
    },
  ];

  const freeFeatures = [
    {
      title: 'બચત બેંક',
      desc: 'વિદ્યાર્થીઓની નાની બચત, જમા-ઉધાર અને ખાતાની વિગતોનું સરળ મેનેજમેન્ટ.',
      icon: Receipt,
      href: '/login',
    },
    {
      title: 'ફાઇલ લેબલ મેકર',
      desc: 'શાળાના તમામ ક્લાસ, રજીસ્ટર અને ઓફિસ ફાઇલો માટે આકર્ષક લેબલ્સ પ્રિન્ટ કરો.',
      icon: FileText,
      href: '/login',
    },
    {
      title: 'ઈ-પુસ્તકાલય વ્યવસ્થાપન',
      desc: 'તમારી શાળાની લાઈબ્રેરીમાં પુસ્તકોની નોંધણી અને આપ-લે મેનેજમેન્ટ.',
      icon: BookOpen,
      href: '/login',
    },
    {
      title: 'ત્રિમાસિક પરીક્ષા પત્રક',
      desc: 'ગુણ સ્લીપ અને વિગતવાર શૈક્ષણિક વિશ્લેષણ પત્રકો પ્રિન્ટ આઉટ સાથે.',
      icon: FileSpreadsheet,
      href: '/login',
    },
    {
      title: 'ડિજિટલ શિક્ષક પ્રોફાઇલ',
      desc: 'સેવાપોથીની મહત્વની દરેક અંગત વિગતો સુરક્ષિત સાચવો અને સિંગલ ક્લિક પ્રિન્ટ કરો.',
      icon: UserCheck,
      href: '/login',
    },
    {
      title: 'પત્રક A પ્રિન્ટ સહાયક',
      desc: 'પસંદ કરેલી અધ્યયન નિષ્પત્તિઓ અને વિદ્યાર્થીઓની યાદી સાથે તમારા વિષયવાર પત્રકો.',
      icon: FileCheck,
      href: '/login',
    },
    {
      title: 'આકર્ષક શાળા લોગો મેકર',
      desc: 'સરકારી ધોરણો મુજબ તમારી શાળાનો ભવ્ય નવો લોગો ડિઝાઇન કરો.',
      icon: Award,
      href: '/login',
    },
    {
      title: 'શાળા લેટરપેડ ડાઉનલોડર',
      desc: 'અધિકૃત લખાણ માટે આકર્ષક અને પ્રોફેશનલ લેટરપેડ ડિઝાઇન પ્રિન્ટ આઉટ.',
      icon: FileText,
      href: '/login',
    },
    {
      title: 'રજા અહેવાલ પત્રક',
      desc: 'પ્રોફેશનલ રાબેતા મુજબ રજા રિપોર્ટ ઓટોમેટીક પીડીએફ (PDF) ડાઉનલોડ કરો.',
      icon: Calendar,
      href: '/login',
    },
    {
      title: 'નવા વાલી/સર્વેક્ષણ ફોર્મ',
      desc: 'પ્રથમ ધોરણના નવા પ્રવેશ અર્થે વાલી માહિતી એકત્રીકરણ સર્વે ફોર્મ.',
      icon: Users,
      href: '/login',
    },
    {
      title: 'દૈનિક લોગબુક રજીસ્ટર',
      desc: 'શાળાના આચાર્યશ્રીઓ માટેની દૈનિક વહીવટી લોગબુક ડાયરી ડિજિટલાઇઝેશન.',
      icon: BookOpen,
      href: '/login',
    },
    {
      title: 'આજનું ગુલાબ / દિપક ફ્રેમ',
      desc: 'દિવસના શ્રેષ્ઠ બાળકના ફોટા સાથે આકર્ષક સન્માનિત ફ્રેમ સોશ્યલ મીડિયા માટે બનાવો.',
      icon: Sparkles,
      href: '/login',
    },
    {
      title: 'વિદ્યાર્થી ઉંમર કેલ્ક્યુલેટર',
      desc: 'બાળકની જન્મતારીખ દાખલ કરી કાનૂની વય અને કયા ધોરણમાં પ્રવેશ મળવા પાત્ર છે તે ગણો.',
      icon: Clock,
      href: '/login',
    },
  ];

  const faqs = [
    {
      q: 'અપના સ્કૂલ પોર્ટલનો ઉપયોગ કોણ કરી શકે?',
      a: 'ગુજરાત રાજ્યની તમામ સરકારી પ્રાથમિક શાળાઓ, ગ્રાન્ટેડ શાળાઓ, સ્વનિર્ભર શાળાઓ, આચાર્યશ્રીઓ, શિક્ષકો અને સંચાલકો આ પોર્ટલનો ઉપયોગ કરી શકે છે.',
    },
    {
      q: 'શું તમામ સુવિધાઓ ગુજરાત સરકારના નિયમો મુજબ છે?',
      a: 'હા, પત્રક A, B, C, D, પ્રગતિ પત્રક (Progress Card), e-GR અને શ્રી રોજમેળ સંપૂર્ણપણે GSEB અને GCERT ગાંધીનગરના પરિપત્રો અનુસાર માન્ય છે.',
    },
    {
      q: 'અમારો શાળાનો ડેટા કેટલો સુરક્ષિત છે?',
      a: 'તમારો ડેટા ૨૫૬-બીટ SSL એન્ક્રિપ્શન સાથે ૧૦૦% સુરક્ષિત ક્લાઉડ સર્વર પર સંગ્રહિત થાય છે અને દૈનિક ઓટો-બેકઅપ સુવિધા ઉપલબ્ધ છે.',
    },
  ];

  const testimonials = [
    {
      quote: 'અપના સ્કૂલ આવ્યા પછી પત્રક-અ અને પત્રક-બ બનાવવામાં અમારો દિવસોનો સમય બચી ગયો છે. ગણતરીમાં એકપણ ભૂલ નથી આવતી.',
      name: 'રમેશભાઈ પટેલ',
      role: 'મુખ્ય શિક્ષક',
      district: 'અમદાવાદ',
    },
    {
      quote: 'દૈનિક રોજનીશી અને વિદ્યાર્થી હાજરી મોબાઈલમાંથી જ ભરાઈ જાય છે. ગુજરાતના શિક્ષકો માટે આ એક ઉત્તમ આશીર્વાદરૂપ પોર્ટલ છે.',
      name: 'ભાવનાબેન જોશી',
      role: 'સહાયક શિક્ષિકા',
      district: 'સુરત',
    },
    {
      quote: 'શ્રી રોજમેળ અને સરકારી ગ્રાન્ટનો હિસાબ રાખવો હવે ખૂબ સરળ બન્યો છે. વાર્ષિક ઓડિટમાં એક પણ પ્રશ્ન નથી આવતો.',
      name: 'કિરીટસિંહ જાડેજા',
      role: 'આચાર્યશ્રી',
      district: 'રાજકોટ',
    },
    {
      quote: '૩-સ્તરીય ફી પાવતી અને બાકી ફીનું મોડ્યુલ અમારા વહીવટી સ્ટાફ માટે અત્યંત ઉપયોગી સાબિત થયું છે. વાલીઓને તુરંત પહોંચ મળે છે.',
      name: 'દિનેશભાઈ પંચાલ',
      role: 'સંચાલક',
      district: 'વડોદરા',
    },
    {
      quote: 'GCERT માન્ય પરિણામ પત્રકો અને e-GR નું આર્કાઇવિંગ ખૂબ જ વ્યવસ્થિત છે. દરેક ગુજરાતી શાળાએ આ વાપરવું જોઈએ.',
      name: 'મહેશભાઈ ચૌધરી',
      role: 'વરિષ્ઠ શિક્ષક',
      district: 'ભાવનગર',
    },
    {
      quote: 'નવા સત્રમાં વિદ્યાર્થીઓની ઉંમર ગણતરી અને LC જનરેટરથી એડમિશનનું કામ અડધા સમયમાં પૂર્ણ થઈ ગયું.',
      name: 'અશ્વિનભાઈ રાઠોડ',
      role: 'શિક્ષક મિત્ર',
      district: 'જૂનાગઢ',
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-[#333333] antialiased">
      {/* 1. TOP BAR */}
      <div className="bg-[#007ed4] text-white text-sm py-1.5 px-4 sm:px-6">
        <div className="max-w-[1320px] w-full mx-auto flex items-center justify-between font-gujarati">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs sm:text-sm">શૈક્ષણિક પોર્ટલ</span>
          </div>
        </div>
      </div>

      {/* 2. HEADER */}
      <header className="bg-white border-b-[3px] border-[#EEAA00] py-3.5 px-4 sm:px-6">
        <div className="max-w-[1320px] w-full mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1 font-gujarati">
            <h1 className="text-3xl sm:text-4xl font-bold">
              <span className="text-[#EEAA00]">અપના</span>{' '}
              <span className="text-[#389CE0]">સ્કૂલ</span>
            </h1>
          </Link>

          <div className="hidden sm:flex items-center">
            <span className="bg-[#f8f9fa] text-[#333333] text-xs font-semibold px-3 py-1.5 rounded border border-[#e2e8f0] flex items-center gap-1.5 font-gujarati">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              શૈક્ષણિક વર્ષ: ૨૦૨૬-૨૭
            </span>
          </div>
        </div>
      </header>

      {/* 3. NAVIGATION BAR */}
      <nav className="bg-[#007ed4] text-white shadow-sm">
        <div className="max-w-[1320px] w-full mx-auto px-4 sm:px-6 flex items-center justify-between h-11 font-gujarati">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-white/10 text-white font-semibold text-sm"
            >
              <Home className="w-4 h-4" />
              <span>હોમ</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="flex items-center gap-1 px-3 py-1 text-sm font-semibold text-white hover:bg-white/10 rounded transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>લૉગિન</span>
            </Link>
            <Link
              href="/login?mode=register"
              className="flex items-center gap-1 bg-[#198754] hover:bg-[#157347] text-white text-xs sm:text-sm font-semibold px-3 py-1.5 rounded transition-all shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>નવું રજીસ્ટ્રેશન</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* 4. HERO SECTION */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 border-b border-[#e2e8f0] bg-gradient-to-b from-[#007ed4]/[0.03] to-white">
        <div className="max-w-[1320px] w-full mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left Column */}
            <div className="md:col-span-7 space-y-4 text-left font-gujarati">
              <h2 className="text-2xl sm:text-3xl lg:text-[2.25rem] font-bold text-[#333333] leading-[1.55] sm:leading-[1.5] lg:leading-[1.45]">
                ગુજરાતની શાળા અને શિક્ષકો માટેનું{' '}
                <span className="text-[#007ed4]">નંબર 1 શૈક્ષણિક પોર્ટલ</span>
              </h2>

              <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
                શૈક્ષણિક પરિપત્રો, પત્રકો, હાજરી પત્રક, રોજનીશી, પરિણામ પત્રક, રોજમેળ અને શાળાકીય હિસાબોની સરળ સુવિધાઓ એક જ જગ્યાએ ઉપલબ્ધ છે.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/login?mode=register"
                  className="bg-[#007ed4] hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded shadow-sm transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  નવું રજીસ્ટ્રેશન કરો
                </Link>
                <Link
                  href="/login"
                  className="bg-[#e7f1ff] hover:bg-blue-100 text-[#007ed4] font-semibold text-sm px-5 py-2.5 rounded border border-blue-200 transition-all flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  શિક્ષક લૉગિન
                </Link>
              </div>

              {/* Checkmarks */}
              <div className="pt-2 space-y-1.5 text-xs sm:text-sm text-[#555555]">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✔</span>
                  <span>GCERT અને GSEB માન્ય પદ્ધતિ</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✔</span>
                  <span>૧૦૦% સુરક્ષિત ક્લાઉડ ડેટા</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✔</span>
                  <span>ગુજરાતી અને અંગ્રેજી બન્ને ભાષામાં ઉપલબ્ધ</span>
                </div>
              </div>
            </div>

            {/* Right Column (Mobile App Promo Box) */}
            <div className="md:col-span-5">
              <div className="bg-white rounded-lg border border-[#e2e8f0] p-6 text-center shadow-sm font-gujarati">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#f1f5f9] border border-blue-200 flex items-center justify-center text-[#007ed4] mb-3">
                  <Smartphone className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-[#333333]">
                  અમારા મોબાઈલ એપ્લિકેશન
                </h3>
                <p className="text-xs sm:text-sm text-[#777777] mt-1 mb-4">
                  તમારા સ્માર્ટફોન પર શાળાનું સંચાલન કરો
                </p>

                <a
                  href="https://play.google.com/store"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-[#212529] hover:bg-black text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  <span className="text-amber-400 font-bold">▶</span>
                  <span>Google Play પરથી મેળવો</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION: ONLINE PREMIUM (PAID) FEATURES */}
      <section className="py-8 px-4 sm:px-6 max-w-[1320px] w-full mx-auto">
        <div className="border-b-2 border-[#EEAA00] pb-2 mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-[#007ed4] font-gujarati">
            ઓનલાઈન પ્રીમિયમ (પેઈડ) સુવિધાઓ
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {premiumFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Link
                key={idx}
                href={feat.href}
                className="bg-white rounded border border-[#e2e8f0] border-l-4 border-l-[#007ed4] p-4 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-l-[#EEAA00] transition-all block group font-gujarati"
              >
                <div className="w-12 h-12 rounded bg-[#F1F5F9] group-hover:bg-[#007ed4] text-[#007ed4] group-hover:text-white flex items-center justify-center mb-3 transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-[#333333] group-hover:text-[#007ed4] transition-colors">
                  {feat.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#666666] mt-1.5 leading-relaxed">
                  {feat.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 6. SECTION: 100% FREE FEATURES */}
      <section className="py-8 px-4 sm:px-6 max-w-[1320px] w-full mx-auto">
        <div className="border-b-2 border-[#EEAA00] pb-2 mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-[#007ed4] font-gujarati">
            ૧૦૦% વિનામૂલ્યે (ફ્રી) સુવિધાઓ
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {freeFeatures.map((free, idx) => {
            const Icon = free.icon;
            return (
              <Link
                key={idx}
                href={free.href}
                className="bg-white rounded border border-[#e2e8f0] border-l-4 border-l-[#007ed4] p-4 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-l-[#EEAA00] transition-all block group font-gujarati"
              >
                <div className="w-12 h-12 rounded bg-[#F1F5F9] group-hover:bg-[#007ed4] text-[#007ed4] group-hover:text-white flex items-center justify-center mb-3 transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-[#333333] group-hover:text-[#007ed4] transition-colors">
                  {free.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#666666] mt-1.5 leading-relaxed">
                  {free.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 7. SECTION: HOW TO GET STARTED */}
      <section className="py-8 px-4 sm:px-6 max-w-[1320px] w-full mx-auto">
        <div className="bg-gradient-to-r from-[#007ed4] to-[#0F172A] text-white rounded-xl p-6 sm:p-8 shadow-md border-b-4 border-[#EEAA00] text-center font-gujarati">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            પોર્ટલ પર કેવી રીતે કામ શરૂ કરવું?
          </h3>
          <p className="text-xs sm:text-sm text-blue-100 mb-6">
            માત્ર ૩ સરળ સ્ટેપમાં તમારી શાળાનું ડિજિટલ સંચાલન શરૂ કરો
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-left">
            <div className="bg-white/10 rounded-lg p-4 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-[#EEAA00] text-slate-900 font-bold flex items-center justify-center text-sm mb-2">
                ૧
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white">ખાતું બનાવો</h4>
              <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                તમારી શાળાની સામાન્ય વિગત સાથે ૧ મિનિટમાં રજીસ્ટ્રેશન કરો.
              </p>
            </div>

            <div className="bg-white/10 rounded-lg p-4 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-[#EEAA00] text-slate-900 font-bold flex items-center justify-center text-sm mb-2">
                ૨
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white">વિદ્યાર્થીઓ ઉમેરો</h4>
              <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                એક્સેલ શીટ અથવા ફોર્મ દ્વારા વિદ્યાર્થીઓનો ડેટા દાખલ કરો.
              </p>
            </div>

            <div className="bg-white/10 rounded-lg p-4 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-[#EEAA00] text-slate-900 font-bold flex items-center justify-center text-sm mb-2">
                ૩
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white">સુવિધાઓ શરૂ કરો</h4>
              <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                હાજરી, પત્રકો, ફી રસીદ અને રોજમેળ ડાઉનલોડ કરો.
              </p>
            </div>
          </div>

          <Link
            href="/login?mode=register"
            className="inline-flex items-center gap-1.5 bg-[#EEAA00] hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm px-6 py-2.5 rounded shadow transition-all"
          >
            <span>અત્યારે જ રજીસ્ટ્રેશન કરો</span>
            <span>&gt;</span>
          </Link>
        </div>
      </section>

      {/* 8. SECTION: FAQ ACCORDION */}
      <section className="py-6 px-4 sm:px-6 max-w-[1320px] w-full mx-auto">
        <div className="bg-[#f8f9fa] rounded-xl border border-[#e2e8f0] p-5 font-gujarati">
          <div className="flex items-center gap-2 text-[#007ed4] font-bold text-base sm:text-lg mb-4 pb-2 border-b border-[#e2e8f0]">
            <HelpCircle className="w-5 h-5" />
            <span>વારંવાર પૂછાતા પ્રશ્નો (FAQ)</span>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded border border-[#e2e8f0] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full text-left p-3.5 flex items-center justify-between text-xs sm:text-sm font-bold text-[#333333] hover:text-[#007ed4] transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#007ed4] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-3.5 pb-3.5 text-xs sm:text-sm text-[#666666] leading-relaxed border-t border-[#f1f1f1] pt-2">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. SECTION: LIVE STATISTICS COUNTERS */}
      <section className="py-6 px-4 sm:px-6 max-w-[1320px] w-full mx-auto">
        <div className="bg-[#f8f9fa] rounded-xl border border-[#e2e8f0] p-4 sm:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-gujarati">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-[#007ed4]">૨૦,૦૦૦+</p>
              <p className="text-xs sm:text-sm text-[#777777] mt-0.5">સક્રિય વિદ્યાર્થીઓ</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-[#007ed4]">૮૦,૦૦૦+</p>
              <p className="text-xs sm:text-sm text-[#777777] mt-0.5">જનરેટ કરેલા પત્રકો</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-[#007ed4]">૨,૫૦,૦૦૦+</p>
              <p className="text-xs sm:text-sm text-[#777777] mt-0.5">ડિજિટલ હાજરી</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-[#007ed4]">૨૫,૦૦૦+</p>
              <p className="text-xs sm:text-sm text-[#777777] mt-0.5">ખુશ શિક્ષકો</p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. SECTION: TEACHER TESTIMONIALS */}
      <section className="py-8 px-4 sm:px-6 max-w-[1320px] w-full mx-auto">
        <div className="border-b-2 border-[#EEAA00] pb-2 mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-[#007ed4] font-gujarati flex items-center gap-2">
            <span>⚽</span> ગુજરાતના શિક્ષકોના અભિપ્રાય
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-gujarati">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded border border-[#e2e8f0] p-4 shadow-sm flex flex-col justify-between"
            >
              <p className="text-xs sm:text-sm text-[#555555] leading-relaxed italic">
                "{t.quote}"
              </p>
              <div className="mt-4 pt-2.5 border-t border-[#f1f1f1] flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#007ed4] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {t.name.slice(0, 1)}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#333333]">{t.name}</p>
                  <p className="text-[11px] text-[#888888]">
                    {t.role} • {t.district}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 11. SECTION: TRUST BADGES */}
      <section className="py-6 px-4 sm:px-6 bg-[#007ed4] text-white">
        <div className="max-w-[1320px] w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-3.5 flex items-center gap-3 border border-white/15">
            <div className="w-10 h-10 rounded bg-cyan-400 text-slate-900 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">SECURE WITH SSL</p>
              <p className="text-[11px] text-blue-100">256-BIT ENCRYPTION</p>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-3.5 flex items-center gap-3 border border-white/15">
            <div className="w-10 h-10 rounded bg-emerald-400 text-slate-900 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">99.9% UPTIME</p>
              <p className="text-[11px] text-blue-100">24/7 CLOUD HOSTING</p>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-3.5 flex items-center gap-3 border border-white/15">
            <div className="w-10 h-10 rounded bg-gradient-to-b from-orange-400 via-white to-green-600 text-blue-900 flex items-center justify-center shrink-0 font-bold">
              🇮🇳
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">PROUDLY MADE IN INDIA</p>
              <p className="text-[11px] text-blue-100">GUJARAT SPECIAL EDITION</p>
            </div>
          </div>
        </div>
      </section>

      {/* 12. FOOTER */}
      <footer className="bg-[#007ed4] text-white pt-6 pb-4 px-4 sm:px-6 font-gujarati border-t border-blue-400/30">
        <div className="max-w-[1320px] w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-white/15 text-xs">
          <div>
            <h5 className="font-bold text-[#EEAA00] text-sm mb-2">સંપર્ક માહિતી</h5>
            <p className="text-blue-100">Email: support@apnaschool.in</p>
            <p className="text-blue-100 mt-1">ગાંધીનગર & અમદાવાદ, ગુજરાત</p>
          </div>

          <div>
            <h5 className="font-bold text-[#EEAA00] text-sm mb-2">નીતિઓ</h5>
            <ul className="space-y-1 text-blue-100">
              <li>
                <Link href="/" className="hover:underline">
                  &gt; Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:underline">
                  &gt; Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-[#EEAA00] text-sm mb-2">લઘુ લિંક્સ</h5>
            <ul className="space-y-1 text-blue-100">
              <li>
                <Link href="/" className="hover:underline">
                  &gt; હોમ
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:underline">
                  &gt; લૉગિન
                </Link>
              </li>
              <li>
                <Link href="/login?mode=register" className="hover:underline">
                  &gt; નવું રજીસ્ટ્રેશન
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1320px] w-full mx-auto pt-3 flex flex-col sm:flex-row items-center justify-between text-[11px] text-blue-100">
          <p>© ૨૦૨૬ અપના સ્કૂલ. All Rights Reserved.</p>
          <p>GCERT & GSEB Gujarat Compliant</p>
        </div>
      </footer>
    </div>
  );
}
