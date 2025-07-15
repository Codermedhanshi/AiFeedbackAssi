'use client';

import { FeedbackResponse } from '../types';
import { evaluationParameters } from '../lib/evaluationParams';
import styles from './ResultsDisplay.module.css';

interface ResultsDisplayProps {
  results: FeedbackResponse | null;
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  if (!results) {
    return (
      <div className={styles.resultsContainer}>
        <div className={styles.noResults}>
          No results to display. Upload an audio file and click "Process" to see analysis.
        </div>
      </div>
    );
  }

  const getTotalScore = () => {
    return Object.values(results.scores).reduce((sum, score) => sum + score, 0);
  };

  const getMaxScore = () => {
    return evaluationParameters.reduce((sum, param) => sum + param.weight, 0);
  };

  const getScoreColor = (score: number, weight: number, inputType: string) => {
    if (inputType === 'PASS_FAIL') {
      return score === weight ? '#28a745' : '#dc3545';
    } else {
      const percentage = (score / weight) * 100;
      if (percentage >= 80) return '#28a745';
      if (percentage >= 60) return '#ffc107';
      return '#dc3545';
    }
  };

  return (
    <div className={styles.resultsContainer}>
      <div className={styles.header}>
        <h2>Analysis Results</h2>
        <div className={styles.totalScore}>
          Total Score: {getTotalScore()}/{getMaxScore()}
        </div>
      </div>

      <div className={styles.scoresGrid}>
        {evaluationParameters.map((param) => {
          const score = results.scores[param.key];
          const color = getScoreColor(score, param.weight, param.inputType);
          
          return (
            <div key={param.key} className={styles.scoreCard}>
              <div className={styles.scoreHeader}>
                <h3>{param.name}</h3>
                <div 
                  className={styles.score}
                  style={{ color }}
                >
                  {score}/{param.weight}
                </div>
              </div>
              <div className={styles.scoreDescription}>
                {param.desc}
              </div>
              <div className={styles.scoreType}>
                {param.inputType === 'PASS_FAIL' ? 'Pass/Fail' : 'Scored'}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.feedbackSection}>
        <div className={styles.feedbackCard}>
          <h3>Overall Feedback</h3>
          <p>{results.overallFeedback}</p>
        </div>
        
        <div className={styles.feedbackCard}>
          <h3>Observation</h3>
          <p>{results.observation}</p>
        </div>
      </div>
    </div>
  );
} 