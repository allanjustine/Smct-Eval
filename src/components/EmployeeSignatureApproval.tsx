// src/components/EmployeeSignatureApproval.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useEmployeeSignatureApproval } from '@/hooks/useEvaluationRecords';
import { EvaluationRecord } from '@/lib/evaluationRecordsService';
import { useUser } from '@/contexts/UserContext';
import { 
  CheckCircle, 
  XCircle, 
  UserCheck, 
  Calendar, 
  FileText,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface EmployeeSignatureApprovalProps {
  isOpen: boolean;
  onClose: () => void;
  record: EvaluationRecord | null;
  onApprovalSuccess?: (record: EvaluationRecord) => void;
}

export default function EmployeeSignatureApproval({
  isOpen,
  onClose,
  record,
  onApprovalSuccess
}: EmployeeSignatureApprovalProps) {
  const { user } = useUser();
  const { approveWithSignature, loading, error } = useEmployeeSignatureApproval();
  
  const [approvalComments, setApprovalComments] = useState('');
  const [hasSignature, setHasSignature] = useState(false);

  // Check if user has signature
  useEffect(() => {
    if (user?.signature) {
      setHasSignature(true);
    } else {
      setHasSignature(false);
    }
  }, [user]);

  const handleApprove = async () => {
    if (!record || !hasSignature) return;

    try {
      const employeeName = user?.fname && user?.lname 
        ? `${user.fname} ${user.lname}` 
        : user?.fname || user?.lname || '';
      
      const approvalData = {
        employeeSignature: user?.signature || '',
        employeeName: employeeName,
        employeeEmail: user?.email || '',
        comments: approvalComments.trim() || undefined
      };

      const updatedRecord = await approveWithSignature(record.id, approvalData);
      
      if (updatedRecord && onApprovalSuccess) {
        onApprovalSuccess(updatedRecord);
      }
      
      // Reset form
      setApprovalComments('');
      onClose();
      
    } catch (err) {
      console.error('Error approving evaluation:', err);
    }
  };

  const handleClose = () => {
    setApprovalComments('');
    onClose();
  };

  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChangeAction={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5 text-blue-600" />
            <span>Employee Signature Approval</span>
          </DialogTitle>
          <DialogDescription>
            Review and approve this evaluation with your signature
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Evaluation Record Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Evaluation Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Employee:</span>
                  <p className="font-medium">{record.employeeName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Evaluator:</span>
                  <p className="font-medium">{record.evaluator}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Category:</span>
                  <Badge variant="outline">{record.category}</Badge>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Rating:</span>
                  <p className="font-medium">{record.rating}/5</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Department:</span>
                  <p className="font-medium">{record.department || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Quarter:</span>
                  <p className="font-medium">{record.quarter} {record.year}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Submitted:</span>
                  <p className="font-medium">
                    {new Date(record.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <Badge className="bg-blue-100 text-blue-800">{record.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signature Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Signature Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasSignature ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Signature Available</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">No Signature Found</span>
                </div>
              )}
              
              {!hasSignature && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div className="text-sm text-red-800">
                      <p className="font-medium">Signature Required</p>
                      <p>Please add a signature to your profile before approving evaluations.</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Approval Comments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Approval Comments (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add any comments about this evaluation approval..."
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Error</span>
                </div>
                <p className="text-sm text-red-800 mt-1">{error}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleApprove}
            disabled={!hasSignature || loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve with Signature
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Component for displaying approval status
export function ApprovalStatusDisplay({ record }: { record: EvaluationRecord }) {
  const getApprovalStatusBadge = (approvalStatus: string) => {
    switch (approvalStatus) {
      case 'pending':
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <Calendar className="h-3 w-3 mr-1" />
            Pending Approval
          </Badge>
        );
      case 'employee_approved':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <UserCheck className="h-3 w-3 mr-1" />
            Employee Approved
          </Badge>
        );
      case 'evaluator_approved':
        return (
          <Badge className="bg-purple-100 text-purple-800">
            <UserCheck className="h-3 w-3 mr-1" />
            Evaluator Approved
          </Badge>
        );
      case 'fully_approved':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Fully Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{approvalStatus}</Badge>;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">Approval Status:</span>
        {getApprovalStatusBadge(record.approvalStatus)}
      </div>
      
      {record.employeeApprovedAt && (
        <div className="text-xs text-gray-500">
          Employee approved: {new Date(record.employeeApprovedAt).toLocaleDateString()}
        </div>
      )}
      
      {record.evaluatorApprovedAt && (
        <div className="text-xs text-gray-500">
          Evaluator approved: {new Date(record.evaluatorApprovedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
