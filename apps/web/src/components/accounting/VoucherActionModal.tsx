'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface VoucherActionModalProps {
  actionData: { id: string; action: 'reverse' | 'cancel' } | null;
  actionReason: string;
  setActionReason: (reason: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const VoucherActionModal: React.FC<VoucherActionModalProps> = ({
  actionData,
  actionReason,
  setActionReason,
  onClose,
  onConfirm,
}) => {
  if (!actionData) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-gujarati">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 text-xs">
        <h3 className="text-base font-black text-rose-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          વાઉચર {actionData.action === 'reverse' ? 'રિવર્સ' : 'રદ'} કરવાની પુષ્ટિ
        </h3>
        <p className="text-slate-600">
          આ વ્યવહાર રિવર્સ કરવાથી ખાતાઓની બાકી પુનઃ પૂર્વવત થઈ જશે. ઓડિટ ટ્રેઇલમાં આ સુધારો કાયમી સાચવવામાં આવશે.
        </p>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            {actionData.action === 'reverse' ? 'રિવર્સલનું કારણ:' : 'રદ કરવાનું કારણ:'}
          </label>
          <textarea
            required
            rows={2}
            placeholder="દા.ત. ભૂલથી ખોટા ખાતામાં એન્ટ્રી થયેલ હતી"
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
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
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-sm"
          >
            પુષ્ટિ કરો
          </button>
        </div>
      </div>
    </div>
  );
};
