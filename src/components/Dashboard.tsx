// // src/components/Dashboard.tsx
// import React, { useState } from 'react';
// import { Button, Typography, Box, CircularProgress } from '@mui/material';
// import PatientPopup from './PatientPopup';
// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "./ui/table"



// const Dashboard: React.FC = () => {
//   const [selectedPatient, setSelectedPatient] = useState<any>(null);
//   const [loading, setLoading] = useState(false);
  
//   // Sample patient data
//   const patients = [
//     { id: 1, name: 'John Doe', age: 30, gender: 'Male', disease: 'Flu' },
//     { id: 2, name: 'Jane Smith', age: 25, gender: 'Female', disease: 'Migraine' },
//     { id: 3, name: 'Michael Brown', age: 45, gender: 'Male', disease: 'Diabetes' },
//     { id: 4, name: 'Emily Davis', age: 22, gender: 'Female', disease: 'Asthma' },
//     { id: 5, name: 'William Johnson', age: 40, gender: 'Male', disease: 'Hypertension' },
//     { id: 6, name: 'Emma Wilson', age: 33, gender: 'Female', disease: 'Arthritis' },
//     { id: 7, name: 'James Miller', age: 50, gender: 'Male', disease: 'Heart Disease' },
//     { id: 8, name: 'Olivia Taylor', age: 28, gender: 'Female', disease: 'Allergy' },
//     { id: 9, name: 'Benjamin Anderson', age: 35, gender: 'Male', disease: 'Back Pain' },
//     { id: 10, name: 'Sophia Thomas', age: 26, gender: 'Female', disease: 'Thyroid' },
//     { id: 11, name: 'Henry White', age: 38, gender: 'Male', disease: 'Cholesterol' },
//     { id: 12, name: 'Isabella Harris', age: 29, gender: 'Female', disease: 'Bronchitis' },
//     { id: 13, name: 'Ethan Martinez', age: 42, gender: 'Male', disease: 'Obesity' },
//     { id: 14, name: 'Mia Clark', age: 24, gender: 'Female', disease: 'Anemia' },
//     { id: 15, name: 'Alexander Lewis', age: 34, gender: 'Male', disease: 'Kidney Stones' },
//     { id: 16, name: 'Ava Walker', age: 31, gender: 'Female', disease: 'Pneumonia' },
//     { id: 17, name: 'Daniel Hall', age: 47, gender: 'Male', disease: 'Liver Disease' },
//     { id: 18, name: 'Charlotte Allen', age: 27, gender: 'Female', disease: 'Sinusitis' },
//     { id: 19, name: 'Matthew Young', age: 37, gender: 'Male', disease: 'Gout' },
//     { id: 20, name: 'Amelia King', age: 30, gender: 'Female', disease: 'Ulcer' },
//     { id: 21, name: 'Christopher Scott', age: 36, gender: 'Male', disease: 'Asthma' },
//     { id: 22, name: 'Harper Green', age: 29, gender: 'Female', disease: 'Eczema' },
//     { id: 23, name: 'Jackson Baker', age: 43, gender: 'Male', disease: 'Gallstones' },
//     { id: 24, name: 'Evelyn Adams', age: 32, gender: 'Female', disease: 'Celiac Disease' },
//     { id: 25, name: 'Liam Nelson', age: 39, gender: 'Male', disease: 'Osteoporosis' },
//     { id: 26, name: 'Abigail Carter', age: 26, gender: 'Female', disease: 'PCOS' },
//     { id: 27, name: 'David Mitchell', age: 41, gender: 'Male', disease: 'Sleep Apnea' },
//     { id: 28, name: 'Ella Perez', age: 23, gender: 'Female', disease: 'Depression' },
//     { id: 29, name: 'Samuel Roberts', age: 48, gender: 'Male', disease: 'COPD' },
//     { id: 30, name: 'Avery Turner', age: 33, gender: 'Female', disease: 'Hyperthyroidism' }
//   ];
  

//   const handlePatientClick = (patient: any) => {
//     setSelectedPatient(patient);
//   };

//   const closePopup = () => {
//     setSelectedPatient(null);
//   };

//   return (
//     <Box className="p-4 animate-fade-in">
//       <Typography variant="h4" gutterBottom>
//         Patient Dashboard
//       </Typography>
//       {loading ? (
//         <CircularProgress />
//       ) : (
//         <Box>

//       <Table>
//         <TableCaption>A list of your recent patients.</TableCaption>
//         <TableHeader>
//           <TableRow>
//           <TableHead >Id</TableHead>
//             <TableHead className="w-[100px]">Name</TableHead>
//             <TableHead>Age</TableHead>
//             <TableHead>Gender</TableHead>
//             <TableHead>Disease</TableHead>
//             <TableHead className="text-right">Action</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//         {patients.map((patient) => (
//           <TableRow>
//             <TableCell>{patient.id}</TableCell>
//             <TableCell className="font-medium">{patient.name}</TableCell>
//             <TableCell>{patient.age}</TableCell>
//             <TableCell>{patient.gender}</TableCell>
//             <TableCell>{patient.disease}</TableCell>
//             <TableCell className="text-right">
//             <Button  onClick={() => handlePatientClick(patient)}>
//                 View Details
//               </Button>
//             </TableCell>
//           </TableRow>
//           ))}
//         </TableBody>
//       </Table>

//           {/* {patients.map((patient) => (
//             <Box key={patient.id} className="flex justify-between p-2 border-b">
//               <Typography>{patient.name}</Typography>
//               <Button variant="contained" onClick={() => handlePatientClick(patient)}>
//                 View Details
//               </Button>
//             </Box>
//           ))} */}
//         </Box>
//       )}
//       {selectedPatient && <PatientPopup patient={selectedPatient} onClose={closePopup} />}
//     </Box>
//   );
// };

// export default Dashboard;
