import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function LeaveChat(): JSX.Element {
  const card = (
    <React.Fragment>
      <CardContent>
        <Typography variant="h4" component="div">
          Leave Chat
        </Typography>
        <CloseIcon sx={{ fontSize: 75, color: "#5e8b8f" }} />
      </CardContent>
    </React.Fragment>
  );

  return (
    <Box
      sx={{ minWidth: 100, minHeight: 100, border: 3, borderColor: "#59606D" }}
    >
      <CardActionArea onClick={(event) => (window.location.href = "/")}>
        <Card variant="outlined">{card}</Card>
      </CardActionArea>
    </Box>
  );
}

export default LeaveChat;
