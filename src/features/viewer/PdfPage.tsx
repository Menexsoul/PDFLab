import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';

interface PdfPageProps {
  pdfDocument: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  onDelete: () => void;
  onRotate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function PdfPage({
  pdfDocument,
  pageNumber,
  scale,
  onDelete,
  onRotate,
  onMoveUp,
  onMoveDown,
}: PdfPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(true);
  const isFirstPage = pageNumber === 1;
  const isLastPage = pageNumber === pdfDocument.numPages;

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
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          type="button"
          onClick={handleDownloadImage}
          aria-label={`Télécharger la page ${pageNumber} en image`}
          className="pointer-events-none rounded bg-blue-600 px-3 py-2 text-sm text-white opacity-0 shadow-md transition-all hover:bg-blue-700 group-hover:pointer-events-auto group-hover:opacity-100"
        >
          <span aria-hidden="true" className="font-bold">
            ⇩
          </span>
          <span className="sr-only">Télécharger</span>
        </button>
        {!isFirstPage && !isRendering && (
          <button
            type="button"
            onClick={onMoveUp}
            aria-label={`Monter la page ${pageNumber}`}
            className="rounded bg-purple-600 px-3 py-2 text-sm text-white shadow-md transition-colors hover:bg-purple-700"
          >
            <span aria-hidden="true" className="font-bold">
              ↑
            </span>
            <span className="sr-only">Monter</span>
          </button>
        )}
        {!isLastPage && !isRendering && (
          <button
            type="button"
            onClick={onMoveDown}
            aria-label={`Descendre la page ${pageNumber}`}
            className="rounded bg-purple-600 px-3 py-2 text-sm text-white shadow-md transition-colors hover:bg-purple-700"
          >
            <span aria-hidden="true" className="font-bold">
              ↓
            </span>
            <span className="sr-only">Descendre</span>
          </button>
        )}
        {!isRendering && (
          <button
            type="button"
            onClick={onRotate}
            aria-label={`Pivoter la page ${pageNumber}`}
            className="rounded bg-gray-700 px-3 py-2 text-sm text-white shadow-md transition-colors hover:bg-gray-800"
          >
            <span aria-hidden="true" className="font-bold">
              ↻
            </span>
            <span className="sr-only">Pivoter</span>
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Supprimer la page ${pageNumber}`}
          className="pointer-events-none rounded bg-red-600 px-3 py-2 text-sm text-white opacity-0 shadow-md transition-all hover:bg-red-700 group-hover:pointer-events-auto group-hover:opacity-100"
        >
          <span aria-hidden="true" className="font-bold">
            ×
          </span>
          <span className="sr-only">Supprimer</span>
        </button>
      </div>
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50">
          <span className="font-medium text-gray-500 animate-pulse">Chargement...</span>
        </div>
      )}
      <canvas ref={canvasRef} aria-busy={isRendering} className="block" />
    </div>
  );
}
