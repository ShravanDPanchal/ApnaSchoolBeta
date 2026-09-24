'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface TrimasikExam {
  id: string;
  academicYear: string;
  semester: string;
  standard: string;
  division: string;
  subject: string;
  examDate: string;
  createdAt: string;
}

export default function TrimasikExamPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [view, setView] = useState<'list' | 'create' | 'marks'>('list');

  // Exam List State
  const [exams, setExams] = useState<TrimasikExam[]>([]);
  const [selectedExam, setSelectedExam] = useState<TrimasikExam | null>(null);

  // Form State for Step 1 Create Exam
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [semester, setSemester] = useState('1');
  const [standard, setStandard] = useState('');
  const [division, setDivision] = useState('');
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Student Add Modal
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRoll, setNewStudentRoll] = useState('');
  const [newStudentStd, setNewStudentStd] = useState('ધોરણ ૩');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('apna_trimasik_exams');
      if (saved) {
        setExams(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!standard) {
      alert('કૃપા કરીને ધોરણ પસંદ કરો.');
      return;
    }
    if (!division) {
      alert('કૃપા કરીને વર્ગ પસંદ કરો.');
      return;
    }
    if (!subject) {
      alert('કૃપા કરીને વિષય પસંદ કરો.');
      return;
    }

    const newExamObj: TrimasikExam = {
      id: `exam_${Date.now()}`,
      academicYear,
      semester,
      standard,
      division,
      subject,
      examDate,
      createdAt: new Date().toISOString(),
    };

    const updated = [newExamObj, ...exams];
    setExams(updated);
    try {
      localStorage.setItem('apna_trimasik_exams', JSON.stringify(updated));
    } catch (e) {}

    showToast('નવી ત્રિમાસિક પરીક્ષા સફળતાપૂર્વક બનાવવામાં આવી છે!');
    setSelectedExam(newExamObj);
    setView('list');
  };

  const handleDeleteExam = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('શું તમે આ પરીક્ષા કાઢી નાખવા માંગો છો?')) {
      const updated = exams.filter((x) => x.id !== id);
      setExams(updated);
      try {
        localStorage.setItem('apna_trimasik_exams', JSON.stringify(updated));
      } catch (e) {}
      showToast('પરીક્ષા કાઢી નાખવામાં આવી છે.');
    }
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    showToast(`વિદ્યાર્થી "${newStudentName}" સફળતાપૂર્વક ઉમેરાઈ ગયો છે!`);
    setNewStudentName('');
    setNewStudentRoll('');
    setShowStudentModal(false);
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
      <main className="max-w-[1100px] w-full mx-auto px-4 py-6">
        {/* VIEW 1: EXAM LIST VIEW (MATCHING IMAGE 2) */}
        {view === 'list' && (
          <div className="space-y-4">
            {/* TOP BAR */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h1 className="text-[18px] sm:text-[19px] font-normal text-[#212529]">
                ત્રિમાસિક પરીક્ષા યાદી
              </h1>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setView('create')}
                  className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white text-[14px] font-normal px-3.5 py-1.5 rounded-[4px] shadow-none transition-colors cursor-pointer"
                >
                  નવી પરીક્ષા બનાવો
                </button>

                <button
                  type="button"
                  onClick={() => setShowStudentModal(true)}
                  className="bg-[#0dcaf0] hover:bg-[#31d2f2] text-[#000000] text-[14px] font-normal px-3.5 py-1.5 rounded-[4px] shadow-none transition-colors cursor-pointer"
                >
                  વિદ્યાર્થી અહીંથી ઉમેરો
                </button>
              </div>
            </div>

            {/* EMPTY STATE OR EXAM TABLE */}
            {exams.length === 0 ? (
              <div className="bg-[#d1f2fb] border border-[#b6effb] text-[#055160] text-center py-4 px-4 rounded-[4px] text-[14.5px] font-normal shadow-none">
                હજુ સુધી કોઈ પરીક્ષા બનાવવામાં આવી નથી.
              </div>
            ) : (
              <div className="bg-white border border-[#dee2e6] rounded-[6px] shadow-none overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#f8f9fa] border-b border-[#dee2e6] text-[#495057] font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">શૈક્ષણિક વર્ષ</th>
                      <th className="py-2.5 px-3">સત્ર</th>
                      <th className="py-2.5 px-3">ધોરણ - વર્ગ</th>
                      <th className="py-2.5 px-3">વિષય</th>
                      <th className="py-2.5 px-3">પરીક્ષા તારીખ</th>
                      <th className="py-2.5 px-3 text-center">ક્રિયા</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dee2e6]">
                    {exams.map((ex) => (
                      <tr key={ex.id} className="hover:bg-[#f8f9fa] transition-colors">
                        <td className="py-2.5 px-3 font-medium">{ex.academicYear}</td>
                        <td className="py-2.5 px-3">સત્ર {ex.semester}</td>
                        <td className="py-2.5 px-3 font-semibold text-[#0d6efd]">{ex.standard} ({ex.division})</td>
                        <td className="py-2.5 px-3">{ex.subject}</td>
                        <td className="py-2.5 px-3">{ex.examDate || '-'}</td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => handleDeleteExam(ex.id, e)}
                            className="text-[#dc3545] hover:underline"
                          >
                            ડિલીટ
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: STEP 1 CREATE EXAM (MATCHING IMAGE 3) */}
        {view === 'create' && (
          <div className="bg-white border border-[#dee2e6] rounded-[6px] shadow-none overflow-hidden">
            {/* CARD HEADER */}
            <div className="p-4 sm:p-5 border-b border-[#dee2e6] flex items-center justify-between">
              <h1 className="text-[17px] font-bold text-[#212529]">
                પગલું ૧: નવી પરીક્ષા બનાવો
              </h1>
              <button
                type="button"
                onClick={() => setView('list')}
                className="border border-[#dee2e6] bg-white hover:bg-[#f8f9fa] text-[#495057] text-xs px-3 py-1.5 rounded-[4px] transition-colors cursor-pointer"
              >
                પાછા જાઓ
              </button>
            </div>

            {/* FORM BODY */}
            <form onSubmit={handleCreateExam} className="p-5 sm:p-7 space-y-4">
              <div>
                <label className="block text-[13px] font-normal text-[#212529] mb-1">
                  શૈક્ષણિક વર્ષ
                </label>
                <div className="relative">
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe] appearance-none pr-8 cursor-pointer"
                  >
                    <option value="2026-27">2026-27</option>
                    <option value="2025-26">2025-26</option>
                    <option value="2024-25">2024-25</option>
                  </select>
                  <i className="bi bi-chevron-down absolute right-3 top-2.5 text-xs text-[#6c757d] pointer-events-none"></i>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-normal text-[#212529] mb-1">
                  સત્ર નંબર
                </label>
                <div className="relative">
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe] appearance-none pr-8 cursor-pointer"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                  <i className="bi bi-chevron-down absolute right-3 top-2.5 text-xs text-[#6c757d] pointer-events-none"></i>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-normal text-[#212529] mb-1">
                  ધોરણ
                </label>
                <div className="relative">
                  <select
                    value={standard}
                    onChange={(e) => setStandard(e.target.value)}
                    required
                    className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe] appearance-none pr-8 cursor-pointer"
                  >
                    <option value="">ધોરણ પસંદ કરો</option>
                    <option value="ધોરણ ૧">ધોરણ ૧</option>
                    <option value="ધોરણ ૨">ધોરણ ૨</option>
                    <option value="ધોરણ ૩">ધોરણ ૩</option>
                    <option value="ધોરણ ૪">ધોરણ ૪</option>
                    <option value="ધોરણ ૫">ધોરણ ૫</option>
                    <option value="ધોરણ ૬">ધોરણ ૬</option>
                    <option value="ધોરણ ૭">ધોરણ ૭</option>
                    <option value="ધોરણ ૮">ધોરણ ૮</option>
                  </select>
                  <i className="bi bi-chevron-down absolute right-3 top-2.5 text-xs text-[#6c757d] pointer-events-none"></i>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-normal text-[#212529] mb-1">
                  વર્ગ
                </label>
                <div className="relative">
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    required
                    className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe] appearance-none pr-8 cursor-pointer"
                  >
                    <option value="">વર્ગ પસંદ કરો</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="અ">અ</option>
                    <option value="બ">બ</option>
                    <option value="ક">ક</option>
                  </select>
                  <i className="bi bi-chevron-down absolute right-3 top-2.5 text-xs text-[#6c757d] pointer-events-none"></i>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-normal text-[#212529] mb-1">
                  વિષય
                </label>
                <div className="relative">
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe] appearance-none pr-8 cursor-pointer"
                  >
                    <option value="">વિષય પસંદ કરો</option>
                    <option value="ગુજરાતી">ગુજરાતી</option>
                    <option value="ગણિત">ગણિત</option>
                    <option value="પર્યાવરણ">પર્યાવરણ</option>
                    <option value="અંગ્રેજી">અંગ્રેજી</option>
                    <option value="હિન્દી">હિન્દી</option>
                    <option value="વિજ્ઞાન">વિજ્ઞાન</option>
                    <option value="સામાજિક વિજ્ઞાન">સામાજિક વિજ્ઞાન</option>
                    <option value="સંસ્કૃત">સંસ્કૃત</option>
                  </select>
                  <i className="bi bi-chevron-down absolute right-3 top-2.5 text-xs text-[#6c757d] pointer-events-none"></i>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-normal text-[#212529] mb-1">
                  પરીક્ષા તારીખ (વૈકલ્પિક)
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#0d6efd] hover:bg-[#0b5ed7] text-white text-[15px] font-bold py-2.5 rounded-[4px] transition-colors cursor-pointer text-center shadow-none"
                >
                  પરીક્ષા બનાવો અને આગળ વધો
                </button>
              </div>
            </form>
          </div>
        )}

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
              <h3 className="font-bold text-[#212529] text-[14px]">વિદ્યાર્થી ઉમેરો (Add Student)</h3>
              <button
                type="button"
                onClick={() => setShowStudentModal(false)}
                className="text-[#6c757d] hover:text-[#212529] text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3">
              <div>
                <label className="block text-[#212529] font-normal mb-1">ધોરણ</label>
                <select
                  value={newStudentStd}
                  onChange={(e) => setNewStudentStd(e.target.value)}
                  className="w-full h-[36px] px-3 border border-[#dee2e6] rounded-[4px]"
                >
                  <option value="ધોરણ ૧">ધોરણ ૧</option>
                  <option value="ધોરણ ૨">ધોરણ ૨</option>
                  <option value="ધોરણ ૩">ધોરણ ૩</option>
                  <option value="ધોરણ ૪">ધોરણ ૪</option>
                  <option value="ધોરણ ૫">ધોરણ ૫</option>
                  <option value="ધોરણ ૬">ધોરણ ૬</option>
                  <option value="ધોરણ ૭">ધોરણ ૭</option>
                  <option value="ધોરણ ૮">ધોરણ ૮</option>
                </select>
              </div>

              <div>
                <label className="block text-[#212529] font-normal mb-1">રોલ નંબર / હાજરી નંબર</label>
                <input
                  type="text"
                  placeholder="उदा. 1"
                  value={newStudentRoll}
                  onChange={(e) => setNewStudentRoll(e.target.value)}
                  className="w-full h-[36px] px-3 border border-[#dee2e6] rounded-[4px]"
                />
              </div>

              <div>
                <label className="block text-[#212529] font-normal mb-1">વિદ્યાર્થીનું પૂરું નામ *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. પટેલ આરવ નીલેશભાઈ"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
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
                  className="px-4 py-1.5 bg-[#0dcaf0] text-black font-bold rounded-[4px] cursor-pointer"
                >
                  સાચવો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
