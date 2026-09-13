import { PDFDocument, degrees } from 'pdf-lib';

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

export async function mergePdfs(baseFile: File, fileToAppend: File): Promise<File> {
  const baseBuffer = await baseFile.arrayBuffer();
  const appendBuffer = await fileToAppend.arrayBuffer();

  // On charge les deux documents
  const baseDoc = await PDFDocument.load(baseBuffer);
  const appendDoc = await PDFDocument.load(appendBuffer);

  // On copie toutes les pages du second document
  // getPageIndices() renvoie un tableau [0, 1, 2, ...] avec tous les index
  const copiedPages = await baseDoc.copyPages(appendDoc, appendDoc.getPageIndices());

  // On les ajoute une par une à la fin du document de base
  copiedPages.forEach((page) => {
    baseDoc.addPage(page);
  });

  const pdfBytes = await baseDoc.save();
  const newFileName = baseFile.name.replace('.pdf', '-fusionne.pdf');

  return new File([pdfBytes as BlobPart], newFileName, {
    type: 'application/pdf',
  });
}

export async function rotatePageInPdf(originalFile: File, pageIndex: number): Promise<File> {
  const arrayBuffer = await originalFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // Récupérer la page spécifique
  const page = pdfDoc.getPage(pageIndex);

  // Lire la rotation actuelle et ajouter 90 degrés
  const currentRotation = page.getRotation().angle;
  page.setRotation(degrees(currentRotation + 90));

  const pdfBytes = await pdfDoc.save();
  // Pas besoin de changer le nom à chaque fois ici, on garde l'original
  return new File([pdfBytes as BlobPart], originalFile.name, {
    type: 'application/pdf',
  });
}

export async function movePageInPdf(
  originalFile: File,
  fromIndex: number,
  toIndex: number,
): Promise<File> {
  const arrayBuffer = await originalFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // 1. On copie la page qu'on veut déplacer
  const [copiedPage] = await pdfDoc.copyPages(pdfDoc, [fromIndex]);

  // 2. On supprime l'originale
  pdfDoc.removePage(fromIndex);

  // 3. On l'insère à sa nouvelle place
  pdfDoc.insertPage(toIndex, copiedPage);

  const pdfBytes = await pdfDoc.save();
  return new File([pdfBytes as BlobPart], originalFile.name, {
    type: 'application/pdf',
  });
}

export async function extractPageAsPdf(originalFile: File, pageIndex: number): Promise<File> {
  const arrayBuffer = await originalFile.arrayBuffer();
  const sourceDoc = await PDFDocument.load(arrayBuffer);

  // 1. On crée un document PDF totalement vide
  const newPdfDoc = await PDFDocument.create();

  // 2. On copie la page voulue depuis le document source
  const [copiedPage] = await newPdfDoc.copyPages(sourceDoc, [pageIndex]);

  // 3. On l'ajoute au nouveau document
  newPdfDoc.addPage(copiedPage);

  const pdfBytes = await newPdfDoc.save();

  // 4. On crée un nom de fichier clair (ex: mon-document-page-2.pdf)
  const baseName = originalFile.name.replace(/\.[^/.]+$/, ''); // Retire l'extension .pdf
  const newFileName = `${baseName}-page-${pageIndex + 1}.pdf`;

  return new File([pdfBytes as BlobPart], newFileName, {
    type: 'application/pdf',
  });
}

export async function insertBlankPageAfter(originalFile: File, pageIndex: number): Promise<File> {
  const arrayBuffer = await originalFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // 1. Récupérer la page actuelle pour connaître sa taille
  const referencePage = pdfDoc.getPage(pageIndex);
  const { width, height } = referencePage.getSize();

  // 2. Insérer une nouvelle page à l'index suivant (pageIndex + 1)
  // On lui passe un tableau [largeur, hauteur] pour imiter la page précédente
  pdfDoc.insertPage(pageIndex + 1, [width, height]);

  const pdfBytes = await pdfDoc.save();

  return new File([pdfBytes as BlobPart], originalFile.name, {
    type: 'application/pdf',
  });
}
