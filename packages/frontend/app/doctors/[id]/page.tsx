"use client"

import type React from "react"
import { useState } from "react"
import { Box, Button, Card, CardContent, Tab, Tabs, Typography, CircularProgress, Alert } from "@mui/material"
import Layout from "@/components/layout"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useGetDoctor, useGetDoctorAvailability } from "@/app/hooks/useDoctors"
import { format } from "date-fns"

export default function DoctorDetailPage() {
  const [tabValue, setTabValue] = useState(0)
  const [availabilityDate, setAvailabilityDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  
  const params = useParams()
  const doctorId = params.id as string

  // Use React Query hooks
  const { data: doctor, isLoading, error } = useGetDoctor(doctorId)
  const { 
    data: availability = [], 
    isLoading: isLoadingAvailability 
  } = useGetDoctorAvailability(
    doctorId,
    tabValue === 1 ? availabilityDate : ''
  )

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  if (isLoading) {
    return (
      <Layout title="Loading Doctor Details">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Layout>
    )
  }

  if (error || !doctor) {
    return (
      <Layout title="Error">
        <Alert severity="error">{error instanceof Error ? error.message : "Doctor not found"}</Alert>
      </Layout>
    )
  }

  return (
    <Layout title={doctor.name}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">{doctor.name}</Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {doctor.specialty}
          </Typography>
          {doctor.location && (
            <Typography variant="body2" gutterBottom>
              {doctor.location}
            </Typography>
          )}
          {doctor.phone && (
            <Typography variant="body2" gutterBottom>
              {doctor.phone}
            </Typography>
          )}
          {doctor.email && (
            <Typography variant="body2" gutterBottom>
              {doctor.email}
            </Typography>
          )}
          <Button variant="contained" sx={{ mt: 2 }} component={Link} href={`/booking?doctor=${doctorId}`}>
            Book Appointment
          </Button>
        </CardContent>
      </Card>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="About" />
          <Tab label="Schedule" />
          <Tab label="Reviews" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Biography
          </Typography>
          <Typography variant="body1" paragraph>
            {doctor.bio || "No biography available."}
          </Typography>

          {doctor.education && doctor.education.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                Education
              </Typography>
              {doctor.education.map((edu: any, index: number) => (
                <Typography key={index} variant="body2" gutterBottom>
                  {edu.degree} - {edu.institution}, {edu.year}
                </Typography>
              ))}
            </>
          )}
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          {isLoadingAvailability ? (
            <CircularProgress size={24} />
          ) : availability && availability.length > 0 ? (
            <>
              <Typography variant="h6" gutterBottom>
                Available Slots for {availabilityDate}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 2 }}>
                {availability.map((slot, index) => (
                  <Button 
                    key={index} 
                    variant="outlined" 
                    size="small"
                    component={Link} 
                    href={`/booking?doctor=${doctorId}&slot=${slot.start}`}
                  >
                    {new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Button>
                ))}
              </Box>
            </>
          ) : (
            <Typography variant="body1">No available slots for the selected date.</Typography>
          )}
          <Button variant="contained" sx={{ mt: 2 }} component={Link} href={`/booking?doctor=${doctorId}`}>
            Check More Dates
          </Button>
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          {doctor.reviews && doctor.reviews.length > 0 ? (
            doctor.reviews.map((review: any, index: number) => (
              <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="subtitle2">{review.patient}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Rating: {review.rating}/5 • {review.date}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {review.comment}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body1">No reviews yet.</Typography>
          )}
        </Box>
      )}
    </Layout>
  )
}
