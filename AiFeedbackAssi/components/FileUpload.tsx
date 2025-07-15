'use client';

import { useState, useRef, DragEvent } from 'react';
import styles from './FileUpload.module.css';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export default function FileUpload({ onFileSelect }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (isValidAudioFile(file)) {
        onFileSelect(file);
      } else {
        alert('Please select a valid audio file (.mp3 or .wav)');
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidAudioFile(file)) {
      onFileSelect(file);
    }
  };

  const isValidAudioFile = (file: File): boolean => {
    const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav'];
    return validTypes.includes(file.type) || 
           file.name.toLowerCase().endsWith('.mp3') || 
           file.name.toLowerCase().endsWith('.wav');
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`${styles.uploadArea} ${isDragging ? styles.dragging : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3,.wav,audio/*"
        onChange={handleFileInput}
        className={styles.fileInput}
      />
      
      <div className={styles.uploadContent}>
        <div className={styles.uploadIcon}>📁</div>
        <div className={styles.uploadText}>
          <p>Drag and drop your audio file here</p>
          <p>or click to browse</p>
        </div>
        <div className={styles.supportedFormats}>
          Supported formats: MP3, WAV
        </div>
      </div>
    </div>
  );
} 