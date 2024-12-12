import Billing from './Billing';
import { useLocation } from "react-router-dom";


const BillingParent = () => {
  const location = useLocation();
  const doctorResponce = {
    precautions: '1234 Main St, City, State',
    disease: '(123) 456-7890',
  };

  return (
    <Billing
    location={location}
      // precautions={doctorResponce.precautions}
      // disease={doctorResponce.disease}
    />
  );
};

export default BillingParent;
