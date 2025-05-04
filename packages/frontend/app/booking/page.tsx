'use client';

import { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Layout from '@/components/layout';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAllDoctors, useDoctorById, useDoctorAvailability } from '../hooks/useDoctors';
import { useCreateAppointment } from '../hooks/useAppointments';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { IDoctor, ITimeSlot } from '@medical/shared/types';

const steps = ['Select Doctor', 'Choose Date & Time', 'Enter Details', 'Confirm'];


export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const initialDoctorId = searchParams.get('doctor');

  const [activeStep, setActiveStep] = useState(initialDoctorId ? 1 : 0);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(initialDoctorId || null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // React Query hooks
  const { data: doctors = [], isLoading: isLoadingDoctors } = useAllDoctors();
  const { data: selectedDoctorData } = useDoctorById(selectedDoctor || '');
  const { data: availabilityData = [], isLoading: isLoadingAvailability } = useDoctorAvailability(
    selectedDoctor || '',
    selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
  );
  const { mutate: createAppointment, isLoading: isCreatingAppointment } = useCreateAppointment();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth?redirect=/booking');
    }
  }, [isAuthenticated, router]);

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      // Submit booking
      try {
        if (!user || !selectedDoctor || !selectedDate || !selectedTime || !reason) {
          throw new Error('Missing required booking information');
        }

        // Format date and time for API
        const [hours, minutes] = selectedTime.split(':');
        const appointmentDate = new Date(selectedDate);
        appointmentDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        
        // Calculate end time (30 min appointment)
        const endTimeDate = new Date(appointmentDate);
        endTimeDate.setMinutes(appointmentDate.getMinutes() + 30);

        const appointmentData = {
          doctorId: selectedDoctor,
          dateTime: appointmentDate.toISOString(),
          endTime: endTimeDate.toISOString(),
          reasonForVisit: reason,
          notes,
        };

        createAppointment(appointmentData, {
          onSuccess: () => {
            router.push('/appointments');
          },
          onError: (err) => {
            console.error('Error booking appointment:', err);
            setError('Failed to book appointment. Please try again.');
          },
        });
      } catch (err) {
        console.error('Error with booking data:', err);
        setError('Please check all required fields are filled correctly.');
      }
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const isNextDisabled = () => {
    switch (activeStep) {
      case 0:
        return !selectedDoctor;
      case 1:
        return !selectedDate || !selectedTime;
      case 2:
        return !reason;
      default:
        return false;
    }
  };

  const getSelectedDoctorName = () => {
    const doctor = doctors.find((d: IDoctor) => d._id === selectedDoctor);
    return doctor ? doctor.name : selectedDoctorData?.name || '';
  };

  return (
    <Layout title="Book an Appointment">
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          {isCreatingAppointment && activeStep === steps.length - 1 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {activeStep === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Select a Doctor
                  </Typography>
                  {isLoadingDoctors ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Doctor</InputLabel>
                      <Select
                        value={selectedDoctor || ''}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                        label="Doctor"
                      >
                        {doctors.map((doctor: IDoctor) => (
                          <MenuItem key={doctor._id} value={doctor._id}>
                            {doctor.name} - {doctor.specialty}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Box>
              )}

              {activeStep === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Choose Date & Time
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Select Date"
                          value={selectedDate}
                          onChange={(newValue: Date | null) => {
                            setSelectedDate(newValue);
                            setSelectedTime(null); // Reset time when date changes
                          }}
                          slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Time Slot</InputLabel>
                        <Select
                          value={selectedTime || ''}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          label="Time Slot"
                          disabled={!selectedDate || isLoadingAvailability}
                        >
                          {isLoadingAvailability ? (
                            <MenuItem disabled>Loading time slots...</MenuItem>
                          ) : availabilityData.length > 0 ? (
                            availabilityData.map((slot: ITimeSlot) => (
                              <MenuItem
                                key={slot?.start?.toString()}
                                value={slot?.start?.toString()}
                                disabled={!slot?.isAvailable}
                              >
                                {format(slot?.start, 'HH:mm')} {!slot?.isAvailable && '(Unavailable)'}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>No time slots available</MenuItem>
                          )}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {activeStep === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Enter Visit Details
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Reason for Visit</InputLabel>
                    <Select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      label="Reason for Visit"
                    >
                      <MenuItem value="General Consultation">General Consultation</MenuItem>
                      <MenuItem value="Follow-up Visit">Follow-up Visit</MenuItem>
                      <MenuItem value="Annual Check-up">Annual Check-up</MenuItem>
                      <MenuItem value="Urgent Care">Urgent Care</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Additional Notes"
                    multiline
                    rows={4}
                    fullWidth
                    placeholder="Any additional information for the doctor"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Box>
              )}

              {activeStep === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Appointment Summary
                  </Typography>
                  <Typography variant="body1">Doctor: {getSelectedDoctorName()}</Typography>
                  <Typography variant="body1">
                    Date: {selectedDate?.toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1">Time: {selectedTime}</Typography>
                  <Typography variant="body1">Reason: {reason}</Typography>
                  {notes && <Typography variant="body1">Additional Notes: {notes}</Typography>}
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button variant="outlined" disabled={activeStep === 0} onClick={handleBack}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={
                    isNextDisabled() || (activeStep === steps.length - 1 && isCreatingAppointment)
                  }
                >
                  {activeStep === steps.length - 1 ? 'Confirm Booking' : 'Next'}
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
