declare module 'html2pdf.js' {
  function html2pdf(): html2pdfInstance;
  
  interface html2pdfInstance {
    from(element: HTMLElement): html2pdfInstance;
    set(options: any): html2pdfInstance;
    save(): Promise<void>;
  }
  
  export = html2pdf;
}