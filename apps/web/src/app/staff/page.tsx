'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api-client';

interface EducationItem {
  id: string;
  degree: string;
  university: string;
  year: string;
  percentage: string;
}

export default function StaffTeacherProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Education Modal
  const [showEduModal, setShowEduModal] = useState(false);
  const [educationList, setEducationList] = useState<EducationItem[]>([]);
  const [newEdu, setNewEdu] = useState<EducationItem>({
    id: '',
    degree: '',
    university: '',
    year: '',
    percentage: '',
  });

  // Profile Form State
  const [formData, setFormData] = useState({
    // Basic Info
    fullName: '',
    birthdate: '',
    mobileNumber: '',
    email: '',
    designation: 'શિક્ષક (Teacher)',
    jobStartDate: '',
    schoolJoinDate: new Date().toISOString().split('T')[0],
    mailingAddress: '',
    nativeAddress: '',

    // Education & IDs
    bloodGroup: '',
    teacherCode: '',
    mandaliNumber: '',
    sasLoginId: '',
    aadharNumber: '',
    electionCardNumber: '',
    panCardNumber: '',
    rationCardNumber: '',
    drivingLicenceNumber: '',

    // Bank Details
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branch: '',

    // Other Details
    pranNumber: '',
    cpfGpfNumber: '',
    firstHigherPayDate: '',
    secondHigherPayDate: '',
    thirdHigherPayDate: '',
    retirementDate: '',
    achievements: '',
    salary: '25000',
  });

  useEffect(() => {
    async function loadStaff() {
      try {
        const res = await fetchApi('/staff');
        if (res.data) setStaffList(res.data);
      } catch (err) {
        console.error('Failed to load staff list', err);
      }
    }
    loadStaff();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddEducation = () => {
    if (!newEdu.degree) return;
    setEducationList((prev) => [...prev, { ...newEdu, id: `edu_${Date.now()}` }]);
    setNewEdu({ id: '', degree: '', university: '', year: '', percentage: '' });
    setShowEduModal(false);
  };

  const handleRemoveEducation = (id: string) => {
    setEducationList((prev) => prev.filter((item) => item.id !== id));
  };

  const validateStaffForm = (): string | null => {
    if (!formData.fullName.trim()) {
      return 'કર્મચારી/શિક્ષકનું પૂરું નામ દાખલ કરવું ફરજિયાત છે.';
    }

    if (formData.mobileNumber.trim()) {
      const cleanPhone = formData.mobileNumber.replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        return 'મોબાઈલ નંબર બરાબર ૧૦ અંકનો અને 6-9 થી શરૂ થતો હોવો જોઈએ.';
      }
    }

    if (formData.aadharNumber.trim()) {
      const cleanAadhaar = formData.aadharNumber.replace(/\D/g, '');
      if (cleanAadhaar.length !== 12) {
        return 'આધાર કાર્ડ નંબર બરાબર ૧૨ અંકનો હોવો જોઈએ.';
      }
    }

    if (formData.panCardNumber.trim()) {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(formData.panCardNumber.trim())) {
        return 'અમાન્ય PAN કાર્ડ નંબર ફોર્મેટ (ઉદા. ABCDE1234F).';
      }
    }

    if (formData.ifscCode.trim()) {
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(formData.ifscCode.trim())) {
        return 'અમાન્ય IFSC કોડ ફોર્મેટ (ઉદા. SBIN0001234).';
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const valErr = validateStaffForm();
    if (valErr) {
      setErrorMessage(valErr);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);

    try {
      const names = formData.fullName.trim().split(' ');
      const firstName = names[0] || 'શિક્ષક';
      const lastName = names.length > 1 ? names.slice(1).join(' ') : 'શર્મા';

      const payload = {
        firstNameEn: firstName,
        lastNameEn: lastName,
        firstNameGu: firstName,
        lastNameGu: lastName,
        designation: formData.designation || 'TEACHER',
        staffType: 'TEACHING',
        phone: formData.mobileNumber.replace(/\D/g, '') || undefined,
        email: formData.email.trim() || undefined,
        aadhaarNumber: formData.aadharNumber.replace(/\D/g, '') || undefined,
        panNumber: formData.panCardNumber.trim() || undefined,
        joiningDate: formData.schoolJoinDate || new Date().toISOString(),
        salary: formData.salary ? parseFloat(formData.salary) : 25000,
        address: formData.mailingAddress || undefined,
        qualification: educationList.map((e) => `${e.degree} (${e.university || ''})`).join(', ') || undefined,
      };

      await fetchApi('/staff', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3500);

      // Refresh list
      const res = await fetchApi('/staff');
      if (res.data) setStaffList(res.data);
    } catch (err: any) {
      setErrorMessage(err.message || 'શિક્ષક/કર્મચારી સાચવવામાં ભૂલ આવી.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#212529] font-gujarati antialiased pb-16">
      {/* TOP HEADER */}
      <header className="bg-white border-b border-[#dee2e6] py-3 px-4 sm:px-8 sticky top-0 z-30 no-print">
        <div className="max-w-[1320px] w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <Link href="/dashboard" className="inline-flex items-center text-[25px] font-bold tracking-tight">
              <span className="text-[#007ed4]">અપના</span>
              <span className="text-[#f59e0b] ml-1.5">સ્કૂલ</span>
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
                  href="/staff"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="block px-4 py-2 text-[#212529] hover:bg-[#f8f9fa] font-normal"
                >
                  યુઝરની વિગત
                </Link>
                <div className="border-t border-[#dee2e6] my-1"></div>
                <Link
                  href="/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="block px-4 py-2 text-[#212529] hover:bg-[#f8f9fa] font-normal"
                >
                  શાળાની વિગત
                </Link>
                <div className="border-t border-[#dee2e6] my-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-[#212529] hover:bg-[#f8f9fa] font-normal cursor-pointer"
                >
                  લોગ-આઉટ
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* TOAST MESSAGE */}
      {savedToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#198754] text-white text-xs font-semibold px-4 py-2.5 rounded shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 no-print">
          <i className="bi bi-check-circle-fill text-base"></i>
          <span>શિક્ષક પ્રોફાઇલ સફળતાપૂર્વક સાચવવામાં આવી છે!</span>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="max-w-[1000px] w-full mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="bg-white border border-[#dee2e6] rounded-[6px] shadow-none overflow-hidden">
          {/* CARD HEADER */}
          <div className="p-4 sm:p-5 border-b border-[#dee2e6] flex items-center justify-between">
            <h1 className="text-[17px] sm:text-[18px] font-bold text-[#212529]">
              શિક્ષકની પ્રોફાઇલ (Teacher Profile)
            </h1>
            <button
              type="button"
              onClick={handleDownload}
              className="bg-[#ffc107] hover:bg-[#ffca2c] text-[#000000] text-xs font-semibold px-3 py-1.5 rounded transition-colors shadow-none cursor-pointer flex items-center gap-1.5"
            >
              <span>Download</span>
            </button>
          </div>

          <div className="p-5 sm:p-7 space-y-6">
            {/* PHOTO SECTION */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="relative w-[130px] h-[130px] sm:w-[150px] sm:h-[150px] rounded-full bg-[#e9ecef] border border-[#ced4da] flex flex-col items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Teacher Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[#6c757d] text-[15px] font-sans font-medium">
                    150 × 150
                  </span>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#495057] hover:bg-[#343a40] text-white text-xs font-normal px-3 py-1 rounded-full flex items-center gap-1.5 shadow-none transition-colors cursor-pointer"
              >
                <i className="bi bi-camera"></i>
                <span>બદલો</span>
              </button>
            </div>

            {/* BASIC INFO GRID (2 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-normal text-[#212529] mb-1">
                  પૂરું નામ (Full Name) <span className="text-[#dc3545]">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[13px] font-normal text-[#212529] mb-1">
                  જન્મ તારીખ (Birthdate) <span className="text-[#dc3545]">*</span>
                </label>
                <input
                  type="date"
                  name="birthdate"
                  required
                  value={formData.birthdate}
                  onChange={handleChange}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[13px] font-normal text-[#212529] mb-1">
                  મોબાઇલ નંબર (Mobile Number) <span className="text-[#dc3545]">*</span>
                </label>
                <input
                  type="tel"
                  name="mobileNumber"
                  required
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[13px] font-normal text-[#212529] mb-1">
                  ઇમેઇલ (Email)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[13px] font-normal text-[#212529] mb-1">
                  શાળામાં હાલનો હોદ્દો (Current Designation) <span className="text-[#dc3545]">*</span>
                </label>
                <input
                  type="text"
                  name="designation"
                  required
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[13px] font-normal text-[#212529] mb-1">
                  ખાતા દાખલ તારીખ (Job Start Date) <span className="text-[#dc3545]">*</span>
                </label>
                <input
                  type="date"
                  name="jobStartDate"
                  required
                  value={formData.jobStartDate}
                  onChange={handleChange}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe] transition-colors"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-[13px] font-normal text-[#212529] mb-1">
                  હાલની શાળામાં દાખલ તારીખ (Current School Join Date)
                </label>
                <input
                  type="date"
                  name="schoolJoinDate"
                  value={formData.schoolJoinDate}
                  onChange={handleChange}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe] transition-colors"
                />
              </div>
            </div>

            {/* ADDRESS FIELDS */}
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-normal text-[#212529] mb-1">
                  પત્ર વ્યવહાર માટેનું સરનામું (Address for Sending Letters)
                </label>
                <textarea
                  rows={3}
                  name="mailingAddress"
                  value={formData.mailingAddress}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe] transition-colors"
                ></textarea>
              </div>

              <div>
                <label className="block text-[13px] font-normal text-[#212529] mb-1">
                  વતનના ગામનું સરનામું (Native Address)
                </label>
                <textarea
                  rows={3}
                  name="nativeAddress"
                  value={formData.nativeAddress}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe] transition-colors"
                ></textarea>
              </div>
            </div>

            {/* EDUCATION SECTION */}
            <div className="space-y-3 pt-2">
              <h2 className="text-[15px] font-bold text-[#212529]">
                શૈક્ષણિક લાયકાત (Education)
              </h2>

              <div>
                <button
                  type="button"
                  onClick={() => setShowEduModal(true)}
                  className="border border-[#0d6efd] text-[#0d6efd] hover:bg-blue-50 text-xs font-normal px-3 py-1.5 rounded transition-colors cursor-pointer"
                >
                  Add Education
                </button>
              </div>

              {educationList.length > 0 && (
                <div className="border border-[#dee2e6] rounded-[4px] overflow-hidden text-xs my-2">
                  <table className="w-full text-left">
                    <thead className="bg-[#f8f9fa] border-b border-[#dee2e6] font-semibold text-[#495057]">
                      <tr>
                        <th className="py-2 px-3">ડિગ્રી / કોર્સ</th>
                        <th className="py-2 px-3">યુનિવર્સિટી / બોર્ડ</th>
                        <th className="py-2 px-3">ઉત્તીર્ણ વર્ષ</th>
                        <th className="py-2 px-3">ટકાવારી (%)</th>
                        <th className="py-2 px-3 text-center">ક્રિયા</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dee2e6]">
                      {educationList.map((edu) => (
                        <tr key={edu.id}>
                          <td className="py-2 px-3 font-medium">{edu.degree}</td>
                          <td className="py-2 px-3">{edu.university || '-'}</td>
                          <td className="py-2 px-3">{edu.year || '-'}</td>
                          <td className="py-2 px-3">{edu.percentage ? `${edu.percentage}%` : '-'}</td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveEducation(edu.id)}
                              className="text-[#dc3545] hover:underline"
                            >
                              કાઢી નાખો
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 3-COLUMN EDUCATION & ID GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="block text-[13px] font-normal text-[#212529] mb-1">
                    બ્લડ ગ્રુપ (Blood Group)
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                  >
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-normal text-[#212529] mb-1">
                    શિક્ષક કોડ (Teacher Code)
                  </label>
                  <input
                    type="text"
                    name="teacherCode"
                    value={formData.teacherCode}
                    onChange={handleChange}
                    className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-normal text-[#212529] mb-1">
                    શિક્ષક મંડળી નંબર
                  </label>
                  <input
                    type="text"
                    name="mandaliNumber"
                    value={formData.mandaliNumber}
                    onChange={handleChange}
                    className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-normal text-[#212529] mb-1">
                    SAS Login ID
                  </label>
                  <input
                    type="text"
                    name="sasLoginId"
                    value={formData.sasLoginId}
                    onChange={handleChange}
                    className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-normal text-[#212529] mb-1">
                    આધાર નંબર (Aadhar Number)
                  </label>
                  <input
                    type="text"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleChange}
                    className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-normal text-[#212529] mb-1">
                    ચૂંટણી કાર્ડ નંબર (Election Card)
                  </label>
                  <input
                    type="text"
                    name="electionCardNumber"
                    value={formData.electionCardNumber}
                    onChange={handleChange}
                    className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-normal text-[#212529] mb-1">
                    પાન કાર્ડ નંબર (PAN Card)
                  </label>
                  <input
                    type="text"
                    name="panCardNumber"
                    value={formData.panCardNumber}
                    onChange={handleChange}
                    className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-normal text-[#212529] mb-1">
                    રેશન કાર્ડ નંબર (Ration Card)
                  </label>
                  <input
                    type="text"
                    name="rationCardNumber"
                    value={formData.rationCardNumber}
                    onChange={handleChange}
                    className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-normal text-[#212529] mb-1">
                    ડ્રાઇવિંગ લાઈસન્સ નંબર (Driving Licence)
                  </label>
                  <input
                    type="text"
                    name="drivingLicenceNumber"
                    value={formData.drivingLicenceNumber}
                    onChange={handleChange}
                    className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe]"
                  />
                </div>
              </div>
            </div>

            {/* BANK DETAILS SECTION */}
            <div className="space-y-3 pt-2">
              <h2 className="text-[15px] font-bold text-[#212529]">
                બેંકની વિગતો (Bank Details)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-normal text-[#212529] mb-1">
                    બેંકનું નામ (Bank Name)
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-normal text-[#212529] mb-1">
                    એકાઉન્ટ નંબર (Account Number)
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-normal text-[#212529] mb-1">
                    IFSC કોડ
                  </label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleChange}
                    className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-normal text-[#212529] mb-1">
                    શાખા (Branch)
                  </label>
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe]"
                  />
                </div>
              </div>
            </div>

            {/* OTHER DETAILS SECTION */}
            <div className="space-y-3 pt-2">
              <h2 className="text-[15px] font-bold text-[#212529]">
                અન્ય વિગતો (Other Details)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-normal text-[#212529] mb-1">
                    PRAN નંબર
                  </label>
                  <input
                    type="text"
                    name="pranNumber"
                    value={formData.pranNumber}
                    onChange={handleChange}
                    className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-normal text-[#212529] mb-1">
                    CPF/GPF નંબર
                  </label>
                  <input
                    type="text"
                    name="cpfGpfNumber"
                    value={formData.cpfGpfNumber}
                    onChange={handleChange}
                    className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe]"
                  />
                </div>
              </div>

              {/* 3 Higher Pay Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[13px] font-normal text-[#212529] mb-1">
                    પ્રથમ ઉચ્ચતર મળ્યા તારીખ
                  </label>
                  <input
                    type="date"
                    name="firstHigherPayDate"
                    value={formData.firstHigherPayDate}
                    onChange={handleChange}
                    className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-normal text-[#212529] mb-1">
                    દ્વિતીય ઉચ્ચતર મળ્યા તારીખ
                  </label>
                  <input
                    type="date"
                    name="secondHigherPayDate"
                    value={formData.secondHigherPayDate}
                    onChange={handleChange}
                    className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-normal text-[#212529] mb-1">
                    તૃતીય ઉચ્ચતર મળ્યા તારીખ
                  </label>
                  <input
                    type="date"
                    name="thirdHigherPayDate"
                    value={formData.thirdHigherPayDate}
                    onChange={handleChange}
                    className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe]"
                  />
                </div>
              </div>

              {/* Retirement Date */}
              <div className="md:w-1/2 md:pr-2">
                <label className="block text-[13px] font-normal text-[#212529] mb-1">
                  નિવૃત્તિ તારીખ
                </label>
                <input
                  type="date"
                  name="retirementDate"
                  value={formData.retirementDate}
                  onChange={handleChange}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe]"
                />
              </div>

              {/* Achievements */}
              <div>
                <label className="block text-[13px] font-normal text-[#212529] mb-1">
                  શ્રેષ્ઠ કામગીરી વિગત (Achievements)
                </label>
                <textarea
                  rows={4}
                  name="achievements"
                  value={formData.achievements}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] focus:outline-none focus:border-[#86b7fe]"
                ></textarea>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4 flex items-center justify-center no-print">
              <button
                type="submit"
                className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white font-medium text-[14px] px-8 py-2 rounded-[4px] transition-colors cursor-pointer shadow-none"
              >
                Save Profile
              </button>
            </div>
          </div>
        </form>

        {/* FOOTER */}
        <footer className="pt-6 pb-2 flex items-center justify-between text-[13px] text-[#6c757d] font-normal no-print">
          <p>સંપર્ક: support@apnaschool.in</p>
          <p className="text-[#212529]">અપના સ્કૂલ</p>
        </footer>
      </main>

      {/* ADD EDUCATION MODAL */}
      {showEduModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[6px] border border-[#dee2e6] max-w-md w-full shadow-xl p-5 space-y-4 text-xs font-gujarati">
            <div className="flex justify-between items-center border-b border-[#dee2e6] pb-2">
              <h3 className="font-bold text-[#212529] text-[14px]">શૈક્ષણિક લાયકાત ઉમેરો (Add Education)</h3>
              <button
                type="button"
                onClick={() => setShowEduModal(false)}
                className="text-[#6c757d] hover:text-[#212529] text-base"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[#212529] font-normal mb-1">ડિગ્રી / કોર્સ (Degree) *</label>
                <input
                  type="text"
                  placeholder="उदा. B.Sc., B.Ed., M.A."
                  value={newEdu.degree}
                  onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                  className="w-full h-[36px] px-3 border border-[#dee2e6] rounded-[4px]"
                />
              </div>

              <div>
                <label className="block text-[#212529] font-normal mb-1">યુનિવર્સિટી / બોર્ડ (University/Board)</label>
                <input
                  type="text"
                  placeholder="उदा. Gujarat University"
                  value={newEdu.university}
                  onChange={(e) => setNewEdu({ ...newEdu, university: e.target.value })}
                  className="w-full h-[36px] px-3 border border-[#dee2e6] rounded-[4px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#212529] font-normal mb-1">ઉત્તીર્ણ વર્ષ (Year)</label>
                  <input
                    type="text"
                    placeholder="उदा. 2018"
                    value={newEdu.year}
                    onChange={(e) => setNewEdu({ ...newEdu, year: e.target.value })}
                    className="w-full h-[36px] px-3 border border-[#dee2e6] rounded-[4px]"
                  />
                </div>
                <div>
                  <label className="block text-[#212529] font-normal mb-1">ટકાવારી (Percentage %)</label>
                  <input
                    type="text"
                    placeholder="उदा. 74.50"
                    value={newEdu.percentage}
                    onChange={(e) => setNewEdu({ ...newEdu, percentage: e.target.value })}
                    className="w-full h-[36px] px-3 border border-[#dee2e6] rounded-[4px]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#dee2e6]">
              <button
                type="button"
                onClick={() => setShowEduModal(false)}
                className="px-3 py-1.5 border border-[#dee2e6] rounded-[4px] text-[#495057]"
              >
                રદ કરો
              </button>
              <button
                type="button"
                onClick={handleAddEducation}
                className="px-4 py-1.5 bg-[#0d6efd] text-white font-medium rounded-[4px]"
              >
                ઉમેરો
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
