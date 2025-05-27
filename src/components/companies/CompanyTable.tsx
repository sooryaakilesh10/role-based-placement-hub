
import React, { useState } from 'react';
import { Company } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Plus, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api';

interface CompanyTableProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function CompanyTable({ companies, onEdit, onDelete, onAdd }: CompanyTableProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCompanies = companies.filter(company =>
    company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.companyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.drive.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canCreateDelete = user?.role === 'Admin' || user?.role === 'Manager';
  const canExport = user?.role === 'Admin' || user?.role === 'Manager';

  const handleExport = async () => {
    try {
      await apiService.downloadCompaniesExcel();
      toast({
        title: "Export Successful",
        description: "Companies data has been exported to Excel.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export companies data.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80"
          />
          {canExport && (
            <Button onClick={handleExport} variant="outline" className="flex items-center">
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          )}
        </div>
        {canCreateDelete && (
          <Button onClick={onAdd} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Drive</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Contact Status</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Assigned Officer</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompanies.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="font-medium">{company.companyName}</TableCell>
                <TableCell>{company.companyAddress}</TableCell>
                <TableCell>{company.drive}</TableCell>
                <TableCell>{company.typeOfDrive}</TableCell>
                <TableCell>
                  <Badge variant={company.isContacted ? "default" : "secondary"}>
                    {company.isContacted ? "Contacted" : "Not Contacted"}
                  </Badge>
                </TableCell>
                <TableCell>{company.package}</TableCell>
                <TableCell>{company.assignedOfficer}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => onEdit(company)}
                      size="sm"
                      variant="outline"
                      className="flex items-center"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {canCreateDelete && (
                      <Button
                        onClick={() => onDelete(company.id)}
                        size="sm"
                        variant="outline"
                        className="flex items-center text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
