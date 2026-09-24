'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface LeaveReportItem {
  id: string;
  staffName: string;
  designation: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export default function LeaveReportPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Leave Reports State
  const [leaveReports, setLeaveReports] = useState<LeaveReportItem[]>([]);
  const [selectedReportForPrint, setSelectedReportForPrint] = useState<LeaveReportItem | null>(null);

  // Form State
  const [staffName, setStaffName] = useState('');
  const [designation, setDesignation] = useState('શિક્ષક (Teacher)');
  const [leaveType, setLeaveType] = useState('પ્રાસંગિક રજા (Casual Leave - C.L.)');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalDays, setTotalDays] = useState(1);
  const [reason, setReason] = useState('');

  // Sample teachers for selection
  const staffMembers = [
    { name: 'શ્રવણ પંચાલ', desig: 'મુખ્ય શિક્ષક / આચાર્ય' },
    { name: 'રાજેશકુમાર પટેલ', desig: 'સહાયક શિક્ષક' },
    { name: 'ભાવેશભાઈ જોશી', desig: 'સહાયક શિક્ષક' },
    { name: 'પ્રીતિબેન શાહ', desig: 'ભાષા શિક્ષિકા' },
    { name: 'દિનેશભાઈ રાઠોડ', desig: 'ગણિત/વિજ્ઞાન શિક્ષક' },
  ];

  useEffect(() => {
    try {
      const saved = localStorage.getItem('apna_leave_reports');
      if (saved) {
        setLeaveReports(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName) {
      alert('કૃપા કરીને શિક્ષક/કર્મચારી પસંદ કરો.');
      return;
    }
    if (!startDate || !endDate) {
      alert('કૃપા કરીને તારીખો પસંદ કરો.');
      return;
    }

    const newReport: LeaveReportItem = {
      id: `leave_${Date.now()}`,
      staffName,
      designation,
      leaveType,
      startDate,
      endDate,
      totalDays: Number(totalDays) || 1,
      reason: reason || 'અંગત કારણસર',
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
    };

    const updated = [newReport, ...leaveReports];
    setLeaveReports(updated);
    try {
      localStorage.setItem('apna_leave_reports', JSON.stringify(updated));
    } catch (e) {}

    showToast('નવો રજા રિપોર્ટ સફળતાપૂર્વક ઉમેરાઈ ગયો છે!');
    setShowAddModal(false);
    setStaffName('');
    setReason('');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('શું તમે આ રજા રિપોર્ટ કાઢી નાખવા માંગો છો?')) {
      const updated = leaveReports.filter((r) => r.id !== id);
      setLeaveReports(updated);
      try {
        localStorage.setItem('apna_leave_reports', JSON.stringify(updated));
      } catch (e) {}
      showToast('રજા રિપોર્ટ કાઢી નાખવામાં આવ્યો છે.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#212529] font-gujarati antialiased pb-16">
      {/* TOP HEADER */}
      <header className="bg-white border-b border-[#dee2e6] py-3 px-4 sm:px-8 sticky top-0 z-30 no-print">
        <div className="max-w-[1320px] w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <Link href="/dashboard" className="inline-flex items-center text-[25px] font-bold tracking-tight">
              <span className="text-[#007ed4]">શાળા</span>
              <span className="text-[#f59e0b] ml-1.5">સાગર</span>
            </Link>
            <Link
              href="/dashboard"
              className="text-[#6c757d] hover:text-[#212529] text-[15px] font-normal font-sans hidden sm:inline-block transition-colors"
            >
              Dashboard
            </Link>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 text-[14.5px] text-[#495057] hover:text-[#212529] font-normal py-1.5 px-2.5 rounded transition-colors cursor-pointer"
            >
              <span>Shravan Panchal</span>
              <i className="bi bi-caret-down-fill text-[10px] text-[#6c757d]"></i>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-[4px] shadow-lg border border-[#dee2e6] py-1.5 z-50 text-[14px]">
                <Link
                  href="/user/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="block px-4 py-2 text-[#212529] hover:bg-[#f8f9fa] font-normal"
                >
                  યુઝરની વિગત
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout?.();
                  }}
                  className="w-full text-left px-4 py-2 text-[#dc3545] hover:bg-[#f8f9fa] font-normal"
                >
                  લોગ-આઉટ
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* TOAST MESSAGE */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-[#198754] text-white text-xs font-semibold px-4 py-2.5 rounded shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 no-print">
          <i className="bi bi-check-circle-fill text-base"></i>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="max-w-[1100px] w-full mx-auto px-4 py-6 space-y-4">
        {/* TOP ROW: Title & Golden Button matching Reference Image 3 */}
        <div className="flex items-center justify-between no-print">
          <h1 className="text-[20px] font-normal text-[#212529]">
            રજા રિપોર્ટ
          </h1>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="border border-[#d9822b] text-[#d9822b] hover:bg-[#fff9f0] px-4 py-1.5 rounded-[4px] text-[13.5px] font-normal transition-colors cursor-pointer shadow-none flex items-center gap-1.5"
          >
            + નવો રજા રિપોર્ટ
          </button>
        </div>

        {/* ALERT BANNER matching Reference Image 3 */}
        <div className="bg-[#f8d7da] border border-[#f5c2c7] text-[#842029] px-4 py-2.5 rounded-[4px] text-[13.5px] font-normal no-print">
          અગત્યની નોંધ: રજા રિપોર્ટમાં શાળાની વિગતનો ઉપયોગ થાય છે તે હજુ સુધી તમે ના ઉમેરેલ હોય તો{' '}
          <Link href="/reports/letterpad" className="text-[#0d6efd] hover:underline font-medium">
            આ લિંક પર જઈને
          </Link>{' '}
          ઉમેરી દેવા વિનંતી.
        </div>

        {/* MAIN BODY: Empty State or Reports Table matching Reference Image 3 */}
        {leaveReports.length === 0 ? (
          <div className="bg-white border border-[#dee2e6] rounded-[6px] py-16 px-6 text-center shadow-none flex flex-col items-center justify-center space-y-3 no-print">
            {/* Golden Calendar Icon */}
            <div className="w-14 h-14 rounded border-2 border-[#d9822b] text-[#d9822b] flex flex-col items-center justify-center font-bold relative bg-amber-50/40">
              <div className="w-full bg-[#d9822b] h-3.5 absolute top-0 flex items-center justify-around px-1">
                <span className="w-1 h-1 bg-white rounded-full"></span>
                <span className="w-1 h-1 bg-white rounded-full"></span>
              </div>
              <i className="bi bi-x-lg text-lg text-[#d9822b] mt-3"></i>
            </div>

            <p className="text-[15px] text-[#212529] font-normal">
              કોઈ રજા રિપોર્ટ નથી.
            </p>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="border border-[#d9822b] text-[#d9822b] hover:bg-[#fff9f0] px-4 py-1.5 rounded-[4px] text-[13.5px] font-normal transition-colors cursor-pointer shadow-none"
            >
              નવો રજા રિપોર્ટ ઉમેરો
            </button>
          </div>
        ) : (
          <div className="bg-white border border-[#dee2e6] rounded-[6px] shadow-none overflow-hidden text-xs no-print">
            <table className="w-full text-left">
              <thead className="bg-[#f8f9fa] border-b border-[#dee2e6] text-[#495057] font-medium text-[13px]">
                <tr>
                  <th className="py-2.5 px-3">શિક્ષકનું નામ</th>
                  <th className="py-2.5 px-3">હોદ્દો</th>
                  <th className="py-2.5 px-3">રજા પ્રકાર</th>
                  <th className="py-2.5 px-3">તારીખ</th>
                  <th className="py-2.5 px-3 text-center">દિવસ</th>
                  <th className="py-2.5 px-3 text-center">સ્થિતિ</th>
                  <th className="py-2.5 px-3 text-center">ક્રિયા</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dee2e6] text-[13px]">
                {leaveReports.map((r) => (
                  <tr key={r.id} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[#212529]">{r.staffName}</td>
                    <td className="py-2.5 px-3 text-[#6c757d]">{r.designation}</td>
                    <td className="py-2.5 px-3 text-[#0d6efd]">{r.leaveType}</td>
                    <td className="py-2.5 px-3">{r.startDate} થી {r.endDate}</td>
                    <td className="py-2.5 px-3 text-center font-bold">{r.totalDays}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="bg-[#d1e7dd] text-[#0f5132] px-2 py-0.5 rounded text-xs font-semibold">
                        મંજૂર
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReportForPrint(r);
                          setTimeout(() => window.print(), 100);
                        }}
                        className="text-[#0d6efd] hover:underline cursor-pointer"
                      >
                        પ્રિન્ટ
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(r.id, e)}
                        className="text-[#dc3545] hover:underline cursor-pointer"
                      >
                        ડિલીટ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* BOTTOM ACTION BUTTON matching Reference Image 3 */}
        <div className="text-center pt-6 no-print">
          <button
            type="button"
            onClick={() => setShareModalOpen(true)}
            className="bg-[#198754] hover:bg-[#157347] text-white text-[14px] font-normal px-6 py-2 rounded-[4px] transition-colors cursor-pointer shadow-none inline-flex items-center gap-2"
          >
            <i className="bi bi-share"></i>
            અન્ય શિક્ષક મિત્ર જોડે શેર કરો
          </button>
        </div>

        {/* FOOTER */}
        <footer className="pt-10 pb-2 flex items-center justify-between text-[13px] text-[#6c757d] font-normal no-print border-t border-[#dee2e6] mt-8">
          <p>સંપર્ક: support@apnaschool.in</p>
          <p className="text-[#212529]">શાળા સાગર</p>
        </footer>
      </main>

      {/* CREATE LEAVE REPORT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[6px] border border-[#dee2e6] max-w-lg w-full shadow-xl p-5 space-y-4 text-xs font-gujarati">
            <div className="flex justify-between items-center border-b border-[#dee2e6] pb-2">
              <h3 className="font-bold text-[#212529] text-[15px]">નવો રજા રિપોર્ટ ઉમેરો (Add Leave Report)</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#6c757d] hover:text-[#212529] text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-3">
              <div>
                <label className="block text-[#212529] font-normal mb-1">શિક્ષક / કર્મચારીનું નામ *</label>
                <select
                  value={staffName}
                  onChange={(e) => {
                    setStaffName(e.target.value);
                    const found = staffMembers.find((m) => m.name === e.target.value);
                    if (found) setDesignation(found.desig);
                  }}
                  required
                  className="w-full h-[36px] px-3 border border-[#dee2e6] rounded-[4px] text-[13px]"
                >
                  <option value="">-- પસંદ કરો --</option>
                  {staffMembers.map((m) => (
                    <option key={m.name} value={m.name}>{m.name} ({m.desig})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#212529] font-normal mb-1">રજાનો પ્રકાર</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full h-[36px] px-3 border border-[#dee2e6] rounded-[4px] text-[13px]"
                >
                  <option value="પ્રાસંગિક રજા (Casual Leave - C.L.)">પ્રાસંગિક રજા (Casual Leave - C.L.)</option>
                  <option value="તબીબી રજા (Medical Leave - M.L.)">તબીબી રજા (Medical Leave - M.L.)</option>
                  <option value="હક્કરી રજા (Earned Leave - E.L.)">હક્કરી રજા (Earned Leave - E.L.)</option>
                  <option value="ખાસ પ્રાસંગિક રજા (Special C.L.)">ખાસ પ્રાસંગિક રજા (Special C.L.)</option>
                  <option value="ફરજ રજા (Duty Leave - D.L.)">ફરજ રજા (Duty Leave - D.L.)</option>
                  <option value="પ્રસૂતિ રજા (Maternity Leave)">પ્રસૂતિ રજા (Maternity Leave)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#212529] font-normal mb-1">શરૂઆત તારીખ *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-[36px] px-3 border border-[#dee2e6] rounded-[4px] text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[#212529] font-normal mb-1">અંતિમ તારીખ *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-[36px] px-3 border border-[#dee2e6] rounded-[4px] text-[13px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#212529] font-normal mb-1">કુલ દિવસો</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={totalDays}
                  onChange={(e) => setTotalDays(Number(e.target.value))}
                  className="w-full h-[36px] px-3 border border-[#dee2e6] rounded-[4px] text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[#212529] font-normal mb-1">રજાનું કારણ</label>
                <input
                  type="text"
                  placeholder="उदा. સામાજિક પ્રસંગ / માંદગી / સરકારી કામગીરી"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-[36px] px-3 border border-[#dee2e6] rounded-[4px] text-[13px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#dee2e6]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-[#dee2e6] rounded-[4px] text-[#495057] cursor-pointer"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0d6efd] text-white font-medium rounded-[4px] cursor-pointer"
                >
                  સાચવો અને ઉમેરો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE OFFICIAL LEAVE APPLICATION */}
      {selectedReportForPrint && (
        <div className="hidden print:block bg-white text-black p-8 max-w-[800px] mx-auto">
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h1 className="text-xl font-bold">શ્રી સરસ્વતી વિદ્યા મંદિર - રજા મંજૂરી રિપોર્ટ</h1>
            <p className="text-xs text-gray-600">પ્રાથમિક શાળા શિક્ષણ શાખા, ગુજરાત રાજ્ય</p>
          </div>
          <table className="w-full text-xs border border-black mb-6">
            <tbody>
              <tr className="border-b border-black">
                <td className="p-2 font-bold w-1/3 bg-gray-100">કર્મચારીનું નામ:</td>
                <td className="p-2">{selectedReportForPrint.staffName}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="p-2 font-bold bg-gray-100">હોદ્દો:</td>
                <td className="p-2">{selectedReportForPrint.designation}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="p-2 font-bold bg-gray-100">રજાનો પ્રકાર:</td>
                <td className="p-2">{selectedReportForPrint.leaveType}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="p-2 font-bold bg-gray-100">રજાનો ગાળો:</td>
                <td className="p-2">{selectedReportForPrint.startDate} થી {selectedReportForPrint.endDate} (કુલ {selectedReportForPrint.totalDays} દિવસ)</td>
              </tr>
              <tr className="border-b border-black">
                <td className="p-2 font-bold bg-gray-100">કારણ:</td>
                <td className="p-2">{selectedReportForPrint.reason}</td>
              </tr>
            </tbody>
          </table>
          <div className="flex justify-between items-end pt-16 text-xs">
            <div className="text-center">
              <p>_______________________</p>
              <p className="mt-1">અરજદાર શિક્ષકની સહી</p>
            </div>
            <div className="text-center">
              <p>_______________________</p>
              <p className="mt-1 font-bold">આચાર્યશ્રી / સી.આર.સી. સહી-સિક્કો</p>
            </div>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[6px] border border-[#dee2e6] max-w-sm w-full shadow-xl p-5 space-y-4 text-xs font-gujarati">
            <div className="flex justify-between items-center border-b border-[#dee2e6] pb-2">
              <h3 className="font-bold text-[#212529] text-[14px]">લિંક શેર કરો</h3>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="text-[#6c757d] hover:text-[#212529] text-base cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-[13px] text-[#495057]">
              નીચેની લિંક કોપી કરીને WhatsApp અથવા સોશિયલ મીડિયા પર શેર કરો:
            </p>
            <input
              type="text"
              readOnly
              value={typeof window !== 'undefined' ? window.location.href : ''}
              className="w-full h-[36px] px-3 border border-[#dee2e6] rounded-[4px] text-xs bg-slate-50 select-all"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('લિંક કોપી થઈ ગઈ છે!');
                  setShareModalOpen(false);
                }}
                className="px-4 py-1.5 bg-[#198754] text-white font-medium rounded-[4px] cursor-pointer"
              >
                કોપી કરો
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
