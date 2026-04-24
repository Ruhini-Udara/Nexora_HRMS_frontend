"use client";
import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import Image from 'next/image';

// Set up worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PdfPreviewModalProps {
  file: File | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({ file, isOpen, onClose }) => {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && file && file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setImageUrl(url);
        return () => URL.revokeObjectURL(url);
    } else {
        setImageUrl(null);
    }
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity">
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h3 className="font-bold text-slate-800 dark:text-white truncate pr-4">{file.name}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        <div className="p-4 overflow-auto flex-1 flex justify-center bg-slate-100/50 dark:bg-slate-950/50 relative min-h-[500px]">
          {isImage && imageUrl ? (
            <div className="flex items-center justify-center w-full h-full relative">
                <Image 
                    src={imageUrl} 
                    alt={file.name} 
                    fill
                    style={{ objectFit: 'contain' }}
                    className="shadow-md rounded-lg"
                    unoptimized
                />
            </div>
          ) : isPdf ? (
            <Document
                file={file}
                onLoadSuccess={({ numPages }: { numPages: number }) => setNumPages(numPages)}
                loading={
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-pulse flex flex-col items-center text-primary">
                            <span className="material-symbols-outlined text-4xl mb-2 animate-bounce">description</span>
                            <span className="font-medium">Loading PDF...</span>
                        </div>
                    </div>
                }
                error={
                    <div className="absolute inset-0 flex items-center justify-center text-red-500">
                        <span className="material-symbols-outlined mr-2">error</span>
                        Failed to load PDF.
                    </div>
                }
                className="shadow-md"
            >
                <Page pageNumber={pageNumber} width={500} renderTextLayer={false} renderAnnotationLayer={false} />
            </Document>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500">
                <span className="material-symbols-outlined text-4xl mb-2">draft</span>
                <p>Preview not available for this file type.</p>
                <p className="text-xs uppercase mt-1 opacity-60">({file.type || "unknown"})</p>
            </div>
          )}
        </div>
        {numPages && numPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-center gap-6 items-center bg-slate-50 dark:bg-slate-800/50">
            <button
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber(p => p - 1)}
              className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-sm disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center gap-1 text-sm font-medium"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span> Prev
            </button>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Page <span className="font-bold">{pageNumber}</span> of <span className="font-bold">{numPages}</span>
            </span>
            <button
              disabled={pageNumber >= numPages}
              onClick={() => setPageNumber(p => p + 1)}
              className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-sm disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center gap-1 text-sm font-medium"
            >
              Next <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Alias for backwards compatibility
export const FilePreviewModal = PdfPreviewModal;
