import React, { useCallback } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';

interface FileUploadDropzoneProps extends Omit<DropzoneOptions, 'onDrop'> {
  onFileAccepted: (file: File) => void;
  currentFile: File | null;
  label: string;
  isParsing?: boolean;
}

export const FileUploadDropzone: React.FC<FileUploadDropzoneProps> = ({ 
  onFileAccepted, 
  currentFile, 
  label, 
  isParsing,
  disabled,
  ...dropzoneProps 
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileAccepted(acceptedFiles[0]);
    }
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: disabled || isParsing,
    multiple: false,
    ...dropzoneProps
  });

  return (
    <div
      {...getRootProps()}
      className={`mt-2 border-2 border-dashed p-4 text-center rounded-lg cursor-pointer transition-colors ${
        isDragActive ? 'border-primary bg-primary/5' : 'border-slate-300 dark:border-slate-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}`}
    >
      <input {...getInputProps()} />
      {isParsing ? (
        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Processing...</span>
      ) : currentFile ? (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {currentFile.name} <span className="text-xs text-slate-500 block">(Click or drag to change)</span>
        </span>
      ) : (
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Drag & drop or click to upload {label}
        </span>
      )}
    </div>
  );
};
