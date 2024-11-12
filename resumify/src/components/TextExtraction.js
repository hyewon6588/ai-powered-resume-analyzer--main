import { getDocument } from 'pdfjs-dist/legacy/build/pdf'; 
import mammoth from 'mammoth';  

export const extractTextFromPDF = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async function () {
      try {
        const pdfData = new Uint8Array(reader.result);
        const pdf = await getDocument(pdfData).promise;
        let text = '';
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          text += textContent.items.map(item => item.str).join(' ') + '\n';
        }
        resolve(text);  
      } catch (error) {
        reject('Error extracting text from PDF');
      }
    };
    reader.onerror = () => reject('Error reading file');
    reader.readAsArrayBuffer(file);
  });
};

export const extractTextFromDocx = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result;
        const result = await mammoth.extractRawText({ arrayBuffer }); 
        resolve(result.value); 
      } catch (error) {
        reject('Error extracting text from DOCX');
      }
    };
    reader.onerror = () => reject('Error reading file');
    reader.readAsArrayBuffer(file);
  });
};
