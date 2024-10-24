import { MedicineInfo } from "@/components/Billing";

// Function to print the bill
export const printBill = (
  selectedMedicines: { medicine: MedicineInfo; quantity: number }[],
  customerName: string,
  billingId: number
) => {
  const printWindow = window.open('', '', 'height=600,width=800');
  if (printWindow) {
    // Calculate total cost
    const totalCost = selectedMedicines.reduce((total, item) =>
      total + item.medicine.selling_price * item.quantity, 0);

    printWindow.document.write(`
      <html>
        <head>
          <title>Billing Summary</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .header h2 {
              margin: 0;
              font-size: 24px;
              color: #057A85; /* Primary color */
            }
            .header p {
              margin: 5px 0;
            }
            .header img {
              max-width: 150px;
              margin-bottom: 10px;
            }
            .address {
              text-align: center;
              font-size: 14px;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              background-color: #ffffff;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            table, th, td {
              border: 1px solid #ccc;
            }
            th, td {
              padding: 10px;
              text-align: left;
            }
            th {
              background-color: #057A85; /* Primary color */
              color: white;
              border-bottom: 2px solid #057A85; /* Horizontal line at top of headers */
            }
            .total {
              font-weight: bold;
              text-align: right;
              margin-top: 10px;
            }
            footer {
              margin-top: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            .customer-info {
              margin-bottom: 20px;
              border: 1px solid #ccc;
              padding: 10px;
            }
            .customer-info table {
              width: 100%;
            }
            .customer-info th {
              border-bottom: 2px solid #057A85; /* Horizontal line */
              text-align: left;
            }
            .customer-info td {
              padding: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="logo.jpg" alt="Pharmacy Logo" /> <!-- Add your logo image here -->
            <h2>ABC Pharmacy and Hospital</h2>
            <p class="address">
              1234 Health St.<br>
              Cityville, ST 12345<br>
              Phone: (123) 456-7890<br>
              Email: info@abcpharmacy.com
            </p>
          </div>

          <!-- Customer Info Section -->
          <div class="customer-info">
            <table>
              <tr>
                <th>Customer Name:</th>
                <td>${customerName}</td>
              </tr>
              <tr>
                <th>Billing ID:</th>
                <td>${billingId}</td>
              </tr>
            </table>
          </div>

          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${selectedMedicines.map(item => `
                <tr>
                  <td>${item.medicine.name}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.medicine.selling_price.toFixed(2)}</td>
                  <td>$${(item.medicine.selling_price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">Total Cost: $${totalCost.toFixed(2)}</div>
          <footer>
            Thank you for choosing ABC Pharmacy and Hospital!<br />
            Please retain this receipt for your records.
          </footer>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
};
