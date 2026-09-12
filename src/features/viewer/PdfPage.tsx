import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';

interface PdfPageProps {
  pdfDocument: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
}

export function PdfPage({ pdfDocument, pageNumber, scale }: PdfPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(true);

  useEffect(() => {
    const renderPage = async () => {
      setIsRendering(true);

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
      } finally {
        setIsRendering(false);
      }
    };

    renderPage();
  }, [pdfDocument, pageNumber, scale]);

  return (
    <div className="relative mb-4 mx-auto bg-white shadow-md min-h-[800px] w-full flex items-center justify-center">
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50">
          <span className="font-medium text-gray-500 animate-pulse">Chargement...</span>
        </div>
      )}
      <canvas ref={canvasRef} aria-busy={isRendering} className="block" />
    </div>
  );
}
