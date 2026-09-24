'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DomainSection, StudentHpcData } from '@/components/hpc/types';
import { HpcSchoolHeader } from '@/components/hpc/HpcSchoolHeader';
import { HpcDomainTable } from '@/components/hpc/HpcDomainTable';
import { HpcRemarksSection } from '@/components/hpc/HpcRemarksSection';

const BALVATIKA_DOMAINS_SEC1: DomainSection[] = [
  {
    id: 'physical',
    title: '૧. વિકાસ ક્ષેત્ર ૧: શારીરિક અને ચાલક વિકાસ (Physical & Motor Development)',
    competencies: [
      { id: 'phy_1', code: 'P.1', description: 'મોટા સ્નાયુઓનો વિકાસ (દોડવું, કૂદવું, લંગડી, સંતુલન સાથે ચાલવું)', sem1Level: '', sem2Level: '' },
      { id: 'phy_2', code: 'P.2', description: 'નાના સ્નાયુઓનો વિકાસ (માટીકામ, કાગળ વાળવો, દોરો પરોવવો, કાતર વાપરવી)', sem1Level: '', sem2Level: '' },
      { id: 'phy_3', code: 'P.3', description: 'આંખ અને હાથનું સંકલન (બોલ પકડવો/ફેંકવો, બ્લોક્સથી ટાવર બનાવવો)', sem1Level: '', sem2Level: '' },
      { id: 'phy_4', code: 'P.4', description: 'સ્વચ્છતા અને સારી ટેવો (હાથ ધોવા, નખ/વાળ સ્વચ્છ રાખવા, સ્વચ્છ પોશાક)', sem1Level: '', sem2Level: '' },
      { id: 'phy_5', code: 'P.5', description: 'સ્વસ્થ આહાર અને આદતો (નાસ્તો જાતે કરવો, પાણી પીવું, ખોરાકનો બગાડ ન કરવો)', sem1Level: '', sem2Level: '' },
    ],
  },
  {
    id: 'socio_emotional',
    title: '૨. વિકાસ ક્ષેત્ર ૨: સામાજિક અને ભાવનાત્મક વિકાસ (Socio-Emotional Development)',
    competencies: [
      { id: 'soc_1', code: 'S.1', description: 'સ્વ-ઓળખ અને આત્મવિશ્વાસ (પોતાનું નામ, કુટુંબ, ઘરનું સરનામું જણાવે છે)', sem1Level: '', sem2Level: '' },
      { id: 'soc_2', code: 'S.2', description: 'લાગણીઓની ઓળખ અને અભિવ્યક્તિ (આનંદ, ઉદાસી, પ્રેમ વ્યક્ત કરે છે)', sem1Level: '', sem2Level: '' },
      { id: 'soc_3', code: 'S.3', description: 'સાથીદારો સાથે સહકાર અને વહેંચણી (રમકડાં/વસ્તુઓ વહેંચે છે, વારો લે છે)', sem1Level: '', sem2Level: '' },
      { id: 'soc_4', code: 'S.4', description: 'નિયમોનું પાલન અને શિસ્ત (વર્ગખંડના સામાન્ય નિયમો સમજે છે)', sem1Level: '', sem2Level: '' },
      { id: 'soc_5', code: 'S.5', description: 'અન્યો પ્રત્યે સહાનુભૂતિ અને આદર (મિત્રોને મદદ કરવી, આભાર કહેવો)', sem1Level: '', sem2Level: '' },
    ],
  },
];

const BALVATIKA_DOMAINS_SEC2: DomainSection[] = [
  {
    id: 'language',
    title: '૩. વિકાસ ક્ષેત્ર ૩: ભાષા અને સાક્ષરતા વિકાસ (Language & Literacy Development)',
    competencies: [
      { id: 'lan_1', code: 'L.1', description: 'શ્રવણ અને અર્થગ્રહણ (વાર્તા, બાળગીતો, સરળ સૂચનાઓ ધ્યાનપૂર્વક સાંભળે છે)', sem1Level: '', sem2Level: '' },
      { id: 'lan_2', code: 'L.2', description: 'મૌખિક અભિવ્યક્તિ (ચિત્ર જોઈને બોલવું, પ્રશ્નોના ઉત્તર આપવા, પોતાના અનુભવ કહેવા)', sem1Level: '', sem2Level: '' },
      { id: 'lan_3', code: 'L.3', description: 'ધ્વનિ સભાનતા (સરખા ઉચ્ચારવાળા શબ્દો અને પ્રારંભિક ધ્વનિ ઓળખે છે)', sem1Level: '', sem2Level: '' },
      { id: 'lan_4', code: 'L.4', description: 'ચિત્ર વાંચન અને પુસ્તક પ્રીતિ (ચિત્રવાર્તા સમજવી, પુસ્તક યોગ્ય રીતે પકડવું)', sem1Level: '', sem2Level: '' },
      { id: 'lan_5', code: 'L.5', description: 'લેખન પૂર્વ તૈયારી અને મરોડ (રેખાંકન, લીટા દોરવા, અક્ષર જેવા મરોડ બનાવવા)', sem1Level: '', sem2Level: '' },
    ],
  },
  {
    id: 'cognitive',
    title: '૪. વિકાસ ક્ષેત્ર ૪: બોધાત્મક વિકાસ (Cognitive Development)',
    competencies: [
      { id: 'cog_1', code: 'C.1', description: 'અવલોકન અને સરખામણી (મોટું-નાનું, લાંબુ-ટૂંકું, ભારે-હલકું ઓળખે છે)', sem1Level: '', sem2Level: '' },
      { id: 'cog_2', code: 'C.2', description: 'રંગ અને આકારની ઓળખ (પ્રાથમિક રંગો અને આકારો - ગોળ, ચોરસ, ત્રિકોણ)', sem1Level: '', sem2Level: '' },
      { id: 'cog_3', code: 'C.3', description: 'વર્ગીકરણ અને પેટર્ન બનાવવી (સમાન વસ્તુઓ અલગ તારવવી, પેટર્ન આગળ વધારવી)', sem1Level: '', sem2Level: '' },
      { id: 'cog_4', code: 'C.4', description: 'સંખ્યા પૂર્વ સંકલ્પના અને ગણતરી (૧ થી ૧૦ સુધીની વસ્તુઓની સાચી ગણતરી)', sem1Level: '', sem2Level: '' },
      { id: 'cog_5', code: 'C.5', description: 'પર્યાવરણીય સભાનતા (વનસ્પતિ, પ્રાણીઓ, પક્ષીઓ અને ઋતુઓની સમજ)', sem1Level: '', sem2Level: '' },
    ],
  },
];

const BALVATIKA_DOMAINS_SEC3: DomainSection[] = [
  {
    id: 'creative',
    title: '૫. વિકાસ ક્ષેત્ર ૫: સર્જનાત્મક અને સૌંદર્યલક્ષી વિકાસ (Aesthetic & Creative Development)',
    competencies: [
      { id: 'cre_1', code: 'CR.1', description: 'રંગકામ અને ચિત્રકામ (મનગમતા રંગો પૂરવા, મુક્ત ચિત્ર દોરવું)', sem1Level: '', sem2Level: '' },
      { id: 'cre_2', code: 'CR.2', description: 'ગીત, સંગીત અને લય (બાળગીતો તાલ સાથે ગાવા, અભિનય કરવો)', sem1Level: '', sem2Level: '' },
      { id: 'cre_3', code: 'CR.3', description: 'કલ્પનાશીલ રમત (ઢીંગલી રમત, ડૉક્ટર-શિક્ષકનો રોલ પ્લે કરવો)', sem1Level: '', sem2Level: '' },
    ],
  },
];

const INITIAL_EMPTY_STUDENT: StudentHpcData = {
  id: 'bal_1',
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

export default function BalvatikaHpcPage() {
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
  const [selectedStudentId, setSelectedStudentId] = useState<string>('bal_1');
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
      id: `bal_${Date.now()}`,
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
      setStudents([{ ...INITIAL_EMPTY_STUDENT, id: `bal_${Date.now()}` }]);
      setSelectedStudentId(students[0]?.id || 'bal_1');
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
          <span>બાલવાટિકા HPC વિગતો સફળતાપૂર્વક સાચવવામાં આવી છે!</span>
        </div>
      )}

      {clearToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#dc3545] text-white text-xs font-semibold px-4 py-2.5 rounded shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 no-print">
          <i className="bi bi-trash3-fill text-base"></i>
          <span>ફોર્મ સફળતાપૂર્વક સાફ (Reset) કરવામાં આવ્યું છે.</span>
        </div>
      )}

      {/* Main Form Container composed of Modular Sub-components */}
      <main className="max-w-[1000px] w-full mx-auto px-2 sm:px-4 py-3 space-y-4">
        {/* Module 1: School and Student Info Header */}
        <HpcSchoolHeader
          title="સર્વગ્રાહી પ્રગતિ કાર્ડ (HPC)"
          gradeSubtitle="બાલવાટિકા (વય વર્ષ ૫ થી ૬ વર્ષના બાળકો માટે)"
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
          domains={BALVATIKA_DOMAINS_SEC1}
          currentStudent={currentStudent}
          onLevelChange={updateStudentLevel}
          sectionTitle="કોષ્ટક-૧ અધ્યયન નિષ્પત્તિઓ અને ક્ષમતાઓનું મૂલ્યાંકન"
          showNavTabs={true}
        />

        {/* Module 3: Domains 3 & 4 Table */}
        <HpcDomainTable
          id="domain-sec-2"
          domains={BALVATIKA_DOMAINS_SEC2}
          currentStudent={currentStudent}
          onLevelChange={updateStudentLevel}
          sectionTitle="કોષ્ટક-૨ અધ્યયન નિષ્પત્તિઓ અને ક્ષમતાઓનું મૂલ્યાંકન"
        />

        {/* Module 4: Domain 5 Table */}
        <HpcDomainTable
          domains={BALVATIKA_DOMAINS_SEC3}
          currentStudent={currentStudent}
          onLevelChange={updateStudentLevel}
          sectionTitle="કોષ્ટક-૩ અધ્યયન નિષ્પત્તિઓ અને ક્ષમતાઓનું મૂલ્યાંકન"
        />

        {/* Module 5: Remarks, Physical Health, Attendance & Signatures */}
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
