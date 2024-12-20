// ProfilePage.jsx
import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from "./ui/sonner";
import { invoke } from "@tauri-apps/api/core";
import QRCode from "react-qr-code";




const ProfilePage = () => {
  const [currentTab, setCurrentTab] = useState('profile');
  const [open, setOpen] = useState(false);
  const handleClickOpen = () => setOpen(true);
  const { logout } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    activeDropdown;
  const navigate = useNavigate();

  const { addToast } = useToast();
    // Close the logout confirmation dialog
    const handleClose = () => setOpen(false);
  
    // Handle logout
    const handleLogout = async () => {
      try {
        logout(); // Update auth context
        localStorage.removeItem('UserId');
        localStorage.removeItem('role');
        setActiveDropdown(null); // Reset active dropdowns
        addToast('You are logged out!',"success");
        navigate('/login');
      } catch (error) {
        addToast('Logout failed. Please try again.',"error");
        
      } finally {
        handleClose();
      }
    };

  return (
    <div className="flex  h-[92vh]">
      {/* Sidebar */}
      <div className="w-1/6 bg-gray-800 text-white flex flex-col p-4 justify-between">
      <div>
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          <div className="space-y-2">
            <button
              onClick={() => setCurrentTab('profile')}
              className={`py-2 px-4 w-full text-left ${
                currentTab === 'profile' ? 'bg-gray-700' : ''
              } hover:bg-gray-700 rounded`}
            >
              Profile
            </button>
            <button
              onClick={() => setCurrentTab('backup')}
              className={`py-2 px-4 w-full text-left ${
                currentTab === 'backup' ? 'bg-gray-700' : ''
              } hover:bg-gray-700 rounded`}
            >
              Backup Data
            </button>
            <button
              onClick={() => setCurrentTab('subscription')}
              className={`py-2 px-4 w-full text-left ${
                currentTab === 'subscription' ? 'bg-gray-700' : ''
              } hover:bg-gray-700 rounded`}
            >
              Subscription
            </button>
          </div>
        </div>
        <button
        onClick={handleClickOpen}
          className="mt-4 py-2 px-4 bg-red-600 hover:bg-red-700 rounded text-white"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="w-5/6 bg-gray-100 p-6 overflow-y-auto">
        {currentTab === 'profile' && <ProfileTab />}
        {currentTab === 'backup' && <BackupTab />}
        {currentTab === 'subscription' && <SubscriptionTab />}
      </div>


      {/* Logout Confirmation Dialog */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="bg-white rounded-lg shadow-md w-80 z-1000">
            <div className="p-4">
              <h2 className="text-lg font-semibold">Logout Confirmation</h2>
              <p className="text-gray-700 mt-2">
                Are you sure you want to logout?
              </p>
            </div>
            <div className="flex justify-end p-4 space-x-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const ProfileTab = () => {
    const [editable, setEditable] = useState(false);
    const [fields, setFields] = useState({
    name: localStorage.getItem('name') || '',
    hospital: localStorage.getItem('hospital') || '',
    email: localStorage.getItem('email') || '',
    phone: localStorage.getItem('phone') || '',
    address: localStorage.getItem('address') || '',
  });

  const handleInputChange = (field: keyof typeof fields, value: string) => {
    setFields({
      ...fields,
      [field]: value,
    });
  };

  const handleSave = async () => {
    Object.entries(fields).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    setEditable(false);

    try {
      const response = await invoke<string>("update_user_details", {
        name: fields.name, // Example mapping, adjust based on your backend
        mobile: fields.phone, 
        hospital: fields.hospital, 
        address: fields.address, 
        email: fields.email,  
      });
      console.log("Response from API:", response);
    } catch (error) {
      console.error("Error while saving profile:", error);
    }
  };

  
    return (
        <div>
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        <form className="space-y-4">
          {Object.entries(fields).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1" htmlFor={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
              <input
                type="text"
                id={key}
                name={key}
                value={value}
                onChange={(e) => handleInputChange(key as keyof typeof fields, e.target.value)}
                disabled={!editable}
                className={`w-full p-2 border ${
                  editable ? 'border-blue-300' : 'border-gray-300'
                } rounded`}
              />
            </div>
          ))}
          {editable ? (
            <button
              type="button"
              onClick={handleSave}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setEditable(true)}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Edit Profile
            </button>
          )}
        </form>
      </div>
    );
  };
  

const BackupTab = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Backup Your Data</h2>
    <p className="mb-4">Click the button below to download all your data as a backup.</p>
    <button
      className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
    >
      Backup Data
    </button>
  </div>
);



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






export default ProfilePage;
