"use client";
import * as React from "react";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { signOut} from "next-auth/react";
import "@/styles/loader.css";

const settings = ["Logout"];

interface User {
  email: string;
  name: string;
  img: string;
  token: string | number;
}

export default function UserNav() {
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );

  const [user, setUser] = React.useState<User>({
    email: "",
    name: "",
    img: "",
    token: 0,
  });

  React.useEffect(() => {
    fetch(`api/user`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
        }
      }).catch(err=>{
        console.log('err',err)
      })
  }, []);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  const handleUserMenu = (setting: string) => {
    if (setting === "Profile") {
    }
    if (setting === "Logout") {
      signOut();
    }
  };
  if (user && user.email!=='' && user.name!=='') {
    return (
      <>
        <Tooltip title="Open settings">
          <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
            <p style={{fontFamily:'var(--font-mono)'}} className="text-white text-lg mr-4">
             <AttachMoneyIcon fontSize="small"/> {' '+ user.token}
            </p>
            <Avatar
              alt={user.name as string}
              src={user.img as string}
              style={{ background: "grey" }}
            />
          </IconButton>
        </Tooltip>
        <Menu
          sx={{ mt: "45px" }}
          id="menu-appbar"
          anchorEl={anchorElUser}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUserMenu}
        >
          {settings.map((setting) => (
            <MenuItem key={setting} onClick={() => handleUserMenu(setting)}>
              <Typography textAlign="center">{setting}</Typography>
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }
}
