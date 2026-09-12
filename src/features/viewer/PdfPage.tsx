import { useEffect, useRef } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';

interface PdfPageProps {
  pdfDocument: PDFDocumentProxy;
  pageNumber: number;
}

export function PdfPage({ pdfDocument, pageNumber }: PdfPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const renderPage = async () => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      const page = await pdfDocument.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport,
        canvas,
      };

      await page.render(renderContext).promise;
    };

    renderPage();
  }, [pdfDocument, pageNumber]);

  return <canvas ref={canvasRef} className="mb-4 bg-white shadow-md mx-auto" />;
}
