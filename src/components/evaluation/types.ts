// Common types
export type ISODateString = string; // e.g. "2number24-number1-number1"

export type ReviewTypeRegular = "" | "Q1" | "Q2" | "Q3" | "Q4";
export type ReviewTypeProbationary = "" | 3 | 5;

// Main payload
interface EvaluationPayload {
  hireDate: string;
  rating: number | String;
  coverageFrom: string | Date;
  coverageTo: string | Date;
  reviewTypeProbationary: ReviewTypeProbationary;
  reviewTypeRegular: ReviewTypeRegular;
  reviewTypeOthersImprovement: boolean;
  reviewTypeOthersCustom: string;
  priorityArea1: string;
  priorityArea2: string;
  priorityArea3: string;
  remarks: string;
  jobKnowledgeScore1: number;
  jobKnowledgeScore2: number;
  jobKnowledgeScore3: number;
  jobKnowledgeComments1: string;
  jobKnowledgeComments2: string;
  jobKnowledgeComments3: string;
  qualityOfWorkScore1: number;
  qualityOfWorkScore2: number;
  qualityOfWorkScore3: number;
  qualityOfWorkScore4: number;
  qualityOfWorkScore5: number;
  qualityOfWorkScore6?: number; // Branch Manager only
  qualityOfWorkScore7?: number; // Branch Manager only
  qualityOfWorkScore8?: number; // Branch Manager only
  qualityOfWorkScore9?: number; // Branch Manager only
  qualityOfWorkScore10?: number; // Branch Manager only
  qualityOfWorkScore11?: number; // Branch Manager only
  qualityOfWorkComments1: string;
  qualityOfWorkComments2: string;
  qualityOfWorkComments3: string;
  qualityOfWorkComments4: string;
  qualityOfWorkComments5: string;
  qualityOfWorkComments6?: string; // Branch Manager only
  qualityOfWorkComments7?: string; // Branch Manager only
  qualityOfWorkComments8?: string; // Branch Manager only
  qualityOfWorkComments9?: string; // Branch Manager only
  qualityOfWorkComments10?: string; // Branch Manager only
  qualityOfWorkComments11?: string; // Branch Manager only
  adaptabilityScore1: number;
  adaptabilityScore2: number;
  adaptabilityScore3: number;
  adaptabilityComments1: string;
  adaptabilityComments2: string;
  adaptabilityComments3: string;
  teamworkScore1: number;
  teamworkScore2: number;
  teamworkScore3: number;
  teamworkComments1: string;
  teamworkComments2: string;
  teamworkComments3: string;
  reliabilityScore1: number;
  reliabilityScore2: number;
  reliabilityScore3: number;
  reliabilityScore4: number;
  reliabilityComments1: string;
  reliabilityComments2: string;
  reliabilityComments3: string;
  reliabilityComments4: string;
  ethicalScore1: number;
  ethicalScore2: number;
  ethicalScore3: number;
  ethicalScore4: number;
  ethicalExplanation1: string;
  ethicalExplanation2: string;
  ethicalExplanation3: string;
  ethicalExplanation4: string;
  customerServiceScore1: number;
  customerServiceScore2: number;
  customerServiceScore3: number;
  customerServiceScore4: number;
  customerServiceScore5: number;
  customerServiceExplanation1: string;
  customerServiceExplanation2: string;
  customerServiceExplanation3: string;
  customerServiceExplanation4: string;
  customerServiceExplanation5: string;
  managerialSkillsScore1: number;
  managerialSkillsScore2: number;
  managerialSkillsScore3: number;
  managerialSkillsScore4: number;
  managerialSkillsScore5: number;
  managerialSkillsScore6: number;
  managerialSkillsExplanation1: string;
  managerialSkillsExplanation2: string;
  managerialSkillsExplanation3: string;
  managerialSkillsExplanation4: string;
  managerialSkillsExplanation5: string;
  managerialSkillsExplanation6: string;
  created_at: string;
}
export type { EvaluationPayload };

import React from "react";

// Evaluation step configuration
export interface EvaluationStepConfig {
  id: number;
  title: string;
  component: React.ComponentType<any>;
}

export interface EvaluationFormConfig {
  steps: EvaluationStepConfig[];
  includeOverallAssessment?: boolean;
  evaluationType?: 'rankNfile' | 'basic' | 'default';
}