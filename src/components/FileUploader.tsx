import React, { useState } from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

export function FileUploader({ onFileSelect }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    if (file.type !== 'application/pdf') {
      setError('Le fichier doit être au format PDF.');
      return false;
    }

    if (file.size >= 50 * 1024 * 1024) {
      setError('La taille du fichier doit être inférieure à 50 Mo.');
      return false;
    }

    setError(null);
    return true;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0 && validateFile(files[0])) {
      onFileSelect(files[0]);
    }
  };

  // 2. Gestion du survol
  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault(); // Très important !
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const files = event.dataTransfer.files;
    if (files && files.length > 0 && validateFile(files[0])) {
      onFileSelect(files[0]);
    }
  };

  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="flex w-full max-w-xl flex-col items-center justify-center">
      <label
        htmlFor="pdf-upload"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'
        }`}
      >
        <div className="flex flex-col items-center justify-center pb-6 pt-5">
          {/* Une petite icône SVG pour rendre l'UI plus professionnelle */}
          <svg
            className="mb-4 h-10 w-10 text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
            />
          </svg>
          <p className="mb-2 text-sm text-gray-600">
            <span className="font-semibold text-blue-600">Cliquez pour parcourir</span>
          </p>
          <p className="text-xs text-gray-500">Seuls les fichiers PDF sont acceptés</p>
        </div>

        <input
          id="pdf-upload"
          type="file"
          className="hidden"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
        />
      </label>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
