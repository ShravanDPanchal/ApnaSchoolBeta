'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DomainSection, StudentHpcData } from '@/components/hpc/types';
import { HpcSchoolHeader } from '@/components/hpc/HpcSchoolHeader';
import { HpcDomainTable } from '@/components/hpc/HpcDomainTable';
import { HpcRemarksSection } from '@/components/hpc/HpcRemarksSection';

const DEFAULT_DOMAINS_STD2_SEC1: DomainSection[] = [
  {
    id: 'physical',
    title: '૧. શારીરિક અને ક્રિયાત્મક વિકાસ (Physical Development)',
    competencies: [
      { id: 'p1', code: 'P.1', description: 'મોટા સ્નાયુઓનો સંતુલિત વિકાસ અને રમત-ગમતમાં ઉત્સાહપૂર્વક ભાગીદારી', sem1Level: '', sem2Level: '' },
      { id: 'p2', code: 'P.2', description: 'ઝીણા સ્નાયુઓનો વિકાસ (સુવાચ્ય અક્ષરો, ચિત્રકામ, કાપકામ અને સુશોભન)', sem1Level: '', sem2Level: '' },
      { id: 'p3', code: 'P.3', description: 'વૈયક્તિક સ્વચ્છતા અને પર્યાવરણ જાળવણીની સારી આદતો', sem1Level: '', sem2Level: '' },
    ],
  },
  {
    id: 'socio_emotional',
    title: '૨. સામાજિક અને ભાવનાત્મક વિકાસ (Socio-Emotional Development)',
    competencies: [
      { id: 's1', code: 'S.1', description: 'સહકાર, સંવાદિતા અને અન્ય સાથીઓ સાથે મૈત્રીપૂર્ણ સંબંધો', sem1Level: '', sem2Level: '' },
      { id: 's2', code: 'S.2', description: 'જવાબદારીની ભાવના અને શાળાના નિયમોનું સ્વેચ્છાએ પાલન', sem1Level: '', sem2Level: '' },
      { id: 's3', code: 'S.3', description: 'પોતાના મંતવ્યો અને લાગણીઓની સરળ અને સ્પષ્ટ રજૂઆત', sem1Level: '', sem2Level: '' },
    ],
  },
];

const DEFAULT_DOMAINS_STD2_SEC2: DomainSection[] = [
  {
    id: 'language',
    title: '૩. ભાષા અને સાક્ષરતા વિકાસ (Language & Literacy Development)',
    competencies: [
      { id: 'l1', code: 'L.1', description: 'વાર્તા, પ્રસંગ અને સૂચનાઓ સાંભળી અર્થગ્રહણ કરે છે અને પ્રશ્નોત્તરી કરે છે', sem1Level: '', sem2Level: '' },
      { id: 'l2', code: 'L.2', description: 'જોડાક્ષર રહિત અને જોડાક્ષર વાળા સરળ શબ્દો/વાક્યોનું અસ્ખલિત વાંચન', sem1Level: '', sem2Level: '' },
      { id: 'l3', code: 'L.3', description: 'વિષય આધારિત મૌખિક અને લેખિત અભિવ્યક્તિ (૩ થી ૫ વાક્યો)', sem1Level: '', sem2Level: '' },
      { id: 'l4', code: 'L.4', description: 'યોગ્ય વિરામચિહ્નો સાથે શુદ્ધ શ્રુતલેખન અને અનુલેખન', sem1Level: '', sem2Level: '' },
    ],
  },
  {
    id: 'maths',
    title: '૪. ગણિત અને સંખ્યા જ્ઞાન વિકાસ (Mathematics & Numeracy)',
    competencies: [
      { id: 'm1', code: 'M.1', description: '૧ થી ૯૯ સુધીની સંખ્યાઓની ઓળખ, વાંચન અને લેખન', sem1Level: '', sem2Level: '' },
      { id: 'm2', code: 'M.2', description: 'બે અંકના સાદા અને વદીવાળા સરવાળા અને દસકાવાળી બાદબાકી', sem1Level: '', sem2Level: '' },
      { id: 'm3', code: 'M.3', description: 'ગુણાકાર પૂર્વ ખ્યાલો (પુનરાવર્તિત સરવાળો) અને ઘડિયા ૧ થી ૫', sem1Level: '', sem2Level: '' },
      { id: 'm4', code: 'M.4', description: 'નાણું, વજન અને લંબાઈની વ્યવહારુ સમજ અને કોયડા ઉકેલ', sem1Level: '', sem2Level: '' },
    ],
  },
];

const DEFAULT_DOMAINS_STD2_SEC3: DomainSection[] = [
  {
    id: 'environment',
    title: '૫. આપણી આસપાસનું પર્યાવરણ અને સર્જનાત્મક પ્રવૃત્તિઓ',
    competencies: [
      { id: 'e1', code: 'E.1', description: 'આપણા વ્યવસાયકારો, તહેવારો, ઋતુઓ અને પર્યાવરણની સભાનતા', sem1Level: '', sem2Level: '' },
      { id: 'e2', code: 'E.2', description: 'વૈયક્તિક અને જાહેર સ્વચ્છતાનું પાલન અને પર્યાવરણ જાળવણી', sem1Level: '', sem2Level: '' },
      { id: 'e3', code: 'E.3', description: 'ચિત્રકામ, માટીકામ અને નાટ્યીકરણમાં સક્રિય ઉત્સાહ', sem1Level: '', sem2Level: '' },
    ],
  },
];

const INITIAL_EMPTY_STUDENT: StudentHpcData = {
  id: 'std2_1',
  name: '',
  nameEn: '',
  grNo: '',
  rollNo: '',
  dob: '',
  gender: 'M',
  fatherName: '',
  motherName: '',
  sem1Attendance: 0,
  sem1TotalDays: 0,
  sem2Attendance: 0,
  sem2TotalDays: 0,
  sem1Height: '',
  sem2Height: '',
  sem1Weight: '',
  sem2Weight: '',
  sem1HealthStatus: 'તંદુરસ્ત',
  sem2HealthStatus: 'તંદુરસ્ત',
  sem1TeacherRemarks: '',
  sem2TeacherRemarks: '',
  sem1ParentRemarks: '',
  sem2ParentRemarks: '',
  specialInterests: {
    sports: { sem1: '', sem2: '' },
    arts: { sem1: '', sem2: '' },
    music: { sem1: '', sem2: '' },
    speech: { sem1: '', sem2: '' },
  },
  levels: {},
};

export default function Std2HpcPage() {
  const router = useRouter();

  const [district, setDistrict] = useState('');
  const [taluka, setTaluka] = useState('');
  const [crcName, setCrcName] = useState('');
  const [villageCity, setVillageCity] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [udiseCode, setUdiseCode] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [principalName, setPrincipalName] = useState('');
  const [academicYear, setAcademicYear] = useState('2024-25');

  const [students, setStudents] = useState<StudentHpcData[]>([INITIAL_EMPTY_STUDENT]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('std2_1');
  const [savedToast, setSavedToast] = useState(false);
  const [clearToast, setClearToast] = useState(false);

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0] || INITIAL_EMPTY_STUDENT;

  const updateStudentLevel = (competencyId: string, sem: 'sem1' | 'sem2', level: '1' | '2' | '3' | '') => {
    setStudents((prev) =>
      prev.map((st) => {
        if (st.id === selectedStudentId) {
          return {
            ...st,
            levels: {
              ...st.levels,
              [competencyId]: {
                ...st.levels[competencyId],
                [sem]: level,
              },
            },
          };
        }
        return st;
      })
    );
  };

  const updateStudentField = (field: keyof StudentHpcData, value: any) => {
    setStudents((prev) =>
      prev.map((st) => {
        if (st.id === selectedStudentId) {
          return { ...st, [field]: value };
        }
        return st;
      })
    );
  };

  const handleAddStudent = (newSt: Partial<StudentHpcData>) => {
    const studentObj: StudentHpcData = {
      ...INITIAL_EMPTY_STUDENT,
      ...newSt,
      id: `std2_${Date.now()}`,
    };
    setStudents((prev) => [...prev, studentObj]);
    setSelectedStudentId(studentObj.id);
  };

  const handleClearForm = () => {
    if (typeof window !== 'undefined' && window.confirm('શું તમે ખરેખર ફોર્મની વિગતો સાફ (Reset) કરવા માંગો છો?')) {
      setDistrict('');
      setTaluka('');
      setCrcName('');
      setVillageCity('');
      setSchoolName('');
      setUdiseCode('');
      setTeacherName('');
      setPrincipalName('');
      setStudents([{ ...INITIAL_EMPTY_STUDENT, id: `std2_${Date.now()}` }]);
      setSelectedStudentId(students[0]?.id || 'std2_1');
      setClearToast(true);
      setTimeout(() => setClearToast(false), 3000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-[#212529] font-gujarati antialiased pb-28">
      {/* Top Back Button Only */}
      <div className="max-w-[1000px] mx-auto pt-4 px-2 sm:px-4 no-print flex items-center justify-start">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="bg-[#343a40] hover:bg-[#212529] text-white text-xs font-semibold px-3 py-1.5 rounded-[4px] flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <i className="bi bi-chevron-left"></i>
          <span>પાછા જાઓ</span>
        </button>
      </div>

      {savedToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#198754] text-white text-xs font-semibold px-4 py-2.5 rounded shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 no-print">
          <i className="bi bi-check-circle-fill text-base"></i>
          <span>ધોરણ-૨ HPC વિગતો સફળતાપૂર્વક સાચવવામાં આવી છે!</span>
        </div>
      )}

      {clearToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#dc3545] text-white text-xs font-semibold px-4 py-2.5 rounded shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 no-print">
          <i className="bi bi-trash3-fill text-base"></i>
          <span>ફોર્મ સફળતાપૂર્વક સાફ (Reset) કરવામાં આવ્યું છે.</span>
        </div>
      )}

      {/* Main Form Container */}
      <main className="max-w-[1000px] w-full mx-auto px-2 sm:px-4 py-3 space-y-4">
        {/* Module 1: School Header */}
        <HpcSchoolHeader
          title="સર્વગ્રાહી પ્રગતિ કાર્ડ (HPC)"
          gradeSubtitle="ધોરણ - ૨ પ્રારંભિક તબક્કો (૭ થી ૮ વર્ષના બાળકો માટે)"
          academicYear={academicYear}
          district={district}
          taluka={taluka}
          crcName={crcName}
          villageCity={villageCity}
          schoolName={schoolName}
          udiseCode={udiseCode}
          teacherName={teacherName}
          principalName={principalName}
          onDistrictChange={setDistrict}
          onTalukaChange={setTaluka}
          onCrcChange={setCrcName}
          onVillageChange={setVillageCity}
          onSchoolNameChange={setSchoolName}
          onUdiseChange={setUdiseCode}
          onTeacherChange={setTeacherName}
          onPrincipalChange={setPrincipalName}
          students={students}
          selectedStudentId={selectedStudentId}
          onStudentSelect={setSelectedStudentId}
          onAddStudent={handleAddStudent}
          currentStudent={currentStudent}
          onStudentFieldChange={updateStudentField}
          onBatchPrint={handlePrint}
        />

        {/* Module 2: Domains 1 & 2 Table with Navigation Tab Pills */}
        <HpcDomainTable
          id="domain-sec-1"
          domains={DEFAULT_DOMAINS_STD2_SEC1}
          currentStudent={currentStudent}
          onLevelChange={updateStudentLevel}
          sectionTitle="કોષ્ટક-૧ અધ્યયન નિષ્પત્તિઓ અને ક્ષમતાઓનું મૂલ્યાંકન"
          showNavTabs={true}
        />

        {/* Module 3: Domains 3 & 4 Table */}
        <HpcDomainTable
          id="domain-sec-2"
          domains={DEFAULT_DOMAINS_STD2_SEC2}
          currentStudent={currentStudent}
          onLevelChange={updateStudentLevel}
          sectionTitle="કોષ્ટક-૨ અધ્યયન નિષ્પત્તિઓ અને ક્ષમતાઓનું મૂલ્યાંકન"
        />

        {/* Module 4: Domain 5 Table */}
        <HpcDomainTable
          domains={DEFAULT_DOMAINS_STD2_SEC3}
          currentStudent={currentStudent}
          onLevelChange={updateStudentLevel}
          sectionTitle="કોષ્ટક-૩ અધ્યયન નિષ્પત્તિઓ અને ક્ષમતાઓનું મૂલ્યાંકન"
        />

        {/* Module 5: Remarks Section */}
        <HpcRemarksSection
          id="domain-sec-3"
          currentStudent={currentStudent}
          onStudentFieldChange={updateStudentField}
          teacherName={teacherName}
          principalName={principalName}
        />
      </main>

      {/* Floating Action Buttons (Exact Reference: Red 'ફોર્મ સાફ કરો' + Blue 'PDF ડાઉનલોડ / ૪ પેજ પ્રિન્ટ') */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2.5 no-print">
        {/* Exact Red Pill 'ફોર્મ સાફ કરો' Button with White Border */}
        <button
          type="button"
          onClick={handleClearForm}
          className="bg-[#eb3b4a] hover:bg-[#d62837] text-white text-[13px] font-bold py-1.5 px-4 rounded-full border-2 border-white shadow-lg hover:shadow-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <i className="bi bi-trash text-base"></i>
          <span>ફોર્મ સાફ કરો</span>
        </button>

        {/* Exact Blue Pill 'PDF ડાઉનલોડ / ૪ પેજ પ્રિન્ટ' Button with White Border */}
        <button
          type="button"
          onClick={handlePrint}
          className="bg-[#1d61e4] hover:bg-[#1550c0] text-white text-[13.5px] font-bold py-2 px-5 rounded-full border-2 border-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <i className="bi bi-printer text-lg"></i>
          <span>PDF ડાઉનલોડ / ૪ પેજ પ્રિન્ટ</span>
        </button>
      </div>
    </div>
  );
}
