
import { Box, Typography } from "@mui/material";
import  Lottie  from "lottie-react";
import comingSoonAnimation from "./animations/comingsoon.json"; // Replace with your Lottie JSON file path

const ComingSoonPage = () => {
  return (
    <Box
      sx={{
        height: "92vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f4f4f9",
      }}
    >
      <Box
        sx={{
          width: { xs: "80%", md: "40%" },
          mb: 4,
        }}
      >
        <Lottie animationData={comingSoonAnimation} loop={true} />
      </Box>
      <Typography variant="h4" color="primary" gutterBottom>
        Coming Soon
      </Typography>
      <Typography variant="body1" color="textSecondary">
        We are working hard to bring you something amazing. Stay tuned!
      </Typography>
    </Box>
  );
};

export default ComingSoonPage;
