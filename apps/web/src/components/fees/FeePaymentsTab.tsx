'use client';

import React from 'react';
import { Printer } from 'lucide-react';
import { formatINR } from '@apna-school/shared-types';

interface FeePaymentsTabProps {
  payments: any[];
  locale: any;
  t: any;
  onViewReceipt: (paymentId: string) => void;
  onRefund: (paymentId: string) => void;
}

export const FeePaymentsTab: React.FC<FeePaymentsTabProps> = ({
  payments,
  locale,
  t,
  onViewReceipt,
  onRefund,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs font-gujarati">
      <table className="w-full text-left text-slate-700">
        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
          <tr>
            <th className="py-3 px-4">{t.fees.receiptNo}</th>
            <th className="py-3 px-4">{t.fees.student}</th>
            <th className="py-3 px-4">{t.fees.paymentMode}</th>
            <th className="py-3 px-4 font-mono">{t.fees.date}</th>
            <th className="py-3 px-4 text-right">{t.fees.amount}</th>
            <th className="py-3 px-4 text-center">સ્થિતિ</th>
            <th className="py-3 px-4 text-center">૩-પ્રત રસીદ</th>
            <th className="py-3 px-4 text-right">ક્રિયા</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {payments.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-12 text-slate-400">
                કોઈ ફી વસૂલાત નોંધણી મળી નથી
              </td>
            </tr>
          ) : (
            payments.map((p) => (
              <tr
                key={p.id}
                className={p.status === 'REFUNDED' ? 'bg-rose-50/50' : 'hover:bg-slate-50'}
              >
                <td className="py-3 px-4 font-mono font-bold text-blue-700">
                  {p.receiptNumber}
                </td>
                <td className="py-3 px-4">
                  <p className="font-bold text-slate-900">
                    {locale === 'gu'
                      ? `${p.student.firstNameGu} ${p.student.lastNameGu}`
                      : `${p.student.firstNameEn} ${p.student.lastNameEn}`}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    GR: {p.student.grNumber}
                  </p>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-700">
                    {p.paymentMode}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-slate-500">
                  {p.paymentDate.split('T')[0]}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                  ₹{formatINR(p.totalAmount)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      p.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {p.status === 'ACTIVE' ? 'સક્રિય (Paid)' : 'રદ / પરત (Refunded)'}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => onViewReceipt(p.id)}
                    className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 rounded font-bold text-[11px]"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    રસીદ જુઓ
                  </button>
                </td>
                <td className="py-3 px-4 text-right">
                  {p.status === 'ACTIVE' && (
                    <button
                      onClick={() => onRefund(p.id)}
                      className="text-rose-600 hover:text-rose-800 font-bold text-[11px] underline"
                    >
                      રદ / પરત (Refund)
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
