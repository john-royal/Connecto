import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";

function JoinChat(): JSX.Element {
  const card = (
    <React.Fragment>
      <CardContent>
        <Typography variant="h2" component="div">
          Need help?
        </Typography>
        <Typography variant="h5">Click here to join a support chat!</Typography>
        <ContactSupportIcon sx={{ fontSize: 100, color: "#5e8b8f" }} />
      </CardContent>
    </React.Fragment>
  );

  return (
    <Box
      sx={{ minWidth: 500, minHeight: 245, border: 3, borderColor: "#59606D" }}
    >
      <CardActionArea onClick={(event) => (window.location.href = "/chat")}>
        <Card variant="outlined">{card}</Card>
      </CardActionArea>
    </Box>
  );
}

export default JoinChat;
