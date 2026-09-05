import type { jsPDF } from "jspdf";

/** PDF’i yeni sekmede açıp yazdırma diyaloğunu gösterir. */
export function pdfYazdir(doc: jsPDF) {
  doc.autoPrint();
  const url = doc.output("bloburl");
  const pencere = window.open(url);
  if (!pencere) return;
  pencere.onload = () => {
    pencere.focus();
    pencere.print();
  };
}
