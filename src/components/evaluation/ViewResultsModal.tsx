"use client";

import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Printer } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { CONFIG } from "../../../config/config";
import apiService from "@/lib/apiService";

type Submission = {
  id: number;
  employee: any;
  evaluator: any;
  category?: string;
  rating?: number;
  status: string;
  coverageFrom: string;
  coverageTo: string;
  reviewTypeProbationary: number;
  reviewTypeRegular: string;
  reviewTypeOthersImprovement: boolean | number;
  reviewTypeOthersCustom: string;
  priorityArea1: string;
  priorityArea2: string;
  priorityArea3: string;
  remarks: string;
  overallComments: string;
  evaluatorApprovedAt: string;
  employeeApprovedAt: string;
  created_at: string;

  //relations
  job_knowledge: any;
  adaptability: any;
  quality_of_works: any;
  teamworks: any;
  reliabilities: any;
  ethicals: any;
  customer_services: any;
  managerial_skills?: any; // For Basic HO evaluations
};

interface ApprovalData {
  id: string;
  approvedAt: string;
  employeeSignature: string;
  employeeName: string;
  employeeEmail: string;
}

interface ViewResultsModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  submission: Submission | null;
  onApprove?: (submissionId: number) => void;
  isApproved?: boolean;
  approvalData?: ApprovalData | null;
  currentUserName?: string;
  currentUserSignature?: string; // New prop for current user's signature
  showApprovalButton?: boolean; // New prop to control approval button visibility
}

// Helper functions for rating calculations
const getRatingLabel = (score: number) => {
  if (score >= 4.5) return "Outstanding";
  if (score >= 4.0) return "Exceeds Expectations";
  if (score >= 3.5) return "Meets Expectations";
  if (score >= 2.5) return "Needs Improvement";
  return "Unsatisfactory";
};

const calculateScore = (scores: string[]) => {
  const validScores = scores
    .filter((score) => score && score !== "")
    .map((score) => parseFloat(score));
  if (validScores.length === 0) return 0;
  return (
    validScores.reduce((sum, score) => sum + score, 0) / validScores.length
  );
};

const getRatingColorForLabel = (rating: string) => {
  switch (rating) {
    case "Outstanding":
    case "Exceeds Expectations":
      return "text-green-700 bg-green-100";
    case "Needs Improvement":
    case "Unsatisfactory":
      return "text-red-700 bg-red-100";
    case "Meets Expectations":
      return "text-yellow-700 bg-yellow-100";
    default:
      return "text-gray-500 bg-gray-100";
  }
};

// Function to get quarter from date
const getQuarterFromDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Unknown";

    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const year = date.getFullYear();

    if (month >= 1 && month <= 3) return `Q1 ${year}`;
    if (month >= 4 && month <= 6) return `Q2 ${year}`;
    if (month >= 7 && month <= 9) return `Q3 ${year}`;
    if (month >= 10 && month <= 12) return `Q4 ${year}`;

    return "Unknown";
  } catch (error) {
    return "Unknown";
  }
};

export default function ViewResultsModal({
  isOpen,
  onCloseAction,
  submission,
  onApprove,
  isApproved = false,
  approvalData = null,
  showApprovalButton = false,
}: ViewResultsModalProps) {
  const { user } = useUser();
  const [isApproving, setIsApproving] = useState(false);
  const [approvalError, setApprovalError] = useState("");
  const [currentApprovalData, setCurrentApprovalData] =
    useState<ApprovalData | null>(approvalData);
  const printContentRef = useRef<HTMLDivElement>(null);
  const lastApprovalDataRef = useRef<string>("");
  const [signatureLoading, setSignatureLoading] = useState(false);
  const [signatureError, setSignatureError] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Fetch employee signature for this evaluation
  // const {
  //   signature: employeeSignature,
  //   loading: signatureLoading,
  //   error: signatureError,
  // } = useemployee.signatureByEvaluation(submission?.id || null);

  // Update currentApprovalData when approvalData prop changes
  useEffect(() => {
    setCurrentApprovalData(approvalData);
    if (approvalData) {
      lastApprovalDataRef.current = JSON.stringify(approvalData);
    }
  }, [approvalData]);

  // Compute isApproved status based on current approval data
  const computedIsApproved = isApproved || !!submission?.employee?.signature;

  // Automatic refresh when approval changes are detected in localStorage
  useEffect(() => {
    if (!isOpen || !submission?.id || !user?.email) return;

    const checkForApprovalChanges = () => {
      try {
        const approvalDataKey = `approvalData_${user.email}`;
        const storedApprovals = JSON.parse(
          localStorage.getItem(approvalDataKey) || "{}"
        );
        const submissionId = submission.id.toString();
        const storedApproval = storedApprovals[submissionId];

        if (storedApproval) {
          const storedApprovalStr = JSON.stringify(storedApproval);

          // Check if approval data has changed
          if (storedApprovalStr !== lastApprovalDataRef.current) {
            lastApprovalDataRef.current = storedApprovalStr;

            // Update the approval data state
            setCurrentApprovalData({
              id: storedApproval.id || submissionId,
              approvedAt: storedApproval.approvedAt,
              employeeSignature: submission?.employee?.signature || "",
              employeeName: storedApproval.employeeName,
              employeeEmail: storedApproval.employeeEmail || user.email,
            });
          }
        }
      } catch (error) {
        console.error("Error checking for approval changes:", error);
      }
    };

    // Check immediately
    checkForApprovalChanges();

    // Set up polling to check every 2 seconds
    const intervalId = setInterval(checkForApprovalChanges, 2000);

    // Listen for storage events (for cross-tab synchronization)
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === `approvalData_${user.email}` ||
        e.key === `approvedEvaluations_${user.email}`
      ) {
        checkForApprovalChanges();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [isOpen, submission?.id, user?.email]);

  // Handle print functionality - prints the entire modal content
  const handlePrint = () => {
    if (!printContentRef.current) {
      console.warn("Print content not available");
      return;
    }

    // Clone the content without no-print elements
    const clonedContent = printContentRef.current.cloneNode(
      true
    ) as HTMLElement;
    const noPrintElements = clonedContent.querySelectorAll(".no-print");
    noPrintElements.forEach((el) => el.remove());

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      // Get all styles from the current document
      const styles = Array.from(
        document.querySelectorAll('style, link[rel="stylesheet"]')
      )
        .map((el) => {
          if (el.tagName === "STYLE") {
            return `<style>${el.innerHTML}</style>`;
          } else if (el.tagName === "LINK") {
            return `<link rel="stylesheet" href="${
              (el as HTMLLinkElement).href
            }">`;
          }
          return "";
        })
        .join("\n");

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${
              submission
                ? `Evaluation Details - ${
                    submission?.employee?.fname && submission?.employee?.lname
                      ? `${submission.employee.fname} ${submission.employee.lname}`
                      : "Unknown Employee"
                  }`
                : "Evaluation Details"
            }</title>
            ${styles}
            <style>
              @page { 
                size: 8.5in 13in; 
                margin: 1.5cm; 
              }
              @media print {
                * {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                body { 
                  font-family: Calibri, sans-serif; 
                  font-size: 9px; 
                  line-height: 1.4;
                  color: #000;
                  padding: 0;
                  margin: 40px;
                }
                * {
                  font-family: Calibri, sans-serif !important;
                  font-size: 9px !important;
                }
                .no-print { display: none !important; }
                /* Form container - no border, no padding */
                .space-y-8 {
                  border: none !important;
                  padding: 0 !important;
                  background: white !important;
                }
                /* Remove all shadow and border classes in print */
                .shadow-md,
                .shadow-sm {
                  box-shadow: none !important;
                  border: none !important;
                  background: transparent !important;
                }
                /* Remove all container backgrounds and borders except form container */
                div:not(.space-y-8) {
                  background: transparent !important;
                  background-color: transparent !important;
                }
                /* Only allow borders on tables, input lines, and form container */
                div:not(.space-y-8):not([class*="print-signature"]):not([class*="print-date"]):not([class*="print-priority"]):not([class*="print-remarks"]) {
                  border: none !important;
                }
                /* Title styling */
                h1, h2, h3 {
                  text-align: center !important;
                  margin: 5px 0 !important;
                }
                h1 {
                  font-size: 16px !important;
                  font-weight: bold !important;
                }
                h3 {
                  font-size: 14px !important;
                  font-weight: bold !important;
                  margin-top: 10px !important;
                }
                /* Completely remove all card styling in print - no borders, no backgrounds, no containers */
                [class*="Card"],
                [class*="Card"] * {
                  border: none !important;
                  box-shadow: none !important;
                  background: transparent !important;
                  background-color: transparent !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  border-radius: 0 !important;
                }
                [class*="CardContent"] {
                  padding: 0 !important;
                  border: none !important;
                  background: transparent !important;
                  background-color: transparent !important;
                }
                [class*="CardHeader"] {
                  display: none !important;
                  border: none !important;
                  background: transparent !important;
                }
                /* Remove any gray backgrounds */
                .bg-gray-50,
                .bg-gray-100,
                .bg-gray-200,
                .bg-yellow-50 {
                  background: transparent !important;
                  background-color: transparent !important;
                }
                /* Remove all borders from cards */
                .border,
                .border-b,
                .border-2,
                .border-gray-200,
                .border-gray-300 {
                  border: none !important;
                }
                /* Review Type - checkbox group style */
                .print-review-type {
                  display: flex !important;
                  flex-direction: column !important;
                  gap: 1px !important;
                  margin-top: 2px !important;
                  margin-bottom: 2px !important;
                  font-family: Calibri, sans-serif !important;
                  font-size: 12px !important;
                }
                /* Increase padding for card containing review type */
                [class*="CardContent"]:has(.print-review-type) {
                  padding: 15px !important;
                }
                .print-review-type > div {
                  display: flex !important;
                  align-items: flex-start !important;
                  gap: 8px !important;
                  text-align: left !important;
                  padding: 2px 0 !important;
                  margin: 0 !important;
                  line-height: 1.2 !important;
                }
                .print-review-type h5 {
                  font-weight: normal !important;
                  margin-bottom: 0 !important;
                  font-family: Calibri, sans-serif !important;
                  font-size: 12px !important;
                  min-width: 120px !important;
                  flex-shrink: 0 !important;
                  line-height: 1.4 !important;
                  padding: 0 !important;
                }
                .print-review-type .space-y-2,
                .print-review-type .space-y-3,
                .print-review-type .space-y-6 {
                  margin: 0 !important;
                }
                .print-review-type .space-y-2 > *,
                .print-review-type .space-y-3 > *,
                .print-review-type .space-y-6 > * {
                  margin: 0px 0 !important;
                }
                /* Horizontal rows for radio buttons */
                .print-review-type .flex-row {
                  display: flex !important;
                  flex-direction: row !important;
                  gap: 15px !important;
                  flex-wrap: wrap !important;
                }
                .print-review-type .flex-col {
                  display: flex !important;
                  flex-direction: column !important;
                  gap: 5px !important;
                }
                .print-review-type .flex {
                  display: flex !important;
                  align-items: center !important;
                  gap: 8px !important;
                }
                .print-review-type span {
                  font-family: Calibri, sans-serif !important;
                  font-size: 12px !important;
                  line-height: 1.2 !important;
                }
                /* Make checkboxes more visible in print */
                .print-review-type .w-4 {
                  width: 12px !important;
                  height: 12px !important;
                  border: 1px solid #000 !important;
                  min-width: 12px !important;
                  min-height: 12px !important;
                }
                .print-review-type .w-2 {
                  width: 5px !important;
                  height: 5px !important;
                }
                .print-review-type .bg-green-500 {
                  background-color: #22c55e !important;
                  border: 1px solid #000 !important;
                }
                .print-review-type .bg-gray-300 {
                  background-color: #d1d5db !important;
                  border: 1px solid #000 !important;
                }
                .print-review-type .w-2 {
                  width: 6px !important;
                  height: 6px !important;
                  background-color: #fff !important;
                }
                .print-review-type span {
                  font-family: Calibri, sans-serif !important;
                  font-size: 12px !important;
                  color: #000 !important;
                }
                /* Grid layout for For Regular section (2x2) */
                .print-review-type .grid {
                  display: grid !important;
                }
                .print-review-type .grid-cols-2 {
                  grid-template-columns: 1fr 1fr !important;
                }
                .print-review-type .flex {
                  display: flex !important;
                  align-items: center !important;
                  gap: 8px !important;
                }
                .print-review-type .flex-row {
                  display: flex !important;
                  flex-direction: row !important;
                  gap: 16px !important;
                }
                /* Basic Information - two column layout with horizontal alignment */
                .print-basic-info {
                  display: grid !important;
                  grid-template-columns: 1fr 1fr !important;
                  gap: 0 !important;
                  margin-top: 5px !important;
                  column-gap: 30px !important;
                  row-gap: 2px !important;
                }
                .print-basic-info > div {
                  display: flex !important;
                  justify-content: flex-start !important;
                  align-items: baseline !important;
                  gap: 4px !important;
                  margin: 0 !important;
                  font-family: Calibri, sans-serif !important;
                  font-size: 12px !important;
                  text-align: left !important;
                  padding: 0 !important;
                  line-height: 1.2 !important;
                }
                /* Row 1: Employee Name (left) | Date Hired (right) */
                .print-basic-info > div:nth-child(1) {
                  grid-column: 1 !important;
                  grid-row: 1 !important;
                }
                .print-basic-info > div:nth-child(5) {
                  grid-column: 2 !important;
                  grid-row: 1 !important;
                }
                /* Row 2: Employee Number (left) | Immediate Supervisor (right) */
                .print-basic-info > div:nth-child(2) {
                  grid-column: 1 !important;
                  grid-row: 2 !important;
                }
                .print-basic-info > div:nth-child(6) {
                  grid-column: 2 !important;
                  grid-row: 2 !important;
                }
                /* Row 3: Position (left) | Performance Coverage (right) */
                .print-basic-info > div:nth-child(3) {
                  grid-column: 1 !important;
                  grid-row: 3 !important;
                }
                .print-basic-info > div:nth-child(7) {
                  grid-column: 2 !important;
                  grid-row: 3 !important;
                }
                /* Row 4: Department/Branch (left only) */
                .print-basic-info > div:nth-child(4) {
                  grid-column: 1 !important;
                  grid-row: 4 !important;
                }
                .print-basic-info > div > label {
                  font-weight: normal !important;
                  width: auto !important;
                  flex-shrink: 0 !important;
                  margin-right: 0 !important;
                  color: #000 !important;
                  font-family: Calibri, sans-serif !important;
                  font-size: 12px !important;
                }
                .print-basic-info > div > p {
                  border-bottom: 1px solid #000 !important;
                  flex: 1 !important;
                  min-width: 0 !important;
                  height: auto !important;
                  line-height: 1 !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  padding-bottom: 1px !important;
                  text-align: left !important;
                  font-family: Calibri, sans-serif !important;
                  font-size: 12px !important;
                  font-weight: bold !important;
                }
                /* Remove block display from label in print */
                .print-basic-info .print-label {
                  display: inline !important;
                  margin-bottom: 0 !important;
                  color: #000 !important;
                }
                .print-basic-info .print-value {
                  display: inline !important;
                }
                /* Hide screen date, show print date in print */
                .screen-date {
                  display: none !important;
                }
                .print-date {
                  display: inline !important;
                }
                /* Make Performance Coverage date bigger */
                .print-basic-info .print-date {
                  font-size: 14px !important;
                  font-weight: bold !important;
                  font-family: Calibri, sans-serif !important;
                }
                /* Table styling */
                table {
                  width: 100% !important;
                  border-collapse: collapse !important;
                  margin-top: 10px !important;
                }
                table, td, th {
                  border: 1px solid #000 !important;
                  padding: 5px !important;
                  font-size: 13px !important;
                }
                th {
                  background-color: #d9d9d9 !important;
                  font-weight: bold !important;
                }
                tr { page-break-inside: avoid; }
                thead { display: table-header-group; }
                img { max-width: 100%; height: auto; page-break-inside: avoid; }
                /* Section titles */
                h4 {
                  font-weight: bold !important;
                  margin-top: 8px !important;
                  border-bottom: 2px solid #000 !important;
                  padding-bottom: 2px !important;
                  font-family: Calibri, sans-serif !important;
                  font-size: 12px !important;
                  text-transform: uppercase !important;
                  margin-bottom: 3px !important;
                }
                /* Priority Areas - remove underline from header */
                .print-priority-header {
                  border-bottom: none !important;
                  padding-bottom: 0 !important;
                  margin-bottom: 4px !important;
                }
                /* Reduce spacing between Performance Score and Priority Areas */
                [class*="Card"]:has(.print-priority-header) {
                  margin-top: 2px !important;
                  margin-bottom: 2px !important;
                }
                [class*="CardContent"]:has(.print-priority-header) {
                  padding-top: 8px !important;
                  padding-bottom: 8px !important;
                }
                /* Reduce spacing between Priority Areas and Remarks */
                [class*="Card"]:has(.print-remarks-header) {
                  margin-top: 2px !important;
                  margin-bottom: 2px !important;
                }
                [class*="CardContent"]:has(.print-remarks-header) {
                  padding-top: 8px !important;
                  padding-bottom: 8px !important;
                }
                /* Reduce spacing between Remarks and Acknowledgement */
                [class*="Card"]:has(.print-acknowledgement-header) {
                  margin-top: 2px !important;
                }
                [class*="CardContent"]:has(.print-acknowledgement-header) {
                  padding-top: 8px !important;
                }
                /* Remarks - remove underline from header */
                .print-remarks-header {
                  border-bottom: none !important;
                  padding-bottom: 0 !important;
                  margin-bottom: 4px !important;
                }
                /* Acknowledgement - remove underline from header */
                .print-acknowledgement-header {
                  border-bottom: none !important;
                  padding-bottom: 0 !important;
                  margin-bottom: 4px !important;
                }
                /* Priority Areas - underline style like basic info */
                .print-priority-item {
                  background: transparent !important;
                  background-color: transparent !important;
                  border: none !important;
                  padding: 0 !important;
                  margin: 0 !important;
                }
                .print-priority-row {
                  display: flex !important;
                  justify-content: flex-start !important;
                  align-items: baseline !important;
                  gap: 4px !important;
                  margin: 0 !important;
                  font-family: Calibri, sans-serif !important;
                  font-size: 12px !important;
                  text-align: left !important;
                  padding: 0 !important;
                }
                .print-priority-label {
                  font-weight: bold !important;
                  width: auto !important;
                  flex-shrink: 0 !important;
                  margin-right: 0 !important;
                  font-family: Calibri, sans-serif !important;
                  font-size: 12px !important;
                }
                .print-priority-value {
                  border-bottom: 1px solid #000 !important;
                  flex: 1 !important;
                  min-width: 0 !important;
                  height: auto !important;
                  line-height: 1 !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  padding-bottom: 1px !important;
                  text-align: left !important;
                  font-family: Calibri, sans-serif !important;
                  font-size: 12px !important;
                }
                /* Priority Areas description text */
                .print-priority-description {
                  font-family: Calibri, sans-serif !important;
                  font-size: 12px !important;
                  color: #000 !important;
                }
                /* Remarks - large box style */
                .print-remarks-box {
                  width: 100% !important;
                  height: 60px !important;
                  border: 1px solid #000 !important;
                  margin-top: 3px !important;
                  padding: 2px !important;
                  background: white !important;
                  background-color: white !important;
                }
                .print-remarks-box p {
                  font-family: Calibri, sans-serif !important;
                  font-size: 12px !important;
                }
                /* Remarks description text */
                [class*="CardContent"]:has(.print-remarks-box) p:not(.print-remarks-box p) {
                  font-family: Calibri, sans-serif !important;
                  font-size: 12px !important;
                }
                /* Remove gray backgrounds from remarks in print */
                .print-remarks-box .bg-yellow-50 {
                  background: transparent !important;
                  background-color: transparent !important;
                  border: none !important;
                  padding: 1px 2px !important;
                  margin: 1px 0 !important;
                }
                /* Acknowledgement section */
                .print-acknowledgement {
                  display: flex !important;
                  justify-content: space-between !important;
                  margin-top: 5px !important;
                  margin-bottom: 0 !important;
                }
                .print-acknowledgement > div {
                  width: 45% !important;
                  text-align: center !important;
                  margin: 0 !important;
                  padding: 0 !important;
                }
                /* Signature boxes - print format - remove all containers */
                .print-acknowledgement .h-20,
                .print-acknowledgement [class*="border-dashed"],
                .print-acknowledgement [class*="rounded"] {
                  border: none !important;
                  background: transparent !important;
                  background-color: transparent !important;
                  height: auto !important;
                  padding: 0 !important;
                  border-radius: 0 !important;
                }
                /* Show name text in print */
                .print-acknowledgement .h-20 > span:not(.print-signature-line) {
                  display: block !important;
                  font-family: Calibri, sans-serif !important;
                  font-size: 12px !important;
                  font-weight: bold !important;
                  margin-bottom: 5px !important;
                  position: relative !important;
                  z-index: 1 !important;
                }
                .print-signature-line {
                  border-bottom: 1px solid #000 !important;
                  width: 100% !important;
                  height: 1px !important;
                  margin-top: 5px !important;
                  display: block !important;
                  background: transparent !important;
                  position: relative !important;
                }
                /* Show signature images in print */
                .print-acknowledgement img {
                  display: block !important;
                  max-height: 40px !important;
                  max-width: 100% !important;
                  object-fit: contain !important;
                  margin: 0 auto !important;
                }
                /* Remove all rounded corners and borders from signature containers */
                .print-acknowledgement [class*="rounded-lg"],
                .print-acknowledgement [class*="border-2"] {
                  border: none !important;
                  border-radius: 0 !important;
                  background: transparent !important;
                }
                /* Date box */
                .print-date-box {
                  border-bottom: 1px solid #000 !important;
                  width: 150px !important;
                  height: 18px !important;
                  display: inline-block !important;
                  padding: 0 5px !important;
                }
                .print-date-section {
                  margin-top: 8px !important;
                  font-family: Calibri, sans-serif !important;
                  font-size: 12px !important;
                }
                /* Acknowledgement description text */
                .print-acknowledgement-description {
                  font-family: Calibri, sans-serif !important;
                  font-size: 12px !important;
                  color: #000 !important;
                }
                /* Acknowledgement text */
                .print-acknowledgement p {
                  font-family: Calibri, sans-serif !important;
                  font-size: 12px !important;
                  margin-bottom: 3px !important;
                  line-height: 1.2 !important;
                }
                /* Signature container styling in print */
                .print-acknowledgement .h-20 {
                  position: relative !important;
                  min-height: 45px !important;
                  display: flex !important;
                  flex-direction: column !important;
                  align-items: center !important;
                  justify-content: flex-end !important;
                  padding: 3px 0 0 0 !important;
                  margin: 0 !important;
                  margin-bottom: 0 !important;
                }
                /* Show name text in print - at the lower part */
                .print-acknowledgement .h-20 > span:not(.print-signature-line) {
                  display: block !important;
                  font-family: Calibri, sans-serif !important;
                  font-size: 12px !important;
                  font-weight: bold !important;
                  margin-bottom: 1px !important;
                  position: absolute !important;
                  bottom: 2px !important;
                  top: auto !important;
                  left: 50% !important;
                  transform: translateX(-50%) !important;
                  order: 1 !important;
                  z-index: 1 !important;
                  line-height: 1 !important;
                }
                /* Show signature images in print - at the lower part, positioned to the right */
                .print-acknowledgement .h-20 img,
                .print-acknowledgement .h-20 img[class*="top-7"],
                .print-acknowledgement .h-20 img[class*="top-"],
                .print-acknowledgement .h-20 img[class*="transform"],
                .print-acknowledgement .h-20 img[class*="translate"],
                .print-acknowledgement .h-20 img[class*="left-1/2"] {
                  display: block !important;
                  max-height: 40px !important;
                  max-width: 100% !important;
                  object-fit: contain !important;
                  position: absolute !important;
                  bottom: -25px !important;
                  top: auto !important;
                  right: -50px !important;
                  left: auto !important;
                  transform: none !important;
                  -webkit-transform: none !important;
                  margin: 0 !important;
                  order: 2 !important;
                  z-index: 10 !important;
                }
                /* Force override any inline styles or Tailwind utilities */
                @media print {
                  .print-acknowledgement .h-20 img {
                    bottom: -25px !important;
                    top: auto !important;
                    right: -50px !important;
                    left: auto !important;
                    transform: none !important;
                  }
                }
                /* Signature line - at the bottom */
                .print-signature-line {
                  position: relative !important;
                  width: 100% !important;
                  border-bottom: 1px solid #000 !important;
                  height: 1px !important;
                  margin-top: 0 !important;
                  margin-bottom: 0 !important;
                  padding: 0 !important;
                  order: 3 !important;
                  flex-shrink: 0 !important;
                }
                /* Label and date under the underline - print only */
                .print-acknowledgement > div > div:last-child,
                .print-acknowledgement > div > div:nth-last-child(2) {
                  margin-top: 0 !important;
                }
                .print-acknowledgement > div > div:last-child > div,
                .print-acknowledgement > div > div:nth-last-child(2) > div {
                  margin-top: 0 !important;
                  margin-bottom: 0 !important;
                }
                .print-acknowledgement > div > div:last-child > div > div,
                .print-acknowledgement > div > div:nth-last-child(2) > div > div {
                  margin-top: 0 !important;
                }
                /* Reduce spacing for signature label and date in print */
                .print-acknowledgement .text-xs.text-gray-500 {
                  margin-top: 0 !important;
                  margin-bottom: 0 !important;
                  padding-top: 0 !important;
                  font-family: Calibri, sans-serif !important;
                  font-size: 12px !important;
                  line-height: 1 !important;
                  color: #000 !important;
                }
                /* Remove all spacing between signature line and labels */
                .print-acknowledgement .h-20 + div {
                  margin-top: 0 !important;
                  padding-top: 0 !important;
                }
                /* Override mt-1 class in print - remove all margin */
                .print-acknowledgement .mt-1 {
                  margin-top: 0 !important;
                  padding-top: 0 !important;
                }
                /* Target label divs directly after signature container */
                .print-acknowledgement .text-center > .h-20 + div.text-xs {
                  margin-top: 0 !important;
                  padding-top: 0 !important;
                }
                .print-acknowledgement .text-center {
                  margin-top: 0 !important;
                  margin-bottom: 0 !important;
                  padding: 0 !important;
                  display: flex !important;
                  flex-direction: column !important;
                  justify-content: flex-end !important;
                }
                /* Move signature area lower to be closer to labels */
                .print-acknowledgement .text-center > .h-20 {
                  margin-bottom: 0 !important;
                }
                .print-acknowledgement .text-center p {
                  margin-top: 0 !important;
                  margin-bottom: 0 !important;
                  font-family: Calibri, sans-serif !important;
                  font-size: 12px !important;
                  line-height: 1 !important;
                  color: #000 !important;
                }
                /* Make all text in acknowledgement section black in print */
                .print-acknowledgement .text-gray-500 {
                  color: #000 !important;
                }
                .print-acknowledgement .print-date-value {
                  color: #000 !important;
                }
                .print-acknowledgement .space-y-4 {
                  margin: 0 !important;
                  padding: 0 !important;
                  gap: 0 !important;
                }
                .print-acknowledgement .space-y-4 > * {
                  margin-top: 0 !important;
                  margin-bottom: 0 !important;
                }
                /* Remove spacing between signature area and date (row 2) */
                .print-acknowledgement .space-y-4 > div:not(:first-child) {
                  margin-top: 0 !important;
                }
                /* Specifically target date sections */
                .print-acknowledgement .space-y-4 > div.text-center:last-child {
                  margin-top: 0 !important;
                }
                /* Confidentiality Notice */
                .print-confidentiality-notice {
                  margin-top: 12px !important;
                  margin-bottom: 8px !important;
                  padding: 8px 0 !important;
                  border-top: 1px solid #000 !important;
                  border-bottom: 1px solid #000 !important;
                }
                .print-confidentiality-notice p {
                  font-family: Calibri, sans-serif !important;
                  font-size: 10px !important;
                  color: #000 !important;
                  line-height: 1.4 !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  text-align: justify !important;
                }
                .print-confidentiality-notice strong {
                  font-weight: bold !important;
                  font-family: Calibri, sans-serif !important;
                  font-size: 12px !important;
                }
                /* Hide detailed step sections in print */
                .hide-in-print {
                  display: none !important;
                }
                /* Overall Assessment table */
                .print-overall-assessment-wrapper [class*="Card"] {
                  border: none !important;
                  box-shadow: none !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  background: transparent !important;
                }
                .print-overall-assessment-wrapper [class*="CardContent"] {
                  padding: 0 !important;
                  border: none !important;
                  background: transparent !important;
                }
                .print-overall-assessment-wrapper h3 {
                  font-size: 11px !important;
                  margin-bottom: 2px !important;
                  margin-top: 4px !important;
                  text-align: left !important;
                  font-family: Calibri, sans-serif !important;
                }
                .print-overall-assessment-table {
                  border: none !important;
                  width: 100% !important;
                  border-collapse: collapse !important;
                  margin-top: 2px !important;
                  margin-bottom: 4px !important;
                  font-size: 12px !important;
                  font-family: Calibri, sans-serif !important;
                }
                .print-overall-assessment-table th,
                .print-overall-assessment-table td {
                  border: 1px solid #000 !important;
                  padding: 1px 2px !important;
                  font-size: 12px !important;
                  text-align: center !important;
                  line-height: 1.1 !important;
                  font-family: Calibri, sans-serif !important;
                }
                .print-overall-assessment-table th {
                  background-color: #d9d9d9 !important;
                  font-weight: bold !important;
                  padding: 2px 2px !important;
                  font-size: 12px !important;
                  font-family: Calibri, sans-serif !important;
                }
                .print-overall-assessment-table td:first-child {
                  text-align: left !important;
                }
                /* Override Tailwind font-size classes in print */
                .print-overall-assessment-table th.text-base,
                .print-overall-assessment-table td.text-base,
                .print-overall-assessment-table td.text-sm,
                .print-overall-assessment-table td.text-lg {
                  font-size: 12px !important;
                }
                .print-overall-assessment-table .text-sm {
                  font-size: 12px !important;
                }
                .print-overall-assessment-table .text-base {
                  font-size: 12px !important;
                }
                .print-overall-assessment-table .text-lg {
                  font-size: 12px !important;
                }
                /* Adjust Performance Criteria column (1st column) width - smaller */
                .print-overall-assessment-table th:first-child,
                .print-overall-assessment-table td:first-child {
                  width: 60px !important;
                  min-width: 50px !important;
                  max-width: 80px !important;
                  padding: 1px 2px !important;
                  line-height: 1 !important;
                }
                /* Make Score column (3rd column) narrower */
                .print-overall-assessment-table th:nth-child(3),
                .print-overall-assessment-table td:nth-child(3) {
                  width: 18px !important;
                  min-width: 18px !important;
                  max-width: 18px !important;
                  padding: 1px 1px !important;
                  overflow: hidden !important;
                  text-overflow: ellipsis !important;
                  white-space: nowrap !important;
                }
                /* Rating column (2nd column) - smaller */
                .print-overall-assessment-table th:nth-child(2),
                .print-overall-assessment-table td:nth-child(2) {
                  width: 50px !important;
                  min-width: 50px !important;
                  max-width: 50px !important;
                  padding: 1px 2px !important;
                }
                .print-overall-assessment-table tbody tr:last-child {
                  background-color: #e8e8e8 !important;
                  font-weight: bold !important;
                }
                .print-overall-assessment-table tbody tr:last-child td:first-child {
                  text-align: right !important;
                }
                /* Hide rating badges in print - show only text */
                .screen-rating-badge {
                  display: inline;
                }
                .print-rating-text {
                  display: none;
                }
                @media print {
                  .screen-rating-badge {
                    display: none !important;
                  }
                  .print-rating-text {
                    display: inline !important;
                    background: transparent !important;
                    background-color: transparent !important;
                    padding: 0 !important;
                    border-radius: 0 !important;
                    color: #000 !important;
                    border: none !important;
                    box-shadow: none !important;
                    font-weight: normal !important;
                  }
                  .print-overall-assessment-table td div {
                    display: inline !important;
                    padding: 0 !important;
                    margin: 0 !important;
                  }
                  .print-overall-assessment-table td div.flex {
                    display: inline !important;
                    justify-content: center !important;
                    align-items: center !important;
                    gap: 0 !important;
                    space-x: 0 !important;
                  }
                }
                /* Performance Score section - boxed in print */
                .print-performance-score-wrapper {
                  display: flex !important;
                  justify-content: flex-end !important;
                  align-items: center !important;
                  gap: 8px !important;
                  margin-top: 5px !important;
                  margin-bottom: 2px !important;
                  border: 2px solid #000 !important;
                  padding: 8px 15px !important;
                  width: fit-content !important;
                  margin-left: auto !important;
                  background: white !important;
                  box-sizing: border-box !important;
                  font-family: Calibri, sans-serif !important;
                }
                .print-performance-score-wrapper > div:first-child {
                  text-align: right !important;
                  margin-right: 12px !important;
                }
                .print-performance-score-wrapper > div:first-child > div:first-child {
                  font-size: 16px !important;
                  font-weight: bold !important;
                  line-height: 1.2 !important;
                  margin: 0 !important;
                  font-family: Calibri, sans-serif !important;
                }
                .print-performance-score-wrapper > div:first-child > div:last-child {
                  font-size: 11px !important;
                  color: #000 !important;
                  margin-top: 2px !important;
                  line-height: 1.2 !important;
                  font-family: Calibri, sans-serif !important;
                }
                .print-performance-score-wrapper > div:last-child {
                  padding: 4px 10px !important;
                  border-radius: 2px !important;
                  font-size: 12px !important;
                  font-weight: bold !important;
                  line-height: 1.3 !important;
                  color: white !important;
                  display: block !important;
                  font-family: Calibri, sans-serif !important;
                }
                /* Ensure PASS/FAIL badge colors show in print */
                .print-performance-score-wrapper > div:last-child.bg-green-600 {
                  background-color: #16a34a !important;
                  color: white !important;
                }
                .print-performance-score-wrapper > div:last-child.bg-red-600 {
                  background-color: #dc2626 !important;
                  color: white !important;
                }
                /* Remove spacing between sections */
                .space-y-8 > * {
                  margin-bottom: 0 !important;
                }
                /* Print Footer */
                .print-footer {
                  display: block !important;
                  position: fixed !important;
                  bottom: 0 !important;
                  left: 0 !important;
                  right: 0 !important;
                  width: 100% !important;
                  padding: 8px 1.5cm !important;
                  margin: 0 !important;
                  border-top: 1px solid #000 !important;
                  background: white !important;
                  font-family: Calibri, sans-serif !important;
                  font-size: 10px !important;
                  line-height: 1.4 !important;
                  text-align: center !important;
                  color: #000 !important;
                }
                .print-footer p {
                  margin: 0 !important;
                  padding: 0 !important;
                  font-family: Calibri, sans-serif !important;
                  font-size: 10px !important;
                  line-height: 1.4 !important;
                  color: #000 !important;
                }
              }
            </style>
          </head>
          <body>
            ${clonedContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  if (!submission) return null;

  // Check if the evaluated employee is a branch employee (not HO)
  // Similar to how Step2.tsx checks for HO to show/hide Job Targets
  const isEmployeeBranch = () => {
    if (!submission.employee) return false;
    
    // Handle branches as array
    if (Array.isArray(submission.employee.branches)) {
      const branch = submission.employee.branches[0];
      if (branch) {
        const branchName = branch.branch_name?.toUpperCase() || "";
        const branchCode = branch.branch_code?.toUpperCase() || "";
        const isHO = (
          branchName === "HO" || 
          branchCode === "HO" || 
          branchName.includes("HEAD OFFICE") ||
          branchCode.includes("HEAD OFFICE") ||
          branchName === "HEAD OFFICE" ||
          branchCode === "HEAD OFFICE"
        );
        // Return true if NOT HO (i.e., is a branch employee)
        return !isHO;
      }
    }
    
    // Handle branches as object
    if (typeof submission.employee.branches === 'object') {
      const branchName = (submission.employee.branches as any)?.branch_name?.toUpperCase() || "";
      const branchCode = (submission.employee.branches as any)?.branch_code?.toUpperCase() || "";
      const isHO = (
        branchName === "HO" || 
        branchCode === "HO" || 
        branchName.includes("HEAD OFFICE") ||
        branchCode.includes("HEAD OFFICE") ||
        branchName === "HEAD OFFICE" ||
        branchCode === "HEAD OFFICE"
      );
      // Return true if NOT HO (i.e., is a branch employee)
      return !isHO;
    }
    
    // Fallback: check if branch field exists directly
    if ((submission.employee as any).branch) {
      const branchName = String((submission.employee as any).branch).toUpperCase();
      const isHO = (
        branchName === "HO" || 
        branchName === "HEAD OFFICE" ||
        branchName.includes("HEAD OFFICE") ||
        branchName.includes("/HO")
      );
      return !isHO;
    }
    
    return false;
  };

  const isBranchEmp = isEmployeeBranch();

  // Determine evaluation type based on submission data
  const hasCustomerService = submission.customer_services && 
    Array.isArray(submission.customer_services) && 
    submission.customer_services.length > 0;
  const hasManagerialSkills = submission.managerial_skills && 
    Array.isArray(submission.managerial_skills) && 
    submission.managerial_skills.length > 0;
  
  let evaluationType: 'rankNfile' | 'basic' | 'default' = 'default';
  if (!hasCustomerService && hasManagerialSkills) {
    evaluationType = 'basic'; // Basic HO - has Managerial Skills, no Customer Service
  } else if (!hasCustomerService && !hasManagerialSkills) {
    evaluationType = 'rankNfile'; // RankNfile HO - no Customer Service, no Managerial Skills
  } else {
    evaluationType = 'default'; // Default - has Customer Service
  }

  // Use stored rating from backend if available to match evaluation records table
  const finalRatingRaw =
    submission.rating !== undefined && submission.rating !== null
      ? Number(submission.rating)
      : (() => {
          const job_knowledgeScore = calculateScore(
            (submission.job_knowledge || []).map((item: any) =>
              String(item.score)
            )
          );
          const quality_of_workScore = calculateScore(
            (submission.quality_of_works || []).map((item: any) =>
              String(item.score)
            )
          );
          const adaptabilityScore = calculateScore(
            (submission.adaptability || []).map((item: any) =>
              String(item.score)
            )
          );
          const teamworkScore = calculateScore(
            (submission.teamworks || []).map((item: any) =>
              String(item.score)
            )
          );
          const reliabilityScore = calculateScore(
            (submission.reliabilities || []).map((item: any) =>
              String(item.score)
            )
          );
          const ethicalScore = calculateScore(
            (submission.ethicals || []).map((item: any) =>
              String(item.score)
            )
          );

          // Calculate overall weighted score based on evaluation type
          if (evaluationType === 'rankNfile') {
            // RankNfile HO: 25%, 25%, 15%, 15%, 10%, 10% (no Customer Service)
            return (
              job_knowledgeScore * 0.25 +
              quality_of_workScore * 0.25 +
              adaptabilityScore * 0.15 +
              teamworkScore * 0.15 +
              reliabilityScore * 0.1 +
              ethicalScore * 0.1
            );
          } else if (evaluationType === 'basic') {
            // Basic HO: 25%, 25%, 15%, 15%, 10%, 10% + Managerial Skills 30%
            const managerial_skillsScore = submission.managerial_skills
              ? calculateScore(
                  (submission.managerial_skills || []).map((item: any) =>
                    String(item.score)
                  )
                )
              : 0;
            return (
              job_knowledgeScore * 0.25 +
              quality_of_workScore * 0.25 +
              adaptabilityScore * 0.15 +
              teamworkScore * 0.15 +
              reliabilityScore * 0.1 +
              ethicalScore * 0.1 +
              managerial_skillsScore * 0.3
            );
          } else {
            // Default: 20%, 20%, 10%, 10%, 5%, 5%, 30% (with Customer Service)
            const customer_serviceScore = submission.customer_services
              ? calculateScore(
                  (submission.customer_services || []).map((item: any) =>
                    String(item.score)
                  )
                )
              : 0;
            return (
              job_knowledgeScore * 0.2 +
              quality_of_workScore * 0.2 +
              adaptabilityScore * 0.1 +
              teamworkScore * 0.1 +
              reliabilityScore * 0.05 +
              ethicalScore * 0.05 +
              customer_serviceScore * 0.3
            );
          }
        })();

  const finalRating = Number.isFinite(finalRatingRaw)
    ? Number(finalRatingRaw)
    : 0;
  const finalRatingRounded = Number(finalRating.toFixed(2));
  const finalPercentage = Number(
    ((finalRatingRounded / 5) * 100).toFixed(2)
  );
  const finalIsPass = finalRatingRounded >= 3.0;

  // Handle approval API call
  const handleApproveEvaluation = async () => {
    if (!submission.id) {
      setApprovalError("Invalid submission ID");
      return;
      
    }
    if (!submission?.employee?.signature) {
      setApprovalError("Signature required");
      return;
    }

    setIsApproving(true);
    setApprovalError("");
    setShowApprovalDialog(true);
    setShowSuccessAnimation(false);

    try {
      // Show loading for 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (onApprove) {
        onApprove(submission.id);
      }

      // Show success animation
      setShowSuccessAnimation(true);

      // Close dialog after showing success for 1.5 seconds
      setTimeout(() => {
        setShowApprovalDialog(false);
        setShowSuccessAnimation(false);
        setIsApproving(false);
      }, 1500);
    } catch (error) {
      console.error("❌ Error approving evaluation:", error);
      setApprovalError("Failed to approve evaluation. Please try again.");
      setShowApprovalDialog(false);
      setShowSuccessAnimation(false);
      setIsApproving(false);
    }
  };

  const ratingBG = (value: number) => {
    switch (value) {
      case 1:
        return "bg-red-100 text-red-800";
      case 2:
        return "bg-orange-100 text-orange-800";
      case 3:
        return "bg-yellow-100 text-yellow-800";
      case 4:
        return "bg-blue-100 text-blue-800";
      case 5:
        return "bg-green-100 text-green-800";
      default:
        return "";
    }
  };
  const rating = (value: number) => {
    switch (value) {
      case 1:
        return "Unsatisfactory";
      case 2:
        return "Needs Improvement";
      case 3:
        return "Meets Expectations";
      case 4:
        return "Exceeds Expectation";
      case 5:
        return "Outstanding";
      default:
        return "Not Rated";
    }
  };

  const JOB_KNOWLEDGE = {
    1: {
      title:
        "Mastery in Core Competencies and Job Understanding (L.E.A.D.E.R.)",
      indicator:
        "  Exhibits mastery in essential skills and competencies required for the role. Displays a deep understanding of job responsibilities and requirements",
      example:
        "Consistently performs tasks accurately and with precision, showing a deep understanding of core job functions.",
    },
    2: {
      title: "Keeps Documentation Updated",
      indicator:
        " Maintains accurate and up-to-date documentation related to job functions",
      example:
        " Ensures that procedures, guidelines, and documentation are current; contributing to organizational efficiency.",
    },
    3: {
      title: " Problem Solving",
      indicator:
        " Applies critical thinking skills to solve problems efficiently",
      example:
        " Identifies and resolves issues in advance, effectively preventing potential disruptions.",
    },
  };

  const QUALITY_OF_WORK = {
    1: {
      title: "Meets Standards and Requirements",
      indicator:
        "Ensures work is accurate and meets or exceeds established standards",
      example:
        "Complies with industry regulations and project specifications; delivers reliable, high-quality work, and accurate work.",
    },
    2: {
      title: " Timeliness (L.E.A.D.E.R.)",
      indicator: "Completes tasks and projects within specified deadlines",
      example: "Submits work on time without compromising quality.",
    },
    3: {
      title: "Work Output Volume (L.E.A.D.E.R.)",
      indicator:
        "Produces a high volume of quality work within a given time frame",
      example: "Handles a substantial workload without sacrificing quality.",
    },
    4: {
      title: "Consistency in Performance (L.E.A.D.E.R.)",
      indicator: " Maintains a consistent level of productivity over time",
      example:
        "Meets productivity expectations reliably, without significant fluctuations.",
    },
    5: {
      title: " Job Targets",
      indicator:
        " Achieves targets set for their respective position (Sales / CCR / Mechanic / etc.)",
      example: "Consistently hits monthly targets assigned to their role.",
    },
  };

  const ADAPTABILITY = {
    1: {
      title: "Openness to Change (attitude towards change)",
      indicator:
        " Demonstrates a positive attitude and openness to new ideas and major changes at work",
      example:
        " Welcomes changes in work processes, procedures, or tools without resistance. Maintains a cooperative attitude when asked to adjust to new ways of working.",
    },
    2: {
      title: " Flexibility in Job Role (ability to adapt to changes)",
      indicator:
        "Adapts to changes in job responsibilities and willingly takes on new tasks",
      example:
        "Quickly adjusts to changes in job assignments, schedules, or unexpected demands. Helps cover additional responsibilities during staffing shortages or high workloads.",
    },
    3: {
      title: "Resilience in the Face of Challenges",
      indicator:
        "Maintains a positive attitude and performance under challenging or difficult conditions",
      example:
        " Remains focused and effective during periods of high stress or uncertainty. Completes tasks or meets deadlines when faced with unforeseen obstacles.s",
    },
  };

  const TEAMWORK = {
    1: {
      title: "Active Participation in Team Activities",
      indicator: "Active Participation in Team Activities",
      example:
        "  Actively participates in team meetings and projects. Contributes ideas and feedback during discussions. Engages in team tasks to achieve group goals.",
    },
    2: {
      title: "Promotion of a Positive Team Culture",
      indicator: "Promotion of a Positive Team Culture",
      example:
        "  Interacts positively with coworkers. Fosters inclusive team culture. Provides support and constructive feedback. Promotes teamwork and camaraderie.",
    },
    3: {
      title: "  Effective Communication",
      indicator: "  Effective Communication",
      example:
        " Communicates openly and clearly with team members. Shares information and updates in a timely manner. Ensures important details are communicated clearly.",
    },
  };

  const RELIABILITY = {
    1: {
      title: " Consistent Attendance",
      indicator:
        " Demonstrates regular attendance by being present at work as scheduled",
      example:
        " Has not taken any unplanned absences and follows the company's attendance policy.",
    },
    2: {
      title: " Punctuality",
      indicator:
        "Arrives at work and meetings on time or before the scheduled time",
      example:
        "Consistently arrives at work on time, ready to begin work promptly.",
    },
    3: {
      title: "Follows Through on Commitments",
      indicator: "Follows Through on Commitments",
      example:
        " Follows through on assignments from and commitments made to coworkers or superiors",
    },
    4: {
      title: "Reliable Handling of Routine Tasks",
      indicator:
        " Demonstrates reliability in completing routine tasks without oversight",
      example:
        "Delivers on commitments, ensuring that expectations are met or exceeded.",
    },
  };

  const ETHICAL = {
    1: {
      title: " Follows Company Policies",
      indicator: " Complies with company rules, regulations, and memorandums",
      example:
        "Follows established guidelines and protocols to ensure compliance with organizational standards.",
    },
    2: {
      title: "Professionalism (L.E.A.D.E.R.)",
      indicator:
        "Maintains a high level of professionalism in all work interactions",
      example:
        "Represents the organization positively, addressing work needs with integrity and professionalism. Handles sensitive information with discretion.",
    },
    3: {
      title: "Accountability for Mistakes (L.E.A.D.E.R.)",
      indicator:
        " Takes responsibility for errors and actively works to correct mistakes",
      example:
        "Acknowledges errors promptly, communicates about corrective actions, and learns from the experience. Takes ownership of mistakes and actively seeks ways to prevent future occurrences.",
    },
    4: {
      title: "Respect for Others (L.E.A.D.E.R.)",
      indicator:
        " Treats all individuals fairly and with respect, regardless of background or position",
      example:
        "Demonstrates unbiased decision-making and avoids favoritism in interactions with team members. Treats all coworkers and suppliers respectfully, with dignity and fairness.",
    },
  };

  const CUSTOMER_SERVICE = {
    1: {
      title: "Listening & Understanding",
      indicator:
        "Listens to customers and displays understanding of customer needs and concerns",
      example:
        "Repeats or summarizes customer concerns to ensure complete understanding before responding. Expresses genuine concern and seeks to understand the customer's perspective.",
    },
    2: {
      title: "Problem-Solving for Customer Satisfaction",
      indicator:
        "Proactively identifies and solves customer problems to ensure satisfaction",
      example:
        "Takes initiative to resolve issues and prevent future challenges for the customer. Offers alternative solutions when standard resolutions are not enough.",
    },
    3: {
      title: " Product Knowledge for Customer Support (L.E.A.D.E.R.)",
      indicator:
        " Possesses comprehensive product knowledge to assist customers effectively",
      example:
        "Demonstrates a deep understanding of products and/or services, enabling accurate and helpful guidance. Suggests the most suitable product or service based on customer requirements.",
    },
    4: {
      title: "Positive and Professional Attitude (L.E.A.D.E.R.)",
      indicator:
        " Maintains a positive and professional demeanor, particularly during customer interactions",
      example:
        "Represents the organization positively. Remains courteous and patient, even with challenging customers or in stressful situations.",
    },
    5: {
      title: "Timely Resolution of Customer Issues (L.E.A.D.E.R.)",
      indicator: "Resolves customer issues promptly and efficiently",
      example:
        "Addresses and resolves customer complaints or concerns within established timeframes. Ensures follow-ups are conducted for unresolved issues until completion.",
    },
  };

  return (
    <>
      {/* Approval Loading/Success Dialog */}
      <Dialog open={showApprovalDialog} onOpenChangeAction={() => {}}>
        <DialogContent className="sm:max-w-md p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            {!showSuccessAnimation ? (
              <>
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img
                      src="/smct.png"
                      alt="SMCT Logo"
                      className="h-8 w-8 object-contain"
                    />
                  </div>
                </div>
                <p className="text-lg font-medium text-gray-800">
                  Approving evaluation...
                </p>
                <p className="text-sm text-gray-500 text-center">
                  Please wait while we process your approval
                </p>
              </>
            ) : (
              <>
                <div className="relative">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-lg font-medium text-gray-800">
                  Evaluation Approved!
                </p>
                <p className="text-sm text-gray-500 text-center">
                  The evaluation has been successfully approved
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpen} onOpenChangeAction={onCloseAction}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-6 animate-popup">
          <style>{`
            .screen-date {
              display: inline;
            }
            .print-date {
              display: none;
            }
            .screen-rating-badge {
              display: inline;
            }
            .print-rating-text {
              display: none;
            }
            .print-footer {
              display: none;
            }
            @keyframes scale-in {
              0% {
                transform: scale(0);
                opacity: 0;
              }
              50% {
                transform: scale(1.1);
              }
              100% {
                transform: scale(1);
                opacity: 1;
              }
            }
            .animate-scale-in {
              animation: scale-in 0.5s ease-out;
            }
          `}</style>
          {/* Sticky Print and Close Buttons - Stay at top when scrolling */}
          <div className="sticky top-0 z-50 flex justify-end gap-2 mb-4 -mr-6 pr-6 py-4 no-print ">
            <Button
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 transition-transform duration-200"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              onClick={onCloseAction}
              className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 hover:text-white cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 transition-transform duration-200"
            >
              🗙 Close
            </Button>
          </div>

          <div ref={printContentRef} className="space-y-8">
            <div className="border-b border-gray-200 pb-4 no-print">
              <h2 className="text-3xl font-bold text-gray-900">
                Evaluation Details
              </h2>
            </div>

            <div className="space-y-8">
              {/* Title */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {evaluationType === 'rankNfile' ? (
                    <>
                      Performance Review Form (HEAD OFFICE)
                      <br />
                      Rank and File I & II
                    </>
                  ) : evaluationType === 'basic' ? (
                    <>
                      Performance Review Form (HEAD OFFICE)
                      <br />
                      Basic
                    </>
                  ) : (
                    <>
                      Performance Review Form
                    </>
                  )}
                </h1>
              </div>

              {/* Review Type Section */}
              {submission && (
                <Card className="shadow-md">
                  <CardContent className="p-4">
                    <div className="space-y-2 print-review-type">
                      {/* Row 1: For Probationary */}

                      <div className="flex items-start gap-3">
                        <h5 className="font-medium text-gray-800 min-w-[120px] text-sm">
                          For Probationary
                        </h5>
                        <div className="flex flex-row gap-2">
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                submission.reviewTypeProbationary === 3
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            >
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            <span className="text-sm text-gray-700">
                              3 months
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                submission.reviewTypeProbationary === 5
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            >
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            <span className="text-sm text-gray-700">
                              5 months
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Row 2: For Regular */}
                      <div className="flex items-start gap-3">
                        <h5 className="font-medium text-gray-800 min-w-[120px] text-sm">
                          For Regular
                        </h5>
                        <div className="flex flex-row gap-2">
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                submission.reviewTypeRegular === "Q1"
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            >
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            <span className="text-sm text-gray-700">
                              Q1 review
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                submission.reviewTypeRegular === "Q2"
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            >
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            <span className="text-sm text-gray-700">
                              Q2 review
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                submission.reviewTypeRegular === "Q3"
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            >
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            <span className="text-sm text-gray-700">
                              Q3 review
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                submission.reviewTypeRegular === "Q4"
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            >
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            <span className="text-sm text-gray-700">
                              Q4 review
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Row 3: Others */}
                      <div className="flex items-start gap-3">
                        <h5 className="font-medium text-gray-800 min-w-[120px] text-sm">
                          Others
                        </h5>
                        <div className="flex flex-row gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                submission.reviewTypeOthersImprovement
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            >
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            <span className="text-sm text-gray-700">
                              Performance Improvement
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                submission.reviewTypeOthersCustom
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            >
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            <span className="text-sm text-gray-700">
                              Others:
                            </span>
                          </div>
                          {submission.reviewTypeOthersCustom && (
                            <div className="ml-2 p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700">
                              {submission.reviewTypeOthersCustom}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Header Information */}
              <Card className="shadow-md">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 print-basic-info">
                    <div className="print-info-row">
                      <Label
                        className="font-medium text-black block mb-1 print-label"
                        style={{ fontSize: "11px" }}
                      >
                        Employee Name:
                      </Label>
                      <p
                        className="font-semibold text-gray-900 print-value"
                        style={{ fontSize: "11px" }}
                      >
                        {submission?.employee?.fname && submission?.employee?.lname
                          ? `${submission.employee.fname} ${submission.employee.lname}`
                          : "Unknown Employee"}
                      </p>
                    </div>
                    <div className="print-info-row">
                      <Label
                        className="font-medium text-black block mb-1 print-label"
                        style={{ fontSize: "11px" }}
                      >
                        Employee Contact #:
                      </Label>
                      <p
                        className="text-gray-900 print-value"
                        style={{ fontSize: "11px" }}
                      >
                        {submission?.employee?.contact ?? submission?.employee?.phone ?? "Not specified"}
                      </p>
                    </div>
                    <div className="print-info-row">
                      <Label
                        className="font-medium text-black block mb-1 print-label"
                        style={{ fontSize: "11px" }}
                      >
                        Position:
                      </Label>
                      <p
                        className="text-gray-900 print-value"
                        style={{ fontSize: "11px" }}
                      >
                        {submission?.employee?.positions?.label || "Not specified"}
                      </p>
                    </div>
                    <div className="print-info-row">
                      <Label
                        className="font-medium text-black block mb-1 print-label"
                        style={{ fontSize: "11px" }}
                      >
                        Branch:
                      </Label>
                      <p
                        className="text-gray-900 print-value"
                        style={{ fontSize: "11px" }}
                      >
                        {submission?.employee?.branches?.[0]?.branch_name || "Not specified"}
                      </p>
                    </div>
                    <div className="print-info-row">
                      <Label
                        className="font-medium text-black block mb-1 print-label"
                        style={{ fontSize: "11px" }}
                      >
                        Date Hired:
                      </Label>
                      <p
                        className="text-gray-900 print-value"
                        style={{ fontSize: "11px" }}
                      >
                        {(() => {
                          const dateHired = submission?.employee?.date_hired || 
                                           submission?.employee?.dateHired || 
                                           submission?.employee?.hireDate ||
                                           (submission as any)?.hireDate;
                          if (!dateHired) return "Not specified";
                          try {
                            const date = new Date(dateHired);
                            if (isNaN(date.getTime())) return "Not specified";
                            return date.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            });
                          } catch {
                            return "Not specified";
                          }
                        })()}
                      </p>
                    </div>
                    <div className="print-info-row">
                      <Label
                        className="font-medium text-black block mb-1 print-label"
                        style={{ fontSize: "11px" }}
                      >
                        Immediate Supervisor:
                      </Label>
                      <p
                        className="text-gray-900 print-value"
                        style={{ fontSize: "11px" }}
                      >
                        {submission.evaluator.fname +
                          " " +
                          submission.evaluator.lname}
                      </p>
                    </div>
                    <div className="print-info-row">
                      <Label
                        className="font-medium text-black block mb-1 print-label"
                        style={{ fontSize: "11px" }}
                      >
                        Performance Coverage:
                      </Label>
                      <p
                        className="text-gray-900 print-value"
                        style={{ fontSize: "11px" }}
                      >
                        {submission.coverageFrom && submission.coverageTo ? (
                          <>
                            <span className="screen-date">
                              {`${new Date(
                                submission.coverageFrom
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })} - ${new Date(
                                submission.coverageTo
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}`}
                            </span>
                            <span className="print-date">
                              {`${new Date(
                                submission.coverageFrom
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })} - ${new Date(
                                submission.coverageTo
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}`}
                            </span>
                          </>
                        ) : (
                          "Not specified"
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 1: Job Knowledge */}
              {submission && (
                <Card className="shadow-md hide-in-print">
                  <CardHeader className="bg-blue-50 border-b border-blue-200">
                    <CardTitle className="text-xl font-semibold text-blue-900">
                      I. JOB KNOWLEDGE
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Demonstrates understanding of job responsibilities.
                      Applies knowledge to tasks and projects. Stays updated in
                      relevant areas.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900"></th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              Behavioral Indicators
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              Example
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-24">
                              Score
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-32">
                              Rating
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              Comments
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(submission.job_knowledge || []).map(
                            (item: {
                              question_number: 1 | 2 | 3;
                              score: number;
                              comment: string;
                            }) => {
                              const indicators =
                                JOB_KNOWLEDGE[item.question_number];

                              return (
                                <tr key={item.question_number}>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                    {indicators.title}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                    {indicators.indicator}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                    {indicators.example}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                                    {item.score}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-center">
                                    <div
                                      className={`px-2 py-1 rounded text-sm font-medium ${ratingBG(
                                        item.score
                                      )}`}
                                    >
                                      {rating(item.score)}
                                    </div>
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                                    {item.comment || ""}
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Quality of Work */}
              {submission.quality_of_works && (
                <Card className="shadow-md hide-in-print">
                  <CardHeader className="bg-green-50 border-b border-green-200">
                    <CardTitle className="text-xl font-semibold text-green-900">
                      II. QUALITY OF WORK
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Accuracy and precision in completing tasks. Attention to
                      detail. Consistency in delivering high-quality results.
                      Timely completion of tasks and projects. Effective use of
                      resources. Ability to meet deadlines.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900"></th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              Behavioral Indicators
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              Example
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-24">
                              Score
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-32">
                              Rating
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              Comments
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(submission.quality_of_works || [])
                            .filter((item: { question_number: number }) => {
                              // For branch employees: only show questions 1-5 (up to Job Targets)
                              // For HO employees: only show questions 1-4 (no Job Targets)
                              // Questions 6-11 are not shown for branch employees
                              if (isBranchEmp) {
                                // Branch employees: show only questions 1-5
                                return item.question_number <= 5;
                              } else {
                                // HO employees: show only questions 1-4 (no Job Targets)
                                return item.question_number <= 4;
                              }
                            })
                            .map(
                            (item: {
                              question_number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
                              score: number;
                              comment: string;
                            }) => {
                              const indicators =
                                QUALITY_OF_WORK[item.question_number as keyof typeof QUALITY_OF_WORK];

                              // Safety check: if indicators don't exist, use fallback
                              if (!indicators) {
                                return (
                                  <tr key={item.question_number}>
                                    <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                      Quality of Work #{item.question_number}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                      Branch Manager Evaluation Criteria
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                      N/A
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                                      {item.score}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-center">
                                      <div
                                        className={`px-2 py-1 rounded-md text-sm font-bold ${
                                          item.score === 5
                                            ? "bg-green-100 text-green-800"
                                            : item.score === 4
                                            ? "bg-blue-100 text-blue-800"
                                            : item.score === 3
                                            ? "bg-yellow-100 text-yellow-800"
                                            : item.score === 2
                                            ? "bg-orange-100 text-orange-800"
                                            : item.score === 1
                                            ? "bg-red-100 text-red-800"
                                            : "bg-gray-100 text-gray-500"
                                        }`}
                                      >
                                        {item.score === 5
                                          ? "Outstanding"
                                          : item.score === 4
                                          ? "Exceeds Expectation"
                                          : item.score === 3
                                          ? "Meets Expectations"
                                          : item.score === 2
                                          ? "Needs Improvement"
                                          : item.score === 1
                                          ? "Unsatisfactory"
                                          : "Not Rated"}
                                      </div>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                      {item.comment || "No comment"}
                                    </td>
                                  </tr>
                                );
                              }

                              return (
                                <tr key={item.question_number}>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                    {indicators.title}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                    {indicators.indicator}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                    {indicators.example}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                                    {item.score}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-center">
                                    <div
                                      className={`px-2 py-1 rounded text-sm font-medium ${ratingBG(
                                        item.score
                                      )}`}
                                    >
                                      {rating(item.score)}
                                    </div>
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                                    {item.comment || ""}
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Adaptability */}
              {submission.adaptability && (
                <Card className="shadow-md hide-in-print">
                  <CardHeader className="bg-yellow-50 border-b border-yellow-200">
                    <CardTitle className="text-xl font-semibold text-yellow-900">
                      III. ADAPTABILITY
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Flexibility in handling change. Ability to work
                      effectively in diverse situations. Resilience in the face
                      of challenges.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900"></th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              Behavioral Indicators
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              Example
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-24">
                              Score
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-32">
                              Rating
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              Comments
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(submission.adaptability || []).map(
                            (item: {
                              question_number: 1 | 2 | 3;
                              score: number;
                              comment: string;
                            }) => {
                              const indicators =
                                ADAPTABILITY[item.question_number];

                              return (
                                <tr key={item.question_number}>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                    {indicators.title}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                    {indicators.indicator}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                    {indicators.example}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                                    {item.score}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-center">
                                    <div
                                      className={`px-2 py-1 rounded text-sm font-medium ${ratingBG(
                                        item.score
                                      )}`}
                                    >
                                      {rating(item.score)}
                                    </div>
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                                    {item.comment || ""}
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Teamwork */}
              {submission.teamworks && (
                <Card className="shadow-md hide-in-print">
                  <CardHeader className="bg-purple-50 border-b border-purple-200">
                    <CardTitle className="text-xl font-semibold text-purple-900">
                      IV. TEAMWORK
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Ability to work well with others. Contribution to team
                      goals and projects. Supportiveness of team members.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900"></th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              Behavioral Indicators
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              Example
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-24">
                              Score
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-32">
                              Rating
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              Comments
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(submission.teamworks || []).map(
                            (item: {
                              question_number: 1 | 2 | 3;
                              score: number;
                              comment: string;
                            }) => {
                              const indicators = TEAMWORK[item.question_number];

                              return (
                                <tr key={item.question_number}>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                    {indicators.title}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                    {indicators.indicator}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                    {indicators.example}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                                    {item.score}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-center">
                                    <div
                                      className={`px-2 py-1 rounded text-sm font-medium ${ratingBG(
                                        item.score
                                      )}`}
                                    >
                                      {rating(item.score)}
                                    </div>
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                                    {item.comment || ""}
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 5: Reliability */}
              {submission.reliabilities && (
                <Card className="shadow-md hide-in-print">
                  <CardHeader className="bg-indigo-50 border-b border-indigo-200">
                    <CardTitle className="text-xl font-semibold text-indigo-900">
                      V. RELIABILITY
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Consistency in attendance and punctuality. Meeting
                      commitments and fulfilling responsibilities.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900"></th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              Behavioral Indicators
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              Example
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-24">
                              Score
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-32">
                              Rating
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              Comments
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(submission.reliabilities || []).map(
                            (item: {
                              question_number: 1 | 2 | 3 | 4;
                              score: number;
                              comment: string;
                            }) => {
                              const indicators =
                                RELIABILITY[item.question_number];

                              return (
                                <tr key={item.question_number}>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                    {indicators.title}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                    {indicators.indicator}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                    {indicators.example}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                                    {item.score}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-center">
                                    <div
                                      className={`px-2 py-1 rounded text-sm font-medium ${ratingBG(
                                        item.score
                                      )}`}
                                    >
                                      {rating(item.score)}
                                    </div>
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                                    {item.comment || ""}
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 6: Ethical & Professional Behavior */}
              {submission.ethicals && (
                <Card className="shadow-md hide-in-print">
                  <CardHeader className="bg-red-50 border-b border-red-200">
                    <CardTitle className="text-xl font-semibold text-red-900">
                      VI. ETHICAL & PROFESSIONAL BEHAVIOR
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Complies with company policies and ethical standards.
                      Accountability for one's actions. Professionalism in
                      interactions with coworkers and clients.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900"></th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              Behavioral Indicators
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              Example
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-24">
                              Score
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-32">
                              Rating
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              Comments
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(submission.ethicals || []).map(
                            (item: {
                              question_number: 1 | 2 | 3 | 4;
                              score: number;
                              explanation: string;
                            }) => {
                              const indicators = ETHICAL[item.question_number];

                              return (
                                <tr key={item.question_number}>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                    {indicators.title}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                    {indicators.indicator}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                    {indicators.example}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                                    {item.score}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-center">
                                    <div
                                      className={`px-2 py-1 rounded text-sm font-medium ${ratingBG(
                                        item.score
                                      )}`}
                                    >
                                      {rating(item.score)}
                                    </div>
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                                    {item.explanation || ""}
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 7: Managerial Skills - Only for Basic HO evaluations */}
              {evaluationType === 'basic' && submission.managerial_skills && (
                <Card className="shadow-md hide-in-print">
                  <CardHeader className="bg-teal-50 border-b border-teal-200">
                    <CardTitle className="text-xl font-semibold text-teal-900">
                      VII. MANAGERIAL SKILLS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Leadership abilities. Decision-making skills. Team management and development.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900"></th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              Behavioral Indicators
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              Example
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-24">
                              Score
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-32">
                              Rating
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              Comments
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(submission.managerial_skills || []).map(
                            (item: {
                              question_number: 1 | 2 | 3 | 4 | 5 | 6;
                              score: number;
                              explanation: string;
                            }) => {
                              return (
                                <tr key={item.question_number}>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                    Question {item.question_number}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                    Managerial Skills Indicator {item.question_number}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                    Example for Managerial Skills {item.question_number}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                                    {item.score}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-center">
                                    <div
                                      className={`px-2 py-1 rounded text-sm font-medium ${ratingBG(
                                        item.score
                                      )}`}
                                    >
                                      {rating(item.score)}
                                    </div>
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                                    {item.explanation || ""}
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 7: Customer Service - Only show for default evaluations */}
              {evaluationType === 'default' && submission.customer_services && (
                <Card className="shadow-md hide-in-print">
                  <CardHeader className="bg-teal-50 border-b border-teal-200">
                    <CardTitle className="text-xl font-semibold text-teal-900">
                      VII. CUSTOMER SERVICE
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Customer satisfaction. Responsiveness to customer needs.
                      Professional and positive interactions with customers.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900"></th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              Behavioral Indicators
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              Example
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-24">
                              Score
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-32">
                              Rating
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              Comments
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(submission.customer_services || []).map(
                            (item: {
                              question_number: 1 | 2 | 3 | 4 | 5;
                              score: number;
                              explanation: string;
                            }) => {
                              const indicators =
                                CUSTOMER_SERVICE[item.question_number];

                              return (
                                <tr key={item.question_number}>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                    {indicators.title}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                    {indicators.indicator}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                    {indicators.example}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                                    {item.score}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-center">
                                    <div
                                      className={`px-2 py-1 rounded text-sm font-medium ${ratingBG(
                                        item.score
                                      )}`}
                                    >
                                      {rating(item.score)}
                                    </div>
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                                    {item.explanation || ""}
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Performance Assessment Table */}
              {submission && (
                <div className="print-overall-assessment-wrapper">
                  <Card className="shadow-md">
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-4">
                          Overall Assessment
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border-2 border-gray-400 print-overall-assessment-table">
                            <thead>
                              <tr className="bg-gray-200">
                                <th className="border-2 border-gray-400 px-4 py-3 text-left font-bold text-gray-900 text-base print-criteria-col">
                                  Performance Criteria
                                </th>
                                <th className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-gray-900 text-base w-32 print-rating-col">
                                  Rating
                                </th>
                                <th className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-gray-900 text-base w-24 print-score-col">
                                  Score
                                </th>
                                <th className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-gray-900 text-base w-24 print-weight-col">
                                  Weight (%)
                                </th>
                                <th className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-gray-900 text-base w-32 print-weighted-col">
                                  Weighted Score
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* Job Knowledge */}
                              <tr>
                                <td className="border-2 border-gray-400 px-4 py-3 text-sm text-gray-700 font-medium">
                                  Job Knowledge
                                </td>
                                <td className="border-2 border-gray-400 px-4 py-3 text-center">
                                  <div className="flex items-center justify-center space-x-1">
                                    <span
                                      className={`px-2 py-1 rounded text-sm font-bold screen-rating-badge ${getRatingColorForLabel(
                                        getRatingLabel(
                                          calculateScore(
                                            (submission.job_knowledge || []).map(
                                              (item: any) => {
                                                return String(item.score || 0);
                                              }
                                            )
                                          )
                                        )
                                      )}`}
                                    >
                                      {getRatingLabel(
                                        calculateScore(
                                          (submission.job_knowledge || []).map(
                                            (item: any) => {
                                              return String(item.score || 0);
                                            }
                                          )
                                        )
                                      )}
                                    </span>
                                    <span className="print-rating-text">
                                      {getRatingLabel(
                                        calculateScore(
                                          (submission.job_knowledge || []).map(
                                            (item: any) => {
                                              return String(item.score || 0);
                                            }
                                          )
                                        )
                                      )}
                                    </span>
                                  </div>
                                </td>
                                <td className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-base">
                                  {Math.round(
                                    calculateScore(
                                      (submission.job_knowledge || []).map(
                                        (item: any) => {
                                          return String(item.score || 0);
                                        }
                                      )
                                    ) * 10
                                  ) / 10}
                                </td>
                                <td className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-base">
                                  {evaluationType === 'rankNfile' || evaluationType === 'basic' ? '25%' : '20%'}
                                </td>
                                <td className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-base">
                                  {evaluationType === 'rankNfile' || evaluationType === 'basic' ? (
                                    (calculateScore(
                                      (submission.job_knowledge || []).map(
                                        (item: any) => {
                                          return String(item.score || 0);
                                        }
                                      )
                                    ) * 0.25).toFixed(2)
                                  ) : (
                                    Math.round(
                                      calculateScore(
                                        (submission.job_knowledge || []).map(
                                          (item: any) => {
                                            return String(item.score || 0);
                                          }
                                        )
                                      ) *
                                        0.2 *
                                        10
                                    ) / 10
                                  )}
                                </td>
                              </tr>

                              {/* Quality of Work */}
                              <tr>
                                <td className="border-2 border-gray-400 px-4 py-3 text-sm text-gray-700 font-medium">
                                  Quality of Work
                                </td>
                                <td className="border-2 border-gray-400 px-4 py-3 text-center">
                                  <div className="flex items-center justify-center space-x-1">
                                    <span
                                      className={`px-2 py-1 rounded text-sm font-bold screen-rating-badge ${getRatingColorForLabel(
                                        getRatingLabel(
                                          calculateScore(
                                            (submission.quality_of_works || []).map(
                                              (item: any) => {
                                                return String(item.score || 0);
                                              }
                                            )
                                          )
                                        )
                                      )}`}
                                    >
                                      {getRatingLabel(
                                        calculateScore(
                                          (submission.quality_of_works || []).map(
                                            (item: any) => {
                                              return String(item.score || 0);
                                            }
                                          )
                                        )
                                      )}
                                    </span>
                                    <span className="print-rating-text">
                                      {getRatingLabel(
                                        calculateScore(
                                          (submission.quality_of_works || []).map(
                                            (item: any) => {
                                              return String(item.score || 0);
                                            }
                                          )
                                        )
                                      )}
                                    </span>
                                  </div>
                                </td>
                                <td className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-base">
                                  {calculateScore(
                                    (submission.quality_of_works || []).map(
                                      (item: any) => {
                                        return String(item.score || 0);
                                      }
                                    )
                                  ).toFixed(2)}
                                </td>
                                <td className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-base">
                                  {evaluationType === 'rankNfile' || evaluationType === 'basic' ? '25%' : '20%'}
                                </td>
                                <td className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-base">
                                  {evaluationType === 'rankNfile' || evaluationType === 'basic' ? (
                                    (calculateScore(
                                      (submission.quality_of_works || []).map(
                                        (item: any) => {
                                          return String(item.score || 0);
                                        }
                                      )
                                    ) * 0.25).toFixed(2)
                                  ) : (
                                    (calculateScore(
                                      (submission.quality_of_works || []).map(
                                        (item: any) => {
                                          return String(item.score || 0);
                                        }
                                      )
                                    ) * 0.2).toFixed(2)
                                  )}
                                </td>
                              </tr>

                              {/* Adaptability */}
                              <tr>
                                <td className="border-2 border-gray-400 px-4 py-3 text-sm text-gray-700 font-medium">
                                  Adaptability
                                </td>
                                <td className="border-2 border-gray-400 px-4 py-3 text-center">
                                  <div className="flex items-center justify-center space-x-1">
                                    <span
                                      className={`px-2 py-1 rounded text-sm font-bold screen-rating-badge ${getRatingColorForLabel(
                                        getRatingLabel(
                                          calculateScore(
                                            (submission.adaptability || []).map(
                                              (item: any) => {
                                                return String(item.score || 0);
                                              }
                                            )
                                          )
                                        )
                                      )}`}
                                    >
                                      {getRatingLabel(
                                        calculateScore(
                                          (submission.adaptability || []).map(
                                            (item: any) => {
                                              return String(item.score || 0);
                                            }
                                          )
                                        )
                                      )}
                                    </span>
                                    <span className="print-rating-text">
                                      {getRatingLabel(
                                        calculateScore(
                                          (submission.adaptability || []).map(
                                            (item: any) => {
                                              return String(item.score || 0);
                                            }
                                          )
                                        )
                                      )}
                                    </span>
                                  </div>
                                </td>
                                <td className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-base">
                                  {calculateScore(
                                    (submission.adaptability || []).map((item: any) => {
                                      return String(item.score || 0);
                                    })
                                  ).toFixed(2)}
                                </td>
                                <td className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-base">
                                  {evaluationType === 'rankNfile' || evaluationType === 'basic' ? '15%' : '10%'}
                                </td>
                                <td className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-base">
                                  {evaluationType === 'rankNfile' || evaluationType === 'basic' ? (
                                    (calculateScore(
                                      (submission.adaptability || []).map(
                                        (item: any) => {
                                          return String(item.score || 0);
                                        }
                                      )
                                    ) * 0.15).toFixed(2)
                                  ) : (
                                    (calculateScore(
                                      (submission.adaptability || []).map(
                                        (item: any) => {
                                          return String(item.score || 0);
                                        }
                                      )
                                    ) * 0.1).toFixed(2)
                                  )}
                                </td>
                              </tr>

                              {/* Teamwork */}
                              <tr>
                                <td className="border-2 border-gray-400 px-4 py-3 text-sm text-gray-700 font-medium">
                                  Teamwork
                                </td>
                                <td className="border-2 border-gray-400 px-4 py-3 text-center">
                                  <div className="flex items-center justify-center space-x-1">
                                    <span
                                      className={`px-2 py-1 rounded text-sm font-bold screen-rating-badge ${getRatingColorForLabel(
                                        getRatingLabel(
                                          calculateScore(
                                            (submission.teamworks || []).map(
                                              (item: any) => {
                                                return String(item.score || 0);
                                              }
                                            )
                                          )
                                        )
                                      )}`}
                                    >
                                      {getRatingLabel(
                                        calculateScore(
                                          (submission.teamworks || []).map(
                                            (item: any) => {
                                              return String(item.score || 0);
                                            }
                                          )
                                        )
                                      )}
                                    </span>
                                    <span className="print-rating-text">
                                      {getRatingLabel(
                                        calculateScore(
                                          (submission.teamworks || []).map(
                                            (item: any) => {
                                              return String(item.score || 0);
                                            }
                                          )
                                        )
                                      )}
                                    </span>
                                  </div>
                                </td>
                                <td className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-base">
                                  {calculateScore(
                                    (submission.teamworks || []).map((item: any) => {
                                      return String(item.score || 0);
                                    })
                                  ).toFixed(2)}
                                </td>
                                <td className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-base">
                                  {evaluationType === 'rankNfile' || evaluationType === 'basic' ? '15%' : '10%'}
                                </td>
                                <td className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-base">
                                  {evaluationType === 'rankNfile' || evaluationType === 'basic' ? (
                                    (calculateScore(
                                      (submission.teamworks || []).map((item: any) => {
                                        return String(item.score || 0);
                                      })
                                    ) * 0.15).toFixed(2)
                                  ) : (
                                    (calculateScore(
                                      (submission.teamworks || []).map((item: any) => {
                                        return String(item.score || 0);
                                      })
                                    ) * 0.1).toFixed(2)
                                  )}
                                </td>
                              </tr>

                              {/* Reliability */}
                              <tr>
                                <td className="border-2 border-gray-400 px-4 py-3 text-sm text-gray-700 font-medium">
                                  Reliability
                                </td>
                                <td className="border-2 border-gray-400 px-4 py-3 text-center">
                                  <div className="flex items-center justify-center space-x-1">
                                    <span
                                      className={`px-2 py-1 rounded text-sm font-bold screen-rating-badge ${getRatingColorForLabel(
                                        getRatingLabel(
                                          calculateScore(
                                            (submission.reliabilities || []).map(
                                              (item: any) => {
                                                return String(item.score || 0);
                                              }
                                            )
                                          )
                                        )
                                      )}`}
                                    >
                                      {getRatingLabel(
                                        calculateScore(
                                          (submission.reliabilities || []).map(
                                            (item: any) => {
                                              return String(item.score || 0);
                                            }
                                          )
                                        )
                                      )}
                                    </span>
                                    <span className="print-rating-text">
                                      {getRatingLabel(
                                        calculateScore(
                                          (submission.reliabilities || []).map(
                                            (item: any) => {
                                              return String(item.score || 0);
                                            }
                                          )
                                        )
                                      )}
                                    </span>
                                  </div>
                                </td>
                                <td className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-base">
                                  {calculateScore(
                                    (submission.reliabilities || []).map(
                                      (item: any) => {
                                        return String(item.score || 0);
                                      }
                                    )
                                  ).toFixed(2)}
                                </td>
                                <td className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-base">
                                  {evaluationType === 'rankNfile' || evaluationType === 'basic' ? '10%' : '5%'}
                                </td>
                                <td className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-base">
                                  {evaluationType === 'rankNfile' || evaluationType === 'basic' ? (
                                    (calculateScore(
                                      (submission.reliabilities || []).map(
                                        (item: any) => {
                                          return String(item.score || 0);
                                        }
                                      )
                                    ) * 0.1).toFixed(2)
                                  ) : (
                                    (calculateScore(
                                      (submission.reliabilities || []).map(
                                        (item: any) => {
                                          return String(item.score || 0);
                                        }
                                      )
                                    ) * 0.05).toFixed(2)
                                  )}
                                </td>
                              </tr>

                              {/* Ethical & Professional Behavior */}
                              <tr>
                                <td className="border-2 border-gray-400 px-4 py-3 text-sm text-gray-700 font-medium">
                                  Ethical & Professional Behavior
                                </td>
                                <td className="border-2 border-gray-400 px-4 py-3 text-center">
                                  <div className="flex items-center justify-center space-x-1">
                                    <span
                                      className={`px-2 py-1 rounded text-sm font-bold screen-rating-badge ${getRatingColorForLabel(
                                        getRatingLabel(
                                          calculateScore(
                                            (submission.ethicals || []).map(
                                              (item: any) => {
                                                return String(item.score || 0);
                                              }
                                            )
                                          )
                                        )
                                      )}`}
                                    >
                                      {getRatingLabel(
                                        calculateScore(
                                          (submission.ethicals || []).map(
                                            (item: any) => {
                                              return String(item.score || 0);
                                            }
                                          )
                                        )
                                      )}
                                    </span>
                                    <span className="print-rating-text">
                                      {getRatingLabel(
                                        calculateScore(
                                          (submission.ethicals || []).map(
                                            (item: any) => {
                                              return String(item.score || 0);
                                            }
                                          )
                                        )
                                      )}
                                    </span>
                                  </div>
                                </td>
                                <td className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-base">
                                  {calculateScore(
                                    (submission.ethicals || []).map((item: any) => {
                                      return String(item.score || 0);
                                    })
                                  ).toFixed(2)}
                                </td>
                                <td className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-base">
                                  {evaluationType === 'rankNfile' || evaluationType === 'basic' ? '10%' : '5%'}
                                </td>
                                <td className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-base">
                                  {evaluationType === 'rankNfile' || evaluationType === 'basic' ? (
                                    (calculateScore(
                                      (submission.ethicals || []).map((item: any) => {
                                        return String(item.score || 0);
                                      })
                                    ) * 0.1).toFixed(2)
                                  ) : (
                                    (calculateScore(
                                      (submission.ethicals || []).map((item: any) => {
                                        return String(item.score || 0);
                                      })
                                    ) * 0.05).toFixed(2)
                                  )}
                                </td>
                              </tr>

                              {/* Managerial Skills - Only for Basic HO */}
                              {evaluationType === 'basic' && submission.managerial_skills && (
                                <tr>
                                  <td className="border-2 border-gray-400 px-4 py-3 text-sm text-gray-700 font-medium">
                                    Managerial Skills
                                  </td>
                                  <td className="border-2 border-gray-400 px-4 py-3 text-center">
                                    <div className="flex items-center justify-center space-x-1">
                                      <span
                                        className={`px-2 py-1 rounded text-sm font-bold screen-rating-badge ${getRatingColorForLabel(
                                          getRatingLabel(
                                            calculateScore(
                                              (submission.managerial_skills || []).map(
                                                (item: any) => {
                                                  return String(item.score || 0);
                                                }
                                              )
                                            )
                                          )
                                        )}`}
                                      >
                                        {getRatingLabel(
                                          calculateScore(
                                            (submission.managerial_skills || []).map(
                                              (item: any) => {
                                                return String(item.score || 0);
                                              }
                                            )
                                          )
                                        )}
                                      </span>
                                      <span className="print-rating-text">
                                        {getRatingLabel(
                                          calculateScore(
                                            (submission.managerial_skills || []).map(
                                              (item: any) => {
                                                return String(item.score || 0);
                                              }
                                            )
                                          )
                                        )}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-base">
                                    {calculateScore(
                                      (submission.managerial_skills || []).map((item: any) => {
                                        return String(item.score || 0);
                                      })
                                    ).toFixed(2)}
                                  </td>
                                  <td className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-base">
                                    30%
                                  </td>
                                  <td className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-base">
                                    {(
                                      calculateScore(
                                        (submission.managerial_skills || []).map((item: any) => {
                                          return String(item.score || 0);
                                        })
                                      ) * 0.3
                                    ).toFixed(2)}
                                  </td>
                                </tr>
                              )}

                              {/* Customer Service - Only for Default evaluations */}
                              {evaluationType === 'default' && submission.customer_services && (
                                <tr>
                                  <td className="border-2 border-gray-400 px-4 py-3 text-sm text-gray-700 font-medium">
                                    Customer Service
                                  </td>
                                  <td className="border-2 border-gray-400 px-4 py-3 text-center">
                                    <div className="flex items-center justify-center space-x-1">
                                      <span
                                        className={`px-2 py-1 rounded text-sm font-bold screen-rating-badge ${getRatingColorForLabel(
                                          getRatingLabel(
                                            calculateScore(
                                              (submission.customer_services || []).map(
                                                (item: any) => {
                                                  return String(item.score || 0);
                                                }
                                              )
                                            )
                                          )
                                        )}`}
                                      >
                                        {getRatingLabel(
                                          calculateScore(
                                            (submission.customer_services || []).map(
                                              (item: any) => {
                                                return String(item.score || 0);
                                              }
                                            )
                                          )
                                        )}
                                      </span>
                                      <span className="print-rating-text">
                                        {getRatingLabel(
                                          calculateScore(
                                            (submission.customer_services || []).map(
                                              (item: any) => {
                                                return String(item.score || 0);
                                              }
                                            )
                                          )
                                        )}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-base">
                                    {calculateScore(
                                      (submission.customer_services || []).map(
                                        (item: any) => {
                                          return String(item.score || 0);
                                        }
                                      )
                                    ).toFixed(2)}
                                  </td>
                                  <td className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-base">
                                    30%
                                  </td>
                                  <td className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-base">
                                    {(
                                      calculateScore(
                                        (submission.customer_services || []).map(
                                          (item: any) => {
                                            return String(item.score || 0);
                                          }
                                        )
                                      ) * 0.3
                                    ).toFixed(2)}
                                  </td>
                                </tr>
                              )}

                              {/* Overall Performance Rating */}
                              <tr className="bg-gray-100">
                                <td className="border-2 border-gray-400 px-4 py-3 text-sm font-bold text-gray-700">
                                  Overall Performance Rating
                                </td>
                                <td
                                  colSpan={2}
                                  className="border-2 border-gray-400 px-4 py-3 text-center"
                                ></td>
                                <td className="border-2 border-gray-400 px-4 py-3 text-center"></td>
                                <td className="border-2 border-gray-400 px-4 py-3 text-center font-bold text-lg">
                                  {finalRatingRounded.toFixed(2)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Final Results */}
                        <div className="mt-6 flex justify-center items-center space-x-8 print-performance-score-wrapper">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-gray-700">
                              {finalPercentage.toFixed(2)}
                              %
                            </div>
                            <div className="text-base text-gray-500 mt-1">
                              Performance Score
                            </div>
                          </div>
                          <div
                            className={`px-8 py-4 rounded-lg font-bold text-white text-xl ${
                              finalIsPass ? "bg-green-600" : "bg-red-600"
                            }`}
                          >
                            {finalIsPass ? "PASS" : "FAIL"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Priority Areas for Improvement (always render; blank lines if none) */}
              {submission && (
                <Card>
                  <CardContent className="pt-6 pb-4">
                    <h4 className="font-semibold text-lg text-gray-900 mb-4 print-priority-header">
                      Priority Areas for Improvement
                    </h4>
                    <p className="text-sm text-gray-600 mb-4 print-priority-description">
                      This section identifies key areas the employee can focus
                      on for development in the upcoming quarter. These can be
                      specific skills, behaviors, or work outputs that will
                      contribute to better overall performance and align with
                      branch or company goals. Keep the feedback clear, helpful,
                      and easy to act on.
                    </p>
                    <div className="space-y-3">
                      {[1, 2, 3].map((idx) => {
                        const value =
                          idx === 1
                            ? submission.priorityArea1
                            : idx === 2
                            ? submission.priorityArea2
                            : submission.priorityArea3;
                        return (
                          <div
                            key={idx}
                            className="p-3 bg-yellow-50 border border-gray-300 rounded-md print-priority-item"
                          >
                            <div className="print-priority-row">
                              <span className="font-medium text-sm print-priority-label">
                                {idx}.{" "}
                              </span>
                              <p className="text-sm text-gray-700 print-priority-value min-h-[18px]">
                                {value || ""}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Remarks (always render; blank box if none) */}
              {submission && (
                <Card>
                  <CardContent className="pt-6 pb-4">
                    <h4 className="font-semibold text-lg text-gray-900 mb-4 print-remarks-header">
                      Remarks
                    </h4>
                    <div className="p-3 bg-yellow-50 border border-gray-300 rounded-md print-remarks-box min-h-[72px]">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap min-h-[52px]">
                        {submission.remarks || ""}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Acknowledgement */}
              {submission && (
                <Card>
                  <CardContent className="pt-6 pb-4">
                    <h4 className="font-semibold text-lg text-gray-900 mb-4 print-acknowledgement-header">
                      Acknowledgement
                    </h4>
                    <p className="text-sm text-gray-600 mb-4 print-acknowledgement-description">
                      I hereby acknowledge that the Evaluator has explained to
                      me, to the best of their ability, and in a manner I fully
                      understand, my performance and respective rating on this
                      performance evaluation.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-acknowledgement">
                      {/* Employee Section */}
                      <div>
                        {/* Signature area */}
                        <div className="text-center">
                          <div className="h-20 border-2 border-dashed border-white rounded-lg flex items-center justify-center bg-gray-50 relative">
                            {/* Print signature line */}
                            <div className="print-signature-line"></div>
                            {/* Name as background text - always show */}
                            <span className="text-md text-gray-900 font-bold">
                              {submission?.employee?.fname && submission?.employee?.lname
                                ? `${submission.employee.fname} ${submission.employee.lname}`
                                : "Employee Name"}
                            </span>
                            {/* Signature overlay - centered and overlapping */}
                            {signatureLoading ? (
                              <div className="absolute top-7 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-gray-500">
                                Loading signature...
                              </div>
                            ) : signatureError ? (
                              <div className="absolute top-7 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-red-500">
                                Error loading signature
                              </div>
                            ) : submission.status === "completed" ? (
                              submission.employee?.signature && (
                                <img
                                  src={
                                    CONFIG.API_URL_STORAGE +
                                      "/" +
                                      submission.employee?.signature || ""
                                  }
                                  alt="Employee Signature"
                                  className="absolute top-7 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-16 max-w-full object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              )
                            ) : (
                              <div></div>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Employee's Name & Signature
                          </div>
                        </div>

                        {/* Action Section - Only show if showApprovalButton is true */}
                        {showApprovalButton && (
                          <div className="mt-6 space-y-4 no-print">
                            {/* Approve Button - Only show if not approved */}
                            {submission.status === "pending" && (
                              <div className="space-y-3">
                                <div className="flex justify-center">
                                  <Button
                                    onClick={handleApproveEvaluation}
                                    disabled={!submission.id || isApproving}
                                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-sm font-medium disabled:bg-gray-400 cursor-pointer hover:scale-110 transition-transform duration-200 shadow-sm"
                                  >
                                    {isApproving ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Approving...
                                      </>
                                    ) : (
                                      "✓ Approve Evaluation"
                                    )}
                                  </Button>
                                </div>
                                <p className="text-xs text-gray-500 text-center">
                                  Click to acknowledge and approve this
                                  evaluation
                                </p>
                                {approvalError && (
                                  <p className="text-xs text-center text-red-600 bg-red-50 p-3 rounded">
                                    {approvalError}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Approved Status - Only show if approved */}
                            {computedIsApproved &&
                              submission.status === "completed" && (
                                <div className="space-y-3 px-4 md:px-0">
                                  <div className="flex items-center justify-center space-x-2">
                                    <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm font-medium">
                                      ✓ Evaluation Approved
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-gray-500 text-center">
                                    Approved on{" "}
                                    {submission.employeeApprovedAt
                                      ? new Date(
                                          submission.employeeApprovedAt
                                        ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                        })
                                      : "Unknown date"}
                                  </p>
                                </div>
                              )}
                          </div>
                        )}

                        {/* Employee Date */}
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mt-1 print-date-value">
                            {submission.employeeApprovedAt ||
                            submission.employeeApprovedAt
                              ? new Date(
                                  submission.employeeApprovedAt
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : "Not approved yet"}
                          </p>
                        </div>
                      </div>

                      {/* Evaluator Section */}
                      <div>
                        {/* Signature area */}
                        <div className="text-center">
                          <div className="h-20 border-2 border-dashed border-white rounded-lg flex items-center justify-center bg-gray-50 relative">
                            {/* Print signature line */}
                            <div className="print-signature-line"></div>
                            {/* Name as background text - always show */}
                            <span className="text-md text-gray-900 font-bold">
                              {submission?.evaluator.fname +
                                " " +
                                submission.evaluator.lname || "Evaluator Name"}
                            </span>
                            {/* Signature overlay - automatically show when signature exists */}
                            {submission.evaluator.signature ? (
                              <img
                                src={
                                  CONFIG.API_URL_STORAGE +
                                  "/" +
                                  submission.evaluator.signature
                                }
                                alt="Evaluator Signature"
                                className="absolute top-7 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-16 max-w-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <span className="absolute top-7 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                No signature
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Evaluator's Name & Signature
                          </div>
                        </div>

                        {/* Evaluator Date */}
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mt-1">
                            {submission.evaluatorApprovedAt
                              ? new Date(
                                  submission.evaluatorApprovedAt
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : "Not specified"}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Confidentiality Notice */}
                    <div className="mt-6 print-confidentiality-notice">
                      <p className="text-xs text-gray-700 leading-relaxed">
                        <strong>CONFIDENTIALITY NOTICE ver.042225:</strong>
                        <br />
                        This document, including any attachments, contains
                        confidential and/or privileged information intended
                        solely for internal use within the company. It is the
                        intellectual property of SMCT Group of Companies,
                        including its subsidiaries, businesses, and trade names.
                        Unauthorized use, copying, distribution, or disclosure
                        of this document, its contents, or any part thereof is
                        strictly prohibited without the express written
                        permission of SMCT Group of Companies.
                      </p>
                    </div>
                    {/* Date section */}
                    <div className="mt-5 print-date-section no-print">
                      <span>Date: </span>
                      <span className="print-date-box">
                        {submission.employeeApprovedAt ||
                        submission.evaluatorApprovedAt ||
                        submission.created_at
                          ? new Date(
                              submission.employeeApprovedAt ||
                                submission.evaluatorApprovedAt ||
                                submission.created_at
                            ).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : new Date().toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            {/* Print Footer */}
            <div className="print-footer">
              <p className="text-xs text-gray-700">
                CONFIDENTIALITY NOTICE ver.042225: This document and its
                contents are confidential and the intellectual property of SMCT
                Group of Companies and its subsidiaries. Unauthorized use,
                copying, distribution or disclosure is prohibited.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
