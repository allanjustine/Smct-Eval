'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDialogAnimation } from '@/hooks/useDialogAnimation';
import { BarChart3, Users, FileText, History, CheckCircle2, Eye, TrendingUp, Calendar, ClipboardList, Search, Filter } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { LazyGif } from '@/components/LazyGif';

interface EvaluatorDashboardGuideModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

export function EvaluatorDashboardGuideModal({ isOpen, onCloseAction }: EvaluatorDashboardGuideModalProps) {
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
              <DialogTitle className="text-2xl font-bold text-gray-900">Evaluator Dashboard Guide</DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                Learn how to navigate and use your evaluator dashboard effectively
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
                          Get a comprehensive overview of your evaluation activities and key metrics.
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Performance Metrics</p>
                              <p className="text-sm text-gray-600">View statistics on evaluations completed, pending, and in progress</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Team Overview</p>
                              <p className="text-sm text-gray-600">See the total number of employees under your evaluation</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Recent Activity</p>
                              <p className="text-sm text-gray-600">Track your latest evaluation submissions and updates</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Tip:</strong> Use the overview to quickly assess your evaluation workload and prioritize tasks.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>

            {/* Slide 2: Employees Tab */}
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
                          Manage and evaluate employees assigned to you. Filter by department, branch, or search by name.
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Search className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Search & Filter</p>
                              <p className="text-sm text-gray-600">Quickly find employees by name, department, or branch</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">View Details</p>
                              <p className="text-sm text-gray-600">Click on an employee to view their profile and evaluation history</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Start Evaluation</p>
                              <p className="text-sm text-gray-600">Click "Evaluate" to begin a new performance evaluation</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Area Managers see Branch Heads, while Branch Managers see their assigned employees.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>

            {/* Slide 3: Evaluation Records Tab */}
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
                          Review and manage all evaluation submissions. Track approval status and take necessary actions.
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Filter className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Status Filtering</p>
                              <p className="text-sm text-gray-600">Filter by pending, approved, or fully approved evaluations</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Approval Actions</p>
                              <p className="text-sm text-gray-600">Approve or view evaluation details with employee signatures</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">View Results</p>
                              <p className="text-sm text-gray-600">Review detailed evaluation scores and feedback</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Tip:</strong> New submissions are highlighted in yellow. Fully approved evaluations appear in blue.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>

            {/* Slide 4: Performance Reviews Tab */}
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
                          Access comprehensive performance reviews for all employees you've evaluated.
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <BarChart3 className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Review Summary</p>
                              <p className="text-sm text-gray-600">View overall ratings and performance breakdowns</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <History className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Historical Comparison</p>
                              <p className="text-sm text-gray-600">Compare current performance with previous evaluations</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Performance Trends</p>
                              <p className="text-sm text-gray-600">Identify improvement areas and strengths</p>
                            </div>
                          </div>
                        </div>
                            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Reviews include both evaluations you've created and evaluations where you are the employee.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>

            {/* Slide 5: Evaluation History Tab */}
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
                          View a complete chronological history of all evaluations you've conducted or received.
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Timeline View</p>
                              <p className="text-sm text-gray-600">See all evaluations organized by date and period</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Search className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Search & Filter</p>
                              <p className="text-sm text-gray-600">Find specific evaluations by employee, date, or status</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Detailed Records</p>
                              <p className="text-sm text-gray-600">Access full evaluation details and download reports</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Tip:</strong> Use the history tab to track evaluation patterns and ensure timely reviews.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>

            {/* Slide 6: Quick Tips */}
            <CarouselItem>
              <div className="p-2">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
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
                          <p className="font-medium text-gray-900">Regular Evaluations</p>
                          <p className="text-gray-600">Conduct evaluations consistently to maintain accurate performance records.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Timely Approvals</p>
                          <p className="text-gray-600">Review and approve pending evaluations promptly to keep the process moving.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Use Filters</p>
                          <p className="text-gray-600">Leverage search and filter options to quickly find specific employees or evaluations.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" /> 
                        <div>
                          <p className="font-medium text-gray-900">Review History</p>
                          <p className="text-gray-600">Check evaluation history to identify trends and provide consistent feedback.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Signature Management</p>
                          <p className="text-gray-600">Ensure your signature is up to date for evaluation approvals.</p>
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
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </div>
          <Button
            onClick={onCloseAction}
            className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white hover:bg-green-700 cursor-pointer hover:scale-110 transition-transform duration-200 font-medium"
          >
            Got it!
          </Button>
        </div>
        </DialogContent>
    </Dialog>
    </>
  );
}

