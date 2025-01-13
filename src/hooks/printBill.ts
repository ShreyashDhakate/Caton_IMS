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
    const consultationField = localStorage.getItem("consultationField") || "N/A";
    const registrationNumber = localStorage.getItem("registrationNumber") || "N/A";
    const email = localStorage.getItem("email") || "N/A";
    const consultingTiming = localStorage.getItem("consultingTiming") || "N/A";
    

    const medicinesRows = selectedMedicines
      .map(
        (item) => `
        <tr>
          <td>${item.medicine.name}</td>
          <td>₹${item.medicine.sellingPrice.toFixed(2)}</td>
          <td>${item.quantity}</td>
          <td>₹${(item.medicine.sellingPrice * item.quantity).toFixed(2)}</td>
        </tr>`
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Billing Summary</title>
  </head>
  <body>
    <!-- Hospital Information -->
    <h1 align="center">${hospitalName}</h1>
    <div>
      <table border="0" cellspacing="0" cellpadding="5" width="100%">
        <tr>
          <td><strong>Dr.</strong> ${doctorName}</td>
          <td> ${degree}</td>
        </tr>
        <tr>
          <td> ${consultationField}</td>
          <td><strong>Reg. No.:</strong> ${registrationNumber}</td>
        </tr>
        <tr>
          <td><strong>Email:</strong> ${email}</td>
          <td><strong>Phone:</strong> ${hospitalPhone}</td>
        </tr>
        <tr>
          <td><strong>Consulting Timing:</strong> ${consultingTiming}</td>
          <td><strong>Address:</strong> ${hospitalAddress}</td>
        </tr>
      </table>
    </div>

    <hr/>

    <!-- Customer and Billing Details -->
    <div>
      <h4 align="center">Patient Details</h4>
      <table border="0" cellspacing="0" cellpadding="5" width="100%">
        <tr>
          <td><strong>Patient Name:</strong> ${customerName}</td>
          <td><strong>Gender:</strong> ${gender}</td>
        </tr>
        <tr>
          <td><strong>Age:</strong> ${age}</td>
          <td><strong>Billing ID:</strong> ${billingId}</td>
        </tr>
        <tr>
          <td><strong>Billing Date:</strong> ${billingDate}</td>
          <td></td>
        </tr>
      </table>
    </div>
    <hr/>

    <!-- Medical Details -->
    <div>
      <h4 align="center">Medical Details</h4>
      <p><strong>Investigation:</strong> ${investigation}</p>
      <p><strong>Diagnosis:</strong> ${diagnosis}</p>
      <p><strong>Advice:</strong> ${advice}</p>
    </div>

    <!-- Medicines Table -->
    <table border="1" bordercolor="#000000" cellspacing="0" cellpadding="5" width="100%">
      <thead>
        <tr>
          <th align="center" width="50%">Medicine</th>
          <th align="center" width="15%">Price</th>
          <th align="center" width="15%">Quantity</th>
          <th align="center" width="20%">Total</th>
        </tr>
      </thead>
      <tbody>
        ${medicinesRows}
      </tbody>
    </table>

    <!-- Billing Summary -->
    <div>
      <p align="right"><strong>Subtotal:</strong> ₹${totalCost.toFixed(2)}</p>
      <p align="right"><strong>Discount (10%):</strong> ₹${(totalCost * 0.1).toFixed(2)}</p>
      <p align="right"><strong>Total:</strong> ₹${(totalCost * 0.9).toFixed(2)}</p>
    </div>

    <!-- Footer -->
<footer align="center">
  <h2><small>Thank You!</small></h2>
  <p><small>Thank you for choosing ${hospitalName}!</small></p>
  <p><small>Contact us: ${hospitalPhone}</small></p>
</footer>

  </body>
</html>




    `);

    printWindow.document.close();
    printWindow.print();
  }
};
