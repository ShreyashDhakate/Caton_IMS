import Billing from './Billing';

const BillingParent = () => {
  const hospitalDetails = {
    hospitalName: 'ABC Pharmacy and Hospital',
    hospitalAddress: '1234 Main St, City, State',
    hospitalPhone: '(123) 456-7890',
  };

  return (
    <Billing
      hospitalName={hospitalDetails.hospitalName}
      hospitalAddress={hospitalDetails.hospitalAddress}
      hospitalPhone={hospitalDetails.hospitalPhone}
    />
  );
};

export default BillingParent;
