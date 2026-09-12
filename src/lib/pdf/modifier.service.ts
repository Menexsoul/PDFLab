import { PDFDocument } from 'pdf-lib';

/**
 * Supprime une page d'un fichier PDF et retourne le nouveau fichier.
 * @param originalFile Le fichier PDF source
 * @param pageIndex L'index de la page à supprimer (commence à 0 !)
 */
export async function removePageFromPdf(originalFile: File, pageIndex: number): Promise<File> {
  // 1. Lire le fichier sous forme de buffer binaire
  const arrayBuffer = await originalFile.arrayBuffer();

  // 2. Charger le document dans pdf-lib
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // 3. Supprimer la page ciblée
  pdfDoc.removePage(pageIndex);

  // 4. Sauvegarder les modifications en binaire
  const pdfBytes = await pdfDoc.save();

  // 5. Reconstruire un objet File valide pour le navigateur
  // On utilise le même nom de fichier en ajoutant un suffixe pour le différencier
  const newFileName = originalFile.name.replace('.pdf', '-modifie.pdf');

  return new File([pdfBytes as BlobPart], newFileName, {
    type: 'application/pdf',
  });
}
