import { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { PdfViewer } from './features/viewer/PdfViewer';

function App() {
  // L'état qui contient le fichier (null par défaut)
  const [file, setFile] = useState<File | null>(null);

  const handlePdfSelect = (selectedFile: File) => {
    // Quand un fichier est validé par le FileUploader, on le stocke dans l'état
    setFile(selectedFile);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {!file ? (
        <div className="flex min-h-screen items-center justify-center p-4">
          <FileUploader onFileSelect={handlePdfSelect} />
        </div>
      ) : (
        <PdfViewer file={file} onFileUpdate={setFile} />
      )}
    </div>
  );
}

export default App;
