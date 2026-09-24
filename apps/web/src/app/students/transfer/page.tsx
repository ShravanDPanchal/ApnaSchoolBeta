'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api-client';
import {
  FileText,
  ArrowLeft,
  Printer,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';

function StudentTransferContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStudentId = searchParams.get('studentId') || '';
  const { locale, user } = useAuth();

  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId);
  const [formData, setFormData] = useState({
    transferDate: '2026-09-10',
    reason: 'Parents moving to another city (વાલીની બદલી થવાથી)',
    leavingStandard: 'Std 1',
    conduct: 'Good (સારી)',
    progress: 'Satisfactory (સંતોષકારક)',
    destinationSchool: '',
  });

  const [lcData, setLcData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await fetchApi('/students?limit=200');
        if (res.success) {
          setStudents(res.data);
          if (!selectedStudentId && res.data.length > 0) {
            setSelectedStudentId(res.data[0].id);
          }
        }
      } catch (e: any) {
        // Silently handled
      }
    }
    loadStudents();
  }, []);

  const handleIssueLc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    setLoading(true);
    try {
      const res = await fetchApi('/students/transfer', {
        method: 'POST',
        body: JSON.stringify({
          studentId: selectedStudentId,
          ...formData,
        }),
      });

      if (res.success) {
        setLcData(res.data.leavingCertificate);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to issue Leaving Certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-gujarati">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm no-print">
        <div>
          <button
            onClick={() => router.push('/students')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> વિદ્યાર્થી યાદી
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-amber-600" />
            શાળા છોડ્યાનું પ્રમાણપત્ર (Leaving Certificate / LC)
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            કાયદેસર શાળા બદલી અને નિર્ગમ ઉતારો પ્રણાલી
          </p>
        </div>
      </div>

      {!lcData ? (
        <form onSubmit={handleIssueLc} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs max-w-2xl no-print">
          <div>
            <label className="block text-slate-700 font-bold mb-1">વિદ્યાર્થી પસંદ કરો (Select Student)</label>
            <select
              required
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  GR: {s.grNumber} - {s.fullNameGu} ({s.classNameGu})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">શાળા છોડ્યા તારીખ (Leaving Date)</label>
              <input
                type="date"
                required
                value={formData.transferDate}
                onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">કયા ધોરણમાંથી છૂટા થયા (Leaving Standard)</label>
              <input
                type="text"
                required
                value={formData.leavingStandard}
                onChange={(e) => setFormData({ ...formData, leavingStandard: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">શાળા છોડવાનું કારણ (Reason for Leaving)</label>
            <input
              type="text"
              required
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">વર્તણૂક (Conduct)</label>
              <input
                type="text"
                value={formData.conduct}
                onChange={(e) => setFormData({ ...formData, conduct: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">અભ્યાસ પ્રગતિ (Progress)</label>
              <input
                type="text"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px]">
              <strong>નોંધ:</strong> શાળા છોડ્યાનું પ્રમાણપત્ર (LC) ઈશ્યુ કર્યા પછી વિદ્યાર્થીનું સ્ટેટસ TRANSFERRED થઈ જશે અને સામાન્ય યાદીમાંથી છૂટો થશે.
            </p>
          </div>

          <div className="flex justify-end pt-3 border-t">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-md"
            >
              {loading ? 'તૈયાર થઈ રહ્યું છે...' : 'LC જનરેટ કરો અને સ્ટેટસ અપડેટ કરો'}
            </button>
          </div>
        </form>
      ) : (
        /* Printable Leaving Certificate Document View */
        <div className="space-y-4">
          <div className="flex justify-end gap-3 no-print">
            <button
              onClick={() => setLcData(null)}
              className="px-4 py-2 border rounded-lg text-slate-600 text-xs font-bold"
            >
              બીજું LC બનાવો
            </button>
            <button
              onClick={() => window.print()}
              className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-md"
            >
              <Printer className="w-4 h-4" /> પ્રમાણપત્ર છાપો (Print LC)
            </button>
          </div>

          <div className="bg-white border-2 border-slate-800 p-8 rounded-xl shadow-lg max-w-3xl mx-auto space-y-6 text-slate-900 font-gujarati text-xs">
            {/* LC Header */}
            <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {lcData.schoolNameGu}
              </h2>
              <p className="text-[11px] font-bold text-slate-600 font-sans">
                {lcData.schoolNameEn}
              </p>
              <p className="text-[10px] text-slate-500">
                શાળા માન્યતા ક્રમાંક / UDISE DISE CODE: <strong>{lcData.diseCode || '24090101234'}</strong>
              </p>
              <div className="pt-2">
                <span className="inline-block border-2 border-slate-800 px-4 py-1 font-black text-sm uppercase tracking-wider bg-slate-100">
                  શાળા છોડ્યાનું પ્રમાણપત્ર (LEAVING CERTIFICATE)
                </span>
              </div>
            </div>

            {/* Content Table */}
            <table className="w-full text-left text-xs border border-slate-400">
              <tbody className="divide-y divide-slate-300">
                <tr>
                  <td className="py-2 px-3 font-bold bg-slate-50 w-1/3">૧. જનરલ રજિસ્ટર નંબર (GR No):</td>
                  <td className="py-2 px-3 font-bold font-mono text-blue-700">{lcData.grNumber}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold bg-slate-50">૨. વિદ્યાર્થીનું પૂરું નામ:</td>
                  <td className="py-2 px-3 font-bold">{lcData.studentFullNameGu} ({lcData.studentFullNameEn})</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold bg-slate-50">૩. જાતિ (Gender):</td>
                  <td className="py-2 px-3">{lcData.gender === 'MALE' ? 'કુમાર (Boy)' : 'કન્યા (Girl)'}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold bg-slate-50">૪. જન્મ તારીખ (આંકડામાં):</td>
                  <td className="py-2 px-3 font-mono">{lcData.dateOfBirth}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold bg-slate-50">૫. જન્મ તારીખ (શબ્દોમાં):</td>
                  <td className="py-2 px-3">{lcData.dobInWords}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold bg-slate-50">૬. APAAR ID / CTS ૧૮-અંક ID:</td>
                  <td className="py-2 px-3 font-mono">{lcData.apaarId || '-'} / {lcData.ctsUniqueId || '-'}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold bg-slate-50">૭. કયા ધોરણમાંથી છૂટા થયા:</td>
                  <td className="py-2 px-3 font-bold">{lcData.leavingStandard}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold bg-slate-50">૮. શાળા છોડ્યા તારીખ:</td>
                  <td className="py-2 px-3 font-mono">{lcData.leavingDate}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold bg-slate-50">૯. શાળા છોડવાનું કારણ:</td>
                  <td className="py-2 px-3">{lcData.reasonForLeaving}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold bg-slate-50">૧૦. વર્તણૂક અને પ્રગતિ:</td>
                  <td className="py-2 px-3">{lcData.conduct} / {lcData.progress}</td>
                </tr>
              </tbody>
            </table>

            {/* Signature Blocks */}
            <div className="grid grid-cols-3 gap-6 pt-12 text-center text-xs">
              <div>
                <p className="border-t border-slate-700 pt-1 font-bold">વર્ગ શિક્ષકની સહી</p>
              </div>
              <div>
                <p className="border-t border-slate-700 pt-1 font-bold">કારકુનની સહી</p>
              </div>
              <div>
                <p className="border-t border-slate-700 pt-1 font-bold">આચાર્યશ્રીની સહી અને સિક્કો</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentTransferPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <StudentTransferContent />
    </Suspense>
  );
}
