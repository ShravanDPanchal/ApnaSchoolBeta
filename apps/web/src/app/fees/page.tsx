'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api-client';
import {
  ReceiptIndianRupee,
  PlusCircle,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  Receipt,
} from 'lucide-react';
import {
  CollectFeeModal,
  FeeReceiptModal,
  RefundFeeModal,
  FeePaymentsTab,
  FeeOutstandingTab,
  FeeStructuresTab,
  FeeReportsTab,
} from '@/components/fees';

export default function FeesPage() {
  const { t, locale, user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [outstanding, setOutstanding] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'PAYMENTS' | 'OUTSTANDING' | 'REPORTS' | 'STRUCTURES'>('PAYMENTS');
  const [loading, setLoading] = useState(true);

  // Fee Collection Modal State
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [defaultDepositAccountId, setDefaultDepositAccountId] = useState('');

  // 3-Ply Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  // Refund Modal State
  const [refundPaymentId, setRefundPaymentId] = useState<string | null>(null);

  // Reports State
  const [reportDate, setReportDate] = useState('2026-09-10');
  const [dailyReport, setDailyReport] = useState<any>(null);
  const [reportMonth, setReportMonth] = useState(9);
  const [reportYear, setReportYear] = useState(2026);
  const [monthlyReport, setMonthlyReport] = useState<any>(null);

  async function loadData() {
    setLoading(true);
    try {
      const [resPayments, resOutstanding, resStudents, resAccounts, resStructures] = await Promise.all([
        fetchApi('/fees/payments'),
        fetchApi('/fees/outstanding'),
        fetchApi('/students?limit=100'),
        fetchApi('/accounting/accounts'),
        fetchApi('/fees/structures'),
      ]);

      if (resPayments.success) setPayments(resPayments.data);
      if (resOutstanding.success) setOutstanding(resOutstanding.data);
      if (resStudents.success) setStudents(resStudents.data);
      if (resStructures.success) setStructures(resStructures.data);
      if (resAccounts.success) {
        setAccounts(resAccounts.data);
        const cashAcc = resAccounts.data.find((a: any) => a.isCashAccount);
        if (cashAcc && !defaultDepositAccountId) {
          setDefaultDepositAccountId(cashAcc.id);
        }
      }
    } catch (e: any) {
      // Handled gracefully
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Load Daily and Monthly reports when on REPORTS tab
  useEffect(() => {
    if (activeTab !== 'REPORTS') return;

    async function loadReports() {
      try {
        const [dailyRes, monthlyRes] = await Promise.all([
          fetchApi(`/fees/reports/daily?date=${reportDate}`),
          fetchApi(`/fees/reports/monthly?month=${reportMonth}&year=${reportYear}`),
        ]);
        if (dailyRes.success) setDailyReport(dailyRes.data);
        if (monthlyRes.success) setMonthlyReport(monthlyRes.data);
      } catch (e: any) {
        // Silently handled
      }
    }
    loadReports();
  }, [activeTab, reportDate, reportMonth, reportYear]);

  const handleViewReceipt = async (paymentId: string) => {
    try {
      const res = await fetchApi(`/fees/receipt/${paymentId}`);
      if (res.success) {
        setSelectedReceipt(res.data);
      }
    } catch (e: any) {
      // Silently handled
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-gujarati">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <a href="/dashboard" className="text-blue-600 hover:underline flex items-center gap-1">
          <i className="bi bi-house-door"></i> Dashboard
        </a>
        <span>/</span>
        <span>{t.fees.title || 'ફી વ્યવસ્થાપન (Fees)'}</span>
      </div>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ReceiptIndianRupee className="w-7 h-7 text-blue-600" />
            {t.fees.title}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t.fees.subtitle} • {user?.schoolNameGu}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCollectModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            {t.fees.collectFee}
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('PAYMENTS')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
            activeTab === 'PAYMENTS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          તાજેતરની ફી પાવતીઓ ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('OUTSTANDING')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
            activeTab === 'OUTSTANDING'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          બાકી ફી પત્રક ({outstanding.length})
        </button>
        <button
          onClick={() => setActiveTab('REPORTS')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
            activeTab === 'REPORTS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
          દૈનિક / માસિક આવક અહેવાલ
        </button>
        <button
          onClick={() => setActiveTab('STRUCTURES')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
            activeTab === 'STRUCTURES'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-500" />
          ધોરણવાર ફી માળખું ({structures.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'PAYMENTS' && (
        <FeePaymentsTab
          payments={payments}
          locale={locale}
          t={t}
          onViewReceipt={handleViewReceipt}
          onRefund={(id) => setRefundPaymentId(id)}
        />
      )}

      {activeTab === 'OUTSTANDING' && (
        <FeeOutstandingTab outstanding={outstanding} locale={locale} />
      )}

      {activeTab === 'REPORTS' && (
        <FeeReportsTab
          reportDate={reportDate}
          setReportDate={setReportDate}
          dailyReport={dailyReport}
          reportMonth={reportMonth}
          setReportMonth={setReportMonth}
          reportYear={reportYear}
          setReportYear={setReportYear}
          monthlyReport={monthlyReport}
        />
      )}

      {activeTab === 'STRUCTURES' && (
        <FeeStructuresTab structures={structures} />
      )}

      {/* Modals */}
      {showCollectModal && (
        <CollectFeeModal
          students={students}
          accounts={accounts}
          academicYearId={user?.currentAcademicYearId}
          defaultDepositAccountId={defaultDepositAccountId}
          locale={locale}
          onClose={() => setShowCollectModal(false)}
          onSuccess={(receiptId) => {
            setShowCollectModal(false);
            loadData();
            handleViewReceipt(receiptId);
          }}
        />
      )}

      {selectedReceipt && (
        <FeeReceiptModal
          selectedReceipt={selectedReceipt}
          locale={locale}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {refundPaymentId && (
        <RefundFeeModal
          refundPaymentId={refundPaymentId}
          onClose={() => setRefundPaymentId(null)}
          onSuccess={() => {
            setRefundPaymentId(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
