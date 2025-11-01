
import React, { useState, useCallback, useRef } from 'react';
import { UploadCloud } from './IconComponents';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if(files[0].type === 'application/pdf') {
        onFileSelect(files[0]);
      }
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const dragClass = isDragging ? 'border-cyan-400 bg-slate-700/50 scale-105' : 'border-slate-600 bg-slate-800/50';

  return (
    <div
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${dragClass} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-cyan-500 hover:bg-slate-700/60'}`}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
        disabled={disabled}
      />
      <UploadCloud className="h-16 w-16 text-slate-500 mb-4" />
      <p className="text-xl font-semibold text-slate-300">Drag & drop your PDF here</p>
      <p className="text-slate-400">or click to browse</p>
    </div>
  );
};
