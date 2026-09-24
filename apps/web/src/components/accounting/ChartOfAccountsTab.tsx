'use client';

import React from 'react';
import { formatINR } from '@apna-school/shared-types';

interface ChartOfAccountsTabProps {
  accounts: any[];
  bankAccounts: any[];
  cashAccounts: any[];
  accountGroups: any[];
  locale: any;
}

export const ChartOfAccountsTab: React.FC<ChartOfAccountsTabProps> = ({
  accounts,
  bankAccounts,
  cashAccounts,
  accountGroups,
  locale,
}) => {
  return (
    <div className="space-y-4 font-gujarati">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">કુલ ખાતા (Total Heads)</p>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{accounts.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">બેંક ખાતાઓ (Bank A/cs)</p>
          <p className="text-2xl font-black text-indigo-600 mt-1 font-mono">{bankAccounts.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">રોકડ ખાતાઓ (Cash A/cs)</p>
          <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">{cashAccounts.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold">ખાતા જૂથો (Groups)</p>
          <p className="text-2xl font-black text-slate-700 mt-1 font-mono">{accountGroups.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="font-black text-slate-800 text-sm">
            શાળા હિસાબી ખાતાવહી ચાર્ટ (Master Chart of Accounts)
          </span>
          <div className="text-xs text-slate-500">
            નાણાકીય વર્ષ મુજબ ચાલુ સિલક દર્શાવેલ છે
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-700">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">કોડ</th>
                <th className="py-3 px-4">ખાતાનું નામ (Account Name)</th>
                <th className="py-3 px-4">મુખ્ય જૂથ (Group)</th>
                <th className="py-3 px-4">પ્રકાર (Type)</th>
                <th className="py-3 px-4">સ્વભાવ (Nature)</th>
                <th className="py-3 px-4 text-right">શરૂઆતની બાકી (₹)</th>
                <th className="py-3 px-4 text-right">ચાલુ બાકી (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">{acc.code}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">
                      {locale === 'gu' ? acc.nameGu : acc.nameEn}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {locale === 'gu' ? acc.nameEn : acc.nameGu}
                      {acc.isBankAccount && acc.bankAccountNumber
                        ? ` • A/C: ${acc.bankAccountNumber}`
                        : ''}
                    </p>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-600">
                    {acc.accountGroup
                      ? locale === 'gu'
                        ? acc.accountGroup.nameGu
                        : acc.accountGroup.nameEn
                      : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        acc.accountType === 'ASSET'
                          ? 'bg-blue-50 text-blue-700'
                          : acc.accountType === 'LIABILITY'
                          ? 'bg-amber-50 text-amber-700'
                          : acc.accountType === 'INCOME'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {acc.accountType}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-600">
                    {acc.accountNature === 'DEBIT' ? 'ઉધાર (DR)' : 'જમા (CR)'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    {formatINR(acc.openingBalance, locale)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-black text-slate-900 text-sm">
                    {formatINR(acc.currentBalance, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
