"use client"

import { useState } from "react"
import { Box, Button, Card, CardContent, Chip, CircularProgress, Grid, Tab, Tabs, Typography } from "@mui/material"
import Layout from "@/components/layout"
import Link from "next/link"
import { useUserAppointments, useCancelAppointment } from "../hooks/useAppointments"

interface Appointment {
  _id: string;
  doctorId: any;
  userId: any;
  dateTime: string;
  reason: string;
  status: string;
  doctorName?: string;
  doctorSpecialty?: string;
  location?: string;
}

export default function AppointmentsPage() {
  const [tabValue, setTabValue] = useState(0)
  const { data: appointments = [], isLoading, error, refetch } = useUserAppointments()
  const { mutate: cancelAppointmentMutation, isLoading: isCancelling } = useCancelAppointment()

  const handleCancelAppointment = async (id: string) => {
    cancelAppointmentMutation(id, {
      onError: (err) => {
        console.error("Error cancelling appointment:", err)
        alert("Failed to cancel appointment. Please try again.")
      }
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "success"
      case "Pending":
        return "warning"
      case "Completed":
        return "info"
      case "Cancelled":
        return "error"
      default:
        return "default"
    }
  }

  // Filter appointments by status (upcoming or past)
  const currentDate = new Date()
  const upcomingAppointments = appointments.filter(
    (appointment: Appointment) => 
      new Date(appointment.dateTime) >= currentDate && 
      appointment.status !== "Cancelled"
  )
  
  const pastAppointments = appointments.filter(
    (appointment: Appointment) => 
      new Date(appointment.dateTime) < currentDate || 
      appointment.status === "Cancelled"
  )

  return (
    <Layout title="My Appointments">
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Upcoming" />
          <Tab label="Past" />
        </Tabs>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: "center", my: 3 }}>
          <Typography color="error">Failed to load appointments. Please try again.</Typography>
          <Button onClick={() => refetch()} sx={{ mt: 2 }}>
            Try Again
          </Button>
        </Box>
      ) : (
        <>
          {tabValue === 0 && (
            <Grid container spacing={3}>
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment: Appointment) => (
                  <Grid size={{ xs: 12 }} key={appointment._id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                          <Typography variant="h6">{appointment.doctorName}</Typography>
                          <Chip label={appointment.status} color={getStatusColor(appointment.status) as any} size="small" />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {appointment.doctorSpecialty}
                        </Typography>
                        <Typography variant="body1">
                          {new Date(appointment.dateTime).toLocaleDateString()} at {new Date(appointment.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                        <Typography variant="body2">{appointment.location}</Typography>
                        <Typography variant="body2">Reason: {appointment.reason}</Typography>

                        {appointment.status === "Confirmed" && (
                          <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                            <Button variant="outlined" component={Link} href={`/booking/reschedule/${appointment._id}`} size="small">
                              Reschedule
                            </Button>
                            <Button 
                              variant="outlined" 
                              color="error" 
                              size="small"
                              onClick={() => handleCancelAppointment(appointment._id)}
                              disabled={isCancelling}
                            >
                              {isCancelling ? 'Cancelling...' : 'Cancel'}
                            </Button>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid size={{ xs: 12 }}>
                  <Typography>No upcoming appointments.</Typography>
                  <Button variant="contained" component={Link} href="/doctors" sx={{ mt: 2 }}>
                    Book an Appointment
                  </Button>
                </Grid>
              )}
            </Grid>
          )}

          {tabValue === 1 && (
            <Grid container spacing={3}>
              {pastAppointments.length > 0 ? (
                pastAppointments.map((appointment: Appointment) => (
                  <Grid size={{ xs: 12 }} key={appointment._id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                          <Typography variant="h6">{appointment.doctorName}</Typography>
                          <Chip label={appointment.status} color={getStatusColor(appointment.status) as any} size="small" />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {appointment.doctorSpecialty}
                        </Typography>
                        <Typography variant="body1">
                          {new Date(appointment.dateTime).toLocaleDateString()} at {new Date(appointment.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                        <Typography variant="body2">{appointment.location}</Typography>
                        <Typography variant="body2">Reason: {appointment.reason}</Typography>

                        {appointment.status === "Completed" && (
                          <Button variant="outlined" component={Link} href={`/appointments/${appointment._id}/summary`} size="small" sx={{ mt: 2 }}>
                            View Summary
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid size={{ xs: 12 }}>
                  <Typography>No past appointments.</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </>
      )}
    </Layout>
  )
}
