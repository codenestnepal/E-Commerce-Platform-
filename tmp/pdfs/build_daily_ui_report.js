const fs = require("fs");
const PDFDocument = require("pdfkit");

const output = "output/pdf/daily-ui-enhancement-report.pdf";
const document = new PDFDocument({ size: "A4", margin: 52, info: { Title: "Daily Work Report - UI Enhancement" } });
document.pipe(fs.createWriteStream(output));

const ink = "#1f2937";
const muted = "#64748b";
const accent = "#e85d45";
const light = "#f8fafc";
const pageWidth = document.page.width - 104;

document.rect(0, 0, document.page.width, 94).fill("#202124");
document.fillColor("#ffffff").font("Helvetica-Bold").fontSize(18).text("CodeNest Nepal Pvt. Ltd.", 52, 28);
document.fillColor("#d1d5db").font("Helvetica").fontSize(9).text("Nepal, Madesh Pradesh, Siraha, Mirchaiya  |  +977 9716102126", 52, 55);

document.fillColor(ink).font("Helvetica-Bold").fontSize(22).text("Daily Work Report", 52, 122);
document.fillColor(accent).font("Helvetica-Bold").fontSize(10).text("Subject: Daily Work Report - E-Commerce UI Enhancement", 52, 154);
document.moveTo(52, 174).lineTo(52 + pageWidth, 174).strokeColor("#e5e7eb").stroke();

document.fillColor(muted).font("Helvetica").fontSize(9);
document.text("Prepared by: UI Development Intern", 52, 190);
document.text("Date: 13 September 2026", 360, 190, { align: "right", width: 184 });

function section(title, items, y) {
  document.roundedRect(52, y, pageWidth, 25, 4).fill(light);
  document.fillColor(ink).font("Helvetica-Bold").fontSize(11).text(title, 64, y + 7);
  let cursor = y + 38;
  document.font("Helvetica").fontSize(10).fillColor("#374151");
  items.forEach((item) => {
    document.fillColor(accent).circle(67, cursor + 5, 2.4).fill();
    document.fillColor("#374151").text(item, 78, cursor, { width: pageWidth - 38, lineGap: 3 });
    cursor = document.y + 8;
  });
  return cursor + 5;
}

let y = 225;
y = section("Tasks Completed", [
  "Refreshed homepage product cards with real imagery, ratings, pricing, and sale badges.",
  "Added wishlist controls, add-to-cart feedback, and persistent cart and wishlist counters.",
  "Redesigned category cards with visual imagery and direct category links.",
  "Implemented compact mobile navigation and refined responsive layouts.",
  "Updated the shop catalog with reliable product images and purchase controls."
], y);

y = section("Tasks Currently in Progress", [
  "Reviewing storefront behavior across screen sizes and preparing product and checkout improvements."
], y);

y = section("Challenges or Blockers", [
  "Original local product images were unavailable. Reliable image sources now keep cards rendering correctly."
], y);

y = section("Plan for the Next Working Day", [
  "Connect product, cart, and wishlist interactions to the backend data model.",
  "Add product filtering and usable search results to the shop.",
  "Complete a mobile visual review and refine cart empty states."
], y);

document.fillColor(muted).font("Helvetica-Oblique").fontSize(9).text("Submitted in accordance with the Daily Work Report policy.", 52, 754, { width: pageWidth, align: "center" });
document.end();
