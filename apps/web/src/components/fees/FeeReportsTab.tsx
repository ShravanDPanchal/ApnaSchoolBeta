'use client';

import React from 'react';
import { Calendar, FileSpreadsheet } from 'lucide-react';
import { formatINR } from '@apna-school/shared-types';

interface FeeReportsTabProps {
  reportDate: string;
  setReportDate: (val: string) => void;
  dailyReport: any;
  reportMonth: number;
  setReportMonth: (val: number) => void;
  reportYear: number;
  setReportYear: (val: number) => void;
  monthlyReport: any;
}

export const FeeReportsTab: React.FC<FeeReportsTabProps> = ({
  reportDate,
  setReportDate,
  dailyReport,
  reportMonth,
  setReportMonth,
  reportYear,
  setReportYear,
  monthlyReport,
}) => {
  return (
    <div className="space-y-6 font-gujarati">
      {/* Daily Report Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              દૈનિક ફી વસૂલાત અહેવાલ (Daily Collection Report)
            </h2>
            <p className="text-xs text-slate-500">તારીખવાર આવક અને પેમેન્ટ મોડ વિશ્લેષણ</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span>તારીખ:</span>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="border rounded px-2.5 py-1.5 font-mono text-blue-700"
            />
          </div>
        </div>

        {dailyReport && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-center">
                <span className="text-[10px] text-blue-800 font-bold block">કુલ આવક (Total)</span>
                <span className="text-xl font-black text-blue-950 font-mono">
                  ₹{formatINR(dailyReport.totalAmount)}
                </span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
                <span className="text-[10px] text-emerald-800 font-bold block">રોકડ (Cash)</span>
                <span className="text-lg font-black text-emerald-950 font-mono">
                  ₹{formatINR(dailyReport.modeBreakdown?.CASH || 0)}
                </span>
              </div>
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-center">
                <span className="text-[10px] text-purple-800 font-bold block">બેંક / NEFT</span>
                <span className="text-lg font-black text-purple-950 font-mono">
                  ₹{formatINR(dailyReport.modeBreakdown?.BANK_TRANSFER || 0)}
                </span>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-center">
                <span className="text-[10px] text-amber-800 font-bold block">UPI / QR</span>
                <span className="text-lg font-black text-amber-950 font-mono">
                  ₹{formatINR(dailyReport.modeBreakdown?.UPI || 0)}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-800 font-bold block">ચેક (Cheque)</span>
                <span className="text-lg font-black text-slate-950 font-mono">
                  ₹{formatINR(dailyReport.modeBreakdown?.CHEQUE || 0)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Monthly Report Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              માસિક ફી આવક અહેવાલ (Monthly Collection Summary)
            </h2>
            <p className="text-xs text-slate-500">મહિનાવાર કુલ વસૂલાત અને હેડવાર વિતરણ</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <select
              value={reportMonth}
              onChange={(e) => setReportMonth(Number(e.target.value))}
              className="border rounded px-2.5 py-1.5"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  માસ {m}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={reportYear}
              onChange={(e) => setReportYear(Number(e.target.value))}
              className="border rounded px-2.5 py-1.5 w-20 font-mono"
            />
          </div>
        </div>

        {monthlyReport && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border rounded-xl space-y-1">
              <span className="text-xs text-slate-500 font-bold">કુલ વ્યવહારો</span>
              <p className="text-2xl font-black text-slate-900 font-mono">
                {monthlyReport.totalTransactions}
              </p>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <span className="text-xs text-emerald-800 font-bold">માસિક કુલ આવક</span>
              <p className="text-2xl font-black text-emerald-950 font-mono">
                ₹{formatINR(monthlyReport.totalCollected)}
              </p>
            </div>
            <div className="p-4 bg-slate-50 border rounded-xl space-y-2 text-xs">
              <span className="text-xs text-slate-600 font-bold block">હેડવાર વિતરણ:</span>
              {Object.entries(monthlyReport.headBreakdown || {}).map(([head, val]: [string, any]) => (
                <div key={head} className="flex justify-between border-b pb-1">
                  <span>{head}:</span>
                  <b className="font-mono">₹{formatINR(val)}</b>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
