'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api-client';
import {
  UserCheck,
  CheckCheck,
  Save,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export default function StaffAttendancePage() {
  const { t, locale, user } = useAuth();
  const [date, setDate] = useState('2026-09-10');
  const [staffList, setStaffList] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: string; leaveType?: string; remarks?: string }>>({});
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryData, setSummaryData] = useState<any[]>([]);
  const [summaryMonth, setSummaryMonth] = useState(9);
  const [summaryYear, setSummaryYear] = useState(2026);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Load Staff Attendance for selected Date
  useEffect(() => {
    async function loadAttendance() {
      setLoading(true);
      try {
        const res = await fetchApi(`/attendance/staff?date=${date}`);
        if (res.success && Array.isArray(res.data)) {
          setStaffList(res.data);
          const map: Record<string, any> = {};
          for (const s of res.data) {
            map[s.staffId] = {
              status: s.status || 'PRESENT',
              leaveType: s.leaveType || undefined,
              remarks: s.remarks || '',
            };
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
  }, [date]);

  const handleMarkAllPresent = () => {
    const updated: Record<string, any> = {};
    for (const s of staffList) {
      updated[s.staffId] = {
        status: 'PRESENT',
        leaveType: undefined,
        remarks: '',
      };
    }
    setAttendanceMap(updated);
  };

  const handleStatusChange = (staffId: string, status: string, leaveType?: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        status,
        leaveType: status === 'LEAVE' ? (leaveType || 'CASUAL_LEAVE') : undefined,
      },
    }));
  };

  const handleRemarksChange = (staffId: string, remarks: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        remarks,
      },
    }));
  };

  const handleSaveAttendance = async () => {
    try {
      const items = staffList.map((s) => ({
        staffId: s.staffId,
        status: attendanceMap[s.staffId]?.status || 'PRESENT',
        leaveType: attendanceMap[s.staffId]?.leaveType,
        remarks: attendanceMap[s.staffId]?.remarks,
      }));

      await fetchApi('/attendance/staff/batch', {
        method: 'POST',
        body: JSON.stringify({
          date,
          items,
        }),
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save staff attendance');
    }
  };

  const handleOpenSummary = async () => {
    setShowSummaryModal(true);
    setSummaryLoading(true);
    try {
      const res = await fetchApi(`/attendance/staff/monthly-summary?month=${summaryMonth}&year=${summaryYear}`);
      if (res.success) {
        setSummaryData(res.data);
      }
    } catch (e: any) {
      // Handled silently
    } finally {
      setSummaryLoading(false);
    }
  };

  const presentCount = Object.values(attendanceMap).filter((v) => v.status === 'PRESENT').length;
  const leaveCount = Object.values(attendanceMap).filter((v) => v.status === 'LEAVE').length;
  const absentCount = Object.values(attendanceMap).filter((v) => v.status === 'ABSENT').length;
  const halfDayCount = Object.values(attendanceMap).filter((v) => v.status === 'HALF_DAY').length;

  return (
    <div className="space-y-6 font-gujarati">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-indigo-600" />
            {t.staffAttendance?.title || 'શિક્ષક/સ્ટાફ દૈનિક હાજરી તેમજ રજા નોંધણી'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t.staffAttendance?.subtitle || 'દૈનિક હાજરી રજિસ્ટર, રજાના પ્રકારો અને માસિક પત્રક'} • {user?.schoolNameGu}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/attendance/staff/leave-report"
            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-400 text-amber-900 text-xs font-bold px-3.5 py-2.5 rounded-lg transition-colors"
          >
            <Calendar className="w-4 h-4 text-amber-700" />
            રજા રિપોર્ટ
          </Link>
          <button
            onClick={handleOpenSummary}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-600" />
            {t.staffAttendance?.monthlySummary || 'માસિક હાજરી પત્રક'}
          </button>
          <button
            onClick={handleMarkAllPresent}
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold px-3.5 py-2.5 rounded-lg transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            {t.staffAttendance?.markAllPresent || 'બધા હાજર (Mark All Present)'}
          </button>
          <button
            onClick={handleSaveAttendance}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            {t.staffAttendance?.saveAttendance || 'હાજરી સાચવો'}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          શિક્ષક/સ્ટાફ હાજરી સફળતાપૂર્વક સાચવવામાં આવી છે! (Staff attendance recorded successfully)
        </div>
      )}

      {/* Date Selector & Live Counts */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-bold text-slate-700">{t.staffAttendance?.selectDate || 'હાજરી તારીખ'}:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-xs font-mono font-bold border border-slate-300 rounded-lg px-3 py-2 bg-white text-indigo-700 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Live Attendance Counters */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border text-xs">
          <span className="font-bold text-emerald-700">હાજર: {presentCount}</span>
          <span className="text-slate-300">|</span>
          <span className="font-bold text-amber-700">રજા (Leaves): {leaveCount}</span>
          <span className="text-slate-300">|</span>
          <span className="font-bold text-purple-700">અડધો દિવસ: {halfDayCount}</span>
          <span className="text-slate-300">|</span>
          <span className="font-bold text-rose-700">ગેરહાજર: {absentCount}</span>
        </div>
      </div>

      {/* Staff Roster Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <table className="w-full text-left text-slate-700">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[11px]">
            <tr>
              <th className="py-3 px-4">કર્મચારી કોડ</th>
              <th className="py-3 px-4">{t.staffAttendance?.staffName || 'કર્મચારી / શિક્ષકનું નામ'}</th>
              <th className="py-3 px-4">{t.staffAttendance?.role || 'હોદ્દો'}</th>
              <th className="py-3 px-4 text-center">હાજરી સ્થિતિ & રજાનો પ્રકાર</th>
              <th className="py-3 px-4">વિગત / નોંધ (Remarks)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staffList.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-400">
                  કોઈ સ્ટાફ સભ્યો મળ્યા નથી
                </td>
              </tr>
            ) : (
              staffList.map((s) => {
                const current = attendanceMap[s.staffId] || { status: 'PRESENT' };
                return (
                  <tr key={s.staffId} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-600">
                      {s.employeeCode || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 text-sm">
                        {locale === 'gu' ? `${s.firstNameGu} ${s.lastNameGu}` : `${s.firstNameEn} ${s.lastNameEn}`}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">{s.mobileNumber || ''}</p>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-semibold text-slate-700">
                        {s.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        {/* Status Buttons */}
                        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 text-[11px] font-bold">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.staffId, 'PRESENT')}
                            className={`px-3 py-1 rounded-md transition-all ${
                              current.status === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            હાજર (P)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.staffId, 'HALF_DAY')}
                            className={`px-3 py-1 rounded-md transition-all ${
                              current.status === 'HALF_DAY'
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            અડધો દિવસ (HD)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.staffId, 'LEAVE', current.leaveType || 'CASUAL_LEAVE')}
                            className={`px-3 py-1 rounded-md transition-all ${
                              current.status === 'LEAVE'
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            રજા (Leave)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.staffId, 'ABSENT')}
                            className={`px-3 py-1 rounded-md transition-all ${
                              current.status === 'ABSENT'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            ગેરહાજર (A)
                          </button>
                        </div>

                        {/* Leave Type Sub-selector if LEAVE */}
                        {current.status === 'LEAVE' && (
                          <div className="flex items-center gap-1.5 animate-in fade-in">
                            <span className="text-[10px] text-slate-500 font-bold">પ્રકાર:</span>
                            <select
                              value={current.leaveType || 'CASUAL_LEAVE'}
                              onChange={(e) => handleStatusChange(s.staffId, 'LEAVE', e.target.value)}
                              className="text-[11px] font-bold border border-amber-300 rounded px-2 py-0.5 bg-amber-50 text-amber-900 focus:ring-1 focus:ring-amber-500"
                            >
                              <option value="CASUAL_LEAVE">પરચૂરણ રજા (CL)</option>
                              <option value="MEDICAL_LEAVE">તબીબી રજા (ML)</option>
                              <option value="EARNED_LEAVE">હક્ક રજા (EL)</option>
                              <option value="DUTY_LEAVE">ઓન-ડ્યુટી રજા (DL)</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        placeholder="રજા/ગેરહાજરી નોંધ..."
                        value={current.remarks || ''}
                        onChange={(e) => handleRemarksChange(s.staffId, e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded px-2 py-1 text-slate-700 bg-white focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Monthly Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                  {t.staffAttendance?.monthlySummary || 'માસિક હાજરી અને રજા પત્રક'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  માસિક હાજર દિવસો, ગેરહાજરી અને રજાઓ (CL/ML/EL/DL) નું વિશ્લેષણ
                </p>
              </div>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Filter controls */}
            <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-2">
                <span>માસ (Month):</span>
                <select
                  value={summaryMonth}
                  onChange={(e) => setSummaryMonth(parseInt(e.target.value, 10))}
                  className="border rounded px-2.5 py-1 text-slate-800"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span>વર્ષ (Year):</span>
                <input
                  type="number"
                  value={summaryYear}
                  onChange={(e) => setSummaryYear(parseInt(e.target.value, 10))}
                  className="border rounded px-2.5 py-1 w-20 text-slate-800"
                />
              </div>
              <button
                onClick={handleOpenSummary}
                className="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700"
              >
                શોધો (Fetch)
              </button>
            </div>

            {/* Summary Table */}
            <div className="overflow-y-auto p-4 flex-1 text-xs">
              {summaryLoading ? (
                <div className="text-center py-12 text-slate-400 font-medium">ડેટા લોડ થઈ રહ્યો છે...</div>
              ) : summaryData.length === 0 ? (
                <div className="text-center py-12 text-slate-400">કોઈ ડેટા મળ્યો નથી</div>
              ) : (
                <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">કર્મચારીનું નામ</th>
                      <th className="py-2.5 px-3 text-center text-emerald-700">હાજર (P)</th>
                      <th className="py-2.5 px-3 text-center text-purple-700">અડધો દિવસ (HD)</th>
                      <th className="py-2.5 px-3 text-center text-rose-700">ગેરહાજર (A)</th>
                      <th className="py-2.5 px-3 text-center text-amber-700">CL</th>
                      <th className="py-2.5 px-3 text-center text-amber-700">ML</th>
                      <th className="py-2.5 px-3 text-center text-amber-700">EL</th>
                      <th className="py-2.5 px-3 text-center text-amber-700">DL</th>
                      <th className="py-2.5 px-3 text-center font-bold text-slate-900">કુલ રજાઓ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summaryData.map((row) => (
                      <tr key={row.staffId} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {locale === 'gu' ? `${row.firstNameGu} ${row.lastNameGu}` : `${row.firstNameEn} ${row.lastNameEn}`}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-600">{row.presentDays}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-purple-600">{row.halfDays}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-rose-600">{row.absentDays}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{row.casualLeaves}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{row.medicalLeaves}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{row.earnedLeaves}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{row.dutyLeaves}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-amber-700 bg-amber-50/50">
                          {row.totalLeaves}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowSummaryModal(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900"
              >
                બંધ કરો (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
