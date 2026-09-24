'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/lib/api-client';
import {
  Printer,
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Globe,
  Sparkles,
  Trophy,
} from 'lucide-react';

function ReportCardContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const studentId = params.id as string;
  const academicYearId = searchParams.get('academicYearId') || 'ay-2026-27';
  const examTypeId = searchParams.get('examTypeId') || undefined;

  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<'gu' | 'en'>('gu');

  useEffect(() => {
    async function loadReportCard() {
      setLoading(true);
      try {
        const url = `/exam/report-card/${studentId}?academicYearId=${academicYearId}${
          examTypeId ? `&examTypeId=${examTypeId}` : ''
        }`;
        const res = await fetchApi(url);
        if (res.success) {
          setReportData(res.data);
        }
      } catch (e: any) {
        // Graceful handling
      } finally {
        setLoading(false);
      }
    }
    loadReportCard();
  }, [studentId, academicYearId, examTypeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500 font-gujarati">પ્રગતિ પત્રક તૈયાર થઈ રહ્યું છે...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-8 text-center text-slate-400 bg-white rounded-xl border">
        પ્રગતિ પત્રક ડેટા મળ્યો નથી (Report card data not found)
      </div>
    );
  }

  const { school, student, examType, result, attendance, qualitativeEvaluation, gradeScale, teacherRemark } = reportData;
  const isGu = lang === 'gu';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-gujarati">
      {/* Action Bar (Hidden on Print) */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <Link
          href="/exam"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {isGu ? 'પાછા જાઓ (Back to Exams)' : 'Back to Exams'}
        </Link>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 text-xs font-bold">
            <button
              type="button"
              onClick={() => setLang('gu')}
              className={`px-3 py-1 rounded-md transition-all ${
                isGu ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ગુજરાતી પ્રગતિ પત્રક
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-md transition-all ${
                !isGu ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English Report Card
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            {isGu ? 'પ્રગતિ પત્રક પ્રિન્ટ / PDF' : 'Print / Save PDF'}
          </button>
        </div>
      </div>

      {/* STATUTORY PROGRESS REPORT CARD / PRAGATI PATRAK */}
      <div className="bg-white p-8 md:p-12 rounded-2xl border-2 border-indigo-950/20 shadow-lg print:shadow-none print:border-2 print:border-black print:p-6 print:m-0 print-avoid-break">
        {/* School Header */}
        <div className="text-center border-b-2 border-indigo-950 pb-4 space-y-1">
          <div className="flex items-center justify-center gap-2">
            <Award className="w-8 h-8 text-indigo-700" />
            <h1 className="text-2xl md:text-3xl font-black text-indigo-950 tracking-wide uppercase">
              {isGu ? school.nameGu : school.nameEn}
            </h1>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            {school.addressLine1 ? `${school.addressLine1}, ` : ''}
            {school.city}, {school.district}, Gujarat • DISE Code: <b className="font-mono text-slate-900">{school.diseCode || '24090100101'}</b>
          </p>
          <div className="inline-block mt-2 px-6 py-1 rounded-full bg-indigo-900 text-white font-bold text-xs tracking-wider">
            {isGu ? 'વાર્ષિક શૈક્ષણિક પ્રગતિ પત્રક' : 'ANNUAL ACADEMIC PROGRESS REPORT CARD'} • {student.academicYear}
          </div>
          <p className="text-[11px] font-bold text-slate-600 pt-1">
            {isGu ? examType?.nameGu : examType?.nameEn}
          </p>
        </div>

        {/* Student Profile Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 font-bold block">
              {isGu ? 'વિદ્યાર્થીનું નામ' : 'Student Name'}:
            </span>
            <span className="font-bold text-slate-950 text-sm">
              {isGu ? student.fullNameGu : student.fullNameEn}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold block">
              {isGu ? 'જનરલ રજિસ્ટર (GR) નં' : 'GR Number'}:
            </span>
            <span className="font-mono font-bold text-indigo-800 text-sm">{student.grNumber}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold block">
              {isGu ? 'ધોરણ અને વર્ગ' : 'Standard & Section'}:
            </span>
            <span className="font-bold text-slate-900">
              {isGu ? `${student.classNameGu} - ${student.divisionNameGu}` : `${student.classNameEn} - ${student.divisionNameEn}`}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold block">
              {isGu ? 'રોલ નંબર' : 'Roll Number'}:
            </span>
            <span className="font-mono font-bold text-slate-900">{student.rollNumber || '-'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold block">
              {isGu ? 'વાલીનું નામ' : "Parent's Name"}:
            </span>
            <span className="font-medium text-slate-800">{isGu ? student.parentNameGu : student.parentNameEn}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold block">
              {isGu ? 'જન્મ તારીખ' : 'Date of Birth'}:
            </span>
            <span className="font-mono text-slate-800">{student.dateOfBirth}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold block">APAAR ID:</span>
            <span className="font-mono text-slate-800">{student.apaarId || '-'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold block">CTS Unique ID:</span>
            <span className="font-mono text-slate-800">{student.ctsUniqueId || '-'}</span>
          </div>
        </div>

        {/* Academic Marks Breakdown Table */}
        <div className="overflow-hidden border-2 border-slate-900 rounded-xl my-5 text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white font-bold text-[11px]">
              <tr>
                <th className="py-2.5 px-3">{isGu ? 'વિષય' : 'Subject'}</th>
                <th className="py-2.5 px-2 text-center">{isGu ? 'થીયરી' : 'Theory'}</th>
                <th className="py-2.5 px-2 text-center">{isGu ? 'પ્રાયોગિક' : 'Practical'}</th>
                <th className="py-2.5 px-2 text-center">{isGu ? 'આંતરિક' : 'Internal'}</th>
                <th className="py-2.5 px-2 text-center">{isGu ? 'કૃપાગુણ' : 'Grace'}</th>
                <th className="py-2.5 px-3 text-center">{isGu ? 'કુલ ગુણ' : 'Total Marks'}</th>
                <th className="py-2.5 px-3 text-center">{isGu ? 'મહત્તમ' : 'Max Marks'}</th>
                <th className="py-2.5 px-3 text-center">{isGu ? 'ગ્રેડ' : 'Grade'}</th>
                <th className="py-2.5 px-3 text-center">{isGu ? 'સ્થિતિ' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {result?.subjectResults?.map((sub: any) => (
                <tr key={sub.examId} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {isGu ? sub.subjectNameGu : sub.subjectNameEn}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono text-blue-800">
                    {sub.isAbsent ? 'AB' : sub.theoryMarks ?? '-'}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono text-purple-800">
                    {sub.isAbsent ? '-' : sub.practicalMarks ?? '-'}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono text-amber-800">
                    {sub.isAbsent ? '-' : sub.internalMarks ?? '-'}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono text-emerald-700 font-bold">
                    {sub.graceMarks > 0 ? `+${sub.graceMarks}` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-black text-slate-950 text-sm bg-slate-50">
                    {sub.isAbsent ? (
                      <span className="text-rose-600">AB</span>
                    ) : (
                      <>
                        {sub.totalMarks}
                        {sub.hasGrace && <span className="text-emerald-600 font-bold">*</span>}
                      </>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-500 font-bold">
                    {sub.maxMarks}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-900 font-mono">
                      {sub.grade || '-'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold">
                    {sub.isAbsent ? (
                      <span className="text-rose-600">ગેરહાજર</span>
                    ) : sub.isPassed ? (
                      <span className="text-emerald-700">ઉત્તીર્ણ</span>
                    ) : (
                      <span className="text-rose-600">અનુત્તીર્ણ</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Grand Total Footer */}
            <tfoot className="bg-slate-100 border-t-2 border-slate-900 font-bold text-xs text-slate-950">
              <tr>
                <td colSpan={5} className="py-3 px-3 uppercase tracking-wider">
                  {isGu ? 'કુલ એકંદર ગુણ (Grand Total)' : 'Grand Total'}:
                </td>
                <td className="py-3 px-3 text-center font-mono font-black text-sm text-indigo-950 bg-indigo-50">
                  {result?.totalObtained}
                </td>
                <td className="py-3 px-3 text-center font-mono font-black text-sm text-slate-800">
                  {result?.grandMaxMarks}
                </td>
                <td className="py-3 px-3 text-center font-mono font-black text-indigo-800 text-sm">
                  {result?.overallGrade}
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[11px]">
                    {result?.resultStatus === 'PASSED'
                      ? 'ઉત્તીર્ણ'
                      : result?.resultStatus === 'PASSED_WITH_GRACE'
                      ? 'કૃપાગુણ સાથે ઉત્તીર્ણ'
                      : result?.resultStatus === 'RE_EXAM_ELIGIBLE'
                      ? 'પૂરક પાત્ર'
                      : 'અનુત્તીર્ણ'}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Overall Evaluation & Analytics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-5">
          <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-center">
            <span className="text-[10px] text-indigo-800 font-bold block">{isGu ? 'ટકાવારી' : 'Percentage'}</span>
            <span className="text-2xl font-black text-indigo-950 font-mono">{result?.percentage}%</span>
          </div>
          <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-center">
            <span className="text-[10px] text-indigo-800 font-bold block">{isGu ? 'એકંદર ગ્રેડ' : 'Overall Grade'}</span>
            <span className="text-2xl font-black text-indigo-950 font-mono">{result?.overallGrade}</span>
          </div>
          <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-center">
            <span className="text-[10px] text-indigo-800 font-bold block">{isGu ? 'વર્ગમાં નંબર (Rank)' : 'Class Rank'}</span>
            <span className="text-2xl font-black text-amber-600 font-mono">
              {result?.rank ? `#${result.rank}` : '-'}
            </span>
          </div>
          <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-center">
            <span className="text-[10px] text-indigo-800 font-bold block">{isGu ? 'હાજરી ટકાવારી' : 'Attendance'}</span>
            <span className="text-2xl font-black text-emerald-700 font-mono">
              {attendance?.attendancePercentage}%
            </span>
            <span className="text-[9px] text-slate-500 font-mono block">({attendance?.presentDays}/{attendance?.totalWorkingDays} દિવસ)</span>
          </div>
        </div>

        {/* Qualitative Evaluation & Personality Assessment */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 my-5 text-xs space-y-2">
          <p className="font-bold text-slate-800 text-[11px] border-b pb-1">
            {isGu ? 'વ્યક્તિત્વ વિકાસ અને સહઅભ્યાસિક મૂલ્યાંકન:' : 'Co-Curricular & Qualitative Evaluation:'}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-[11px]">
            <div>• {isGu ? 'સ્વચ્છતા / સુઘડતા' : 'Cleanliness'}: <b className="text-slate-900">{qualitativeEvaluation.cleanliness}</b></div>
            <div>• {isGu ? 'શિસ્ત અને નિયમિતતા' : 'Discipline'}: <b className="text-slate-900">{qualitativeEvaluation.discipline}</b></div>
            <div>• {isGu ? 'સહકાર્ય અને વર્તન' : 'Cooperation'}: <b className="text-slate-900">{qualitativeEvaluation.cooperation}</b></div>
            <div>• {isGu ? 'રમતગમત / કલા' : 'Sports & Arts'}: <b className="text-slate-900">{qualitativeEvaluation.sportsAndArts}</b></div>
          </div>
          <div className="pt-2 text-[11px]">
            <span className="font-bold text-slate-700">{isGu ? 'વર્ગશિક્ષકની નોંધ:' : "Teacher's Remarks:"} </span>
            <span className="text-indigo-900 font-medium italic">{teacherRemark}</span>
          </div>
        </div>

        {/* Grading System Scale Reference */}
        <div className="p-3 rounded-lg bg-slate-100/60 border border-slate-200 text-[10px] text-slate-600 my-4">
          <span className="font-bold text-slate-800 block mb-1">
            {isGu ? 'ગ્રેડિંગ માળખું (GSEB Standard Scale):' : 'Grading Scale:'}
          </span>
          <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono">
            <span>A1: 91-100%</span>
            <span>A2: 81-90%</span>
            <span>B1: 71-80%</span>
            <span>B2: 61-70%</span>
            <span>C1: 51-60%</span>
            <span>C2: 41-50%</span>
            <span>D: 33-40%</span>
            <span>E: &lt;33% (સુધારણા જરૂરી)</span>
          </div>
        </div>

        {/* Official Signatures Block */}
        <div className="grid grid-cols-3 gap-8 pt-12 mt-8 text-center text-xs font-bold text-slate-800 border-t-2 border-slate-300">
          <div>
            <div className="border-b border-dashed border-slate-400 mb-2 h-8" />
            <p>{isGu ? 'વર્ગ શિક્ષકની સહી' : "Class Teacher's Signature"}</p>
          </div>
          <div>
            <div className="border-b border-dashed border-slate-400 mb-2 h-8" />
            <p>{isGu ? 'વાલીની સહી' : "Parent / Guardian's Signature"}</p>
          </div>
          <div>
            <div className="border-b border-dashed border-slate-400 mb-2 h-8" />
            <p>{isGu ? 'આચાર્યશ્રીની સહી અને સિક્કો' : "Principal's Signature & Seal"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportCardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center font-bold text-xs text-slate-400 font-gujarati">
          પ્રગતિ પત્રક લોડ થઈ રહ્યું છે...
        </div>
      }
    >
      <ReportCardContent />
    </Suspense>
  );
}
