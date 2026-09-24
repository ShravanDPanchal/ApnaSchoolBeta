'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api-client';
import {
  Scale,
  PlusCircle,
  FileText,
  BookOpen,
  CheckCircle2,
  X,
  Building2,
  Wallet,
  Calendar,
  PieChart,
  AlertTriangle,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import {
  AccountGroupType,
  AccountNature,
  PaymentMode,
} from '@apna-school/shared-types';
import {
  ChartOfAccountsTab,
  VouchersTab,
  CreateAccountModal,
  CreateVoucherModal,
  VoucherDetailModal,
  VoucherActionModal,
  GeneralLedgerTab,
  CashBookTab,
  BankBookTab,
  TrialBalanceTab,
  AccountingReportsTab,
  YearEndClosureTab,
} from '@/components/accounting';

type ActiveTab = 'COA' | 'VOUCHERS' | 'LEDGER' | 'CASH_BOOK' | 'BANK_BOOK' | 'TRIAL_BALANCE' | 'REPORTS' | 'YEAR_END';
type VoucherModalType = 'RECEIPT' | 'PAYMENT' | 'CONTRA' | 'GENERAL' | null;
type ReportSubTab = 'INCOME_EXPENSE' | 'HEAD_WISE' | 'MONTHLY';

export default function AccountingPage() {
  const { t, locale, user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('COA');
  const [reportSubTab, setReportSubTab] = useState<ReportSubTab>('INCOME_EXPENSE');

  // Core Data
  const [financialYears, setFinancialYears] = useState<any[]>([]);
  const [selectedFyId, setSelectedFyId] = useState<string>(user?.currentFinancialYearId || '');
  const [accountGroups, setAccountGroups] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Vouchers state
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [voucherFilterType, setVoucherFilterType] = useState<string>('ALL');
  const [voucherModal, setVoucherModal] = useState<VoucherModalType>(null);
  const [selectedVoucherForView, setSelectedVoucherForView] = useState<any>(null);
  const [selectedVoucherForAction, setSelectedVoucherForAction] = useState<{ id: string; action: 'reverse' | 'cancel' } | null>(null);
  const [actionReason, setActionReason] = useState('');

  // Ledger state
  const [selectedLedgerAccountId, setSelectedLedgerAccountId] = useState('');
  const [ledgerDateFrom, setLedgerDateFrom] = useState('2026-04-01');
  const [ledgerDateTo, setLedgerDateTo] = useState('2027-03-31');
  const [ledgerData, setLedgerData] = useState<any>(null);

  // Cash Book state
  const [cashBookFrom, setCashBookFrom] = useState('2026-04-01');
  const [cashBookTo, setCashBookTo] = useState('2027-03-31');
  const [cashBookData, setCashBookData] = useState<any>(null);

  // Bank Book state
  const [selectedBankAccountId, setSelectedBankAccountId] = useState('');
  const [bankBookFrom, setBankBookFrom] = useState('2026-04-01');
  const [bankBookTo, setBankBookTo] = useState('2027-03-31');
  const [bankBookData, setBankBookData] = useState<any>(null);

  // Trial Balance state
  const [trialBalance, setTrialBalance] = useState<any>(null);

  // Reports state
  const [incomeExpenseData, setIncomeExpenseData] = useState<any>(null);
  const [headWiseType, setHeadWiseType] = useState<AccountGroupType>(AccountGroupType.EXPENSE);
  const [headWiseData, setHeadWiseData] = useState<any>(null);
  const [monthlySummaryData, setMonthlySummaryData] = useState<any>(null);

  // Create Account Modal
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [newAccount, setNewAccount] = useState({
    code: '',
    nameEn: '',
    nameGu: '',
    accountGroupId: '',
    accountNature: AccountNature.DEBIT,
    accountType: AccountGroupType.EXPENSE,
    openingBalance: 0,
    isCashAccount: false,
    isBankAccount: false,
    bankAccountNumber: '',
    bankIfsc: '',
  });

  // Voucher Form States
  const [receiptForm, setReceiptForm] = useState({
    bankOrCashAccountId: '',
    incomeAccountId: '',
    amount: '',
    narration: '',
    paymentMode: PaymentMode.BANK_TRANSFER,
    referenceNumber: '',
    chequeNumber: '',
    chequeDate: '',
    bankName: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    expenseAccountId: '',
    bankOrCashAccountId: '',
    amount: '',
    narration: '',
    paymentMode: PaymentMode.CASH,
    referenceNumber: '',
    chequeNumber: '',
    chequeDate: '',
    payeeName: '',
  });

  const [contraForm, setContraForm] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    narration: '',
    referenceNumber: '',
  });

  const [journalLines, setJournalLines] = useState<Array<{ accountId: string; debitAmount: number; creditAmount: number; narration?: string }>>([
    { accountId: '', debitAmount: 0, creditAmount: 0, narration: '' },
    { accountId: '', debitAmount: 0, creditAmount: 0, narration: '' },
  ]);
  const [journalNarration, setJournalNarration] = useState('');
  const [journalRef, setJournalRef] = useState('');

  // Year End Rollover state
  const [targetNextFyId, setTargetNextFyId] = useState('');
  const [showCloseFyModal, setShowCloseFyModal] = useState(false);

  // Load Financial Years & Base Data
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [fysRes, groupsRes, accsRes] = await Promise.all([
        fetchApi('/accounting/financial-years'),
        fetchApi('/accounting/groups'),
        fetchApi('/accounting/accounts'),
      ]);

      if (fysRes.success && fysRes.data?.length > 0) {
        setFinancialYears(fysRes.data);
        const current = fysRes.data.find((f: any) => f.isCurrent) || fysRes.data[0];
        setSelectedFyId(current.id);
      }

      if (groupsRes.success) {
        setAccountGroups(groupsRes.data);
      }

      if (accsRes.success) {
        setAccounts(accsRes.data);
        const banks = accsRes.data.filter((a: any) => a.isBankAccount);
        const cash = accsRes.data.filter((a: any) => a.isCashAccount);
        setBankAccounts(banks);
        setCashAccounts(cash);

        if (accsRes.data.length > 0 && !selectedLedgerAccountId) {
          setSelectedLedgerAccountId(accsRes.data[0].id);
        }
        if (banks.length > 0 && !selectedBankAccountId) {
          setSelectedBankAccountId(banks[0].id);
        }
        if (cash.length > 0) {
          setReceiptForm((prev) => ({ ...prev, bankOrCashAccountId: cash[0].id }));
          setPaymentForm((prev) => ({ ...prev, bankOrCashAccountId: cash[0].id }));
        }
      }
    } catch (e: any) {
      // Handled gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Fetch Tab Specific Data
  const loadTabContent = async () => {
    if (!selectedFyId) return;

    try {
      if (activeTab === 'VOUCHERS') {
        const query = voucherFilterType !== 'ALL' ? `?type=${voucherFilterType}` : '';
        const res = await fetchApi(`/accounting/journal-entries${query}`);
        if (res.success) setVouchers(res.data?.entries || []);
      } else if (activeTab === 'TRIAL_BALANCE') {
        const res = await fetchApi(`/accounting/trial-balance?financialYearId=${selectedFyId}`);
        if (res.success) setTrialBalance(res.data);
      } else if (activeTab === 'CASH_BOOK') {
        const res = await fetchApi(`/accounting/cash-book?financialYearId=${selectedFyId}&from=${cashBookFrom}&to=${cashBookTo}`);
        if (res.success) setCashBookData(res.data);
      } else if (activeTab === 'BANK_BOOK' && selectedBankAccountId) {
        const res = await fetchApi(`/accounting/bank-book?financialYearId=${selectedFyId}&bankAccountId=${selectedBankAccountId}&from=${bankBookFrom}&to=${bankBookTo}`);
        if (res.success) setBankBookData(res.data);
      } else if (activeTab === 'REPORTS') {
        if (reportSubTab === 'INCOME_EXPENSE') {
          const res = await fetchApi(`/accounting/reports/income-expense?financialYearId=${selectedFyId}&from=${ledgerDateFrom}&to=${ledgerDateTo}`);
          if (res.success) setIncomeExpenseData(res.data);
        } else if (reportSubTab === 'HEAD_WISE') {
          const res = await fetchApi(`/accounting/reports/head-wise?financialYearId=${selectedFyId}&accountType=${headWiseType}`);
          if (res.success) setHeadWiseData(res.data);
        } else if (reportSubTab === 'MONTHLY') {
          const res = await fetchApi(`/accounting/reports/monthly?financialYearId=${selectedFyId}`);
          if (res.success) setMonthlySummaryData(res.data);
        }
      }
    } catch (e: any) {
      // Handled gracefully
    }
  };

  useEffect(() => {
    loadTabContent();
  }, [activeTab, selectedFyId, voucherFilterType, selectedBankAccountId, reportSubTab, headWiseType]);

  // Load Ledger
  useEffect(() => {
    if (activeTab === 'LEDGER' && selectedLedgerAccountId) {
      fetchApi(`/accounting/ledger/${selectedLedgerAccountId}?from=${ledgerDateFrom}&to=${ledgerDateTo}`)
        .then((res) => {
          if (res.success) setLedgerData(res.data);
        })
        .catch(() => {});
    }
  }, [activeTab, selectedLedgerAccountId, ledgerDateFrom, ledgerDateTo]);

  // Handlers
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchApi('/accounting/accounts', {
        method: 'POST',
        body: JSON.stringify({
          ...newAccount,
          financialYearId: selectedFyId,
          openingBalance: Number(newAccount.openingBalance) || 0,
        }),
      });
      if (res.success) {
        setMessage({ text: 'ખાતું સફળતાપૂર્વક ઉમેરાયું (Account created successfully)', type: 'success' });
        setShowCreateAccountModal(false);
        loadInitialData();
      } else {
        setMessage({ text: res.error?.message || 'ખાતું ઉમેરવામાં ભૂલ આવી', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const handleCreateReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchApi('/accounting/vouchers/receipt', {
        method: 'POST',
        body: JSON.stringify({
          ...receiptForm,
          financialYearId: selectedFyId,
          amount: Number(receiptForm.amount),
        }),
      });
      if (res.success) {
        setMessage({ text: `આવક વાઉચર ${res.data?.entryNumber} તૈયાર થઈ ગયું`, type: 'success' });
        setVoucherModal(null);
        setReceiptForm({
          bankOrCashAccountId: cashAccounts[0]?.id || '',
          incomeAccountId: '',
          amount: '',
          narration: '',
          paymentMode: PaymentMode.BANK_TRANSFER,
          referenceNumber: '',
          chequeNumber: '',
          chequeDate: '',
          bankName: '',
        });
        loadTabContent();
      } else {
        setMessage({ text: res.error?.message || 'વાઉચર બનાવવામાં ભૂલ આવી', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchApi('/accounting/vouchers/payment', {
        method: 'POST',
        body: JSON.stringify({
          ...paymentForm,
          financialYearId: selectedFyId,
          amount: Number(paymentForm.amount),
        }),
      });
      if (res.success) {
        setMessage({ text: `ચુકવણી વાઉચર ${res.data?.entryNumber} નોંધાઈ ગયું`, type: 'success' });
        setVoucherModal(null);
        setPaymentForm({
          expenseAccountId: '',
          bankOrCashAccountId: cashAccounts[0]?.id || '',
          amount: '',
          narration: '',
          paymentMode: PaymentMode.CASH,
          referenceNumber: '',
          chequeNumber: '',
          chequeDate: '',
          payeeName: '',
        });
        loadTabContent();
      } else {
        setMessage({ text: res.error?.message || 'વાઉચર બનાવવામાં ભૂલ આવી', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const handleCreateContra = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchApi('/accounting/vouchers/contra', {
        method: 'POST',
        body: JSON.stringify({
          ...contraForm,
          financialYearId: selectedFyId,
          amount: Number(contraForm.amount),
        }),
      });
      if (res.success) {
        setMessage({ text: `કન્ટ્રા વાઉચર ${res.data?.entryNumber} સફળતાપૂર્વક નોંધાયું`, type: 'success' });
        setVoucherModal(null);
        setContraForm({ fromAccountId: '', toAccountId: '', amount: '', narration: '', referenceNumber: '' });
        loadTabContent();
      } else {
        setMessage({ text: res.error?.message || 'કન્ટ્રા વાઉચર નિષ્ફળ', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const handleCreateJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    const totDr = journalLines.reduce((s, l) => s + (Number(l.debitAmount) || 0), 0);
    const totCr = journalLines.reduce((s, l) => s + (Number(l.creditAmount) || 0), 0);
    if (Math.abs(totDr - totCr) > 0.001) {
      setMessage({ text: `ઉધાર (₹${totDr}) અને જમા (₹${totCr}) સરખા હોવા જરૂરી છે!`, type: 'error' });
      return;
    }

    try {
      const res = await fetchApi('/accounting/journal-entries', {
        method: 'POST',
        body: JSON.stringify({
          financialYearId: selectedFyId,
          narration: journalNarration,
          referenceNumber: journalRef,
          lines: journalLines.map((l) => ({
            accountId: l.accountId,
            debitAmount: Number(l.debitAmount) || 0,
            creditAmount: Number(l.creditAmount) || 0,
            narration: l.narration,
          })),
        }),
      });

      if (res.success) {
        setMessage({ text: `જર્નલ વાઉચર ${res.data?.entryNumber} સાચવવામાં આવ્યું`, type: 'success' });
        setVoucherModal(null);
        setJournalLines([
          { accountId: '', debitAmount: 0, creditAmount: 0, narration: '' },
          { accountId: '', debitAmount: 0, creditAmount: 0, narration: '' },
        ]);
        setJournalNarration('');
        setJournalRef('');
        loadTabContent();
      } else {
        setMessage({ text: res.error?.message || 'જર્નલ એન્ટ્રી નિષ્ફળ', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const handleReverseOrCancel = async () => {
    if (!selectedVoucherForAction || !actionReason) {
      setMessage({ text: 'કારણ લખવું ફરજિયાત છે', type: 'error' });
      return;
    }
    const { id, action } = selectedVoucherForAction;
    try {
      const res = await fetchApi(`/accounting/journal-entries/${id}/${action}`, {
        method: 'POST',
        body: JSON.stringify({ reason: actionReason }),
      });
      if (res.success) {
        setMessage({ text: `વાઉચર ${action === 'reverse' ? 'રિવર્સ' : 'રદ'} કરવામાં આવ્યું`, type: 'success' });
        setSelectedVoucherForAction(null);
        setActionReason('');
        loadTabContent();
      } else {
        setMessage({ text: res.error?.message || 'પ્રક્રિયા નિષ્ફળ', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const handleCloseFinancialYear = async () => {
    if (!targetNextFyId) {
      setMessage({ text: 'આગામી નાણાકીય વર્ષ પસંદ કરો', type: 'error' });
      return;
    }
    try {
      const res = await fetchApi('/accounting/financial-years/close', {
        method: 'POST',
        body: JSON.stringify({
          currentFinancialYearId: selectedFyId,
          nextFinancialYearId: targetNextFyId,
        }),
      });
      if (res.success) {
        setMessage({ text: res.data?.message || 'નાણાકીય વર્ષ પૂર્ણાહુતિ સફળ!', type: 'success' });
        setShowCloseFyModal(false);
        loadInitialData();
      } else {
        setMessage({ text: res.error?.message || 'વર્ષ પૂર્ણાહુતિ નિષ્ફળ', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-6 font-gujarati">
      {/* Top Banner Alert */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between shadow-sm border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="p-1 hover:bg-black/5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header & Tab Navigation */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Scale className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  દ્વિનોંધી હિસાબી પ્રણાલી (Double-Entry Accounting)
                </h1>
                <p className="text-xs text-slate-500">
                  {user?.schoolNameGu} • સફેદ-લેબલ સરકારી તેમજ સ્વનિર્ભર શાળા સંચાલન
                </p>
              </div>
            </div>
          </div>

          {/* Financial Year Selector & Quick Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-slate-600">નાણાકીય વર્ષ:</span>
              <select
                value={selectedFyId}
                onChange={(e) => setSelectedFyId(e.target.value)}
                className="bg-transparent text-indigo-700 font-black focus:outline-none cursor-pointer"
              >
                {financialYears.map((fy) => (
                  <option key={fy.id} value={fy.id}>
                    {fy.name} {fy.isCurrent ? '(ચાલુ)' : ''} {fy.isClosed ? '🔒 બંધ' : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowCreateAccountModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-indigo-700 transition"
            >
              <PlusCircle className="w-4 h-4" />
              + નવું ખાતું
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 no-scrollbar text-xs font-bold">
          {[
            { id: 'COA', label: 'ખાતાનો ચાર્ટ (COA)', icon: Layers },
            { id: 'VOUCHERS', label: 'વાઉચર રજિસ્ટર (Vouchers)', icon: FileText },
            { id: 'LEDGER', label: 'ખાતાવહી (General Ledger)', icon: BookOpen },
            { id: 'CASH_BOOK', label: 'રોકડમેળ (Cash Book)', icon: Wallet },
            { id: 'BANK_BOOK', label: 'બેંક ખાતાવહી (Bank Book)', icon: Building2 },
            { id: 'TRIAL_BALANCE', label: 'કાચું સરવૈયું (Trial Balance)', icon: Scale },
            { id: 'REPORTS', label: 'નાણાકીય પત્રકો (Reports)', icon: PieChart },
            { id: 'YEAR_END', label: 'વર્ષ પૂર્ણાહુતિ (Year End)', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
                  isSel
                    ? 'bg-indigo-600 text-white shadow-sm font-black'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENTS */}
      {activeTab === 'COA' && (
        <ChartOfAccountsTab
          accounts={accounts}
          bankAccounts={bankAccounts}
          cashAccounts={cashAccounts}
          accountGroups={accountGroups}
          locale={locale}
        />
      )}

      {activeTab === 'VOUCHERS' && (
        <VouchersTab
          vouchers={vouchers}
          voucherFilterType={voucherFilterType}
          setVoucherFilterType={setVoucherFilterType}
          locale={locale}
          onOpenModal={(type) => setVoucherModal(type)}
          onViewVoucher={(v) => setSelectedVoucherForView(v)}
          onActionVoucher={(act) => setSelectedVoucherForAction(act)}
        />
      )}

      {activeTab === 'LEDGER' && (
        <GeneralLedgerTab
          accounts={accounts}
          selectedLedgerAccountId={selectedLedgerAccountId}
          setSelectedLedgerAccountId={setSelectedLedgerAccountId}
          ledgerDateFrom={ledgerDateFrom}
          setLedgerDateFrom={setLedgerDateFrom}
          ledgerDateTo={ledgerDateTo}
          setLedgerDateTo={setLedgerDateTo}
          ledgerData={ledgerData}
          locale={locale}
        />
      )}

      {activeTab === 'CASH_BOOK' && (
        <CashBookTab
          cashBookFrom={cashBookFrom}
          setCashBookFrom={setCashBookFrom}
          cashBookTo={cashBookTo}
          setCashBookTo={setCashBookTo}
          cashBookData={cashBookData}
          locale={locale}
        />
      )}

      {activeTab === 'BANK_BOOK' && (
        <BankBookTab
          bankAccounts={bankAccounts}
          selectedBankAccountId={selectedBankAccountId}
          setSelectedBankAccountId={setSelectedBankAccountId}
          bankBookFrom={bankBookFrom}
          setBankBookFrom={setBankBookFrom}
          bankBookTo={bankBookTo}
          setBankBookTo={setBankBookTo}
          bankBookData={bankBookData}
          locale={locale}
        />
      )}

      {activeTab === 'TRIAL_BALANCE' && (
        <TrialBalanceTab
          trialBalance={trialBalance}
          financialYears={financialYears}
          selectedFyId={selectedFyId}
          locale={locale}
        />
      )}

      {activeTab === 'REPORTS' && (
        <AccountingReportsTab
          reportSubTab={reportSubTab}
          setReportSubTab={setReportSubTab}
          incomeExpenseData={incomeExpenseData}
          headWiseType={headWiseType}
          setHeadWiseType={setHeadWiseType}
          headWiseData={headWiseData}
          monthlySummaryData={monthlySummaryData}
          locale={locale}
        />
      )}

      {activeTab === 'YEAR_END' && (
        <YearEndClosureTab
          financialYears={financialYears}
          selectedFyId={selectedFyId}
          targetNextFyId={targetNextFyId}
          setTargetNextFyId={setTargetNextFyId}
          onOpenConfirmation={() => setShowCloseFyModal(true)}
        />
      )}

      {/* MODALS */}
      {showCreateAccountModal && (
        <CreateAccountModal
          newAccount={newAccount}
          setNewAccount={setNewAccount}
          accountGroups={accountGroups}
          onClose={() => setShowCreateAccountModal(false)}
          onSubmit={handleCreateAccount}
        />
      )}

      {voucherModal && (
        <CreateVoucherModal
          voucherModal={voucherModal}
          accounts={accounts}
          cashAccounts={cashAccounts}
          receiptForm={receiptForm}
          setReceiptForm={setReceiptForm}
          paymentForm={paymentForm}
          setPaymentForm={setPaymentForm}
          contraForm={contraForm}
          setContraForm={setContraForm}
          journalLines={journalLines}
          setJournalLines={setJournalLines}
          journalNarration={journalNarration}
          setJournalNarration={setJournalNarration}
          journalRef={journalRef}
          setJournalRef={setJournalRef}
          locale={locale}
          onClose={() => setVoucherModal(null)}
          onCreateReceipt={handleCreateReceipt}
          onCreatePayment={handleCreatePayment}
          onCreateContra={handleCreateContra}
          onCreateJournal={handleCreateJournal}
        />
      )}

      {selectedVoucherForView && (
        <VoucherDetailModal
          voucher={selectedVoucherForView}
          locale={locale}
          onClose={() => setSelectedVoucherForView(null)}
        />
      )}

      {selectedVoucherForAction && (
        <VoucherActionModal
          actionData={selectedVoucherForAction}
          actionReason={actionReason}
          setActionReason={setActionReason}
          onClose={() => setSelectedVoucherForAction(null)}
          onConfirm={handleReverseOrCancel}
        />
      )}

      {showCloseFyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-gujarati">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-black text-indigo-950 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              નાણાકીય વર્ષ પૂર્ણાહુતિની અંતિમ પુષ્ટિ
            </h3>
            <p className="text-slate-600 leading-relaxed">
              શું તમે ખરેખર ચાલુ વર્ષ બંધ કરી સિલક આગળ ખેંચવા માંગો છો? આ પ્રક્રિયા દ્વારા આવક-ખર્ચ ખાતા શૂન્ય થશે અને નેટ સરપ્લસ મૂડી ભંડોળમાં જશે.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCloseFyModal(false)}
                className="px-4 py-2 border rounded-xl text-slate-600 font-bold hover:bg-slate-50"
              >
                ના, પાછા જાઓ
              </button>
              <button
                onClick={handleCloseFinancialYear}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-sm"
              >
                હા, વર્ષ બંધ કરો
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
