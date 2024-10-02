import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

const AnnouncementPage = () => {
  const [announcement, setAnnouncement] = useState('');
  const [title, setTitle] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSendAnnouncement = () => {
    if (announcement && title) {
      // Simulate sending announcement to all patients
      console.log('Announcement sent:', title, announcement);
      setIsSent(true);
      setTimeout(() => setIsSent(false), 3000); // Reset after 3 seconds
      setTitle('');
      setAnnouncement('');
    }
  };

  return (
    <div className="flex justify-center py-10 h-[91.9vh] bg-gray-100">
  <div className="flex w-full max-w-screen-xl gap-4">
    {/* First Card (7 columns) */}
    <div className="flex-grow basis-7/12">
      <Card className="w-full  rounded-lg border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Send Announcement</CardTitle>
          <CardDescription className="text-center">Notify all your patients easily</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter the announcement title"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="announcement" className="block text-sm font-medium text-gray-700">
              Announcement Message
            </label>
            <textarea
              id="announcement"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="Write your message here"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md h-32"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <button
            className="w-full py-2 bg-[#057A85] text-white rounded-md hover:bg-blue-600 transition"
            onClick={handleSendAnnouncement}
          >
            Send Announcement
          </button>
          {isSent && (
            <div className="mt-4 text-center text-[#057A85] font-semibold">
              Announcement sent successfully!
            </div>
          )}
        </CardFooter>
      </Card>
    </div>

    {/* Second Card (4 columns) */}
    <div className="flex-grow basis-4/12">
          <div className='bg-white w-full h-[80vh] rounded-xl'>
          <CardHeader>
          <CardTitle className="text-center text-2xl">Notifications</CardTitle>
        </CardHeader>

          </div>
    </div>
  </div>
</div>

  );
};

export default AnnouncementPage;
