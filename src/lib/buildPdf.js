import jsPDF from "jspdf";

function wrap(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(text || "-", maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

export function buildFindingPdf(finding) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text("707 PREDATOR HUNTER + DECODER", margin, y);
  y += 16;

  doc.setFontSize(20);
  doc.setTextColor(20);
  doc.text(`@${finding.author_name || finding.id}`, margin, y);
  y += 24;

  doc.setFontSize(11);
  doc.setTextColor(80);
  doc.text(
    `Severity: ${finding.severity || "-"}    Score: ${finding.score ?? "-"}    Status: ${finding.status || "new"}`,
    margin,
    y
  );
  y += 18;
  doc.text(`Detected: ${finding.detected_at || "-"}`, margin, y);
  y += 24;

  if (finding.cartel_attribution) {
    doc.setFontSize(13);
    doc.setTextColor(190, 30, 30);
    doc.text(`Cartel: ${finding.cartel_attribution}`, margin, y);
    y += 18;
    if (finding.cartel_faction) {
      doc.setFontSize(11);
      doc.setTextColor(80);
      doc.text(`Facción: ${finding.cartel_faction}`, margin, y);
      y += 16;
    }
    y += 8;
  }

  doc.setFontSize(12);
  doc.setTextColor(20);
  doc.text("Análisis 707 AI", margin, y);
  y += 14;
  doc.setFontSize(10);
  doc.setTextColor(60);
  y = wrap(doc, finding.reason || "Sin análisis disponible", margin, y, contentWidth, 12);
  y += 10;

  if (finding.indicators && finding.indicators.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(20);
    doc.text("Indicadores", margin, y);
    y += 14;
    doc.setFontSize(10);
    doc.setTextColor(60);
    y = wrap(doc, finding.indicators.join(" · "), margin, y, contentWidth, 12);
    y += 10;
  }

  doc.setFontSize(12);
  doc.setTextColor(20);
  doc.text("Métricas", margin, y);
  y += 14;
  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text(
    `Followers ${finding.author_followers ?? "-"} · Views ${finding.engagement_plays ?? "-"} · Likes ${finding.engagement_likes ?? "-"} · Comments ${finding.engagement_comments ?? "-"}`,
    margin,
    y
  );
  y += 18;

  if (finding.video_description) {
    doc.setFontSize(12);
    doc.setTextColor(20);
    doc.text("Descripción del post", margin, y);
    y += 14;
    doc.setFontSize(10);
    doc.setTextColor(60);
    y = wrap(doc, finding.video_description, margin, y, contentWidth, 12);
    y += 10;
  }

  if (finding.video_url) {
    doc.setFontSize(10);
    doc.setTextColor(40, 80, 200);
    doc.textWithLink("Ver video original", margin, y, { url: finding.video_url });
    y += 18;
  }

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    `Generado ${new Date().toLocaleString("es-MX")} · ID ${finding.id}`,
    margin,
    doc.internal.pageSize.getHeight() - 24
  );

  doc.save(`finding-${finding.id}.pdf`);
}

export function buildReportPdf(findings, rangeLabel) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  doc.setFontSize(18);
  doc.text("Reporte ejecutivo · Predator Hunter", margin, y);
  y += 22;

  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Rango: ${rangeLabel}`, margin, y);
  y += 14;
  doc.text(`Total findings: ${findings.length}`, margin, y);
  y += 18;

  const bySeverity = findings.reduce((acc, f) => {
    const s = f.severity || "UNKNOWN";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const byCartel = findings.reduce((acc, f) => {
    const c = f.cartel_attribution || "—";
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  doc.setFontSize(13);
  doc.setTextColor(20);
  doc.text("Distribución por severidad", margin, y);
  y += 16;
  doc.setFontSize(10);
  doc.setTextColor(60);
  for (const [k, v] of Object.entries(bySeverity)) {
    doc.text(`  ${k}: ${v}`, margin, y);
    y += 12;
  }
  y += 10;

  doc.setFontSize(13);
  doc.setTextColor(20);
  doc.text("Atribución de cartel", margin, y);
  y += 16;
  doc.setFontSize(10);
  doc.setTextColor(60);
  for (const [k, v] of Object.entries(byCartel)) {
    doc.text(`  ${k}: ${v}`, margin, y);
    y += 12;
  }
  y += 14;

  doc.setFontSize(13);
  doc.setTextColor(20);
  doc.text("Top 10 findings por score", margin, y);
  y += 16;

  const top = [...findings].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 10);
  doc.setFontSize(10);
  doc.setTextColor(60);
  for (const f of top) {
    if (y > doc.internal.pageSize.getHeight() - 60) {
      doc.addPage();
      y = margin;
    }
    doc.text(
      `${f.score ?? "-"}  @${f.author_name || f.id}  ${f.severity || "-"}  ${f.cartel_attribution || ""}`,
      margin,
      y
    );
    y += 12;
    y = wrap(
      doc,
      `   ${f.reason || ""}`,
      margin,
      y,
      contentWidth,
      11
    );
    y += 4;
  }

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    `Generado ${new Date().toLocaleString("es-MX")}`,
    margin,
    doc.internal.pageSize.getHeight() - 24
  );

  doc.save(`reporte-${new Date().toISOString().slice(0, 10)}.pdf`);
}
