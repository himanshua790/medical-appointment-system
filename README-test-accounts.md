# Test Accounts and Workflow Testing

This directory contains scripts and data for testing the entire workflow of the medical appointment system.

## Overview

The `test-accounts.js` script populates the database with:
- 1 admin account
- 2 user (patient) accounts
- 22 doctor accounts (with different specialties)
- Working hours for each doctor
- Unavailable times for each doctor
- Sample appointments

## Prerequisites

Before running the script, ensure:
1. The backend server is running at http://localhost:5000
2. MongoDB is running and configured correctly
3. You have Node.js installed

## Installation

Install the required dependencies:

```bash
npm install axios
```

## Usage

1. Run the script:

```bash
node test-accounts.js
```

2. The script will:
   - Create all accounts
   - Set up doctor profiles with specialties, working hours, and unavailable times
   - Create appointments for users
   - Save the test account credentials to `test-accounts.json`

## Test Accounts

The following accounts are created:

### Admin Account
- Username: admin1
- Email: admin1@example.com
- Password: Admin123!

### User Accounts
- Username: user1, user2
- Email: user1@example.com, user2@example.com
- Password: User123!

### Doctor Accounts
- Username: doctor1, doctor2, doctor3, ... doctor22
- Email: doctor1@example.com, doctor2@example.com, ... doctor22@example.com
- Password: Doctor123!

## Workflow Testing

The script tests the entire workflow:
1. User registration and authentication
2. Admin creating and managing doctor profiles
3. Setting doctor availability
4. Patients booking appointments
5. Authentication and authorization for different user roles

## Security Assessment

A comprehensive security assessment is provided in `security-assessment.md`. It covers:
- Authentication and authorization improvements
- API security enhancements
- Data protection recommendations
- Workflow improvement suggestions

## Notes

- If you encounter any errors, check that the backend server is running and accessible
- The test data is for development and testing purposes only 