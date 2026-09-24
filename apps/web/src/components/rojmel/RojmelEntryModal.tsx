'use client';

import React from 'react';
import { BookOpenCheck, X } from 'lucide-react';
import { RojmelEntryType } from '@apna-school/shared-types';

interface RojmelEntryModalProps {
  accounts: any[];
  entryForm: {
    entryType: RojmelEntryType | 'CONTRA';
    accountId: string;
    paymentAccountId: string;
    amount: string;
    paymentMode: any;
    narration: string;
    voucherNumber: string;
  };
  setEntryForm: React.Dispatch<
    React.SetStateAction<{
      entryType: RojmelEntryType | 'CONTRA';
      accountId: string;
      paymentAccountId: string;
      amount: string;
      paymentMode: any;
      narration: string;
      voucherNumber: string;
    }>
  >;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const RojmelEntryModal: React.FC<RojmelEntryModalProps> = ({
  accounts,
  entryForm,
  setEntryForm,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-gujarati text-xs">
        <div className="px-6 py-4 bg-amber-700 text-white flex items-center justify-between">
          <h2 className="text-base font-bold flex items-center gap-2">
            <BookOpenCheck className="w-5 h-5" />
            નવી રોજમેળ એન્ટ્રી (New Transaction)
          </h2>
          <button onClick={onClose} className="text-amber-100 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {/* Type Selection */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">એન્ટ્રી પ્રકાર (Entry Side)</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setEntryForm({ ...entryForm, entryType: RojmelEntryType.JAMA })}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                  entryForm.entryType === RojmelEntryType.JAMA
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                જમા (આવક)
              </button>
              <button
                type="button"
                onClick={() => setEntryForm({ ...entryForm, entryType: RojmelEntryType.UDHAR })}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                  entryForm.entryType === RojmelEntryType.UDHAR
                    ? 'bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                ઉધાર (ખર્ચ)
              </button>
              <button
                type="button"
                onClick={() => setEntryForm({ ...entryForm, entryType: 'CONTRA' })}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                  entryForm.entryType === 'CONTRA'
                    ? 'bg-indigo-50 border-indigo-400 text-indigo-800 ring-2 ring-indigo-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                કોન્ટ્રા (બેંક ફેરબદલ)
              </button>
            </div>
          </div>

          {/* Account Head */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">ખાતાનું નામ (Account Head)</label>
            <select
              required
              value={entryForm.accountId}
              onChange={(e) => setEntryForm({ ...entryForm, accountId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
            >
              {accounts
                .filter((a) =>
                  entryForm.entryType === 'CONTRA'
                    ? a.isCashAccount || a.isBankAccount
                    : !a.isCashAccount && !a.isBankAccount
                )
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} - {a.nameGu} ({a.nameEn})
                  </option>
                ))}
            </select>
          </div>

          {/* Amount & Payment Account */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">રકમ (Amount ₹)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="1500.00"
                value={entryForm.amount}
                onChange={(e) => setEntryForm({ ...entryForm, amount: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">ચુકવણી ખાતું (Payment Account)</label>
              <select
                value={entryForm.paymentAccountId}
                onChange={(e) => setEntryForm({ ...entryForm, paymentAccountId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
              >
                {accounts
                  .filter((a) => a.isCashAccount || a.isBankAccount)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nameGu}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Narration */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">વિગત / વર્ણન (Narration)</label>
            <input
              type="text"
              required
              placeholder="દા.ત. વિદ્યાર્થી ટ્યુશન ફી જમા"
              value={entryForm.narration}
              onChange={(e) => setEntryForm({ ...entryForm, narration: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Voucher Number */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">વાઉચર નં. (Voucher No - Optional)</label>
            <input
              type="text"
              placeholder="VCH-2026-001"
              value={entryForm.voucherNumber}
              onChange={(e) => setEntryForm({ ...entryForm, voucherNumber: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg font-mono"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-bold"
            >
              રદ કરો
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-md"
            >
              રોજમેળમાં સાચવો (Save Entry)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
