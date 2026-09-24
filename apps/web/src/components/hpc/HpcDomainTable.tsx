'use client';

import React from 'react';
import { DomainSection, StudentHpcData } from './types';

interface HpcDomainTableProps {
  id?: string;
  domains: DomainSection[];
  currentStudent: StudentHpcData;
  onLevelChange: (competencyId: string, sem: 'sem1' | 'sem2', level: '1' | '2' | '3' | '') => void;
  sectionTitle?: string;
  showNavTabs?: boolean;
}

export function HpcDomainTable({
  id,
  domains,
  currentStudent,
  onLevelChange,
  sectionTitle = 'કોષ્ટક-૧ અધ્યયન નિષ્પત્તિઓ અને ક્ષમતાઓનું મૂલ્યાંકન',
  showNavTabs = false,
}: HpcDomainTableProps) {
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div id={id} className="bg-white border-2 border-[#007ed4] rounded-[8px] p-3 sm:p-4 shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 page-break-after">
      {/* 3 Top Navigation Tab Pills (Matching Image 2 Reference) */}
      {showNavTabs && (
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pb-3 border-b border-[#dee2e6] mb-3 no-print">
          <button
            type="button"
            onClick={() => scrollToSection('domain-sec-1')}
            className="bg-[#ffebee] hover:bg-[#ffcdd2] text-[#c62828] border border-[#ffcdd2] text-[12px] font-bold px-3.5 py-1 rounded-full transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <span>• ૧. વિકાસ ક્ષેત્ર ૧ & ૨</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('domain-sec-2')}
            className="bg-[#fff8e1] hover:bg-[#ffecb3] text-[#f57f17] border border-[#ffecb3] text-[12px] font-bold px-3.5 py-1 rounded-full transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <span>• ૨. વિકાસ ક્ષેત્ર ૩ & ૪</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('domain-sec-3')}
            className="bg-[#e8f5e9] hover:bg-[#c8e6c9] text-[#2e7d32] border border-[#c8e6c9] text-[12px] font-bold px-3.5 py-1 rounded-full transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <span>• ૩. વિકાસ ક્ષેત્ર ૫ & પરિણામ</span>
          </button>
        </div>
      )}

      {/* Section Title Bar */}
      <div className="bg-[#e7f1ff] border border-[#b8daff] rounded-[4px] px-3 py-1.5 font-bold text-[13px] text-[#007ed4] mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <i className="bi bi-card-checklist text-[#007ed4]"></i>
          <span>{sectionTitle}</span>
        </div>
        <span className="text-[11.5px] font-semibold text-[#6c757d] hidden sm:inline-block">
          સ્તર: ૧ (શરૂઆત) | ૨ (પ્રગતિ) | ૩ (પ્રવીણ)
        </span>
      </div>

      {/* Domain Table */}
      <div className="overflow-x-auto border border-[#dee2e6] rounded-[4px]">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#007ed4] text-white font-bold text-[13px]">
              <th className="py-2 px-3 border-r border-blue-400 w-12 text-center">ક્રમ</th>
              <th className="py-2 px-3 border-r border-blue-400">વિકાસ ક્ષેત્ર / અધ્યયન નિષ્પત્તિ / ક્ષમતા</th>
              <th className="py-2 px-2 border-r border-blue-400 w-28 text-center">સત્ર-૧</th>
              <th className="py-2 px-2 w-28 text-center">સત્ર-૨</th>
            </tr>
          </thead>
          <tbody>
            {domains.map((domain) => (
              <React.Fragment key={domain.id}>
                {/* Yellow Domain Category Bar (Matching Reference) */}
                <tr className="bg-[#fff3cd] border-y border-[#ffeeba] font-bold text-[#856404]">
                  <td colSpan={4} className="py-2 px-3 text-[13px]">
                    {domain.title}
                  </td>
                </tr>

                {/* Competency Item Rows */}
                {domain.competencies.map((comp, idx) => {
                  const sem1Val = currentStudent?.levels?.[comp.id]?.sem1 ?? comp.sem1Level;
                  const sem2Val = currentStudent?.levels?.[comp.id]?.sem2 ?? comp.sem2Level;

                  return (
                    <tr key={comp.id} className="border-b border-[#dee2e6] hover:bg-[#f8f9fa] transition-colors">
                      <td className="py-2 px-3 text-center border-r border-[#dee2e6] font-medium text-[#6c757d]">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 border-r border-[#dee2e6] text-[#212529] font-normal leading-relaxed">
                        {comp.description}
                      </td>
                      <td className="py-1.5 px-2 text-center border-r border-[#dee2e6]">
                        <select
                          value={sem1Val}
                          onChange={(e) => onLevelChange(comp.id, 'sem1', e.target.value as any)}
                          className={`w-full text-center font-medium py-1 px-1 rounded border text-[12px] focus:outline-none transition-colors ${
                            sem1Val === '3'
                              ? 'bg-[#d1e7dd] text-[#0f5132] border-[#badbcc]'
                              : sem1Val === '2'
                              ? 'bg-[#fff3cd] text-[#664d03] border-[#ffecb5]'
                              : sem1Val === '1'
                              ? 'bg-[#f8d7da] text-[#842029] border-[#f5c2c7]'
                              : 'bg-white text-gray-700 border-gray-300'
                          }`}
                        >
                          <option value="">-- પસંદ કરો --</option>
                          <option value="3">સ્તર ૩</option>
                          <option value="2">સ્તર ૨</option>
                          <option value="1">સ્તર ૧</option>
                        </select>
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <select
                          value={sem2Val}
                          onChange={(e) => onLevelChange(comp.id, 'sem2', e.target.value as any)}
                          className={`w-full text-center font-medium py-1 px-1 rounded border text-[12px] focus:outline-none transition-colors ${
                            sem2Val === '3'
                              ? 'bg-[#d1e7dd] text-[#0f5132] border-[#badbcc]'
                              : sem2Val === '2'
                              ? 'bg-[#fff3cd] text-[#664d03] border-[#ffecb5]'
                              : sem2Val === '1'
                              ? 'bg-[#f8d7da] text-[#842029] border-[#f5c2c7]'
                              : 'bg-white text-gray-700 border-gray-300'
                          }`}
                        >
                          <option value="">-- પસંદ કરો --</option>
                          <option value="3">સ્તર ૩</option>
                          <option value="2">સ્તર ૨</option>
                          <option value="1">સ્તર ૧</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
