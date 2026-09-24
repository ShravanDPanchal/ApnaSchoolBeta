'use client';

import React from 'react';
import { Receipt, CreditCard, ArrowRightLeft, FileText, X } from 'lucide-react';
import { PaymentMode, formatINR } from '@apna-school/shared-types';

interface CreateVoucherModalProps {
  voucherModal: 'RECEIPT' | 'PAYMENT' | 'CONTRA' | 'GENERAL' | null;
  accounts: any[];
  cashAccounts: any[];
  receiptForm: any;
  setReceiptForm: React.Dispatch<React.SetStateAction<any>>;
  paymentForm: any;
  setPaymentForm: React.Dispatch<React.SetStateAction<any>>;
  contraForm: any;
  setContraForm: React.Dispatch<React.SetStateAction<any>>;
  journalLines: Array<{ accountId: string; debitAmount: number; creditAmount: number; narration?: string }>;
  setJournalLines: React.Dispatch<
    React.SetStateAction<Array<{ accountId: string; debitAmount: number; creditAmount: number; narration?: string }>>
  >;
  journalNarration: string;
  setJournalNarration: (val: string) => void;
  journalRef: string;
  setJournalRef: (val: string) => void;
  locale: any;
  onClose: () => void;
  onCreateReceipt: (e: React.FormEvent) => void;
  onCreatePayment: (e: React.FormEvent) => void;
  onCreateContra: (e: React.FormEvent) => void;
  onCreateJournal: (e: React.FormEvent) => void;
}

export const CreateVoucherModal: React.FC<CreateVoucherModalProps> = ({
  voucherModal,
  accounts,
  cashAccounts,
  receiptForm,
  setReceiptForm,
  paymentForm,
  setPaymentForm,
  contraForm,
  setContraForm,
  journalLines,
  setJournalLines,
  journalNarration,
  setJournalNarration,
  journalRef,
  setJournalRef,
  locale,
  onClose,
  onCreateReceipt,
  onCreatePayment,
  onCreateContra,
  onCreateJournal,
}) => {
  if (!voucherModal) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-gujarati">
      {/* RECEIPT */}
      {voucherModal === 'RECEIPT' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-black text-emerald-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              નવું આવક પહોંચ વાઉચર (Receipt Voucher)
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={onCreateReceipt} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">નાણાં જમા ખાતું (Dr Cash/Bank)</label>
              <select
                required
                value={receiptForm.bankOrCashAccountId}
                onChange={(e) => setReceiptForm({ ...receiptForm, bankOrCashAccountId: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl bg-white font-bold"
              >
                <option value="">-- રોકડ / બેંક ખાતું પસંદ કરો --</option>
                {accounts
                  .filter((a) => a.isCashAccount || a.isBankAccount)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nameGu} ({a.isCashAccount ? 'રોકડ' : 'બેંક'})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">આવક ખાતું / હેડ (Cr Income Account)</label>
              <select
                required
                value={receiptForm.incomeAccountId}
                onChange={(e) => setReceiptForm({ ...receiptForm, incomeAccountId: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl bg-white font-bold"
              >
                <option value="">-- આવક ખાતું પસંદ કરો --</option>
                {accounts
                  .filter(
                    (a) =>
                      a.accountType === 'INCOME' ||
                      a.accountType === 'LIABILITY' ||
                      a.accountType === 'CAPITAL_FUND'
                  )
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} - {a.nameGu}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">આવક રકમ (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="દા.ત. 25000"
                  value={receiptForm.amount}
                  onChange={(e) => setReceiptForm({ ...receiptForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">ચુકવણી માધ્યમ</label>
                <select
                  value={receiptForm.paymentMode}
                  onChange={(e) =>
                    setReceiptForm({ ...receiptForm, paymentMode: e.target.value as PaymentMode })
                  }
                  className="w-full px-3 py-2 border rounded-xl bg-white font-bold"
                >
                  <option value="BANK_TRANSFER">બેંક ટ્રાન્સફર (NEFT/RTGS)</option>
                  <option value="CASH">રોકડ (Cash)</option>
                  <option value="UPI">UPI (QR Code)</option>
                  <option value="CHEQUE">ચેક (Cheque)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">વિગત / નોંધ (Narration)</label>
              <textarea
                required
                rows={2}
                placeholder="દા.ત. સમગ્ર શિક્ષા અભિયાન હેઠળ લાઈબ્રેરી ગ્રાન્ટ જમા"
                value={receiptForm.narration}
                onChange={(e) => setReceiptForm({ ...receiptForm, narration: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl bg-white font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="સંદર્ભ / રસીદ નં."
                value={receiptForm.referenceNumber}
                onChange={(e) => setReceiptForm({ ...receiptForm, referenceNumber: e.target.value })}
                className="px-3 py-2 border rounded-xl bg-white font-mono text-xs"
              />
              <input
                type="text"
                placeholder="ચેક / UTR નં."
                value={receiptForm.chequeNumber}
                onChange={(e) => setReceiptForm({ ...receiptForm, chequeNumber: e.target.value })}
                className="px-3 py-2 border rounded-xl bg-white font-mono text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-xl text-slate-600 font-bold hover:bg-slate-50"
              >
                રદ કરો
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-sm"
              >
                આવક વાઉચર સાચવો
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PAYMENT */}
      {voucherModal === 'PAYMENT' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-black text-rose-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-rose-600" />
              નવું ચુકવણી વાઉચર (Payment Voucher)
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={onCreatePayment} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">ખર્ચ ખાતું / હેડ (Dr Expense Account)</label>
              <select
                required
                value={paymentForm.expenseAccountId}
                onChange={(e) => setPaymentForm({ ...paymentForm, expenseAccountId: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl bg-white font-bold"
              >
                <option value="">-- ખર્ચ ખાતું પસંદ કરો --</option>
                {accounts
                  .filter(
                    (a) =>
                      a.accountType === 'EXPENSE' ||
                      a.accountType === 'ASSET' ||
                      a.accountType === 'LIABILITY'
                  )
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} - {a.nameGu}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">નાણાં ચુકવણી ખાતું (Cr Cash/Bank)</label>
              <select
                required
                value={paymentForm.bankOrCashAccountId}
                onChange={(e) => setPaymentForm({ ...paymentForm, bankOrCashAccountId: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl bg-white font-bold"
              >
                <option value="">-- રોકડ / બેંક ખાતું પસંદ કરો --</option>
                {accounts
                  .filter((a) => a.isCashAccount || a.isBankAccount)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nameGu} ({a.isCashAccount ? 'રોકડ' : 'બેંક'})
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ચુકવણી રકમ (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="દા.ત. 4500"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">ચુકવણી માધ્યમ</label>
                <select
                  value={paymentForm.paymentMode}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, paymentMode: e.target.value as PaymentMode })
                  }
                  className="w-full px-3 py-2 border rounded-xl bg-white font-bold"
                >
                  <option value="CASH">રોકડ (Cash)</option>
                  <option value="BANK_TRANSFER">બેંક ટ્રાન્સફર (NEFT/RTGS)</option>
                  <option value="UPI">UPI</option>
                  <option value="CHEQUE">ચેક (Cheque)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">વિગત / નોંધ (Narration)</label>
              <textarea
                required
                rows={2}
                placeholder="દા.ત. સ્ટેશનરી અને પ્રિન્ટિંગ સામાન બિલ ચુકવણી"
                value={paymentForm.narration}
                onChange={(e) => setPaymentForm({ ...paymentForm, narration: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl bg-white font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="સંદર્ભ / બિલ નં."
                value={paymentForm.referenceNumber}
                onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                className="px-3 py-2 border rounded-xl bg-white font-mono text-xs"
              />
              <input
                type="text"
                placeholder="મેળવનારનું નામ (Payee)"
                value={paymentForm.payeeName}
                onChange={(e) => setPaymentForm({ ...paymentForm, payeeName: e.target.value })}
                className="px-3 py-2 border rounded-xl bg-white text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-xl text-slate-600 font-bold hover:bg-slate-50"
              >
                રદ કરો
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-sm"
              >
                ચુકવણી વાઉચર સાચવો
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CONTRA */}
      {voucherModal === 'CONTRA' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-black text-blue-900 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-blue-600" />
              નવું કન્ટ્રા વાઉચર (Cash/Bank Transfer Contra)
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={onCreateContra} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">આ ખાતામાંથી ઉપાડ્યા (From Account - Credit)</label>
              <select
                required
                value={contraForm.fromAccountId}
                onChange={(e) => setContraForm({ ...contraForm, fromAccountId: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl bg-white font-bold"
              >
                <option value="">-- ખાતું પસંદ કરો --</option>
                {accounts
                  .filter((a) => a.isCashAccount || a.isBankAccount)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nameGu} ({a.isCashAccount ? 'રોકડ' : 'બેંક'})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">આ ખાતામાં જમા કર્યા (To Account - Debit)</label>
              <select
                required
                value={contraForm.toAccountId}
                onChange={(e) => setContraForm({ ...contraForm, toAccountId: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl bg-white font-bold"
              >
                <option value="">-- ખાતું પસંદ કરો --</option>
                {accounts
                  .filter(
                    (a) =>
                      (a.isCashAccount || a.isBankAccount) && a.id !== contraForm.fromAccountId
                  )
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nameGu} ({a.isCashAccount ? 'રોકડ' : 'બેંક'})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ટ્રાન્સફર રકમ (₹)</label>
              <input
                type="number"
                required
                placeholder="દા.ત. 15000"
                value={contraForm.amount}
                onChange={(e) => setContraForm({ ...contraForm, amount: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl bg-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">વિગત / નોંધ (Narration)</label>
              <textarea
                required
                rows={2}
                placeholder="દા.ત. ફી કલેક્શનની રોકડ રકમ બેંકમાં જમા કરાવી"
                value={contraForm.narration}
                onChange={(e) => setContraForm({ ...contraForm, narration: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl bg-white font-medium"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-xl text-slate-600 font-bold hover:bg-slate-50"
              >
                રદ કરો
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-sm"
              >
                કન્ટ્રા વાઉચર સાચવો
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GENERAL */}
      {voucherModal === 'GENERAL' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              નવી જર્નલ / હવાલા એન્ટ્રી (General Journal Entry)
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={onCreateJournal} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="સંદર્ભ / વાઉચર નં."
                value={journalRef}
                onChange={(e) => setJournalRef(e.target.value)}
                className="px-3 py-2 border rounded-xl bg-white font-mono"
              />
              <input
                type="text"
                required
                placeholder="મુખ્ય વિગત / Narration"
                value={journalNarration}
                onChange={(e) => setJournalNarration(e.target.value)}
                className="px-3 py-2 border rounded-xl bg-white font-bold"
              />
            </div>

            {/* Journal Lines */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">જર્નલ લાઈન્સ (Debit & Credit Lines):</span>
                <button
                  type="button"
                  onClick={() =>
                    setJournalLines([
                      ...journalLines,
                      { accountId: '', debitAmount: 0, creditAmount: 0, narration: '' },
                    ])
                  }
                  className="text-indigo-600 hover:text-indigo-800 font-bold"
                >
                  + લાઈન ઉમેરો
                </button>
              </div>

              <div className="space-y-2">
                {journalLines.map((line, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <select
                      required
                      value={line.accountId}
                      onChange={(e) => {
                        const updated = [...journalLines];
                        updated[idx].accountId = e.target.value;
                        setJournalLines(updated);
                      }}
                      className="flex-1 px-2.5 py-1.5 border rounded-lg bg-white font-bold text-xs"
                    >
                      <option value="">-- ખાતું પસંદ કરો --</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.code} - {a.nameGu}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="ઉધાર (Dr)"
                      value={line.debitAmount || ''}
                      onChange={(e) => {
                        const updated = [...journalLines];
                        updated[idx].debitAmount = Number(e.target.value) || 0;
                        if (updated[idx].debitAmount > 0) updated[idx].creditAmount = 0;
                        setJournalLines(updated);
                      }}
                      className="w-28 px-2.5 py-1.5 border rounded-lg bg-white font-mono font-bold text-xs"
                    />

                    <input
                      type="number"
                      placeholder="જમા (Cr)"
                      value={line.creditAmount || ''}
                      onChange={(e) => {
                        const updated = [...journalLines];
                        updated[idx].creditAmount = Number(e.target.value) || 0;
                        if (updated[idx].creditAmount > 0) updated[idx].debitAmount = 0;
                        setJournalLines(updated);
                      }}
                      className="w-28 px-2.5 py-1.5 border rounded-lg bg-white font-mono font-bold text-xs"
                    />

                    {journalLines.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setJournalLines(journalLines.filter((_, i) => i !== idx))}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Total Check */}
              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 flex items-center justify-between font-mono font-bold text-xs">
                <div>
                  <span>કુલ ઉધાર: </span>
                  <span className="text-indigo-700">
                    {formatINR(
                      journalLines.reduce((s, l) => s + (Number(l.debitAmount) || 0), 0),
                      locale
                    )}
                  </span>
                </div>
                <div>
                  <span>કુલ જમા: </span>
                  <span className="text-indigo-700">
                    {formatINR(
                      journalLines.reduce((s, l) => s + (Number(l.creditAmount) || 0), 0),
                      locale
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-xl text-slate-600 font-bold hover:bg-slate-50"
              >
                રદ કરો
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-sm"
              >
                જર્નલ એન્ટ્રી સાચવો
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
