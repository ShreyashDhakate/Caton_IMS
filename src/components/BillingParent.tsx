import Billing from './Billing';

const BillingParent = () => {
  const doctorResponce = {
    precautions: '1234 Main St, City, State',
    disease: '(123) 456-7890',
  };

  return (
    <Billing
      precautions={doctorResponce.precautions}
      disease={doctorResponce.disease}
    />
  );
};

export default BillingParent;
