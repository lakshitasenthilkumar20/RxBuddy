import React, { useState, useRef } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';



interface UploadPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}

import { uploadPrescription, processOCR } from '../../api';

export function UploadPrescriptionModal({ isOpen, onClose, onUpload }: UploadPrescriptionModalProps) {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'application/pdf')) {
      setSelectedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);

    try {
      // 1. Upload the file
      const uploadResult = await uploadPrescription(selectedFile);

      // 2. Trigger OCR processing automatically if ID is returned
      if (uploadResult && uploadResult.id) {
        await processOCR(uploadResult.id);
      }

      onUpload(selectedFile);
      setSelectedFile(null);
      setIsProcessing(false);
      onClose();

      // 3. Redirect to dashboard home
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      alert('Processing failed. Please make sure you are logged in and try again.');
    }

  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-xl">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-semibold text-gray-900">Upload Prescription</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-6">
          {!isProcessing ? (
            <>
              {/* Drag & Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50'
                  }`}
              >
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-base font-medium text-gray-700 mb-1">
                  Drag and drop your prescription here
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  or click to browse
                </p>
                <p className="text-xs text-gray-400">
                  Supports PNG, JPG, and PDF files
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* File Preview */}
              {selectedFile && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="p-1 hover:bg-blue-100 rounded transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center">
              <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-base font-medium text-gray-700">Extracting text...</p>
              <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isProcessing && (
          <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Upload & Process
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
