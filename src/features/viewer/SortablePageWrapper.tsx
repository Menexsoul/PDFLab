import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';

interface SortablePageWrapperProps {
  id: string;
  children: ReactNode;
}

export function SortablePageWrapper({ id, children }: SortablePageWrapperProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
  transform: CSS.Translate.toString(transform),
  transition,
  zIndex: isDragging ? 50 : 1,
  opacity: isDragging ? 0.8 : 1,
};

  return (
    <div ref={setNodeRef} style={style} className="relative mb-6 mx-auto w-fit">
      {/* Poignée de déplacement (Grip) à gauche de la page */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-12 top-1/2 -translate-y-1/2 cursor-grab rounded-md bg-white p-2 shadow-md hover:bg-gray-50 active:cursor-grabbing"
        title="Glisser pour déplacer"
      >
        {/* Icône de "poignée" avec 6 petits points */}
        <svg className="h-6 w-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
        </svg>
      </div>

      {/* Le composant PdfPage viendra s'insérer ici */}
      {children}
    </div>
  );
}
