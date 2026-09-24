'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { API_BASE, fetchApi } from '@/lib/api-client';
import {
  FileSpreadsheet,
  Download,
  Upload,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';

export default function StudentImportPage() {
  const router = useRouter();
  const { locale, user } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadYears() {
      try {
        const res = await fetchApi('/school/academic-years');
        if (res.success && res.data.length > 0) {
          setAcademicYears(res.data);
          const activeYear = res.data.find((y: any) => y.isActive) || res.data[0];
          setSelectedAcademicYearId(user?.currentAcademicYearId || activeYear.id);
        }
      } catch (err) {
        // Fallback
      }
    }
    loadYears();
  }, [user]);

  const handleDownloadTemplate = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('apna_token') || '' : '';
    window.open(`${API_BASE}/students/import-template?token=${encodeURIComponent(token)}`, '_blank');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.match(/\.(xlsx|xls)$/i)) {
        setErrorMessage('કૃપા કરીને માન્ય Excel ફાઇલ (.xlsx અથવા .xls) પસંદ કરો.');
        setFile(null);
        return;
      }
      setFile(selected);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('કૃપા કરીને અપલોડ કરવા માટે એક્સેલ ફાઇલ પસંદ કરો.');
      return;
    }

    if (!selectedAcademicYearId) {
      setErrorMessage('કૃપા કરીને શૈક્ષણિક વર્ષ પસંદ કરો.');
      return;
    }

    setUploading(true);
    setResult(null);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('academicYearId', selectedAcademicYearId);

      const token = typeof window !== 'undefined' ? localStorage.getItem('apna_token') || '' : '';
      const res = await fetch(`${API_BASE}/students/import`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.message || 'Import failed');
      }

      setResult(data.data);
    } catch (err: any) {
      setErrorMessage(err.message || 'વિદ્યાર્થી આયાત દરમિયાન ભૂલ આવી. કૃપા કરીને ફાઇલનું ફોર્મેટ તપાસો.');
    } finally {
      setUploading(false);
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
            <FileSpreadsheet className="w-7 h-7 text-emerald-600" />
            એક્સેલ બલ્ક વિદ્યાર્થી આયાત (Excel Bulk Import)
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            નવા સત્રના વિદ્યાર્થીઓનું એકસાથે લિસ્ટ એક્સેલ ફાઇલ દ્વારા અપલોડ કરો
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition-all"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          નમૂના ફોર્મેટ ડાઉનલોડ કરો (Download Template)
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-xs font-bold">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload Box */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-2xl space-y-6 text-xs">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-blue-900">
          <p className="font-bold text-[12px]">મહત્વપૂર્ણ સૂચનાઓ:</p>
          <ul className="list-disc list-inside space-y-1 text-blue-800 text-[11px]">
            <li>પહેલા ઉપર આપેલ <strong>નમૂના ફોર્મેટ (Template)</strong> ડાઉનલોડ કરો.</li>
            <li>GR નંબર, વિદ્યાર્થીનું અંગ્રેજી નામ, ગુજરાતી નામ, ધોરણ (૧-૮) અને જન્મ તારીખ ફરજિયાત છે.</li>
            <li>ડુપ્લીકેટ GR નંબર ધરાવતી પંક્તિઓ આપમેળે શોધીને દર્શાવવામાં આવશે.</li>
          </ul>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          {academicYears.length > 0 && (
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">શૈક્ષણિક વર્ષ (Academic Year) *</label>
              <select
                value={selectedAcademicYearId}
                onChange={(e) => setSelectedAcademicYearId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                required
              >
                {academicYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name} {y.isActive ? '(ચાલુ સત્ર)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-emerald-500 transition-colors bg-slate-50/50">
            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="font-bold text-slate-700 mb-1">
              {file ? file.name : 'એક્સેલ ફાઇલ (.xlsx) અહીં પસંદ કરો'}
            </p>
            <p className="text-[11px] text-slate-400 mb-4">
              {file ? `${Math.round(file.size / 1024)} KB` : 'ડ્રેગ કરો અથવા ફાઇલ પસંદ કરવા ક્લિક કરો'}
            </p>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold rounded-lg cursor-pointer shadow-sm"
            >
              ફાઇલ પસંદ કરો
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!file || uploading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              {uploading ? 'આયાત થઈ રહ્યું છે...' : 'વિદ્યાર્થી ડેટા અપલોડ કરો (Import Now)'}
            </button>
          </div>
        </form>
      </div>

      {/* Import Result Diagnostics */}
      {result && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-3 border-b pb-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">આયાત પરિણામ સારાંશ (Import Summary)</h3>
              <p className="text-slate-500 text-[11px]">
                સફળતાપૂર્વક આયાત: <strong>{result.importedCount}</strong> વિદ્યાર્થીઓ
              </p>
            </div>
          </div>

          {result.errors?.length > 0 && (
            <div className="space-y-2">
              <p className="font-bold text-rose-700 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> ભૂલ ધરાવતી પંક્તિઓ ({result.errors.length}):
              </p>
              <div className="border rounded-lg overflow-hidden divide-y divide-slate-100">
                {result.errors.map((err: any, idx: number) => (
                  <div key={idx} className="p-2.5 bg-rose-50/50 flex justify-between items-center">
                    <span className="font-mono text-slate-700">પંક્તિ નં. {err.rowNumber} {err.grNumber ? `(GR: ${err.grNumber})` : ''}</span>
                    <span className="font-bold text-rose-600">{err.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
