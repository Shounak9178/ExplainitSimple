import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker source for pdf.js. This is crucial for it to work in a modern web environment.
// The original `new URL(...)` approach caused an "Invalid URL" error because `import.meta.url` is not a valid base URL in this context.
// Instead, we construct the full, absolute URL to the worker script on the CDN, using the version from the loaded pdf.js library for robustness.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
    fullText += pageText + '\n\n';
  }

  return fullText;
}