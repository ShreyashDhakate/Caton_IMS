// ProfilePage.jsx
import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from "./ui/sonner";
import { invoke } from "@tauri-apps/api/core";


type SubscriptionOptionProps = {
  duration: string;
  price: string;
};


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

const SubscriptionTab = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Your Subscription</h2>
    <p className="mb-4">Your subscription is valid until <strong>2024-12-31</strong>.</p>
    <h3 className="text-xl font-semibold mb-2">Extend/Renew Subscription</h3>
    <ul className="space-y-2">
      <SubscriptionOption
        duration="1 Month"
        price="$10"
      />
      <SubscriptionOption
        duration="6 Months"
        price="$50"
      />
      <SubscriptionOption
        duration="1 Year"
        price="$90"
      />
    </ul>
  </div>
);

const SubscriptionOption = ({ duration, price }: SubscriptionOptionProps) => (
  <li className="flex items-center justify-between bg-white p-4 rounded shadow">
    <span>{duration}</span>
    <span>{price}</span>
    <button
      className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
    >
      Subscribe
    </button>
  </li>
);


export default ProfilePage;
