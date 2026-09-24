'use client';

import React from 'react';
import { ReceiptIndianRupee, Printer } from 'lucide-react';
import { formatINR } from '@apna-school/shared-types';

interface FeeReceiptModalProps {
  selectedReceipt: any;
  locale: any;
  onClose: () => void;
}

export const FeeReceiptModal: React.FC<FeeReceiptModalProps> = ({
  selectedReceipt,
  locale,
  onClose,
}) => {
  if (!selectedReceipt) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:static print:inset-auto print:bg-white print:p-0 print:z-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] print:max-h-none print:shadow-none print:border-none flex flex-col overflow-hidden border border-slate-200 font-gujarati">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ReceiptIndianRupee className="w-5 h-5 text-blue-600" />
            વૈધાનિક ૩-પ્રત ફી પાવતી રસીદ (3-Ply Statutory Fee Receipt)
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Printer className="w-4 h-4" />
              પ્રિન્ટ / PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-lg font-bold ml-2"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable 3-Ply Layout */}
        <div className="overflow-y-auto p-6 space-y-6 text-xs">
          {selectedReceipt.plyTypes.map((ply: any, idx: number) => (
            <div
              key={ply.key}
              className={`border-2 border-slate-800 rounded-xl p-5 space-y-3 ${
                idx > 0 ? 'border-t-2 border-dashed border-slate-400 mt-6 pt-6' : ''
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b pb-2">
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase">
                    {locale === 'gu' ? selectedReceipt.school.nameGu : selectedReceipt.school.nameEn}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    {selectedReceipt.school.city}, Gujarat • DISE: <b className="font-mono">{selectedReceipt.school.diseCode}</b>
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded bg-slate-100 text-[10px] font-bold border border-slate-300 block">
                    {locale === 'gu' ? ply.labelGu : ply.labelEn}
                  </span>
                  <p className="text-[10px] font-mono font-bold text-blue-700 mt-1">
                    {selectedReceipt.receipt.receiptNumber}
                  </p>
                </div>
              </div>

              {/* Student Details */}
              <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-lg text-[11px]">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block">વિદ્યાર્થી:</span>
                  <b className="text-slate-900">{selectedReceipt.student.studentNameGu}</b>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block">GR નં / રોલ નં:</span>
                  <b className="font-mono text-slate-800">
                    {selectedReceipt.student.grNumber} / {selectedReceipt.student.rollNumber || '-'}
                  </b>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block">ધોરણ / વર્ષ:</span>
                  <b className="text-slate-800">
                    {selectedReceipt.student.classNameGu} ({selectedReceipt.student.academicYear})
                  </b>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block">તારીખ:</span>
                  <b className="font-mono text-slate-800">{selectedReceipt.receipt.paymentDate}</b>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-[11px] border">
                <thead className="bg-slate-100 font-bold border-b">
                  <tr>
                    <th className="py-1 px-2">ફી હેડ (Fee Head)</th>
                    <th className="py-1 px-2 text-right">કુલ રકમ</th>
                    <th className="py-1 px-2 text-right">આ રસીદમાં ચૂકવેલ</th>
                    <th className="py-1 px-2 text-right">બાકી સિલક</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedReceipt.items.map((it: any, i: number) => (
                    <tr key={i}>
                      <td className="py-1 px-2 font-bold">{it.feeHeadGu}</td>
                      <td className="py-1 px-2 text-right font-mono">₹{formatINR(it.netAmount)}</td>
                      <td className="py-1 px-2 text-right font-mono font-bold text-slate-900">₹{formatINR(it.paidAmount)}</td>
                      <td className="py-1 px-2 text-right font-mono text-slate-500">₹{formatINR(it.remainingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t">
                  <tr>
                    <td className="py-1.5 px-2">કુલ ચૂકવેલ રકમ:</td>
                    <td colSpan={2} className="py-1.5 px-2 text-right font-mono font-black text-sm text-blue-900">
                      ₹{formatINR(selectedReceipt.receipt.totalAmount)}
                    </td>
                    <td className="py-1.5 px-2 text-right text-[10px] text-slate-500 font-mono">
                      {selectedReceipt.receipt.paymentMode}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <p className="text-[10px] text-slate-600 font-medium italic">
                {selectedReceipt.receipt.amountInWordsGu} ({selectedReceipt.receipt.amountInWordsEn})
              </p>

              <div className="flex justify-between items-end pt-4 text-[10px] font-bold text-slate-600">
                <div>
                  <p>નાણાં સ્વીકારનાર: {selectedReceipt.receipt.cashierName}</p>
                </div>
                <div className="text-right">
                  <p>અધિકૃત સહી અને સિક્કો (Authorized Signatory)</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
