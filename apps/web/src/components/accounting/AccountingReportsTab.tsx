'use client';

import React from 'react';
import { AccountGroupType, formatINR } from '@apna-school/shared-types';

interface AccountingReportsTabProps {
  reportSubTab: 'INCOME_EXPENSE' | 'HEAD_WISE' | 'MONTHLY';
  setReportSubTab: (tab: 'INCOME_EXPENSE' | 'HEAD_WISE' | 'MONTHLY') => void;
  incomeExpenseData: any;
  headWiseType: AccountGroupType;
  setHeadWiseType: (type: AccountGroupType) => void;
  headWiseData: any;
  monthlySummaryData: any;
  locale: any;
}

export const AccountingReportsTab: React.FC<AccountingReportsTabProps> = ({
  reportSubTab,
  setReportSubTab,
  incomeExpenseData,
  headWiseType,
  setHeadWiseType,
  headWiseData,
  monthlySummaryData,
  locale,
}) => {
  return (
    <div className="space-y-4 font-gujarati">
      {/* Sub-tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold w-fit">
        <button
          onClick={() => setReportSubTab('INCOME_EXPENSE')}
          className={`px-4 py-2 rounded-lg transition-all ${
            reportSubTab === 'INCOME_EXPENSE'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          આવક-જાવક પત્રક (Income & Expense)
        </button>
        <button
          onClick={() => setReportSubTab('HEAD_WISE')}
          className={`px-4 py-2 rounded-lg transition-all ${
            reportSubTab === 'HEAD_WISE'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          હેડવાર ગ્રાન્ટ/ખર્ચ રિપોર્ટ (Head-wise)
        </button>
        <button
          onClick={() => setReportSubTab('MONTHLY')}
          className={`px-4 py-2 rounded-lg transition-all ${
            reportSubTab === 'MONTHLY'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          માસિક સારાંશ (Monthly Summary)
        </button>
      </div>

      {/* Sub-tab 1: Income & Expense */}
      {reportSubTab === 'INCOME_EXPENSE' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm">
              <p className="text-xs font-bold text-emerald-800">કુલ આવક (Total Revenue)</p>
              <p className="text-2xl font-black text-emerald-950 mt-1 font-mono">
                {formatINR(incomeExpenseData?.totalIncome || 0, locale)}
              </p>
            </div>
            <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl shadow-sm">
              <p className="text-xs font-bold text-rose-800">કુલ ખર્ચ (Total Expenses)</p>
              <p className="text-2xl font-black text-rose-950 mt-1 font-mono">
                {formatINR(incomeExpenseData?.totalExpense || 0, locale)}
              </p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-2xl shadow-sm">
              <p className="text-xs font-bold text-indigo-800">ચોખ્ખી બચત / સરપ્લસ (Net Surplus)</p>
              <p className="text-2xl font-black text-indigo-950 mt-1 font-mono">
                {formatINR(incomeExpenseData?.netSurplus || 0, locale)}
              </p>
            </div>
          </div>

          {/* Incomes & Expenses 2-Column Statement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Income column */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-3.5 bg-emerald-50/60 border-b border-emerald-100 font-black text-emerald-900 flex justify-between">
                <span>આવક ખાતાઓ (Incomes & Grants)</span>
                <span className="font-mono">
                  {formatINR(incomeExpenseData?.totalIncome || 0, locale)}
                </span>
              </div>
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-100">
                  {incomeExpenseData?.incomeAccounts?.map((acc: any) => (
                    <tr key={acc.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-bold text-slate-800">
                        {locale === 'gu' ? acc.nameGu : acc.nameEn}
                        <span className="text-[10px] text-slate-400 font-mono ml-2">
                          ({acc.code})
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700">
                        {formatINR(acc.amount, locale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Expense column */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-3.5 bg-rose-50/60 border-b border-rose-100 font-black text-rose-900 flex justify-between">
                <span>ખર્ચ ખાતાઓ (Expenses & Payments)</span>
                <span className="font-mono">
                  {formatINR(incomeExpenseData?.totalExpense || 0, locale)}
                </span>
              </div>
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-100">
                  {incomeExpenseData?.expenseAccounts?.map((acc: any) => (
                    <tr key={acc.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-bold text-slate-800">
                        {locale === 'gu' ? acc.nameGu : acc.nameEn}
                        <span className="text-[10px] text-slate-400 font-mono ml-2">
                          ({acc.code})
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-700">
                        {formatINR(acc.amount, locale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Head-Wise Report */}
      {reportSubTab === 'HEAD_WISE' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">પ્રકાર પસંદ કરો:</span>
            <button
              onClick={() => setHeadWiseType(AccountGroupType.EXPENSE)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                headWiseType === AccountGroupType.EXPENSE
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              ખર્ચ હેડ (Expenses)
            </button>
            <button
              onClick={() => setHeadWiseType(AccountGroupType.INCOME)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                headWiseType === AccountGroupType.INCOME
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              આવક/ગ્રાન્ટ હેડ (Incomes/Grants)
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
            <table className="w-full text-left text-slate-700">
              <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">હેડ કોડ</th>
                  <th className="py-3 px-4">ખાતાનું નામ (Head Name)</th>
                  <th className="py-3 px-4">જૂથ</th>
                  <th className="py-3 px-4 text-right">કુલ રકમ (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {headWiseData?.heads?.map((h: any) => (
                  <tr key={h.accountId} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{h.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {locale === 'gu' ? h.nameGu : h.nameEn}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[10px]">{h.groupNameGu}</td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900 text-sm">
                      {formatINR(h.totalAmount, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-bold text-slate-900 text-sm border-t-2 border-slate-300">
                <tr>
                  <td colSpan={3} className="py-3.5 px-4 text-right font-black">
                    કુલ ગ્રાન્ડ ટોટલ:
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-indigo-700">
                    {formatINR(headWiseData?.grandTotal || 0, locale)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Monthly Summary */}
      {reportSubTab === 'MONTHLY' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-black text-slate-900 text-sm">
            માસિક નાણાકીય સારાંશ (Monthly Financial Flow Trend)
          </div>
          <table className="w-full text-left text-slate-700">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">મહિનો (Month)</th>
                <th className="py-3 px-4 text-right">આવક (Income) (₹)</th>
                <th className="py-3 px-4 text-right">ખર્ચ (Expense) (₹)</th>
                <th className="py-3 px-4 text-right">ચોખ્ખો પ્રવાહ (Net Flow) (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlySummaryData?.monthlySummaries?.map((m: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{m.month}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                    {formatINR(m.income, locale)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-700">
                    {formatINR(m.expense, locale)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-black text-indigo-700">
                    {formatINR(m.net, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
