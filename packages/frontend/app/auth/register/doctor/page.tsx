'use client';

import { useRegister } from '@/app/hooks/useAuth';
import Layout from '@/components/layout';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  TextField,
  Typography
} from '@mui/material';
import { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// List of medical specialties
const specialties = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Family Medicine',
  'Gastroenterology',
  'Internal Medicine',
  'Neurology',
  'Obstetrics & Gynecology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
  'Surgery',
  'Urology',
];

export default function DoctorRegistrationPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const router = useRouter();
  const { mutate: register, isLoading, error: registerError } = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (
      !username ||
      !email ||
      !password ||
      !confirmPassword  
    ) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      register(
        {
          username,
          email,
          password,
          role: 'doctor',
        },
        {
          onSuccess: () => {
            router.push('/dashboard');
          },
          onError: (err: any) => {
            setError(err?.message || 'Registration failed. Please try again.');
          },
        }
      );
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    }
  };

  useEffect(() => {
    if (registerError instanceof AxiosError) {
      setError(registerError.response?.data.message || 'Registration failed. Please try again.');
    }
  }, [registerError]);

  return (
    <Layout title="Doctor Registration">
      <Box sx={{ maxWidth: 800, mx: 'auto', py: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" component="h1" gutterBottom>
              Create Doctor Account
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Username"
                    fullWidth
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Confirm Password"
                    type="password"
                    fullWidth
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isLoading}
                    sx={{ mt: 2 }}
                  >
                    {isLoading ? <CircularProgress size={24} /> : 'Register as Doctor'}
                  </Button>
                </Grid>
              </Grid>
            </form>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2">
                Already have an account? <Link href="/auth">Login</Link>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Register as a: <Link href="/auth/register/patient">Patient</Link>
                {/* |{' '}
                <Link href="/auth/register/admin">Administrator</Link> */}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
}
