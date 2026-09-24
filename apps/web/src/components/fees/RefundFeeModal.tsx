'use client';

import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';

interface RefundFeeModalProps {
  refundPaymentId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const RefundFeeModal: React.FC<RefundFeeModalProps> = ({
  refundPaymentId,
  onClose,
  onSuccess,
}) => {
  const [refundReason, setRefundReason] = useState('');
  const [refunding, setRefunding] = useState(false);

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundPaymentId || !refundReason) return;
    setRefunding(true);
    try {
      const res = await fetchApi('/fees/refund', {
        method: 'POST',
        body: JSON.stringify({
          feePaymentId: refundPaymentId,
          reason: refundReason,
        }),
      });
      if (res.success) {
        onSuccess();
      }
    } catch (err: any) {
      alert(err.message || 'Refund failed');
    } finally {
      setRefunding(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-gujarati">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-200">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-rose-600" />
          ફી પાવતી રદ / પરત કરો (Refund / Cancellation)
        </h2>
        <p className="text-xs text-slate-500">
          આ પ્રક્રિયાથી વિદ્યાર્થીના ખાતામાં બાકી રકમ પુનઃસ્થાપિત થશે અને હિસાબી નામામાં રિવર્સલ એન્ટ્રી પડશે.
        </p>

        <form onSubmit={handleProcessRefund} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">રદ / પરત કરવાનું કારણ *</label>
            <textarea
              required
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="દા.ત. વાલી વિનંતી / ખોટી એન્ટ્રી સુધારણા..."
              className="w-full border rounded-lg p-2.5 text-slate-800"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg font-bold text-slate-700"
            >
              રદ કરો
            </button>
            <button
              type="submit"
              disabled={refunding}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow disabled:opacity-50"
            >
              {refunding ? 'પ્રક્રિયા ચાલુ છે...' : 'રિવર્સ / પરત કરો'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
