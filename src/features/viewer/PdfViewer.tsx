import { useEffect, useRef, useState } from 'react';
import { loadPdfDocument } from '../../lib/pdf/pdf.service';
import {
  mergePdfs,
  removePageFromPdf,
  rotatePageInPdf,
  movePageInPdf,
  extractPageAsPdf,
  insertBlankPageAfter,
  addWatermarkToPdf,
} from '../../lib/pdf/modifier.service';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { PdfPage } from './PdfPage';
import { Toolbar } from '../../components/Toolbar';
import { DndContext, closestCorners } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { SortablePageWrapper } from './SortablePageWrapper';

interface PdfViewerProps {
  file: File;
  onFileUpdate: (file: File | null) => void;
  onClose: () => void;
}

export function PdfViewer({ file, onFileUpdate, onClose }: PdfViewerProps) {
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);

  // 1. Nouvel état pour suivre la page actuelle
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.5);
  // Nouveau state pour dnd-kit
  const [pageIds, setPageIds] = useState<string[]>([]);
  const [isGridView, setIsGridView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // À chaque mise à jour du document, on recrée les IDs dans l'ordre naturel.
  useEffect(() => {
    if (numPages > 0) {
      setPageIds(Array.from({ length: numPages }, (_, i) => `page-${i + 1}`));
    }
  }, [numPages, pdfDocument]);

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

  const handleMoveUp = async (pageNumber: number) => {
    if (pageNumber <= 1) return;
    try {
      // Pour monter : on déplace l'index actuel (pageNumber - 1) vers l'index précédent (pageNumber - 2)
      const newFile = await movePageInPdf(file, pageNumber - 1, pageNumber - 2);
      onFileUpdate(newFile);
    } catch (error) {
      console.error('Erreur lors du déplacement (haut) :', error);
    }
  };

  const handleMoveDown = async (pageNumber: number) => {
    if (pageNumber >= numPages) return;
    try {
      // Pour descendre : on déplace vers l'index suivant (pageNumber)
      const newFile = await movePageInPdf(file, pageNumber - 1, pageNumber);
      onFileUpdate(newFile);
    } catch (error) {
      console.error('Erreur lors du déplacement (bas) :', error);
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

  const handleExtractPage = async (pageNumber: number) => {
    try {
      // On récupère le nouveau fichier d'une page
      const extractedFile = await extractPageAsPdf(file, pageNumber - 1);

      // On déclenche son téléchargement direct
      const url = URL.createObjectURL(extractedFile);
      const link = document.createElement('a');
      link.href = url;
      link.download = extractedFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors de l'extraction :", error);
    }
  };

  const handleInsertBlankPage = async (pageNumber: number) => {
    try {
      // On insère après la page actuelle (pageNumber - 1)
      const newFile = await insertBlankPageAfter(file, pageNumber - 1);
      onFileUpdate(newFile);
    } catch (error) {
      console.error("Erreur lors de l'insertion d'une page blanche :", error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    // Si on a lâché la page en dehors de la liste, ou sur sa position d'origine, on annule
    if (!over || active.id === over.id) return;

    const oldIndex = pageIds.indexOf(active.id as string);
    const newIndex = pageIds.indexOf(over.id as string);

    // 1. Mise à jour immédiate de l'interface (Optimistic UI) pour une UX fluide
    setPageIds((items) => arrayMove(items, oldIndex, newIndex));

    try {
      // 2. On effectue la vraie modification du PDF en arrière-plan avec la fonction codée au DEV-023
      const newFile = await movePageInPdf(file, oldIndex, newIndex);
      onFileUpdate(newFile);
    } catch (error) {
      console.error('Erreur lors du glisser-déposer :', error);
    }
  };

  const handleAddWatermark = async () => {
    // On demande le texte à l'utilisateur via une boîte de dialogue native
    const text = window.prompt('Entrez le texte du filigrane (ex: CONFIDENTIEL) :');

    if (!text || text.trim() === '') return; // Si l'utilisateur annule ou ne tape rien

    try {
      const newFile = await addWatermarkToPdf(file, text.trim());
      onFileUpdate(newFile);
    } catch (error) {
      console.error('Erreur lors de l’ajout du filigrane :', error);
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
        scale={scale}
        onPrev={() => goToPage(currentPage - 1)}
        onNext={() => goToPage(currentPage + 1)}
        onZoomIn={() => setScale((currentScale) => currentScale + 0.25)}
        onZoomOut={() => setScale((currentScale) => Math.max(0.5, currentScale - 0.25))}
        onFitWidth={handleFitWidth}
        onMerge={handleMergePdf}
        onDownloadPdf={handleDownloadPdf}
        onAddWatermark={handleAddWatermark}
        onClose={onClose}
        isGridView={isGridView}
        onToggleView={() => setIsGridView((currentView) => !currentView)}
      />

      <div
        className={`flex-1 overflow-y-auto p-8 ${isGridView ? 'grid grid-cols-1 content-start gap-6 sm:grid-cols-2 lg:grid-cols-3' : ''}`}
        ref={containerRef}
      >
        <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <SortableContext items={pageIds} strategy={rectSortingStrategy}>
            {pageIds.map((id) => {
              const pageNumber = parseInt(id.replace('page-', ''), 10);

              return (
                <SortablePageWrapper key={id} id={id}>
                  <PdfPage
                    pdfDocument={pdfDocument}
                    pageNumber={pageNumber}
                    scale={isGridView ? scale / 3 : scale}
                    onDelete={() => handleDeletePage(pageNumber)}
                    onRotate={() => handleRotatePage(pageNumber)}
                    onMoveUp={() => handleMoveUp(pageNumber)}
                    onMoveDown={() => handleMoveDown(pageNumber)}
                    onExtract={() => handleExtractPage(pageNumber)}
                    onInsertBlank={() => handleInsertBlankPage(pageNumber)}
                  />
                </SortablePageWrapper>
              );
            })}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
