import  { useState } from 'react';
import { invoke } from "@tauri-apps/api/core";
import QRCode from "react-qr-code";

// Define the type for SubscriptionOptionProps
interface SubscriptionOptionProps {
    duration: string;
    price: string;
    features: string[];
  }
  
  const SubscriptionTab = () => {
    const [showQRCode, setShowQRCode] = useState(false); // State to control QR code visibility
  
    const handleSendSubscriptionDetails = async () => {
      const userId = localStorage.getItem('userId');
      const name = localStorage.getItem('name');
      const email = localStorage.getItem('email');
      const subscriptionEndDate = new Date('2024-12-31T00:00:00Z').toISOString(); // Static for now, can be dynamic in future
  
      if (!userId || !name || !email) {
        console.error('User details are incomplete.');
        return;
      }
  
      try {
        const response = await invoke('renew_subscription', {
          userId,
          name,
          email,
          subscriptionEndDate,
        });
  
        console.log('Subscription details sent successfully:', response);
        alert('Subscription details sent successfully!');
      } catch (error) {
        console.error('Failed to send subscription details:', error);
        alert('Failed to send subscription details. Please try again.');
      }
    };
  
    const handleSubscribeClick = () => {
      // Show the QR code when Subscribe is clicked
      setShowQRCode(true);
    };
  
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Subscription</h2>
        <p className="mb-4">Your subscription is valid until <strong>2024-12-31</strong>.</p>
        
        <h3 className="text-xl font-semibold mb-2">Extend/Renew Subscription</h3>
        
        <p className="mb-4">Choose your subscription plan to access all features including personalized billing, appointment fetching, printed bills, and more!</p>
  
        <ul className="space-y-2">
          <SubscriptionOption 
            duration="1 Month" 
            price="2500/-" 
            features={[
              "Access to all features",
              "Appointment fetching",
              "Personalized billing portal",
              "Printed bill option",
              "Exclusive doctor and patient access",
              "Priority support"
            ]}
            onSubscribe={handleSubscribeClick} // Pass the subscribe handler
          />
          {/* <SubscriptionOption 
            duration="3 Months" 
            price="7000/-" 
            features={[
              "All benefits of 1 Month plan",
              "3-month subscription period",
              "Access to exclusive healthcare resources"
            ]}
            onSubscribe={handleSubscribeClick} // Pass the subscribe handler
          /> */}
        </ul>
  
        {/* Show the QR code only after Subscribe button is clicked */}
        {showQRCode && (
          <>
          <div className="flex justify-center my-8">
            <QRCode value="upi://pay?pa=shreyashdhakate20@oksbi&am=2500" size={200} />
          </div>
          <button
          onClick={handleSendSubscriptionDetails}
          className="bg-teal-500 text-white py-2 px-4 rounded hover:bg-teal-600 mt-4"
        >
          Apply to renew Subscription
        </button>
        </>
        )}
  
        
      </div>
    );
  };
  
  const SubscriptionOption = ({ duration, price, features, onSubscribe }: SubscriptionOptionProps & { onSubscribe: () => void }) => (
    <li className="flex items-center justify-between bg-white p-4 rounded shadow">
      <div>
        <span className="block font-bold">{duration}</span>
        <span>{price}</span>
        <ul className="mt-2 space-y-1">
          {features.map((feature, index) => (
            <li key={index} className="text-sm text-gray-600">✔ {feature}</li>
          ))}
        </ul>
      </div>
      <button
        onClick={onSubscribe} // Call the onSubscribe function when clicked
        className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
      >
        Subscribe
      </button>
    </li>
  );

  export default SubscriptionTab;
  