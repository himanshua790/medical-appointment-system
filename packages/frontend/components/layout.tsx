"use client"

import type React from "react"
import Head from "next/head"
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material"
import { Menu as MenuIcon } from "@mui/icons-material"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"

export default function Layout({ children, title }: { children: React.ReactNode; title?: string }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  // Public navigation items
  const publicMenuItems = [
    { text: "Home", href: "/" },
    { text: "Doctors", href: "/doctors" },
    { text: "Login", href: "/auth" },
  ]

  // Private navigation items (only for authenticated users)
  const privateMenuItems = [
    { text: "Dashboard", href: "/dashboard" },
    { text: "Appointments", href: "/appointments" },
    { text: "Profile", href: "/profile" },
    { text: "Reminders", href: "/reminders" },
  ]

  // Combined menu items based on authentication status
  const menuItems = isAuthenticated 
    ? [...publicMenuItems.filter(item => item.text !== "Login"), ...privateMenuItems]
    : publicMenuItems

  const handleLogout = () => {
    logout()
  }

  const pageTitle = title ? `${title} | MediSchedule` : "MediSchedule"

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content="Schedule medical appointments with ease" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2196F3" />
      </Head>
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              MediSchedule
            </Typography>
            {isAuthenticated ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  Hello, {user?.username}
                </Typography>
                <Button color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
              </Box>
            ) : (
              <Button color="inherit" component={Link} href="/auth">
                Login
              </Button>
            )}
          </Toolbar>
        </AppBar>

        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <List sx={{ width: 250 }}>
            {menuItems.map((item) => (
              <ListItem key={item.text} component={Link} href={item.href} onClick={() => setDrawerOpen(false)}>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Drawer>

        <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
          {title && (
            <Typography variant="h4" component="h1" gutterBottom>
              {title}
            </Typography>
          )}
          {children}
        </Container>

        <Box component="footer" sx={{ py: 2, textAlign: "center", borderTop: "1px solid #eee" }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} MediSchedule
          </Typography>
        </Box>
      </Box>
    </>
  )
}
