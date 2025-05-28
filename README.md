# Loan Manager Application

A comprehensive MERN stack application for managing loan applications, approvals, and repayments.

## Features

### User Features
- User registration and authentication with JWT
- Apply for loans with customizable amounts and tenures
- Track loan application status
- View loan repayment history
- Withdraw pending loan applications

### Admin Features
- Admin dashboard with analytics and statistics
- Process (approve/reject) loan applications
- Record loan repayments
- View all loans and their statuses
- Monitor monthly loan trends and repayment statistics

## Technology Stack

### Frontend
- React 18 with React Router v7
- Vite for fast development and building
- Chart.js for data visualization
- JWT authentication with cookies
- Modern React Hooks and functional components

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT for secure authentication
- RESTful API architecture
- Role-based access control (user/admin)

## Data Models

### User Model
- Authentication details (username, email, password)
- Role-based access (user/admin)
- Activity tracking (last login)

### Loan Model
- Loan application details (amount, tenure, reason)
- Status tracking (Pending, Approved, Rejected, Completed)
- Repayment history with timestamps
- Admin processing information

### Notification Model
- User notifications for loan status changes
- Payment confirmations
- System alerts

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository
```
git clone <repository-url>
```

2. Install dependencies for both client and server
```
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables
Create a `.env` file in the server directory with the following variables:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Start the development servers
```
# Start the backend server
cd server
npm run dev

# Start the frontend development server
cd ../client
npm run dev
```

## License
ISC
