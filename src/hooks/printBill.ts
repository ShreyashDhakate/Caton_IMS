import { MedicineInfo } from "@/components/Billing";

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
    const doctorName = localStorage.getItem("doctorName") || "N/A";
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

    printWindow.document.write(
      `
        <html>
          <head>
            <title>Billing Summary</title>
          </head>
          <body class="bg-white text-black font-sans">
            <div style="text-align: center; padding: 10px; border-bottom: 1px solid black; margin-bottom: 20px;">
              <h1 style="font-size: 24px; font-weight: bold;">${hospitalName}</h1>
              <p>${hospitalAddress}</p>
              <p>Phone: ${hospitalPhone}</p>
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid black; margin-bottom: 20px;">
  <div style="width: 48%;"><strong>Dr.</strong> ${doctorName}</div>
  <div style="width: 48%;">${degree}</div>
  <div style="width: 48%;">${consultationField}</div>
  <div style="width: 48%;"><strong>Reg.No.</strong> ${registrationNumber}</div>
  <div style="width: 48%;"><strong>Email:</strong> ${email}</div>
  <div style="width: 48%;"><strong>Mo.</strong> ${mobileNumber}</div>
  <div style="width: 48%;"><strong>Consulting Timing:</strong> ${consultingTiming}</div>
  <div style="width: 48%;">${consultingLocation}</div>
</div>

            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
  <div style="width: 48%;"><strong>Customer Name:</strong> ${customerName}</div>
  <div style="width: 48%;"><strong>Gender:</strong> ${gender}</div>
  <div style="width: 48%;"><strong>Age:</strong> ${age}</div>
  <div style="width: 48%;"><strong>Billing ID:</strong> ${billingId}</div>
  <div style="width: 48%;"><strong>Billing Date:</strong> ${billingDate}</div>
</div>


            <div style="margin-bottom: 20px;">
              <p><strong>Investigation:</strong> ${investigation}</p>
              <p><strong>Diagnosis:</strong> ${diagnosis}</p>
              <p><strong>Advice:</strong> ${advice}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="border-bottom: 1px solid black;">
                  <th style="text-align: left; padding: 8px; border: 1px solid black;">Medicine</th>
                  <th style="text-align: right; padding: 8px; border: 1px solid black;">Price</th>
                  <th style="text-align: center; padding: 8px; border: 1px solid black;">Quantity</th>
                  <th style="text-align: right; padding: 8px; border: 1px solid black;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${selectedMedicines
                  .map(
                    (item) => `
                    <tr>
                      <td style="padding: 8px; border: 1px solid black;">${
                        item.medicine.name
                      }</td>
                      <td style="text-align: right; padding: 8px; border: 1px solid black;">₹${item.medicine.sellingPrice.toFixed(
                        2
                      )}</td>
                      <td style="text-align: center; padding: 8px; border: 1px solid black;">${
                        item.quantity
                      }</td>
                      <td style="text-align: right; padding: 8px; border: 1px solid black;">₹${(
                        item.medicine.sellingPrice * item.quantity
                      ).toFixed(2)}</td>
                    </tr>`
                  )
                  .join("")}
              </tbody>
            </table>

            <div style="text-align: right; margin-top: 20px;">
              <p><strong>Subtotal:</strong> ₹${totalCost.toFixed(2)}</p>
              <p><strong>Discount (10%):</strong> ₹${(totalCost * 0.1).toFixed(
                2
              )}</p>
              <p><strong>Total:</strong> ₹${(totalCost * 0.9).toFixed(2)}</p>
            </div>

            <footer style="text-align: center; margin-top: 20px; font-size: 12px;">
              <p>Thank you for choosing ${hospitalName}!</p>
              <p>Contact us: ${hospitalPhone}</p>
            </footer>
          </body>
        </html>
      `
    );
    printWindow.document.close();
    printWindow.print();
  }
};
