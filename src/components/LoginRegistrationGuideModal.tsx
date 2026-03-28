'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDialogAnimation } from '@/hooks/useDialogAnimation';
import { LogIn, UserPlus, Shield, Users, FileText, BarChart3, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { LazyGif } from '@/components/LazyGif';

interface LoginRegistrationGuideModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

export function LoginRegistrationGuideModal({ isOpen, onCloseAction }: LoginRegistrationGuideModalProps) {
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
    <Dialog open={isOpen} onOpenChangeAction={onCloseAction}>
      <DialogContent className={`max-w-4xl max-h-[90vh] p-6 flex flex-col ${dialogAnimationClass}`}>
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Getting Started Guide
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600 mt-2">
                Learn how to log in, register, and navigate the performance evaluation system
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

        <div className="flex-1 overflow-y-auto min-h-0">
          <Carousel className="w-full" setApi={setApi}>
          <CarouselContent>
            {/* Slide 1: Login Process */}
            <CarouselItem>
              <div className="p-2">
                <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start gap-4">
                      <div className="w-full md:w-1/2">
                        <div className="mb-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                              <LogIn className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Login to Your Account</h3>
                          </div>
                        </div>
                        <div className="mb-4 rounded-lg overflow-hidden bg-blue-100">
                          <LazyGif 
                            src="/login.gif" 
                            alt="Login Process" 
                            shouldLoad={isOpen}
                            delay={100}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 mb-4">
                          Access your personalized dashboard with your username and password.
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-sm">1</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Enter Credentials</p>
                              <p className="text-sm text-gray-600">Type your username and password in the login form</p>
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
                              <p className="font-medium text-gray-900">Authentication</p>
                              <p className="text-sm text-gray-600">System verifies your credentials and loads your profile</p>
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
                              <p className="font-medium text-gray-900">Access Dashboard</p>
                              <p className="text-sm text-gray-600">You'll be redirected to your role-specific dashboard</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Tip:</strong> Check "Remember Me" to stay logged in on this device.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>

            {/* Slide 2: Registration Process */}
            <CarouselItem>
              <div className="p-2">
                <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start gap-4">
                      <div className="w-full md:w-1/2">
                        <div className="mb-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                              <UserPlus className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">New User Registration</h3>
                          </div>
                        </div>
                        <div className="mb-4 rounded-lg overflow-hidden bg-green-100">
                          <LazyGif 
                            src="/reg.gif" 
                            alt="Registration Process" 
                            shouldLoad={isOpen}
                            delay={100}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 mb-4">
                          Create a new account to access the performance evaluation system.
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-sm">1</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Fill Registration Form</p>
                              <p className="text-sm text-gray-600">Provide your personal information, position, department, and branch</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <ArrowRight className="w-5 h-5 text-gray-400 ml-4" />
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-sm">2</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Submit & Wait for Approval</p>
                              <p className="text-sm text-gray-600">Review your information and submit. Admin will review your registration</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <ArrowRight className="w-5 h-5 text-gray-400 ml-4" />
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-sm">3</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Account Activation</p>
                              <p className="text-sm text-gray-600">Once approved, you'll receive credentials to log in</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-green-100 rounded-lg">
                          <p className="text-sm text-green-800">
                            <strong>Note:</strong> All registrations require admin approval for security purposes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>

            {/* Slide 3: User Roles & Dashboards */}
            <CarouselItem>
              <div className="p-2">
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      User Roles & Dashboards
                    </h3>
                      <div className="rounded-lg overflow-hidden mb-4 bg-blue-100">
                        <LazyGif 
                          src="/user-roles-dashboards.gif" 
                          alt="User Roles & Dashboards" 
                          shouldLoad={isOpen}
                          delay={100}
                        />
                      </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border border-gray-200 hover:border-blue-300 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Admin Dashboard</h4>
                            <p className="text-sm text-gray-600">
                              Full system access to manage users, branches, departments, and view all evaluations.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-gray-200 hover:border-indigo-300 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <FileText className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">HR Dashboard</h4>
                            <p className="text-sm text-gray-600">
                              Manage employees, conduct evaluations, and track performance across the organization.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-gray-200 hover:border-purple-300 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <BarChart3 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Evaluator Dashboard</h4>
                            <p className="text-sm text-gray-600">
                              For Area Managers, Branch Managers, and Department Managers to evaluate their assigned teams.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-gray-200 hover:border-green-300 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Employee Dashboard</h4>
                            <p className="text-sm text-gray-600">
                              View your evaluations, performance reviews, and track your progress over time.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CarouselItem>

            {/* Slide 4: Quick Tips */}
            <CarouselItem>
              <div className="p-2">
                <Card className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-4 text-lg flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        Quick Tips & Help
                      </h4>
                      <div className="rounded-lg overflow-hidden mb-4 bg-blue-100">
                        <LazyGif 
                          src="/quick-tips-help.gif" 
                          alt="Quick Tips & Help" 
                          shouldLoad={isOpen}
                          delay={100}
                        />
                      </div>
                    </div>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Forgot Password?</p>
                          <p className="text-gray-600">Click "Forgot Password" on the login page to reset your credentials.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Need Help?</p>
                          <p className="text-gray-600">Contact the development team through the "Help Center" link for assistance.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Account Issues?</p>
                          <p className="text-gray-600">If your account has issues, contact the development team for assistance.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">First Time User?</p>
                          <p className="text-gray-600">Make sure to complete your profile and set up your signature for evaluations.</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Remember:</strong> Keep your login credentials secure and never share them with anyone. Contact support if you suspect unauthorized access.
                      </p>
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
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous slide</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => api?.scrollNext()}
              disabled={!canScrollNext}
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 cursor-pointer hover:scale-105 transition-all duration-300"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next slide</span>
            </Button>
          </div>
          <Button
            onClick={onCloseAction}
            className="bg-blue-600 hover:bg-green-700 text-white cursor-pointer hover:scale-105 transition-all duration-300"
          >
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

