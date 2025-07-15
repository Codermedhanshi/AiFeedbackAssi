export interface EvaluationParameter {
  key: string;
  name: string;
  weight: number;
  desc: string;
  inputType: 'PASS_FAIL' | 'SCORE';
}

export interface Scores {
  [key: string]: number;
}

export interface FeedbackResponse {
  scores: Scores;
  overallFeedback: string;
  observation: string;
}

export interface AnalysisResult {
  success: boolean;
  data?: FeedbackResponse;
  error?: string;
} 