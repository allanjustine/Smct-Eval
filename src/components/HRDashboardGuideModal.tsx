'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDialogAnimation } from '@/hooks/useDialogAnimation';
import { BarChart3, Users, FileText, History, CheckCircle2, Eye, TrendingUp, Calendar, ClipboardList, Search, Filter, Building2, MapPin } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { LazyGif } from '@/components/LazyGif';

interface HRDashboardGuideModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

export function HRDashboardGuideModal({ isOpen, onCloseAction }: HRDashboardGuideModalProps) {
  const dialogAnimationClass = useDialogAnimation({ duration: 0.4 });
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());

    api.on("select", () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    });
  }, [api]);

  return (
    <>
    <Dialog open={isOpen} onOpenChangeAction={onCloseAction}>
      <DialogContent className={`max-w-4xl max-h-[90vh] p-6 flex flex-col ${dialogAnimationClass}`}>
        <DialogHeader className="pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">HR Dashboard Guide</DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                Learn how to navigate and use your HR dashboard effectively
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCloseAction}
              className="h-8 w-8 rounded-full bg-red-600 hover:bg-red-700 text-white hover:text-white hover:bg-red-500 cursor-pointer hover:scale-110 transition-transform duration-200 font-medium"
            >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
              </svg>
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          <Carousel className="w-full" setApi={setApi}>
          <CarouselContent>
            {/* Slide 1: Overview Tab */}
            <CarouselItem>
              <div className="p-2">
                <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start gap-4">
                      <div className="w-full md:w-1/2">
                        <div className="mb-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                              <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Overview Tab</h3>
                          </div>
                        </div>
                        <div className="mb-4 rounded-lg overflow-hidden bg-blue-100">
                          <LazyGif 
                            src="/comic.gif" 
                            alt="Overview Tab" 
                            shouldLoad={isOpen}
                            delay={100}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 mb-4">
                          Get a comprehensive overview of HR metrics, employee statistics, and recent evaluation activities.
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">HR Metrics</p>
                              <p className="text-sm text-gray-600">View total employees, departments, and performance distribution</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Employee Statistics</p>
                              <p className="text-sm text-gray-600">Monitor employee demographics and age distribution</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Recent Submissions</p>
                              <p className="text-sm text-gray-600">Track the latest evaluation submissions across the organization</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Tip:</strong> Use the overview to quickly assess organizational performance and identify areas needing attention.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>

            {/* Slide 2: Evaluation Records Tab */}
            <CarouselItem>
              <div className="p-2">
                <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start gap-4">
                      <div className="w-full md:w-1/2">
                        <div className="mb-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                              <ClipboardList className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Evaluation Records</h3>
                          </div>
                        </div>
                        <div className="mb-4 rounded-lg overflow-hidden bg-blue-100">
                          <LazyGif 
                            src="/data.gif" 
                            alt="Evaluation Records" 
                            shouldLoad={isOpen}
                            delay={100}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 mb-4">
                          Manage and review all evaluation submissions across the organization. Filter, approve, and track evaluation status.
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Filter className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Advanced Filtering</p>
                              <p className="text-sm text-gray-600">Filter by department, status, date range, or evaluator</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">View Details</p>
                              <p className="text-sm text-gray-600">Review complete evaluation details and approval status</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Manage Records</p>
                              <p className="text-sm text-gray-600">Delete or manage evaluation records as needed</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Tip:</strong> Use filters to quickly find specific evaluations or track evaluation completion rates.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>

            {/* Slide 3: Employees Tab */}
            <CarouselItem>
              <div className="p-2">
                <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start gap-4">
                      <div className="w-full md:w-1/2">
                        <div className="mb-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                              <Users className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Employees Tab</h3>
                          </div>
                        </div>
                        <div className="mb-4 rounded-lg overflow-hidden bg-blue-100">
                          <LazyGif 
                            src="/career.gif" 
                            alt="Employees Tab" 
                            shouldLoad={isOpen}
                            delay={100}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 mb-4">
                          Manage all employees in the organization. Add, edit, delete, and evaluate employees.
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Search className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Search & Filter</p>
                              <p className="text-sm text-gray-600">Find employees by name, department, branch, or position</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Add Employees</p>
                              <p className="text-sm text-gray-600">Create new employee records and accounts</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Evaluate Employees</p>
                              <p className="text-sm text-gray-600">Conduct performance evaluations for any employee</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Note:</strong> HR has full access to evaluate all employees across all departments and branches.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>

            {/* Slide 4: Departments & Branches Tab */}
            <CarouselItem>
              <div className="p-2">
                <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start gap-4">
                      <div className="w-full md:w-1/2">
                        <div className="mb-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Departments & Branches</h3>
                          </div>
                        </div>
                        <div className="mb-4 rounded-lg overflow-hidden bg-blue-100">
                          <LazyGif 
                            src="/dep.gif" 
                            alt="Departments & Branches" 
                            shouldLoad={isOpen}
                            delay={100}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 mb-4">
                          Manage organizational structure by creating and managing departments and branches.
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Department Management</p>
                              <p className="text-sm text-gray-600">Create, edit, and organize departments within the organization</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <MapPin className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Branch Management</p>
                              <p className="text-sm text-gray-600">Manage branch locations and assign employees to branches</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Employee Assignment</p>
                              <p className="text-sm text-gray-600">Assign employees to specific departments and branches</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Tip:</strong> Keep your organizational structure up to date for accurate reporting and filtering.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>

            {/* Slide 5: Performance Reviews Tab */}
            <CarouselItem>
              <div className="p-2">
                <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start gap-4">
                      <div className="w-full md:w-1/2">
                        <div className="mb-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                              <FileText className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Performance Reviews</h3>
                          </div>
                        </div>
                        <div className="mb-4 rounded-lg overflow-hidden bg-blue-100">
                          <LazyGif 
                            src="/docs.gif" 
                            alt="Performance Reviews" 
                            shouldLoad={isOpen}
                            delay={100}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 mb-4">
                          Access comprehensive performance reviews for all employees across the organization.
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <BarChart3 className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Review Analytics</p>
                              <p className="text-sm text-gray-600">View performance summaries and ratings across departments</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Performance Trends</p>
                              <p className="text-sm text-gray-600">Identify organizational performance patterns and improvements</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Detailed Reviews</p>
                              <p className="text-sm text-gray-600">Access complete evaluation details for any employee</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Reviews are accessible through the Analytics section in the sidebar.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>

            {/* Slide 6: Evaluation History Tab */}
            <CarouselItem>
              <div className="p-2">
                <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start gap-4">
                      <div className="w-full md:w-1/2">
                        <div className="mb-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                              <History className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Evaluation History</h3>
                          </div>
                        </div>
                        <div className="mb-4 rounded-lg overflow-hidden bg-blue-100">
                          <LazyGif 
                            src="/his.gif" 
                            alt="Evaluation History" 
                            shouldLoad={isOpen}
                            delay={100}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 mb-4">
                          View a complete chronological history of all evaluations across the organization.
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Historical Timeline</p>
                              <p className="text-sm text-gray-600">See all evaluations organized by date and period</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Search className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Advanced Search</p>
                              <p className="text-sm text-gray-600">Find evaluations by employee, department, branch, or date range</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Export & Reports</p>
                              <p className="text-sm text-gray-600">Generate reports and export evaluation data for analysis</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Tip:</strong> Use the history tab to track evaluation completion rates and identify trends.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>

            {/* Slide 7: Quick Tips */}
            <CarouselItem>
              <div className="p-2">
                <Card className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        Quick Tips & Best Practices
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Regular Monitoring</p>
                          <p className="text-gray-600">Monitor evaluation completion rates and ensure timely reviews across departments.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Data Accuracy</p>
                          <p className="text-gray-600">Keep employee records, departments, and branches up to date for accurate reporting.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Use Filters</p>
                          <p className="text-gray-600">Leverage advanced filtering options to quickly find specific employees or evaluations.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Organizational Structure</p>
                          <p className="text-gray-600">Maintain accurate department and branch information for proper employee assignment.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Performance Analysis</p>
                          <p className="text-gray-600">Use performance reviews and history to identify organizational trends and improvement areas.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
        </div>

        <div className="flex items-center justify-between pt-4 border-t flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => api?.scrollPrev()}
              disabled={!canScrollPrev}
              className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white hover:bg-green-700 cursor-pointer hover:scale-110 transition-transform duration-200 font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => api?.scrollNext()}
              disabled={!canScrollNext}
              className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white hover:bg-green-700 cursor-pointer hover:scale-110 transition-transform duration-200 s font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </div>
          <Button
            onClick={onCloseAction}
            className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white hover:bg-green-700 cursor-pointer hover:scale-110 transition-transform duration-200 shadow-md hover:shadow-lg font-medium"
          >
            Got it!
          </Button>
        </div>
        </DialogContent>
    </Dialog>
    </>
  );
}

