'use client';

import React from 'react';
import { Calendar, Printer } from 'lucide-react';
import { formatINR } from '@apna-school/shared-types';

interface GeneralLedgerTabProps {
  accounts: any[];
  selectedLedgerAccountId: string;
  setSelectedLedgerAccountId: (id: string) => void;
  ledgerDateFrom: string;
  setLedgerDateFrom: (val: string) => void;
  ledgerDateTo: string;
  setLedgerDateTo: (val: string) => void;
  ledgerData: any;
  locale: any;
}

export const GeneralLedgerTab: React.FC<GeneralLedgerTabProps> = ({
  accounts,
  selectedLedgerAccountId,
  setSelectedLedgerAccountId,
  ledgerDateFrom,
  setLedgerDateFrom,
  ledgerDateTo,
  setLedgerDateTo,
  ledgerData,
  locale,
}) => {
  return (
    <div className="space-y-4 font-gujarati">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-700">ખાતું પસંદ કરો:</span>
          <select
            value={selectedLedgerAccountId}
            onChange={(e) => setSelectedLedgerAccountId(e.target.value)}
            className="px-3.5 py-2 border rounded-xl bg-white font-bold text-slate-900 text-xs shadow-sm focus:ring-2 focus:ring-indigo-500"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.code} - {a.nameGu} ({a.nameEn})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={ledgerDateFrom}
            onChange={(e) => setLedgerDateFrom(e.target.value)}
            className="px-2.5 py-1.5 border rounded-lg bg-slate-50 font-mono font-medium text-xs"
          />
          <span className="text-slate-400">થી</span>
          <input
            type="date"
            value={ledgerDateTo}
            onChange={(e) => setLedgerDateTo(e.target.value)}
            className="px-2.5 py-1.5 border rounded-lg bg-slate-50 font-mono font-medium text-xs"
          />
        </div>
      </div>

      {/* Ledger Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">શરૂઆતની બાકી (Opening)</p>
          <p className="text-xl font-black text-slate-900 mt-1 font-mono">
            {formatINR(ledgerData?.openingBalance || 0, locale)} ({ledgerData?.openingBalanceNature || 'DR'})
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">કુલ ઉધાર (Total Debit)</p>
          <p className="text-xl font-black text-indigo-600 mt-1 font-mono">
            {formatINR(ledgerData?.totalDebit || 0, locale)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">કુલ જમા (Total Credit)</p>
          <p className="text-xl font-black text-emerald-600 mt-1 font-mono">
            {formatINR(ledgerData?.totalCredit || 0, locale)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">આખર બાકી (Closing Balance)</p>
          <p className="text-xl font-black text-slate-900 mt-1 font-mono">
            {formatINR(ledgerData?.closingBalance || 0, locale)} ({ledgerData?.closingBalanceNature || 'DR'})
          </p>
        </div>
      </div>

      {/* Ledger Statement Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="p-4 bg-indigo-50/50 border-b border-indigo-100 flex justify-between items-center">
          <div>
            <p className="font-black text-indigo-950 text-sm">
              {locale === 'gu' ? ledgerData?.accountNameGu : ledgerData?.accountNameEn} (ખાતાવહી પત્રક)
            </p>
            <p className="text-[10px] text-indigo-700">કોડ: {ledgerData?.accountCode}</p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-50"
          >
            <Printer className="w-3.5 h-3.5" />
            પ્રિન્ટ
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-700">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">તારીખ</th>
                <th className="py-3 px-4">વાઉચર નં.</th>
                <th className="py-3 px-4">સામેનું ખાતું (Opposite Head)</th>
                <th className="py-3 px-4">વિગત (Narration)</th>
                <th className="py-3 px-4 text-right">ઉધાર (DR) (₹)</th>
                <th className="py-3 px-4 text-right">જમા (CR) (₹)</th>
                <th className="py-3 px-4 text-right">ચાલુ બાકી (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ledgerData?.entries?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    આ સમયગાળામાં કોઈ વ્યવહાર નોંધાયેલ નથી
                  </td>
                </tr>
              ) : (
                ledgerData?.entries?.map((e: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono">{e.date}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-600">{e.entryNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {locale === 'gu' ? e.oppositeAccountGu : e.oppositeAccountEn}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs">{e.narration}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {e.debitAmount > 0 ? formatINR(e.debitAmount, locale) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {e.creditAmount > 0 ? formatINR(e.creditAmount, locale) : '-'}
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
