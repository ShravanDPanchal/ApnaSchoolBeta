'use client';

import React from 'react';
import { RojmelMonthlyViewDto } from '@apna-school/shared-types';

interface RojmelMonthlyTabProps {
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  monthlyData: RojmelMonthlyViewDto | null;
}

export const RojmelMonthlyTab: React.FC<RojmelMonthlyTabProps> = ({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  monthlyData,
}) => {
  return (
    <div className="space-y-4 font-gujarati">
      {/* Monthly Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700">મહિનો અને વર્ષ:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
            className="bg-amber-50 border border-amber-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800"
          >
            {[
              { m: 1, name: 'જાન્યુઆરી (January)' },
              { m: 2, name: 'ફેબ્રુઆરી (February)' },
              { m: 3, name: 'માર્ચ (March)' },
              { m: 4, name: 'એપ્રિલ (April)' },
              { m: 5, name: 'મે (May)' },
              { m: 6, name: 'જૂન (June)' },
              { m: 7, name: 'જુલાઈ (July)' },
              { m: 8, name: 'ઓગસ્ટ (August)' },
              { m: 9, name: 'સપ્ટેમ્બર (September)' },
              { m: 10, name: 'ઓક્ટોબર (October)' },
              { m: 11, name: 'નવેમ્બર (November)' },
              { m: 12, name: 'ડિસેમ્બર (December)' },
            ].map((item) => (
              <option key={item.m} value={item.m}>
                {item.name}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="bg-amber-50 border border-amber-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-800"
          >
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="text-slate-600">
            કુલ માસિક આવક:{' '}
            <strong className="text-emerald-700 font-mono">
              ₹{monthlyData?.totalReceipts || 0}
            </strong>
          </span>
          <span className="text-slate-600">
            કુલ માસિક ખર્ચ:{' '}
            <strong className="text-rose-700 font-mono">
              ₹{monthlyData?.totalPayments || 0}
            </strong>
          </span>
        </div>
      </div>

      {/* 31-Day Grid Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-gujarati">
          <thead>
            <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 text-[11px] font-black">
              <th className="p-2.5 px-3">તારીખ</th>
              <th className="p-2.5 text-right">શરૂ. રોકડ (₹)</th>
              <th className="p-2.5 text-right">શરૂ. બેંક (₹)</th>
              <th className="p-2.5 text-right text-emerald-800">રોકડ જમા (₹)</th>
              <th className="p-2.5 text-right text-emerald-800">બેંક જમા (₹)</th>
              <th className="p-2.5 text-right text-rose-800">રોકડ ઉધાર (₹)</th>
              <th className="p-2.5 text-right text-rose-800">બેંક ઉધાર (₹)</th>
              <th className="p-2.5 text-right text-blue-900 font-black">આખર રોકડ (₹)</th>
              <th className="p-2.5 text-right text-blue-900 font-black">આખર બેંક (₹)</th>
              <th className="p-2.5 text-center">સ્થિતિ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {monthlyData?.days?.map((row) => (
              <tr key={row.date} className="hover:bg-slate-50 transition-colors">
                <td className="p-2.5 px-3 font-bold text-slate-900">{row.date}</td>
                <td className="p-2.5 text-right text-slate-600">{row.openingCash.toFixed(2)}</td>
                <td className="p-2.5 text-right text-slate-600">{row.openingBank.toFixed(2)}</td>
                <td className="p-2.5 text-right font-bold text-emerald-700">
                  {row.cashJama > 0 ? row.cashJama.toFixed(2) : '-'}
                </td>
                <td className="p-2.5 text-right font-bold text-emerald-700">
                  {row.bankJama > 0 ? row.bankJama.toFixed(2) : '-'}
                </td>
                <td className="p-2.5 text-right font-bold text-rose-700">
                  {row.cashUdhar > 0 ? row.cashUdhar.toFixed(2) : '-'}
                </td>
                <td className="p-2.5 text-right font-bold text-rose-700">
                  {row.bankUdhar > 0 ? row.bankUdhar.toFixed(2) : '-'}
                </td>
                <td className="p-2.5 text-right font-bold text-slate-900">
                  {row.closingCash.toFixed(2)}
                </td>
                <td className="p-2.5 text-right font-bold text-slate-900">
                  {row.closingBank.toFixed(2)}
                </td>
                <td className="p-2.5 text-center font-gujarati text-[10px]">
                  {row.isBalanced ? (
                    <span className="text-emerald-700 font-bold">મેળ ✓</span>
                  ) : (
                    <span className="text-rose-600 font-bold">તફાવત ✗</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
