export async function exportInvoicePdf(element: HTMLElement, filename: string) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    scrollX: 0,
    scrollY: 0,
    windowWidth: 794,
    windowHeight: 1122,
    x: 0,
    y: 0,
    width: element.offsetWidth || 794,
    height: element.offsetHeight || 1122,
    onclone: (clonedDocument) => {
      const clonedElement = clonedDocument.getElementById(element.id);
      if (!clonedElement) return;
      const container = clonedElement.parentElement;
      if (container) {
        container.style.position = "absolute";
        container.style.left = "0";
        container.style.top = "0";
        container.style.display = "block";
        container.style.visibility = "visible";
        container.style.pointerEvents = "none";
      }
      clonedElement.style.position = "static";
      clonedElement.style.left = "auto";
      clonedElement.style.top = "auto";
      clonedElement.style.display = "flex";
      clonedElement.style.visibility = "visible";
      clonedElement.style.transform = "none";
    },
  });

  if (!canvas.width || !canvas.height) {
    throw new Error("ไม่สามารถสร้างภาพเอกสาร Invoice ได้");
  }

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  pdf.addImage(canvas.toDataURL("image/jpeg", 0.98), "JPEG", 0, 0, 210, 297);
  pdf.save(filename);
}
