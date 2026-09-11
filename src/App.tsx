import { FileUploader } from './components/FileUploader';

function App() {
  const handlePdfSelect = (file: File) => {
    console.log('Fichier sélectionné :', file.name, file.size);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-100">
      <FileUploader onFileSelect={handlePdfSelect} />
    </div>
  );
}

export default App;
