'use client';

import React from 'react';
import { Building2 } from 'lucide-react';
import { formatINR } from '@apna-school/shared-types';

interface BankBookTabProps {
  bankAccounts: any[];
  selectedBankAccountId: string;
  setSelectedBankAccountId: (id: string) => void;
  bankBookFrom: string;
  setBankBookFrom: (val: string) => void;
  bankBookTo: string;
  setBankBookTo: (val: string) => void;
  bankBookData: any;
  locale: any;
}

export const BankBookTab: React.FC<BankBookTabProps> = ({
  bankAccounts,
  selectedBankAccountId,
  setSelectedBankAccountId,
  bankBookFrom,
  setBankBookFrom,
  bankBookTo,
  setBankBookTo,
  bankBookData,
  locale,
}) => {
  return (
    <div className="space-y-4 font-gujarati">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-indigo-600" />
          <div>
            <h2 className="text-base font-black text-slate-900">બેંક ખાતાવહી (Bank Register)</h2>
            <p className="text-xs text-slate-500">બેંક ખાતાવાર જમા-ઉધાર અને ચેક ટ્રાન્ઝેક્શન</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <select
            value={selectedBankAccountId}
            onChange={(e) => setSelectedBankAccountId(e.target.value)}
            className="px-3.5 py-1.5 border rounded-xl bg-slate-50 font-bold text-slate-900"
          >
            {bankAccounts.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nameGu} ({b.bankAccountNumber || b.code})
              </option>
            ))}
          </select>
          <input
            type="date"
            value={bankBookFrom}
            onChange={(e) => setBankBookFrom(e.target.value)}
            className="px-2.5 py-1.5 border rounded-lg bg-slate-50 font-mono"
          />
          <span className="text-slate-400">થી</span>
          <input
            type="date"
            value={bankBookTo}
            onChange={(e) => setBankBookTo(e.target.value)}
            className="px-2.5 py-1.5 border rounded-lg bg-slate-50 font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">શરૂઆતની બેંક સિલક</p>
          <p className="text-xl font-black text-slate-900 mt-1 font-mono">
            {formatINR(bankBookData?.openingBankBalance || 0, locale)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">કુલ જમા / ડિપોઝિટ (Deposits)</p>
          <p className="text-xl font-black text-emerald-600 mt-1 font-mono">
            {formatINR(bankBookData?.totalDeposits || 0, locale)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">કુલ ઉધાર / ચેક (Withdrawals)</p>
          <p className="text-xl font-black text-rose-600 mt-1 font-mono">
            {formatINR(bankBookData?.totalWithdrawals || 0, locale)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">આખર બેંક સિલક</p>
          <p className="text-xl font-black text-indigo-700 mt-1 font-mono">
            {formatINR(bankBookData?.closingBankBalance || 0, locale)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-700">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">તારીખ</th>
                <th className="py-3 px-4">વાઉચર નં.</th>
                <th className="py-3 px-4">ચેક / UTR નં.</th>
                <th className="py-3 px-4">વિગત</th>
                <th className="py-3 px-4 text-right">જમા (Deposits) (₹)</th>
                <th className="py-3 px-4 text-right">ઉધાર (Withdrawals) (₹)</th>
                <th className="py-3 px-4 text-right">બેંક સિલક (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bankBookData?.entries?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    આ બેંક ખાતામાં કોઈ વ્યવહાર નથી
                  </td>
                </tr>
              ) : (
                bankBookData?.entries?.map((e: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono">{e.date}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-600">{e.entryNumber}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {e.chequeNumber || e.referenceNumber || '-'}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">{e.narration}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                      {e.depositAmount > 0 ? formatINR(e.depositAmount, locale) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                      {e.withdrawalAmount > 0 ? formatINR(e.withdrawalAmount, locale) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-indigo-700">
                      {formatINR(e.runningBalance, locale)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
