import html2pdf from 'html2pdf.js';
import { Note } from '@/types';

interface PDFExportOptions {
  margin?: number;
  filename?: string;
  pagebreak?: { mode: string };
  image?: { type: string; quality: number };
  enableLinks?: boolean;
}

/**
 * Exports the given note content as a PDF file
 * @param note The note to export
 * @param options Custom options for PDF export
 */
export const exportNoteToPDF = (
  note: Note, 
  options?: PDFExportOptions
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a temporary container for exporting
      const container = document.createElement('div');
      
      // Set the container style to ensure proper formatting
      container.style.padding = '20px';
      container.style.fontFamily = 'Arial, sans-serif';
      
      // Add title
      const titleElement = document.createElement('h1');
      titleElement.textContent = note.title;
      titleElement.style.fontSize = '24px';
      titleElement.style.marginBottom = '16px';
      titleElement.style.borderBottom = '1px solid #ddd';
      titleElement.style.paddingBottom = '8px';
      container.appendChild(titleElement);
      
      // Add creation date
      const dateElement = document.createElement('p');
      const createdDate = note.createdAt.toDate();
      dateElement.textContent = `Created: ${createdDate.toLocaleDateString()}`;
      dateElement.style.fontSize = '12px';
      dateElement.style.color = '#666';
      dateElement.style.marginBottom = '16px';
      container.appendChild(dateElement);
      
      // Add tags if present
      if (note.tags && note.tags.length > 0) {
        const tagsContainer = document.createElement('div');
        tagsContainer.style.display = 'flex';
        tagsContainer.style.flexWrap = 'wrap';
        tagsContainer.style.gap = '4px';
        tagsContainer.style.marginBottom = '16px';
        
        note.tags.forEach(tag => {
          const tagElement = document.createElement('span');
          tagElement.textContent = tag.name;
          tagElement.style.backgroundColor = tag.color || '#e0e0e0';
          tagElement.style.color = '#fff';
          tagElement.style.padding = '4px 8px';
          tagElement.style.borderRadius = '4px';
          tagElement.style.fontSize = '12px';
          tagsContainer.appendChild(tagElement);
        });
        
        container.appendChild(tagsContainer);
      }
      
      // Add a divider
      const divider = document.createElement('hr');
      divider.style.margin = '16px 0';
      divider.style.border = 'none';
      divider.style.borderTop = '1px solid #eee';
      container.appendChild(divider);
      
      // Add content
      const contentElement = document.createElement('div');
      contentElement.innerHTML = note.content;
      container.appendChild(contentElement);
      
      // Append container to body temporarily (but hide it)
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      document.body.appendChild(container);
      
      // Default PDF export options
      const defaultOptions = {
        margin: 10,
        filename: `${note.title}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'css' },
        enableLinks: true,
        ...options
      };
      
      // Generate PDF
      html2pdf()
        .from(container)
        .set(defaultOptions)
        .save()
        .then(() => {
          // Clean up - remove the temporary container
          document.body.removeChild(container);
          resolve();
        })
        .catch((error: Error) => {
          // Clean up even if there's an error
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
          reject(error);
        });
        
    } catch (error: unknown) {
      reject(error instanceof Error ? error : new Error('An unknown error occurred'));
    }
  });
};