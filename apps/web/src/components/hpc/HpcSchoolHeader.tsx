'use client';

import React, { useState } from 'react';
import { StudentHpcData } from './types';

interface HpcSchoolHeaderProps {
  title: string;
  gradeSubtitle: string;
  academicYear: string;
  district: string;
  taluka: string;
  crcName: string;
  villageCity: string;
  schoolName: string;
  udiseCode: string;
  teacherName: string;
  principalName: string;
  onDistrictChange: (val: string) => void;
  onTalukaChange: (val: string) => void;
  onCrcChange: (val: string) => void;
  onVillageChange: (val: string) => void;
  onSchoolNameChange: (val: string) => void;
  onUdiseChange: (val: string) => void;
  onTeacherChange: (val: string) => void;
  onPrincipalChange: (val: string) => void;
  students: StudentHpcData[];
  selectedStudentId: string;
  onStudentSelect: (id: string) => void;
  onAddStudent?: (student: Partial<StudentHpcData>) => void;
  currentStudent: StudentHpcData;
  onStudentFieldChange: (field: keyof StudentHpcData, val: any) => void;
  onBatchPrint: () => void;
}

export function HpcSchoolHeader({
  title,
  gradeSubtitle,
  academicYear,
  district,
  taluka,
  crcName,
  villageCity,
  schoolName,
  udiseCode,
  teacherName,
  principalName,
  onDistrictChange,
  onTalukaChange,
  onCrcChange,
  onVillageChange,
  onSchoolNameChange,
  onUdiseChange,
  onTeacherChange,
  onPrincipalChange,
  students,
  selectedStudentId,
  onStudentSelect,
  onAddStudent,
  currentStudent,
  onStudentFieldChange,
  onBatchPrint,
}: HpcSchoolHeaderProps) {
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    nameEn: '',
    grNo: '',
    rollNo: '',
    dob: '',
    gender: 'M' as 'M' | 'F',
    fatherName: '',
    motherName: '',
  });

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.grNo.includes(searchQuery) ||
      s.rollNo.includes(searchQuery)
  );

  const handleAddNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name.trim()) return;
    if (onAddStudent) {
      onAddStudent(newStudent);
      setShowAddForm(false);
      setNewStudent({
        name: '',
        nameEn: '',
        grNo: '',
        rollNo: '',
        dob: '',
        gender: 'M',
        fatherName: '',
        motherName: '',
      });
    }
  };

  return (
    <div className="bg-white border-2 border-[#007ed4] rounded-[8px] p-4 sm:p-5 shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 page-break-after">
      {/* Official GCERT Header Banner */}
      <div className="text-center pb-2">
        <div className="text-[12.5px] font-bold text-[#6c757d] tracking-wider uppercase">
          GCERT | સમગ્ર શિક્ષા (SAMAGRA SHIKSHA)
        </div>
        <h2 className="text-[22px] sm:text-[24px] font-black text-[#007ed4] tracking-tight my-0.5">
          {title}
        </h2>
        <div className="inline-block bg-[#e7f1ff] text-[#007ed4] border border-[#b8daff] rounded-full px-4 py-0.5 text-[12px] font-bold mt-0.5">
          {gradeSubtitle}
        </div>
      </div>

      {/* School Details Section (મુખ્ય શાળાની વિગત) */}
      <div className="mt-2.5 border border-[#007ed4] rounded-[6px] overflow-hidden">
        <div className="bg-[#e7f1ff] border-b border-[#007ed4] px-3 py-1 font-bold text-[13px] text-[#007ed4] flex items-center justify-between">
          <span>મુખ્ય શાળાની વિગત</span>
          <span className="text-[11.5px] font-semibold text-[#495057]">શૈક્ષણિક વર્ષ: {academicYear}</span>
        </div>

        <div className="p-3 bg-white text-[13px] grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2">
          {/* Row 1 */}
          <div className="flex items-center gap-2">
            <label className="font-bold text-[#212529] w-24 shrink-0 text-right sm:text-left">
              <span className="text-red-500">*</span> જિલ્લો:
            </label>
            <input
              type="text"
              value={district}
              onChange={(e) => onDistrictChange(e.target.value)}
              placeholder="જિલ્લો દાખલ કરો"
              className="w-full border border-[#ced4da] rounded px-2 py-1 text-[13px] focus:outline-none focus:border-[#007ed4] bg-white print:border-none print:p-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="font-bold text-[#212529] w-24 shrink-0 text-right sm:text-left">
              <span className="text-red-500">*</span> તાલુકો:
            </label>
            <input
              type="text"
              value={taluka}
              onChange={(e) => onTalukaChange(e.target.value)}
              placeholder="તાલુકો દાખલ કરો"
              className="w-full border border-[#ced4da] rounded px-2 py-1 text-[13px] focus:outline-none focus:border-[#007ed4] bg-white print:border-none print:p-0"
            />
          </div>

          {/* Row 2 */}
          <div className="flex items-center gap-2">
            <label className="font-bold text-[#212529] w-24 shrink-0 text-right sm:text-left">
              <span className="text-red-500">*</span> સી.આર.સી:
            </label>
            <input
              type="text"
              value={crcName}
              onChange={(e) => onCrcChange(e.target.value)}
              placeholder="સી.આર.સી. દાખલ કરો"
              className="w-full border border-[#ced4da] rounded px-2 py-1 text-[13px] focus:outline-none focus:border-[#007ed4] bg-white print:border-none print:p-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="font-bold text-[#212529] w-24 shrink-0 text-right sm:text-left">
              <span className="text-red-500">*</span> ગામ/શહેર:
            </label>
            <input
              type="text"
              value={villageCity}
              onChange={(e) => onVillageChange(e.target.value)}
              placeholder="ગામ/શહેર દાખલ કરો"
              className="w-full border border-[#ced4da] rounded px-2 py-1 text-[13px] focus:outline-none focus:border-[#007ed4] bg-white print:border-none print:p-0"
            />
          </div>

          {/* Row 3 */}
          <div className="flex items-center gap-2">
            <label className="font-bold text-[#212529] w-24 shrink-0 text-right sm:text-left">
              <span className="text-red-500">*</span> શાળાનું નામ:
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => onSchoolNameChange(e.target.value)}
              placeholder="શાળાનું નામ દાખલ કરો"
              className="w-full border border-[#ced4da] rounded px-2 py-1 text-[13px] font-bold text-[#007ed4] focus:outline-none focus:border-[#007ed4] bg-white print:border-none print:p-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="font-bold text-[#212529] w-24 shrink-0 text-right sm:text-left">
              <span className="text-red-500">*</span> U-DISE કોડ:
            </label>
            <input
              type="text"
              value={udiseCode}
              onChange={(e) => onUdiseChange(e.target.value)}
              placeholder="11 અંકનો U-DISE કોડ"
              className="w-full border border-[#ced4da] rounded px-2 py-1 text-[13px] focus:outline-none focus:border-[#007ed4] bg-white print:border-none print:p-0"
            />
          </div>

          {/* Row 4 */}
          <div className="flex items-center gap-2">
            <label className="font-bold text-[#212529] w-24 shrink-0 text-right sm:text-left">
              <span className="text-red-500">*</span> શિક્ષકનું નામ:
            </label>
            <input
              type="text"
              value={teacherName}
              onChange={(e) => onTeacherChange(e.target.value)}
              placeholder="શિક્ષકનું નામ દાખલ કરો"
              className="w-full border border-[#ced4da] rounded px-2 py-1 text-[13px] focus:outline-none focus:border-[#007ed4] bg-white print:border-none print:p-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="font-bold text-[#212529] w-24 shrink-0 text-right sm:text-left">
              <span className="text-red-500">*</span> મુખ્ય શિક્ષક:
            </label>
            <input
              type="text"
              value={principalName}
              onChange={(e) => onPrincipalChange(e.target.value)}
              placeholder="મુખ્ય શિક્ષકનું નામ દાખલ કરો"
              className="w-full border border-[#ced4da] rounded px-2 py-1 text-[13px] focus:outline-none focus:border-[#007ed4] bg-white print:border-none print:p-0"
            />
          </div>
        </div>

        {/* Attendance Days Sub-Boxes (Matching Reference Image 2) */}
        <div className="border-t border-[#007ed4] bg-[#f8f9fa] p-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Sem 1 Attendance */}
          <div className="border border-[#badbcc] rounded bg-[#e8f5e9] p-2 flex items-center justify-between gap-2 text-[12px]">
            <span className="font-bold bg-[#198754] text-white px-2 py-0.5 rounded text-[11px]">સત્ર - ૧</span>
            <div className="flex items-center gap-1.5 font-medium text-[#212529]">
              <span>હાજરી:</span>
              <input
                type="number"
                value={currentStudent?.sem1Attendance || ''}
                onChange={(e) => onStudentFieldChange('sem1Attendance', parseInt(e.target.value) || 0)}
                placeholder="હાજરી"
                className="w-14 border border-[#badbcc] rounded bg-white text-center py-0.5 text-[12px] font-bold"
              />
              <span>/ કુલ દિવસો:</span>
              <input
                type="number"
                value={currentStudent?.sem1TotalDays || ''}
                onChange={(e) => onStudentFieldChange('sem1TotalDays', parseInt(e.target.value) || 0)}
                placeholder="કુલ"
                className="w-14 border border-[#badbcc] rounded bg-white text-center py-0.5 text-[12px] font-bold"
              />
            </div>
          </div>

          {/* Sem 2 Attendance */}
          <div className="border border-[#badbcc] rounded bg-[#e8f5e9] p-2 flex items-center justify-between gap-2 text-[12px]">
            <span className="font-bold bg-[#198754] text-white px-2 py-0.5 rounded text-[11px]">સત્ર - ૨</span>
            <div className="flex items-center gap-1.5 font-medium text-[#212529]">
              <span>હાજરી:</span>
              <input
                type="number"
                value={currentStudent?.sem2Attendance || ''}
                onChange={(e) => onStudentFieldChange('sem2Attendance', parseInt(e.target.value) || 0)}
                placeholder="હાજરી"
                className="w-14 border border-[#badbcc] rounded bg-white text-center py-0.5 text-[12px] font-bold"
              />
              <span>/ કુલ દિવસો:</span>
              <input
                type="number"
                value={currentStudent?.sem2TotalDays || ''}
                onChange={(e) => onStudentFieldChange('sem2TotalDays', parseInt(e.target.value) || 0)}
                placeholder="કુલ"
                className="w-14 border border-[#badbcc] rounded bg-white text-center py-0.5 text-[12px] font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Current Student Active Info Strip (if student selected) */}
      {currentStudent && currentStudent.name && (
        <div className="mt-2.5 bg-[#f0f7ff] border border-[#b8daff] rounded-[6px] px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex items-center gap-2">
            <span className="bg-[#007ed4] text-white font-bold px-2 py-0.5 rounded text-[11px]">વિદ્યાર્થી:</span>
            <span className="font-bold text-[#007ed4]">{currentStudent.name}</span>
            <span className="text-[#6c757d]">| રોલ નં: {currentStudent.rollNo || '-'}</span>
            <span className="text-[#6c757d]">| જી.આર. નં: {currentStudent.grNo || '-'}</span>
            <span className="text-[#6c757d]">| જાતિ: {currentStudent.gender === 'M' ? 'કુમાર' : 'કન્યા'}</span>
          </div>
          <button
            type="button"
            onClick={() => setStudentModalOpen(true)}
            className="text-[#007ed4] hover:underline font-semibold text-[11.5px] cursor-pointer no-print"
          >
            બદલો / અન્ય પસંદ કરો →
          </button>
        </div>
      )}

      {/* Two Dashed Selector Action Cards (Exact Image 2 Reference) */}
      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 no-print">
        {/* Left Card: Select Student */}
        <button
          type="button"
          onClick={() => setStudentModalOpen(true)}
          className="border-2 border-dashed border-[#007ed4] rounded-[8px] p-3.5 bg-white hover:bg-[#f0f7ff] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center group"
        >
          <div className="w-10 h-10 rounded-full bg-[#e7f1ff] text-[#007ed4] flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
            <i className="bi bi-person-fill"></i>
          </div>
          <div className="text-[13.5px] font-bold text-[#007ed4]">
            વિદ્યાર્થી પસંદ કરો
          </div>
          <div className="text-[11px] text-[#6c757d]">
            (કાર્ડ જોવા અથવા પ્રિન્ટ કરવા)
          </div>
        </button>

        {/* Right Card: Whole Class Print */}
        <button
          type="button"
          onClick={() => setClassModalOpen(true)}
          className="border-2 border-dashed border-[#198754] rounded-[8px] p-3.5 bg-white hover:bg-[#f0fff4] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center group"
        >
          <div className="w-10 h-10 rounded-full bg-[#d1e7dd] text-[#198754] flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="text-[13.5px] font-bold text-[#198754]">
            આખા વર્ગનું કાર્ડ
          </div>
          <div className="text-[11px] text-[#6c757d]">
            (એક સાથે બધા કાર્ડ જોવા કે પ્રિન્ટ કરવા)
          </div>
        </button>
      </div>

      {/* Student Picker Modal */}
      {studentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="bg-[#007ed4] text-white p-3.5 flex items-center justify-between">
              <h3 className="font-bold text-[15px] flex items-center gap-2">
                <i className="bi bi-person-lines-fill"></i>
                <span>વિદ્યાર્થી પસંદ કરો ({students.length} વિદ્યાર્થીઓ)</span>
              </h3>
              <button
                type="button"
                onClick={() => setStudentModalOpen(false)}
                className="text-white hover:text-gray-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 border-b border-[#dee2e6] bg-[#f8f9fa] flex items-center justify-between gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="નામ, રોલ નં અથવા જી.આર. દ્વારા શોધો..."
                className="w-full border border-[#ced4da] rounded px-3 py-1.5 text-[13px] bg-white"
              />
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-[#198754] text-white text-xs font-bold px-3 py-1.5 rounded shrink-0 flex items-center gap-1"
              >
                <i className="bi bi-plus-lg"></i>
                <span>નવો વિદ્યાર્થી</span>
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddNewStudent} className="p-3 bg-[#e7f1ff] border-b border-[#b8daff] space-y-2 text-[12px]">
                <div className="font-bold text-[#007ed4]">નવા વિદ્યાર્થીની વિગતો:</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="નામ (ગુજરાતીમાં)"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="border rounded p-1 bg-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="રોલ નં."
                    value={newStudent.rollNo}
                    onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                    className="border rounded p-1 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="જી.આર. નં."
                    value={newStudent.grNo}
                    onChange={(e) => setNewStudent({ ...newStudent, grNo: e.target.value })}
                    className="border rounded p-1 bg-white"
                  />
                  <select
                    value={newStudent.gender}
                    onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value as any })}
                    className="border rounded p-1 bg-white"
                  >
                    <option value="M">કુમાર (Boy)</option>
                    <option value="F">કન્યા (Girl)</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-[#007ed4] text-white py-1 rounded font-bold">
                  વિદ્યાર્થી ઉમેરો
                </button>
              </form>
            )}

            <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-gray-100">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">કોઈ વિદ્યાર્થી મળ્યો નથી.</div>
              ) : (
                filteredStudents.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => {
                      onStudentSelect(st.id);
                      setStudentModalOpen(false);
                    }}
                    className={`pt-2 flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                      st.id === selectedStudentId ? 'bg-[#e7f1ff] border border-[#b8daff]' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-[13px] text-[#212529]">{st.name}</div>
                      <div className="text-[11.5px] text-[#6c757d]">
                        રોલ નં: {st.rollNo || '-'} | જી.આર: {st.grNo || '-'} | {st.gender === 'M' ? 'કુમાર' : 'કન્યા'}
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`text-xs font-bold px-3 py-1 rounded ${
                        st.id === selectedStudentId
                          ? 'bg-[#007ed4] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {st.id === selectedStudentId ? 'પસંદ કરેલ' : 'પસંદ કરો'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Whole Class Batch Modal */}
      {classModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-[16px] text-[#198754] flex items-center gap-2">
                <i className="bi bi-people-fill"></i>
                <span>આખા વર્ગનું કાર્ડ પ્રિન્ટિંગ</span>
              </h3>
              <button
                type="button"
                onClick={() => setClassModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-600">
              કુલ <span className="font-bold text-black">{students.length}</span> વિદ્યાર્થીઓના HPC કાર્ડ તૈયાર છે. તમે એક સાથે બધા પ્રિન્ટ કરી શકો છો અથવા PDF બનાવી શકો છો.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setClassModalOpen(false);
                  onBatchPrint();
                }}
                className="flex-1 bg-[#198754] hover:bg-[#157347] text-white font-bold py-2 rounded text-sm flex items-center justify-center gap-1.5"
              >
                <i className="bi bi-printer-fill"></i>
                <span>બધા કાર્ડ પ્રિન્ટ કરો</span>
              </button>
              <button
                type="button"
                onClick={() => setClassModalOpen(false)}
                className="border border-gray-300 px-4 py-2 rounded text-sm text-gray-700"
              >
                બંધ કરો
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
