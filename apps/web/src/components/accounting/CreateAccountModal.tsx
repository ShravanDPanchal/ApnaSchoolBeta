'use client';

import React from 'react';
import { PlusCircle, X } from 'lucide-react';
import { AccountNature } from '@apna-school/shared-types';

interface CreateAccountModalProps {
  newAccount: {
    code: string;
    nameEn: string;
    nameGu: string;
    accountGroupId: string;
    accountNature: AccountNature;
    accountType: any;
    openingBalance: number;
    isCashAccount: boolean;
    isBankAccount: boolean;
    bankAccountNumber: string;
    bankIfsc: string;
  };
  setNewAccount: React.Dispatch<React.SetStateAction<any>>;
  accountGroups: any[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  newAccount,
  setNewAccount,
  accountGroups,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-gujarati">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-indigo-600" />
            નવું ખાતું ઉમેરો (Add Chart of Account Head)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">ખાતા કોડ (Code)</label>
              <input
                type="text"
                required
                placeholder="દા.ત. 4005"
                value={newAccount.code}
                onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">ખાતા જૂથ (Group)</label>
              <select
                required
                value={newAccount.accountGroupId}
                onChange={(e) => {
                  const g = accountGroups.find((x) => x.id === e.target.value);
                  setNewAccount({
                    ...newAccount,
                    accountGroupId: e.target.value,
                    accountType: g ? g.groupType : newAccount.accountType,
                  });
                }}
                className="w-full px-3 py-2 border rounded-xl bg-white font-bold"
              >
                <option value="">-- જૂથ પસંદ કરો --</option>
                {accountGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nameGu} ({g.groupType})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">ખાતાનું નામ (ગુજરાતી)</label>
              <input
                type="text"
                required
                placeholder="દા.ત. પ્રયોગશાળા ખર્ચ"
                value={newAccount.nameGu}
                onChange={(e) => setNewAccount({ ...newAccount, nameGu: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl bg-white font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Account Name (English)</label>
              <input
                type="text"
                required
                placeholder="e.g. Science Lab Expense"
                value={newAccount.nameEn}
                onChange={(e) => setNewAccount({ ...newAccount, nameEn: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl bg-white font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">સ્વભાવ (Nature)</label>
              <select
                value={newAccount.accountNature}
                onChange={(e) =>
                  setNewAccount({
                    ...newAccount,
                    accountNature: e.target.value as AccountNature,
                  })
                }
                className="w-full px-3 py-2 border rounded-xl bg-white font-bold"
              >
                <option value="DEBIT">ઉધાર (DEBIT)</option>
                <option value="CREDIT">જમા (CREDIT)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">શરૂઆતની બાકી (Opening ₹)</label>
              <input
                type="number"
                value={newAccount.openingBalance}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, openingBalance: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded-xl bg-white font-mono font-bold"
              />
            </div>
          </div>

          {/* Cash / Bank options */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAccount.isBankAccount}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, isBankAccount: e.target.checked })
                  }
                  className="rounded text-indigo-600"
                />
                <span>બેંક ખાતું છે? (Bank Account)</span>
              </label>
              <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAccount.isCashAccount}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, isCashAccount: e.target.checked })
                  }
                  className="rounded text-indigo-600"
                />
                <span>રોકડ ખાતું છે? (Cash Account)</span>
              </label>
            </div>

            {newAccount.isBankAccount && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <input
                  type="text"
                  placeholder="એકાઉન્ટ નંબર"
                  value={newAccount.bankAccountNumber}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, bankAccountNumber: e.target.value })
                  }
                  className="px-2.5 py-1.5 border rounded-lg bg-white font-mono text-xs"
                />
                <input
                  type="text"
                  placeholder="IFSC કોડ"
                  value={newAccount.bankIfsc}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, bankIfsc: e.target.value })
                  }
                  className="px-2.5 py-1.5 border rounded-lg bg-white font-mono text-xs uppercase"
                />
              </div>
            )}
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
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-sm"
            >
              સાચવો (Save Account)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
