"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Layout from "@/components/layout"
import { useGetAppointments } from "../hooks/useAppointments"
import { Box, Button, Card, CardContent, Chip, CircularProgress, Grid, Typography } from "@mui/material"
import Link from "next/link"

interface Appointment {
  _id: string;
  patientId: {
    _id: string;
    username: string;
    email: string;
  };
  doctorId: {
    _id: string;
    name: string;
    specialty: string;
  };
  dateTime: string;
  endTime: string;
  reasonForVisit: string;
  status: string;
  notes?: string;
  reminderSent?: boolean;
  reminderTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const { data: appointments = [], isLoading: isLoadingAppointments, error } = useGetAppointments({ userId: user?._id })
  const router = useRouter()

  // Redirect to login if not authenticated and not loading
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth")
    }
  }, [isLoading, isAuthenticated, router])

  // Filter for upcoming appointments
  const currentDate = new Date()
  console.log('appointments', appointments);
  const upcomingAppointments = appointments
    .filter(
      (appointment: Appointment) => 
        new Date(appointment.dateTime) >= currentDate && 
        appointment.status.toLowerCase() !== "cancelled"
    )
    .sort((a: Appointment, b: Appointment) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .slice(0, 3) // Show only the next 3 upcoming appointments

  // Function to format date
  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Layout title="Dashboard">
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      </Layout>
    )
  }

  // Protected content (only shown when authenticated)
  return (
    <Layout title="Dashboard">
      <Box sx={{ maxWidth: "lg", mx: "auto" }}>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Welcome, {user?.username}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This is your personal dashboard where you can manage appointments and medical information.
            </Typography>
          </CardContent>
        </Card>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6">Upcoming Appointments</Typography>
                  <Button component={Link} href="/appointments" size="small">
                    View All
                  </Button>
                </Box>
                
                {isLoadingAppointments ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : error ? (
                  <Typography color="error">Failed to load appointments</Typography>
                ) : upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment: Appointment) => {
                    const { date, time } = formatAppointmentDate(appointment.dateTime)
                    return (
                      <Box 
                        key={appointment._id}
                        sx={{ 
                          p: 2, 
                          mb: 2, 
                          border: "1px solid", 
                          borderColor: "divider", 
                          borderRadius: 1,
                          '&:last-child': { mb: 0 }
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="subtitle1">{appointment.doctorId?.name}</Typography>
                          <Chip 
                            label={appointment.status} 
                            size="small" 
                            color={appointment.status.toLowerCase() === "confirmed" || appointment.status.toLowerCase() === "scheduled" ? "success" : "warning"}
                          />
                        </Box>
                        <Typography variant="body2">{date} at {time}</Typography>
                        <Typography variant="body2" color="text.secondary">{appointment.reasonForVisit}</Typography>
                      </Box>
                    )
                  })
                ) : (
                  <Box sx={{ textAlign: "center", py: 3 }}>
                    <Typography color="text.secondary">No upcoming appointments</Typography>
                    <Button component={Link} href="/doctors" variant="contained" sx={{ mt: 2 }}>
                      Book an Appointment
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Button 
                  component={Link} 
                  href="/doctors" 
                  variant="outlined" 
                  fullWidth 
                  sx={{ mb: 2 }}
                >
                  Find a Doctor
                </Button>
                <Button 
                  component={Link} 
                  href="/appointments" 
                  variant="outlined" 
                  fullWidth 
                  sx={{ mb: 2 }}
                >
                  View Appointments
                </Button>
                <Button 
                  component={Link} 
                  href="/profile" 
                  variant="outlined" 
                  fullWidth
                >
                  Update Profile
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  )
} 