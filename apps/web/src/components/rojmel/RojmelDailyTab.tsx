'use client';

import React from 'react';
import {
  Calendar,
  PlusCircle,
  Wallet,
  Building2,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { formatINR, RojmelEntryType, RojmelDayViewDto } from '@apna-school/shared-types';

interface RojmelDailyTabProps {
  date: string;
  setDate: (date: string) => void;
  dailyData: RojmelDayViewDto | null;
  accounts: any[];
  locale: any;
  user: any;
  onRefresh: () => void;
  quickType: RojmelEntryType;
  setQuickType: (type: RojmelEntryType) => void;
  quickAccountId: string;
  setQuickAccountId: (id: string) => void;
  quickAmount: string;
  setQuickAmount: (amt: string) => void;
  quickNarration: string;
  setQuickNarration: (narr: string) => void;
  quickSubmitting: boolean;
  onQuickSubmit: (e: React.FormEvent) => void;
}

export const RojmelDailyTab: React.FC<RojmelDailyTabProps> = ({
  date,
  setDate,
  dailyData,
  accounts,
  locale,
  user,
  onRefresh,
  quickType,
  setQuickType,
  quickAccountId,
  setQuickAccountId,
  quickAmount,
  setQuickAmount,
  quickNarration,
  setQuickNarration,
  quickSubmitting,
  onQuickSubmit,
}) => {
  return (
    <div className="space-y-6 font-gujarati">
      {/* Quick Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 px-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-600" />
            તારીખ પસંદ કરો:
          </span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-amber-50/70 border border-amber-300 rounded-lg px-3 py-1 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            નાણાકીય વર્ષ:{' '}
            <strong className="text-slate-800 font-mono">
              {dailyData?.financialYearName || '2026-27'}
            </strong>
          </span>
          <button
            onClick={onRefresh}
            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
            title="રિફ્રેશ કરો"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Inline Entry Strip for School Clerk */}
      <form
        onSubmit={onQuickSubmit}
        className="bg-amber-50/60 border-2 border-dashed border-amber-300 p-3.5 rounded-2xl flex flex-wrap items-center gap-3 print:hidden text-xs"
      >
        <span className="font-black text-amber-900 flex items-center gap-1">
          ⚡ ઝડપી રોકડ નોંધણી:
        </span>

        <div className="flex items-center gap-1 bg-white rounded-lg p-0.5 border border-amber-300">
          <button
            type="button"
            onClick={() => setQuickType(RojmelEntryType.JAMA)}
            className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
              quickType === RojmelEntryType.JAMA
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600'
            }`}
          >
            જમા (આવક)
          </button>
          <button
            type="button"
            onClick={() => setQuickType(RojmelEntryType.UDHAR)}
            className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
              quickType === RojmelEntryType.UDHAR
                ? 'bg-rose-600 text-white'
                : 'text-slate-600'
            }`}
          >
            ઉધાર (ખર્ચ)
          </button>
        </div>

        <select
          value={quickAccountId}
          onChange={(e) => setQuickAccountId(e.target.value)}
          className="bg-white border border-amber-300 rounded-lg px-2.5 py-1 text-slate-800 font-bold focus:outline-none max-w-[180px]"
        >
          {accounts
            .filter((a) => !a.isCashAccount && !a.isBankAccount)
            .map((a) => (
              <option key={a.id} value={a.id}>
                {a.nameGu}
              </option>
            ))}
        </select>

        <input
          type="number"
          step="0.01"
          placeholder="રકમ ₹"
          value={quickAmount}
          onChange={(e) => setQuickAmount(e.target.value)}
          className="bg-white border border-amber-300 rounded-lg px-2.5 py-1 w-24 font-mono font-bold text-slate-800 focus:outline-none"
        />

        <input
          type="text"
          placeholder="વિગત / વર્ણન (દા.ત. સ્ટેશનરી ખર્ચ)"
          value={quickNarration}
          onChange={(e) => setQuickNarration(e.target.value)}
          className="bg-white border border-amber-300 rounded-lg px-2.5 py-1 flex-1 min-w-[200px] text-slate-800 focus:outline-none"
        />

        <button
          type="submit"
          disabled={quickSubmitting}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-1 rounded-lg shadow-sm transition-all flex items-center gap-1"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>નોંધો (Save)</span>
        </button>
      </form>

      {/* Balance Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500">શરૂઆતની રોકડ સિલક</p>
            <p className="text-lg font-black text-slate-900 font-mono">
              {formatINR(dailyData?.openingCashBalance || 0, locale)}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500">શરૂઆતની બેંક સિલક</p>
            <p className="text-lg font-black text-slate-900 font-mono">
              {formatINR(dailyData?.openingBankBalance || 0, locale)}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500">આખર રોકડ સિલક</p>
            <p className="text-lg font-black text-emerald-700 font-mono">
              {formatINR(dailyData?.closingCashBalance || 0, locale)}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500">આખરો મેળવણી સ્થિતિ</p>
            <div className="mt-1">
              {dailyData?.isBalanced ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  આખરો મેળ મળી ગયો
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-300 px-2.5 py-1 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  તફાવત: ₹{dailyData?.difference}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Authentic Statutory 2-Column Deshi Nama Ledger */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-md overflow-hidden print:border-none print:shadow-none">
        {/* Print Header */}
        <div className="hidden print:block text-center p-4 border-b-2 border-black">
          <h1 className="text-2xl font-black text-black">
            {user?.schoolNameGu || 'શ્રી સરસ્વતી વિદ્યા મંદિર'}
          </h1>
          <p className="text-xs text-gray-700 mt-0.5">
            ટ્રસ્ટ રજિસ્ટ્રેશન નં: F/1458/AHMEDABAD • સ્વનિર્ભર પ્રાથમિક અને માધ્યમિક શાળા
          </p>
          <h2 className="text-base font-bold text-black mt-2 underline">
            શ્રી રોજમેળ પત્રક (દેશી નામા પદ્ધતિ)
          </h2>
          <p className="text-xs text-black font-mono font-bold mt-0.5">
            રોજમેળ તારીખ: {date} • નાણાકીય વર્ષ:{' '}
            {dailyData?.financialYearName || '2026-27'}
          </p>
        </div>

        {/* Banner */}
        <div className="bg-amber-700 text-white py-2.5 px-6 text-center font-bold text-sm tracking-wide flex items-center justify-between border-b border-amber-800 print:bg-black print:text-white">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full print:hidden"></span>
            જમા બાજુ (JAMA - આવક વિગત)
          </span>
          <span className="font-mono text-xs bg-amber-800/80 px-3 py-0.5 rounded-full print:hidden">
            શ્રી રોજમેળ તારીખ: {date}
          </span>
          <span className="flex items-center gap-1.5">
            ઉધાર બાજુ (UDHAR - જાવક/ખર્ચ વિગત)
            <span className="w-2.5 h-2.5 bg-rose-400 rounded-full print:hidden"></span>
          </span>
        </div>

        {/* 2-Column Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x-2 divide-slate-300 text-xs">
          {/* LEFT: JAMA */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="bg-amber-50/80 p-2 px-3 font-black text-amber-950 border-b border-slate-200 grid grid-cols-12 gap-1 text-[11px]">
                <span className="col-span-2">ખા.પા.</span>
                <span className="col-span-5">ખાતાનું નામ અને વિગત</span>
                <span className="col-span-2 text-right">રોકડ (₹)</span>
                <span className="col-span-3 text-right">બેંક / કુલ (₹)</span>
              </div>

              <div className="divide-y divide-slate-100">
                {/* Opening Cash */}
                <div className="p-2.5 px-3 grid grid-cols-12 gap-1 items-center bg-slate-50/60 font-bold">
                  <span className="col-span-2 font-mono text-[10px] text-slate-500">-</span>
                  <div className="col-span-5">
                    <p className="text-slate-900">શ્રી રોકડ સિલક ખાતું</p>
                    <p className="text-[10px] text-slate-400 font-normal">ગત દિવસની શરૂઆતની રોકડ</p>
                  </div>
                  <span className="col-span-2 text-right font-mono text-slate-900">
                    {dailyData?.openingCashBalance ? dailyData.openingCashBalance.toFixed(2) : '0.00'}
                  </span>
                  <span className="col-span-3 text-right font-mono text-slate-900">
                    {dailyData?.openingCashBalance ? dailyData.openingCashBalance.toFixed(2) : '0.00'}
                  </span>
                </div>

                {/* Opening Bank */}
                <div className="p-2.5 px-3 grid grid-cols-12 gap-1 items-center bg-slate-50/60 font-bold">
                  <span className="col-span-2 font-mono text-[10px] text-slate-500">-</span>
                  <div className="col-span-5">
                    <p className="text-slate-900">શ્રી બેંક સિલક ખાતું</p>
                    <p className="text-[10px] text-slate-400 font-normal">ગત દિવસની શરૂઆતની બેંક સિલક</p>
                  </div>
                  <span className="col-span-2 text-right font-mono text-slate-400">-</span>
                  <span className="col-span-3 text-right font-mono text-slate-900">
                    {dailyData?.openingBankBalance ? dailyData.openingBankBalance.toFixed(2) : '0.00'}
                  </span>
                </div>

                {/* Jama Entries */}
                {dailyData?.jamaEntries && dailyData.jamaEntries.length > 0 ? (
                  dailyData.jamaEntries.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 px-3 grid grid-cols-12 gap-1 items-start hover:bg-amber-50/30 transition-colors"
                    >
                      <span className="col-span-2 font-mono text-[10px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded text-center self-start">
                        {item.khataPanoNo}
                      </span>
                      <div className="col-span-5">
                        <p className="font-bold text-slate-900">
                          {locale === 'gu' ? item.accountNameGu : item.accountNameEn}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {item.narration || 'આવક નોંધણી'}{' '}
                          {item.bankName ? `[${item.bankName}]` : ''}
                        </p>
                      </div>
                      <span className="col-span-2 text-right font-mono font-bold text-emerald-700">
                        {item.cashAmount > 0 ? item.cashAmount.toFixed(2) : '-'}
                      </span>
                      <span className="col-span-3 text-right font-mono font-bold text-emerald-700">
                        {item.bankAmount > 0
                          ? item.bankAmount.toFixed(2)
                          : item.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400 text-xs italic">
                    આજના દિવસે કોઈ નવી જમા આવક નોંધાયેલ નથી.
                  </div>
                )}
              </div>
            </div>

            {/* Left Footer */}
            <div className="border-t-2 border-slate-300 bg-amber-50/40">
              <div className="p-2 px-3 grid grid-cols-12 gap-1 text-[11px] font-bold text-slate-700 border-b border-slate-200">
                <span className="col-span-7">કુલ આજની જમા આવક (Receipts)</span>
                <span className="col-span-2 text-right font-mono text-emerald-700">
                  {dailyData?.totalCashReceipts ? dailyData.totalCashReceipts.toFixed(2) : '0.00'}
                </span>
                <span className="col-span-3 text-right font-mono text-emerald-700">
                  {dailyData?.totalReceipts ? dailyData.totalReceipts.toFixed(2) : '0.00'}
                </span>
              </div>

              <div className="p-3 px-3.5 bg-amber-100/70 grid grid-cols-12 gap-1 items-center font-black text-slate-900 text-sm">
                <span className="col-span-7 font-gujarati text-amber-950">
                  કુલ જમા બાજુ સરવાળો (Aakharo Total)
                </span>
                <span className="col-span-5 text-right font-mono text-base text-blue-950">
                  {formatINR(dailyData?.totalJamaAmount || 0, locale)}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: UDHAR */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="bg-amber-50/80 p-2 px-3 font-black text-amber-950 border-b border-slate-200 grid grid-cols-12 gap-1 text-[11px]">
                <span className="col-span-2">ખા.પા.</span>
                <span className="col-span-5">ખાતાનું નામ અને વિગત</span>
                <span className="col-span-2 text-right">રોકડ (₹)</span>
                <span className="col-span-3 text-right">બેંક / કુલ (₹)</span>
              </div>

              <div className="divide-y divide-slate-100">
                {/* Udhar Entries */}
                {dailyData?.udharEntries && dailyData.udharEntries.length > 0 ? (
                  dailyData.udharEntries.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 px-3 grid grid-cols-12 gap-1 items-start hover:bg-rose-50/30 transition-colors"
                    >
                      <span className="col-span-2 font-mono text-[10px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded text-center self-start">
                        {item.khataPanoNo}
                      </span>
                      <div className="col-span-5">
                        <p className="font-bold text-slate-900">
                          {locale === 'gu' ? item.accountNameGu : item.accountNameEn}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {item.narration || 'ખર્ચ ચુકવણી'}{' '}
                          {item.voucherNumber ? `(વાઉચર: ${item.voucherNumber})` : ''}
                        </p>
                      </div>
                      <span className="col-span-2 text-right font-mono font-bold text-rose-700">
                        {item.cashAmount > 0 ? item.cashAmount.toFixed(2) : '-'}
                      </span>
                      <span className="col-span-3 text-right font-mono font-bold text-rose-700">
                        {item.bankAmount > 0
                          ? item.bankAmount.toFixed(2)
                          : item.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400 text-xs italic">
                    આજના દિવસે કોઈ ઉધાર ખર્ચ નોંધાયેલ નથી.
                  </div>
                )}

                {/* Closing Cash */}
                <div className="p-2.5 px-3 grid grid-cols-12 gap-1 items-center bg-slate-50/60 font-bold border-t border-slate-200">
                  <span className="col-span-2 font-mono text-[10px] text-slate-500">-</span>
                  <div className="col-span-5">
                    <p className="text-slate-900">શ્રી રોકડ સિલક ખાતું</p>
                    <p className="text-[10px] text-slate-400 font-normal">આજના દિવસની આખર રોકડ સિલક</p>
                  </div>
                  <span className="col-span-2 text-right font-mono text-slate-900">
                    {dailyData?.closingCashBalance ? dailyData.closingCashBalance.toFixed(2) : '0.00'}
                  </span>
                  <span className="col-span-3 text-right font-mono text-slate-900">
                    {dailyData?.closingCashBalance ? dailyData.closingCashBalance.toFixed(2) : '0.00'}
                  </span>
                </div>

                {/* Closing Bank */}
                <div className="p-2.5 px-3 grid grid-cols-12 gap-1 items-center bg-slate-50/60 font-bold">
                  <span className="col-span-2 font-mono text-[10px] text-slate-500">-</span>
                  <div className="col-span-5">
                    <p className="text-slate-900">શ્રી બેંક સિલક ખાતું</p>
                    <p className="text-[10px] text-slate-400 font-normal">આજના દિવસની આખર બેંક સિલક</p>
                  </div>
                  <span className="col-span-2 text-right font-mono text-slate-400">-</span>
                  <span className="col-span-3 text-right font-mono text-slate-900">
                    {dailyData?.closingBankBalance ? dailyData.closingBankBalance.toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Footer */}
            <div className="border-t-2 border-slate-300 bg-amber-50/40">
              <div className="p-2 px-3 grid grid-cols-12 gap-1 text-[11px] font-bold text-slate-700 border-b border-slate-200">
                <span className="col-span-7">કુલ આજનો ઉધાર ખર્ચ (Payments)</span>
                <span className="col-span-2 text-right font-mono text-rose-700">
                  {dailyData?.totalCashPayments ? dailyData.totalCashPayments.toFixed(2) : '0.00'}
                </span>
                <span className="col-span-3 text-right font-mono text-rose-700">
                  {dailyData?.totalPayments ? dailyData.totalPayments.toFixed(2) : '0.00'}
                </span>
              </div>

              <div className="p-3 px-3.5 bg-amber-100/70 grid grid-cols-12 gap-1 items-center font-black text-slate-900 text-sm">
                <span className="col-span-7 font-gujarati text-amber-950">
                  કુલ ઉધાર બાજુ સરવાળો (Aakharo Total)
                </span>
                <span className="col-span-5 text-right font-mono text-base text-blue-950">
                  {formatINR(dailyData?.totalUdharAmount || 0, locale)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Print Signature Blocks */}
        <div className="hidden print:grid grid-cols-4 gap-4 p-8 pt-12 border-t-2 border-black text-center text-xs font-bold text-black">
          <div>
            <div className="border-b border-black mb-1.5 h-12"></div>
            <p>લખનાર કારકુન</p>
            <p className="text-[10px] font-normal text-gray-600">(Clerk Signature)</p>
          </div>
          <div>
            <div className="border-b border-black mb-1.5 h-12"></div>
            <p>હિસાબનીશ</p>
            <p className="text-[10px] font-normal text-gray-600">(Accountant Signature)</p>
          </div>
          <div>
            <div className="border-b border-black mb-1.5 h-12"></div>
            <p>આચાર્યશ્રી / મુખ્યાધ્યાપક</p>
            <p className="text-[10px] font-normal text-gray-600">(Principal & Stamp)</p>
          </div>
          <div>
            <div className="border-b border-black mb-1.5 h-12"></div>
            <p>ટ્રસ્ટી / મંત્રીશ્રી</p>
            <p className="text-[10px] font-normal text-gray-600">(Trustee / Secretary)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
