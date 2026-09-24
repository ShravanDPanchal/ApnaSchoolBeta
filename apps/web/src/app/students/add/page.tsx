'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api-client';

function AddStudentContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultStd = searchParams.get('std') || 'std1';

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    rollNumber: '',
    firstNameGu: '',
    middleNameGu: '',
    lastNameGu: '',
    firstNameEn: '',
    middleNameEn: '',
    lastNameEn: '',
    standard: defaultStd,
    section: 'A',
    gender: 'પુરુષ',
    grNumber: '',
    diseCode: '',
    aadhaarNumber: '',
    apaarId: '',
    ctsUniqueId: '',
    dateOfBirth: '',
    birthPlace: '',
    birthMark: '',
    admissionDate: new Date().toISOString().split('T')[0],
    admissionStandard: defaultStd,
    previousSchool: '',
    feeCategory: 'ફી ભરીને',
    parentFirstNameGu: '',
    parentGrandfatherNameGu: '',
    parentOccupation: '',
    motherNameGu: '',
    motherOccupation: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    city: 'રાજકોટ',
    pinCode: '',
    phone: '',
    bankName: '',
    branch: '',
    ifscCode: '',
    accountHolderName: '',
    accountNumber: '',
    rationCardNumber: '',
    religion: 'હિન્દુ',
    category: 'GENERAL',
    caste: '',
    subCaste: '',
    height: '',
    weight: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [clsRes, ayRes] = await Promise.all([
          fetchApi('/school/classes'),
          fetchApi('/school/academic-years'),
        ]);
        if (clsRes.data) setClassesList(clsRes.data);
        if (ayRes.data) setAcademicYears(ayRes.data);
      } catch (err) {
        console.error('Failed loading classes', err);
      }
    }
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const validateForm = (): string | null => {
    if (!formData.firstNameGu.trim() && !formData.firstNameEn.trim()) {
      return 'વિદ્યાર્થીનું નામ દાખલ કરવું ફરજિયાત છે.';
    }
    if (!formData.lastNameGu.trim() && !formData.lastNameEn.trim()) {
      return 'વિદ્યાર્થીની અટક દાખલ કરવી ફરજિયાત છે.';
    }
    if (!formData.grNumber.trim()) {
      return 'GR નંબર દાખલ કરવો ફરજિયાત છે.';
    }
    if (!formData.dateOfBirth) {
      return 'જન્મ તારીખ દાખલ કરવી ફરજિયાત છે.';
    }

    const birthDateObj = new Date(formData.dateOfBirth);
    if (isNaN(birthDateObj.getTime()) || birthDateObj > new Date()) {
      return 'અમાન્ય જન્મ તારીખ! જન્મ તારીખ ભવિષ્યની ન હોઈ શકે.';
    }

    if (formData.phone.trim()) {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        return 'સંપર્ક નંબર બરાબર ૧૦ અંકનો અને 6-9 થી શરૂ થતો હોવો જોઈએ.';
      }
    }

    if (formData.aadhaarNumber.trim()) {
      const cleanAadhaar = formData.aadhaarNumber.replace(/\D/g, '');
      if (cleanAadhaar.length !== 12) {
        return 'આધાર નંબર બરાબર ૧૨ અંકનો હોવો જોઈએ.';
      }
    }

    if (formData.apaarId.trim()) {
      const cleanApaar = formData.apaarId.replace(/\D/g, '');
      if (cleanApaar.length !== 12) {
        return 'APAAR ID બરાબર ૧૨ અંકનો હોવો જોઈએ.';
      }
    }

    if (formData.ctsUniqueId.trim()) {
      const cleanCts = formData.ctsUniqueId.replace(/\D/g, '');
      if (cleanCts.length !== 18) {
        return 'CTS ચાઈલ્ડ ટ્રેકિંગ ID બરાબર ૧૮ અંકનો હોવો જોઈએ.';
      }
    }

    if (formData.diseCode.trim()) {
      const cleanDise = formData.diseCode.replace(/\D/g, '');
      if (cleanDise.length !== 11) {
        return 'DISE નંબર બરાબર ૧૧ અંકનો હોવો જોઈએ.';
      }
    }

    if (formData.pinCode.trim()) {
      const cleanPin = formData.pinCode.replace(/\D/g, '');
      if (cleanPin.length !== 6) {
        return 'પીનકોડ બરાબર ૬ અંકનો હોવો જોઈએ.';
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
    setSuccessMessage(null);

    const validationErr = validateForm();
    if (validationErr) {
      setErrorMessage(validationErr);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);

    try {
      let targetClass = classesList.find(
        (c) => c.nameEn?.toLowerCase() === formData.standard.toLowerCase() ||
               c.code?.toLowerCase() === formData.standard.toLowerCase() ||
               c.nameGu?.includes(formData.standard)
      );
      if (!targetClass && classesList.length > 0) {
        targetClass = classesList[0];
      }

      const activeAcademicYear = academicYears.find((ay) => ay.isCurrent) || academicYears[0];
      const targetDivision = targetClass?.divisions?.find(
        (d: any) => d.nameEn === formData.section || d.nameGu === formData.section
      );

      const payload = {
        grNumber: formData.grNumber.trim(),
        firstNameGu: formData.firstNameGu.trim() || formData.firstNameEn.trim(),
        middleNameGu: formData.middleNameGu.trim() || formData.middleNameEn.trim(),
        lastNameGu: formData.lastNameGu.trim() || formData.lastNameEn.trim(),
        firstNameEn: formData.firstNameEn.trim() || formData.firstNameGu.trim(),
        middleNameEn: formData.middleNameEn.trim() || formData.middleNameGu.trim(),
        lastNameEn: formData.lastNameEn.trim() || formData.lastNameGu.trim(),
        gender: formData.gender === 'સ્ત્રી' ? 'FEMALE' : 'MALE',
        dateOfBirth: formData.dateOfBirth,
        aadhaarNumber: formData.aadhaarNumber.replace(/\D/g, '') || undefined,
        apaarId: formData.apaarId.replace(/\D/g, '') || undefined,
        ctsUniqueId: formData.ctsUniqueId.replace(/\D/g, '') || undefined,
        phone: formData.phone.replace(/\D/g, '') || undefined,
        addressLine1: formData.addressLine1.trim() || undefined,
        city: formData.city.trim() || undefined,
        pinCode: formData.pinCode.replace(/\D/g, '') || undefined,
        category: formData.category,
        religion: formData.religion,
        admissionDate: formData.admissionDate,
        previousSchool: formData.previousSchool.trim() || undefined,
        classId: targetClass?.id,
        divisionId: targetDivision?.id,
        academicYearId: activeAcademicYear?.id,
        rollNumber: formData.rollNumber ? parseInt(formData.rollNumber, 10) : undefined,
        parentFirstNameGu: formData.parentFirstNameGu.trim() || undefined,
        parentFirstNameEn: formData.middleNameEn.trim() || undefined,
        parentLastNameGu: formData.lastNameGu.trim() || undefined,
        parentLastNameEn: formData.lastNameEn.trim() || undefined,
        parentOccupation: formData.parentOccupation.trim() || undefined,
        parentPhone: formData.phone.replace(/\D/g, '') || undefined,
      };

      await fetchApi('/students', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setSuccessMessage('વિદ્યાર્થી સફળતાપૂર્વક સિસ્ટમમાં ઉમેરાયો છે!');
      setTimeout(() => {
        router.push('/students');
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'વિદ્યાર્થી ઉમેરવામાં ભૂલ આવી. ફરી પ્રયાસ કરો.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#212529] font-sans antialiased pb-12 flex flex-col justify-between font-gujarati">
      {/* TOP HEADER */}
      <header className="bg-white border-b border-[#dee2e6] py-3 px-4 sm:px-6 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1360px] w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#EEAA00] tracking-tight">
                અપના
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#389CE0] tracking-tight">
                સ્કૂલ
              </span>
            </Link>
            <Link
              href="/dashboard"
              className="text-xs text-[#6c757d] hover:text-[#0d6efd] font-normal pl-2 hidden sm:inline"
            >
              Dashboard
            </Link>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 text-sm text-[#495057] hover:text-[#212529] font-semibold py-1 px-2.5 rounded hover:bg-slate-100 transition-colors"
            >
              <span>{user?.name || 'School Admin'}</span>
              <i className="bi bi-chevron-down text-xs text-slate-500"></i>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl border border-[#dee2e6] py-1 z-50 animate-in fade-in zoom-in-95 text-sm">
                <Link
                  href="/user/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="block px-4 py-2.5 text-[#212529] hover:bg-[#f8f9fa] font-medium"
                >
                  યુઝરની વિગત
                </Link>
                <div className="border-t border-[#dee2e6] my-0.5"></div>
                <Link
                  href="/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="block px-4 py-2.5 text-[#212529] hover:bg-[#f8f9fa] font-medium"
                >
                  શાળાની વિગત
                </Link>
                <Link
                  href="/user/classroom"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="block px-4 py-2.5 text-[#212529] hover:bg-[#f8f9fa] font-medium"
                >
                  વર્ગખંડની વિગત
                </Link>
                <div className="border-t border-[#dee2e6] my-0.5"></div>
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-[#f8f9fa] font-medium"
                >
                  લોગ-આઉટ
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-6 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs text-[#6c757d]">
            <Link href="/students" className="text-[#0d6efd] hover:underline flex items-center gap-1">
              <i className="bi bi-arrow-left"></i>
              <span>વિદ્યાર્થી યાદી</span>
            </Link>
            <span>/</span>
            <span>નવો વિદ્યાર્થી પ્રવેશ (Admission)</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#212529] mb-4">
          નવો વિદ્યાર્થી ઉમેરો
        </h1>

        {/* Error / Success Alerts */}
        {errorMessage && (
          <div className="p-3 mb-4 rounded bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill shrink-0"></i>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 mb-4 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
            <i className="bi bi-check-circle-fill shrink-0"></i>
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PHOTO UPLOAD */}
          <div>
            <label className="block text-xs font-semibold text-[#6c757d] mb-2">
              વિદ્યાર્થીનો ફોટો
            </label>
            <label className="w-24 h-24 border-2 border-dashed border-[#ced4da] rounded-[4px] flex flex-col items-center justify-center cursor-pointer hover:border-[#0d6efd] bg-white transition-colors overflow-hidden">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center text-gray-500">
                  <i className="bi bi-plus-lg text-lg"></i>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>

          {/* ROLL NUMBER */}
          <div className="max-w-xs">
            <label className="block text-xs font-bold text-[#212529] mb-1">
              રોલ નંબર
            </label>
            <input
              type="number"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              placeholder="0"
              className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
            />
            <p className="text-[11px] text-[#6c757d] mt-1">
              કશુ નક્કી ન હોય તો ખાલી રાખો અથવા 0 એન્ટર કરો
            </p>
          </div>

          {/* FULL NAME (GUJARATI & ENGLISH) */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#212529] mb-1">
                પૂરું નામ (ગુજરાતીમાં) *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  name="firstNameGu"
                  value={formData.firstNameGu}
                  onChange={handleChange}
                  placeholder="નામ (ઉ.દા. આરાધ્યા)"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
                  required
                />
                <input
                  type="text"
                  name="middleNameGu"
                  value={formData.middleNameGu}
                  onChange={handleChange}
                  placeholder="પિતાનું નામ (ઉ.દા. રાજેશભાઈ)"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
                />
                <input
                  type="text"
                  name="lastNameGu"
                  value={formData.lastNameGu}
                  onChange={handleChange}
                  placeholder="અટક (ઉ.દા. પટેલ)"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6c757d] mb-1">
                Full Name (English)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  name="firstNameEn"
                  value={formData.firstNameEn}
                  onChange={handleChange}
                  placeholder="First Name (e.g. Aaradhya)"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none font-sans"
                />
                <input
                  type="text"
                  name="middleNameEn"
                  value={formData.middleNameEn}
                  onChange={handleChange}
                  placeholder="Middle Name (e.g. Rajeshbhai)"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none font-sans"
                />
                <input
                  type="text"
                  name="lastNameEn"
                  value={formData.lastNameEn}
                  onChange={handleChange}
                  placeholder="Last Name (e.g. Patel)"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none font-sans"
                />
              </div>
            </div>
          </div>

          {/* STANDARD, SECTION, GENDER */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-xs font-bold text-[#212529] mb-1">
                ધોરણ *
              </label>
              <select
                name="standard"
                value={formData.standard}
                onChange={handleChange}
                className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
              >
                <option value="balvatika">બાલવાટિકા</option>
                <option value="std1">ધોરણ 1</option>
                <option value="std2">ધોરણ 2</option>
                <option value="std3">ધોરણ 3</option>
                <option value="std4">ધોરણ 4</option>
                <option value="std5">ધોરણ 5</option>
                <option value="std6">ધોરણ 6</option>
                <option value="std7">ધોરણ 7</option>
                <option value="std8">ધોરણ 8</option>
                <option value="std9">ધોરણ 9</option>
                <option value="std10">ધોરણ 10</option>
                <option value="std11">ધોરણ 11</option>
                <option value="std12">ધોરણ 12</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#212529] mb-1">
                વર્ગ
              </label>
              <select
                name="section"
                value={formData.section}
                onChange={handleChange}
                className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
              >
                <option value="A">વર્ગ A</option>
                <option value="B">વર્ગ B</option>
                <option value="C">વર્ગ C</option>
                <option value="D">વર્ગ D</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#212529] mb-1">
                જાતિ *
              </label>
              <div className="flex items-center gap-4 py-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="gender"
                    value="પુરુષ"
                    checked={formData.gender === 'પુરુષ'}
                    onChange={handleChange}
                  />
                  <span>પુરુષ</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="gender"
                    value="સ્ત્રી"
                    checked={formData.gender === 'સ્ત્રી'}
                    onChange={handleChange}
                  />
                  <span>સ્ત્રી</span>
                </label>
              </div>
            </div>
          </div>

          {/* 1. GR વિગત & સરકારી IDs */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base font-bold text-[#212529] flex items-center gap-2 border-b pb-1">
              <i className="bi bi-book text-[#0d6efd]"></i>
              <span>GR વિગત & સરકારી IDs</span>
            </h2>

            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">GR નંબર *</label>
                <input
                  type="text"
                  name="grNumber"
                  value={formData.grNumber}
                  onChange={handleChange}
                  placeholder="ઉ.દા. 1001"
                  required
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">DISE નંબર (૧૧ અંક)</label>
                <input
                  type="text"
                  name="diseCode"
                  maxLength={11}
                  value={formData.diseCode}
                  onChange={handleChange}
                  placeholder="24090100101"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">આધાર નંબર (૧૨ અંક)</label>
                <input
                  type="text"
                  name="aadhaarNumber"
                  maxLength={12}
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  placeholder="123456789012"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">APAAR ID (૧૨ અંક)</label>
                <input
                  type="text"
                  name="apaarId"
                  maxLength={12}
                  value={formData.apaarId}
                  onChange={handleChange}
                  placeholder="APAAR ID"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none font-sans"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">CTS ID (૧૮ અંક)</label>
                <input
                  type="text"
                  name="ctsUniqueId"
                  maxLength={18}
                  value={formData.ctsUniqueId}
                  onChange={handleChange}
                  placeholder="ચાઈલ્ડ ટ્રેકિંગ ID"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">જન્મ તારીખ *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">જન્મ સ્થળ</label>
                <input
                  type="text"
                  name="birthPlace"
                  value={formData.birthPlace}
                  onChange={handleChange}
                  placeholder="રાજકોટ"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">જન્મ નિશાન (ઓળખ ચિન્હ)</label>
                <input
                  type="text"
                  name="birthMark"
                  value={formData.birthMark}
                  onChange={handleChange}
                  placeholder="ડાબા હાથે તલ"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">શાળામાં દાખલ તારીખ</label>
                <input
                  type="date"
                  name="admissionDate"
                  value={formData.admissionDate}
                  onChange={handleChange}
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">છેલ્લી શાળા</label>
                <input
                  type="text"
                  name="previousSchool"
                  value={formData.previousSchool}
                  onChange={handleChange}
                  placeholder="અગાઉની પ્રાથમિક શાળા"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">ફી સ્થિતિ</label>
                <select
                  name="feeCategory"
                  value={formData.feeCategory}
                  onChange={handleChange}
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
                >
                  <option value="ફી ભરીને">ફી ભરીને (Regular Paid)</option>
                  <option value="RTE માફી">RTE ૨૫% માફી</option>
                  <option value="દિવ્યાંગ માફી">દિવ્યાંગ વિદ્યાર્થી માફી</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. પરિવાર વિગત */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base font-bold text-[#212529] flex items-center gap-2 border-b pb-1">
              <i className="bi bi-people text-[#0d6efd]"></i>
              <span>પરિવાર વિગત</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">પિતાનું નામ</label>
                <input
                  type="text"
                  name="parentFirstNameGu"
                  value={formData.parentFirstNameGu}
                  onChange={handleChange}
                  placeholder="ઉ.દા. રમેશભાઈ"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">દાદાનું નામ</label>
                <input
                  type="text"
                  name="parentGrandfatherNameGu"
                  value={formData.parentGrandfatherNameGu}
                  onChange={handleChange}
                  placeholder="ઉ.દા. કાનજીભાઈ"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">પિતાનો વ્યવસાય</label>
                <input
                  type="text"
                  name="parentOccupation"
                  value={formData.parentOccupation}
                  onChange={handleChange}
                  placeholder="ખેતી / વેપાર / નોકરી"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">માતાનું નામ</label>
                <input
                  type="text"
                  name="motherNameGu"
                  value={formData.motherNameGu}
                  onChange={handleChange}
                  placeholder="ઉ.દા. ગીતાબેન"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">માતાનો વ્યવસાય</label>
                <input
                  type="text"
                  name="motherOccupation"
                  value={formData.motherOccupation}
                  onChange={handleChange}
                  placeholder="ગૃહકાર્ય / શિક્ષિકા"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. એડ્રેસ & સંપર્ક વિગત */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base font-bold text-[#212529] flex items-center gap-2 border-b pb-1">
              <i className="bi bi-geo-alt text-[#0d6efd]"></i>
              <span>એડ્રેસ & સંપર્ક વિગત</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">એડ્રેસ લાઇન 1</label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="ઘર / સોસાયટીનું નામ"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">ગામ / શહેર</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="રાજકોટ"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">પીનકોડ (૬ અંક)</label>
                <input
                  type="text"
                  name="pinCode"
                  maxLength={6}
                  value={formData.pinCode}
                  onChange={handleChange}
                  placeholder="360001"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none font-sans"
                />
              </div>
            </div>

            <div className="max-w-md">
              <label className="block text-xs font-bold text-[#212529] mb-1">સંપર્ક મોબાઈલ નંબર (૧૦ અંક)</label>
              <input
                type="tel"
                name="phone"
                maxLength={10}
                value={formData.phone}
                onChange={handleChange}
                placeholder="9879912345"
                className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none font-sans"
              />
            </div>
          </div>

          {/* 4. બેંક & રેશન વિગત */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base font-bold text-[#212529] flex items-center gap-2 border-b pb-1">
              <i className="bi bi-bank text-[#0d6efd]"></i>
              <span>બેંક & રેશન વિગત</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">બેન્ક નામ</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="State Bank of India"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">IFSC કોડ</label>
                <input
                  type="text"
                  name="ifscCode"
                  maxLength={11}
                  value={formData.ifscCode}
                  onChange={handleChange}
                  placeholder="SBIN0001234"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none font-sans uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">બેન્ક એકાઉન્ટ નંબર</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="123456789012"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none font-sans"
                />
              </div>
            </div>
          </div>

          {/* 5. જાતિ & કેટેગરી */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base font-bold text-[#212529] flex items-center gap-2 border-b pb-1">
              <i className="bi bi-tag text-[#0d6efd]"></i>
              <span>જાતિ & કેટેગરી</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">ધર્મ</label>
                <input
                  type="text"
                  name="religion"
                  value={formData.religion}
                  onChange={handleChange}
                  placeholder="હિન્દુ / મુસ્લિમ / જૈન"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">કેટેગરી *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
                >
                  <option value="GENERAL">General (બિન-અનામત)</option>
                  <option value="OBC">SEBC / OBC (બક્ષીપંચ)</option>
                  <option value="SC">SC (અનુસૂચિત જાતિ)</option>
                  <option value="ST">ST (અનુસૂચિત જનજાતિ)</option>
                  <option value="EWS">EWS (આર્થિક નબળા વર્ગ)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-1">જાતિ / પેટા જાતિ</label>
                <input
                  type="text"
                  name="caste"
                  value={formData.caste}
                  onChange={handleChange}
                  placeholder="લેઉવા પટેલ / આહીર / વગેરે"
                  className="w-full border border-[#ced4da] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:border-[#0d6efd] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#0d6efd] hover:bg-[#0b5ed7] text-white font-bold text-sm sm:text-base py-3 rounded-[4px] shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin"></i>
                  <span>વિદ્યાર્થી સાચવવામાં આવી રહ્યો છે...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus-fill"></i>
                  <span>વિદ્યાર્થી ઉમેરો & દાખલ કરો (Save Student)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      {/* CLEAN FOOTER */}
      <footer className="pt-6 pb-6 px-4 sm:px-6 max-w-[1360px] w-full mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-[#6c757d] border-t border-[#dee2e6] gap-2 font-gujarati">
        <p>સંપર્ક: support@apnaschool.in</p>
        <p className="font-bold text-[#212529]">અપના સ્કૂલ</p>
      </footer>
    </div>
  );
}

export default function AddStudentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center font-gujarati">લોડ થઈ રહ્યું છે...</div>}>
      <AddStudentContent />
    </Suspense>
  );
}
