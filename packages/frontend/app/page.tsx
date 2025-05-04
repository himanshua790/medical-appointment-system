"use client"
import { Box, Button, Card, CardContent, Grid, Typography } from "@mui/material"
import Layout from "@/components/layout"
import Link from "next/link"

export default function LandingPage() {
  const features = [
    {
      title: "Find Doctors",
      description: "Search for specialists in your area.",
    },
    {
      title: "Book Appointments",
      description: "Schedule appointments with your preferred doctors.",
    },
    {
      title: "Receive Reminders",
      description: "Get timely notifications about upcoming appointments.",
    },
  ]

  return (
    <Layout>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Schedule Medical Appointments with Ease
        </Typography>
        <Typography variant="body1" paragraph>
          Connect with healthcare providers and manage your appointments in one place.
        </Typography>
        <Button variant="contained" component={Link} href="/doctors">
          Book Appointment Now
        </Button>
      </Box>

      <Grid container spacing={3}>
        {features.map((feature, index) => (
          <Grid key={index} size={{ xs: 12, sm: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2">{feature.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout>
  )
}
