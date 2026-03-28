'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDialogAnimation } from '@/hooks/useDialogAnimation';
import { Users, Building2, UserCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface HowItWorksModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

export function HowItWorksModal({ isOpen, onCloseAction }: HowItWorksModalProps) {
  const dialogAnimationClass = useDialogAnimation({ duration: 0.4 });

  return (
    <Dialog open={isOpen} onOpenChangeAction={onCloseAction}>
      <DialogContent className={`max-w-4xl max-h-[90vh] p-6 ${dialogAnimationClass}`}>
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                How Branch Management Works
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600 mt-2">
                Learn how our hierarchical branch management system streamlines employee evaluations and organizational structure
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCloseAction}
              className="h-10 w-10 p-0 hover:bg-gray-100 bg-blue-600 text-white rounded-full hover:text-white hover:bg-red-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
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

        <Carousel className="w-full">
          <CarouselContent>
            {/* Slide 1: Organizational Hierarchy */}
            <CarouselItem>
              <div className="p-2">
                <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Organizational Hierarchy</h3>
                        <p className="text-gray-700 mb-4">
                          Our system uses a three-tier management structure to efficiently organize and evaluate employees across multiple branches.
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-sm">1</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Area Manager</p>
                              <p className="text-sm text-gray-600">Oversees multiple branches and evaluates Branch Managers</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <ArrowRight className="w-5 h-5 text-gray-400 ml-4" />
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-sm">2</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Branch Manager</p>
                              <p className="text-sm text-gray-600">Manages one or more branches and evaluates regular employees</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <ArrowRight className="w-5 h-5 text-gray-400 ml-4" />
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-sm">3</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Employees</p>
                              <p className="text-sm text-gray-600">Regular staff members who receive evaluations from their Branch Managers</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>

            {/* Slide 2: Key Features */}
            <CarouselItem>
              <div className="p-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    Key Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border border-gray-200 hover:border-blue-300 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Multi-Branch Support</h4>
                            <p className="text-sm text-gray-600">
                              Branch Managers and Area Managers can be assigned to multiple branches, allowing flexible organizational structures.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-gray-200 hover:border-blue-300 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <UserCheck className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Role-Based Access</h4>
                            <p className="text-sm text-gray-600">
                              Each role sees only the employees they're responsible for evaluating, ensuring clear accountability.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-gray-200 hover:border-blue-300 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Building2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Easy Assignment</h4>
                            <p className="text-sm text-gray-600">
                              Admins can easily assign branches to managers through an intuitive interface in the admin panel.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-gray-200 hover:border-blue-300 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Automatic Filtering</h4>
                            <p className="text-sm text-gray-600">
                              The system automatically filters employees based on branch assignments, making management effortless.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CarouselItem>

            {/* Slide 3: How It Works Steps */}
            <CarouselItem>
              <div className="p-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">1</span>
                        </div>
                      </div>
                      <div className="flex-1 pt-2">
                        <h4 className="font-semibold text-gray-900 mb-1">Admin Sets Up Structure</h4>
                        <p className="text-sm text-gray-600">
                          Administrators use the admin panel to assign Area Managers to oversee multiple branches, and Branch Managers to manage specific branches.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">2</span>
                        </div>
                      </div>
                      <div className="flex-1 pt-2">
                        <h4 className="font-semibold text-gray-900 mb-1">Managers See Their Teams</h4>
                        <p className="text-sm text-gray-600">
                          Area Managers see only Branch Managers from their assigned branches. Branch Managers see only employees from their assigned branches.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">3</span>
                        </div>
                      </div>
                      <div className="flex-1 pt-2">
                        <h4 className="font-semibold text-gray-900 mb-1">Evaluations Flow Down</h4>
                        <p className="text-sm text-gray-600">
                          Area Managers evaluate Branch Managers. Branch Managers evaluate regular employees. Each evaluation is tracked and stored in the system.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">4</span>
                        </div>
                      </div>
                      <div className="flex-1 pt-2">
                        <h4 className="font-semibold text-gray-900 mb-1">Track Performance</h4>
                        <p className="text-sm text-gray-600">
                          All evaluations are stored in performance review history, allowing managers to track progress over time and make data-driven decisions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>

            {/* Slide 4: Example Structure */}
            <CarouselItem>
              <div className="p-2">
                <Card className="bg-gray-50 border border-gray-200">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 text-lg">Example Structure</h4>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600 text-white">Area Manager: John Doe</Badge>
                        <span className="text-gray-500">→</span>
                        <span>Manages: Cebu Branch, Manila Branch</span>
                      </div>
                      <div className="flex items-center gap-2 ml-6">
                        <Badge className="bg-indigo-600 text-white">Branch Manager: Jane Smith</Badge>
                        <span className="text-gray-500">→</span>
                        <span>Manages: Cebu Branch employees</span>
                      </div>
                      <div className="flex items-center gap-2 ml-12">
                        <Badge className="bg-purple-600 text-white">Employees</Badge>
                        <span className="text-gray-500">→</span>
                        <span>Evaluated by: Jane Smith</span>
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">
                        <strong className="text-gray-900">Note:</strong> This hierarchical structure ensures clear lines of responsibility and makes it easy to track performance across all levels of the organization.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>

        <div className="flex justify-between items-center pt-4 border-t mt-6">
          <div className="text-sm text-gray-500">
            Use arrows to navigate
          </div>
          <Button
            onClick={onCloseAction}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

