export async function exportDocumentPdf(element: HTMLElement, filename: string) {
  if (!element) {
    throw new Error("Element not found for PDF export");
  }

  // Use dynamic import for html2pdf.js on client side
  const html2pdfModule = await import("html2pdf.js");
  const html2pdf = html2pdfModule.default || html2pdfModule;

  const opt = {
    margin: [0, 0, 0, 0] as [number, number, number, number],
    filename: filename.endsWith(".pdf") ? filename : `${filename}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 794,
      windowHeight: 1122,
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
  };

  return (html2pdf as unknown as () => { set: (o: typeof opt) => { from: (el: HTMLElement) => { save: () => Promise<void> } } })()
    .set(opt)
    .from(element)
    .save();
}
