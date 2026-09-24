'use client';

import React, { useState, useEffect } from 'react';
import { ReceiptIndianRupee } from 'lucide-react';
import { formatINR, PaymentMode } from '@apna-school/shared-types';
import { fetchApi } from '@/lib/api-client';

interface CollectFeeModalProps {
  students: any[];
  accounts: any[];
  academicYearId?: string;
  defaultDepositAccountId: string;
  locale: any;
  onClose: () => void;
  onSuccess: (receiptPaymentId: string) => void;
}

export const CollectFeeModal: React.FC<CollectFeeModalProps> = ({
  students,
  accounts,
  academicYearId,
  defaultDepositAccountId,
  locale,
  onClose,
  onSuccess,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentDues, setStudentDues] = useState<any[]>([]);
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, number>>({});
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(PaymentMode.CASH);
  const [depositAccountId, setDepositAccountId] = useState(defaultDepositAccountId);
  const [referenceNo, setReferenceNo] = useState('');
  const [bankName, setBankName] = useState('');
  const [paymentDate, setPaymentDate] = useState('2026-09-10');
  const [savingPayment, setSavingPayment] = useState(false);

  useEffect(() => {
    if (!depositAccountId && defaultDepositAccountId) {
      setDepositAccountId(defaultDepositAccountId);
    }
  }, [defaultDepositAccountId, depositAccountId]);

  useEffect(() => {
    if (!selectedStudentId) {
      setStudentDues([]);
      setPaymentAmounts({});
      return;
    }
    async function loadStudentDues() {
      try {
        const res = await fetchApi(`/fees/student/${selectedStudentId}`);
        if (res.success) {
          setStudentDues(res.data);
          const initialAmounts: Record<string, number> = {};
          for (const d of res.data) {
            if (d.status !== 'PAID') {
              initialAmounts[d.id] = Math.round((d.netAmount - d.paidAmount) * 100) / 100;
            }
          }
          setPaymentAmounts(initialAmounts);
        }
      } catch (e: any) {
        // Silently handled
      }
    }
    loadStudentDues();
  }, [selectedStudentId]);

  const totalPayableAmount = Object.values(paymentAmounts).reduce(
    (sum, val) => sum + (Number(val) || 0),
    0
  );

  const handleCollectFee = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemsToPay = Object.entries(paymentAmounts)
      .filter(([_, amt]) => Number(amt) > 0)
      .map(([sfId, amt]) => ({ studentFeeId: sfId, amount: Number(amt) }));

    if (itemsToPay.length === 0) {
      alert('કૃપા કરીને ચૂકવણી માટે ઓછામાં ઓછી એક રકમ દાખલ કરો.');
      return;
    }

    setSavingPayment(true);
    try {
      const res = await fetchApi('/fees/collect', {
        method: 'POST',
        body: JSON.stringify({
          studentId: selectedStudentId,
          academicYearId,
          paymentDate,
          paymentMode,
          depositAccountId,
          referenceNo: referenceNo || null,
          bankName: bankName || null,
          items: itemsToPay,
        }),
      });

      if (res.success) {
        onSuccess(res.data.id);
      }
    } catch (err: any) {
      alert(err.message || 'Fee collection failed');
    } finally {
      setSavingPayment(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ReceiptIndianRupee className="w-5 h-5 text-blue-600" />
              ફી સ્વીકારો (Fee Collection)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">વિદ્યાર્થી પસંદ કરો અને આંશિક કે પૂર્ણ ફી સ્વીકારો</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleCollectFee} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Student Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">વિદ્યાર્થી પસંદ કરો *</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-medium"
            >
              <option value="">-- વિદ્યાર્થી પસંદ કરો --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.grNumber} - {s.firstNameGu} {s.lastNameGu} ({s.firstNameEn} {s.lastNameEn})
                </option>
              ))}
            </select>
          </div>

          {/* Student Dues List */}
          {studentDues.length > 0 && (
            <div className="border rounded-xl p-3 bg-slate-50 space-y-2">
              <p className="font-bold text-slate-700 text-[11px]">બાકી ફી વિગતો (Dues & Partial Payments):</p>
              <div className="space-y-2">
                {studentDues.map((d) => {
                  const remaining = Math.round((d.netAmount - d.paidAmount) * 100) / 100;
                  return (
                    <div key={d.id} className="flex items-center justify-between bg-white p-2.5 rounded-lg border">
                      <div>
                        <p className="font-bold text-slate-900">
                          {locale === 'gu' ? d.feeStructure.feeHead.nameGu : d.feeStructure.feeHead.nameEn}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          મૂળ રકમ: ₹{formatINR(d.amount)} • બાકી: <b className="text-rose-700 font-mono">₹{formatINR(remaining)}</b>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold">રકમ (₹):</span>
                        <input
                          type="number"
                          step="1"
                          max={remaining}
                          value={paymentAmounts[d.id] ?? ''}
                          onChange={(e) => setPaymentAmounts({ ...paymentAmounts, [d.id]: Number(e.target.value) })}
                          className="w-24 border rounded px-2 py-1 font-mono font-bold text-blue-700 text-right"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment Mode & Deposit Account */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">ચુકવણી પદ્ધતિ *</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
              >
                <option value={PaymentMode.CASH}>રોકડ (Cash)</option>
                <option value={PaymentMode.BANK_TRANSFER}>બેંક ટ્રાન્સફર (NEFT/RTGS)</option>
                <option value={PaymentMode.UPI}>UPI (ક્યૂઆર કોડ)</option>
                <option value={PaymentMode.CHEQUE}>ચેક (Cheque)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">જમા ખાતું (Deposit Account) *</label>
              <select
                value={depositAccountId}
                onChange={(e) => setDepositAccountId(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
              >
                {accounts
                  .filter((a) => a.isCashAccount || a.isBankAccount)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nameGu} ({a.nameEn})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Reference No / Cheque details */}
          {paymentMode !== PaymentMode.CASH && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">રેફરન્સ / ટ્રાન્ઝેક્શન / ચેક નં</label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  placeholder="UTR / UPI Ref / Cheque No"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">બેંકનું નામ (જો ચેક હોય તો)</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="SBI, HDFC, BOB"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          )}

          {/* Total Summary */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between font-bold text-sm">
            <span>કુલ ચૂકવવાપાત્ર રકમ (Total Payable):</span>
            <span className="text-xl text-blue-900 font-mono">₹{formatINR(totalPayableAmount)}</span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50"
            >
              રદ કરો
            </button>
            <button
              type="submit"
              disabled={savingPayment || totalPayableAmount <= 0}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md disabled:opacity-50"
            >
              {savingPayment ? 'ચૂકવણી થઈ રહી છે...' : 'ફી સ્વીકારો & રસીદ બનાવો'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
