'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { fetchApi, API_BASE } from '@/lib/api-client';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Search,
  Filter,
  RefreshCw,
  Building,
  CheckCircle2,
  AlertCircle,
  Database,
  Calendar,
  Layers,
  GraduationCap,
  CreditCard,
  BookOpen,
  UploadCloud,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

type MainTab = 'SCHOOL' | 'FEES' | 'ACCOUNTING' | 'GOVT' | 'IMPORT';

export default function ReportsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<MainTab>('SCHOOL');
  const [subReport, setSubReport] = useState<string>('students');
  const [loading, setLoading] = useState<boolean>(false);
  const [reportData, setReportData] = useState<any>(null);

  // Filters State
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [classId, setClassId] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  // Classes dropdown options
  const [classList, setClassList] = useState<any[]>([]);

  // Excel Import Hub State
  const [importEntity, setImportEntity] = useState<string>('STUDENTS');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any>(null);
  const [importLoading, setImportLoading] = useState<boolean>(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Load Classes on mount
  useEffect(() => {
    async function loadMetadata() {
      try {
        const res = await fetchApi('/school/classes');
        if (res.data) setClassList(res.data);
      } catch (e: any) {
        // Fallback or graceful handling
      }
    }
    loadMetadata();
  }, []);

  // Set default sub-report on tab change
  useEffect(() => {
    if (activeTab === 'SCHOOL') setSubReport('students');
    else if (activeTab === 'FEES') setSubReport('collection');
    else if (activeTab === 'ACCOUNTING') setSubReport('rojmel');
    else if (activeTab === 'GOVT') setSubReport('CTS');
  }, [activeTab]);

  // Fetch report data whenever sub-report or filters change
  const loadReportData = async () => {
    if (activeTab === 'GOVT' || activeTab === 'IMPORT') return;
    setLoading(true);
    try {
      let endpoint = '';
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (classId) params.append('classId', classId);
      if (search) params.append('search', search);
      if (status) params.append('status', status);

      if (activeTab === 'SCHOOL') {
        endpoint = `/reports/school/${subReport}?${params.toString()}`;
      } else if (activeTab === 'FEES') {
        endpoint = `/reports/fees/${subReport}?${params.toString()}`;
      } else if (activeTab === 'ACCOUNTING') {
        endpoint = `/reports/accounting/${subReport}?${params.toString()}`;
      }

      const res = await fetchApi(endpoint);
      if (res.data) {
        setReportData(res.data);
      }
    } catch (e: any) {
      // Graceful error state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [activeTab, subReport]);

  // Handle Excel and Print downloads with token
  const handleExport = (format: 'excel' | 'print') => {
    let category = 'school';
    if (activeTab === 'FEES') category = 'fees';
    if (activeTab === 'ACCOUNTING') category = 'accounting';

    const params = new URLSearchParams();
    params.append('format', format);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (classId) params.append('classId', classId);
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (format === 'print') params.append('autoprint', 'true');

    const token = typeof window !== 'undefined' ? localStorage.getItem('apna_token') : '';
    const url = `${API_BASE}/reports/${category}/${subReport}?${params.toString()}&token=${token}`;
    window.open(url, '_blank');
  };

  // Download Starter Template
  const handleDownloadTemplate = () => {
    const url = `${API_BASE}/reports/import/template/${importEntity}`;
    window.open(url, '_blank');
  };

  // Handle Import File Selection & Preview
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setImportPreview(null);
    setImportSuccessMsg(null);
    setImportLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('apna_token');
      const res = await fetch(`${API_BASE}/reports/import/preview/${importEntity}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setImportPreview(data.data);
      } else {
        alert(data.error?.message || 'Failed to parse file');
      }
    } catch (err: any) {
      alert('Error parsing Excel: ' + err.message);
    } finally {
      setImportLoading(false);
    }
  };

  // Download Annotated Error Report
  const handleDownloadErrorReport = async () => {
    if (!selectedFile || !importPreview?.errors?.length) return;
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('errors', JSON.stringify(importPreview.errors));

    const token = localStorage.getItem('apna_token');
    const res = await fetch(`${API_BASE}/reports/import/error-report`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${importEntity.toLowerCase()}_validation_errors.xlsx`;
    a.click();
  };

  // Commit Import to Database
  const handleCommitImport = async () => {
    if (!selectedFile) return;
    setImportLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('apna_token');
      const res = await fetch(`${API_BASE}/reports/import/commit/${importEntity}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setImportSuccessMsg(`સફળતાપૂર્વક ${data.data.importedCount} રેકોર્ડ્સ ડેટાબેઝમાં ઈમ્પોર્ટ થયા!`);
        setSelectedFile(null);
        setImportPreview(null);
      } else {
        alert(data.error?.message || 'Import failed');
      }
    } catch (err: any) {
      alert('Import execution error: ' + err.message);
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-gujarati pb-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <a href="/dashboard" className="text-blue-600 hover:underline flex items-center gap-1">
          <i className="bi bi-house-door"></i> Dashboard
        </a>
        <span>/</span>
        <span>રિપોર્ટિંગ તથા ડેટા સેન્ટર (Reports)</span>
      </div>
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-indigo-600" />
            રિપોર્ટિંગ તથા ડેટા સેન્ટર (Reporting Center)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            શાળા પત્રકો, ફી ખાતાવહી, દેશી નામા રોજમેળ, ઓડિટ રજીસ્ટર તથા ટ્રાન્ઝેક્શન-સેફ એક્સેલ ઈમ્પોર્ટ • {user?.schoolNameGu}
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/reports/letterpad"
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Building className="w-4 h-4" />
            શાળા લેટરપેડ
          </Link>
          <Link
            href="/reports/frame-generator"
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            આજનું ગુલાબ / દિપક ફ્રેમ
          </Link>
          {activeTab !== 'GOVT' && activeTab !== 'IMPORT' && (
            <>
              <button
                onClick={() => handleExport('excel')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                એક્સેલ ડાઉનલોડ (.xlsx)
              </button>
              <button
                onClick={() => handleExport('print')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                પ્રિન્ટ / PDF વ્યૂ
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white px-3 pt-2 rounded-xl shadow-sm gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('SCHOOL')}
          className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'SCHOOL'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          શાળા પત્રકો (School)
        </button>
        <button
          onClick={() => setActiveTab('FEES')}
          className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'FEES'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          ફી અહેવાલ (Fees)
        </button>
        <button
          onClick={() => setActiveTab('ACCOUNTING')}
          className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'ACCOUNTING'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          નામાકીય મેળ / રોજમેળ (Accounting)
        </button>
        <button
          onClick={() => setActiveTab('GOVT')}
          className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'GOVT'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4" />
          સરકારી પત્રકો (Govt Portals)
        </button>
        <button
          onClick={() => setActiveTab('IMPORT')}
          className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'IMPORT'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <UploadCloud className="w-4 h-4 text-emerald-600" />
          એક્સેલ ડેટા ઈમ્પોર્ટ હબ (Import Hub)
        </button>
      </div>

      {/* Sub-Reports Selector */}
      {activeTab !== 'GOVT' && activeTab !== 'IMPORT' && (
        <div className="flex flex-wrap gap-2">
          {activeTab === 'SCHOOL' && (
            <>
              {[
                { id: 'students', label: 'વિદ્યાર્થી eGR રજીસ્ટર' },
                { id: 'attendance', label: 'હાજરી પત્રક (Muster)' },
                { id: 'staff', label: 'સ્ટાફ ડિરેક્ટરી' },
                { id: 'timetable', label: 'સમયપત્રક માસ્ટર' },
                { id: 'examination', label: 'પરીક્ષા ગુણ રજીસ્ટર' },
                { id: 'report-cards', label: 'પ્રગતિ પત્રક (Report Card)' },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSubReport(sub.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    subReport === sub.id
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </>
          )}

          {activeTab === 'FEES' && (
            <>
              {[
                { id: 'collection', label: 'ફી વસૂલાત રજીસ્ટર' },
                { id: 'outstanding', label: 'બાકી ફી પત્રક (Dues)' },
                { id: 'daily', label: 'દૈનિક વસૂલાત (રોજમેળ સુસંગત)' },
                { id: 'monthly', label: 'માસિક વસૂલાત ટ્રેન્ડ' },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSubReport(sub.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    subReport === sub.id
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </>
          )}

          {activeTab === 'ACCOUNTING' && (
            <>
              {[
                { id: 'rojmel', label: 'શ્રી રોજમેળ (દેશી નામા આખરો)' },
                { id: 'cash-book', label: 'રોકડ મેળ (Cash Book)' },
                { id: 'bank-book', label: 'બેંક મેળ (Bank Book)' },
                { id: 'ledger', label: 'ખાતાવહી (General Ledger)' },
                { id: 'trial-balance', label: 'કાચું સરવૈયું (Trial Balance)' },
                { id: 'income-expense', label: 'આવક-ખર્ચ પત્રક (Surplus/Deficit)' },
                { id: 'voucher-register', label: 'વાઉચર રજીસ્ટર' },
                { id: 'grant-report', label: 'સરકારી અનુદાન પત્રક (Grants)' },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSubReport(sub.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    subReport === sub.id
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {/* Filter Toolbar */}
      {activeTab !== 'GOVT' && activeTab !== 'IMPORT' && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
            <Filter className="w-4 h-4 text-indigo-600" />
            ફિલ્ટર્સ:
          </div>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="શરૂઆત તારીખ"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="અંતિમ તારીખ"
          />

          {classList.length > 0 && (
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">બધા ધોરણ (All Classes)</option>
              {classList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameGu || c.nameEn}
                </option>
              ))}
            </select>
          )}

          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="જી.આર., નામ અથવા વાઉચર નંબર શોધો..."
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={loadReportData}
            disabled={loading}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg flex items-center gap-1 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            ફિલ્ટર કરો
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. DATA TABLE & SUMMARY (SCHOOL, FEES, ACCOUNTING) */}
      {/* ------------------------------------------------------------- */}
      {activeTab !== 'GOVT' && activeTab !== 'IMPORT' && (
        <div className="space-y-4">
          {/* Summary KPI Cards */}
          {reportData?.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Object.entries(reportData.summary).map(([key, val]: [string, any]) => {
                if (typeof val === 'object') return null;
                const isAmount = key.toLowerCase().includes('amount') || key.toLowerCase().includes('collected') || key.toLowerCase().includes('total');
                return (
                  <div key={key} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="text-lg font-extrabold text-slate-900 mt-1 block">
                      {typeof val === 'number' && isAmount ? `₹${val.toLocaleString('en-IN')}` : String(val)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Report Data Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                {reportData?.title || 'વિગતવાર પત્રક'}
              </h3>
              <span className="text-xs text-slate-400">
                કુલ રેકોર્ડ્સ: {reportData?.rows?.length || 0}
              </span>
            </div>

            <div className="overflow-x-auto max-h-[550px]">
              {loading ? (
                <div className="p-12 text-center text-slate-400 text-xs font-bold flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  અહેવાલ તૈયાર થઈ રહ્યો છે...
                </div>
              ) : reportData?.rows && reportData.rows.length > 0 ? (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-900 text-white sticky top-0 z-10">
                    <tr>
                      <th className="p-3 font-semibold text-center w-12">#</th>
                      {Object.keys(reportData.rows[0])
                        .filter((k) => k !== 'id')
                        .map((header) => (
                          <th key={header} className="p-3 font-semibold whitespace-nowrap">
                            {header
                              .replace(/([A-Z])/g, ' $1')
                              .replace(/^./, (str) => str.toUpperCase())}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.rows.map((row: any, idx: number) => (
                      <tr key={row.id || idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                        {Object.keys(row)
                          .filter((k) => k !== 'id')
                          .map((key) => {
                            const val = row[key];
                            const isNumber = typeof val === 'number';
                            return (
                              <td
                                key={key}
                                className={`p-3 whitespace-nowrap ${
                                  isNumber ? 'text-right font-mono font-medium' : 'text-slate-700'
                                }`}
                              >
                                {val !== null && val !== undefined ? (
                                  key.toLowerCase().includes('status') ? (
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        val === 'ACTIVE' || val === 'PRESENT' || val === 'PASS' || val === 'PAID'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : val === 'ABSENT' || val === 'FAIL' || val === 'PENDING'
                                          ? 'bg-rose-100 text-rose-800'
                                          : 'bg-slate-100 text-slate-800'
                                      }`}
                                    >
                                      {val}
                                    </span>
                                  ) : (
                                    String(val)
                                  )
                                ) : (
                                  '-'
                                )}
                              </td>
                            );
                          })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center text-slate-400 text-xs font-bold">
                  કોઈ રેકોર્ડ મળ્યો નથી. ફિલ્ટર્સ બદલીને ફરી તપાસો.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. GOVERNMENT PORTALS (CTS, VSK, UDISE+, SAS) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'GOVT' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              id: 'CTS',
              title: 'CTS (ચાઈલ્ડ ટ્રેકિંગ સિસ્ટમ ૧૮-અંક પોર્ટલ)',
              desc: 'ગુજરાત શિક્ષણ વિભાગ માટે વિદ્યાર્થી વાઈઝ ૧૮-અંક યુનિક આઈડી, આધાર અને અપાર આઈડી ડેટા એક્સપોર્ટ.',
              badge: 'ગુજરાત સરકાર પોર્ટલ',
              color: 'bg-blue-600',
            },
            {
              id: 'VSK',
              title: 'VSK (વિદ્યા સમીક્ષા કેન્દ્ર ગાંધીનગર)',
              desc: 'ગાંધીનગર કમાન્ડ એન્ડ કંટ્રોલ સેન્ટર માટે દૈનિક વિદ્યાર્થી હાજરી તથા પ્રગતિ ડેટા ફોર્મેટ.',
              badge: 'ગાંધીનગર કમાન્ડ સેન્ટર',
              color: 'bg-emerald-600',
            },
            {
              id: 'UDISE',
              title: 'UDISE+ રાષ્ટ્રીય શિક્ષણ ડેટાબેઝ',
              desc: 'કેન્દ્ર સરકાર માન્ય રાષ્ટ્રીય શાળા આંકડાકીય સર્વેક્ષણ માટે વિદ્યાર્થી અને સ્ટાફ પ્રોફાઈલ.',
              badge: 'રાષ્ટ્રીય શિક્ષણ ડેટાબેઝ',
              color: 'bg-indigo-600',
            },
            {
              id: 'SAS',
              title: 'SAS ગુજરાત (માસિક વહીવટી પત્રક)',
              desc: 'શિક્ષણ નિરીક્ષક તથા ડી.પી.ઈ.ઓ. કચેરી માટે શાળાનું માસિક વહીવટી પ્રગતિ પત્રક.',
              badge: 'માસિક વહીવટી પત્રક',
              color: 'bg-amber-600',
            },
          ].map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${card.color}`}>
                    <Database className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border">
                    {card.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-4">{card.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{card.desc}</p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => window.open(`${API_BASE}/reports/gov-export/${card.id}?format=csv`, '_blank')}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  સરકારી ફોર્મેટ CSV ડાઉનલોડ કરો
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. EXCEL IMPORT HUB WIZARD */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'IMPORT' && (
        <div className="space-y-6">
          {/* Entity Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              પગલું ૧: ડેટા કેટેગરી પસંદ કરો (Select Entity Type)
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'STUDENTS', label: 'વિદ્યાર્થી પ્રવેશ (Students)', desc: 'જી.આર., જન્મ તારીખ, આધાર, ક્લાસ' },
                { id: 'ATTENDANCE', label: 'દૈનિક હાજરી (Attendance)', desc: 'રોલ કોલ અને હાજરી સ્ટેટસ' },
                { id: 'CHART_OF_ACCOUNTS', label: 'નામાકીય ખાતાઓ (Accounts)', desc: 'ખાતાવહી અને ઓપનિંગ બેલેન્સ' },
                { id: 'EXAM_MARKS', label: 'પરીક્ષા ગુણ (Exam Marks)', desc: 'થીયરી, પ્રેક્ટિકલ અને ગ્રેસ માર્ક્સ' },
              ].map((ent) => (
                <button
                  key={ent.id}
                  onClick={() => {
                    setImportEntity(ent.id);
                    setSelectedFile(null);
                    setImportPreview(null);
                  }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    importEntity === ent.id
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="block text-xs font-bold text-slate-900">{ent.label}</span>
                  <span className="block text-[11px] text-slate-500 mt-1">{ent.desc}</span>
                </button>
              ))}
            </div>

            {/* Template Download Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                ખાલી ફોર્મેટમાં ભૂલ વગર ડેટા ભરવા માટે સૌ પ્રથમ ટેમ્પલેટ ડાઉનલોડ કરો:
              </span>
              <button
                onClick={handleDownloadTemplate}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                નમૂનારૂપ ટેમ્પલેટ ડાઉનલોડ (.xlsx)
              </button>
            </div>
          </div>

          {/* File Upload Zone */}
          <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-300 text-center space-y-4 hover:border-indigo-500 transition-colors">
            <UploadCloud className="w-12 h-12 text-indigo-600 mx-auto" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                ભરેલી એક્સેલ ફાઇલ અહીં અપલોડ કરો (Upload Excel File)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                સપોર્ટેડ ફોર્મેટ: .xlsx, મહત્તમ સાઇઝ: 10MB
              </p>
            </div>

            <label className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all">
              ફાઇલ પસંદ કરો
              <input
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {selectedFile && (
              <div className="text-xs font-bold text-slate-700 bg-slate-100 inline-block px-3 py-1 rounded-full">
                પસંદ કરેલ ફાઇલ: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          {/* Success Message */}
          {importSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 text-xs font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              {importSuccessMsg}
            </div>
          )}

          {/* Preview & Validation Results */}
          {importPreview && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  પગલું ૨: ઓટોમેટેડ વેલિડેશન અને પ્રિવ્યૂ (Validation & Preview)
                </h3>
                <div className="flex gap-2">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                    કુલ હરોળ: {importPreview.totalRows}
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
                    માન્ય રેકોર્ડ: {importPreview.validCount}
                  </span>
                  {importPreview.invalidCount > 0 && (
                    <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-lg text-xs font-bold">
                      ભૂલ ભરેલ: {importPreview.invalidCount}
                    </span>
                  )}
                </div>
              </div>

              {/* Error Warnings & Download Error Report */}
              {importPreview.errors.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      આ ફાઇલમાં {importPreview.errors.length} ભૂલો મળી આવી છે:
                    </span>
                    <button
                      onClick={handleDownloadErrorReport}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-sm"
                    >
                      <Download className="w-3 h-3" />
                      ભૂલો સહિત એક્સેલ રિપોર્ટ ડાઉનલોડ કરો (.xlsx)
                    </button>
                  </div>
                  <div className="max-h-32 overflow-y-auto text-[11px] text-rose-700 space-y-1">
                    {importPreview.errors.slice(0, 5).map((err: any, idx: number) => (
                      <div key={idx}>
                        • હરોળ {err.rowNumber}: {err.error}
                      </div>
                    ))}
                    {importPreview.errors.length > 5 && (
                      <div className="italic text-rose-500">
                        ...અને અન્ય {importPreview.errors.length - 5} ભૂલો.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Preview Table */}
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  પ્રિવ્યૂ (પ્રથમ ૧૦ માન્ય રેકોર્ડ્સ):
                </span>
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 border-b">
                      <tr>
                        {importPreview.previewRows[0] &&
                          Object.keys(importPreview.previewRows[0]).map((h) => (
                            <th key={h} className="p-2.5 font-bold">
                              {h}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {importPreview.previewRows.map((r: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          {Object.values(r).map((val: any, cidx: number) => (
                            <td key={cidx} className="p-2.5 text-slate-700">
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Commit Action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  ડેટાબેઝમાં તમામ માન્ય રેકોર્ડ્સ ટ્રાન્ઝેક્શન-સેફ પદ્ધતિથી દાખલ કરવા માટે કન્ફર્મ કરો:
                </span>
                <button
                  onClick={handleCommitImport}
                  disabled={importLoading || importPreview.validCount === 0}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {importLoading ? 'ઈમ્પોર્ટ થઈ રહ્યું છે...' : `ઈમ્પોર્ટ પૂર્ણ કરો (${importPreview.validCount} રેકોર્ડ્સ)`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
