
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function PendingApprovals() {
  const queryClient = useQueryClient();
  
  const { data: pendingUpdates = [], isLoading } = useQuery({
    queryKey: ['pending-updates'],
    queryFn: apiService.getPendingUpdates,
  });

  const approveMutation = useMutation({
    mutationFn: apiService.approvePendingUpdate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-updates'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({
        title: "Update Approved",
        description: "The changes have been approved and applied.",
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

  const rejectMutation = useMutation({
    mutationFn: apiService.rejectPendingUpdate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-updates'] });
      toast({
        title: "Update Rejected",
        description: "The changes have been rejected.",
        variant: "destructive",
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

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const handleReject = (id: string) => {
    rejectMutation.mutate(id);
  };

  const pendingCount = pendingUpdates.filter((u: any) => u.status === 'pending').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
        {pendingUpdates.map((update: any) => (
          <Card key={update.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {update.companyName} - Update Request
                </CardTitle>
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
                  <p><strong>Submitted by:</strong> {update.officerName}</p>
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
                      disabled={approveMutation.isPending}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      {approveMutation.isPending ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button 
                      onClick={() => handleReject(update.id)}
                      variant="destructive"
                      className="flex items-center"
                      disabled={rejectMutation.isPending}
                    >
                      <X className="mr-2 h-4 w-4" />
                      {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
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
