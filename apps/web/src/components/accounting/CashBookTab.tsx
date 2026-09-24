'use client';

import React from 'react';
import { Wallet } from 'lucide-react';
import { formatINR } from '@apna-school/shared-types';

interface CashBookTabProps {
  cashBookFrom: string;
  setCashBookFrom: (val: string) => void;
  cashBookTo: string;
  setCashBookTo: (val: string) => void;
  cashBookData: any;
  locale: any;
}

export const CashBookTab: React.FC<CashBookTabProps> = ({
  cashBookFrom,
  setCashBookFrom,
  cashBookTo,
  setCashBookTo,
  cashBookData,
  locale,
}) => {
  return (
    <div className="space-y-4 font-gujarati">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            શ્રી રોકડમેળ (Cash Book Register)
          </h2>
          <p className="text-xs text-slate-500">રોકડ વ્યવહારોની દૈનિક આવક-જાવક નોંધણી</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <input
            type="date"
            value={cashBookFrom}
            onChange={(e) => setCashBookFrom(e.target.value)}
            className="px-2.5 py-1.5 border rounded-lg bg-slate-50 font-mono"
          />
          <span className="text-slate-400">થી</span>
          <input
            type="date"
            value={cashBookTo}
            onChange={(e) => setCashBookTo(e.target.value)}
            className="px-2.5 py-1.5 border rounded-lg bg-slate-50 font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">શરૂઆતની રોકડ સિલક</p>
          <p className="text-xl font-black text-slate-900 mt-1 font-mono">
            {formatINR(cashBookData?.openingCashBalance || 0, locale)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">કુલ રોકડ આવક (Receipts)</p>
          <p className="text-xl font-black text-emerald-600 mt-1 font-mono">
            {formatINR(cashBookData?.totalCashReceipts || 0, locale)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">કુલ રોકડ જાવક (Payments)</p>
          <p className="text-xl font-black text-rose-600 mt-1 font-mono">
            {formatINR(cashBookData?.totalCashPayments || 0, locale)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">આખર રોકડ સિલક</p>
          <p className="text-xl font-black text-indigo-700 mt-1 font-mono">
            {formatINR(cashBookData?.closingCashBalance || 0, locale)}
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
                <th className="py-3 px-4">વિગત / ખાતાનું નામ</th>
                <th className="py-3 px-4 text-right">આવક (₹)</th>
                <th className="py-3 px-4 text-right">જાવક (₹)</th>
                <th className="py-3 px-4 text-right">રોકડ સિલક બાકી (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cashBookData?.entries?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    આ સમયગાળામાં કોઈ રોકડ વ્યવહાર નથી
                  </td>
                </tr>
              ) : (
                cashBookData?.entries?.map((e: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono">{e.date}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-600">{e.entryNumber}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{e.narration}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                      {e.receiptAmount > 0 ? formatINR(e.receiptAmount, locale) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                      {e.paymentAmount > 0 ? formatINR(e.paymentAmount, locale) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                      {formatINR(e.runningCashBalance, locale)}
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
