
import React, { useState, useEffect } from 'react';
import { Company } from '@/types';
import { CompanyTable } from '@/components/companies/CompanyTable';
import { toast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function Companies() {
  const queryClient = useQueryClient();
  
  const { data: companies = [], isLoading, error } = useQuery({
    queryKey: ['companies'],
    queryFn: apiService.getCompanies,
  });

  const deleteMutation = useMutation({
    mutationFn: apiService.deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({
        title: "Success",
        description: "Company deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (company: Company) => {
    toast({
      title: "Edit Company",
      description: `Opening edit form for ${company.companyName}`,
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAdd = () => {
    toast({
      title: "Add Company",
      description: "Opening new company form",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading companies. Please try again.</p>
      </div>
    );
  }

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
