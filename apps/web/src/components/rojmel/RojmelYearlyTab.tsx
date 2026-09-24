'use client';

import React from 'react';
import { formatINR, RojmelYearlyViewDto } from '@apna-school/shared-types';

interface RojmelYearlyTabProps {
  yearlyData: RojmelYearlyViewDto | null;
  locale: any;
}

export const RojmelYearlyTab: React.FC<RojmelYearlyTabProps> = ({
  yearlyData,
  locale,
}) => {
  return (
    <div className="space-y-4 font-gujarati">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">
            વાર્ષિક હિસાબ મેળ સારાંશ — {yearlyData?.financialYearName || '2026-27'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ૧૨ મહિનાનો આવક-જાવક અને નફો/ખોટ (Surplus/Deficit) અહેવાલ
          </p>
        </div>
        <div className="flex items-center gap-6 text-xs">
          <div className="text-right">
            <p className="text-slate-400 font-bold">કુલ વાર્ષિક આવક</p>
            <p className="text-base font-black text-emerald-700 font-mono">
              {formatINR(yearlyData?.totalReceipts || 0, locale)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 font-bold">કુલ વાર્ષિક ખર્ચ</p>
            <p className="text-base font-black text-rose-700 font-mono">
              {formatINR(yearlyData?.totalPayments || 0, locale)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 font-bold">ચોખ્ખી બચત (Surplus)</p>
            <p className="text-base font-black text-blue-900 font-mono">
              {formatINR(yearlyData?.netSurplusDeficit || 0, locale)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse font-gujarati">
          <thead>
            <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 text-[11px] font-black">
              <th className="p-3 px-4">મહિનો (Month)</th>
              <th className="p-3 text-right">શરૂઆત રોકડ (₹)</th>
              <th className="p-3 text-right">શરૂઆત બેંક (₹)</th>
              <th className="p-3 text-right text-emerald-800">કુલ આવક (₹)</th>
              <th className="p-3 text-right text-rose-800">કુલ ખર્ચ (₹)</th>
              <th className="p-3 text-right font-black">ચોખ્ખો નફો/ખોટ (₹)</th>
              <th className="p-3 text-right text-blue-900 font-black">આખર રોકડ (₹)</th>
              <th className="p-3 text-right text-blue-900 font-black">આખર બેંક (₹)</th>
              <th className="p-3 text-right text-blue-950 font-black">કુલ સિલક (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {yearlyData?.months?.map((m) => (
              <tr key={m.monthKey} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 px-4 font-bold text-slate-900 font-gujarati">
                  {m.monthNameGu} ({m.monthNameEn})
                </td>
                <td className="p-3 text-right text-slate-600">{m.openingCash.toFixed(2)}</td>
                <td className="p-3 text-right text-slate-600">{m.openingBank.toFixed(2)}</td>
                <td className="p-3 text-right font-bold text-emerald-700">
                  {m.totalReceipts.toFixed(2)}
                </td>
                <td className="p-3 text-right font-bold text-rose-700">
                  {m.totalPayments.toFixed(2)}
                </td>
                <td
                  className={`p-3 text-right font-black ${
                    m.netSurplusDeficit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {m.netSurplusDeficit.toFixed(2)}
                </td>
                <td className="p-3 text-right font-bold text-slate-900">
                  {m.closingCash.toFixed(2)}
                </td>
                <td className="p-3 text-right font-bold text-slate-900">
                  {m.closingBank.toFixed(2)}
                </td>
                <td className="p-3 text-right font-black text-blue-950 bg-slate-50">
                  {m.closingTotal.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
