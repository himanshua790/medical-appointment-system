const axios = require('axios');
const fs = require('fs');

// Base URL for API
const API_URL = 'http://localhost:5000/api';

// Store all credentials and test data
const testData = {
  admin: { username: 'admin1', email: 'admin1@example.com', password: 'Admin123!' },
  users: [
    { username: 'user1', email: 'user1@example.com', password: 'User123!' },
    { username: 'user2', email: 'user2@example.com', password: 'User123!' }
  ],
  doctors: [
    { username: 'doctor1', email: 'doctor1@example.com', password: 'Doctor123!' },
    { username: 'doctor2', email: 'doctor2@example.com', password: 'Doctor123!' }
  ],
  additionalDoctors: [],
  tokens: {},
  doctorProfiles: []
};

// Specialties for doctors
const specialties = [
  'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology', 'Neurology',
  'Obstetrics and Gynecology', 'Oncology', 'Ophthalmology', 'Orthopedics', 'Pediatrics',
  'Psychiatry', 'Pulmonology', 'Radiology', 'Rheumatology', 'Urology'
];

// Generate 20 additional doctors with unique usernames and emails
for (let i = 3; i <= 22; i++) {
  testData.additionalDoctors.push({
    username: `doctor${i}`,
    email: `doctor${i}@example.com`,
    password: 'Doctor123!',
    specialty: specialties[Math.floor(Math.random() * specialties.length)]
  });
}

// Helper function to register a user
async function registerUser(userData) {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    console.log(`Registered ${userData.role || 'user'}: ${userData.username}`);
    return response.data;
  } catch (error) {
    console.error(`Error registering ${userData.username}:`, error.response?.data || error.message);
    throw error;
  }
}

// Helper function to login a user
async function loginUser(credentials) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: credentials.email,
      password: credentials.password
    });
    console.log(`Logged in as ${credentials.username}`);
    return response.data;
  } catch (error) {
    console.error(`Error logging in as ${credentials.username}:`, error.response?.data || error.message);
    throw error;
  }
}

// Helper function to create a doctor profile
async function createDoctorProfile(doctorData, token) {
  try {
    const response = await axios.post(
      `${API_URL}/doctors`,
      doctorData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`Created doctor profile for: ${doctorData.name}`);
    return response.data;
  } catch (error) {
    console.error(`Error creating doctor profile for ${doctorData.name}:`, error.response?.data || error.message);
    throw error;
  }
}

// Helper function to update doctor availability
async function updateDoctorAvailability(doctorId, availabilityData, token) {
  try {
    const response = await axios.put(
      `${API_URL}/doctors/${doctorId}`,
      availabilityData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`Updated availability for doctor ID: ${doctorId}`);
    return response.data;
  } catch (error) {
    console.error(`Error updating availability for doctor ID ${doctorId}:`, error.response?.data || error.message);
    throw error;
  }
}

// Helper function to create an appointment
async function createAppointment(appointmentData, token) {
  try {
    const response = await axios.post(
      `${API_URL}/appointments`,
      appointmentData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`Created appointment at ${new Date(appointmentData.dateTime).toLocaleString()}`);
    return response.data;
  } catch (error) {
    console.error(`Error creating appointment:`, error.response?.data || error.message);
    throw error;
  }
}

// Generate random working hours for doctors
function generateWorkingHours() {
  const workingHours = [];
  
  // Generate working hours for weekdays (Monday to Friday)
  for (let day = 1; day <= 5; day++) {
    workingHours.push({
      dayOfWeek: day,
      startTime: '09:00',
      endTime: '17:00'
    });
  }
  
  return workingHours;
}

// Generate random unavailable times for doctors (e.g., lunch breaks, meetings)
function generateUnavailableTimes() {
  const unavailableTimes = [];
  const now = new Date();
  
  // Create unavailable times for the next 30 days
  for (let i = 0; i < 10; i++) {
    const day = new Date(now);
    day.setDate(day.getDate() + Math.floor(Math.random() * 30));
    
    // Set lunch break (12:00 - 13:00)
    if (day.getDay() >= 1 && day.getDay() <= 5) { // Weekdays only
      const startDateTime = new Date(day);
      startDateTime.setHours(12, 0, 0, 0);
      
      const endDateTime = new Date(day);
      endDateTime.setHours(13, 0, 0, 0);
      
      unavailableTimes.push({
        startDateTime,
        endDateTime,
        reason: 'Lunch break'
      });
    }
  }
  
  return unavailableTimes;
}

// Generate appointment times
function generateAppointmentTime(doctorId, token) {
  return new Promise(async (resolve, reject) => {
    try {
      // Get doctor's availability
      const now = new Date();
      const futureDate = new Date(now);
      futureDate.setDate(futureDate.getDate() + 5); // Check 5 days from now
      
      // Format date as YYYY-MM-DD
      const formattedDate = futureDate.toISOString().split('T')[0];
      
      const response = await axios.get(
        `${API_URL}/doctors/${doctorId}/availability?date=${formattedDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const availableSlots = response.data.data.filter(slot => slot.isAvailable);
      
      if (availableSlots.length === 0) {
        return resolve(null);
      }
      
      // Get a random available slot
      const slot = availableSlots[Math.floor(Math.random() * availableSlots.length)];
      
      resolve({
        dateTime: slot.start,
        endTime: slot.end
      });
    } catch (error) {
      console.error(`Error getting availability for doctor ${doctorId}:`, error.response?.data || error.message);
      reject(error);
    }
  });
}

// Main function to run the workflow
async function runWorkflow() {
  try {
    // Step 1: Register admin
    await registerUser({
      ...testData.admin,
      role: 'admin'
    });
    
    // Step 2: Register users
    for (const user of testData.users) {
      await registerUser({
        ...user,
        role: 'patient'
      });
    }
    
    // Step 3: Register doctors
    for (const doctor of testData.doctors) {
      await registerUser({
        ...doctor,
        role: 'doctor'
      });
    }
    
    // Step 4: Register additional doctors
    for (const doctor of testData.additionalDoctors) {
      await registerUser({
        ...doctor,
        role: 'doctor'
      });
    }
    
    // Step 5: Login as admin to get token
    const adminAuth = await loginUser(testData.admin);
    testData.tokens.admin = adminAuth.token;
    
    // Step 6: Create doctor profiles for all doctors
    const allDoctors = [...testData.doctors, ...testData.additionalDoctors];
    
    for (let i = 0; i < allDoctors.length; i++) {
      const doctor = allDoctors[i];
      const doctorProfile = {
        userId: (await loginUser(doctor)).user._id,
        name: `Dr. ${doctor.username.charAt(0).toUpperCase() + doctor.username.slice(1)}`,
        specialty: doctor.specialty || specialties[i % specialties.length],
        bio: `Experienced doctor specializing in ${doctor.specialty || specialties[i % specialties.length]}.`,
        workingHours: generateWorkingHours(),
        unavailableTimes: generateUnavailableTimes()
      };
      
      const createdProfile = await createDoctorProfile(doctorProfile, testData.tokens.admin);
      testData.doctorProfiles.push(createdProfile.data);
    }
    
    // Step 7: Login as users to get tokens
    for (let i = 0; i < testData.users.length; i++) {
      const userAuth = await loginUser(testData.users[i]);
      testData.tokens[`user${i+1}`] = userAuth.token;
    }
    
    // Step 8: Create appointments for users
    for (let i = 0; i < testData.users.length; i++) {
      // Each user makes 2 appointments with different doctors
      for (let j = 0; j < 2; j++) {
        const doctorProfile = testData.doctorProfiles[Math.floor(Math.random() * testData.doctorProfiles.length)];
        
        const appointmentTime = await generateAppointmentTime(doctorProfile._id, testData.tokens[`user${i+1}`]);
        
        if (appointmentTime) {
          const appointmentData = {
            doctorId: doctorProfile._id,
            dateTime: appointmentTime.dateTime,
            endTime: appointmentTime.endTime,
            reasonForVisit: `Routine checkup ${j+1}`,
            notes: 'This is a test appointment'
          };
          
          await createAppointment(appointmentData, testData.tokens[`user${i+1}`]);
        }
      }
    }
    
    // Save the test data to a file
    fs.writeFileSync(
      'test-accounts.json', 
      JSON.stringify({
        admin: testData.admin,
        users: testData.users,
        doctors: [...testData.doctors, ...testData.additionalDoctors.slice(0, 5)], // Include only first 5 additional doctors
        message: 'Full list of 20+ doctors not shown here for brevity'
      }, null, 2)
    );
    
    console.log('Test accounts created and saved to test-accounts.json');
    console.log('Security testing and workflow recommendations:');
    console.log('1. JWT tokens have no refresh mechanism - implement token refresh for better security');
    console.log('2. Password policy should be enforced (complexity, length, etc.)');
    console.log('3. Consider adding rate limiting to prevent brute force attacks');
    console.log('4. Add CSRF protection for production');
    console.log('5. Implement email verification for new accounts');
    console.log('6. Add two-factor authentication option for sensitive operations');
    console.log('7. Consider more granular permissions within user roles');
    console.log('8. Audit logging should be implemented for sensitive operations');
    console.log('9. Implement proper error logging that doesn\'t leak sensitive information');
    console.log('10. Ensure proper CORS configuration in production');
    
  } catch (error) {
    console.error('Workflow error:', error);
  }
}

// Run the workflow
runWorkflow(); 