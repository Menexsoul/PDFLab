import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';

interface PdfPageProps {
  pdfDocument: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  onDelete: () => void;
}

export function PdfPage({ pdfDocument, pageNumber, scale, onDelete }: PdfPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(true);

  const handleDownloadImage = () => {
    if (!canvasRef.current) return;

    const imageUrl = canvasRef.current.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = imageUrl;
    downloadLink.download = `page-${pageNumber}.png`;
    downloadLink.click();
  };

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
    <div className="relative group w-fit mb-4 mx-auto bg-white shadow-md min-h-[800px] flex items-center justify-center">
      <button
        type="button"
        onClick={handleDownloadImage}
        aria-label={`Télécharger la page ${pageNumber} en image`}
        // Modification ici : bg-blue-600, text-white, et un léger hover
        className="pointer-events-none absolute top-4 right-4 z-10 rounded bg-blue-600 px-3 py-2 text-sm text-white opacity-0 shadow-md transition-all hover:bg-blue-700 group-hover:pointer-events-auto group-hover:opacity-100"
      >
        <span aria-hidden="true" className="font-bold">
          ⇩
        </span>
        <span className="sr-only">Télécharger</span>
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Supprimer la page ${pageNumber}`}
        className="pointer-events-none absolute top-4 right-20 z-10 rounded bg-red-600 px-3 py-2 text-sm text-white opacity-0 shadow-md transition-all hover:bg-red-700 group-hover:pointer-events-auto group-hover:opacity-100"
      >
        <span aria-hidden="true" className="font-bold">
          ×
        </span>
        <span className="sr-only">Supprimer</span>
      </button>
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50">
          <span className="font-medium text-gray-500 animate-pulse">Chargement...</span>
        </div>
      )}
      <canvas ref={canvasRef} aria-busy={isRendering} className="block" />
    </div>
  );
}
