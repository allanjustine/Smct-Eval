'use client';

import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDownIcon } from 'lucide-react';
import { EvaluationPayload } from './types';

interface Step8Props {
  data: EvaluationPayload;
  updateDataAction: (updates: Partial<EvaluationPayload>) => void;
  employee?: {
    id: number;
    name: string;
    email: string;
    position: string;
    department: string;
    role: string;
    hireDate: string;
  };
  onNextAction?: () => void;
}

// Score Dropdown Component
function ScoreDropdown({
  value,
  onValueChange,
  placeholder = "Select Score"
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}) {
  const getScoreColor = (score: string) => {
    switch (score) {
      case '5': return 'text-green-700 bg-green-100';
      case '4': return 'text-blue-700 bg-blue-100';
      case '3': return 'text-yellow-700 bg-yellow-100';
      case '2': return 'text-orange-700 bg-orange-100';
      case '1': return 'text-red-700 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className={`w-15 px-1 py-2 text-lg font-bold border-2 border-yellow-400 rounded-md bg-yellow-100 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm min-h-[40px] 
        justify-between inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none 
        disabled:opacity-50 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground cursor-pointer hover:scale-110 transition-transform duration-200 ${getScoreColor(value)}`}
      >
        {value || ''}
        <ChevronDownIcon className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-32 min-w-[128px] bg-white border-2 border-yellow-400">
        <DropdownMenuItem
          onClick={() => onValueChange('1')}
          className="text-lg font-bold text-red-700 hover:bg-red-50 py-2 text-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
        >
          1
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onValueChange('2')}
          className="text-lg font-bold text-orange-700 hover:bg-orange-50 py-2 text-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
        >
          2
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onValueChange('3')}
          className="text-lg font-bold text-yellow-700 hover:bg-yellow-50 py-2 text-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
        >
          3
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onValueChange('4')}
          className="text-lg font-bold text-blue-700 hover:bg-blue-50 py-2 text-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
        >
          4
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onValueChange('5')}
          className="text-lg font-bold text-green-700 hover:bg-green-50 py-2 text-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
        >
          5
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const ratingLabels = {
  '5': 'Outstanding',
  '4': 'Exceeds Expectations',
  '3': 'Meets Expectations',
  '2': 'Needs Improvement',
  '1': 'Unsatisfactory'
};

const getScoreColor = (score: string) => {
  const numScore = parseInt(score);
  if (numScore >= 4.5) return 'text-green-600 bg-green-100';
  if (numScore >= 4.0) return 'text-blue-600 bg-blue-100';
  if (numScore >= 3.5) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

const getAverageScoreColor = (average: number) => {
  if (average >= 4.5) return 'text-green-600 bg-green-100';
  if (average >= 4.0) return 'text-blue-600 bg-blue-100';
  if (average >= 3.5) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

const getAverageScoreLabel = (average: number) => {
  if (average >= 4.5) return 'Outstanding';
  if (average >= 4.0) return 'Exceeds Expectations';
  if (average >= 3.5) return 'Meets Expectations';
  if (average >= 2.5) return 'Needs Improvement';
  return 'Unsatisfactory';
};

const calculateAverageScore = (scores: (number | string)[]) => {
  const validScores = scores.filter(score => score !== '' && score !== null && score !== undefined && score !== 0).map(score => typeof score === 'number' ? score : Number(score));
  if (validScores.length === 0) return 0;
  const average = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
  return Math.round(average * 10) / 10; // Round to 1 decimal place
};

export default function Step8({ data, updateDataAction, onNextAction }: Step8Props) {
  const handleScoreChange = (field: string, value: string) => {
    updateDataAction({ [field]: Number(value) });
  };

  const handleExplanationChange = (field: string, value: string) => {
    updateDataAction({ [field]: value });
  };

  const managerialSkillsScores = [
    data.managerialSkillsScore1,
    data.managerialSkillsScore2,
    data.managerialSkillsScore3,
    data.managerialSkillsScore4,
    data.managerialSkillsScore5,
    data.managerialSkillsScore6
  ];

  const averageScore = calculateAverageScore(managerialSkillsScores);
  const averageScoreNumber = averageScore;
  const displayAverageScore = averageScore.toString();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">VIII. MANAGERIAL SKILLS</h3>
        <p className="text-gray-600 mb-6">
          Leadership capabilities. Team management and development. Decision-making and strategic thinking. Performance management and coaching.
        </p>
      </div>

      {/* Managerial Skills Evaluation Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-16">

                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900 w-1/4">
                    Behavioral Indicators
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900 w-1/3">
                    Example
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-24">
                    SCORE
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-32">
                    Rating
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-1/4">
                    Explanation
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Row 1: Leadership & Vision */}
                <tr>
                  <td className="border border-gray-300 text-center font-bold px-4 py-3 text-sm text-black">
                  Leadership 
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                  Guides the team to meet goals and improve performance	
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                  Encourages the team to complete a critical project ahead of the deadline while maintaining quality.		
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <ScoreDropdown
                      value={String(data.managerialSkillsScore1 || '')}
                      onValueChange={(value) => handleScoreChange('managerialSkillsScore1', value)}
                      placeholder="-- Select --"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div className={`px-2 py-1 rounded-md text-sm font-bold ${data.managerialSkillsScore1 === 5 ? 'bg-green-100 text-green-800' :
                      data.managerialSkillsScore1 === 4 ? 'bg-blue-100 text-blue-800' :
                        data.managerialSkillsScore1 === 3 ? 'bg-yellow-100 text-yellow-800' :
                          data.managerialSkillsScore1 === 2 ? 'bg-orange-100 text-orange-800' :
                            data.managerialSkillsScore1 === 1 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                      {data.managerialSkillsScore1 === 5 ? 'Outstanding' :
                        data.managerialSkillsScore1 === 4 ? 'Exceeds Expectations' :
                          data.managerialSkillsScore1 === 3 ? 'Meets Expectations' :
                            data.managerialSkillsScore1 === 2 ? 'Needs Improvement' :
                              data.managerialSkillsScore1 === 1 ? 'Unsatisfactory' : 'Not Rated'}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <textarea
                      value={data.managerialSkillsExplanation1 || ''}
                      onChange={(e) => handleExplanationChange('managerialSkillsExplanation1', e.target.value)}
                      placeholder="Enter comments about this competency..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={6}
                    />
                  </td>
                </tr>

                {/* Row 2: Team Management & Development */}
                <tr>
                  <td className="border border-gray-300 px-4 text-center py-3 font-bold text-sm text-black">
                  Motivation
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                  Keeps the team engaged and focused on achieving goals and targets	
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                  Recognizes and rewards team achievements to maintain high morale and engagement.		
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <ScoreDropdown
                      value={String(data.managerialSkillsScore2 || '')}
                      onValueChange={(value) => handleScoreChange('managerialSkillsScore2', value)}
                      placeholder="-- Select --"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div className={`px-2 py-1 rounded-md text-sm font-bold ${data.managerialSkillsScore2 === 5 ? 'bg-green-100 text-green-800' :
                      data.managerialSkillsScore2 === 4 ? 'bg-blue-100 text-blue-800' :
                        data.managerialSkillsScore2 === 3 ? 'bg-yellow-100 text-yellow-800' :
                          data.managerialSkillsScore2 === 2 ? 'bg-orange-100 text-orange-800' :
                            data.managerialSkillsScore2 === 1 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                      {data.managerialSkillsScore2 === 5 ? 'Outstanding' :
                        data.managerialSkillsScore2 === 4 ? 'Exceeds Expectations' :
                          data.managerialSkillsScore2 === 3 ? 'Meets Expectations' :
                            data.managerialSkillsScore2 === 2 ? 'Needs Improvement' :
                              data.managerialSkillsScore2 === 1 ? 'Unsatisfactory' : 'Not Rated'}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <textarea
                      value={data.managerialSkillsExplanation2 || ''}
                      onChange={(e) => handleExplanationChange('managerialSkillsExplanation2', e.target.value)}
                      placeholder="Enter comments about this competency..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={6}
                    />
                  </td>
                </tr>

                {/* Row 3: Decision-Making & Problem-Solving */}
                <tr>
                  <td className="border text-center border-gray-300 px-4 py-3 font-bold text-sm text-black">
                  Decision-Making
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                  Makes timely and informed decisions that benefit the department or company	
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                  Evaluates a situation, assesses needs, considers alternatives, and implements solutions that benefit the team and the company.		
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <ScoreDropdown
                      value={String(data.managerialSkillsScore3 || '')}
                      onValueChange={(value) => handleScoreChange('managerialSkillsScore3', value)}
                      placeholder="-- Select --"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div className={`px-2 py-1 rounded-md text-sm font-bold ${data.managerialSkillsScore3 === 5 ? 'bg-green-100 text-green-800' :
                      data.managerialSkillsScore3 === 4 ? 'bg-blue-100 text-blue-800' :
                        data.managerialSkillsScore3 === 3 ? 'bg-yellow-100 text-yellow-800' :
                          data.managerialSkillsScore3 === 2 ? 'bg-orange-100 text-orange-800' :
                            data.managerialSkillsScore3 === 1 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                      {data.managerialSkillsScore3 === 5 ? 'Outstanding' :
                        data.managerialSkillsScore3 === 4 ? 'Exceeds Expectations' :
                          data.managerialSkillsScore3 === 3 ? 'Meets Expectations' :
                            data.managerialSkillsScore3 === 2 ? 'Needs Improvement' :
                              data.managerialSkillsScore3 === 1 ? 'Unsatisfactory' : 'Not Rated'}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <textarea
                      value={data.managerialSkillsExplanation3 || ''}
                      onChange={(e) => handleExplanationChange('managerialSkillsExplanation3', e.target.value)}
                      placeholder="Enter comments about this competency..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={6}
                    />
                  </td>
                </tr>

                {/* Row 4: Performance Management & Coaching */}
                <tr>
                  <td className="border border-gray-300 text-center px-4 font-bold py-3 text-sm text-black">
                  Planning & Resource Management
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                  Creates detailed plans and allocates resources, time, and budget efficiently	
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                  Develops a timeline for team deliverables, ensuring tasks are assigned based on workload and skills.		
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <ScoreDropdown
                      value={String(data.managerialSkillsScore4 || '')}
                      onValueChange={(value) => handleScoreChange('managerialSkillsScore4', value)}
                      placeholder="-- Select --"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div className={`px-2 py-1 rounded-md text-sm font-bold ${data.managerialSkillsScore4 === 5 ? 'bg-green-100 text-green-800' :
                      data.managerialSkillsScore4 === 4 ? 'bg-blue-100 text-blue-800' :
                        data.managerialSkillsScore4 === 3 ? 'bg-yellow-100 text-yellow-800' :
                          data.managerialSkillsScore4 === 2 ? 'bg-orange-100 text-orange-800' :
                            data.managerialSkillsScore4 === 1 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                      {data.managerialSkillsScore4 === 5 ? 'Outstanding' :
                        data.managerialSkillsScore4 === 4 ? 'Exceeds Expectations' :
                          data.managerialSkillsScore4 === 3 ? 'Meets Expectations' :
                            data.managerialSkillsScore4 === 2 ? 'Needs Improvement' :
                              data.managerialSkillsScore4 === 1 ? 'Unsatisfactory' : 'Not Rated'}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <textarea
                      value={data.managerialSkillsExplanation4 || ''}
                      onChange={(e) => handleExplanationChange('managerialSkillsExplanation4', e.target.value)}
                      placeholder="Enter comments about this competency..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={6}
                    />
                  </td>
                </tr>

                {/* Row 5: Communication & Influence */}
                <tr>
                  <td className="border border-gray-300 px-4 text-center py-3 font-bold text-sm text-black">
                  Performance Feedback
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                  Regularly monitors performance and gives constructive feedback	
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                  Holds one-on-one meetings to discuss individual performance and offer guidance for improvement.		  
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <ScoreDropdown
                      value={String(data.managerialSkillsScore5 || '')}
                      onValueChange={(value) => handleScoreChange('managerialSkillsScore5', value)}
                      placeholder="-- Select --"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div className={`px-2 py-1 rounded-md text-sm font-bold ${data.managerialSkillsScore5 === 5 ? 'bg-green-100 text-green-800' :
                      data.managerialSkillsScore5 === 4 ? 'bg-blue-100 text-blue-800' :
                        data.managerialSkillsScore5 === 3 ? 'bg-yellow-100 text-yellow-800' :
                          data.managerialSkillsScore5 === 2 ? 'bg-orange-100 text-orange-800' :
                            data.managerialSkillsScore5 === 1 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                      {data.managerialSkillsScore5 === 5 ? 'Outstanding' :
                        data.managerialSkillsScore5 === 4 ? 'Exceeds Expectations' :
                          data.managerialSkillsScore5 === 3 ? 'Meets Expectations' :
                            data.managerialSkillsScore5 === 2 ? 'Needs Improvement' :
                              data.managerialSkillsScore5 === 1 ? 'Unsatisfactory' : 'Not Rated'}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <textarea
                      value={data.managerialSkillsExplanation5 || ''}
                      onChange={(e) => handleExplanationChange('managerialSkillsExplanation5', e.target.value)}
                      placeholder="Enter comments about this competency..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={6}
                    />
                  </td>
                </tr>

                {/* Row 6: [Add your 6th managerial skill here] */}
                <tr>
                  <td className="border text-center border-gray-300 px-4 font-bold py-3 text-sm text-black">
                  Conflict Resolution
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                  Resolves disagreements professionally and fairly	
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                  Mediates conflict between team members, ensuring a collaborative solution that benefits the group.		
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <ScoreDropdown
                      value={String(data.managerialSkillsScore6 || '')}
                      onValueChange={(value) => handleScoreChange('managerialSkillsScore6', value)}
                      placeholder="-- Select --"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div className={`px-2 py-1 rounded-md text-sm font-bold ${data.managerialSkillsScore6 === 5 ? 'bg-green-100 text-green-800' :
                      data.managerialSkillsScore6 === 4 ? 'bg-blue-100 text-blue-800' :
                        data.managerialSkillsScore6 === 3 ? 'bg-yellow-100 text-yellow-800' :
                          data.managerialSkillsScore6 === 2 ? 'bg-orange-100 text-orange-800' :
                            data.managerialSkillsScore6 === 1 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                      {data.managerialSkillsScore6 === 5 ? 'Outstanding' :
                        data.managerialSkillsScore6 === 4 ? 'Exceeds Expectations' :
                          data.managerialSkillsScore6 === 3 ? 'Meets Expectations' :
                            data.managerialSkillsScore6 === 2 ? 'Needs Improvement' :
                              data.managerialSkillsScore6 === 1 ? 'Unsatisfactory' : 'Not Rated'}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <textarea
                      value={data.managerialSkillsExplanation6 || ''}
                      onChange={(e) => handleExplanationChange('managerialSkillsExplanation6', e.target.value)}
                      placeholder="Enter comments about this competency..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={6}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Average Score Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Managerial Skills - Average Score</h3>
            <div className="flex justify-center items-center gap-6">
              <div className={`px-6 py-4 rounded-lg border-2 ${getAverageScoreColor(averageScoreNumber)}`}>
                <div className="text-3xl font-bold">{displayAverageScore}</div>
                <div className="text-sm font-medium mt-1">{getAverageScoreLabel(averageScoreNumber)}</div>
              </div>
              <div className="text-left">
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Score Breakdown:</strong>
                </div>
                <div className="space-y-1 text-sm">
                  <div>Leadership & Vision: <span className="font-semibold">{data.managerialSkillsScore1 || 'Not rated'}</span></div>
                  <div>Team Management & Development: <span className="font-semibold">{data.managerialSkillsScore2 || 'Not rated'}</span></div>
                  <div>Decision-Making & Problem-Solving: <span className="font-semibold">{data.managerialSkillsScore3 || 'Not rated'}</span></div>
                  <div>Performance Management & Coaching: <span className="font-semibold">{data.managerialSkillsScore4 || 'Not rated'}</span></div>
                  <div>Communication & Influence: <span className="font-semibold">{data.managerialSkillsScore5 || 'Not rated'}</span></div>
                  <div>[Skill Name]: <span className="font-semibold">{data.managerialSkillsScore6 || 'Not rated'}</span></div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Average calculated from {[data.managerialSkillsScore1, data.managerialSkillsScore2, data.managerialSkillsScore3, data.managerialSkillsScore4, data.managerialSkillsScore5, data.managerialSkillsScore6].filter(score => score && score !== 0).length} of 6 criteria
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

