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
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body class="bg-white text-gray-900 font-sans">
            <div class="bg-teal-600 text-white p-6 text-center">
              <h1 class="text-3xl font-bold">${hospitalName}</h1>
              <p class="text-lg">${hospitalAddress}</p>
              <p class="text-lg">Phone: ${hospitalPhone}</p>
            </div>
            <div class="p-6">
              <div class="bg-gray-100 rounded-lg p-4 mb-6">
                <p><span class="font-semibold">Customer Name:</span> ${customerName}</p>
                <p><span class="font-semibold">Gender:</span> ${gender}</p>
                <p><span class="font-semibold">Age:</span> ${age}</p>
                <p><span class="font-semibold">Billing ID:</span> ${billingId}</p>
                <p><span class="font-semibold">Billing Date:</span> ${billingDate}</p>
              </div>
              <div class="bg-gray-100 rounded-lg p-4 mb-6">
                <p><span class="font-semibold">Investigation:</span> ${investigation}</p>
                <p><span class="font-semibold">Diagnosis:</span> ${diagnosis}</p>
                <p><span class="font-semibold">Advice:</span> ${advice}</p>
              </div>
              <div class="overflow-x-auto">
                <table class="min-w-full bg-white border border-gray-300 rounded-lg">
                  <thead>
                    <tr class="bg-teal-500 text-white">
                      <th class="px-4 py-2 text-left">Medicine</th>
                      <th class="px-4 py-2 text-right">Price</th>
                      <th class="px-4 py-2 text-center">Quantity</th>
                      <th class="px-4 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${selectedMedicines
                      .map(
                        (item) => `
                        <tr>
                          <td class="px-4 py-2 border-t">${item.medicine.name}</td>
                          <td class="px-4 py-2 text-right border-t">₹${item.medicine.sellingPrice.toFixed(2)}</td>
                          <td class="px-4 py-2 text-center border-t">${item.quantity}</td>
                          <td class="px-4 py-2 text-right border-t">₹${(item.medicine.sellingPrice * item.quantity).toFixed(2)}</td>
                        </tr>`
                      )
                      .join('')}
                  </tbody>
                </table>
              </div>
              <div class="text-right mt-4">
                <p class="text-lg"><span class="font-semibold">Subtotal:</span> ₹${totalCost.toFixed(2)}</p>
                <p class="text-lg"><span class="font-semibold">Tax (10%):</span> ₹${(totalCost * 0.1).toFixed(2)}</p>
                <p class="text-2xl font-bold"><span class="font-semibold">Total:</span> ₹${(totalCost * 1.1).toFixed(2)}</p>
              </div>
            </div>
            <footer class="text-center text-sm text-gray-600 mt-6">
              <p>Thank you for choosing ${hospitalName}!</p>
              <p>Contact us: ${hospitalPhone} | www.${hospitalName.toLowerCase().replace(' ', '')}.com</p>
            </footer>
          </body>
        </html>
      `
    );
    printWindow.document.close();
    printWindow.print();
  }
};
