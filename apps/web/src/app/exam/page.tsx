'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api-client';
import {
  Award,
  Calendar,
  Clock,
  Plus,
  Save,
  Users,
  GraduationCap,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Printer,
  ChevronRight,
  Filter,
  Sparkles,
} from 'lucide-react';

export default function ExamPage() {
  const { t, locale, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'SCHEDULES' | 'MARKS_ENTRY' | 'RESULTS'>('SCHEDULES');
  const [classes, setClasses] = useState<any[]>([]);
  const [examTypes, setExamTypes] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedExamTypeId, setSelectedExamTypeId] = useState('');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Marks Entry State
  const [selectedExamId, setSelectedExamId] = useState('');
  const [marksRoster, setMarksRoster] = useState<any>(null);
  const [marksData, setMarksData] = useState<Record<string, any>>({});
  const [savingMarks, setSavingMarks] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Results State
  const [classResults, setClassResults] = useState<any>(null);
  const [resultsLoading, setResultsLoading] = useState(false);

  // New Schedule Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [formClassId, setFormClassId] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formExamTypeId, setFormExamTypeId] = useState('');
  const [formDate, setFormDate] = useState('2026-10-15');
  const [formTheoryMax, setFormTheoryMax] = useState(70);
  const [formPracticalMax, setFormPracticalMax] = useState(20);
  const [formInternalMax, setFormInternalMax] = useState(10);
  const [formMaxMarks, setFormMaxMarks] = useState(100);
  const [formPassingMarks, setFormPassingMarks] = useState(33);
  const [modalError, setModalError] = useState<string | null>(null);

  // Load Initial Metadata
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [clsRes, subjRes] = await Promise.all([
          fetchApi('/school/classes'),
          fetchApi('/school/subjects'),
        ]);

        if (clsRes.success && clsRes.data.length > 0) {
          setClasses(clsRes.data);
          setSelectedClassId(clsRes.data[0].id);
          setFormClassId(clsRes.data[0].id);
        }

        if (subjRes.success && subjRes.data.length > 0) {
          setSubjects(subjRes.data);
          setFormSubjectId(subjRes.data[0].id);
        }

        if (user?.currentAcademicYearId) {
          const typeRes = await fetchApi(`/exam/types?academicYearId=${user.currentAcademicYearId}`);
          if (typeRes.success && typeRes.data.length > 0) {
            setExamTypes(typeRes.data);
            setSelectedExamTypeId(typeRes.data[0].id);
            setFormExamTypeId(typeRes.data[0].id);
          }
        }
      } catch (e: any) {
        // Silently handled
      }
    }
    loadMetadata();
  }, [user]);

  // Load Schedules
  useEffect(() => {
    if (!user?.currentAcademicYearId) return;

    async function loadSchedules() {
      setLoading(true);
      try {
        const res = await fetchApi(
          `/exam/schedules?academicYearId=${user?.currentAcademicYearId}&classId=${selectedClassId}&examTypeId=${selectedExamTypeId}`
        );
        if (res.success) {
          setSchedules(res.data);
          if (res.data.length > 0 && !selectedExamId) {
            setSelectedExamId(res.data[0].id);
          }
        }
      } catch (e: any) {
        // Silently handled
      } finally {
        setLoading(false);
      }
    }

    loadSchedules();
  }, [selectedClassId, selectedExamTypeId, user]);

  // Load Marks Roster for selected Exam
  useEffect(() => {
    if (!selectedExamId || activeTab !== 'MARKS_ENTRY') return;

    async function loadRoster() {
      setLoading(true);
      try {
        const res = await fetchApi(`/exam/roster/${selectedExamId}`);
        if (res.success) {
          setMarksRoster(res.data);
          const map: Record<string, any> = {};
          for (const s of res.data.roster) {
            map[s.studentId] = {
              theoryMarks: s.theoryMarks !== null ? s.theoryMarks : '',
              practicalMarks: s.practicalMarks !== null ? s.practicalMarks : '',
              internalMarks: s.internalMarks !== null ? s.internalMarks : '',
              graceMarks: s.graceMarks || 0,
              isAbsent: s.isAbsent || false,
              isExempted: s.isExempted || false,
              remark: s.remark || '',
            };
          }
          setMarksData(map);
        }
      } catch (e: any) {
        // Silently handled
      } finally {
        setLoading(false);
      }
    }
    loadRoster();
  }, [selectedExamId, activeTab]);

  // Load Class Results
  useEffect(() => {
    if (!user?.currentAcademicYearId || !selectedClassId || !selectedExamTypeId || activeTab !== 'RESULTS') return;

    async function loadResults() {
      setResultsLoading(true);
      try {
        const res = await fetchApi(
          `/exam/results/class?academicYearId=${user?.currentAcademicYearId}&classId=${selectedClassId}&examTypeId=${selectedExamTypeId}`
        );
        if (res.success) {
          setClassResults(res.data);
        }
      } catch (e: any) {
        // Silently handled
      } finally {
        setResultsLoading(false);
      }
    }
    loadResults();
  }, [selectedClassId, selectedExamTypeId, activeTab, user]);

  // Handle Mark Change
  const handleMarkChange = (studentId: string, field: string, value: any) => {
    setMarksData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  // Save Batch Marks
  const handleSaveMarks = async () => {
    if (!marksRoster?.exam?.id) return;
    setSavingMarks(true);
    try {
      const items = marksRoster.roster.map((s: any) => {
        const row = marksData[s.studentId] || {};
        return {
          studentId: s.studentId,
          enrollmentId: s.enrollmentId,
          theoryMarks: row.isAbsent || row.theoryMarks === '' ? null : Number(row.theoryMarks),
          practicalMarks: row.isAbsent || row.practicalMarks === '' ? null : Number(row.practicalMarks),
          internalMarks: row.isAbsent || row.internalMarks === '' ? null : Number(row.internalMarks),
          graceMarks: row.isAbsent ? 0 : Number(row.graceMarks || 0),
          isAbsent: !!row.isAbsent,
          isExempted: !!row.isExempted,
          remark: row.remark || '',
        };
      });

      const res = await fetchApi('/exam/marks/batch', {
        method: 'POST',
        body: JSON.stringify({
          examId: marksRoster.exam.id,
          items,
        }),
      });

      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save marks');
    } finally {
      setSavingMarks(false);
    }
  };

  // Create Schedule
  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    try {
      const res = await fetchApi('/exam/schedules', {
        method: 'POST',
        body: JSON.stringify({
          academicYearId: user?.currentAcademicYearId,
          classId: formClassId,
          subjectId: formSubjectId,
          examTypeId: formExamTypeId,
          examDate: formDate,
          theoryMax: Number(formTheoryMax),
          practicalMax: Number(formPracticalMax),
          internalMax: Number(formInternalMax),
          maxMarks: Number(formMaxMarks),
          passingMarks: Number(formPassingMarks),
        }),
      });

      if (res.success) {
        setShowScheduleModal(false);
        // Refresh schedules
        const reload = await fetchApi(
          `/exam/schedules?academicYearId=${user?.currentAcademicYearId}&classId=${selectedClassId}&examTypeId=${selectedExamTypeId}`
        );
        if (reload.success) setSchedules(reload.data);
      }
    } catch (err: any) {
      setModalError(err.message || 'Failed to create exam schedule');
    }
  };

  return (
    <div className="space-y-6 font-gujarati">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-7 h-7 text-indigo-600" />
            {t.exam?.title || 'પરીક્ષા, ગુણ નોંધણી અને પ્રગતિ પત્રક સંચાલન'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t.exam?.subtitle || 'પરીક્ષા આયોજન, ગુણ નોંધણી, પરિણામ પત્રક અને ડિજિટલ પ્રગતિ પત્રક'} • {user?.schoolNameGu}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setModalError(null);
              setShowScheduleModal(true);
            }}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            {t.exam?.createSchedule || '+ નવું પરીક્ષા આયોજન'}
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg text-xs font-bold">
          <button
            onClick={() => setActiveTab('SCHEDULES')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'SCHEDULES'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            {t.exam?.tabSchedules || 'પરીક્ષા આયોજન (Schedules)'}
          </button>
          <button
            onClick={() => setActiveTab('MARKS_ENTRY')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'MARKS_ENTRY'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            {t.exam?.tabMarksEntry || 'ગુણ નોંધણી (Marks Entry)'}
          </button>
          <button
            onClick={() => setActiveTab('RESULTS')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'RESULTS'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4" />
            {t.exam?.tabResults || 'વર્ગ પરિણામ અને મેરિટ લિસ્ટ'}
          </button>
        </div>

        {/* Global Filter Controls */}
        <div className="flex items-center gap-3 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">ધોરણ:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameGu} ({c.nameEn})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">પરીક્ષા:</span>
            <select
              value={selectedExamTypeId}
              onChange={(e) => setSelectedExamTypeId(e.target.value)}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
            >
              {examTypes.map((et) => (
                <option key={et.id} value={et.id}>
                  {et.nameGu} ({et.nameEn})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TAB 1: EXAM SCHEDULES */}
      {activeTab === 'SCHEDULES' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">
              આયોજિત પરીક્ષાઓની યાદી ({schedules.length})
            </h2>
          </div>
          <table className="w-full text-left text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">પરીક્ષા તારીખ</th>
                <th className="py-3 px-4">વિષય (Subject)</th>
                <th className="py-3 px-4">ધોરણ (Class)</th>
                <th className="py-3 px-4 text-center">થીયરી / પ્રાયોગિક / આંતરિક</th>
                <th className="py-3 px-4 text-center">કુલ મહત્તમ ગુણ</th>
                <th className="py-3 px-4 text-center">પાસિંગ ગુણ</th>
                <th className="py-3 px-4 text-right">ક્રિયા</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    આ ધોરણ અને પરીક્ષા પ્રકાર માટે કોઈ પરીક્ષા સમયપત્રક મળ્યું નથી.
                  </td>
                </tr>
              ) : (
                schedules.map((sc) => (
                  <tr key={sc.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                      {sc.examDate ? sc.examDate.split('T')[0] : 'તારીખ નક્કી નથી'}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{sc.subject.nameGu}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{sc.subject.nameEn} ({sc.subject.code})</p>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {sc.class.nameGu}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span className="text-blue-700 font-bold">{sc.theoryMax ?? '-'}</span> /{' '}
                      <span className="text-purple-700 font-bold">{sc.practicalMax ?? '-'}</span> /{' '}
                      <span className="text-amber-700 font-bold">{sc.internalMax ?? '-'}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                      {sc.maxMarks}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">
                      {sc.passingMarks}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedExamId(sc.id);
                          setActiveTab('MARKS_ENTRY');
                        }}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-md font-bold text-[11px]"
                      >
                        ગુણ નોંધણી &rarr;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: MARKS ENTRY ROSTER */}
      {activeTab === 'MARKS_ENTRY' && (
        <div className="space-y-4">
          {/* Sub-selector for Subject within Class & Exam */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold">
            <div className="flex items-center gap-3">
              <span className="text-slate-600">વિષય પસંદ કરો:</span>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="border border-indigo-300 rounded-lg px-3 py-1.5 bg-indigo-50/50 text-indigo-950 font-bold"
              >
                {schedules.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.subject.nameGu} ({sc.subject.nameEn}) - Max: {sc.maxMarks}
                  </option>
                ))}
              </select>
            </div>

            {marksRoster?.exam && (
              <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border text-[11px]">
                <span>થીયરી: <b className="text-blue-700">{marksRoster.exam.theoryMax ?? '-'}</b></span>
                <span>|</span>
                <span>પ્રાયોગિક: <b className="text-purple-700">{marksRoster.exam.practicalMax ?? '-'}</b></span>
                <span>|</span>
                <span>આંતરિક: <b className="text-amber-700">{marksRoster.exam.internalMax ?? '-'}</b></span>
                <span>|</span>
                <span>કુલ: <b className="text-slate-900">{marksRoster.exam.maxMarks}</b></span>
                <span>|</span>
                <span>પાસિંગ: <b className="text-emerald-700">{marksRoster.exam.passingMarks}</b></span>
              </div>
            )}

            <button
              onClick={handleSaveMarks}
              disabled={savingMarks || !marksRoster}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2 rounded-lg shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {savingMarks ? 'સાચવી રહ્યા છીએ...' : t.exam?.saveMarks || 'ગુણ સાચવો (Save Marks)'}
            </button>
          </div>

          {saveSuccess && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              વિદ્યાર્થીઓના ગુણ સફળતાપૂર્વક સાચવવામાં આવ્યા છે! (Marks recorded successfully)
            </div>
          )}

          {/* Marks Entry Grid */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs">
            <table className="w-full text-left text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase">
                <tr>
                  <th className="py-3 px-3 w-16 text-center">રોલ નં</th>
                  <th className="py-3 px-3 w-20">જી.આર. નં</th>
                  <th className="py-3 px-3">વિદ્યાર્થીનું નામ</th>
                  <th className="py-3 px-2 w-24 text-center">થીયરી ({marksRoster?.exam?.theoryMax || '-'})</th>
                  <th className="py-3 px-2 w-24 text-center">પ્રાયોગિક ({marksRoster?.exam?.practicalMax || '-'})</th>
                  <th className="py-3 px-2 w-24 text-center">આંતરિક ({marksRoster?.exam?.internalMax || '-'})</th>
                  <th className="py-3 px-2 w-20 text-center">કૃપાગુણ</th>
                  <th className="py-3 px-2 w-24 text-center">ગેરહાજર (AB)</th>
                  <th className="py-3 px-3 w-20 text-center">કુલ મેળવેલ</th>
                  <th className="py-3 px-3 w-16 text-center">ગ્રેડ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!marksRoster || marksRoster.roster.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-slate-400">
                      કોઈ વિદ્યાર્થીઓ મળ્યા નથી
                    </td>
                  </tr>
                ) : (
                  marksRoster.roster.map((s: any) => {
                    const row = marksData[s.studentId] || {};
                    const isAbsent = !!row.isAbsent;
                    const theory = Number(row.theoryMarks || 0);
                    const practical = Number(row.practicalMarks || 0);
                    const internal = Number(row.internalMarks || 0);
                    const grace = Number(row.graceMarks || 0);
                    const liveTotal = isAbsent ? 0 : Math.round((theory + practical + internal + grace) * 100) / 100;

                    return (
                      <tr key={s.studentId} className={isAbsent ? 'bg-rose-50/40' : 'hover:bg-slate-50'}>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-600 text-center">
                          {s.rollNumber || '-'}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">
                          {s.grNumber}
                        </td>
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-slate-900">
                            {locale === 'gu' ? `${s.firstNameGu} ${s.lastNameGu}` : `${s.firstNameEn} ${s.lastNameEn}`}
                          </p>
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="number"
                            step="0.25"
                            disabled={isAbsent}
                            value={row.theoryMarks ?? ''}
                            onChange={(e) => handleMarkChange(s.studentId, 'theoryMarks', e.target.value)}
                            className="w-20 border rounded px-2 py-1 text-center font-mono font-bold text-blue-700 focus:ring-1 focus:ring-blue-500 disabled:opacity-30 disabled:bg-slate-100"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="number"
                            step="0.25"
                            disabled={isAbsent}
                            value={row.practicalMarks ?? ''}
                            onChange={(e) => handleMarkChange(s.studentId, 'practicalMarks', e.target.value)}
                            className="w-20 border rounded px-2 py-1 text-center font-mono font-bold text-purple-700 focus:ring-1 focus:ring-purple-500 disabled:opacity-30 disabled:bg-slate-100"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="number"
                            step="0.25"
                            disabled={isAbsent}
                            value={row.internalMarks ?? ''}
                            onChange={(e) => handleMarkChange(s.studentId, 'internalMarks', e.target.value)}
                            className="w-20 border rounded px-2 py-1 text-center font-mono font-bold text-amber-700 focus:ring-1 focus:ring-amber-500 disabled:opacity-30 disabled:bg-slate-100"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="number"
                            step="1"
                            disabled={isAbsent}
                            value={row.graceMarks ?? ''}
                            onChange={(e) => handleMarkChange(s.studentId, 'graceMarks', e.target.value)}
                            className="w-16 border rounded px-2 py-1 text-center font-mono text-emerald-700 focus:ring-1 focus:ring-emerald-500 disabled:opacity-30 disabled:bg-slate-100"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleMarkChange(s.studentId, 'isAbsent', !isAbsent)}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                              isAbsent
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {isAbsent ? 'ગેરહાજર (AB)' : 'હાજર'}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                          {isAbsent ? (
                            <span className="text-rose-600 font-bold">AB</span>
                          ) : (
                            liveTotal
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          {isAbsent ? (
                            <span className="text-rose-600">AB</span>
                          ) : liveTotal >= (marksRoster?.exam?.passingMarks || 33) ? (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Pass</span>
                          ) : (
                            <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded">Fail</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CLASS RESULTS & MERIT LIST */}
      {activeTab === 'RESULTS' && (
        <div className="space-y-4">
          {resultsLoading ? (
            <div className="text-center py-16 text-slate-400 bg-white rounded-xl border">પરિણામ પત્રક લોડ થઈ રહ્યું છે...</div>
          ) : !classResults ? (
            <div className="text-center py-16 text-slate-400 bg-white rounded-xl border">કોઈ પરિણામ ડેટા મળ્યો નથી</div>
          ) : (
            <>
              {/* Summary Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
                  <p className="text-[11px] text-slate-500 font-bold">કુલ વિદ્યાર્થીઓ</p>
                  <p className="text-xl font-black text-slate-900 mt-1 font-mono">{classResults.summary.totalStudents}</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-sm text-center">
                  <p className="text-[11px] text-emerald-800 font-bold">ઉત્તીર્ણ (Passed)</p>
                  <p className="text-xl font-black text-emerald-700 mt-1 font-mono">{classResults.summary.passedStudents}</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm text-center">
                  <p className="text-[11px] text-amber-800 font-bold">પૂરક પરીક્ષા પાત્ર</p>
                  <p className="text-xl font-black text-amber-700 mt-1 font-mono">{classResults.summary.reExamStudents}</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 shadow-sm text-center">
                  <p className="text-[11px] text-rose-800 font-bold">અનુત્તીર્ણ (Failed)</p>
                  <p className="text-xl font-black text-rose-700 mt-1 font-mono">{classResults.summary.failedStudents}</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
                  <p className="text-[11px] text-slate-500 font-bold">ગેરહાજર (Absent)</p>
                  <p className="text-xl font-black text-slate-700 mt-1 font-mono">{classResults.summary.absentStudents}</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/30 shadow-sm text-center">
                  <p className="text-[11px] text-indigo-800 font-bold">પાસ ટકાવારી</p>
                  <p className="text-xl font-black text-indigo-700 mt-1 font-mono">{classResults.summary.overallPassPercentage}%</p>
                </div>
              </div>

              {/* Comprehensive Class Merit Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto text-xs">
                <table className="w-full text-left text-slate-700 min-w-[800px]">
                  <thead className="bg-slate-900 text-white font-bold text-[11px]">
                    <tr>
                      <th className="py-3 px-3 text-center w-14">નંબર</th>
                      <th className="py-3 px-3 w-16">રોલ નં</th>
                      <th className="py-3 px-3 w-20">GR નં</th>
                      <th className="py-3 px-4">વિદ્યાર્થીનું નામ</th>
                      {classResults.exams.map((ex: any) => (
                        <th key={ex.id} className="py-3 px-2 text-center">
                          <p className="line-clamp-1">{ex.subject.nameGu}</p>
                          <p className="text-[9px] text-slate-400 font-mono">({ex.maxMarks})</p>
                        </th>
                      ))}
                      <th className="py-3 px-3 text-center">કુલ મેળવેલ</th>
                      <th className="py-3 px-3 text-center">ટકા (%)</th>
                      <th className="py-3 px-2 text-center">ગ્રેડ</th>
                      <th className="py-3 px-3 text-center">પરિણામ</th>
                      <th className="py-3 px-3 text-center">પ્રગતિ પત્રક</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {classResults.students.map((st: any) => {
                      const isTopRank = st.rank === 1;
                      return (
                        <tr key={st.studentId} className={isTopRank ? 'bg-amber-50/50 hover:bg-amber-100/50' : 'hover:bg-slate-50'}>
                          <td className="py-3 px-3 text-center">
                            {st.rank ? (
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                                st.rank === 1
                                  ? 'bg-amber-400 text-amber-950 shadow-sm'
                                  : st.rank === 2
                                  ? 'bg-slate-300 text-slate-800'
                                  : st.rank === 3
                                  ? 'bg-amber-700 text-white'
                                  : 'bg-slate-100 text-slate-700 font-mono'
                              }`}>
                                {st.rank}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-600 text-center">
                            {st.rollNumber || '-'}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-indigo-700">
                            {st.grNumber}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900">
                              {locale === 'gu' ? `${st.firstNameGu} ${st.lastNameGu}` : `${st.firstNameEn} ${st.lastNameEn}`}
                            </p>
                          </td>
                          {/* Subject Breakdown Columns */}
                          {st.subjectResults.map((sub: any) => (
                            <td key={sub.examId} className="py-3 px-2 text-center font-mono">
                              {sub.isAbsent ? (
                                <span className="text-rose-600 font-bold">AB</span>
                              ) : sub.isExempted ? (
                                <span className="text-slate-400">EX</span>
                              ) : (
                                <span className={sub.isPassed ? 'text-slate-800 font-bold' : 'text-rose-600 font-bold'}>
                                  {sub.totalMarks}
                                  {sub.hasGrace && <span className="text-emerald-600 font-bold">*</span>}
                                </span>
                              )}
                            </td>
                          ))}
                          <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                            {st.totalObtained} / {st.grandMaxMarks}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-indigo-700">
                            {st.percentage}%
                          </td>
                          <td className="py-3 px-2 text-center font-bold">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px]">
                              {st.overallGrade}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              st.resultStatus === 'PASSED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : st.resultStatus === 'PASSED_WITH_GRACE'
                                ? 'bg-teal-100 text-teal-800'
                                : st.resultStatus === 'RE_EXAM_ELIGIBLE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {st.resultStatus === 'PASSED'
                                ? 'ઉત્તીર્ણ'
                                : st.resultStatus === 'PASSED_WITH_GRACE'
                                ? 'કૃપાગુણ પાસ'
                                : st.resultStatus === 'RE_EXAM_ELIGIBLE'
                                ? 'પૂરક પાત્ર'
                                : 'અનુત્તીર્ણ'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Link
                              href={`/exam/report-card/${st.studentId}?academicYearId=${user?.currentAcademicYearId}&examTypeId=${selectedExamTypeId}`}
                              className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded font-bold text-[11px] transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              પત્રક
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* CREATE SCHEDULE MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  {t.exam?.createSchedule || 'નવું પરીક્ષા આયોજન'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">વિષયવાર ગુણ રૂપરેખા અને તારીખ સેટ કરો</p>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 m-4 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 flex items-center gap-2 text-xs font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSchedule} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">પરીક્ષાનો પ્રકાર *</label>
                  <select
                    value={formExamTypeId}
                    onChange={(e) => setFormExamTypeId(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
                  >
                    {examTypes.map((et) => (
                      <option key={et.id} value={et.id}>
                        {et.nameGu} ({et.nameEn})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ધોરણ *</label>
                  <select
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameGu} ({c.nameEn})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">વિષય *</label>
                  <select
                    value={formSubjectId}
                    onChange={(e) => setFormSubjectId(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nameGu} ({s.nameEn})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">પરીક્ષા તારીખ *</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border rounded-xl space-y-3">
                <p className="font-bold text-slate-700 text-[11px]">ગુણ વિભાજન (Marks Breakdown):</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-600 font-bold mb-0.5">થીયરી મહત્તમ</label>
                    <input
                      type="number"
                      value={formTheoryMax}
                      onChange={(e) => setFormTheoryMax(Number(e.target.value))}
                      className="w-full border rounded px-2 py-1 text-center font-mono font-bold text-blue-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 font-bold mb-0.5">પ્રાયોગિક મહત્તમ</label>
                    <input
                      type="number"
                      value={formPracticalMax}
                      onChange={(e) => setFormPracticalMax(Number(e.target.value))}
                      className="w-full border rounded px-2 py-1 text-center font-mono font-bold text-purple-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 font-bold mb-0.5">આંતરિક મહત્તમ</label>
                    <input
                      type="number"
                      value={formInternalMax}
                      onChange={(e) => setFormInternalMax(Number(e.target.value))}
                      className="w-full border rounded px-2 py-1 text-center font-mono font-bold text-amber-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                  <div>
                    <label className="block text-[10px] text-slate-600 font-bold mb-0.5">કુલ ગુણ (Total Max)</label>
                    <input
                      type="number"
                      value={formMaxMarks}
                      onChange={(e) => setFormMaxMarks(Number(e.target.value))}
                      className="w-full border rounded px-2 py-1 text-center font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 font-bold mb-0.5">પાસિંગ ગુણ (Passing)</label>
                    <input
                      type="number"
                      value={formPassingMarks}
                      onChange={(e) => setFormPassingMarks(Number(e.target.value))}
                      className="w-full border rounded px-2 py-1 text-center font-mono font-bold text-emerald-700"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50"
                >
                  રદ કરો (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-md"
                >
                  આયોજન સાચવો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
