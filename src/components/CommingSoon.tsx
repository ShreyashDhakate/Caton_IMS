import Lottie from "lottie-react";
import comingSoonAnimation from "./animations/comingsoon.json"; // Replace with your Lottie JSON file path

const ComingSoonPage = () => {
  return (
    <div className="flex flex-col justify-center items-center h-[92vh] bg-gray-100">
      <div className="w-4/5 md:w-2/5 mb-8">
        <Lottie animationData={comingSoonAnimation} loop={false} />
      </div>
      <h1 className="text-2xl md:text-4xl text-blue-600 font-semibold mb-4">
        Coming Soon
      </h1>
      <p className="text-sm md:text-base text-gray-600 text-center">
        We are working hard to bring you something amazing. Stay tuned!
      </p>
    </div>
  );
};

export default ComingSoonPage;
