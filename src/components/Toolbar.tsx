interface ToolbarProps {
  currentPage: number;
  numPages: number;
  scale: number;
  onNext: () => void;
  onPrev: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitWidth: () => void;
}

export function Toolbar({
  currentPage,
  numPages,
  scale,
  onNext,
  onPrev,
  onZoomIn,
  onZoomOut,
  onFitWidth,
}: ToolbarProps) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-3 shadow-md w-full">
      <div className="flex gap-2">
        {/* Bouton Précédent (désactivé si on est à la page 1) */}
        <button
          onClick={onPrev}
          disabled={currentPage <= 1}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:bg-gray-300 transition-colors"
        >
          Précédent
        </button>

        {/* Bouton Suivant (désactivé si on est à la dernière page) */}
        <button
          onClick={onNext}
          disabled={currentPage >= numPages}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:bg-gray-300 transition-colors"
        >
          Suivant
        </button>
      </div>

      <div className="font-medium text-gray-700">
        Page {currentPage} sur {numPages}
      </div>

      <div className="flex w-24 items-center justify-end gap-2">
        <button
          onClick={onZoomOut}
          aria-label="Réduire le zoom"
          className="rounded bg-gray-200 px-3 py-1 font-bold text-gray-700 transition-colors hover:bg-gray-300"
        >
          -
        </button>
        <span>{Math.round(scale * 100)}%</span>
        <button
          onClick={onFitWidth}
          aria-label="Ajuster à la largeur"
          className="rounded bg-gray-200 px-2 py-1 font-bold text-gray-700 transition-colors hover:bg-gray-300"
        >
          [↔]
        </button>
        <button
          onClick={onZoomIn}
          aria-label="Augmenter le zoom"
          className="rounded bg-gray-200 px-3 py-1 font-bold text-gray-700 transition-colors hover:bg-gray-300"
        >
          +
        </button>
      </div>
    </div>
  );
}
