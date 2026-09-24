'use client';

import React from 'react';
import { StudentHpcData } from './types';

interface HpcRemarksSectionProps {
  id?: string;
  currentStudent: StudentHpcData;
  onStudentFieldChange: (field: keyof StudentHpcData, val: any) => void;
  teacherName: string;
  principalName: string;
}

export function HpcRemarksSection({
  id = 'domain-sec-3',
  currentStudent,
  onStudentFieldChange,
  teacherName,
  principalName,
}: HpcRemarksSectionProps) {
  const sportsVal = currentStudent?.specialInterests?.sports?.sem1 ?? '';
  const musicVal = currentStudent?.specialInterests?.music?.sem1 ?? '';
  const artsVal = currentStudent?.specialInterests?.arts?.sem1 ?? '';
  const speechVal = currentStudent?.specialInterests?.speech?.sem1 ?? '';

  const sem1TeacherRemarks = currentStudent?.sem1TeacherRemarks ?? '';
  const sem1ParentRemarks = currentStudent?.sem1ParentRemarks ?? '';
  const sem2TeacherRemarks = currentStudent?.sem2TeacherRemarks ?? '';
  const sem2ParentRemarks = currentStudent?.sem2ParentRemarks ?? '';

  const sem1Height = currentStudent?.sem1Height ?? '';
  const sem2Height = currentStudent?.sem2Height ?? '';
  const sem1Weight = currentStudent?.sem1Weight ?? '';
  const sem2Weight = currentStudent?.sem2Weight ?? '';

  const sem1Days = currentStudent?.sem1TotalDays || 0;
  const sem1Att = currentStudent?.sem1Attendance || 0;
  const sem2Days = currentStudent?.sem2TotalDays || 0;
  const sem2Att = currentStudent?.sem2Attendance || 0;

  const totalDays = sem1Days + sem2Days;
  const totalAtt = sem1Att + sem2Att;

  const sem1Pct = sem1Days > 0 ? ((sem1Att / sem1Days) * 100).toFixed(1) : '0.0';
  const sem2Pct = sem2Days > 0 ? ((sem2Att / sem2Days) * 100).toFixed(1) : '0.0';
  const totalPct = totalDays > 0 ? ((totalAtt / totalDays) * 100).toFixed(1) : '0.0';

  return (
    <div id={id} className="bg-white border-2 border-[#007ed4] rounded-[8px] p-4 sm:p-5 shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 page-break-inside-avoid">
      {/* Section: વિશેષ રુચિ અને વિશિષ્ટતાઓ */}
      <div className="border border-[#007ed4] rounded-[6px] overflow-hidden mb-4">
        <div className="bg-[#e7f1ff] border-b border-[#007ed4] px-3 py-1.5 font-bold text-[13px] text-[#007ed4]">
          બાળકની વિશેષ રુચિ અને વિશિષ્ટતાઓ (Special Interests & Talents)
        </div>

        <div className="p-3 text-[13px] space-y-2.5 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#495057] block mb-1">૧. રમત-ગમત અને શારીરિક પ્રવૃત્તિ:</label>
              <input
                type="text"
                value={sportsVal}
                onChange={(e) =>
                  onStudentFieldChange('specialInterests', {
                    ...(currentStudent?.specialInterests || {}),
                    sports: { ...(currentStudent?.specialInterests?.sports || { sem2: '' }), sem1: e.target.value },
                  })
                }
                className="w-full border border-[#ced4da] rounded px-2.5 py-1 text-[12.5px] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#007ed4]"
                placeholder="દા.ત. દોડવું, બોલ રમવો, સંતુલન"
              />
            </div>
            <div>
              <label className="font-semibold text-[#495057] block mb-1">૨. સંગીત, ગીત અને અભિનય:</label>
              <input
                type="text"
                value={musicVal}
                onChange={(e) =>
                  onStudentFieldChange('specialInterests', {
                    ...(currentStudent?.specialInterests || {}),
                    music: { ...(currentStudent?.specialInterests?.music || { sem2: '' }), sem1: e.target.value },
                  })
                }
                className="w-full border border-[#ced4da] rounded px-2.5 py-1 text-[12.5px] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#007ed4]"
                placeholder="દા.ત. બાળગીતો અભિનય સાથે ગાવા"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#495057] block mb-1">૩. ચિત્રકામ અને સર્જનાત્મક કળા:</label>
              <input
                type="text"
                value={artsVal}
                onChange={(e) =>
                  onStudentFieldChange('specialInterests', {
                    ...(currentStudent?.specialInterests || {}),
                    arts: { ...(currentStudent?.specialInterests?.arts || { sem2: '' }), sem1: e.target.value },
                  })
                }
                className="w-full border border-[#ced4da] rounded px-2.5 py-1 text-[12.5px] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#007ed4]"
                placeholder="દા.ત. રંગ પૂરવા, માટીકામ"
              />
            </div>
            <div>
              <label className="font-semibold text-[#495057] block mb-1">૪. વાર્તાકથન અને વાતચીત:</label>
              <input
                type="text"
                value={speechVal}
                onChange={(e) =>
                  onStudentFieldChange('specialInterests', {
                    ...(currentStudent?.specialInterests || {}),
                    speech: { ...(currentStudent?.specialInterests?.speech || { sem2: '' }), sem1: e.target.value },
                  })
                }
                className="w-full border border-[#ced4da] rounded px-2.5 py-1 text-[12.5px] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#007ed4]"
                placeholder="દા.ત. વાર્તા કહેવી, પ્રશ્નો પૂછવા"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section: મંતવ્યો અને પ્રતિભાવ */}
      <div className="border border-[#007ed4] rounded-[6px] overflow-hidden mb-4">
        <div className="bg-[#e7f1ff] border-b border-[#007ed4] px-3 py-1.5 font-bold text-[13px] text-[#007ed4]">
          શિક્ષકનું મંતવ્ય અને વાલીનો પ્રતિભાવ (Teacher Remarks & Parent Feedback)
        </div>

        <div className="p-3 text-[13px] grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white">
          <div className="border border-[#dee2e6] rounded p-2.5 bg-[#fcfcfd]">
            <div className="font-bold text-[#007ed4] border-b border-[#dee2e6] pb-1 mb-2">સત્ર - ૧ મંતવ્યો:</div>
            <div className="space-y-2">
              <div>
                <label className="text-[12px] font-semibold text-[#495057] block mb-0.5">શિક્ષકનું મંતવ્ય:</label>
                <textarea
                  rows={2}
                  value={sem1TeacherRemarks}
                  onChange={(e) => onStudentFieldChange('sem1TeacherRemarks', e.target.value)}
                  placeholder="શિક્ષકનું મંતવ્ય લખો..."
                  className="w-full border border-[#ced4da] rounded p-1.5 text-[12px] focus:outline-none focus:border-[#007ed4] bg-white"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-[#495057] block mb-0.5">વાલીનો પ્રતિભાવ:</label>
                <textarea
                  rows={2}
                  value={sem1ParentRemarks}
                  onChange={(e) => onStudentFieldChange('sem1ParentRemarks', e.target.value)}
                  placeholder="વાલીનો પ્રતિભાવ લખો..."
                  className="w-full border border-[#ced4da] rounded p-1.5 text-[12px] focus:outline-none focus:border-[#007ed4] bg-white"
                />
              </div>
            </div>
          </div>

          <div className="border border-[#dee2e6] rounded p-2.5 bg-[#fcfcfd]">
            <div className="font-bold text-[#007ed4] border-b border-[#dee2e6] pb-1 mb-2">સત્ર - ૨ મંતવ્યો:</div>
            <div className="space-y-2">
              <div>
                <label className="text-[12px] font-semibold text-[#495057] block mb-0.5">શિક્ષકનું મંતવ્ય:</label>
                <textarea
                  rows={2}
                  value={sem2TeacherRemarks}
                  onChange={(e) => onStudentFieldChange('sem2TeacherRemarks', e.target.value)}
                  placeholder="શિક્ષકનું મંતવ્ય લખો..."
                  className="w-full border border-[#ced4da] rounded p-1.5 text-[12px] focus:outline-none focus:border-[#007ed4] bg-white"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-[#495057] block mb-0.5">વાલીનો પ્રતિભાવ:</label>
                <textarea
                  rows={2}
                  value={sem2ParentRemarks}
                  onChange={(e) => onStudentFieldChange('sem2ParentRemarks', e.target.value)}
                  placeholder="વાલીનો પ્રતિભાવ લખો..."
                  className="w-full border border-[#ced4da] rounded p-1.5 text-[12px] focus:outline-none focus:border-[#007ed4] bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section: શારીરિક માપન અને આરોગ્ય + હાજરી સારાંશ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Physical Health Record */}
        <div className="border border-[#007ed4] rounded-[6px] overflow-hidden">
          <div className="bg-[#e7f1ff] border-b border-[#007ed4] px-3 py-1 font-bold text-[13px] text-[#007ed4]">
            શારીરિક માપન (Physical Health Record)
          </div>
          <div className="p-2.5 text-[12.5px] bg-white">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#dee2e6] text-[#495057]">
                  <th className="py-1 px-2 text-left font-bold">માપન</th>
                  <th className="py-1 px-2 font-bold">સત્ર - ૧</th>
                  <th className="py-1 px-2 font-bold">સત્ર - ૨</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#dee2e6]">
                  <td className="py-1.5 px-2 text-left font-medium text-[#212529]">ઊંચાઈ (સે.મી.)</td>
                  <td className="py-1.5 px-2">
                    <input
                      type="text"
                      value={sem1Height}
                      onChange={(e) => onStudentFieldChange('sem1Height', e.target.value)}
                      placeholder="110"
                      className="w-16 border border-[#ced4da] rounded text-center py-0.5 text-[12px]"
                    />
                  </td>
                  <td className="py-1.5 px-2">
                    <input
                      type="text"
                      value={sem2Height}
                      onChange={(e) => onStudentFieldChange('sem2Height', e.target.value)}
                      placeholder="113"
                      className="w-16 border border-[#ced4da] rounded text-center py-0.5 text-[12px]"
                    />
                  </td>
                </tr>
                <tr className="border-b border-[#dee2e6]">
                  <td className="py-1.5 px-2 text-left font-medium text-[#212529]">વજન (કિ.ગ્રા.)</td>
                  <td className="py-1.5 px-2">
                    <input
                      type="text"
                      value={sem1Weight}
                      onChange={(e) => onStudentFieldChange('sem1Weight', e.target.value)}
                      placeholder="18.5"
                      className="w-16 border border-[#ced4da] rounded text-center py-0.5 text-[12px]"
                    />
                  </td>
                  <td className="py-1.5 px-2">
                    <input
                      type="text"
                      value={sem2Weight}
                      onChange={(e) => onStudentFieldChange('sem2Weight', e.target.value)}
                      placeholder="19.2"
                      className="w-16 border border-[#ced4da] rounded text-center py-0.5 text-[12px]"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 px-2 text-left font-medium text-[#212529]">આરોગ્ય સ્થિતિ</td>
                  <td className="py-1.5 px-2">
                    <span className="text-[#198754] font-bold">તંદુરસ્ત</span>
                  </td>
                  <td className="py-1.5 px-2">
                    <span className="text-[#198754] font-bold">તંદુરસ્ત</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="border border-[#007ed4] rounded-[6px] overflow-hidden">
          <div className="bg-[#e7f1ff] border-b border-[#007ed4] px-3 py-1 font-bold text-[13px] text-[#007ed4]">
            હાજરી સારાંશ (Attendance Summary)
          </div>
          <div className="p-2.5 text-[12.5px] bg-white">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#dee2e6] text-[#495057]">
                  <th className="py-1 px-2 text-left font-bold">વિગત</th>
                  <th className="py-1 px-2 font-bold">સત્ર - ૧</th>
                  <th className="py-1 px-2 font-bold">સત્ર - ૨</th>
                  <th className="py-1 px-2 font-bold">કુલ</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#dee2e6]">
                  <td className="py-1.5 px-2 text-left font-medium text-[#212529]">શાળાના દિવસો</td>
                  <td className="py-1.5 px-2 font-bold text-[#495057]">{sem1Days}</td>
                  <td className="py-1.5 px-2 font-bold text-[#495057]">{sem2Days}</td>
                  <td className="py-1.5 px-2 font-bold text-[#495057]">{totalDays}</td>
                </tr>
                <tr className="border-b border-[#dee2e6]">
                  <td className="py-1.5 px-2 text-left font-medium text-[#212529]">બાળકની હાજરી</td>
                  <td className="py-1.5 px-2 font-bold text-[#007ed4]">{sem1Att}</td>
                  <td className="py-1.5 px-2 font-bold text-[#007ed4]">{sem2Att}</td>
                  <td className="py-1.5 px-2 font-bold text-[#007ed4]">{totalAtt}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-2 text-left font-medium text-[#212529]">હાજરી (%)</td>
                  <td className="py-1.5 px-2 font-bold text-[#198754]">{sem1Pct}%</td>
                  <td className="py-1.5 px-2 font-bold text-[#198754]">{sem2Pct}%</td>
                  <td className="py-1.5 px-2 font-bold text-[#198754]">{totalPct}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Rubric Legend */}
      <div className="bg-[#fff3cd] border border-[#ffeeba] rounded-[6px] p-2 text-[12px] text-[#856404] mb-5 flex flex-wrap items-center justify-between gap-2">
        <div className="font-bold shrink-0">સ્તર કૂંચી નોંધ:</div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span><strong>સ્તર ૧:</strong> હજુ શરૂઆત છે / સપોર્ટની જરૂર છે</span>
          <span><strong>સ્તર ૨:</strong> પ્રગતિમાં છે / મદદ સાથે કરે છે</span>
          <span><strong>સ્તર ૩:</strong> પોતાની જાતે સરળતાથી કરી શકે છે (પ્રવીણ)</span>
        </div>
      </div>

      {/* Signature Block */}
      <div className="pt-6 border-t-2 border-dashed border-[#dee2e6] grid grid-cols-3 gap-4 text-center text-[13px] font-bold text-[#495057]">
        <div className="space-y-6">
          <div>વર્ગ શિક્ષકની સહી</div>
          <div className="text-[12px] font-normal text-[#6c757d]">({teacherName || 'શિક્ષકશ્રી'})</div>
        </div>
        <div className="space-y-6">
          <div>વાલીની સહી</div>
          <div className="text-[12px] font-normal text-[#6c757d]">(વાલીશ્રી)</div>
        </div>
        <div className="space-y-6">
          <div>મુખ્ય શિક્ષક / આચાર્યશ્રીની સહી</div>
          <div className="text-[12px] font-normal text-[#6c757d]">({principalName || 'મુખ્ય શિક્ષકશ્રી'})</div>
        </div>
      </div>
    </div>
  );
}
