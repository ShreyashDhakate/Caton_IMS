import { MedicineInfo } from "../components/Billing";

export const printBill = (
  selectedMedicines: { medicine: MedicineInfo; quantity: number }[],
  customerName: string,
  gender: string,
  age: number,
  billingId: number,
  billingDate: string,
  investigation: string,
  diagnosis: string,
  advice: string,
  hospitalName: string,
  hospitalAddress: string,
  hospitalPhone: string
) => {
  const printWindow = window.open("", "", "height=800,width=1200");
  if (printWindow) {
    const totalCost = selectedMedicines.reduce(
      (total, item) => total + item.medicine.sellingPrice * item.quantity,
      0
    );

    // Fetch additional fields from localStorage
    const doctorName = localStorage.getItem("name") || "N/A";
    const degree = localStorage.getItem("degree") || "N/A";
    const consultationField =
      localStorage.getItem("consultationField") || "N/A";
    const registrationNumber =
      localStorage.getItem("registrationNumber") || "N/A";
    const email = localStorage.getItem("email") || "N/A";
    const mobileNumber = localStorage.getItem("mobileNumber") || "N/A";
    const consultingTiming = localStorage.getItem("consultingTiming") || "N/A";
    const consultingLocation =
      localStorage.getItem("consultingLocation") || "N/A";

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Billing Summary</title>
            <style>
              body {
                background-color: white;
                color: black;
                font-family: sans-serif;
              }
              .header,
              .footer {
                text-align: center;
                padding: 10px;
                border-bottom: 1px solid black;
                margin-bottom: 20px;
              }
              .details,
              .billing,
              .medicines {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                border-bottom: 1px solid black;
                margin-bottom: 20px;
              }
              .details div,
              .billing div {
                width: 48%;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              th,
              td {
                padding: 8px;
                border: 1px solid black;
              }
              th {
                text-align: left;
              }
              td {
                text-align: right;
              }
              td:nth-child(1),
              td:nth-child(3) {
                text-align: center;
              }
              .total {
                text-align: right;
                margin-top: 20px;
              }
              .footer {
                font-size: 12px;
                text-align: center;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${hospitalName}</h1>
              <p>${hospitalAddress}</p>
              <p>Phone: ${hospitalPhone}</p>
            </div>
            <div class="details">
              <div><strong>Dr.</strong> ${doctorName}</div>
              <div>${degree}</div>
              <div>${consultationField}</div>
              <div><strong>Reg.No.</strong> ${registrationNumber}</div>
              <div><strong>Email:</strong> ${email}</div>
              <div><strong>Mo.</strong> ${mobileNumber}</div>
              <div><strong>Consulting Timing:</strong> ${consultingTiming}</div>
              <div>${consultingLocation}</div>
            </div>
            <div class="billing">
              <div><strong>Customer Name:</strong> ${customerName}</div>
              <div><strong>Gender:</strong> ${gender}</div>
              <div><strong>Age:</strong> ${age}</div>
              <div><strong>Billing ID:</strong> ${billingId}</div>
              <div><strong>Billing Date:</strong> ${billingDate}</div>
            </div>
            <div>
              <p><strong>Investigation:</strong> ${investigation}</p>
              <p><strong>Diagnosis:</strong> ${diagnosis}</p>
              <p><strong>Advice:</strong> ${advice}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Price</th>
                  <th>Quantity</th>
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
                    <td>₹${(item.medicine.sellingPrice * item.quantity).toFixed(
                      2
                    )}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            <div class="total">
              <p><strong>Subtotal:</strong> ₹${totalCost.toFixed(2)}</p>
              <p><strong>Discount (10%):</strong> ₹${(totalCost * 0.1).toFixed(
                2
              )}</p>
              <p><strong>Total:</strong> ₹${(totalCost * 0.9).toFixed(2)}</p>
            </div>
            <footer class="footer">
              <p>Thank you for choosing ${hospitalName}!</p>
              <p>Contact us: ${hospitalPhone}</p>
            </footer>
          </body>
        </html>
      `);
    printWindow.document.close();
    printWindow.print();
  }
};
