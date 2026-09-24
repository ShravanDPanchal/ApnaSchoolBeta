'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api-client';
import {
  Landmark,
  PlusCircle,
  Download,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  Receipt,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  Building2,
  Calendar,
  Wallet,
  ArrowRight,
  ShieldCheck,
  Ban,
  Trash2,
} from 'lucide-react';
import { formatINR, toGujaratiDigits } from '@apna-school/shared-types';

export default function GrantsPage() {
  const { t, locale, user } = useAuth();

  const [grants, setGrants] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalSanctioned: 0,
    totalReceived: 0,
    totalUtilized: 0,
    totalRemaining: 0,
    count: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter States
  const [search, setSearch] = useState<string>('');
  const [grantType, setGrantType] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  // Modals State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showReceiveModal, setShowReceiveModal] = useState<boolean>(false);
  const [showUtilizeModal, setShowUtilizeModal] = useState<boolean>(false);
  const [showStatementModal, setShowStatementModal] = useState<boolean>(false);
  const [showOverrideModal, setShowOverrideModal] = useState<boolean>(false);

  const [selectedGrant, setSelectedGrant] = useState<any>(null);
  const [statementData, setStatementData] = useState<any>(null);
  const [statementLoading, setStatementLoading] = useState<boolean>(false);

  // Form States
  const [createForm, setCreateForm] = useState({
    nameEn: '',
    nameGu: '',
    grantCode: '',
    source: 'GOVERNMENT_STATE',
    grantType: 'State',
    head: 'Development',
    sanctionedAmount: '',
    sanctionOrderNumber: '',
    sanctionDate: new Date().toISOString().split('T')[0],
  });

  const [receiveForm, setReceiveForm] = useState({
    amount: '',
    receiptDate: new Date().toISOString().split('T')[0],
    referenceNo: '',
    narration: '',
  });

  const [utilizeForm, setUtilizeForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    purpose: '',
    payeeName: '',
    voucherNo: '',
    narration: '',
  });

  const [overrideForm, setOverrideForm] = useState({
    requestedAmount: '',
    reason: '',
  });

  // Load Grants & Summary
  const loadGrants = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (grantType) params.append('grantType', grantType);
      if (status) params.append('status', status);

      const [resList, resSummary] = await Promise.all([
        fetchApi(`/grants?${params.toString()}`),
        fetchApi('/grants/utilization-report'),
      ]);

      if (resList.success && resList.data) {
        setGrants(resList.data.items || []);
      }
      if (resSummary.success && resSummary.data?.summary) {
        setSummary(resSummary.data.summary);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'અનુદાન માહિતી લાવવામાં નિષ્ફળતા (Failed to load grants)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGrants();
  }, [grantType, status]);

  // Handle Create Grant
  const handleCreateGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchApi('/grants', {
        method: 'POST',
        body: JSON.stringify({
          ...createForm,
          sanctionedAmount: Number(createForm.sanctionedAmount),
          financialYearId: user?.currentFinancialYearId,
        }),
      });
      if (res.success) {
        setShowCreateModal(false);
        setCreateForm({
          nameEn: '',
          nameGu: '',
          grantCode: '',
          source: 'GOVERNMENT_STATE',
          grantType: 'State',
          head: 'Development',
          sanctionedAmount: '',
          sanctionOrderNumber: '',
          sanctionDate: new Date().toISOString().split('T')[0],
        });
        loadGrants();
      }
    } catch (err: any) {
      alert(err.message || 'અનુદાન નોંધવામાં નિષ્ફળતા');
    }
  };

  // Handle Receive Grant Funds
  const handleReceiveFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrant) return;
    try {
      const res = await fetchApi(`/grants/${selectedGrant.id}/receive`, {
        method: 'POST',
        body: JSON.stringify({
          amount: Number(receiveForm.amount),
          receiptDate: receiveForm.receiptDate,
          referenceNo: receiveForm.referenceNo,
          narration: receiveForm.narration || `${selectedGrant.nameGu} હપ્તો મળ્યો`,
        }),
      });
      if (res.success) {
        setShowReceiveModal(false);
        setReceiveForm({
          amount: '',
          receiptDate: new Date().toISOString().split('T')[0],
          referenceNo: '',
          narration: '',
        });
        loadGrants();
      }
    } catch (err: any) {
      alert(err.message || 'ગ્રાન્ટ રસીદ નોંધવામાં નિષ્ફળતા');
    }
  };

  // Handle Utilize Grant
  const handleUtilizeGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrant) return;
    try {
      const res = await fetchApi(`/grants/${selectedGrant.id}/utilize`, {
        method: 'POST',
        body: JSON.stringify({
          amount: Number(utilizeForm.amount),
          date: utilizeForm.date,
          purpose: utilizeForm.purpose,
          payeeName: utilizeForm.payeeName,
          voucherNo: utilizeForm.voucherNo,
          narration: utilizeForm.narration,
        }),
      });
      if (res.success) {
        setShowUtilizeModal(false);
        setUtilizeForm({
          amount: '',
          date: new Date().toISOString().split('T')[0],
          purpose: '',
          payeeName: '',
          voucherNo: '',
          narration: '',
        });
        loadGrants();
      }
    } catch (err: any) {
      if (err.message && err.message.includes('UTILIZATION_EXCEEDS_AVAILABLE')) {
        if (confirm('આ વપરાશ ગ્રાન્ટની ઉપલબ્ધ સિલક કરતાં વધુ છે! શું તમે ઓવરરાઇડ (વિશેષ મંજૂરી) માટે અરજી કરવા માંગો છો?')) {
          setOverrideForm({
            requestedAmount: utilizeForm.amount,
            reason: utilizeForm.purpose,
          });
          setShowUtilizeModal(false);
          setShowOverrideModal(true);
        }
      } else {
        alert(err.message || 'ખર્ચ નોંધવામાં ભૂલ');
      }
    }
  };

  // Handle Request Override
  const handleRequestOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrant) return;
    try {
      const res = await fetchApi(`/grants/${selectedGrant.id}/request-override`, {
        method: 'POST',
        body: JSON.stringify({
          requestedAmount: Number(overrideForm.requestedAmount),
          reason: overrideForm.reason,
        }),
      });
      if (res.success) {
        alert('ઓવરરાઇડ અરજી સબમિટ થઈ ગઈ છે. વહીવટી મંજૂરી પછી વપરાશ નોંધવામાં આવશે.');
        setShowOverrideModal(false);
        loadGrants();
      }
    } catch (err: any) {
      alert(err.message || 'ઓવરરાઇડ સબમિટ કરવામાં નિષ્ફળતા');
    }
  };

  // Open Statement Modal
  const openStatement = async (grant: any) => {
    setSelectedGrant(grant);
    setShowStatementModal(true);
    setStatementLoading(true);
    try {
      const res = await fetchApi(`/grants/${grant.id}/statement`);
      if (res.success) {
        setStatementData(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'સ્ટેટમેન્ટ લાવવામાં નિષ્ફળતા');
    } finally {
      setStatementLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-gujarati">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Landmark className="w-7 h-7 text-indigo-600" />
            સરકારી & ખાનગી અનુદાન સંચાલન (Grants Management)
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            સમગ્ર શિક્ષા અભિયાન, GSEB ગ્રાન્ટ, મધ્યાહ્ન ભોજન અને ટ્રસ્ટ અનુદાન હિસાબ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadGrants}
            className="p-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="રિફ્રેશ કરો"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            + નવું અનુદાન (New Grant)
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
          <button onClick={loadGrants} className="ml-auto underline font-bold">
            ફરી પ્રયાસ કરો (Retry)
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">કુલ મંજૂર અનુદાન (Sanctioned)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2">
            {formatINR(summary.totalSanctioned || 0, locale)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            કુલ {locale === 'gu' ? toGujaratiDigits(summary.count || 0) : summary.count || 0} ગ્રાન્ટ એકાઉન્ટ્સ
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">પ્રાપ્ત થયેલ રકમ (Received)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-emerald-600 mt-2">
            {formatINR(summary.totalReceived || 0, locale)}
          </p>
          <span className="text-[11px] text-emerald-700/80 mt-1 block">
            મંજૂર રકમના {summary.totalSanctioned > 0 ? Math.round((summary.totalReceived / summary.totalSanctioned) * 100) : 0}% મળેલ
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ખર્ચ / વપરાયેલ (Utilized)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-rose-600 mt-2">
            {formatINR(summary.totalUtilized || 0, locale)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            સત્તાવાર વાઉચર દ્વારા ચૂકવેલ
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ઉપલબ્ધ સિલક (Available)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-amber-600 mt-2">
            {formatINR(summary.totalRemaining || 0, locale)}
          </p>
          <span className="text-[11px] text-amber-700/80 mt-1 block">
            હાલ વાપરવા માટે ઉપલબ્ધ
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="અનુદાન નામ અથવા કોડ શોધો..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadGrants()}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={grantType}
            onChange={(e) => setGrantType(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">તમામ પ્રકાર (All Types)</option>
            <option value="State">રાજ્ય સરકાર (State)</option>
            <option value="Central">કેન્દ્ર સરકાર (Central)</option>
            <option value="Local">સ્થાનિક સ્વરાજ્ય (Local)</option>
            <option value="NGO">ટ્રસ્ટ / દાતા (NGO/Donation)</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">તમામ સ્થિતિ (All Status)</option>
            <option value="ACTIVE">સક્રિય (Active)</option>
            <option value="FULLY_UTILIZED">સંપૂર્ણ વપરાયેલ (Fully Utilized)</option>
            <option value="EXPIRED">મુદત પૂરી થયેલ (Expired)</option>
          </select>
        </div>
      </div>

      {/* Grants Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4">અનુદાન નામ & કોડ</th>
                <th className="py-3.5 px-4">પ્રકાર / હેડ</th>
                <th className="py-3.5 px-4 text-right">મંજૂર રકમ</th>
                <th className="py-3.5 px-4 text-right">મળેલ રકમ</th>
                <th className="py-3.5 px-4 text-right">વપરાયેલ</th>
                <th className="py-3.5 px-4 text-right">બાકી સિલક</th>
                <th className="py-3.5 px-4 text-center">સ્થિતિ</th>
                <th className="py-3.5 px-4 text-center">ક્રિયાઓ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
                      <span>અનુદાન યાદી લોડ થઈ રહી છે...</span>
                    </div>
                  </td>
                </tr>
              ) : grants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <Landmark className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    કોઈ અનુદાન મળ્યા નથી. '+ નવું અનુદાન' બટન પર ક્લિક કરીને નવું ખાતું ઉમેરો.
                  </td>
                </tr>
              ) : (
                grants.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{locale === 'gu' ? g.nameGu : g.nameEn}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{g.grantCode}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800">{g.grantType}</span>
                      <p className="text-[10px] text-slate-500">{g.head}</p>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium">
                      {formatINR(g.sanctionedAmount, locale)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                      {formatINR(g.receivedAmount, locale)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-rose-600">
                      {formatINR(g.utilizedAmount, locale)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-amber-600">
                      {formatINR(g.remainingAmount, locale)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          g.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {g.status === 'ACTIVE' ? 'સક્રિય' : g.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedGrant(g);
                            setShowReceiveModal(true);
                          }}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded text-[11px] font-bold transition-all"
                          title="હપ્તો મેળવો"
                        >
                          + હપ્તો (Receive)
                        </button>
                        <button
                          onClick={() => {
                            setSelectedGrant(g);
                            setShowUtilizeModal(true);
                          }}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded text-[11px] font-bold transition-all"
                          title="ખર્ચ નોંધણી"
                        >
                          - ખર્ચ (Utilize)
                        </button>
                        <button
                          onClick={() => openStatement(g)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded text-[11px] font-bold transition-all"
                          title="લેજર હિસાબ"
                        >
                          સ્ટેટમેન્ટ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE GRANT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-indigo-900 text-white flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Landmark className="w-5 h-5 text-amber-400" />
                નવું અનુદાન ખાતું ઉમેરો (Create Grant)
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGrant} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">અનુદાન નામ (ગુજરાતી) *</label>
                  <input
                    type="text"
                    required
                    placeholder="દા.ત. સમગ્ર શિક્ષા શાળા ગ્રાન્ટ"
                    value={createForm.nameGu}
                    onChange={(e) => setCreateForm({ ...createForm, nameGu: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Grant Name (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samagra Shiksha Composite Grant"
                    value={createForm.nameEn}
                    onChange={(e) => setCreateForm({ ...createForm, nameEn: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">અનુદાન કોડ (Grant Code) *</label>
                  <input
                    type="text"
                    required
                    placeholder="SS-2026-COMP"
                    value={createForm.grantCode}
                    onChange={(e) => setCreateForm({ ...createForm, grantCode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono uppercase focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">મંજૂર રકમ (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="50000"
                    value={createForm.sanctionedAmount}
                    onChange={(e) => setCreateForm({ ...createForm, sanctionedAmount: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">પ્રકાર (Type)</label>
                  <select
                    value={createForm.grantType}
                    onChange={(e) => setCreateForm({ ...createForm, grantType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="State">રાજ્ય (State)</option>
                    <option value="Central">કેન્દ્ર (Central)</option>
                    <option value="Local">સ્થાનિક (Local)</option>
                    <option value="NGO">ટ્રસ્ટ (NGO)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">હેડ (Head)</label>
                  <input
                    type="text"
                    value={createForm.head}
                    onChange={(e) => setCreateForm({ ...createForm, head: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">મંજૂરી તારીખ</label>
                  <input
                    type="date"
                    value={createForm.sanctionDate}
                    onChange={(e) => setCreateForm({ ...createForm, sanctionDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">મંજૂરી હુકમ નંબર (Order No)</label>
                <input
                  type="text"
                  placeholder="GSEB/SS/2026/ORD-88"
                  value={createForm.sanctionOrderNumber}
                  onChange={(e) => setCreateForm({ ...createForm, sanctionOrderNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-md"
                >
                  અનુદાન સાચવો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIVE FUNDS MODAL */}
      {showReceiveModal && selectedGrant && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-white" />
                અનુદાન રકમ પ્રાપ્તિ (Grant Receipt)
              </h2>
              <button onClick={() => setShowReceiveModal(false)} className="text-slate-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReceiveFunds} className="p-6 space-y-4 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <p className="font-bold text-emerald-900">{locale === 'gu' ? selectedGrant.nameGu : selectedGrant.nameEn}</p>
                <p className="text-[11px] text-emerald-800">
                  મંજૂર: {formatINR(selectedGrant.sanctionedAmount, locale)} | મળેલ: {formatINR(selectedGrant.receivedAmount, locale)}
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">પ્રાપ્ત થયેલ રકમ (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedGrant.sanctionedAmount - selectedGrant.receivedAmount}
                  placeholder="25000"
                  value={receiveForm.amount}
                  onChange={(e) => setReceiveForm({ ...receiveForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-bold text-emerald-700 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">જમા તારીખ *</label>
                  <input
                    type="date"
                    required
                    value={receiveForm.receiptDate}
                    onChange={(e) => setReceiveForm({ ...receiveForm, receiptDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">ચેક / UTR નંબર</label>
                  <input
                    type="text"
                    placeholder="SBI-UTR-99128"
                    value={receiveForm.referenceNo}
                    onChange={(e) => setReceiveForm({ ...receiveForm, referenceNo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">વિગત / લખાણ (Narration)</label>
                <input
                  type="text"
                  placeholder="પ્રથમ હપ્તો મળ્યો"
                  value={receiveForm.narration}
                  onChange={(e) => setReceiveForm({ ...receiveForm, narration: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReceiveModal(false)}
                  className="px-4 py-2 border rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-md"
                >
                  જમા નોંધો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UTILIZE GRANT MODAL */}
      {showUtilizeModal && selectedGrant && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-rose-700 text-white flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Receipt className="w-5 h-5 text-white" />
                અનુદાન વપરાશ / ખર્ચ નોંધણી (Utilize Funds)
              </h2>
              <button onClick={() => setShowUtilizeModal(false)} className="text-slate-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUtilizeGrant} className="p-6 space-y-4 text-xs">
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                <p className="font-bold text-rose-900">{locale === 'gu' ? selectedGrant.nameGu : selectedGrant.nameEn}</p>
                <p className="text-[11px] text-rose-800">
                  હાલ ઉપલબ્ધ બાકી સિલક: <span className="font-bold">{formatINR(selectedGrant.remainingAmount, locale)}</span>
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ખર્ચ રકમ (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="5000"
                  value={utilizeForm.amount}
                  onChange={(e) => setUtilizeForm({ ...utilizeForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-bold text-rose-700 text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">ખર્ચ તારીખ *</label>
                  <input
                    type="date"
                    required
                    value={utilizeForm.date}
                    onChange={(e) => setUtilizeForm({ ...utilizeForm, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">વાઉચર નંબર</label>
                  <input
                    type="text"
                    placeholder="V-2026-088"
                    value={utilizeForm.voucherNo}
                    onChange={(e) => setUtilizeForm({ ...utilizeForm, voucherNo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ચુકવણીદાર / પેઇ નામ (Payee Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="દા.ત. શ્રી ગણેશ સ્ટેશનર્સ"
                  value={utilizeForm.payeeName}
                  onChange={(e) => setUtilizeForm({ ...utilizeForm, payeeName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ખર્ચનો હેતુ (Purpose) *</label>
                <input
                  type="text"
                  required
                  placeholder="શાળા મરામત અને રંગરોગાન"
                  value={utilizeForm.purpose}
                  onChange={(e) => setUtilizeForm({ ...utilizeForm, purpose: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUtilizeModal(false)}
                  className="px-4 py-2 border rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-md"
                >
                  ખર્ચ નોંધો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OVERRIDE REQUEST MODAL */}
      {showOverrideModal && selectedGrant && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-amber-600 text-white flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-white" />
                ગ્રાન્ટ ઓવરરાઇડ અરજી (Override Authorization Request)
              </h2>
              <button onClick={() => setShowOverrideModal(false)} className="text-slate-100 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestOverride} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                અનુદાનની ઉપલબ્ધ સિલક કરતાં વધુ ખર્ચ માટે વિશેષ વહીવટી અધિકૃતતા (Override Approval) જરૂરી છે.
              </p>

              <div>
                <label className="block text-slate-700 font-bold mb-1">જરૂરી રકમ (₹) *</label>
                <input
                  type="number"
                  required
                  value={overrideForm.requestedAmount}
                  onChange={(e) => setOverrideForm({ ...overrideForm, requestedAmount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-bold text-amber-700 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ઓવરરાઇડનું કારણ / સમર્થન *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="કટોકટી સમારકામ અથવા આગળના હપ્તાની અપેક્ષામાં ખર્ચ..."
                  value={overrideForm.reason}
                  onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 border rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-md"
                >
                  ઓવરરાઇડ સબમિટ કરો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STATEMENT / LEDGER MODAL */}
      {showStatementModal && selectedGrant && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  ગ્રાન્ટ ખાતાવહી સ્ટેટમેન્ટ (Grant Ledger Statement)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedGrant.nameGu} ({selectedGrant.grantCode})
                </p>
              </div>
              <button onClick={() => setShowStatementModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 text-xs">
              {statementLoading ? (
                <div className="text-center py-12 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                  સ્ટેટમેન્ટ લોડ થઈ રહ્યું છે...
                </div>
              ) : statementData?.transactions?.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  આ ગ્રાન્ટમાં હજુ સુધી કોઈ વ્યવહાર નોંધાયેલ નથી.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">તારીખ</th>
                        <th className="py-2.5 px-3">પ્રકાર</th>
                        <th className="py-2.5 px-3">વિગત / પેઇ</th>
                        <th className="py-2.5 px-3 text-right">જમા (₹)</th>
                        <th className="py-2.5 px-3 text-right">ઉધાર (₹)</th>
                        <th className="py-2.5 px-3 text-right">સિલક (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {statementData?.transactions?.map((t: any) => (
                        <tr key={t.id} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-mono text-[11px]">{new Date(t.date).toLocaleDateString()}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                t.transactionType === 'RECEIPT'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {t.transactionType === 'RECEIPT' ? 'જમા' : 'ઉધાર'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="font-semibold text-slate-800">{t.narration || t.purpose || '-'}</p>
                            {t.payeeName && <p className="text-[10px] text-slate-400">પેઇ: {t.payeeName}</p>}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-emerald-700">
                            {t.transactionType === 'RECEIPT' ? formatINR(t.amount, locale) : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-rose-700">
                            {t.transactionType === 'UTILIZATION' ? formatINR(t.amount, locale) : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            {formatINR(t.runningBalance, locale)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setShowStatementModal(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold text-xs"
              >
                બંધ કરો
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
