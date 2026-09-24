'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface YearEndClosureTabProps {
  financialYears: any[];
  selectedFyId: string;
  targetNextFyId: string;
  setTargetNextFyId: (id: string) => void;
  onOpenConfirmation: () => void;
}

export const YearEndClosureTab: React.FC<YearEndClosureTabProps> = ({
  financialYears,
  selectedFyId,
  targetNextFyId,
  setTargetNextFyId,
  onOpenConfirmation,
}) => {
  return (
    <div className="space-y-4 font-gujarati">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">
              નાણાકીય વર્ષ પૂર્ણાહુતિ અને નવું વર્ષ (Year-End Closure & Rollover Wizard)
            </h2>
            <p className="text-xs text-slate-500">
              નાણાકીય વર્ષ પૂર્ણ કરી સરવૈયાની બાકીઓ (Assets, Liabilities) નવા વર્ષમાં આગળ ખેંચવા અને આવક-ખર્ચ ખાતા શૂન્ય કરવા માટે
            </p>
          </div>
        </div>

        {/* Checklist */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
          <p className="font-bold text-slate-800 text-sm">વર્ષ બંધ કરતાં પહેલાં ચકાસણી (Pre-closure Checklist):</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>કાચું સરવૈયું (Trial Balance) મેળ મળી ગયો છે.</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>બધા વાઉચરો અને ફી ની એન્ટ્રીઓ પોસ્ટ થઈ ગઈ છે.</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>રોકડ અને બેંક સિલક રોજમેળ સાથે સરખાવી લેવાઈ છે.</span>
            </div>
          </div>
        </div>

        {/* Selection Form */}
        <div className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              બંધ કરવા માટેનું ચાલુ વર્ષ (Current FY):
            </label>
            <input
              type="text"
              disabled
              value={financialYears.find((f) => f.id === selectedFyId)?.name || '2026-27'}
              className="w-full px-3.5 py-2 border rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              નવું / આગામી નાણાકીય વર્ષ (Next FY):
            </label>
            <select
              value={targetNextFyId}
              onChange={(e) => setTargetNextFyId(e.target.value)}
              className="w-full px-3.5 py-2.5 border rounded-xl bg-white text-slate-900 font-bold text-xs shadow-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- આગામી વર્ષ પસંદ કરો --</option>
              {financialYears
                .filter((f) => f.id !== selectedFyId && !f.isClosed)
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({new Date(f.startDate).getFullYear()} - {new Date(f.endDate).getFullYear()})
                  </option>
                ))}
            </select>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium">
            <p className="font-bold mb-1">મહત્વની સૂચના:</p>
            વર્ષ બંધ કર્યા પછી તે વર્ષમાં નવા વાઉચરો દાખલ થઈ શકશે નહીં. ચોખ્ખો નફો/બચત મૂડી ભંડોળ (Capital Fund) માં આપોઆપ જમા થશે.
          </div>

          <button
            onClick={onOpenConfirmation}
            disabled={!targetNextFyId}
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
          >
            વર્ષ પૂર્ણાહુતિ પ્રક્રિયા શરૂ કરો (Execute Year-End Rollover)
          </button>
        </div>
      </div>
    </div>
  );
};
