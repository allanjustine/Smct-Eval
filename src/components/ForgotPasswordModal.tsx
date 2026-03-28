'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onContactDevsAction?: () => void;
}

export default function ForgotPasswordModal({ isOpen, onCloseAction, onContactDevsAction }: ForgotPasswordModalProps) {
  return (
    <Dialog open={isOpen} onOpenChangeAction={onCloseAction}>
      <DialogContent 
        className="max-w-md w-[90vw] sm:w-full px-6 py-6 animate-in zoom-in-95 duration-300"
        style={{
          animation: isOpen ? 'modalPopup 0.3s ease-out' : 'modalPopdown 0.3s ease-in'
        }}
      >
        <style jsx>{`
          @keyframes modalPopup {
            0% {
              transform: scale(0.8) translateY(20px);
              opacity: 0;
            }
            50% {
              transform: scale(1.05) translateY(-5px);
              opacity: 0.9;
            }
            100% {
              transform: scale(1) translateY(0);
              opacity: 1;
            }
          }
            @keyframes modalPopdown {
              0% {
                transform: scale(1) translateY(0);
                opacity: 1;
              }
              100% {
                transform: scale(0.8) translateY(20px);
                opacity: 0;
              }
            }
            
            @keyframes spinOnce {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
            
            .spin-once {
              animation: spinOnce 0.6s ease-in-out 0.2s;
            }
        `}</style>
        
        {/* Simple Message with Contact Link */}
        <>
          <DialogHeader>
              <div className="flex justify-center mb-4">
                <img 
                  src="/password.png" 
                  alt="Forgot Password" 
                  className="w-20 h-20 spin-once"
                />
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900 text-center">
                Forgot Your Password?
              </DialogTitle>
              <DialogDescription className="text-center text-gray-600">
                Need help resetting your password?
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 mt-6">
              {/* Main Message */}
              <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                <img 
                  src="/for.png" 
                  alt="Support" 
                  className="w-25 h-25 mx-auto mb-1"
                />  
                <p className="text-sm text-gray-600 mb-4">
                  Please contact our development team for assistance with password recovery and account access.
                </p>
                {onContactDevsAction && (
                  <Button
                    onClick={() => {
                      onCloseAction();
                      onContactDevsAction();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer hover:scale-110 transition-all duration-300"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Contact Our Developers
                  </Button>
                )}
              </div>

              {/* Back to Login */}
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={onCloseAction}
                    className="text-blue-600 hover:underline font-medium cursor-pointer"
                  >
                    Back to Login
                  </button>
                </p>
              </div>
            </div>
          </>
      </DialogContent>
    </Dialog>
  );
}
