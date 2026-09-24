'use client';

import React from 'react';
import { RojmelHeadSummaryDto } from '@apna-school/shared-types';

interface RojmelHeadwiseTabProps {
  headFromDate: string;
  setHeadFromDate: (date: string) => void;
  headToDate: string;
  setHeadToDate: (date: string) => void;
  headSummaries: RojmelHeadSummaryDto[];
  onRefresh: () => void;
}

export const RojmelHeadwiseTab: React.FC<RojmelHeadwiseTabProps> = ({
  headFromDate,
  setHeadFromDate,
  headToDate,
  setHeadToDate,
  headSummaries,
  onRefresh,
}) => {
  return (
    <div className="space-y-4 font-gujarati">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700">સમયગાળો:</span>
          <input
            type="date"
            value={headFromDate}
            onChange={(e) => setHeadFromDate(e.target.value)}
            className="bg-amber-50 border border-amber-300 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-800"
          />
          <span className="text-xs text-slate-500">થી</span>
          <input
            type="date"
            value={headToDate}
            onChange={(e) => setHeadToDate(e.target.value)}
            className="bg-amber-50 border border-amber-300 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-800"
          />
        </div>
        <button
          onClick={onRefresh}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm"
        >
          રિપોર્ટ જુઓ
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse font-gujarati">
          <thead>
            <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 text-[11px] font-black">
              <th className="p-3 px-4">ખાતા કોડ</th>
              <th className="p-3">ખાતાનું નામ (Account Head)</th>
              <th className="p-3">ગ્રુપ</th>
              <th className="p-3 text-right text-emerald-800 font-black">કુલ જમા આવક (₹)</th>
              <th className="p-3 text-right text-rose-800 font-black">કુલ ઉધાર ખર્ચ (₹)</th>
              <th className="p-3 text-right font-black">ચોખ્ખી રકમ (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {headSummaries.map((head) => (
              <tr key={head.accountId} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 px-4 font-bold text-slate-700">{head.code}</td>
                <td className="p-3 font-bold text-slate-900 font-gujarati">
                  {head.nameGu}{' '}
                  <span className="text-slate-400 font-normal">({head.nameEn})</span>
                </td>
                <td className="p-3 text-slate-600 font-gujarati">{head.groupNameGu || '-'}</td>
                <td className="p-3 text-right font-bold text-emerald-700">
                  {head.jamaAmount.toFixed(2)}
                </td>
                <td className="p-3 text-right font-bold text-rose-700">
                  {head.udharAmount.toFixed(2)}
                </td>
                <td className="p-3 text-right font-black text-slate-900">
                  {head.netAmount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
