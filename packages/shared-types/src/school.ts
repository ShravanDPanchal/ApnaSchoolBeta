import { Gender, StudentStatus, SchoolType, SchoolMedium, SchoolBoard, UserRole } from './enums';

export interface TenantDto {
  id: string;
  name: string;
  slug: string;
  code: string;
  isActive: boolean;
  subscriptionPlan?: string;
  subscriptionExpiresAt?: string;
  createdAt: string;
}

export interface SchoolDto {
  id: string;
  tenantId: string;
  nameEn: string;
  nameGu: string;
  code: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  taluka?: string;
  state?: string;
  pinCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  principalName?: string;
  schoolType: SchoolType;
  medium: SchoolMedium;
  board: SchoolBoard;
  registrationNo?: string;
  diseCode?: string;
  isActive: boolean;
}

export interface AcademicYearDto {
  id: string;
  tenantId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isActive: boolean;
}

export interface FinancialYearDto {
  id: string;
  tenantId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isClosed: boolean;
  isActive: boolean;
}

export interface ClassDto {
  id: string;
  tenantId: string;
  nameEn: string;
  nameGu: string;
  numericOrder: number;
  isActive: boolean;
  divisions?: DivisionDto[];
}

export interface DivisionDto {
  id: string;
  tenantId: string;
  classId: string;
  nameEn: string;
  nameGu: string;
  capacity?: number;
  isActive: boolean;
}

export interface SubjectDto {
  id: string;
  tenantId: string;
  nameEn: string;
  nameGu: string;
  code: string;
  subjectType: string;
  isActive: boolean;
}

export interface StudentDto {
  id: string;
  tenantId: string;
  userId?: string;
  grNumber: string;
  admissionNo?: string;
  firstNameEn: string;
  middleNameEn?: string;
  lastNameEn: string;
  firstNameGu: string;
  middleNameGu?: string;
  lastNameGu: string;
  fullNameEn?: string;
  fullNameGu?: string;
  gender: Gender;
  dateOfBirth: string;
  dobInWords?: string;
  bloodGroup?: string;
  aadhaarNumber?: string;
  apaarId?: string;
  ctsUniqueId?: string;
  addressLine1?: string;
  city?: string;
  district?: string;
  pinCode?: string;
  phone?: string;
  email?: string;
  photoUrl?: string;
  admissionDate?: string;
  previousSchool?: string;
  category?: string; // General, OBC, SC, ST, EWS
  religion?: string;
  status: StudentStatus;
  currentClass?: string;
  currentDivision?: string;
  rollNumber?: number;
}

export interface StaffDto {
  id: string;
  tenantId: string;
  userId?: string;
  employeeId: string;
  firstNameEn: string;
  middleNameEn?: string;
  lastNameEn: string;
  firstNameGu: string;
  middleNameGu?: string;
  lastNameGu: string;
  gender?: Gender;
  phone?: string;
  email?: string;
  photoUrl?: string;
  designation: string;
  department?: string;
  qualification?: string;
  joiningDate?: string;
  staffType: 'TEACHING' | 'NON_TEACHING';
  status: 'ACTIVE' | 'INACTIVE';
}

export interface UserSessionDto {
  userId: string;
  tenantId: string;
  email?: string;
  phone?: string;
  preferredLocale: 'gu' | 'en';
  role: UserRole;
  permissions: string[];
  schoolNameEn: string;
  schoolNameGu: string;
  schoolLogo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  currentAcademicYearId?: string;
  currentFinancialYearId?: string;
}
