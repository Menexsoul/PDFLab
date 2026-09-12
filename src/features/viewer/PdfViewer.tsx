import { useEffect, useState } from 'react';
import { loadPdfDocument } from '../../lib/pdf/pdf.service';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { PdfPage } from './PdfPage';

interface PdfViewerProps {
  file: File;
}

export function PdfViewer({ file }: PdfViewerProps) {
  // On stocke le document chargé et le nombre de pages
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);

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

  // État de chargement si le doc n'est pas encore prêt
  if (!pdfDocument) {
    return <div className="flex min-h-screen items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="flex flex-col items-center bg-gray-200 min-h-screen p-8 overflow-y-auto">
      {/* 
        Cette syntaxe un peu spéciale crée un tableau de la taille numPages
        et boucle dessus pour générer autant de composants <PdfPage /> que nécessaire.
      */}
      {Array.from({ length: numPages }, (_, index) => (
        <PdfPage
          key={index + 1} // En React, les éléments d'une liste doivent avoir une clé unique
          pdfDocument={pdfDocument}
          pageNumber={index + 1} // Les pages PDF.js commencent à 1
        />
      ))}
    </div>
  );
}
