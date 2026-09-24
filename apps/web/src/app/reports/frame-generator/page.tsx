'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function StudentFrameGeneratorPage() {
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Form State matching Reference Image 4
  const [frameType, setFrameType] = useState('aajnu_gulab'); // આજનું ગુલાબ
  const [designType, setDesignType] = useState('design_1'); // ડિઝાઇન ૧
  const [studentName, setStudentName] = useState('પટેલ આરવ નીલેશભાઈ');
  const [studentStd, setStudentStd] = useState('ધોરણ ૫ (અ)');
  const [studentPhoto, setStudentPhoto] = useState<string | null>(null);
  const [customQuote, setCustomQuote] = useState('જેમ ગુલાબ તેની સુગંધથી બાગને મહેકાવે છે, તેમ જ્ઞાનથી જીવન મહેકે છે.');
  const [schoolName, setSchoolName] = useState('શ્રી સરસ્વતી વિદ્યા મંદિર');
  const [isGenerating, setIsGenerating] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    try {
      const savedSchool = localStorage.getItem('apna_school_details');
      if (savedSchool) {
        const d = JSON.parse(savedSchool);
        if (d.schoolNameGu) setSchoolName(d.schoolNameGu);
      }
    } catch (e) {}
  }, []);

  // Update quotes when frame type changes
  useEffect(() => {
    if (frameType === 'aajnu_gulab') {
      setCustomQuote('જેમ ગુલાબ તેની સુગંધથી બાગને મહેકાવે છે, તેમ જ્ઞાનથી જીવન મહેકે છે.');
    } else if (frameType === 'aajno_dipak') {
      setCustomQuote('દીપક પોતે બળીને સમગ્ર સંસારને પ્રકાશ આપે છે - શિક્ષણ એ જ સાચો દીપક છે.');
    } else if (frameType === 'birthday') {
      setCustomQuote('આપના જીવનમાં ખુશીઓ અને સફળતાનો સૂર્ય સદા પ્રકાશમાન રહે - જન્મદિવસ મુબારક!');
    } else if (frameType === 'honour') {
      setCustomQuote('શ્રેષ્ઠ શિસ્ત, ઉત્સાહ અને અથાક પરિશ્રમ દ્વારા શાળાનું ગૌરવ વધારવા બદલ અભિનંદન!');
    }
  }, [frameType]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setStudentPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getFrameTitle = () => {
    switch (frameType) {
      case 'aajnu_gulab':
        return '🌹 આજનું ગુલાબ 🌹';
      case 'aajno_dipak':
        return '🪔 આજનો દીપક 🪔';
      case 'birthday':
        return '🎂 જન્મદિવસની હાર્દિક શુભકામનાઓ 🎂';
      case 'honour':
        return '🏆 વિદ્યાર્થી સન્માન ફ્રેમ 🏆';
      default:
        return '⭐ શ્રેષ્ઠ વિદ્યાર્થી ⭐';
    }
  };

  // Direct High-Resolution PNG Image Generator & Downloader
  const handleDownloadImage = async () => {
    setIsGenerating(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = 900;
      const height = 1150;
      canvas.width = width;
      canvas.height = height;

      // Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Gradient Inner
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      if (designType === 'design_1') {
        grad.addColorStop(0, '#FFFBEB');
        grad.addColorStop(0.5, '#FFFFFF');
        grad.addColorStop(1, '#FFFBEB');
      } else if (designType === 'design_2') {
        grad.addColorStop(0, '#FFF1F2');
        grad.addColorStop(0.5, '#FFFFFF');
        grad.addColorStop(1, '#FFE4E6');
      } else if (designType === 'design_3') {
        grad.addColorStop(0, '#FFF7ED');
        grad.addColorStop(0.5, '#FFFFFF');
        grad.addColorStop(1, '#FFEDD5');
      } else {
        grad.addColorStop(0, '#F0F9FF');
        grad.addColorStop(0.5, '#FFFFFF');
        grad.addColorStop(1, '#E0F2FE');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(15, 15, width - 30, height - 30);

      // Border
      ctx.lineWidth = 14;
      if (designType === 'design_1') ctx.strokeStyle = '#EEAA00';
      else if (designType === 'design_2') ctx.strokeStyle = '#F43F5E';
      else if (designType === 'design_3') ctx.strokeStyle = '#F97316';
      else ctx.strokeStyle = '#007ED4';
      ctx.strokeRect(20, 20, width - 40, height - 40);

      // Inner thin border
      ctx.lineWidth = 2;
      ctx.strokeRect(32, 32, width - 64, height - 64);

      // Header Text
      ctx.textAlign = 'center';
      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 20px "Noto Sans Gujarati", sans-serif';
      ctx.fillText('ગુજરાત સરકાર શિક્ષણ વિભાગ', width / 2, 75);

      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 36px "Noto Sans Gujarati", sans-serif';
      ctx.fillText(schoolName, width / 2, 125);

      // Badge
      const badgeText = getFrameTitle();
      ctx.font = 'bold 26px "Noto Sans Gujarati", sans-serif';
      const badgeWidth = ctx.measureText(badgeText).width + 60;
      const badgeHeight = 48;
      const badgeX = (width - badgeWidth) / 2;
      const badgeY = 160;

      if (frameType === 'aajnu_gulab') ctx.fillStyle = '#E11D48';
      else if (frameType === 'aajno_dipak') ctx.fillStyle = '#F59E0B';
      else if (frameType === 'birthday') ctx.fillStyle = '#9333EA';
      else ctx.fillStyle = '#2563EB';

      // Rounded rect badge
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 24);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(badgeText, width / 2, badgeY + 34);

      // Photo rendering
      const photoCenterX = width / 2;
      const photoCenterY = 400;
      const photoRadius = 140;

      // Draw photo ring
      ctx.beginPath();
      ctx.arc(photoCenterX, photoCenterY, photoRadius + 8, 0, Math.PI * 2);
      ctx.fillStyle = designType === 'design_1' ? '#EEAA00' : designType === 'design_2' ? '#F43F5E' : '#007ED4';
      ctx.fill();

      if (studentPhoto) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = studentPhoto;
        await new Promise((resolve) => {
          img.onload = () => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(photoCenterX, photoCenterY, photoRadius, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, photoCenterX - photoRadius, photoCenterY - photoRadius, photoRadius * 2, photoRadius * 2);
            ctx.restore();
            resolve(true);
          };
          img.onerror = () => resolve(true);
        });
      } else {
        ctx.beginPath();
        ctx.arc(photoCenterX, photoCenterY, photoRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#E2E8F0';
        ctx.fill();
        ctx.fillStyle = '#94A3B8';
        ctx.font = 'bold 36px "Noto Sans Gujarati", sans-serif';
        ctx.fillText('વિદ્યાર્થી ફોટો', photoCenterX, photoCenterY + 12);
      }

      // Student Name & Standard
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 38px "Noto Sans Gujarati", sans-serif';
      ctx.fillText(studentName || 'વિદ્યાર્થીનું નામ', width / 2, 620);

      ctx.fillStyle = '#0284C7';
      ctx.font = 'bold 26px "Noto Sans Gujarati", sans-serif';
      ctx.fillText(studentStd || 'ધોરણ - વર્ગ', width / 2, 670);

      // Quote Box
      const quoteBoxY = 730;
      const quoteBoxWidth = 720;
      const quoteBoxHeight = 150;
      const quoteBoxX = (width - quoteBoxWidth) / 2;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(quoteBoxX, quoteBoxY, quoteBoxWidth, quoteBoxHeight, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#334155';
      ctx.font = 'italic 23px "Noto Sans Gujarati", sans-serif';
      
      // Wrap text in quote box
      const words = (`"${customQuote}"`).split(' ');
      let line = '';
      let curY = quoteBoxY + 60;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > quoteBoxWidth - 60 && n > 0) {
          ctx.fillText(line, width / 2, curY);
          line = words[n] + ' ';
          curY += 36;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, width / 2, curY);

      // Footer line
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 1020);
      ctx.lineTo(width - 80, 1020);
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = '20px "Noto Sans Gujarati", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`તારીખ: ${new Date().toLocaleDateString('gu-IN')}`, 80, 1065);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 22px "Noto Sans Gujarati", sans-serif';
      ctx.fillText('આચાર્યશ્રી / વર્ગ શિક્ષક', width - 80, 1065);

      // Trigger Direct Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${frameType}_${studentName || 'student'}.png`;
      link.href = dataUrl;
      link.click();

      showToast('ચિત્ર (.PNG) સફળતાપૂર્વક ડાઉનલોડ થઈ ગયું છે!');
    } catch (err) {
      // Fallback to print
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#212529] font-gujarati antialiased pb-16 print:p-0 print:m-0 print:bg-white">
      {/* TOP HEADER (HIDDEN ON PRINT) */}
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
      <main className="max-w-[1100px] w-full mx-auto px-4 py-6 space-y-4 print:p-0 print:m-0 print:max-w-none">
        {/* Breadcrumb matching Reference Image 4 */}
        <div className="flex items-center gap-1.5 text-[13px] text-[#6c757d] no-print">
          <Link href="/dashboard" className="text-[#0d6efd] hover:underline flex items-center gap-1">
            <i className="bi bi-house-door"></i>
          </Link>
          <span>/</span>
          <span>Student Frame Generator</span>
        </div>

        {/* Heading matching Reference Image 4 */}
        <h1 className="text-[22px] font-normal text-[#212529] pb-2 border-b border-[#dee2e6] no-print">
          વિવિધ વિદ્યાર્થી ફ્રેમ બનાવો
        </h1>

        {/* TWO-COLUMN GRID matching Reference Image 4 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pt-2 print:block">
          {/* LEFT COLUMN: FORM (HIDDEN ON PRINT) */}
          <div className="space-y-4 no-print">
            {/* Field 1: શું બનાવવું છે? */}
            <div>
              <label className="block text-[13px] font-normal text-[#212529] mb-1">
                શું બનાવવું છે?
              </label>
              <div className="relative">
                <select
                  value={frameType}
                  onChange={(e) => setFrameType(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe] appearance-none pr-8 cursor-pointer"
                >
                  <option value="aajnu_gulab">આજનું ગુલાબ (Today's Rose)</option>
                  <option value="aajno_dipak">આજનો દીપક (Today's Deepak)</option>
                  <option value="honour">વિદ્યાર્થી સન્માન ફ્રેમ (Student Felicitation)</option>
                  <option value="birthday">જન્મદિવસ શુભેચ્છા (Birthday Wishes)</option>
                </select>
                <i className="bi bi-chevron-down absolute right-3 top-2.5 text-xs text-[#6c757d] pointer-events-none"></i>
              </div>
            </div>

            {/* Field 2: ડિઝાઇન પસંદ કરો */}
            <div>
              <label className="block text-[13px] font-normal text-[#212529] mb-1">
                ડિઝાઇન પસંદ કરો
              </label>
              <div className="relative">
                <select
                  value={designType}
                  onChange={(e) => setDesignType(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe] appearance-none pr-8 cursor-pointer"
                >
                  <option value="design_1">ડિઝાઇન ૧ (ગોલ્ડન ફ્રેમ - Royal Gold)</option>
                  <option value="design_2">ડિઝાઇન ૨ (ગુલાબ રોઝ બોર્ડર - Rose Garland)</option>
                  <option value="design_3">ડિઝાઇન ૩ (દીપક તેજોમય - Radiant Deepak)</option>
                  <option value="design_4">ડિઝાઇન ૪ (શાહી ત્રિરંગા - Classical)</option>
                </select>
                <i className="bi bi-chevron-down absolute right-3 top-2.5 text-xs text-[#6c757d] pointer-events-none"></i>
              </div>
            </div>

            {/* Field 3: વિદ્યાર્થીનું નામ */}
            <div>
              <label className="block text-[13px] font-normal text-[#212529] mb-1">
                વિદ્યાર્થીનું નામ
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="વિદ્યાર્થીનું પૂરું નામ લખો"
                className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
              />
            </div>

            {/* Field 4: ધોરણ / વર્ગ */}
            <div>
              <label className="block text-[13px] font-normal text-[#212529] mb-1">
                ધોરણ / વર્ગ
              </label>
              <input
                type="text"
                value={studentStd}
                onChange={(e) => setStudentStd(e.target.value)}
                placeholder="उदा. ધોરણ ૫ (અ)"
                className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
              />
            </div>

            {/* Field 5: ફોટો પસંદ કરો matching Reference Image 4 */}
            <div>
              <label className="block text-[13px] font-normal text-[#212529] mb-1">
                ફોટો પસંદ કરો
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full h-[38px] px-2 py-1 border border-[#dee2e6] rounded-[4px] text-[13px] text-[#212529] bg-white focus:outline-none file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
              />
            </div>

            {/* Download Buttons matching Reference Image 4 */}
            <div className="pt-2 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleDownloadImage}
                disabled={isGenerating}
                className="bg-[#198754] hover:bg-[#157347] text-white text-[14px] font-normal px-4 py-2 rounded-[4px] transition-colors cursor-pointer shadow-none flex items-center gap-1.5"
              >
                <i className="bi bi-download"></i>
                {isGenerating ? 'ડાઉનલોડ થાય છે...' : 'બનાવેલ ચિત્ર ડાઉનલોડ કરો (.PNG)'}
              </button>
              <button
                type="button"
                onClick={handlePrintPdf}
                className="bg-slate-800 hover:bg-slate-900 text-white text-[14px] font-normal px-4 py-2 rounded-[4px] transition-colors cursor-pointer shadow-none flex items-center gap-1.5"
              >
                <i className="bi bi-printer"></i>
                પ્રિન્ટ / PDF
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: PREVIEW AREA matching Reference Image 4 */}
          <div className="print:w-full">
            <h2 className="text-[18px] font-normal text-[#212529] mb-2 no-print">
              બનાવેલ ચિત્ર જુઓ
            </h2>

            {/* Canvas / Rendered Preview Box matching Reference Image 4 */}
            <div
              className={`bg-white border-4 rounded-[6px] p-6 shadow-sm flex flex-col items-center justify-between text-center min-h-[440px] transition-all relative overflow-hidden print-avoid-break print:border-4 print:shadow-none print:min-h-[85vh] print:p-8 print:w-full ${
                designType === 'design_1'
                  ? 'border-[#EEAA00] bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20'
                  : designType === 'design_2'
                  ? 'border-rose-400 bg-gradient-to-b from-rose-50/50 via-white to-pink-50/30'
                  : designType === 'design_3'
                  ? 'border-orange-500 bg-gradient-to-b from-orange-50/40 via-white to-amber-50/30'
                  : 'border-[#007ed4] bg-gradient-to-b from-blue-50/30 via-white to-slate-50'
              }`}
            >
              {/* Corner Ornaments */}
              <div className="absolute top-2 left-2 text-xl opacity-60">⚜️</div>
              <div className="absolute top-2 right-2 text-xl opacity-60">⚜️</div>
              <div className="absolute bottom-2 left-2 text-xl opacity-60">⚜️</div>
              <div className="absolute bottom-2 right-2 text-xl opacity-60">⚜️</div>

              {/* School Name */}
              <div className="space-y-0.5 z-10">
                <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  ગુજરાત સરકાર શિક્ષણ વિભાગ
                </p>
                <h3 className="text-[19px] font-bold text-[#212529]">
                  {schoolName}
                </h3>
              </div>

              {/* Frame Title Badge */}
              <div className="my-2 z-10">
                <span
                  className={`inline-block px-4 py-1 rounded-full text-[14px] font-bold shadow-xs ${
                    frameType === 'aajnu_gulab'
                      ? 'bg-rose-600 text-white'
                      : frameType === 'aajno_dipak'
                      ? 'bg-amber-500 text-white'
                      : frameType === 'birthday'
                      ? 'bg-purple-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {getFrameTitle()}
                </span>
              </div>

              {/* Student Photo in Frame */}
              <div className="relative my-2 z-10">
                <div
                  className={`w-32 h-32 rounded-full border-4 shadow-md overflow-hidden flex items-center justify-center bg-slate-100 mx-auto ${
                    designType === 'design_1'
                      ? 'border-[#EEAA00] ring-4 ring-amber-200'
                      : designType === 'design_2'
                      ? 'border-rose-500 ring-4 ring-rose-200'
                      : designType === 'design_3'
                      ? 'border-orange-500 ring-4 ring-orange-200'
                      : 'border-blue-600 ring-4 ring-blue-200'
                  }`}
                >
                  {studentPhoto ? (
                    <img
                      src={studentPhoto}
                      alt={studentName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <i className="bi bi-person text-5xl"></i>
                      <span className="text-[10px]">ફોટો અપલોડ કરો</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Student Name & Standard */}
              <div className="space-y-0.5 z-10">
                <h4 className="text-[17px] font-bold text-[#212529]">
                  {studentName || 'વિદ્યાર્થીનું નામ'}
                </h4>
                <p className="text-[13px] font-semibold text-[#0d6efd]">
                  {studentStd || 'ધોરણ - વર્ગ'}
                </p>
              </div>

              {/* Suvichar / Quote */}
              <div className="mt-2 px-4 py-1.5 bg-white/80 border border-slate-200 rounded text-center z-10 max-w-sm">
                <p className="text-[12px] italic text-[#495057] leading-relaxed">
                  "{customQuote}"
                </p>
              </div>

              {/* Date & Signature Row */}
              <div className="w-full flex justify-between items-center text-[11px] text-[#6c757d] pt-3 border-t border-slate-200 mt-2 z-10">
                <span>તારીખ: {new Date().toLocaleDateString('gu-IN')}</span>
                <span className="font-semibold text-[#212529]">આચાર્યશ્રી / વર્ગ શિક્ષક</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BUTTON matching Reference Image 4 */}
        <div className="text-center pt-8 no-print">
          <button
            type="button"
            onClick={() => setShareModalOpen(true)}
            className="bg-[#198754] hover:bg-[#157347] text-white text-[14px] font-normal px-6 py-2 rounded-[4px] transition-colors cursor-pointer shadow-none inline-flex items-center gap-2"
          >
            <i className="bi bi-share"></i>
            અન્ય શિક્ષક મિત્ર જોડે શેર કરો
          </button>
        </div>

        {/* FOOTER */}
        <footer className="pt-10 pb-2 flex items-center justify-between text-[13px] text-[#6c757d] font-normal no-print border-t border-[#dee2e6] mt-8">
          <p>સંપર્ક: support@apnaschool.in</p>
          <p className="text-[#212529]">શાળા સાગર</p>
        </footer>
      </main>

      {/* SHARE MODAL */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-[6px] border border-[#dee2e6] max-w-sm w-full shadow-xl p-5 space-y-4 text-xs font-gujarati">
            <div className="flex justify-between items-center border-b border-[#dee2e6] pb-2">
              <h3 className="font-bold text-[#212529] text-[14px]">લિંક શેર કરો</h3>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="text-[#6c757d] hover:text-[#212529] text-base cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-[13px] text-[#495057]">
              નીચેની લિંક કોપી કરીને WhatsApp અથવા સોશિયલ મીડિયા પર શેર કરો:
            </p>
            <input
              type="text"
              readOnly
              value={typeof window !== 'undefined' ? window.location.href : ''}
              className="w-full h-[36px] px-3 border border-[#dee2e6] rounded-[4px] text-xs bg-slate-50 select-all"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('લિંક કોપી થઈ ગઈ છે!');
                  setShareModalOpen(false);
                }}
                className="px-4 py-1.5 bg-[#198754] text-white font-medium rounded-[4px] cursor-pointer"
              >
                કોપી કરો
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
