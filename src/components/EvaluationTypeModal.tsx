"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, ArrowRight } from "lucide-react";
import { useDialogAnimation } from "@/hooks/useDialogAnimation";

interface EvaluationTypeModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onSelectEmployeeAction: () => void;
  onSelectManagerAction: () => void;
  employeeName?: string;
}

export default function EvaluationTypeModal({
  isOpen,
  onCloseAction,
  onSelectEmployeeAction,
  onSelectManagerAction,
  employeeName,
}: EvaluationTypeModalProps) {
  const dialogAnimationClass = useDialogAnimation({ duration: 0.4 });

  const handleSelectEmployee = () => {
    onSelectEmployeeAction();
    onCloseAction();
  };

  const handleSelectManager = () => {
    onSelectManagerAction();
    onCloseAction();
  };

  return (
    <Dialog open={isOpen} onOpenChangeAction={onCloseAction}>
      <DialogContent className={`max-w-4xl ${dialogAnimationClass} p-8`}>
        <DialogHeader className="px-2">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Select Evaluation Type
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-2">
            {employeeName
              ? `Choose the type of evaluation for ${employeeName}`
              : "Choose the type of evaluation you want to start"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 px-2">
          {/* Employee Evaluation Option */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-500 group"
            onClick={handleSelectEmployee}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Users className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                   Rank and File Evaluation
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Standard performance evaluation for rank and file employees.
                    Assesses job knowledge, quality of work, adaptability,
                    teamwork, reliability, ethical behavior, and customer
                    service.
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1 text-left mb-4">
                    <li>• Rank and File I & II</li>
                    <li>• 7 evaluation steps</li>
                    <li>• Standard performance metrics</li>
                  </ul>
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:scale-105 transition-transform cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectEmployee();
                  }}
                >
                  Select Rank and File Evaluation
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Manager Evaluation Option */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-green-500 group"
            onClick={handleSelectManager}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Briefcase className="w-10 h-10 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Basic Evaluation
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Comprehensive evaluation for Head Office (HO) users. Assesses
                    job knowledge, quality of work, adaptability, teamwork,
                    reliability, ethical behavior, and managerial skills.
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1 text-left mb-4">
                    <li>• Head Office (HO) Evaluation</li>
                    <li>• 8 evaluation steps</li>
                    <li>• Includes Managerial Skills assessment</li>
                  </ul>
                </div>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white group-hover:scale-105 transition-transform cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectManager();
                  }}
                >
                  Select Basic Evaluation
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-end px-2">
          <Button
            variant="outline"
            onClick={onCloseAction}
            className="px-6 bg-blue-500 hover:bg-blue-600 text-white hover:text-white cursor-pointer hover:scale-105 transition-transform duration-200"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
