import Billing from './Billing';
import { useLocation } from "react-router-dom";


const BillingParent = () => {
  const location = useLocation();

  return (
    <Billing
    location={location}
      // precautions={doctorResponce.precautions}
      // disease={doctorResponce.disease}
    />
  );
};

export default BillingParent;
