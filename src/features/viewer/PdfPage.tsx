import { useEffect, useRef } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';

interface PdfPageProps {
  pdfDocument: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
}

export function PdfPage({ pdfDocument, pageNumber, scale }: PdfPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const renderPage = async () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      try {
        const page = await pdfDocument.getPage(pageNumber);

        // 2. On utilise la prop scale ici au lieu de 1.5
        const viewport = page.getViewport({ scale: scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        await page.render(renderContext).promise;
      } catch (error) {
        console.error('Erreur de rendu page :', error);
      }
    };

    renderPage();
  }, [pdfDocument, pageNumber, scale]);

  return <canvas ref={canvasRef} className="mb-4 bg-white shadow-md mx-auto" />;
}
