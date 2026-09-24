'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api-client';
import {
  CalendarDays,
  Clock,
  Plus,
  Users,
  GraduationCap,
  DoorClosed,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

const DAYS = [
  { key: 'MONDAY', dayNum: 1, labelGu: 'સોમવાર', labelEn: 'Monday' },
  { key: 'TUESDAY', dayNum: 2, labelGu: 'મંગળવાર', labelEn: 'Tuesday' },
  { key: 'WEDNESDAY', dayNum: 3, labelGu: 'બુધવાર', labelEn: 'Wednesday' },
  { key: 'THURSDAY', dayNum: 4, labelGu: 'ગુરુવાર', labelEn: 'Thursday' },
  { key: 'FRIDAY', dayNum: 5, labelGu: 'શુક્રવાર', labelEn: 'Friday' },
  { key: 'SATURDAY', dayNum: 6, labelGu: 'શનિવાર', labelEn: 'Saturday' },
];

export default function TimetablePage() {
  const { t, locale, user } = useAuth();
  const [viewMode, setViewMode] = useState<'CLASS' | 'TEACHER' | 'PERIODS'>('CLASS');
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [timetableData, setTimetableData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formClassId, setFormClassId] = useState('');
  const [formDayOfWeek, setFormDayOfWeek] = useState('MONDAY');
  const [formPeriodId, setFormPeriodId] = useState('');
  const [formSubjectName, setFormSubjectName] = useState('ગણિત (Mathematics)');
  const [formStaffId, setFormStaffId] = useState('');
  const [formRoomName, setFormRoomName] = useState('Room 101');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load Classes, Teachers, Periods on mount
  useEffect(() => {
    async function loadInitData() {
      try {
        const [clsRes, staffRes] = await Promise.all([
          fetchApi('/school/classes'),
          fetchApi('/staff'),
        ]);

        if (clsRes.success && clsRes.data.length > 0) {
          setClasses(clsRes.data);
          setSelectedClassId(clsRes.data[0].id);
          setFormClassId(clsRes.data[0].id);
        }

        if (staffRes.success && staffRes.data.length > 0) {
          setTeachers(staffRes.data);
          setSelectedTeacherId(staffRes.data[0].id);
          setFormStaffId(staffRes.data[0].id);
        }

        if (user?.currentAcademicYearId) {
          const perRes = await fetchApi(`/timetable/periods?academicYearId=${user.currentAcademicYearId}`);
          if (perRes.success && perRes.data.length > 0) {
            setPeriods(perRes.data);
            setFormPeriodId(perRes.data[0].id);
          }
        }
      } catch (e: any) {
        // Handled silently
      }
    }
    loadInitData();
  }, [user]);

  // Load Timetable according to active view
  useEffect(() => {
    if (!user?.currentAcademicYearId) return;

    async function loadTimetable() {
      setLoading(true);
      try {
        if (viewMode === 'CLASS' && selectedClassId) {
          const res = await fetchApi(
            `/timetable/class/${selectedClassId}?academicYearId=${user?.currentAcademicYearId}`
          );
          if (res.success) {
            setTimetableData(res.data);
          }
        } else if (viewMode === 'TEACHER' && selectedTeacherId) {
          const res = await fetchApi(
            `/timetable/teacher/${selectedTeacherId}?academicYearId=${user?.currentAcademicYearId}`
          );
          if (res.success) {
            setTimetableData(res.data);
          }
        }
      } catch (e: any) {
        // Handled silently
      } finally {
        setLoading(false);
      }
    }

    if (viewMode !== 'PERIODS') {
      loadTimetable();
    }
  }, [viewMode, selectedClassId, selectedTeacherId, user]);

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    try {
      const res = await fetchApi('/timetable/entry', {
        method: 'POST',
        body: JSON.stringify({
          academicYearId: user?.currentAcademicYearId,
          classId: formClassId,
          dayOfWeek: formDayOfWeek,
          periodId: formPeriodId,
          subjectName: formSubjectName,
          staffId: formStaffId || null,
          roomName: formRoomName || null,
        }),
      });

      if (res.success) {
        setSuccessMessage('સમયપત્રક સ્લોટ સફળતાપૂર્વક સાચવવામાં આવ્યો! (Slot saved successfully)');
        setTimeout(() => setSuccessMessage(null), 3500);
        setShowAddModal(false);

        // Reload current view
        if (viewMode === 'CLASS' && selectedClassId) {
          const reload = await fetchApi(
            `/timetable/class/${selectedClassId}?academicYearId=${user?.currentAcademicYearId}`
          );
          if (reload.success) setTimetableData(reload.data);
        } else if (viewMode === 'TEACHER' && selectedTeacherId) {
          const reload = await fetchApi(
            `/timetable/teacher/${selectedTeacherId}?academicYearId=${user?.currentAcademicYearId}`
          );
          if (reload.success) setTimetableData(reload.data);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'સમયપત્રકમાં સંઘર્ષ (Conflict) ઉદ્ભવ્યો છે');
    } finally {
      setSaving(false);
    }
  };

  // Helper to find slot for day & period
  const getSlot = (dayNum: number, periodId: string) => {
    if (!timetableData?.grid) return null;
    return timetableData.grid[dayNum]?.[periodId] || null;
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-gujarati">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <a href="/dashboard" className="text-blue-600 hover:underline flex items-center gap-1">
          <i className="bi bi-house-door"></i> Dashboard
        </a>
        <span>/</span>
        <span>{t.timetable?.title || 'સમયપત્રક (Timetable)'}</span>
      </div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-7 h-7 text-blue-600" />
            {t.timetable?.title || 'સમયપત્રક (ટાઈમટેબલ) સંચાલન'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t.timetable?.subtitle || 'વર્ગવાર તેમજ શિક્ષકવાર સમયપત્રક અને સંઘર્ષ તપાસ'} • {user?.schoolNameGu}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setErrorMessage(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            {t.timetable?.addSlot || '+ નવો તાસ ઉમેરો'}
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          {successMessage}
        </div>
      )}

      {/* Tabs for Class view / Teacher view / Periods */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('CLASS')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              viewMode === 'CLASS'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            {t.timetable?.classView || 'વર્ગવાર સમયપત્રક'}
          </button>
          <button
            onClick={() => setViewMode('TEACHER')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              viewMode === 'TEACHER'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            {t.timetable?.teacherView || 'શિક્ષકવાર સમયપત્રક'}
          </button>
          <button
            onClick={() => setViewMode('PERIODS')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              viewMode === 'PERIODS'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            {t.timetable?.periodConfig || 'તાસ રૂપરેખા'}
          </button>
        </div>

        {/* Dynamic Selector based on active view */}
        {viewMode === 'CLASS' && (
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-slate-600">{t.timetable?.selectClass || 'ધોરણ'}:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameGu} ({c.nameEn})
                </option>
              ))}
            </select>
          </div>
        )}

        {viewMode === 'TEACHER' && (
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-slate-600">{t.timetable?.selectTeacher || 'શિક્ષક'}:</span>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              {teachers.map((tc) => (
                <option key={tc.id} value={tc.id}>
                  {tc.firstNameGu} {tc.lastNameGu} ({tc.firstNameEn} {tc.lastNameEn}) - {tc.role}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* TIMETABLE MATRIX GRID VIEW */}
      {viewMode !== 'PERIODS' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          {loading ? (
            <div className="text-center py-16 text-slate-400 font-medium">ટાઈમટેબલ લોડ થઈ રહ્યું છે...</div>
          ) : (
            <table className="w-full border-collapse text-left text-xs min-w-[750px]">
              <thead>
                <tr className="bg-slate-900 text-white font-bold border-b border-slate-800">
                  <th className="py-3 px-3 w-28 text-center border-r border-slate-800">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>તાસ (Period)</span>
                    </div>
                  </th>
                  {DAYS.map((d) => (
                    <th key={d.key} className="py-3 px-3 text-center border-r border-slate-800 last:border-r-0">
                      <p className="font-bold text-white">{locale === 'gu' ? d.labelGu : d.labelEn}</p>
                      <p className="text-[10px] text-slate-400 font-normal">{d.key}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {periods.map((p) => {
                  if (p.isBreak) {
                    return (
                      <tr key={p.id} className="bg-amber-50/70 border-y border-amber-200 text-amber-900">
                        <td className="py-2 px-3 text-center font-bold border-r border-amber-200 bg-amber-100/50">
                          <span className="text-[11px]">{p.nameGu || 'મધ્યાહન રિસેસ'}</span>
                          <p className="text-[10px] font-mono text-amber-700">{p.startTime} - {p.endTime}</p>
                        </td>
                        <td colSpan={6} className="text-center py-2 font-bold tracking-widest text-amber-800 text-[11px] uppercase">
                          ☕ રિસેસ / અલ્પાહાર વિરામ (Recess Break)
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Period Header Column */}
                      <td className="py-3 px-3 text-center bg-slate-50 border-r border-slate-200">
                        <p className="font-bold text-slate-800 text-xs">
                          {p.nameGu || `તાસ ${p.periodOrder}`}
                        </p>
                        <p className="text-[10px] font-mono text-slate-500 font-medium">
                          {p.startTime} - {p.endTime}
                        </p>
                      </td>

                      {/* Day Columns */}
                      {DAYS.map((d) => {
                        const slot = getSlot(d.dayNum, p.id);
                        return (
                          <td key={d.key} className="py-2 px-2.5 border-r border-slate-200 last:border-r-0 align-top h-20">
                            {slot ? (
                              <div className="h-full bg-blue-50/80 border border-blue-200 rounded-lg p-2 flex flex-col justify-between shadow-xs hover:border-blue-400 transition-colors">
                                <div>
                                  <p className="font-bold text-blue-950 text-xs line-clamp-1">
                                    {locale === 'gu'
                                      ? (slot.subjectNameGu || slot.subjectNameEn || slot.subjectName || 'વિષય')
                                      : (slot.subjectNameEn || slot.subjectNameGu || slot.subjectName || 'Subject')}
                                  </p>
                                  {viewMode === 'CLASS' && (slot.teacherNameGu || slot.teacherNameEn || slot.staff) && (
                                    <p className="text-[11px] text-blue-800 font-medium flex items-center gap-1 mt-0.5">
                                      <Users className="w-3 h-3 text-blue-600 inline shrink-0" />
                                      <span className="truncate">
                                        {locale === 'gu'
                                          ? (slot.teacherNameGu || slot.teacherNameEn || (slot.staff && `${slot.staff.firstNameGu} ${slot.staff.lastNameGu}`))
                                          : (slot.teacherNameEn || slot.teacherNameGu || (slot.staff && `${slot.staff.firstNameEn} ${slot.staff.lastNameEn}`))}
                                      </span>
                                    </p>
                                  )}
                                  {viewMode === 'TEACHER' && (slot.classNameGu || slot.classNameEn || slot.class) && (
                                    <p className="text-[11px] text-blue-800 font-medium flex items-center gap-1 mt-0.5">
                                      <GraduationCap className="w-3 h-3 text-blue-600 inline shrink-0" />
                                      <span className="truncate">
                                        {locale === 'gu'
                                          ? (slot.classNameGu || slot.classNameEn || (slot.class && `${slot.class.nameGu} (${slot.class.nameEn})`))
                                          : (slot.classNameEn || slot.classNameGu || (slot.class && slot.class.nameEn))}
                                      </span>
                                    </p>
                                  )}
                                </div>
                                {slot.roomName && (
                                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-blue-100">
                                    <span className="flex items-center gap-0.5">
                                      <DoorClosed className="w-3 h-3 text-slate-400" />
                                      {slot.roomName}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="h-full border border-dashed border-slate-200 rounded-lg flex items-center justify-center p-2 text-[10px] text-slate-400 hover:bg-slate-100/50 transition-colors">
                                <span>-</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* PERIODS CONFIGURATION MASTER VIEW */}
      {viewMode === 'PERIODS' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                દૈનિક તાસ સમયપત્રક રૂપરેખા (Daily Periods Schedule)
              </h2>
              <p className="text-xs text-slate-500">શાળાના તમામ શૈક્ષણિક તાસ અને રિસેસ વિરામની યાદી</p>
            </div>
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">ક્રમ</th>
                  <th className="py-2.5 px-4">તાસનું નામ (ગુજરાતી / English)</th>
                  <th className="py-2.5 px-4">શરૂઆત સમય</th>
                  <th className="py-2.5 px-4">સમાપ્તિ સમય</th>
                  <th className="py-2.5 px-4 text-center">પ્રકાર</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {periods.map((p) => (
                  <tr key={p.id} className={p.isBreak ? 'bg-amber-50/60' : 'hover:bg-slate-50'}>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-600">{p.periodOrder}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      {p.nameGu} ({p.nameEn})
                    </td>
                    <td className="py-2.5 px-4 font-mono text-blue-700 font-bold">{p.startTime}</td>
                    <td className="py-2.5 px-4 font-mono text-blue-700 font-bold">{p.endTime}</td>
                    <td className="py-2.5 px-4 text-center">
                      {p.isBreak ? (
                        <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-800 text-[10px] font-bold">
                          રિસેસ / Break
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                          શૈક્ષણિક તાસ
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT SLOT MODAL WITH CONFLICT DETECTION ALERTS */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                  {t.timetable?.addSlot || 'નવો તાસ ગોઠવો (Schedule Slot)'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  શિક્ષક, વર્ગ અને રૂમ સંઘર્ષની આપમેળે ચકાસણી કરવામાં આવશે
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Error Conflict Banner */}
            {errorMessage && (
              <div className="p-3 m-4 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 flex items-start gap-2.5 text-xs font-bold animate-in shake">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-rose-900 font-extrabold text-sm">
                    {t.timetable?.conflictAlert || 'સમયપત્રક સંઘર્ષ (Conflict) મળ્યો!'}
                  </p>
                  <p className="text-rose-700 font-medium mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveEntry} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                {/* Standard / Class */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t.timetable?.selectClass || 'ધોરણ / વર્ગ'} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameGu} ({c.nameEn})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Day of Week */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t.timetable?.dayOfWeek || 'વાર (Day)'} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formDayOfWeek}
                    onChange={(e) => setFormDayOfWeek(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    {DAYS.map((d) => (
                      <option key={d.key} value={d.key}>
                        {locale === 'gu' ? d.labelGu : d.labelEn} ({d.key})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Period */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t.timetable?.period || 'તાસ ક્રમ'} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formPeriodId}
                    onChange={(e) => setFormPeriodId(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    {periods.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nameGu || `તાસ ${p.periodOrder}`} ({p.startTime}-{p.endTime})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t.timetable?.subject || 'વિષય (Subject)'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formSubjectName}
                    onChange={(e) => setFormSubjectName(e.target.value)}
                    placeholder="દા.ત. ગણિત, વિજ્ઞાન, અંગ્રેજી"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Teacher / Staff */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t.timetable?.teacher || 'શિક્ષક (Teacher)'}
                  </label>
                  <select
                    value={formStaffId}
                    onChange={(e) => setFormStaffId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- શિક્ષક પસંદ કરો --</option>
                    {teachers.map((tc) => (
                      <option key={tc.id} value={tc.id}>
                        {tc.firstNameGu} {tc.lastNameGu} ({tc.firstNameEn})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Room */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t.timetable?.room || 'વર્ગખંડ / લેબ (Room)'}
                  </label>
                  <input
                    type="text"
                    value={formRoomName}
                    onChange={(e) => setFormRoomName(e.target.value)}
                    placeholder="Room 101, Science Lab"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-900 text-[11px] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>જો શિક્ષક અથવા રૂમ આ જ સમયે અન્ય વર્ગમાં રોકાયેલ હશે, તો સિસ્ટમ આપમેળે ચેતવણી આપશે.</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors"
                >
                  રદ કરો (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {saving ? 'ચકાસી રહ્યા છીએ...' : 'તાસ સાચવો (Save Slot)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
