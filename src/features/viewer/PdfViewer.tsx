import { useEffect, useRef, useState } from 'react';
import { loadPdfDocument } from '../../lib/pdf/pdf.service';
import { mergePdfs, removePageFromPdf } from '../../lib/pdf/modifier.service';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { PdfPage } from './PdfPage';
import { Toolbar } from '../../components/Toolbar';
import { rotatePageInPdf } from '../../lib/pdf/modifier.service';

interface PdfViewerProps {
  file: File;
  onFileUpdate: (file: File | null) => void;
}

export function PdfViewer({ file, onFileUpdate }: PdfViewerProps) {
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);

  // 1. Nouvel état pour suivre la page actuelle
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.5);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initPdf = async () => {
      try {
        const doc = await loadPdfDocument(file);
        setPdfDocument(doc);
        setNumPages(doc.numPages);
      } catch (error) {
        console.error('Erreur lors du chargement :', error);
      }
    };
    initPdf();
  }, [file]);

  // 2. La fonction qui gère la navigation
  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= numPages) {
      setCurrentPage(pageNumber);

      // On cherche l'élément HTML correspondant à la page dans le DOM
      const pageElement = document.getElementById(`page-${pageNumber}`);
      if (pageElement) {
        // On demande au navigateur de scroller jusqu'à cet élément avec une animation fluide
        pageElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleFitWidth = async () => {
    if (!containerRef.current || !pdfDocument) return;

    const page = await pdfDocument.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    const availableWidth = containerRef.current.clientWidth - 64;

    setScale(Math.max(0.5, availableWidth / viewport.width));
  };

  const handleDeletePage = async (pageNumber: number) => {
    try {
      const updatedFile = await removePageFromPdf(file, pageNumber - 1);
      onFileUpdate(updatedFile);
    } catch (error) {
      console.error('Erreur lors de la suppression de la page :', error);
    }
  };

  const handleRotatePage = async (pageNumber: number) => {
    try {
      const newFile = await rotatePageInPdf(file, pageNumber - 1);
      onFileUpdate(newFile);
    } catch (error) {
      console.error('Erreur lors de la rotation :', error);
    }
  };

  const handleMergePdf = async (fileToAppend: File) => {
    try {
      const mergedFile = await mergePdfs(file, fileToAppend);
      onFileUpdate(mergedFile); // Met à jour l'interface avec le nouveau fichier
    } catch (error) {
      console.error('Erreur lors de la fusion :', error);
    }
  };

  const handleDownloadPdf = () => {
    // 1. Crée une URL temporaire pointant vers le fichier en mémoire
    const url = URL.createObjectURL(file);

    // 2. Crée le lien de téléchargement
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name; // On réutilise le nom du fichier (qui a été mis à jour par nos services)

    // 3. Déclenche le clic
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 4. Nettoie la mémoire (très important pour les gros fichiers)
    URL.revokeObjectURL(url);
  };

  if (!pdfDocument) {
    return <div className="flex min-h-screen items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="flex h-screen flex-col bg-gray-200">
      <Toolbar
        currentPage={currentPage}
        numPages={numPages}
        scale={scale}
        onPrev={() => goToPage(currentPage - 1)}
        onNext={() => goToPage(currentPage + 1)}
        onZoomIn={() => setScale((currentScale) => currentScale + 0.25)}
        onZoomOut={() => setScale((currentScale) => Math.max(0.5, currentScale - 0.25))}
        onFitWidth={handleFitWidth}
        onMerge={handleMergePdf}
        onDownloadPdf={handleDownloadPdf}
      />

      <div ref={containerRef} className="flex-1 overflow-y-auto p-8">
        {Array.from({ length: numPages }, (_, index) => {
          const pageNumber = index + 1;
          return (
            // L'ID est crucial ici pour que document.getElementById() fonctionne
            <div key={pageNumber} id={`page-${pageNumber}`} className="mb-6 flex justify-center">
              <PdfPage
                pdfDocument={pdfDocument}
                pageNumber={pageNumber}
                scale={scale}
                onDelete={() => handleDeletePage(pageNumber)}
                onRotate={() => handleRotatePage(pageNumber)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
