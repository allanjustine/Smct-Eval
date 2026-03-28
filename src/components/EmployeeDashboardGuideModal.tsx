'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDialogAnimation } from '@/hooks/useDialogAnimation';
import { BarChart3, FileText, History, CheckCircle2, Eye, TrendingUp, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { LazyGif } from '@/components/LazyGif';

interface EmployeeDashboardGuideModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

export function EmployeeDashboardGuideModal({ isOpen, onCloseAction }: EmployeeDashboardGuideModalProps) {
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
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">Employee Dashboard Guide</DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                Learn how to navigate and use your employee dashboard effectively
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCloseAction}
              className="h-8 w-8 rounded-full bg-blue-600 hover:bg-red-700 text-white hover:text-white hover:bg-red-500 cursor-pointer hover:scale-110 transition-transform duration-200 font-medium"
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
                          Get a comprehensive view of your performance evaluations and key metrics.
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">View Evaluations</p>
                              <p className="text-sm text-gray-600">See all evaluations sent to you by your evaluators</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Performance Metrics</p>
                              <p className="text-sm text-gray-600">Track your overall ratings and performance trends</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Approve Evaluations</p>
                              <p className="text-sm text-gray-600">Review and approve evaluations with your signature</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Tip:</strong> Click on any evaluation card to view detailed results and approve if needed.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>

            {/* Slide 2: Performance Reviews Tab */}
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
                          Access detailed performance reviews and feedback from your evaluators.
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-sm">1</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Review Evaluations</p>
                              <p className="text-sm text-gray-600">Browse through all your performance reviews</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-sm">2</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">View Details</p>
                              <p className="text-sm text-gray-600">Click on any review to see comprehensive evaluation data</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-sm">3</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Track Progress</p>
                              <p className="text-sm text-gray-600">Monitor your performance improvements over time</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Reviews are organized by date and evaluator for easy navigation.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>

            {/* Slide 3: Evaluation History Tab */}
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
                          View your complete evaluation history and track your performance journey.
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Historical Records</p>
                              <p className="text-sm text-gray-600">Access all past evaluations organized by date</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <BarChart3 className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Quarterly Analysis</p>
                              <p className="text-sm text-gray-600">View performance breakdown by quarter</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Performance Trends</p>
                              <p className="text-sm text-gray-600">Identify patterns and improvements in your evaluations</p>
                            </div>
                          </div>
                        </div>
                          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Tip:</strong> Use the search and filter options to find specific evaluations quickly.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>

            {/* Slide 4: Quick Tips */}
            <CarouselItem>
              <div className="p-2">
                <Card className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        Quick Tips & Best Practices
                      </h3>
                      <div className="rounded-lg overflow-hidden mb-4 bg-blue-100">
                        <LazyGif 
                          src="/employee-dashboard-tips.gif" 
                          alt="Employee Dashboard Tips" 
                          shouldLoad={isOpen}
                          delay={100}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Regular Check-ins</h4>
                          <p className="text-sm text-gray-600">
                            Check your dashboard regularly to stay updated on new evaluations and reviews.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Approve Promptly</h4>
                          <p className="text-sm text-gray-600">
                            Review and approve evaluations as soon as possible to acknowledge your performance feedback.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Track Progress</h4>
                          <p className="text-sm text-gray-600">
                            Use the Evaluation History tab to identify trends and areas for improvement.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <CheckCircle2 className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Profile Signature</h4>
                          <p className="text-sm text-gray-600">
                            Make sure to add a signature to your profile to approve evaluations. Go to your profile settings to add one.
                          </p>
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

        <div className="flex justify-between items-center pt-4 border-t mt-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => api?.scrollPrev()}
              disabled={!canScrollPrev}
              className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white hover:bg-green-700 cursor-pointer hover:scale-110 transition-transform duration-200 font-medium"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous slide</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => api?.scrollNext()}
              disabled={!canScrollNext}
              className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white hover:bg-green-700 cursor-pointer hover:scale-110 transition-transform duration-200 font-medium"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next slide</span>
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

