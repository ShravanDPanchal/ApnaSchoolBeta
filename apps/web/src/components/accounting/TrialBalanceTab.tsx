'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatINR } from '@apna-school/shared-types';

interface TrialBalanceTabProps {
  trialBalance: any;
  financialYears: any[];
  selectedFyId: string;
  locale: any;
}

export const TrialBalanceTab: React.FC<TrialBalanceTabProps> = ({
  trialBalance,
  financialYears,
  selectedFyId,
  locale,
}) => {
  return (
    <div className="space-y-4 font-gujarati">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-black text-slate-900 text-sm">
              કાચું સરવૈયું (Trial Balance as of {new Date().toISOString().slice(0, 10)})
            </span>
            <p className="text-[11px] text-slate-500">
              નાણાકીય વર્ષ: {financialYears.find((f) => f.id === selectedFyId)?.name || 'ચાલુ વર્ષ'}
            </p>
          </div>

          {trialBalance?.isBalanced ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              સરવૈયું મેળ મળી ગયો (Tally Balanced)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-300 px-3 py-1.5 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              તફાવત (Unbalanced): ₹
              {Math.abs(
                (trialBalance?.totalDebit || 0) - (trialBalance?.totalCredit || 0)
              )}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-700">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">કોડ</th>
                <th className="py-3 px-4">ખાતાનું નામ (Account Head)</th>
                <th className="py-3 px-4">પ્રકાર</th>
                <th className="py-3 px-4 text-right">ઉધાર બાકી (Debit) (₹)</th>
                <th className="py-3 px-4 text-right">જમા બાકી (Credit) (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trialBalance?.rows?.map((row: any) => (
                <tr key={row.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-mono font-bold text-slate-500">{row.code}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {locale === 'gu' ? row.nameGu : row.nameEn}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[10px] font-semibold">{row.accountType}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {row.debitAmount > 0 ? formatINR(row.debitAmount, locale) : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {row.creditAmount > 0 ? formatINR(row.creditAmount, locale) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 font-bold text-slate-900 text-sm border-t-2 border-slate-300">
              <tr>
                <td colSpan={3} className="py-3.5 px-4 text-right font-black">
                  કુલ સરવાળો (Grand Total):
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-black text-indigo-700">
                  {formatINR(trialBalance?.totalDebit || 0, locale)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-black text-indigo-700">
                  {formatINR(trialBalance?.totalCredit || 0, locale)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
