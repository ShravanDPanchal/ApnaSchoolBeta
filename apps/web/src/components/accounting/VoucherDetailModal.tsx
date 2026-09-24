'use client';

import React from 'react';
import { X } from 'lucide-react';

interface VoucherDetailModalProps {
  voucher: any;
  locale: any;
  onClose: () => void;
}

export const VoucherDetailModal: React.FC<VoucherDetailModalProps> = ({
  voucher,
  locale,
  onClose,
}) => {
  if (!voucher) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-gujarati">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900 font-mono">
              {voucher.entryNumber}
            </h3>
            <p className="text-slate-500">
              પ્રકાર: {voucher.entryType} • તારીખ:{' '}
              {new Date(voucher.entryDate).toLocaleDateString('en-GB')}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <p className="font-bold text-slate-800">વિગત (Narration):</p>
          <p className="p-3 bg-slate-50 rounded-xl text-slate-700">{voucher.narration}</p>
        </div>

        <div className="space-y-2">
          <p className="font-bold text-slate-800">ખાતાવહી લાઈન્સ (Dr / Cr Breakdown):</p>
          <div className="border rounded-xl overflow-hidden divide-y divide-slate-100">
            {voucher.lines?.map((l: any, idx: number) => (
              <div
                key={idx}
                className="p-2.5 flex items-center justify-between hover:bg-slate-50"
              >
                <div>
                  <p className="font-bold text-slate-900">
                    {locale === 'gu' ? l.account?.nameGu : l.account?.nameEn}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">{l.account?.code}</p>
                </div>
                <div className="text-right font-mono font-bold">
                  {l.debitAmount > 0 && (
                    <span className="text-indigo-600">Dr ₹{l.debitAmount}</span>
                  )}
                  {l.creditAmount > 0 && (
                    <span className="text-emerald-600">Cr ₹{l.creditAmount}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-800 font-bold rounded-xl hover:bg-slate-200"
          >
            બંધ કરો
          </button>
        </div>
      </div>
    </div>
  );
};
