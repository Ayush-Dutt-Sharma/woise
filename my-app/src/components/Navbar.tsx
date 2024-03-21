import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import AdbIcon from "@mui/icons-material/Adb";
import UserNav from "@/components/UserNav";
import { getServerSession } from "next-auth/next";
import { options } from "@/app/api/auth/[...nextauth]/options";
import SignBTN from "./SIgnBTN";
import Coffee from "./ui/Coffee";
import NavBtn from "./ui/NavBtn";
import "@/styles/navbar.css";

// import Image from "next/image";

const pages = ["Products", "Pricing", "Blog"];

async function Navbar() {
  const session = await getServerSession(options);

  return (
    <AppBar position="static" style={{ background: "none" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <NavBtn />
          <Box sx={{ display: { xs: "none", md: "flex" }, mr: 1 }}>
            <Coffee />
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            {!session ? (
              <>
                <SignBTN />
              </>
            ) : (
              <UserNav />
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Navbar;
