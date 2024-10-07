import { LinearProgress } from "@mui/material";

const Loading = () => {
  return (
    <LinearProgress 
      color="error" 
      sx={{ 
        position: 'fixed',
        left: '0',
        top: '0',
        zIndex: '9000',
        width: "100%",
        height: "3px"
      }} 
    />
  );
}

export default Loading;
