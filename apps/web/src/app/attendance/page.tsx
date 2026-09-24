'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api-client';
import {
  CalendarCheck,
  CheckCheck,
  Save,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';

export default function AttendancePage() {
  const { t, locale, user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [date, setDate] = useState('2026-09-10');
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE'>>({});
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load Classes
  useEffect(() => {
    async function loadClasses() {
      try {
        const res = await fetchApi('/school/classes');
        if (res.success && res.data.length > 0) {
          setClasses(res.data);
          setSelectedClassId(res.data[0].id);
        }
      } catch (e: any) {
        // Handled silently
      }
    }
    loadClasses();
  }, []);

  // Load Attendance for selected Class and Date
  useEffect(() => {
    if (!selectedClassId) return;
    async function loadAttendance() {
      setLoading(true);
      try {
        const res = await fetchApi(`/attendance/students?classId=${selectedClassId}&date=${date}`);
        if (res.success) {
          setStudents(res.data);
          const map: Record<string, any> = {};
          for (const s of res.data) {
            map[s.studentId] = s.status || 'PRESENT';
          }
          setAttendanceMap(map);
        }
      } catch (e: any) {
        // Handled silently
      } finally {
        setLoading(false);
      }
    }
    loadAttendance();
  }, [selectedClassId, date]);

  const handleMarkAllPresent = () => {
    const updated: Record<string, any> = {};
    for (const s of students) {
      updated[s.studentId] = 'PRESENT';
    }
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    try {
      const items = students.map((s) => ({
        studentId: s.studentId,
        enrollmentId: s.enrollmentId,
        status: attendanceMap[s.studentId] || 'PRESENT',
      }));

      await fetchApi('/attendance/students/batch', {
        method: 'POST',
        body: JSON.stringify({
          academicYearId: user?.currentAcademicYearId,
          date,
          items,
        }),
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save attendance');
    }
  };

  const presentCount = Object.values(attendanceMap).filter((v) => v === 'PRESENT').length;
  const absentCount = Object.values(attendanceMap).filter((v) => v === 'ABSENT').length;
  const percentage = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 100;

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-gujarati">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <a href="/dashboard" className="text-blue-600 hover:underline flex items-center gap-1">
          <i className="bi bi-house-door"></i> Dashboard
        </a>
        <span>/</span>
        <span>{t.attendance.title || 'દૈનિક હાજરી (Attendance)'}</span>
      </div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-7 h-7 text-blue-600" />
            {t.attendance.title}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t.attendance.subtitle} • {user?.schoolNameGu}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleMarkAllPresent}
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold px-3.5 py-2.5 rounded-lg transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            {t.attendance.markAllPresent}
          </button>
          <button
            onClick={handleSaveAttendance}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            {t.attendance.saveAttendance}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          હાજરી સફળતાપૂર્વક નોંધાઈ ગઈ છે! (Attendance recorded successfully)
        </div>
      )}

      {/* Class & Date Selector Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-bold text-slate-700">{t.attendance.selectClass}:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="text-xs font-bold border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameGu} ({c.nameEn})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-bold text-slate-700">{t.attendance.selectDate}:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-xs font-mono font-bold border border-slate-300 rounded-lg px-3 py-2 bg-white text-blue-700 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Live Attendance Ratio */}
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border text-xs">
          <span className="font-bold text-emerald-700">હાજર: {presentCount}</span>
          <span className="text-slate-300">|</span>
          <span className="font-bold text-rose-700">ગેરહાજર: {absentCount}</span>
          <span className="text-slate-300">|</span>
          <span className="font-bold text-blue-700 font-mono">{percentage}%</span>
        </div>
      </div>

      {/* Fast Attendance Roster Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <table className="w-full text-left text-slate-700">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[11px]">
            <tr>
              <th className="py-3 px-4">{t.attendance.rollNo}</th>
              <th className="py-3 px-4">GR No</th>
              <th className="py-3 px-4">{t.students.studentName}</th>
              <th className="py-3 px-4 text-center">{t.attendance.status}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-slate-400">
                  આ વર્ગમાં કોઈ વિદ્યાર્થીઓ મળ્યા નથી
                </td>
              </tr>
            ) : (
              students.map((s) => {
                const currentStatus = attendanceMap[s.studentId] || 'PRESENT';
                return (
                  <tr key={s.studentId} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">
                      {s.rollNumber || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {s.grNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 text-sm">
                        {locale === 'gu' ? `${s.firstNameGu} ${s.lastNameGu}` : `${s.firstNameEn} ${s.lastNameEn}`}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => setAttendanceMap({ ...attendanceMap, [s.studentId]: 'PRESENT' })}
                          className={`px-3 py-1 rounded-md transition-all ${
                            currentStatus === 'PRESENT'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          હાજર (P)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttendanceMap({ ...attendanceMap, [s.studentId]: 'ABSENT' })}
                          className={`px-3 py-1 rounded-md transition-all ${
                            currentStatus === 'ABSENT'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          ગેરહાજર (A)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttendanceMap({ ...attendanceMap, [s.studentId]: 'LEAVE' })}
                          className={`px-3 py-1 rounded-md transition-all ${
                            currentStatus === 'LEAVE'
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          રજા (L)
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
