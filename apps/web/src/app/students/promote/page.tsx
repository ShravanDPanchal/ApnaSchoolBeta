'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api-client';
import {
  ArrowUpCircle,
  ArrowLeft,
  CheckCircle2,
  Users,
  CheckSquare,
  Square,
  AlertCircle,
} from 'lucide-react';

export default function StudentPromotionPage() {
  const router = useRouter();
  const { t, locale, user } = useAuth();

  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [sourceClassId, setSourceClassId] = useState('');
  const [targetClassId, setTargetClassId] = useState('');
  const [targetAcademicYearId, setTargetAcademicYearId] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [successResult, setSuccessResult] = useState<any>(null);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [resClasses, resYears] = await Promise.all([
          fetchApi('/school/classes'),
          fetchApi('/school/academic-years'),
        ]);

        if (resClasses.success && resClasses.data.length > 0) {
          setClasses(resClasses.data);
          setSourceClassId(resClasses.data[0].id);
          if (resClasses.data.length > 1) {
            setTargetClassId(resClasses.data[1].id);
          }
        }
        if (resYears.success && resYears.data.length > 0) {
          setAcademicYears(resYears.data);
          setTargetAcademicYearId(resYears.data[0].id);
        }
      } catch (e: any) {
        // Silently handled
      }
    }
    loadMeta();
  }, []);

  // Load students for source class
  useEffect(() => {
    if (!sourceClassId) return;
    async function loadSourceStudents() {
      setLoading(true);
      try {
        const res = await fetchApi(`/students?classId=${sourceClassId}&limit=100`);
        if (res.success) {
          setStudents(res.data);
          setSelectedStudentIds(res.data.map((s: any) => s.id));
        }
      } catch (e: any) {
        // Silently handled
      } finally {
        setLoading(false);
      }
    }
    loadSourceStudents();
  }, [sourceClassId]);

  const handleSelectAll = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map((s) => s.id));
    }
  };

  const handlePromote = async () => {
    if (selectedStudentIds.length === 0) {
      alert('કૃપા કરીને પ્રમોશન માટે ઓછામાં ઓછો એક વિદ્યાર્થી પસંદ કરો.');
      return;
    }

    setPromoting(true);
    try {
      const res = await fetchApi('/students/promote', {
        method: 'POST',
        body: JSON.stringify({
          sourceClassId,
          targetClassId,
          targetAcademicYearId,
          studentIds: selectedStudentIds,
        }),
      });

      if (res.success) {
        setSuccessResult(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Promotion failed');
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="space-y-6 font-gujarati">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <button
            onClick={() => router.push('/students')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> વિદ્યાર્થી યાદી
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowUpCircle className="w-7 h-7 text-blue-600" />
            વાર્ષિક વિદ્યાર્થી પ્રમોશન (Annual Student Promotion)
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            નવા શૈક્ષણિક સત્ર માટે વિદ્યાર્થીઓને આગળના ધોરણમાં પ્રમોટ કરો
          </p>
        </div>
      </div>

      {successResult ? (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto shadow-md">
          <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
          <h2 className="text-xl font-bold text-emerald-950">પ્રમોશન સફળતાપૂર્વક પૂર્ણ થયું!</h2>
          <p className="text-xs text-emerald-800">
            કુલ <strong>{selectedStudentIds.length}</strong> વિદ્યાર્થીઓ સફળતાપૂર્વક આગળના ધોરણમાં પ્રમોટ કરવામાં આવ્યા છે.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => router.push('/students')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow"
            >
              વિદ્યાર્થી યાદી જુઓ
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Mapping Controls Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 border-b pb-2">
              પ્રમોશન સેટિંગ્સ (Promotion Configuration)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">હાલનું ધોરણ (Current Source Class)</label>
                <select
                  value={sourceClassId}
                  onChange={(e) => setSourceClassId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameGu} ({c.nameEn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">આગળનું ધોરણ (Target Class)</label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameGu} ({c.nameEn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ટાર્ગેટ શૈક્ષણિક વર્ષ (Target Academic Year)</label>
                <select
                  value={targetAcademicYearId}
                  onChange={(e) => setTargetAcademicYearId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                  {academicYears.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Student Checklist Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-800"
                >
                  {selectedStudentIds.length === students.length ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  બધા પસંદ કરો ({selectedStudentIds.length} / {students.length})
                </button>
              </div>

              <button
                onClick={handlePromote}
                disabled={promoting || selectedStudentIds.length === 0}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-lg shadow-md transition-all disabled:opacity-50"
              >
                <ArrowUpCircle className="w-4 h-4" />
                {promoting ? 'પ્રમોટ થઈ રહ્યું છે...' : `પસંદ કરેલ ${selectedStudentIds.length} વિદ્યાર્થીઓને પ્રમોટ કરો`}
              </button>
            </div>

            <table className="w-full text-left text-slate-700">
              <thead className="bg-slate-100 font-bold border-b text-[11px]">
                <tr>
                  <th className="py-2.5 px-4 w-12 text-center">પસંદ</th>
                  <th className="py-2.5 px-4">GR No</th>
                  <th className="py-2.5 px-4">વિદ્યાર્થીનું નામ</th>
                  <th className="py-2.5 px-4">હાલનું ધોરણ</th>
                  <th className="py-2.5 px-4">હાજરી / પરિણામ સ્થિતિ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => {
                  const isSelected = selectedStudentIds.includes(s.id);
                  return (
                    <tr key={s.id} className={`hover:bg-slate-50 ${isSelected ? 'bg-blue-50/40' : ''}`}>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedStudentIds([...selectedStudentIds, s.id]);
                            else setSelectedStudentIds(selectedStudentIds.filter((id) => id !== s.id));
                          }}
                          className="rounded text-blue-600"
                        />
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">{s.grNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{s.fullNameGu} ({s.fullNameEn})</td>
                      <td className="py-3 px-4 text-slate-600">{s.classNameGu}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          ઉત્તીર્ણ (Eligible for Promotion)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
