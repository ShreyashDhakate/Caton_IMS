import React from 'react';
import { Mail, Phone, MapPin, Star, Globe, Twitter, Linkedin, Facebook } from 'lucide-react';

interface DoctorProfileProps {
  doctor: {
    name: string;
    title: string;
    biography: string;
    qualifications: string[];
    specializations: string[];
    phone: string;
    email: string;
    address: string;
    // socialMedia: {
    //   website?: string;
    //   twitter?: string;
    //   linkedin?: string;
    //   facebook?: string;
    // };
    officeHours: string;
    appointmentLink: string;
    rating: number;
    reviews: number;
    certifications: string[];
    publications: string[];
  };
}

const DoctorProfile: React.FC<DoctorProfileProps> = ({ doctor }) => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Header Section */}
        <div className="relative h-64 w-full bg-gradient-to-r from-blue-500 to-teal-500">
          <div className="absolute inset-0 flex justify-center items-center">
            <img
              src="\src\assets\Profile.jpeg" // Use a normal <img> tag for non-Next.js projects
              alt="Doctor Image"
              width={160}
              height={160}
              className="rounded-[1rem]  shadow-lg"
            />
          </div>
        </div>

        <div className="text-center mt-20">
          <h1 className="text-3xl font-semibold text-gray-900">{doctor.name}</h1>
          <p className="text-lg text-gray-600">{doctor.title}</p>
        </div>

        {/* Contact Information */}
        <div className="mt-8 px-4 flex justify-center space-x-10 text-gray-700">
          <a href={`mailto:${doctor.email}`} className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-gray-600" />
            <span>{doctor.email}</span>
          </a>
          <a href={`tel:${doctor.phone}`} className="flex items-center space-x-2">
            <Phone className="h-5 w-5 text-gray-600" />
            <span>{doctor.phone}</span>
          </a>
          <a href={`https://www.google.com/maps/search/?api=1&query=${doctor.address}`} className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-gray-600" />
            <span>{doctor.address}</span>
          </a>
        </div>

        {/* Biography */}
        <div className="px-8 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Biography</h2>
          <p className="text-gray-700 mt-2">{doctor.biography}</p>
        </div>

        {/* Qualifications and Specializations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-8 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Qualifications</h2>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {doctor.qualifications.map((qualification, index) => (
                <li key={index} className="text-gray-700">{qualification}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Specializations</h2>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {doctor.specializations.map((specialization, index) => (
                <li key={index} className="text-gray-700">{specialization}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Reviews and Rating */}
        <div className="px-8 py-4">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="text-gray-800 font-semibold">{doctor.rating.toFixed(1)}</span>
            <span className="text-gray-600">({doctor.reviews} reviews)</span>
          </div>
        </div>

        {/* Office Hours */}
        <div className="px-8 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Office Hours</h2>
          <p className="text-gray-700">{doctor.officeHours}</p>
        </div>

        {/* Appointment Button */}
        

        {/* Social Media Links */}
        {/* <div className="px-8 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Social Media</h2>
          <div className="flex space-x-4 mt-2">
            {doctor.socialMedia.website && (
              <a href={doctor.socialMedia.website} target="_blank" rel="noopener noreferrer">
                <Globe className="h-5 w-5 text-gray-600" />
              </a>
            )}
            {doctor.socialMedia.twitter && (
              <a href={doctor.socialMedia.twitter} target="_blank" rel="noopener noreferrer">
                <Twitter className="h-5 w-5 text-blue-400" />
              </a>
            )}
            {doctor.socialMedia.linkedin && (
              <a href={doctor.socialMedia.linkedin} target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-5 w-5 text-blue-700" />
              </a>
            )}
            {doctor.socialMedia.facebook && (
              <a href={doctor.socialMedia.facebook} target="_blank" rel="noopener noreferrer">
                <Facebook className="h-5 w-5 text-blue-600" />
              </a>
            )}
          </div> */}
        {/* </div> */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-8 py-4">
                    {/* Certifications */}
        <div className="">
          <h2 className="text-xl font-semibold text-gray-800">Certifications</h2>
          <ul className="list-disc list-inside mt-2 space-y-1">
            {doctor.certifications.map((certification, index) => (
              <li key={index} className="text-gray-700">{certification}</li>
            ))}
          </ul>
        </div>

        {/* Publications */}
        <div className="">
          <h2 className="text-xl font-semibold text-gray-800">Publications</h2>
          <ul className="list-disc list-inside mt-2 space-y-1">
            {doctor.publications.map((publication, index) => (
              <li key={index} className="text-gray-700">{publication}</li>
            ))}
          </ul>
        </div>

        </div>
        
        <div className="px-8 py-4 text-center">
          <a href={doctor.appointmentLink} className="bg-[#057A85]  hover:bg-green-700 text-white py-2 px-4 mx-8 rounded-lg">
            Edit Info
          </a>
          <a href={doctor.appointmentLink} className="bg-[#057A85] hover:bg-green-700 text-white py-2 px-4 mx-8 rounded-lg">
            Send Announcement
          </a>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
