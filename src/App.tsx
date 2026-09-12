import { FileUploader } from './components/FileUploader';
import { loadPdfDocument } from './lib/pdf/pdf.service';

function App() {
  const handlePdfSelect = async (file: File) => {
    try {
      const pdfDoc = await loadPdfDocument(file);
      console.log('Succès ! Ce PDF contient', pdfDoc.numPages, 'pages.');
    } catch (error) {
      console.error('Erreur lors de la lecture du PDF :', error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-100">
      <FileUploader onFileSelect={handlePdfSelect} />
    </div>
  );
}

export default App;
