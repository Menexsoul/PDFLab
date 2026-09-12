interface ToolbarProps {
  currentPage: number;
  numPages: number;
  scale: number;
  onNext: () => void;
  onPrev: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitWidth: () => void;
  onMerge: (file: File) => void;
  onDownloadPdf: () => void;
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
  onMerge,
  onDownloadPdf,
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
        {/* Bouton d'ajout de PDF */}
        <label className="mr-4 cursor-pointer rounded bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700">
          + Ajouter un PDF
          <input
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onMerge(e.target.files[0]);
                // On réinitialise la valeur pour pouvoir rajouter le même fichier si besoin
                e.target.value = '';
              }
            }}
          />
        </label>
        {/* Nouveau bouton de sauvegarde du PDF complet */}
        <button
          onClick={onDownloadPdf}
          className="mr-4 rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-colors hover:bg-indigo-700"
        >
          Sauvegarder le PDF
        </button>
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
