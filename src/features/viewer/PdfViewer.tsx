import { useEffect, useRef } from 'react';
import { loadPdfDocument } from '../../lib/pdf/pdf.service';

interface PdfViewerProps {
  file: File;
}

export function PdfViewer({ file }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const renderFirstPage = async () => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      try {
        const pdfDocument = await loadPdfDocument(file);
        const page = await pdfDocument.getPage(1);

        const viewport = page.getViewport({ scale: 1.5 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        await page.render(renderContext).promise;
      } catch (error) {
        console.error('Erreur lors du rendu du PDF :', error);
      }
    };
    renderFirstPage();
  }, [file]); // le useEffect se déclenche à chaque fois que le fichier change

  return (
    <div className="flex justify-center p-8 bg-gray-200 min-h-screen">
      <canvas ref={canvasRef} className="border shadow-xl" />
    </div>
  );
}
