'use client';

import React from 'react';
import { formatINR } from '@apna-school/shared-types';

interface FeeOutstandingTabProps {
  outstanding: any[];
  locale: any;
}

export const FeeOutstandingTab: React.FC<FeeOutstandingTabProps> = ({
  outstanding,
  locale,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs font-gujarati">
      <table className="w-full text-left text-slate-700">
        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
          <tr>
            <th className="py-3 px-4">GR No</th>
            <th className="py-3 px-4">વિદ્યાર્થીનું નામ</th>
            <th className="py-3 px-4">ધોરણ</th>
            <th className="py-3 px-4">ફી હેડ</th>
            <th className="py-3 px-4 text-right">મૂળ ફી</th>
            <th className="py-3 px-4 text-right">છૂટછાટ</th>
            <th className="py-3 px-4 text-right">દંડ</th>
            <th className="py-3 px-4 text-right">ચૂકવેલ</th>
            <th className="py-3 px-4 text-right text-rose-700 font-bold">બાકી રકમ</th>
            <th className="py-3 px-4 text-center">સ્થિતિ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {outstanding.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center py-12 text-slate-400">
                કોઈ બાકી ફી મળી નથી. બધા વિદ્યાર્થીઓની ફી ભરાઈ ગઈ છે!
              </td>
            </tr>
          ) : (
            outstanding.map((o) => (
              <tr key={o.studentFeeId} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-indigo-700">{o.grNumber}</td>
                <td className="py-3 px-4 font-bold text-slate-900">
                  {locale === 'gu' ? o.studentNameGu : o.studentNameEn}
                </td>
                <td className="py-3 px-4 font-medium text-slate-700">{o.classNameEn}</td>
                <td className="py-3 px-4">{locale === 'gu' ? o.feeHeadNameGu : o.feeHeadNameEn}</td>
                <td className="py-3 px-4 text-right font-mono">₹{formatINR(o.amount)}</td>
                <td className="py-3 px-4 text-right font-mono text-emerald-600">-₹{formatINR(o.discountAmount || 0)}</td>
                <td className="py-3 px-4 text-right font-mono text-amber-700">+₹{formatINR(o.fineAmount || 0)}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-600">₹{formatINR(o.paidAmount)}</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 text-sm">
                  ₹{formatINR(o.pendingAmount)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      o.status === 'PARTIAL'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {o.status === 'PARTIAL' ? 'અંશતઃ ચૂકવેલ' : 'બાકી (Pending)'}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
