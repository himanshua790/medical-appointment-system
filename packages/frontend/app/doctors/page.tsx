"use client"
import { useState } from "react"
import { Box, Button, Card, CardContent, Grid, TextField, Typography, CircularProgress } from "@mui/material"
import Layout from "@/components/layout"
import Link from "next/link"
import { useGetDoctors } from "../hooks/useDoctors"

interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  bio?: string;
  userId?: any;
}

export default function DoctorListingPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { data: doctors = [], isLoading, error, refetch } = useGetDoctors()

  const filteredDoctors = doctors.filter(
    (doctor: Doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout title="Find Doctors">
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search doctors by name or specialty"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: "center", my: 3 }}>
          <Typography color="error">Failed to load doctors. Please try again.</Typography>
          <Button onClick={() => refetch()} sx={{ mt: 2 }}>
            Try Again
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor: Doctor) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={doctor._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{doctor.name}</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {doctor.specialty}
                    </Typography>
                    {doctor.bio && (
                      <Typography variant="body2" noWrap gutterBottom>
                        {doctor.bio.substring(0, 100)}...
                      </Typography>
                    )}
                    <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
                      <Button variant="outlined" component={Link} href={`/doctors/${doctor._id}`}>
                        View Profile
                      </Button>
                      <Button variant="contained" component={Link} href={`/booking?doctor=${doctor._id}`}>
                        Book Appointment
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid size={{ xs: 12 }}>
              <Typography align="center">No doctors found matching your search criteria.</Typography>
            </Grid>
          )}
        </Grid>
      )}
    </Layout>
  )
}
