'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function WaliSurveyFormPage() {
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // School Details from localStorage or defaults
  const [schoolInfo, setSchoolInfo] = useState({
    schoolNameGu: 'શ્રી સરસ્વતી વિદ્યા મંદિર',
    villageGu: 'ભાવનગર',
    taluka: 'ભાવનગર',
    district: 'ભાવનગર',
  });

  // Form Fields State matching Reference Image 2
  const [formDate, setFormDate] = useState('2026-09-17');
  const [standard, setStandard] = useState('');
  const [childName, setChildName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [religion, setReligion] = useState('હિન્દુ');
  const [caste, setCaste] = useState('');
  const [subCaste, setSubCaste] = useState('');
  const [dob, setDob] = useState('');
  const [dobWords, setDobWords] = useState('');

  // Birthplace
  const [birthPlace, setBirthPlace] = useState('');
  const [birthTaluka, setBirthTaluka] = useState('');
  const [birthDistrict, setBirthDistrict] = useState('');

  // Current Address
  const [currentAddress, setCurrentAddress] = useState('');
  const [currentTaluka, setCurrentTaluka] = useState('');
  const [currentDistrict, setCurrentDistrict] = useState('');
  const [sameAsCurrent, setSameAsCurrent] = useState(false);

  // Permanent Address
  const [permAddress, setPermAddress] = useState('');
  const [permTaluka, setPermTaluka] = useState('');
  const [permDistrict, setPermDistrict] = useState('');

  // Other Info
  const [motherTongue, setMotherTongue] = useState('ગુજરાતી');
  const [studentAadhaar, setStudentAadhaar] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Bank - Student
  const [studentBankAcc, setStudentBankAcc] = useState('');
  const [studentBankName, setStudentBankName] = useState('');
  const [studentIfsc, setStudentIfsc] = useState('');
  const [studentBranch, setStudentBranch] = useState('');

  // Bank - Parent
  const [parentBankAcc, setParentBankAcc] = useState('');
  const [parentBankAccName, setParentBankAccName] = useState('');
  const [parentBankName, setParentBankName] = useState('');
  const [parentIfsc, setParentIfsc] = useState('');
  const [parentBranch, setParentBranch] = useState('');

  // Other - Parent
  const [rationCardNo, setRationCardNo] = useState('');
  const [parentAadhaar, setParentAadhaar] = useState('');
  const [previousSchoolUid, setPreviousSchoolUid] = useState('');

  // Office Use
  const [grNumber, setGrNumber] = useState('');
  const [admissionDate, setAdmissionDate] = useState('2026-06-15');

  useEffect(() => {
    try {
      const savedSchool = localStorage.getItem('apna_school_details');
      if (savedSchool) {
        const d = JSON.parse(savedSchool);
        setSchoolInfo({
          schoolNameGu: d.schoolNameGu || 'શ્રી સરસ્વતી વિદ્યા મંદિર',
          villageGu: d.villageGu || 'ભાવનગર',
          taluka: d.taluka || 'ભાવનગર',
          district: d.district || 'ભાવનગર',
        });
      }
    } catch (e) {}
  }, []);

  const handleCopyCurrentAddress = () => {
    setSameAsCurrent(!sameAsCurrent);
    if (!sameAsCurrent) {
      setPermAddress(currentAddress);
      setPermTaluka(currentTaluka);
      setPermDistrict(currentDistrict);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'વાલી ફોર્મ / સર્વે ફોર્મ',
        text: 'શાળામાં દાખલ કરવા માટેનું વાલી ફોર્મ ભરો',
        url: window.location.href,
      }).catch(() => setShareModalOpen(true));
    } else {
      setShareModalOpen(true);
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
      <main className="max-w-[1000px] w-full mx-auto px-4 py-6">
        {/* Title and School Header Area matching Reference Image 2 */}
        <div className="text-center space-y-1 mb-6">
          <h1 className="text-[20px] sm:text-[22px] font-bold text-[#212529]">
            શાળામાં દાખલ કરવા માટેનું વાલી ફોર્મ (2026-27)
          </h1>
          <p className="text-[17px] font-bold text-[#212529]">
            {schoolInfo.schoolNameGu}
          </p>
          <p className="text-[13px] text-[#6c757d]">
            {schoolInfo.villageGu}, તા.{schoolInfo.taluka}, જી.{schoolInfo.district}
          </p>
          <p className="text-[12.5px] text-[#6c757d] no-print">
            જો શાળાની વિગત મુકેલી નથી, શાળાની વિગત ભરવા{' '}
            <Link href="/reports/letterpad" className="text-[#0d6efd] hover:underline font-medium">
              અહીં ક્લિક કરો.
            </Link>
          </p>
        </div>

        {/* FORM CONTAINER CARD matching Reference Image 2 */}
        <div className="bg-white border border-[#dee2e6] rounded-[6px] p-5 sm:p-7 shadow-none space-y-5">
          {/* Top Form Date */}
          <div className="max-w-xs">
            <label className="block text-[13px] font-normal text-[#212529] mb-1">
              ફોર્મ ભર્યાની તારીખ
            </label>
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
            />
          </div>

          {/* SECTION 1: વિદ્યાર્થીની વિગત */}
          <div className="space-y-3">
            <div className="bg-[#df8a00] text-white text-[14px] font-semibold px-3 py-1.5 rounded-[2px]">
              વિદ્યાર્થીની વિગત
            </div>

            <div>
              <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                ધોરણ
              </label>
              <select
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none cursor-pointer"
              >
                <option value="">-- ધોરણ પસંદ કરો --</option>
                <option value="બાલવાટિકા">બાલવાટિકા</option>
                <option value="ધોરણ ૧">ધોરણ ૧</option>
                <option value="ધોરણ ૨">ધોરણ ૨</option>
                <option value="ધોરણ ૩">ધોરણ ૩</option>
                <option value="ધોરણ ૪">ધોરણ ૪</option>
                <option value="ધોરણ ૫">ધોરણ ૫</option>
                <option value="ધોરણ ૬">ધોરણ ૬</option>
                <option value="ધોરણ ૭">ધોરણ ૭</option>
                <option value="ધોરણ ૮">ધોરણ ૮</option>
              </select>
            </div>

            <div>
              <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                બાળકનું નામ
              </label>
              <input
                type="text"
                placeholder="બાળકનું પૂરું નામ"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  પિતાનું નામ
                </label>
                <input
                  type="text"
                  placeholder="પિતાનું પૂરું નામ"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  માતાનું નામ
                </label>
                <input
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  ધર્મ
                </label>
                <input
                  type="text"
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  જાતિ
                </label>
                <input
                  type="text"
                  value={caste}
                  onChange={(e) => setCaste(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  પેટા જાતિ
                </label>
                <input
                  type="text"
                  value={subCaste}
                  onChange={(e) => setSubCaste(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  જન્મ તારીખ
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  શબ્દોમાં
                </label>
                <input
                  type="text"
                  placeholder="उदा. પંદર જૂન બે હજાર ઓગણીસ"
                  value={dobWords}
                  onChange={(e) => setDobWords(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: જન્મ સ્થળ */}
          <div className="space-y-3">
            <div className="bg-[#df8a00] text-white text-[14px] font-semibold px-3 py-1.5 rounded-[2px]">
              જન્મ સ્થળ
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  જન્મસ્થળ
                </label>
                <input
                  type="text"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  તાલુકો
                </label>
                <input
                  type="text"
                  value={birthTaluka}
                  onChange={(e) => setBirthTaluka(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  જિલ્લો
                </label>
                <input
                  type="text"
                  value={birthDistrict}
                  onChange={(e) => setBirthDistrict(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: હાલનું સરનામું */}
          <div className="space-y-3">
            <div className="bg-[#df8a00] text-white text-[14px] font-semibold px-3 py-1.5 rounded-[2px]">
              હાલનું સરનામું
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  સરનામું
                </label>
                <input
                  type="text"
                  value={currentAddress}
                  onChange={(e) => setCurrentAddress(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  તાલુકો
                </label>
                <input
                  type="text"
                  value={currentTaluka}
                  onChange={(e) => setCurrentTaluka(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  જિલ્લો
                </label>
                <input
                  type="text"
                  value={currentDistrict}
                  onChange={(e) => setCurrentDistrict(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyCurrentAddress}
              className="w-full py-1.5 border border-[#df8a00] text-[#df8a00] hover:bg-[#fff9f0] rounded-[4px] text-[13px] font-normal flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <i className={`bi ${sameAsCurrent ? 'bi-check-square-fill' : 'bi-square'}`}></i>
              હાલનું સરનામું કાયમી સરનામાં તરીકે કરો
            </button>
          </div>

          {/* SECTION 4: કાયમી સરનામું */}
          <div className="space-y-3">
            <div className="bg-[#df8a00] text-white text-[14px] font-semibold px-3 py-1.5 rounded-[2px]">
              કાયમી સરનામું
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  સરનામું
                </label>
                <input
                  type="text"
                  value={permAddress}
                  onChange={(e) => setPermAddress(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  તાલુકો
                </label>
                <input
                  type="text"
                  value={permTaluka}
                  onChange={(e) => setPermTaluka(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  જિલ્લો
                </label>
                <input
                  type="text"
                  value={permDistrict}
                  onChange={(e) => setPermDistrict(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: અન્ય માહિતી */}
          <div className="space-y-3">
            <div className="bg-[#df8a00] text-white text-[14px] font-semibold px-3 py-1.5 rounded-[2px]">
              અન્ય માહિતી
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  માતૃભાષા
                </label>
                <input
                  type="text"
                  value={motherTongue}
                  onChange={(e) => setMotherTongue(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  બાળકનો આધાર કાર્ડ નંબર
                </label>
                <input
                  type="text"
                  placeholder="xxxx-xxxx-xxxx"
                  value={studentAadhaar}
                  onChange={(e) => setStudentAadhaar(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  મોબાઈલ નંબર
                </label>
                <input
                  type="text"
                  placeholder="9876543210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  ફોન નંબર (વૈકલ્પિક)
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 6: બેંક વિગત - વિદ્યાર્થી */}
          <div className="space-y-3">
            <div className="bg-[#df8a00] text-white text-[14px] font-semibold px-3 py-1.5 rounded-[2px]">
              બેંક વિગત - વિદ્યાર્થી
            </div>
            <div>
              <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                બાળકનો બેંક ખાતા નંબર
              </label>
              <input
                type="text"
                value={studentBankAcc}
                onChange={(e) => setStudentBankAcc(e.target.value)}
                className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  બેંકનું નામ
                </label>
                <input
                  type="text"
                  value={studentBankName}
                  onChange={(e) => setStudentBankName(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  IFSC કોડ
                </label>
                <input
                  type="text"
                  placeholder="SBIN0001234"
                  value={studentIfsc}
                  onChange={(e) => setStudentIfsc(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  શાખાનું નામ
                </label>
                <input
                  type="text"
                  value={studentBranch}
                  onChange={(e) => setStudentBranch(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 7: બેંક વિગત - વાલી */}
          <div className="space-y-3">
            <div className="bg-[#df8a00] text-white text-[14px] font-semibold px-3 py-1.5 rounded-[2px]">
              બેંક વિગત - વાલી
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  વાલીનો બેંક ખાતા નંબર
                </label>
                <input
                  type="text"
                  value={parentBankAcc}
                  onChange={(e) => setParentBankAcc(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  વાલીનું બેંક ખાતા નામ
                </label>
                <input
                  type="text"
                  value={parentBankAccName}
                  onChange={(e) => setParentBankAccName(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  બેંકનું નામ
                </label>
                <input
                  type="text"
                  value={parentBankName}
                  onChange={(e) => setParentBankName(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  IFSC કોડ
                </label>
                <input
                  type="text"
                  placeholder="SBIN0001234"
                  value={parentIfsc}
                  onChange={(e) => setParentIfsc(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  શાખાનું નામ
                </label>
                <input
                  type="text"
                  value={parentBranch}
                  onChange={(e) => setParentBranch(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 8: અન્ય વિગત - વાલી */}
          <div className="space-y-3">
            <div className="bg-[#df8a00] text-white text-[14px] font-semibold px-3 py-1.5 rounded-[2px]">
              અન્ય વિગત - વાલી
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  રેશનકાર્ડ નંબર
                </label>
                <input
                  type="text"
                  value={rationCardNo}
                  onChange={(e) => setRationCardNo(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  વાલીનો આધારકાર્ડ નંબર
                </label>
                <input
                  type="text"
                  placeholder="xxxx-xxxx-xxxx"
                  value={parentAadhaar}
                  onChange={(e) => setParentAadhaar(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
            </div>
            <div>
              <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                જો વિદ્યાર્થી અન્ય શાળામાંથી આવેલ હોય તો યુઆઈડી નંબર
              </label>
              <input
                type="text"
                placeholder="18-digit CTS / UID number"
                value={previousSchoolUid}
                onChange={(e) => setPreviousSchoolUid(e.target.value)}
                className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
              />
            </div>
          </div>

          {/* SECTION 9: આચાર્ય/વર્ગ શિક્ષકે ભરવાની વિગત (મરજિયાત) */}
          <div className="space-y-3">
            <div className="bg-[#df8a00] text-white text-[14px] font-semibold px-3 py-1.5 rounded-[2px]">
              આચાર્ય/વર્ગ શિક્ષકે ભરવાની વિગત (મરજિયાત)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  જી. આર. નંબર
                </label>
                <input
                  type="text"
                  value={grNumber}
                  onChange={(e) => setGrNumber(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-normal text-[#212529] mb-1">
                  દાખલ તારીખ
                </label>
                <input
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  className="w-full h-[38px] px-3 border border-[#dee2e6] rounded-[4px] text-[13.5px] text-[#212529] bg-white focus:outline-none focus:border-[#86b7fe]"
                />
              </div>
            </div>
          </div>

          {/* PDF Download Button matching Reference Image 2 */}
          <div className="pt-2 no-print">
            <button
              type="button"
              onClick={handlePrintPdf}
              className="bg-[#198754] hover:bg-[#157347] text-white text-[13.5px] font-normal px-4 py-2 rounded-[4px] transition-colors cursor-pointer flex items-center gap-1.5 shadow-none"
            >
              <i className="bi bi-file-earmark-pdf"></i>
              PDF ડાઉનલોડ કરો
            </button>
          </div>
        </div>

        {/* Share Button Centered matching Reference Image 2 */}
        <div className="text-center pt-6 no-print">
          <button
            type="button"
            onClick={handleShare}
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
