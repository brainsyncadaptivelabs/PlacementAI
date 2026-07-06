/**
 * Utility functions for exporting chat messages and reports.
 */

export const exportToMarkdown = (title: string, content: string) => {
  const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
  const fileContent = `# ${title}\n\n${content}`;
  const blob = new Blob([fileContent], { type: "text/markdown;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${cleanTitle}_report.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToDocx = (title: string, content: string) => {
  const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
  
  // Format basic HTML structure that MS Word can open cleanly as a document
  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; padding: 20px; }
        h1 { color: #4f46e5; font-size: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
        h2 { color: #1e1b4b; font-size: 18px; margin-top: 20px; }
        p { font-size: 14px; color: #374151; }
        ul, ol { margin-left: 20px; }
        li { font-size: 14px; margin-bottom: 6px; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div>${content.replace(/\n/g, "<br/>")}</div>
    </body>
    </html>
  `;
  
  const blob = new Blob([htmlContent], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${cleanTitle}_report.doc`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const copyRichText = async (content: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (err) {
    console.error("Failed to copy text", err);
    return false;
  }
};

export const exportToPdf = (title: string, content: string) => {
  // Open a print-friendly window
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  
  printWindow.document.write(`
    <html>
      <head>
        <title>${title} - PlacementAI Report</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            line-height: 1.6;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            border-bottom: 2px solid #6366f1;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title {
            font-size: 28px;
            font-weight: 800;
            color: #1e1b4b;
            margin: 0;
          }
          .date {
            font-size: 12px;
            color: #64748b;
            margin-top: 5px;
          }
          .content {
            font-size: 15px;
            white-space: pre-wrap;
          }
          h1, h2, h3 {
            color: #1e1b4b;
            font-weight: 700;
          }
          @media print {
            body { padding: 20px; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${title}</div>
          <div class="date">Generated via PlacementAI on ${new Date().toLocaleDateString()}</div>
        </div>
        <div class="content">${content}</div>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

export const exportToCsv = (filename: string, headers: string[], rows: any[][]) => {
  const cleanFilename = filename.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","),
    ...rows.map(row => row.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${cleanFilename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToExcel = (filename: string, title: string, headers: string[], rows: any[][]) => {
  const cleanFilename = filename.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
  
  // Format basic HTML table that Microsoft Excel opens and parses natively with correct column formats
  const tableRows = rows.map(row => `<tr>${row.map(val => `<td>${val}</td>`).join("")}</tr>`).join("");
  const tableHeaders = `<tr>${headers.map(h => `<th style="background-color: #4f46e5; color: #ffffff; font-weight: bold;">${h}</th>`).join("")}</tr>`;
  
  const excelHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
      <style>
        table { border-collapse: collapse; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; font-family: sans-serif; font-size: 12px; }
        h2 { font-family: sans-serif; color: #1e1b4b; }
      </style>
    </head>
    <body>
      <h2>${title}</h2>
      <table>
        <thead>${tableHeaders}</thead>
        <tbody>${tableRows}</tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([excelHtml], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${cleanFilename}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
