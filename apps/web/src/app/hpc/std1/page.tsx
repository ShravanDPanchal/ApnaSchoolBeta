'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DomainSection, StudentHpcData } from '@/components/hpc/types';
import { HpcSchoolHeader } from '@/components/hpc/HpcSchoolHeader';
import { HpcDomainTable } from '@/components/hpc/HpcDomainTable';
import { HpcRemarksSection } from '@/components/hpc/HpcRemarksSection';

const DEFAULT_DOMAINS_STD1_SEC1: DomainSection[] = [
  {
    id: 'physical',
    title: '૧. શારીરિક અને ક્રિયાત્મક વિકાસ (Physical Development)',
    competencies: [
      { id: 'p1', code: 'P.1', description: 'મોટા સ્નાયુઓનો વિકાસ (દોડવું, કૂદવું, લંગડી અને સંતુલન સાથે ચાલવું)', sem1Level: '', sem2Level: '' },
      { id: 'p2', code: 'P.2', description: 'નાના સ્નાયુઓનો વિકાસ (કાગળકામ, માટીકામ, પેન્સિલ પકડવી અને મરોડ)', sem1Level: '', sem2Level: '' },
      { id: 'p3', code: 'P.3', description: 'આંખ અને હાથનું સંકલન (દડો ઝીલવો/ફેંકવો, દોરો પરોવવો)', sem1Level: '', sem2Level: '' },
      { id: 'p4', code: 'P.4', description: 'સ્વચ્છતા અને આરોગ્યપ્રદ ટેવોનું નિયમિત પાલન', sem1Level: '', sem2Level: '' },
      { id: 'p5', code: 'P.5', description: 'સ્વસ્થ આહાર અને નિયમિત પોષણ સંબંધી ટેવો', sem1Level: '', sem2Level: '' },
    ],
  },
  {
    id: 'socio_emotional',
    title: '૨. સામાજિક અને આવેગાત્મક વિકાસ (Socio-Emotional Development)',
    competencies: [
      { id: 's1', code: 'S.1', description: 'સ્વ-ઓળખ અને આત્મવિશ્વાસપૂર્વક વાતચીત કરવી', sem1Level: '', sem2Level: '' },
      { id: 's2', code: 'S.2', description: 'લાગણીઓની યોગ્ય અભિવ્યક્તિ અને સંયમ', sem1Level: '', sem2Level: '' },
      { id: 's3', code: 'S.3', description: 'સાથીદારો સાથે સહકાર અને વસ્તુઓની વહેંચણી', sem1Level: '', sem2Level: '' },
      { id: 's4', code: 'S.4', description: 'વર્ગખંડના સામાન્ય નિયમો અને શિસ્તનું પાલન', sem1Level: '', sem2Level: '' },
      { id: 's5', code: 'S.5', description: 'અન્યો પ્રત્યે સહાનુભૂતિ, આદર અને મદદરૂપ વલણ', sem1Level: '', sem2Level: '' },
    ],
  },
];

const DEFAULT_DOMAINS_STD1_SEC2: DomainSection[] = [
  {
    id: 'language',
    title: '૩. ભાષા અને સાક્ષરતા વિકાસ (Language & Literacy Development)',
    competencies: [
      { id: 'l1', code: 'L.1', description: 'વાર્તા, કવિતા અને વર્ગખંડ સંવાદ ધ્યાનપૂર્વક સાંભળે છે અને પ્રતિક્રિયા આપે છે', sem1Level: '', sem2Level: '' },
      { id: 'l2', code: 'L.2', description: 'મૌખિક અભિવ્યક્તિ (પોતાના વિચારો, અનુભવો અને ચિત્ર વર્ણન સ્પષ્ટ રીતે રજૂ કરે છે)', sem1Level: '', sem2Level: '' },
      { id: 'l3', code: 'L.3', description: 'ધ્વનિ અને મૂળાક્ષર ઓળખ (ક થી જ્ઞ, સાદા અને કાના-માત્રા વાળા અક્ષરો ઓળખે છે)', sem1Level: '', sem2Level: '' },
      { id: 'l4', code: 'L.4', description: 'વાંચન (સરળ શબ્દો, ટૂંકા વાક્યો અને ચિત્રવાર્તા અસ્ખલિત વાંચે છે)', sem1Level: '', sem2Level: '' },
      { id: 'l5', code: 'L.5', description: 'લેખન (અક્ષરોનો સાચો મરોડ, શબ્દોનું અનુલેખન અને શ્રુતલેખન કરે છે)', sem1Level: '', sem2Level: '' },
    ],
  },
  {
    id: 'maths',
    title: '૪. ગણિત અને સંખ્યા જ્ઞાન વિકાસ (Mathematics & Numeracy)',
    competencies: [
      { id: 'm1', code: 'M.1', description: 'સંખ્યા જ્ઞાન (૧ થી ૫૦ સુધીની સંખ્યાઓ ગણે છે, ઓળખે છે અને લખે છે)', sem1Level: '', sem2Level: '' },
      { id: 'm2', code: 'M.2', description: 'સરવાળા અને બાદબાકી (એક અંકના સાદા સરવાળા અને બાદબાકી મૂર્ત વસ્તુઓ દ્વારા કરે છે)', sem1Level: '', sem2Level: '' },
      { id: 'm3', code: 'M.3', description: 'સ્થાન કિંમત અને જૂથ બનાવટ (૧૦-૧૦ ના જૂથ બનાવી દશક-એકમ સમજે છે)', sem1Level: '', sem2Level: '' },
      { id: 'm4', code: 'M.4', description: 'આકારો અને પેટર્ન (ભૌમિતિક આકારો ઓળખે છે અને પેટર્ન આગળ વધારે છે)', sem1Level: '', sem2Level: '' },
      { id: 'm5', code: 'M.5', description: 'વ્યવહારુ માપન (નાણું, વજન, લંબાઈ અને સમયના વ્યવહારુ ખ્યાલો સમજે છે)', sem1Level: '', sem2Level: '' },
    ],
  },
];

const DEFAULT_DOMAINS_STD1_SEC3: DomainSection[] = [
  {
    id: 'environment',
    title: '૫. આપણી આસપાસનું પર્યાવરણ અને જીવન કૌશલ્ય (Environmental & Life Skills)',
    competencies: [
      { id: 'e1', code: 'E.1', description: 'પરિવાર, શાળા અને આસપાસના પ્રાણી-પક્ષીઓ અને વનસ્પતિની ઓળખ', sem1Level: '', sem2Level: '' },
      { id: 'e2', code: 'E.2', description: 'સ્વચ્છતા, આરોગ્ય અને સારી ટેવોનું નિયમિત પાલન કરે છે', sem1Level: '', sem2Level: '' },
      { id: 'e3', code: 'E.3', description: 'ચિત્રકામ, માટીકામ અને સર્જનાત્મક હસ્તકલામાં સક્રિય રસ લે છે', sem1Level: '', sem2Level: '' },
      { id: 'e4', code: 'E.4', description: 'શારીરિક રમતો અને સામૂહિક પ્રવૃત્તિઓમાં સહકારથી ભાગ લે છે', sem1Level: '', sem2Level: '' },
      { id: 'e5', code: 'E.5', description: 'બાળગીતો તાલ સાથે ગાવા અને અભિનય નાટકમાં ભાગીદારી', sem1Level: '', sem2Level: '' },
    ],
  },
];

const INITIAL_EMPTY_STUDENT: StudentHpcData = {
  id: 'st_1',
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

export default function Std1HpcPage() {
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
  const [selectedStudentId, setSelectedStudentId] = useState<string>('st_1');
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
      id: `st_${Date.now()}`,
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
      setStudents([{ ...INITIAL_EMPTY_STUDENT, id: `st_${Date.now()}` }]);
      setSelectedStudentId(students[0]?.id || 'st_1');
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
      {/* Top Bar with Back Button Only */}
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
          <span>ધોરણ-૧ HPC વિગતો સફળતાપૂર્વક સાચવવામાં આવી છે!</span>
        </div>
      )}

      {clearToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#dc3545] text-white text-xs font-semibold px-4 py-2.5 rounded shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 no-print">
          <i className="bi bi-trash3-fill text-base"></i>
          <span>ફોર્મ સફળતાપૂર્વક સાફ (Reset) કરવામાં આવ્યું છે.</span>
        </div>
      )}

      {/* Main Form Container with Sub-components */}
      <main className="max-w-[1000px] w-full mx-auto px-2 sm:px-4 py-3 space-y-4">
        {/* Module 1: School & Student Header Box */}
        <HpcSchoolHeader
          title="સર્વગ્રાહી પ્રગતિ કાર્ડ (HPC)"
          gradeSubtitle="ધોરણ - ૧ પ્રારંભિક તબક્કો (૬ થી ૮ વર્ષના બાળકો માટે)"
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

        {/* Module 2: Domains 1 & 2 Table (With 3 Navigation Tab Pills at the top) */}
        <HpcDomainTable
          id="domain-sec-1"
          domains={DEFAULT_DOMAINS_STD1_SEC1}
          currentStudent={currentStudent}
          onLevelChange={updateStudentLevel}
          sectionTitle="કોષ્ટક-૧ અધ્યયન નિષ્પત્તિઓ અને ક્ષમતાઓનું મૂલ્યાંકન"
          showNavTabs={true}
        />

        {/* Module 3: Domains 3 & 4 Table */}
        <HpcDomainTable
          id="domain-sec-2"
          domains={DEFAULT_DOMAINS_STD1_SEC2}
          currentStudent={currentStudent}
          onLevelChange={updateStudentLevel}
          sectionTitle="કોષ્ટક-૨ અધ્યયન નિષ્પત્તિઓ અને ક્ષમતાઓનું મૂલ્યાંકન"
        />

        {/* Module 4: Domain 5 Table */}
        <HpcDomainTable
          domains={DEFAULT_DOMAINS_STD1_SEC3}
          currentStudent={currentStudent}
          onLevelChange={updateStudentLevel}
          sectionTitle="કોષ્ટક-૩ અધ્યયન નિષ્પત્તિઓ અને ક્ષમતાઓનું મૂલ્યાંકન"
        />

        {/* Module 5: Remarks, Physical Measurements, Attendance Summary & Signatures */}
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
