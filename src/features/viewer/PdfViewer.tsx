import { useEffect, useState } from 'react';
import { loadPdfDocument } from '../../lib/pdf/pdf.service';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { PdfPage } from './PdfPage';
import { Toolbar } from '../../components/Toolbar';

interface PdfViewerProps {
  file: File;
}

export function PdfViewer({ file }: PdfViewerProps) {
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);

  // 1. Nouvel état pour suivre la page actuelle
  const [currentPage, setCurrentPage] = useState(1);

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

  if (!pdfDocument) {
    return <div className="flex min-h-screen items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="flex h-screen flex-col bg-gray-200">
      <Toolbar
        currentPage={currentPage}
        numPages={numPages}
        onPrev={() => goToPage(currentPage - 1)}
        onNext={() => goToPage(currentPage + 1)}
      />

      <div className="flex-1 overflow-y-auto p-8">
        {Array.from({ length: numPages }, (_, index) => {
          const pageNumber = index + 1;
          return (
            // L'ID est crucial ici pour que document.getElementById() fonctionne
            <div key={pageNumber} id={`page-${pageNumber}`} className="mb-6 flex justify-center">
              <PdfPage pdfDocument={pdfDocument} pageNumber={pageNumber} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
