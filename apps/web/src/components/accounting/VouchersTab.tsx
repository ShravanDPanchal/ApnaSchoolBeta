'use client';

import React from 'react';
import {
  Receipt,
  CreditCard,
  ArrowRightLeft,
  FileText,
  Filter,
  Eye,
  RotateCcw,
  Ban,
} from 'lucide-react';
import { formatINR } from '@apna-school/shared-types';

interface VouchersTabProps {
  vouchers: any[];
  voucherFilterType: string;
  setVoucherFilterType: (val: string) => void;
  locale: any;
  onOpenModal: (type: 'RECEIPT' | 'PAYMENT' | 'CONTRA' | 'GENERAL') => void;
  onViewVoucher: (v: any) => void;
  onActionVoucher: (v: { id: string; action: 'reverse' | 'cancel' }) => void;
}

export const VouchersTab: React.FC<VouchersTabProps> = ({
  vouchers,
  voucherFilterType,
  setVoucherFilterType,
  locale,
  onOpenModal,
  onViewVoucher,
  onActionVoucher,
}) => {
  return (
    <div className="space-y-4 font-gujarati">
      {/* Quick Action Bar for Vouchers */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenModal('RECEIPT')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-emerald-700 transition"
          >
            <Receipt className="w-4 h-4" />
            + આવક વાઉચર (Receipt)
          </button>
          <button
            onClick={() => onOpenModal('PAYMENT')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-rose-700 transition"
          >
            <CreditCard className="w-4 h-4" />
            + ચુકવણી વાઉચર (Payment)
          </button>
          <button
            onClick={() => onOpenModal('CONTRA')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-blue-700 transition"
          >
            <ArrowRightLeft className="w-4 h-4" />
            + કન્ટ્રા વાઉચર (Contra)
          </button>
          <button
            onClick={() => onOpenModal('GENERAL')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-slate-900 transition"
          >
            <FileText className="w-4 h-4" />
            + જર્નલ / હવાલા વાઉચર
          </button>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={voucherFilterType}
            onChange={(e) => setVoucherFilterType(e.target.value)}
            className="px-3 py-1.5 border rounded-xl bg-slate-50 font-bold text-slate-700"
          >
            <option value="ALL">બધા વાઉચર (All Vouchers)</option>
            <option value="RECEIPT">આવક (Receipt)</option>
            <option value="PAYMENT">ચુકવણી (Payment)</option>
            <option value="CONTRA">કન્ટ્રા (Contra)</option>
            <option value="ADJUSTMENT">હવાલા (Adjustment)</option>
            <option value="GENERAL">સામાન્ય જર્નલ (General)</option>
            <option value="REVERSAL">રિવર્સલ (Reversal)</option>
          </select>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-700">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">તારીખ</th>
                <th className="py-3 px-4">વાઉચર નં.</th>
                <th className="py-3 px-4">પ્રકાર</th>
                <th className="py-3 px-4">વિગત (Narration)</th>
                <th className="py-3 px-4">સંદર્ભ નં.</th>
                <th className="py-3 px-4 text-right">રકમ (₹)</th>
                <th className="py-3 px-4">સ્થિતિ</th>
                <th className="py-3 px-4 text-center">ક્રિયાઓ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vouchers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    કોઈ વાઉચર એન્ટ્રી મળી નથી
                  </td>
                </tr>
              ) : (
                vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-medium">
                      {new Date(v.entryDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                      {v.entryNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {v.entryType}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate font-medium text-slate-800">
                      {v.narration}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {v.referenceNumber || '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900 text-sm">
                      {formatINR(v.totalDebit, locale)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          v.status === 'POSTED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : v.status === 'REVERSED'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onViewVoucher(v)}
                          title="વિગત જુઓ"
                          className="p-1 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {v.status === 'POSTED' && (
                          <>
                            <button
                              onClick={() => onActionVoucher({ id: v.id, action: 'reverse' })}
                              title="રિવર્સ કરો"
                              className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onActionVoucher({ id: v.id, action: 'cancel' })}
                              title="રદ કરો"
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
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
