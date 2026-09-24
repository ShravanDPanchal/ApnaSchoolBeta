'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api-client';
import {
  BookOpenCheck,
  Calendar,
  PlusCircle,
  Printer,
  FileSpreadsheet,
  Layers,
  CalendarDays,
  PieChart,
} from 'lucide-react';
import {
  RojmelEntryType,
  PaymentMode,
  RojmelDayViewDto,
  RojmelMonthlyViewDto,
  RojmelYearlyViewDto,
  RojmelHeadSummaryDto,
} from '@apna-school/shared-types';
import {
  RojmelDailyTab,
  RojmelMonthlyTab,
  RojmelYearlyTab,
  RojmelHeadwiseTab,
  RojmelEntryModal,
} from '@/components/rojmel';

export default function RojmelPage() {
  const { t, locale, user } = useAuth();

  // Active Tab: 'daily' | 'monthly' | 'yearly' | 'headwise'
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'yearly' | 'headwise'>('daily');

  // Daily View Filters
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [dailyData, setDailyData] = useState<RojmelDayViewDto | null>(null);

  // Monthly View Filters
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [monthlyData, setMonthlyData] = useState<RojmelMonthlyViewDto | null>(null);

  // Yearly View State
  const [yearlyData, setYearlyData] = useState<RojmelYearlyViewDto | null>(null);

  // Head-Wise Summary State
  const [headSummaries, setHeadSummaries] = useState<RojmelHeadSummaryDto[]>([]);
  const [headFromDate, setHeadFromDate] = useState<string>('2026-04-01');
  const [headToDate, setHeadToDate] = useState<string>('2027-03-31');

  const [loading, setLoading] = useState<boolean>(true);
  const [showEntryModal, setShowEntryModal] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<any[]>([]);

  // New Entry Form State
  const [entryForm, setEntryForm] = useState({
    entryType: RojmelEntryType.JAMA as RojmelEntryType | 'CONTRA',
    accountId: '',
    paymentAccountId: '',
    amount: '',
    paymentMode: PaymentMode.CASH,
    narration: '',
    voucherNumber: '',
  });

  // Quick inline entry state
  const [quickAmount, setQuickAmount] = useState('');
  const [quickNarration, setQuickNarration] = useState('');
  const [quickAccountId, setQuickAccountId] = useState('');
  const [quickType, setQuickType] = useState<RojmelEntryType>(RojmelEntryType.JAMA);
  const [quickSubmitting, setQuickSubmitting] = useState(false);

  // Load Accounts for dropdowns
  async function loadAccounts() {
    try {
      const res = await fetchApi('/accounting/accounts');
      if (res.success && res.data) {
        setAccounts(res.data);
        const cashAcc = res.data.find((a: any) => a.isCashAccount);
        const feeAcc = res.data.find((a: any) => a.accountType === 'INCOME');
        if (cashAcc) {
          setEntryForm((prev) => ({
            ...prev,
            paymentAccountId: prev.paymentAccountId || cashAcc.id,
            accountId: prev.accountId || (feeAcc?.id || res.data[0]?.id || ''),
          }));
          if (!quickAccountId && feeAcc) {
            setQuickAccountId(feeAcc.id);
          }
        }
      }
    } catch (e: any) {
      // Handled gracefully
    }
  }

  // Load Daily Rojmel
  async function loadDailyRojmel() {
    setLoading(true);
    try {
      const res = await fetchApi(`/rojmel/day-view?date=${date}`);
      if (res.success) {
        setDailyData(res.data);
      }
    } catch (e: any) {
      // Handled gracefully
    } finally {
      setLoading(false);
    }
  }

  // Load Monthly Rojmel
  async function loadMonthlyRojmel() {
    setLoading(true);
    try {
      const res = await fetchApi(`/rojmel/monthly-view?year=${selectedYear}&month=${selectedMonth}`);
      if (res.success) {
        setMonthlyData(res.data);
      }
    } catch (e: any) {
      // Handled gracefully
    } finally {
      setLoading(false);
    }
  }

  // Load Yearly Rojmel
  async function loadYearlyRojmel() {
    setLoading(true);
    try {
      const res = await fetchApi('/rojmel/yearly-view');
      if (res.success) {
        setYearlyData(res.data);
      }
    } catch (e: any) {
      // Handled gracefully
    } finally {
      setLoading(false);
    }
  }

  // Load Head-Wise Summary
  async function loadHeadSummaries() {
    setLoading(true);
    try {
      const res = await fetchApi(`/rojmel/head-wise-summary?from=${headFromDate}&to=${headToDate}`);
      if (res.success) {
        setHeadSummaries(res.data);
      }
    } catch (e: any) {
      // Handled gracefully
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (activeTab === 'daily') {
      loadDailyRojmel();
    } else if (activeTab === 'monthly') {
      loadMonthlyRojmel();
    } else if (activeTab === 'yearly') {
      loadYearlyRojmel();
    } else if (activeTab === 'headwise') {
      loadHeadSummaries();
    }
  }, [activeTab, date, selectedYear, selectedMonth, headFromDate, headToDate]);

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryForm.amount || parseFloat(entryForm.amount) <= 0) {
      alert('કૃપા કરીને માન્ય રકમ દાખલ કરો.');
      return;
    }
    try {
      await fetchApi('/rojmel/entry', {
        method: 'POST',
        body: JSON.stringify({
          ...entryForm,
          date,
          amount: parseFloat(entryForm.amount),
        }),
      });
      setShowEntryModal(false);
      setEntryForm((prev) => ({ ...prev, amount: '', narration: '', voucherNumber: '' }));
      loadDailyRojmel();
    } catch (err: any) {
      alert(err.message || 'રોજમેળ એન્ટ્રી કરવામાં ક્ષતિ આવી.');
    }
  };

  const handleQuickEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAmount || parseFloat(quickAmount) <= 0 || !quickNarration) {
      alert('કૃપા કરીને રકમ અને વિગત ભરો.');
      return;
    }
    const cashAcc = accounts.find((a) => a.isCashAccount);
    if (!cashAcc) {
      alert('રોકડ ખાતું ગોઠવેલ નથી.');
      return;
    }

    setQuickSubmitting(true);
    try {
      await fetchApi('/rojmel/entry', {
        method: 'POST',
        body: JSON.stringify({
          date,
          entryType: quickType,
          accountId: quickAccountId || accounts.find((a) => !a.isCashAccount && !a.isBankAccount)?.id,
          paymentAccountId: cashAcc.id,
          amount: parseFloat(quickAmount),
          narration: quickNarration,
        }),
      });
      setQuickAmount('');
      setQuickNarration('');
      loadDailyRojmel();
    } catch (err: any) {
      alert(err.message || 'ઝડપી એન્ટ્રી નિષ્ફળ.');
    } finally {
      setQuickSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const exportToCSV = () => {
    if (!dailyData) return;
    let csv = '\uFEFF'; // UTF-8 BOM for Gujarati characters in Excel
    csv += `શ્રી રોજમેળ (દેશી નામા પદ્ધતિ) - ${user?.schoolNameGu || 'શાળા'}\n`;
    csv += `તારીખ: ${date}, નાણાકીય વર્ષ: ${dailyData.financialYearName}\n\n`;

    csv += '--- જમા બાજુ (આવક વિગત) ---\n';
    csv += 'ખા.પા.,ખાતાનું નામ,વિગત,રોકડ રકમ (₹),બેંક રકમ (₹),કુલ રકમ (₹)\n';
    csv += `-,શ્રી રોકડ સિલક (શરૂઆતની બાકી),ગત દિવસની રોકડ સિલક,${dailyData.openingCashBalance},0,${dailyData.openingCashBalance}\n`;
    csv += `-,શ્રી બેંક સિલક (શરૂઆતની બાકી),ગત દિવસની બેંક સિલક,0,${dailyData.openingBankBalance},${dailyData.openingBankBalance}\n`;

    dailyData.jamaEntries.forEach((item) => {
      csv += `"${item.khataPanoNo}","${item.accountNameGu}","${item.narration}",${item.cashAmount},${item.bankAmount},${item.totalAmount}\n`;
    });
    csv += `,"કુલ જમા આવક સરવાળો","",${dailyData.totalCashReceipts},${dailyData.totalBankReceipts},${dailyData.totalReceipts}\n`;
    csv += `,"કુલ જમા બાજુ આખરો સરવાળો","",,,${dailyData.totalJamaAmount}\n\n`;

    csv += '--- ઉધાર બાજુ (જાવક/ખર્ચ વિગત) ---\n';
    csv += 'ખા.પા.,ખાતાનું નામ,વિગત,રોકડ રકમ (₹),બેંક રકમ (₹),કુલ રકમ (₹)\n';
    dailyData.udharEntries.forEach((item) => {
      csv += `"${item.khataPanoNo}","${item.accountNameGu}","${item.narration} (વાઉચર: ${item.voucherNumber || '-'})",${item.cashAmount},${item.bankAmount},${item.totalAmount}\n`;
    });
    csv += `,"કુલ ઉધાર ખર્ચ સરવાળો","",${dailyData.totalCashPayments},${dailyData.totalBankPayments},${dailyData.totalPayments}\n`;
    csv += `-,શ્રી રોકડ સિલક (આખર બાકી),આજના દિવસની રોકડ સિલક,${dailyData.closingCashBalance},0,${dailyData.closingCashBalance}\n`;
    csv += `-,શ્રી બેંક સિલક (આખર બાકી),આજના દિવસની બેંક સિલક,0,${dailyData.closingBankBalance},${dailyData.closingBankBalance}\n`;
    csv += `,"કુલ ઉધાર બાજુ આખરો સરવાળો","",,,${dailyData.totalUdharAmount}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rojmel_${date}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 font-gujarati pb-12">
      {/* 1. Header & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
              <BookOpenCheck className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {t.rojmel.title}
              </h1>
              <p className="text-xs text-slate-500">
                {t.rojmel.subtitle} • {user?.schoolNameGu || 'શ્રી સરસ્વતી વિદ્યા મંદિર'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3.5 py-2 rounded-xl border border-emerald-300 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>એક્સેલ / CSV ડાઉનલોડ</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-300 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>{t.rojmel.printPdf}</span>
          </button>

          <button
            onClick={() => setShowEntryModal(true)}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.rojmel.newEntry}</span>
          </button>
        </div>
      </div>

      {/* 2. Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto print:hidden">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'daily'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>દૈનિક રોજમેળ આખરો (Daily Aakharo)</span>
        </button>

        <button
          onClick={() => setActiveTab('monthly')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'monthly'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>માસિક પત્રક મેળ (Monthly Matrix)</span>
        </button>

        <button
          onClick={() => setActiveTab('yearly')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'yearly'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>વાર્ષિક મેળ (Yearly 12-Month)</span>
        </button>

        <button
          onClick={() => setActiveTab('headwise')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'headwise'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>હેડવાર આવક-ખર્ચ સારાંશ (Head-Wise)</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'daily' && (
        <RojmelDailyTab
          date={date}
          setDate={setDate}
          dailyData={dailyData}
          accounts={accounts}
          locale={locale}
          user={user}
          onRefresh={loadDailyRojmel}
          quickType={quickType}
          setQuickType={setQuickType}
          quickAccountId={quickAccountId}
          setQuickAccountId={setQuickAccountId}
          quickAmount={quickAmount}
          setQuickAmount={setQuickAmount}
          quickNarration={quickNarration}
          setQuickNarration={setQuickNarration}
          quickSubmitting={quickSubmitting}
          onQuickSubmit={handleQuickEntry}
        />
      )}

      {activeTab === 'monthly' && (
        <RojmelMonthlyTab
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          monthlyData={monthlyData}
        />
      )}

      {activeTab === 'yearly' && (
        <RojmelYearlyTab yearlyData={yearlyData} locale={locale} />
      )}

      {activeTab === 'headwise' && (
        <RojmelHeadwiseTab
          headFromDate={headFromDate}
          setHeadFromDate={setHeadFromDate}
          headToDate={headToDate}
          setHeadToDate={setHeadToDate}
          headSummaries={headSummaries}
          onRefresh={loadHeadSummaries}
        />
      )}

      {/* Modal */}
      {showEntryModal && (
        <RojmelEntryModal
          accounts={accounts}
          entryForm={entryForm}
          setEntryForm={setEntryForm}
          onClose={() => setShowEntryModal(false)}
          onSubmit={handleCreateEntry}
        />
      )}
    </div>
  );
}
