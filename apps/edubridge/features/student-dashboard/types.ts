export type FamilyNavItem = {
  id: string;
  title: string;
  href: string;
  icon: string;
};

export type FamilyStudentSummary = {
  id: string;
  fullName: string;
  admissionNumber: string;
  classLabel: string | null;
};

export type FamilyFeeHint = {
  dueInr: number;
  hasPlan: boolean;
};

export type DirectoryStudentRow = {
  id: string;
  fullName: string;
  admissionNumber: string;
  dateOfBirth: string;
  photoUrl: string | null;
  classCaption: string;
  guardianName: string | null;
};
