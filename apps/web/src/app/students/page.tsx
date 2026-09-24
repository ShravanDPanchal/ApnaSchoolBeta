'use client';
 
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api-client';

export default function StudentsPage() {
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadStudents() {
      try {
        setLoading(true);
        const res = await fetchApi('/students?limit=500');
        if (res.data) {
          setStudentsList(res.data);
        }
      } catch (err) {
        console.error('Failed to load students', err);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, []);

  // Compute dynamic count for each grade
  const getGradeCount = (gradeId: string, gradeName: string) => {
    return studentsList.filter((s) => {
      const clsNameEn = s.classNameEn?.toLowerCase() || '';
      const clsNameGu = s.classNameGu || '';
      const stdLower = gradeId.toLowerCase();
      return (
        clsNameEn.includes(stdLower) ||
        clsNameEn.includes(gradeName.toLowerCase()) ||
        clsNameGu.includes(gradeName)
      );
    }).length;
  };

  const sections = [
    {
      title: 'પૂર્વ પ્રાથમિક',
      grades: [
        { id: 'balvatika', name: 'બાલવાટિકા', count: getGradeCount('balvatika', 'બાલવાટિકા') },
      ],
      gridCols: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4',
    },
    {
      title: 'પ્રાથમિક',
      grades: [
        { id: 'std1', name: 'ધોરણ 1', count: getGradeCount('std1', 'ધોરણ 1') },
        { id: 'std2', name: 'ધોરણ 2', count: getGradeCount('std2', 'ધોરણ 2') },
        { id: 'std3', name: 'ધોરણ 3', count: getGradeCount('std3', 'ધોરણ 3') },
        { id: 'std4', name: 'ધોરણ 4', count: getGradeCount('std4', 'ધોરણ 4') },
        { id: 'std5', name: 'ધોરણ 5', count: getGradeCount('std5', 'ધોરણ 5') },
      ],
      gridCols: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4',
    },
    {
      title: 'માધ્યમિક',
      grades: [
        { id: 'std6', name: 'ધોરણ 6', count: getGradeCount('std6', 'ધોરણ 6') },
        { id: 'std7', name: 'ધોરણ 7', count: getGradeCount('std7', 'ધોરણ 7') },
        { id: 'std8', name: 'ધોરણ 8', count: getGradeCount('std8', 'ધોરણ 8') },
      ],
      gridCols: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    },
    {
      title: 'ઉચ્ચ માધ્યમિક',
      grades: [
        { id: 'std9', name: 'ધોરણ 9', count: getGradeCount('std9', 'ધોરણ 9') },
        { id: 'std10', name: 'ધોરણ 10', count: getGradeCount('std10', 'ધોરણ 10') },
      ],
      gridCols: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4',
    },
    {
      title: 'ઉચ્ચતર માધ્યમિક',
      grades: [
        { id: 'std11', name: 'ધોરણ 11', count: getGradeCount('std11', 'ધોરણ 11') },
        { id: 'std12', name: 'ધોરણ 12', count: getGradeCount('std12', 'ધોરણ 12') },
      ],
      gridCols: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4',
    },
  ];

  const filteredStudents = studentsList.filter((s) => {
    if (selectedGrade) {
      const clsNameEn = s.classNameEn?.toLowerCase() || '';
      const clsNameGu = s.classNameGu || '';
      const matchGrade = clsNameEn.includes(selectedGrade.toLowerCase()) || clsNameGu.includes(selectedGrade);
      if (!matchGrade) return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        s.fullNameGu?.toLowerCase().includes(term) ||
        s.fullNameEn?.toLowerCase().includes(term) ||
        s.grNumber?.includes(term) ||
        s.phone?.includes(term)
      );
    }
    return true;
  });

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
      <main className="max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-6 font-gujarati flex-1 space-y-6">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-xs text-[#6c757d]">
          <Link href="/dashboard" className="text-[#0d6efd] hover:underline flex items-center gap-1">
            <i className="bi bi-house-door"></i>
          </Link>
          <span>/</span>
          <span>ધોરણ</span>
        </div>

        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-[#212529]">
              ધોરણ
            </h1>
            <p className="text-xs sm:text-sm text-[#6c757d]">
              હાલમાં તમે કોઈ ધોરણમાં વિદ્યાર્થી ઉમેરેલ નથી. કોઈ પણ ધોરણમાં જઈ નવા વિદ્યાર્થીઓ ઉમેરો.
            </p>
          </div>
          <Link
            href="/students/survey"
            className="bg-[#df8a00] hover:bg-[#c97900] text-white text-[13.5px] font-normal px-4 py-2 rounded-[4px] shadow-none transition-colors inline-flex items-center gap-2 self-start sm:self-auto"
          >
            <i className="bi bi-card-checklist"></i>
            વાલી ફોર્મ/સર્વે ફોર્મ
          </Link>
        </div>

        {/* GRADE SECTIONS */}
        <div className="space-y-6 pt-2">
          {sections.map((sec, idx) => (
            <div key={idx} className="space-y-2.5">
              <h2 className="text-sm font-semibold text-[#6c757d]">
                {sec.title}
              </h2>

              <div className={`grid ${sec.gridCols} gap-3`}>
                {sec.grades.map((grade) => (
                  <div
                    key={grade.id}
                    onClick={() => setSelectedGrade(selectedGrade === grade.id ? null : grade.id)}
                    className={`bg-white rounded-[6px] border p-4 shadow-none hover:border-[#0d6efd] transition-all flex flex-col justify-between min-h-[95px] group cursor-pointer ${
                      selectedGrade === grade.id ? 'border-[#0d6efd] ring-2 ring-blue-100' : 'border-[#dee2e6]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-bold text-[#212529] group-hover:text-[#0d6efd] transition-colors">
                        {grade.name}
                      </h3>
                      {selectedGrade === grade.id && (
                        <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                          પસંદ કરેલ
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[#0d6efd] font-semibold text-xs sm:text-sm flex items-center gap-1.5">
                        <i className="bi bi-person"></i>
                        <span>{grade.count} વિદ્યાર્થી</span>
                      </span>

                      <Link
                        href={`/students/add?std=${grade.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="border border-[#0d6efd] text-[#0d6efd] hover:bg-blue-50 w-7 h-7 rounded flex items-center justify-center transition-colors"
                        title="નવો વિદ્યાર્થી ઉમેરો"
                      >
                        <i className="bi bi-person-plus text-sm"></i>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* STUDENT DIRECTORY TABLE */}
        <div className="bg-white rounded-xl border border-[#dee2e6] p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <i className="bi bi-people-fill text-[#0d6efd]"></i>
                <span>વિદ્યાર્થી યાદી (Student Directory)</span>
                {selectedGrade && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                    ધોરણ ફિલ્ટર: {selectedGrade}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500">
                કુલ નોંધાયેલ વિદ્યાર્થીઓ: {filteredStudents.length} / {studentsList.length}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <i className="bi bi-search absolute left-3 top-2.5 text-xs text-slate-400"></i>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="નામ, GR અથવા મોબાઇલથી શોધો..."
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg w-64 focus:outline-none focus:border-[#0d6efd]"
                />
              </div>

              {selectedGrade && (
                <button
                  onClick={() => setSelectedGrade(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  બધા દર્શાવો
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <i className="bi bi-arrow-repeat animate-spin text-xl mr-2"></i>
              વિદ્યાર્થી ડેટા લોડ થઈ રહ્યો છે...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <i className="bi bi-person-x text-3xl text-slate-400 mb-2"></i>
              <p className="text-sm font-bold text-slate-700">કોઈ વિદ્યાર્થી મળ્યા નથી</p>
              <p className="text-xs text-slate-500 mt-1">
                ઉપર આપેલ બટન પર ક્લિક કરી નવો વિદ્યાર્થી ઉમેરો અથવા એક્સેલ આયાત કરો.
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <Link
                  href="/students/add"
                  className="px-4 py-2 bg-[#0d6efd] text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + નવો વિદ્યાર્થી ઉમેરો
                </Link>
                <Link
                  href="/students/import"
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  એક્સેલ આયાત (Import)
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3">GR નંબર</th>
                    <th className="p-3">વિદ્યાર્થીનું નામ</th>
                    <th className="p-3">ધોરણ & વર્ગ</th>
                    <th className="p-3">જાતિ</th>
                    <th className="p-3">જન્મ તારીખ</th>
                    <th className="p-3">સંપર્ક નંબર</th>
                    <th className="p-3 text-right">ક્રિયા (Action)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{st.grNumber}</td>
                      <td className="p-3 font-medium">
                        <div>{st.fullNameGu || st.fullNameEn}</div>
                        {st.fullNameEn && st.fullNameGu && (
                          <div className="text-[10px] text-slate-400 font-sans">{st.fullNameEn}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-semibold">
                          {st.classNameGu || st.classNameEn || 'ધોરણ ૧'} {st.divisionNameEn ? `(${st.divisionNameEn})` : ''}
                        </span>
                      </td>
                      <td className="p-3">{st.gender === 'FEMALE' ? 'સ્ત્રી' : 'પુરુષ'}</td>
                      <td className="p-3 font-sans text-slate-600">{st.dateOfBirth}</td>
                      <td className="p-3 font-sans text-slate-600">{st.phone || st.parentPhone || '-'}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/students/${st.id}`}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold"
                          >
                            પ્રોફાઇલ
                          </Link>
                          <Link
                            href={`/students/transfer?studentId=${st.id}`}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[11px] font-bold"
                          >
                            LC બદલી
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
