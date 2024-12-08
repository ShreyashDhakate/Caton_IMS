import { MedicineInfo } from "@/components/Billing";

export const printBill = (
  selectedMedicines: { medicine: MedicineInfo; quantity: number }[],
  customerName: string,
  billingId: number,
  billingDate: string,
  disease: string,
  precautions: string,
  hospitalName: string,
  hospitalAddress: string,
  hospitalPhone: string
) => {
  const printWindow = window.open('', '', 'height=800,width=1200');
  if (printWindow) {
    const totalCost = selectedMedicines.reduce(
      (total, item) => total + item.medicine.sellingPrice * item.quantity,
      0
    );

    printWindow.document.write(
      `
        <html>
          <head>
            <title>Billing Summary</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #fff; color: #333; }
              .header { background-color: #057A85; color: white; padding: 20px; text-align: center; }
              .header img { max-width: 100px; display: block; margin: 0 auto; }
              .header h1 { margin: 10px 0; font-size: 24px; }
              .invoice-details, .customer-info { padding: 20px; background: #f8f8f8; margin: 20px; border-radius: 8px; }
              .summary table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th { background: #ffc107; color: black; padding: 10px; text-align: left; }
              td { padding: 10px; border: 1px solid #ddd; }
              .total-section { text-align: right; margin-right: 20px; font-size: 18px; font-weight: bold; }
              .footer { text-align: center; margin: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <img src="YOUR_LOGO_URL_HERE" alt="Logo">
              <h1>${hospitalName}</h1>
              <p>${hospitalAddress}</p>
              <p>Phone: ${hospitalPhone}</p>
            </div>
            <div class="customer-info">
              <p><strong>Invoice to:</strong> ${customerName}</p>
              <p><strong>Invoice ID:</strong> ${billingId}</p>
              <p><strong>Date:</strong> ${billingDate}</p>
              <p><strong>Disease:</strong> ${disease}</p>
              <p><strong>Precautions:</strong> ${precautions}</p>
            </div>
            <div class="summary">
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${selectedMedicines
                    .map(
                      (item) => `
                        <tr>
                          <td>${item.medicine.name}</td>
                          <td>₹${item.medicine.sellingPrice.toFixed(2)}</td>
                          <td>${item.quantity}</td>
                          <td>₹${(item.medicine.sellingPrice * item.quantity).toFixed(2)}</td>
                        </tr>`
                    )
                    .join('')}
                </tbody>
              </table>
              <div class="total-section">
                Subtotal: ₹${totalCost.toFixed(2)} <br>
                Tax: ₹${(totalCost * 0.1).toFixed(2)} <br>
                <strong>Total: ₹${(totalCost * 1.1).toFixed(2)}</strong>
              </div>
            </div>
            <div class="footer">
              <p>Thank you for choosing ${hospitalName}!</p>
              <p>Contact us: ${hospitalPhone} | www.${hospitalName.toLowerCase().replace(' ', '')}.com</p>
            </div>
          </body>
        </html>
      `
    );
    printWindow.document.close();
    printWindow.print();
  }
};
