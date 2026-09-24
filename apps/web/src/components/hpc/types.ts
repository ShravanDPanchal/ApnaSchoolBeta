export interface CompetencyItem {
  id: string;
  code: string;
  description: string;
  sem1Level: '1' | '2' | '3' | '';
  sem2Level: '1' | '2' | '3' | '';
}

export interface DomainSection {
  id: string;
  title: string;
  competencies: CompetencyItem[];
}

export interface StudentHpcData {
  id: string;
  name: string;
  nameEn: string;
  grNo: string;
  rollNo: string;
  dob: string;
  gender: 'M' | 'F';
  fatherName: string;
  motherName: string;
  sem1Attendance: number;
  sem1TotalDays: number;
  sem2Attendance: number;
  sem2TotalDays: number;
  sem1Height: string;
  sem2Height: string;
  sem1Weight: string;
  sem2Weight: string;
  sem1HealthStatus: string;
  sem2HealthStatus: string;
  sem1TeacherRemarks: string;
  sem2TeacherRemarks: string;
  sem1ParentRemarks: string;
  sem2ParentRemarks: string;
  specialInterests: {
    sports: { sem1: string; sem2: string };
    arts: { sem1: string; sem2: string };
    music: { sem1: string; sem2: string };
    speech: { sem1: string; sem2: string };
  };
  levels: { [competencyId: string]: { sem1: '1' | '2' | '3' | ''; sem2: '1' | '2' | '3' | '' } };
}
