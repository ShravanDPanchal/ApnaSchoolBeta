'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface StandardCardData {
  stdNumber: string;
  stdTitle: string;
  subjects: string[];
}

const STANDARDS_DATA: StandardCardData[] = [
  {
    stdNumber: '3',
    stdTitle: 'ધોરણ ૩',
    subjects: ['ગુજરાતી', 'ગણિત', 'પર્યાવરણ', 'અંગ્રેજી'],
  },
  {
    stdNumber: '4',
    stdTitle: 'ધોરણ ૪',
    subjects: ['ગુજરાતી', 'ગણિત', 'પર્યાવરણ', 'અંગ્રેજી', 'હિન્દી'],
  },
  {
    stdNumber: '5',
    stdTitle: 'ધોરણ ૫',
    subjects: ['ગુજરાતી', 'ગણિત', 'પર્યાવરણ', 'અંગ્રેજી', 'હિન્દી'],
  },
  {
    stdNumber: '6',
    stdTitle: 'ધોરણ ૬',
    subjects: ['ગુજરાતી', 'ગણિત', 'અંગ્રેજી', 'હિન્દી', 'વિજ્ઞાન', 'સામાજિક વિજ્ઞાન', 'સંસ્કૃત'],
  },
  {
    stdNumber: '7',
    stdTitle: 'ધોરણ ૭',
    subjects: ['ગુજરાતી', 'ગણિત', 'અંગ્રેજી', 'હિન્દી', 'વિજ્ઞાન', 'સામાજિક વિજ્ઞાન', 'સંસ્કૃત'],
  },
  {
    stdNumber: '8',
    stdTitle: 'ધોરણ ૮',
    subjects: ['ગુજરાતી', 'ગણિત', 'અંગ્રેજી', 'હિન્દી', 'વિજ્ઞાન', 'સામાજિક વિજ્ઞાન', 'સંસ્કૃત'],
  },
];

export default function PatrakAPrintPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Modal State for Student Add
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStdForStudent, setSelectedStdForStudent] = useState('ધોરણ ૩');
  const [studentName, setStudentName] = useState('');
  const [studentRoll, setStudentRoll] = useState('');

  // Learning Outcomes Modal
  const [showLOModal, setShowLOModal] = useState(false);
  const [selectedSubjectLO, setSelectedSubjectLO] = useState('');
  const [selectedStdLO, setSelectedStdLO] = useState('');

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleOpenAddStudent = (stdTitle: string) => {
    setSelectedStdForStudent(stdTitle);
    setShowStudentModal(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;
    showToast(`${selectedStdForStudent} માટે વિદ્યાર્થી "${studentName}" સફળતાપૂર્વક ઉમેરાયો.`);
    setStudentName('');
    setStudentRoll('');
    setShowStudentModal(false);
  };

  const handleOpenLO = (stdTitle: string, subject: string) => {
    setSelectedStdLO(stdTitle);
    setSelectedSubjectLO(subject);
    setShowLOModal(true);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#212529] font-gujarati antialiased pb-16">
      {/* TOP HEADER */}
      <header className="bg-white border-b border-[#dee2e6] py-3 px-4 sm:px-8 sticky top-0 z-30 no-print">
        <div className="max-w-[1320px] w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <Link href="/dashboard" className="inline-flex items-center text-[25px] font-bold tracking-tight">
              <span className="text-[#007ed4]">અપના</span>
              <span className="text-[#f59e0b] ml-1.5">સ્કૂલ</span>
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
                  href="/staff"
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
                <div className="border-t border-[#dee2e6] my-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-[#212529] hover:bg-[#f8f9fa] font-normal cursor-pointer"
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
      <main className="max-w-[1200px] w-full mx-auto px-4 py-6 space-y-6">
        {/* PAGE HEADER */}
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-bold text-[#212529] flex items-center gap-2">
            <i className="bi bi-card-text text-[#212529]"></i>
            <span>પત્રક A પ્રિન્ટ</span>
          </h1>
          <p className="text-[12.5px] text-[#6c757d] mt-1 font-normal">
            નક્કી સિલેક્ટ કરેલી અધ્યયન નિષ્પત્તિ સાથે અને વિદ્યાર્થી યાદી સાથે તમારું વિષય પ્રમાણે પત્રક A તૈયાર કરો
          </p>
        </div>

        {/* TOP 4 NAVIGATION ACTION CARDS (GRID) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: શાળાની વિગત ઉમેરો */}
          <Link
            href="/settings"
            className="bg-white border border-[#dee2e6] rounded-[6px] p-3.5 hover:border-[#b0c4de] hover:shadow-xs transition-all flex flex-col justify-center items-center text-center min-h-[95px] group"
          >
            <div className="text-[#f59e0b] text-2xl mb-1.5 leading-none">
              <i className="bi bi-building"></i>
            </div>
            <h3 className="text-[13.5px] font-bold text-[#212529] group-hover:text-[#0d6efd] transition-colors">
              શાળાની વિગત ઉમેરો
            </h3>
            <p className="text-[11.5px] text-[#6c757d] mt-0.5 leading-tight">
              પત્રકમાં દર્શાવવા માટેનું શાળા નામ અહીંથી બદલવી
            </p>
          </Link>

          {/* Card 2: શિક્ષકની વિગત ઉમેરો */}
          <Link
            href="/staff"
            className="bg-white border border-[#dee2e6] rounded-[6px] p-3.5 hover:border-[#b0c4de] hover:shadow-xs transition-all flex flex-col justify-center items-center text-center min-h-[95px] group"
          >
            <div className="text-[#f59e0b] text-2xl mb-1.5 leading-none">
              <i className="bi bi-people-fill"></i>
            </div>
            <h3 className="text-[13.5px] font-bold text-[#212529] group-hover:text-[#0d6efd] transition-colors">
              શિક્ષકની વિગત ઉમેરો
            </h3>
            <p className="text-[11.5px] text-[#6c757d] mt-0.5 leading-tight">
              વિદ્યાર્થી ઉમેરો અથવા તેમાં સુધારો કરો
            </p>
          </Link>

          {/* Card 3: અધ્યયન નિષ્પત્તિ પસંદ કરો */}
          <button
            type="button"
            onClick={() => handleOpenLO('ધોરણ ૩', 'ગુજરાતી')}
            className="bg-white border border-[#dee2e6] rounded-[6px] p-3.5 hover:border-[#b0c4de] hover:shadow-xs transition-all flex flex-col justify-center items-center text-center min-h-[95px] group cursor-pointer"
          >
            <div className="text-[#f59e0b] text-2xl mb-1.5 leading-none">
              <i className="bi bi-list-task"></i>
            </div>
            <h3 className="text-[13.5px] font-bold text-[#212529] group-hover:text-[#0d6efd] transition-colors">
              અધ્યયન નિષ્પત્તિ પસંદ કરો
            </h3>
            <p className="text-[11.5px] text-[#6c757d] mt-0.5 leading-tight">
              દરેક વિષય અને તેની અધ્યયન નિષ્પત્તિ પ્રમાણે અલગ અલગ પેપર જનરેટ કરો
            </p>
          </button>

          {/* Card 4: Highlighted Yellow Card */}
          <button
            type="button"
            onClick={() => handleOpenLO('ધોરણ ૩', 'પ્રશ્નપેપર્સ')}
            className="bg-[#fffdf5] border-2 border-[#ffc107] rounded-[6px] p-3.5 hover:shadow-xs transition-all flex flex-col justify-center items-center text-center min-h-[95px] group cursor-pointer"
          >
            <div className="text-[#f59e0b] text-2xl mb-1.5 leading-none">
              <i className="bi bi-p-square"></i>
            </div>
            <h3 className="text-[13.5px] font-bold text-[#212529] group-hover:text-[#0d6efd] transition-colors">
              અધ્યયન નિષ્પત્તિ પ્રમાણે પ્રશ્નપેપર્સ જનરેટ કરો
            </h3>
            <p className="text-[11.5px] text-[#6c757d] mt-0.5 leading-tight">
              અથવા વિષય અને પ્રશ્નપત્ર તૈયાર કરો
            </p>
          </button>
        </div>

        {/* DOWNLOAD SECTION HEADER */}
        <div className="pt-2">
          <h2 className="text-[16px] font-bold text-[#212529] flex items-center gap-1.5">
            <i className="bi bi-download"></i>
            <span>પત્રક A ડાઉનલોડ કરો</span>
          </h2>
          <p className="text-[12px] text-[#6c757d] mt-0.5 font-normal">
            ઉપલબ્ધ પરિણામ અને વિગતો માટે પત્રક A જનરેટ કરો
          </p>
        </div>

        {/* STANDARD CARDS (ધોરણ ૩, ૪, ૫, ૬, ૭, ૮) */}
        <div className="space-y-4">
          {STANDARDS_DATA.map((std) => (
            <div
              key={std.stdNumber}
              className="bg-white border border-[#dee2e6] rounded-[6px] shadow-none overflow-hidden"
            >
              {/* GRADIENT HEADER BAR */}
              <div
                className="py-2.5 px-4 text-white font-bold text-[14.5px] flex items-center gap-2"
                style={{
                  background: 'linear-gradient(90deg, #43708a 0%, #688a4b 50%, #b89728 100%)',
                }}
              >
                <i className="bi bi-book"></i>
                <span>{std.stdTitle}</span>
              </div>

              {/* SUBJECT ROWS */}
              <div className="divide-y divide-[#dee2e6]">
                {std.subjects.map((sub) => (
                  <div
                    key={sub}
                    className="py-2.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#fafafa] transition-colors"
                  >
                    {/* Left: Subject name + Yellow LO status tag */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-[13.5px] font-bold text-[#212529] min-w-[90px]">
                        {sub}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenLO(std.stdTitle, sub)}
                        className="bg-[#fff3cd] hover:bg-[#ffe69c] text-[#664d03] text-[11px] font-normal px-2.5 py-0.5 rounded-[3px] border border-[#ffe69c] transition-colors cursor-pointer"
                      >
                        અધ્યયન નિષ્પત્તિ પસંદ કરવાની બાકી છે
                      </button>
                    </div>

                    {/* Right: Empty student status + Add Student link */}
                    <div className="flex items-center gap-2 text-right self-end sm:self-auto">
                      <span className="text-[12.5px] text-[#6c757d] font-normal">
                        આ ધોરણ માટે કોઈ વિદ્યાર્થી નથી
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenAddStudent(std.stdTitle)}
                        className="text-[12.5px] text-[#0d6efd] hover:underline font-medium cursor-pointer"
                      >
                        વિદ્યાર્થી ઉમેરો
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <footer className="pt-6 pb-2 flex items-center justify-between text-[13px] text-[#6c757d] font-normal no-print">
          <p>સંપર્ક: support@apnaschool.in</p>
          <p className="text-[#212529]">અપના સ્કૂલ</p>
        </footer>
      </main>

      {/* ADD STUDENT MODAL */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[6px] border border-[#dee2e6] max-w-md w-full shadow-xl p-5 space-y-4 text-xs font-gujarati">
            <div className="flex justify-between items-center border-b border-[#dee2e6] pb-2">
              <h3 className="font-bold text-[#212529] text-[14px]">
                વિદ્યાર્થી ઉમેરો - {selectedStdForStudent}
              </h3>
              <button
                type="button"
                onClick={() => setShowStudentModal(false)}
                className="text-[#6c757d] hover:text-[#212529] text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3">
              <div>
                <label className="block text-[#212529] font-normal mb-1">રોલ નંબર / હાજરી નંબર</label>
                <input
                  type="text"
                  placeholder="उदा. 1"
                  value={studentRoll}
                  onChange={(e) => setStudentRoll(e.target.value)}
                  className="w-full h-[36px] px-3 border border-[#dee2e6] rounded-[4px]"
                />
              </div>

              <div>
                <label className="block text-[#212529] font-normal mb-1">વિદ્યાર્થીનું પૂરું નામ *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. પટેલ આરવ નીલેશભાઈ"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full h-[36px] px-3 border border-[#dee2e6] rounded-[4px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#dee2e6]">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="px-3 py-1.5 border border-[#dee2e6] rounded-[4px] text-[#495057] cursor-pointer"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0d6efd] text-white font-medium rounded-[4px] cursor-pointer"
                >
                  સાચવો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEARNING OUTCOME SELECTOR MODAL */}
      {showLOModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[6px] border border-[#dee2e6] max-w-lg w-full shadow-xl p-5 space-y-4 text-xs font-gujarati">
            <div className="flex justify-between items-center border-b border-[#dee2e6] pb-2">
              <h3 className="font-bold text-[#212529] text-[14px]">
                અધ્યયન નિષ્પત્તિ પસંદ કરો ({selectedStdLO} - {selectedSubjectLO})
              </h3>
              <button
                type="button"
                onClick={() => setShowLOModal(false)}
                className="text-[#6c757d] hover:text-[#212529] text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              <label className="flex items-center gap-2 p-2 bg-[#f8f9fa] rounded border border-[#dee2e6] cursor-pointer hover:bg-blue-50">
                <input type="checkbox" defaultChecked className="rounded text-[#0d6efd]" />
                <span className="font-medium text-[#212529]">LO 1.1: વાર્તા અને કવિતા સાંભળી પોતાના શબ્દોમાં રજૂ કરે છે.</span>
              </label>
              <label className="flex items-center gap-2 p-2 bg-[#f8f9fa] rounded border border-[#dee2e6] cursor-pointer hover:bg-blue-50">
                <input type="checkbox" defaultChecked className="rounded text-[#0d6efd]" />
                <span className="font-medium text-[#212529]">LO 1.2: સરળ વાક્યો અને પરિચ્છેદનું શુદ્ધ ઉચ્ચારણ સાથે વાંચન કરે છે.</span>
              </label>
              <label className="flex items-center gap-2 p-2 bg-[#f8f9fa] rounded border border-[#dee2e6] cursor-pointer hover:bg-blue-50">
                <input type="checkbox" className="rounded text-[#0d6efd]" />
                <span className="font-medium text-[#212529]">LO 1.3: શ્રુતલેખન અને અનુલેખન સાચી જોડણી સાથે કરે છે.</span>
              </label>
              <label className="flex items-center gap-2 p-2 bg-[#f8f9fa] rounded border border-[#dee2e6] cursor-pointer hover:bg-blue-50">
                <input type="checkbox" className="rounded text-[#0d6efd]" />
                <span className="font-medium text-[#212529]">LO 1.4: શબ્દભંડોળ અને વ્યાકરણના નિયમો સમજી પ્રયોગ કરે છે.</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#dee2e6]">
              <button
                type="button"
                onClick={() => setShowLOModal(false)}
                className="px-3 py-1.5 border border-[#dee2e6] rounded-[4px] text-[#495057] cursor-pointer"
              >
                બંધ કરો
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(`${selectedSubjectLO} ની અધ્યયન નિષ્પત્તિ પસંદ કરવામાં આવી છે.`);
                  setShowLOModal(false);
                }}
                className="px-4 py-1.5 bg-[#0d6efd] text-white font-medium rounded-[4px] cursor-pointer"
              >
                પસંદ કરો
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
