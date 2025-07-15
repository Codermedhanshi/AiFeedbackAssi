'use client';

import { useState } from 'react';
import AudioPlayer from '../../components/AudioPlayer';
import FileUpload from '../../components/FileUpload';
import ResultsDisplay from '../../components/ResultsDisplay';
import { FeedbackResponse } from '../../types';
import styles from './page.module.css';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [results, setResults] = useState<FeedbackResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setAudioUrl(URL.createObjectURL(file));
    setResults(null);
    setError(null);
  };

  const handleProcess = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);
    setResults(null);
    try {
      const formData = new FormData();
      formData.append('audio', selectedFile);
      const response = await fetch('/api/analyze-call', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setResults(data.data);
      } else {
        setError(data.error || 'Failed to process audio.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>AI Feedback for Debt Collection Calls</h1>
        <FileUpload onFileSelect={handleFileSelect} />
        <AudioPlayer audioUrl={audioUrl} />
        <div className={styles.actions}>
          <button
            className={styles.processButton}
            onClick={handleProcess}
            disabled={!selectedFile || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Process'}
          </button>
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <ResultsDisplay results={results} />
      </main>
    </div>
  );
}
