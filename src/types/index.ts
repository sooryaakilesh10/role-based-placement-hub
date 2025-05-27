
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Officer';
  createdAt: string;
}

export interface Company {
  id: string;
  companyName: string;
  companyAddress: string;
  drive: string;
  typeOfDrive: string;
  followUp: string;
  isContacted: boolean;
  remarks: string;
  contactDetails: string;
  hr1Details: string;
  hr2Details: string;
  package: string;
  assignedOfficer: string;
  createdAt: string;
  updatedAt: string;
}

export interface PendingUpdate {
  id: string;
  companyId: string;
  originalData: Partial<Company>;
  updatedData: Partial<Company>;
  officerId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}
