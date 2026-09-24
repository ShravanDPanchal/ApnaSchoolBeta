'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api-client';
import {
  GraduationCap,
  ArrowLeft,
  User,
  Users,
  FileText,
  CalendarCheck,
  ReceiptIndianRupee,
  FileSpreadsheet,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
} from 'lucide-react';
import { formatINR, toGujaratiDigits } from '@apna-school/shared-types';

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { t, locale, user } = useAuth();
  const studentId = params?.id as string;

  const [student, setStudent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PARENTS' | 'FEES' | 'ATTENDANCE' | 'DOCUMENTS'>('OVERVIEW');
  const [loading, setLoading] = useState(true);
  const [showDocModal, setShowDocModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Birth Certificate (જન્મ તારીખનો દાખલો)');

  async function loadStudent() {
    setLoading(true);
    try {
      const res = await fetchApi(`/students/${studentId}`);
      if (res.success) {
        setStudent(res.data);
      }
    } catch (e: any) {
      // Silently handled
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (studentId) loadStudent();
  }, [studentId]);

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi(`/students/${studentId}/documents`, {
        method: 'POST',
        body: JSON.stringify({
          fileName: docName,
          fileType: docType,
          fileSize: 154200,
          storagePath: `/uploads/students/${docName.toLowerCase().replace(/\s+/g, '_')}.pdf`,
        }),
      });
      setShowDocModal(false);
      setDocName('');
      loadStudent();
    } catch (err: any) {
      alert(err.message || 'Failed to add document');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border font-gujarati text-slate-500">
        વિદ્યાર્થી મળ્યા નથી (Student record not found)
      </div>
    );
  }

  const enr = student.enrollments?.[0];
  const primaryParent = student.studentParents?.[0]?.parent;

  return (
    <div className="space-y-6 font-gujarati">
      {/* Back Button & Top Profile Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/students')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border px-3 py-1.5 rounded-lg shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          વિદ્યાર્થી યાદી પર પાછા જાઓ
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/students/transfer?studentId=${student.id}`)}
            className="text-xs font-bold bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 px-3.5 py-1.5 rounded-lg"
          >
            શાળા છોડ્યાનું પ્રમાણપત્ર (LC / Transfer)
          </button>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start">
        <div className="w-24 h-24 rounded-2xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-600 font-bold text-3xl shrink-0 shadow-inner">
          {student.firstNameGu?.[0] || 'વિ'}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900">
              {locale === 'gu'
                ? `${student.firstNameGu} ${student.middleNameGu || ''} ${student.lastNameGu}`
                : `${student.firstNameEn} ${student.middleNameEn || ''} ${student.lastNameEn}`}
            </h1>
            <span className="text-xs bg-blue-100 text-blue-800 font-mono font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              GR No: {student.grNumber}
            </span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              {student.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-600">
            <p><strong>ધોરણ:</strong> {enr?.class?.nameGu || 'ધો. ૧'} ({enr?.division?.nameEn || 'A'})</p>
            <p><strong>રોલ નં:</strong> {enr?.rollNumber || '-'}</p>
            <p><strong>જાતિ:</strong> {student.gender === 'MALE' ? 'કુમાર' : 'કન્યા'}</p>
            <p><strong>જન્મ તારીખ:</strong> {student.dateOfBirth?.split('T')[0]}</p>
            <p><strong>મોબાઈલ:</strong> {student.phone || '-'}</p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500 pt-2 border-t font-mono">
            <p>APAAR ID: <strong>{student.apaarId || '-'}</strong></p>
            <p>CTS Unique ID: <strong>{student.ctsUniqueId || '-'}</strong></p>
            <p>Aadhaar: <strong>{student.aadhaarNumber || '-'}</strong></p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold w-fit">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'OVERVIEW' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'
          }`}
        >
          જનરલ રજિસ્ટર વિગત (eGR)
        </button>
        <button
          onClick={() => setActiveTab('PARENTS')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'PARENTS' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'
          }`}
        >
          વાલી વિગત (Parents)
        </button>
        <button
          onClick={() => setActiveTab('FEES')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'FEES' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'
          }`}
        >
          ફી વિગત (Fees)
        </button>
        <button
          onClick={() => setActiveTab('ATTENDANCE')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'ATTENDANCE' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'
          }`}
        >
          હાજરી રેકોર્ડ (Attendance)
        </button>
        <button
          onClick={() => setActiveTab('DOCUMENTS')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'DOCUMENTS' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'
          }`}
        >
          દસ્તાવેજો ({student.documents?.length || 0})
        </button>
      </div>

      {/* TAB 1: eGR Overview */}
      {activeTab === 'OVERVIEW' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900 border-b pb-2">
            જનરલ રજિસ્ટર કાયદેસર માહિતી (Statutory General Register Data)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg space-y-1.5">
              <p><strong>વિદ્યાર્થી પૂરું નામ (અંગ્રેજી):</strong> {student.firstNameEn} {student.middleNameEn} {student.lastNameEn}</p>
              <p><strong>વિદ્યાર્થી પૂરું નામ (ગુજરાતી):</strong> {student.firstNameGu} {student.middleNameGu} {student.lastNameGu}</p>
              <p><strong>જન્મ તારીખ શબ્દોમાં:</strong> {student.dobInWords || 'વિગતવાર શબ્દોમાં'}</p>
              <p><strong>રક્ત જૂથ (Blood Group):</strong> {student.bloodGroup || '-'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg space-y-1.5">
              <p><strong>કેટેગરી:</strong> {student.category || 'General'}</p>
              <p><strong>ધર્મ (Religion):</strong> {student.religion || 'Hindu'}</p>
              <p><strong>માતૃભાષા:</strong> ગુજરાતી</p>
              <p><strong>પ્રવેશ તારીખ:</strong> {student.admissionDate?.split('T')[0] || '2026-06-01'}</p>
              <p><strong>અગાઉની શાળા:</strong> {student.previousSchool || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Parents */}
      {activeTab === 'PARENTS' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900 border-b pb-2">
            વાલી / વાલીશ્રીની વિગતો (Parent / Guardian Details)
          </h2>
          {student.studentParents?.map((sp: any) => (
            <div key={sp.id} className="p-4 bg-slate-50 border rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm">
                  {sp.parent.firstNameGu} {sp.parent.lastNameGu} ({sp.parent.firstNameEn} {sp.parent.lastNameEn})
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                  {sp.parent.relationType}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-600">
                <p><strong>સંપર્ક મોબાઈલ:</strong> {sp.parent.phone || '-'}</p>
                <p><strong>વ્યવસાય:</strong> {sp.parent.occupation || 'ખેતી / વ્યવસાય'}</p>
                <p><strong>વાર્ષિક આવક:</strong> {sp.parent.annualIncome ? formatINR(sp.parent.annualIncome, locale) : '-'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Fees */}
      {activeTab === 'FEES' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
            <span className="font-bold text-slate-800">શૈક્ષણિક વર્ષ ૨૦૨૬-૨૭ ફી ખાતાવહી</span>
          </div>
          <table className="w-full text-left text-slate-700">
            <thead className="bg-slate-100 font-bold border-b text-[11px]">
              <tr>
                <th className="py-2.5 px-4">ફી હેડ</th>
                <th className="py-2.5 px-4 text-right">નિયત રકમ (₹)</th>
                <th className="py-2.5 px-4 text-right">ભરેલ રકમ (₹)</th>
                <th className="py-2.5 px-4 text-right">બાકી રકમ (₹)</th>
                <th className="py-2.5 px-4 text-center">સ્થિતિ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {student.studentFees?.map((sf: any) => (
                <tr key={sf.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold">{sf.feeStructure?.feeHead?.nameGu}</td>
                  <td className="py-3 px-4 text-right font-mono">{formatINR(sf.netAmount, locale)}</td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-600 font-bold">{formatINR(sf.paidAmount, locale)}</td>
                  <td className="py-3 px-4 text-right font-mono text-rose-600 font-bold">{formatINR(sf.netAmount - sf.paidAmount, locale)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {sf.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: Attendance */}
      {activeTab === 'ATTENDANCE' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900 border-b pb-2">
            તાજેતરની દૈનિક હાજરી રેકોર્ડ (Recent Attendance Logs)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {student.studentAttendances?.map((att: any) => (
              <div key={att.id} className="p-3 border rounded-lg bg-slate-50 flex justify-between items-center">
                <span className="font-mono text-slate-700">{att.attendanceDate?.split('T')[0]}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  att.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {att.status === 'PRESENT' ? 'હાજર' : 'ગેરહાજર'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Documents */}
      {activeTab === 'DOCUMENTS' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-sm font-bold text-slate-900">
              વિદ્યાર્થી દસ્તાવેજ સંગ્રહ (Uploaded Statutory Documents)
            </h2>
            <button
              onClick={() => setShowDocModal(true)}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              નવો દસ્તાવેજ ઉમેરો
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {student.documents?.length === 0 ? (
              <p className="text-slate-400 py-4 col-span-2 text-center">કોઈ દસ્તાવેજ અપલોડ કરેલ નથી</p>
            ) : (
              student.documents?.map((d: any) => (
                <div key={d.id} className="p-4 border rounded-xl bg-slate-50 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{d.fileName}</p>
                    <p className="text-[10px] text-slate-500">{d.fileType} • {Math.round(d.fileSize / 1024)} KB</p>
                  </div>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert(`દસ્તાવેજ ડાઉનલોડ: ${d.fileName}`); }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border max-w-md w-full shadow-2xl p-6 space-y-4 text-xs font-gujarati">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">નવો દસ્તાવેજ જોડો (Attach Document)</h3>
              <button onClick={() => setShowDocModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleAddDocument} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">દસ્તાવેજ પ્રકાર (Document Type)</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="Birth Certificate (જન્મ તારીખનો દાખલો)">જન્મ તારીખનો દાખલો (Birth Certificate)</option>
                  <option value="Aadhaar Card (આધાર કાર્ડ)">આધાર કાર્ડ (Aadhaar Card)</option>
                  <option value="Previous School LC (શાળા છોડ્યાનું પ્રમાણપત્ર)">અગાઉની શાળાનું LC</option>
                  <option value="Caste Certificate (જાતિનો દાખલો)">જાતિનો દાખલો (Caste Certificate)</option>
                  <option value="Income Certificate (આવકનો દાખલો)">આવકનો દાખલો (Income Certificate)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ફાઇલનું નામ (File Title)</label>
                <input
                  type="text"
                  required
                  placeholder="દા.ત. Aarav_Birth_Certificate.pdf"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-3 py-1.5 border rounded-lg text-slate-600"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg"
                >
                  સાચવો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
