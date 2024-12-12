// import React, { useEffect, useState } from "react";
// import { TextField, Button, IconButton, Typography, Divider } from "@mui/material";
// import { AddCircleOutline, DeleteOutline } from "@mui/icons-material";
// import dayjs from "dayjs";
// import { invoke } from "@tauri-apps/api/core";
// import { useInitializeDatabase } from "../hooks/useInitializeDatabase.ts.ts";
// import { toast } from 'sonner';

// interface Medicine {
//   id: number;
//   name: string;
//   batchNumber: string;
//   expiryDate: string;
//   quantity: number;
//   purchasePrice: number;
//   sellingPrice: number;
// }

// interface WholesalerPurchase {
//   id: number;
//   wholesalerName: string;
//   purchaseDate: string;
//   medicines: Medicine[];
// }

// const StockAdd: React.FC = () => {
//   const [purchases, setPurchases] = useState<WholesalerPurchase[]>([{
//     id: 1,
//     wholesalerName: "",
//     purchaseDate: dayjs().format("YYYY-MM-DD"),
//     medicines: [{
//       id: Date.now(),
//       name: "",
//       batchNumber: "",
//       expiryDate: "",
//       quantity: 0,
//       purchasePrice: 0,
//       sellingPrice: 0,
//     }],
//   }]);

//   const { initializeDatabase } = useInitializeDatabase();

//   useEffect(() => {
//     initializeDatabase();
//   }, [initializeDatabase]);

//   const validateMedicineFields = (medicine: Medicine) => {
//     return (
//       medicine.name.trim() !== "" &&
//       medicine.batchNumber.trim() !== "" &&
//       medicine.expiryDate.trim() !== "" &&
//       medicine.quantity > 0 &&
//       medicine.purchasePrice > 0 &&
//       medicine.sellingPrice > 0
//     );
//   };

//   const handlePurchaseChange = (id: number, field: keyof WholesalerPurchase, value: string) => {
//     setPurchases((prev) =>
//       prev.map((purchase) => (purchase.id === id ? { ...purchase, [field]: value } : purchase))
//     );
//   };

//   const handleMedicineChange = (
//     purchaseId: number,
//     medicineId: number,
//     field: keyof Medicine,
//     value: string | number
//   ) => {
//     setPurchases((prev) =>
//       prev.map((purchase) =>
//         purchase.id === purchaseId
//           ? {
//               ...purchase,
//               medicines: purchase.medicines.map((medicine) =>
//                 medicine.id === medicineId ? { ...medicine, [field]: value } : medicine
//               ),
//             }
//           : purchase
//       )
//     );
//   };

//   const addMedicine = (purchaseId: number) => {
//     setPurchases((prev) =>
//       prev.map((purchase) =>
//         purchase.id === purchaseId
//           ? {
//               ...purchase,
//               medicines: [
//                 ...purchase.medicines,
//                 {
//                   id: Date.now(),
//                   name: "",
//                   batchNumber: "",
//                   expiryDate: "",
//                   quantity: 0,
//                   purchasePrice: 0,
//                   sellingPrice: 0,
//                 },
//               ],
//             }
//           : purchase
//       )
//     );
//   };

//   const removeMedicine = (purchaseId: number, medicineId: number) => {
//     setPurchases((prev) =>
//       prev.map((purchase) =>
//         purchase.id === purchaseId
//           ? { ...purchase, medicines: purchase.medicines.filter((medicine) => medicine.id !== medicineId) }
//           : purchase
//       )
//     );
//   };

//   const handleSubmit = async () => {
//     try {
//       const userId = localStorage.getItem('userId');
//       for (const purchase of purchases) {
//         for (const medicine of purchase.medicines) {
//           if (!validateMedicineFields(medicine)) {
//             toast.error("Please fill in all the compulsory fields for each medicine.");
//             return;
//           }

//           await invoke("insert_medicine", {
//             name: medicine.name,
//             hospitalId:  userId,
//             batchNumber: medicine.batchNumber,
//             expiryDate: medicine.expiryDate,
//             quantity: medicine.quantity,
//             purchasePrice: medicine.purchasePrice,
//             sellingPrice: medicine.sellingPrice,
//             wholesalerName: purchase.wholesalerName,
//             purchaseDate: purchase.purchaseDate,
//           });
//         }
//       }
//       toast.success("Purchase confirmed and medicines added successfully!");
//     } catch (error) {
//       console.error("Error adding medicines:", error);
//       toast.error("Failed to confirm purchase.");
//     }
//   };

//   return (
//     <div className="p-6 mx-auto bg-white shadow-lg rounded-lg">
//       <Typography variant="h4" className="text-center font-bold mb-8">
//         Add New Stock
//       </Typography>

//       {purchases.map((purchase) => (
//         <div key={purchase.id} className="mb-10">
//           <div className="grid grid-cols-2 gap-4 mb-6">
//             <TextField
//               label="Wholesaler Name"
//               value={purchase.wholesalerName}
//               onChange={(e) => handlePurchaseChange(purchase.id, "wholesalerName", e.target.value)}
//               size="small"
//               fullWidth
//             />
//             <TextField
//               label="Purchase Date"
//               type="date"
//               value={purchase.purchaseDate}
//               onChange={(e) => handlePurchaseChange(purchase.id, "purchaseDate", e.target.value)}
//               InputLabelProps={{ shrink: true }}
//               size="small"
//               fullWidth
//             />
//           </div>

//           <Typography variant="h6" className="font-semibold mb-4">
//             Medicines List
//           </Typography>
//           {purchase.medicines.map((medicine) => (
//             <div key={medicine.id} className="grid grid-cols-7 gap-4 mb-4">
//               <TextField
//                 label="Medicine Name"
//                 value={medicine.name}
//                 onChange={(e) => handleMedicineChange(purchase.id, medicine.id, "name", e.target.value)}
//                 size="small"
//               />
//               <TextField
//                 label="Batch Number"
//                 value={medicine.batchNumber}
//                 onChange={(e) => handleMedicineChange(purchase.id, medicine.id, "batchNumber", e.target.value)}
//                 size="small"
//               />
//               <TextField
//                 label="Expiry Date"
//                 type="date"
//                 value={medicine.expiryDate}
//                 onChange={(e) => handleMedicineChange(purchase.id, medicine.id, "expiryDate", e.target.value)}
//                 InputLabelProps={{ shrink: true }}
//                 size="small"
//               />
//               <TextField
//                 label="Quantity"
//                 type="number"
//                 value={medicine.quantity}
//                 onChange={(e) => handleMedicineChange(purchase.id, medicine.id, "quantity", +e.target.value)}
//                 size="small"
//               />
//               <TextField
//                 label="Purchase Price"
//                 type="number"
//                 value={medicine.purchasePrice}
//                 onChange={(e) => handleMedicineChange(purchase.id, medicine.id, "purchasePrice", +e.target.value)}
//                 size="small"
//               />
//               <TextField
//                 label="Selling Price"
//                 type="number"
//                 value={medicine.sellingPrice}
//                 onChange={(e) => handleMedicineChange(purchase.id, medicine.id, "sellingPrice", +e.target.value)}
//                 size="small"
//               />
//               <IconButton onClick={() => removeMedicine(purchase.id, medicine.id)} color="error">
//                 <DeleteOutline />
//               </IconButton>
//             </div>
//           ))}

//           <Button
//             startIcon={<AddCircleOutline />}
//             variant="outlined"
//             size="small"
//             onClick={() => addMedicine(purchase.id)}
//             className="mb-4"
//           >
//             Add Medicine
//           </Button>
//         </div>
//       ))}

//       <Divider className="mb-6" />

//       <Button variant="contained" onClick={handleSubmit} color="primary" fullWidth>
//         Confirm Purchase
//       </Button>
//     </div>
//   );
// };

// export default StockAdd;
import React, { useState } from "react";
import {
  TextField,
  Button,
  IconButton,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { AddCircleOutline, DeleteOutline } from "@mui/icons-material";
import dayjs from "dayjs";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";

interface Medicine {
  id: number;
  name: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
}

interface WholesalerPurchase {
  id: number;
  wholesalerName: string;
  purchaseDate: string;
  medicines: Medicine[];
}
interface BackendMedicine {
  _id?: { $oid: string };
  name: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
}

const StockAdd: React.FC = () => {
  const [purchases, setPurchases] = useState<WholesalerPurchase[]>([
    {
      id: 1,
      wholesalerName: "",
      purchaseDate: dayjs().format("YYYY-MM-DD"),
      medicines: [
        {
          id: Date.now(),
          name: "",
          batchNumber: "",
          expiryDate: "",
          quantity: 0,
          purchasePrice: 0,
          sellingPrice: 0,
        },
      ],
    },
  ]);

  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [activeMedicineId, setActiveMedicineId] = useState<number | null>(null);

  const handleSearchMedicine = async (query: string) => {
    try {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      const userId = localStorage.getItem("userId");
      const results: BackendMedicine[] = await invoke("search_medicines", {
        query,
        hospitalId: userId,
      });

      // Map backend keys (snake_case) to frontend keys (camelCase)
    const mappedResults: Medicine[] = results.map((medicine) => ({
      id: medicine._id?.$oid
        ? parseInt(medicine._id.$oid, 16) // Convert _id.$oid to a number hash
        : Date.now(),
      name: medicine.name,
      batchNumber: medicine.batch_number, // Convert backend to frontend format
      expiryDate: medicine.expiry_date,
      quantity: medicine.quantity,
      purchasePrice: medicine.purchase_price,
      sellingPrice: medicine.selling_price,
    }));

    console.log("Mapped Results:", mappedResults);
    setSearchResults(mappedResults);

      results.forEach((result) => {
        console.log(result.batch_number);
        console.log(result.quantity);
      });

    } catch (error) {
      console.error("Error searching medicines:", error);
      toast.error("Failed to fetch search results.");
    }
  };

  const handleMedicineChange = (
    purchaseId: number,
    medicineId: number,
    field: keyof Medicine,
    value: string | number
  ) => {
    setPurchases((prev) =>
      prev.map((purchase) =>
        purchase.id === purchaseId
          ? {
              ...purchase,
              medicines: purchase.medicines.map((medicine) =>
                medicine.id === medicineId ? { ...medicine, [field]: value } : medicine
              ),
            }
          : purchase
      )
    );

    if (field === "name") {
      setActiveMedicineId(medicineId);
      handleSearchMedicine(value as string);
    }
  };

  const handleSelectMedicine = (
    purchaseId: number,
    medicineId: number,
    selected: Medicine
  ) => {
    setPurchases((prev) =>
      prev.map((purchase) =>
        purchase.id === purchaseId
          ? {
              ...purchase,
              medicines: purchase.medicines.map((medicine) =>
                medicine.id === medicineId
                  ? {
                      ...medicine,
                      name: selected.name,
                      batchNumber: selected.batchNumber || "",
                      expiryDate: selected.expiryDate || "",
                      purchasePrice: selected.purchasePrice || 0,
                      sellingPrice: selected.sellingPrice || 0,
                    }
                  : medicine
              ),
            }
          : purchase
      )
    );

    setActiveMedicineId(null);
    setSearchResults([]);
    toast.success(`Selected medicine: ${selected.name}`);
  };

  const handleSubmit = async () => {
    try {
      const userId = localStorage.getItem("userId");

      for (const purchase of purchases) {
        for (const medicine of purchase.medicines) {
          if (
            !medicine.name.trim() ||
            !medicine.batchNumber.trim() ||
            !medicine.expiryDate.trim() ||
            medicine.quantity <= 0 ||
            medicine.purchasePrice <= 0 ||
            medicine.sellingPrice <= 0
          ) {
            toast.error("Please fill in all fields for each medicine.");
            return;
          }

          // const existingMedicine = searchResults.find(
          //   (result) => result.name.toLowerCase() === medicine.name.toLowerCase()
          // );

          // if (existingMedicine) {
          //   await invoke("add_batch", {
          //     medicineId: existingMedicine.id,
          //     batchNumber: medicine.batchNumber,
          //     expiryDate: medicine.expiryDate,
          //     quantity: medicine.quantity,
          //     purchasePrice: medicine.purchasePrice,
          //     sellingPrice: medicine.sellingPrice,
          //     wholesalerName: purchase.wholesalerName,
          //     purchaseDate: purchase.purchaseDate,
          //     hospitalId: userId,
          //   });
          //   toast.success(`Batch added to existing medicine: ${medicine.name}`);
          // } else {
            await invoke("insert_medicine", {
              name: medicine.name,
              batchNumber: medicine.batchNumber,
              expiryDate: medicine.expiryDate,
              quantity: medicine.quantity,
              purchasePrice: medicine.purchasePrice,
              sellingPrice: medicine.sellingPrice,
              wholesalerName: purchase.wholesalerName,
              purchaseDate: purchase.purchaseDate,
              hospitalId: userId,
            });
            toast.success(`New medicine added: ${medicine.name}`);
          // }
        }
      }
    } catch (error) {
      console.error("Error processing purchases:", error);
      toast.error("Failed to confirm purchase.");
    }
  };

  return (
    <div className="p-6 mx-auto bg-white shadow-lg rounded-lg">
      <Typography variant="h4" className="text-center font-bold mb-8">
        Add New Stock
      </Typography>

      {purchases.map((purchase) => (
        <div key={purchase.id} className="mb-10">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <TextField
              label="Wholesaler Name"
              value={purchase.wholesalerName}
              onChange={(e) =>
                setPurchases((prev) =>
                  prev.map((p) => (p.id === purchase.id ? { ...p, wholesalerName: e.target.value } : p))
                )
              }
              size="small"
              fullWidth
            />
            <TextField
              label="Purchase Date"
              type="date"
              value={purchase.purchaseDate}
              onChange={(e) =>
                setPurchases((prev) =>
                  prev.map((p) => (p.id === purchase.id ? { ...p, purchaseDate: e.target.value } : p))
                )
              }
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />
          </div>

          <Typography variant="h6" className="font-semibold mb-4">
            Medicines List
          </Typography>
          {purchase.medicines.map((medicine) => (
            <div key={medicine.id} className="mb-4">
              <TextField
                label="Medicine Name"
                value={medicine.name}
                onChange={(e) => handleMedicineChange(purchase.id, medicine.id, "name", e.target.value)}
                size="small"
                fullWidth
              />
              {activeMedicineId === medicine.id && searchResults.length > 0 && (
                <List style={{ border: "1px solid #ccc", borderRadius: 4 }}>
                  {searchResults.map((result) => (
                    <ListItem
                      key={result.id}
                      component="div"
                      onClick={() => handleSelectMedicine(purchase.id, medicine.id, result)}
                    >
                      <ListItemText
                        primary={`${result.name} (Qty: ${result.quantity}, Batch: ${result.batchNumber})`}
                        secondary={`Expiry: ${result.expiryDate}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              <div className="grid grid-cols-6 gap-4 mt-4">
                <TextField
                  label="Batch Number"
                  value={medicine.batchNumber}
                  onChange={(e) => handleMedicineChange(purchase.id, medicine.id, "batchNumber", e.target.value)}
                  size="small"
                />
                <TextField
                  label="Expiry Date"
                  type="date"
                  value={medicine.expiryDate}
                  onChange={(e) => handleMedicineChange(purchase.id, medicine.id, "expiryDate", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
                <TextField
                  label="Quantity"
                  type="number"
                  value={medicine.quantity}
                  onChange={(e) => handleMedicineChange(purchase.id, medicine.id, "quantity", +e.target.value)}
                  size="small"
                />
                <TextField
                  label="Purchase Price"
                  type="number"
                  value={medicine.purchasePrice}
                  onChange={(e) => handleMedicineChange(purchase.id, medicine.id, "purchasePrice", +e.target.value)}
                  size="small"
                />
                <TextField
                  label="Selling Price"
                  type="number"
                  value={medicine.sellingPrice}
                  onChange={(e) => handleMedicineChange(purchase.id, medicine.id, "sellingPrice", +e.target.value)}
                  size="small"
                />
                <IconButton
                  onClick={() =>
                    setPurchases((prev) =>
                      prev.map((p) =>
                        p.id === purchase.id
                          ? {
                              ...p,
                              medicines: p.medicines.filter((m) => m.id !== medicine.id),
                            }
                          : p
                      )
                    )
                  }
                  color="error"
                >
                  <DeleteOutline />
                </IconButton>
              </div>
            </div>
          ))}
          <Button
            onClick={() =>
              setPurchases((prev) =>
                prev.map((p) =>
                  p.id === purchase.id
                    ? {
                        ...p,
                        medicines: [
                          ...p.medicines,
                          {
                            id: Date.now(),
                            name: "",
                            batchNumber: "",
                            expiryDate: "",
                            quantity: 0,
                            purchasePrice: 0,
                            sellingPrice: 0,
                          },
                        ],
                      }
                    : p
                )
              )
            }
            startIcon={<AddCircleOutline />}
          >
            Add Medicine
          </Button>
          <Divider className="my-4" />
        </div>
      ))}
      <Button onClick={handleSubmit} variant="contained" color="primary" fullWidth>
        Submit
      </Button>
    </div>
  );
};

export default StockAdd;