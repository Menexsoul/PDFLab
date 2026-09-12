interface ToolbarProps {
  currentPage: number;
  numPages: number;
  onNext: () => void;
  onPrev: () => void;
}

export function Toolbar({ currentPage, numPages, onNext, onPrev }: ToolbarProps) {
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

      {/* On garde un espace vide à droite pour les futurs boutons (ex: Zoom) */}
      <div className="w-24"></div>
    </div>
  );
}
