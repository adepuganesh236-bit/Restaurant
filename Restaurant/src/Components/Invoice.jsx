import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Invoice({ orders }) {
  const downloadInvoice = () => {
    const doc = jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    doc.setFontSize(20);
    doc.setFont(undefined, "bold");
    doc.text("Restaurant Management System", pageWidth / 2, y, { align: "center" });
    y += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    doc.text("Customer Invoice", pageWidth / 2, y, { align: "center" });
    y += 5;

    const date = new Date().toLocaleDateString("en-IN");
    doc.setFontSize(10);
    doc.text(`Date: ${date}`, 14, y);
    y += 10;

    doc.setDrawColor(0);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;

    let grandTotal = 0;

    orders.forEach((order, index) => {
      if (y > 260) {
        doc.addPage();
        y = 15;
      }

      doc.setFontSize(13);
      doc.setFont(undefined, "bold");
      doc.text(`Order #${index + 1}  (ID: ${order.id})`, 14, y);
      y += 6;

      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.text(`Status: ${order.status}`, 14, y);
      doc.text(`Payment: ${order.payment_status || "Pending"}`, 90, y);
      doc.text(`Method: ${order.payment_method || "-"}`, 155, y);
      y += 7;

      autoTable(doc, {
        startY: y,
        head: [["Food Item", "Quantity", "Unit Price", "Total"]],
        body: [
          [
            order.food_name || String(order.food),
            String(order.quantity),
            `Rs. ${(Number(order.total_price) / (order.quantity || 1)).toFixed(2)}`,
            `Rs. ${order.total_price}`,
          ],
        ],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [40, 167, 69] },
        margin: { left: 14, right: 14 },
      });

      y = doc.lastAutoTable.finalY + 5;

      const orderTotal = Number(order.total_price);
      grandTotal += orderTotal;
      y += 10;
    });

    if (y > 250) {
      doc.addPage();
      y = 15;
    }

    doc.setDrawColor(0);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;

    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text(`Grand Total: Rs. ${grandTotal.toFixed(2)}`, pageWidth - 14, y, { align: "right" });
    y += 12;

    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    doc.text("Thank you for ordering with us!", pageWidth / 2, y, { align: "center" });

    doc.save("Restaurant_Invoice.pdf");
  };

  return (
    <div className="mb-3">
      <button className="btn btn-success" onClick={downloadInvoice}>
        Download Invoice
      </button>
    </div>
  );
}

export default Invoice;
