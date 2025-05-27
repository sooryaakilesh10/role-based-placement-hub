
import React, { useState } from 'react';
import { Company } from '@/types';
import { CompanyTable } from '@/components/companies/CompanyTable';
import { toast } from '@/hooks/use-toast';

// Mock data
const mockCompanies: Company[] = [
  {
    id: '1',
    companyName: 'TechCorp Inc.',
    companyAddress: '123 Tech Street, Silicon Valley, CA',
    drive: 'Campus Drive 2024',
    typeOfDrive: 'On-Campus',
    followUp: 'Weekly',
    isContacted: true,
    remarks: 'Interested in CS students',
    contactDetails: 'hr@techcorp.com, +1-555-0123',
    hr1Details: 'John Smith - Sr. HR Manager',
    hr2Details: 'Sarah Johnson - Recruiter',
    package: '₹12 LPA',
    assignedOfficer: 'Mike Officer',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20'
  },
  {
    id: '2',
    companyName: 'DataSoft Ltd.',
    companyAddress: '456 Data Avenue, Austin, TX',
    drive: 'Virtual Drive 2024',
    typeOfDrive: 'Virtual',
    followUp: 'Bi-weekly',
    isContacted: false,
    remarks: 'Looking for data science roles',
    contactDetails: 'careers@datasoft.com, +1-555-0456',
    hr1Details: 'Alex Chen - Head of Talent',
    hr2Details: 'Maria Garcia - Campus Relations',
    package: '₹15 LPA',
    assignedOfficer: 'Mike Officer',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18'
  }
];

export function Companies() {
  const [companies] = useState<Company[]>(mockCompanies);

  const handleEdit = (company: Company) => {
    toast({
      title: "Edit Company",
      description: `Opening edit form for ${company.companyName}`,
    });
  };

  const handleDelete = (id: string) => {
    const company = companies.find(c => c.id === id);
    toast({
      title: "Delete Company",
      description: `Would delete ${company?.companyName}`,
      variant: "destructive",
    });
  };

  const handleAdd = () => {
    toast({
      title: "Add Company",
      description: "Opening new company form",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
        <p className="text-gray-600 mt-2">
          Manage company information and placement drives.
        </p>
      </div>

      <CompanyTable
        companies={companies}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />
    </div>
  );
}
