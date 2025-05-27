
import React, { useState } from 'react';
import { PendingUpdate } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const mockPendingUpdates: PendingUpdate[] = [
  {
    id: '1',
    companyId: '1',
    originalData: {
      companyName: 'TechCorp Inc.',
      package: '₹12 LPA'
    },
    updatedData: {
      companyName: 'TechCorp Inc.',
      package: '₹14 LPA'
    },
    officerId: '3',
    status: 'pending',
    createdAt: '2024-01-20'
  },
  {
    id: '2',
    companyId: '2',
    originalData: {
      companyName: 'DataSoft Ltd.',
      isContacted: false
    },
    updatedData: {
      companyName: 'DataSoft Ltd.',
      isContacted: true
    },
    officerId: '3',
    status: 'pending',
    createdAt: '2024-01-19'
  }
];

export function PendingApprovals() {
  const [pendingUpdates, setPendingUpdates] = useState<PendingUpdate[]>(mockPendingUpdates);

  const handleApprove = (id: string) => {
    setPendingUpdates(prev => 
      prev.map(update => 
        update.id === id 
          ? { ...update, status: 'approved' as const, reviewedAt: new Date().toISOString() }
          : update
      )
    );
    toast({
      title: "Update Approved",
      description: "The changes have been approved and applied.",
    });
  };

  const handleReject = (id: string) => {
    setPendingUpdates(prev => 
      prev.map(update => 
        update.id === id 
          ? { ...update, status: 'rejected' as const, reviewedAt: new Date().toISOString() }
          : update
      )
    );
    toast({
      title: "Update Rejected",
      description: "The changes have been rejected.",
      variant: "destructive",
    });
  };

  const pendingCount = pendingUpdates.filter(u => u.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="text-gray-600 mt-2">
          Review and approve officer updates to company information.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
        <Clock className="h-5 w-5 text-blue-600 mr-3" />
        <div>
          <p className="text-blue-900 font-medium">
            {pendingCount} updates awaiting your review
          </p>
          <p className="text-blue-700 text-sm">
            Please review and approve or reject the pending changes below.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {pendingUpdates.map((update) => (
          <Card key={update.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Company Update Request</CardTitle>
                <Badge 
                  variant={
                    update.status === 'pending' ? 'default' :
                    update.status === 'approved' ? 'secondary' : 'destructive'
                  }
                >
                  {update.status.charAt(0).toUpperCase() + update.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p><strong>Submitted by:</strong> Mike Officer</p>
                  <p><strong>Date:</strong> {new Date(update.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-red-900 mb-2">Original Data</h4>
                    <div className="space-y-1 text-sm">
                      {Object.entries(update.originalData).map(([key, value]) => (
                        <p key={key}>
                          <strong>{key}:</strong> {String(value)}
                        </p>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Updated Data</h4>
                    <div className="space-y-1 text-sm">
                      {Object.entries(update.updatedData).map(([key, value]) => (
                        <p key={key}>
                          <strong>{key}:</strong> {String(value)}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {update.status === 'pending' && (
                  <div className="flex space-x-3 pt-4">
                    <Button 
                      onClick={() => handleApprove(update.id)}
                      className="flex items-center"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button 
                      onClick={() => handleReject(update.id)}
                      variant="destructive"
                      className="flex items-center"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
