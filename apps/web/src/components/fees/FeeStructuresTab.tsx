'use client';

import React from 'react';
import { formatINR } from '@apna-school/shared-types';

interface FeeStructuresTabProps {
  structures: any[];
}

export const FeeStructuresTab: React.FC<FeeStructuresTabProps> = ({ structures }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs font-gujarati">
      <table className="w-full text-left text-slate-700">
        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
          <tr>
            <th className="py-3 px-4">ધોરણ (Standard)</th>
            <th className="py-3 px-4">ફી હેડ (Fee Head)</th>
            <th className="py-3 px-4 text-center">હપ્તો ક્રમ (Installment)</th>
            <th className="py-3 px-4 text-center">નિયત તારીખ (Due Date)</th>
            <th className="py-3 px-4 text-right">વાર્ષિક રકમ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {structures.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-12 text-slate-400">
                કોઈ ફી માળખું મળ્યું નથી
              </td>
            </tr>
          ) : (
            structures.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900">
                  {s.class.nameGu} ({s.class.nameEn})
                </td>
                <td className="py-3 px-4 font-medium text-slate-800">
                  {s.feeHead.nameGu} ({s.feeHead.nameEn})
                </td>
                <td className="py-3 px-4 text-center font-mono font-bold text-indigo-700">
                  #{s.installmentNo}
                </td>
                <td className="py-3 px-4 text-center font-mono text-slate-500">
                  {s.dueDate ? s.dueDate.split('T')[0] : 'શરૂઆત'}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                  ₹{formatINR(s.amount)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
