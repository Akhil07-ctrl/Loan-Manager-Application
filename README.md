# Loan Manager Application

A modern MERN stack application for managing loan applications, approvals, and repayments with real-time status tracking and analytics.

## 🚀 Live Demo

- Frontend: [Vercel Deployment](https://loan-manager-application.vercel.app/)
- Backend: [Render Deployment](https://loan-manager-application.onrender.com)

## 📄 Description

The Loan Manager Application is a comprehensive web application that streamlines the loan management process for both users and administrators. It provides a secure platform for loan applications, status tracking, and analytics. The application is built using modern web technologies and follows RESTful API architecture for scalability and maintainability.

## 🖥️ Features

### User Features
- Secure user registration and login with JWT authentication
- Role-based access control (user/admin)
- Loan application submission with amount and tenure
- Real-time loan status tracking
- Protected routes based on user role
- Admin dashboard access for authorized users
- Session management with cookies
- User profile management

### Admin Features
- Secure admin dashboard access
- Loan application approval/rejection
- User management capabilities
- Loan analytics and statistics
- Notification system for users
- Role-based route protection

## 🛠️ Tech Stack

### Frontend
- React 18 with Vite
- React Router v7 for navigation
- Axios for API communication
- React Icons for UI elements
- React Modal for dialogs
- JWT authentication with cookies
- Chart.js for data visualization
- Date-fns for date handling

### Backend
- Node.js with Express 5.x
- MongoDB with Mongoose 8.x
- JWT for secure authentication
- CORS for cross-origin requests
- dotenv for environment variables
- bcryptjs for password hashing
- nodemon for development
- gh-pages for deployment
- RESTful API architecture
- Role-based access control (user/admin)

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/Akhil07-ctrl/Loan-Manager-Application.git
cd Loan-Manager-Application
```

2. Install dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Configure environment variables
Create a `.env` file in the server directory with the following variables:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

4. Start the servers
```bash
# Start backend server (in server directory)
npm run dev

# Start frontend server (in client directory)
npm run dev
```

### Development Setup
- Frontend runs on http://localhost:5173
- Backend runs on http://localhost:5000
- Uses CORS for cross-origin requests
- JWT authentication with cookies
- Protected routes using role-based access control
- MongoDB connection via MONGO_URI
- Mongoose ODM for database operations
- Models: User, Loan, Notification
- Auto-indexing enabled for performance

4. Start the servers
```bash
# Start backend server (in server directory)
npm run dev

# Start frontend server (in client directory)
npm run dev
```

## 🧰 Available Scripts

### Client
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
```

### Server
```bash
npm run dev     # Start development server
npm run start   # Start production server
npm run test    # Run tests
```

## 📁 Project Structure

```
Loan-Manager-Application/
├── client/           # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── AdminDashboard/  # Admin dashboard components
│   │   │   ├── AdminHeader/     # Admin header component
│   │   │   ├── AdminRoute/      # Admin route protection
│   │   │   ├── Header/          # Main header component
│   │   │   ├── Home/           # Home page components
│   │   │   ├── LoginForm/      # Login form components
│   │   │   ├── NotificationsMenu/ # Notification menu
│   │   │   ├── ProtectedRoute/  # Route protection
│   │   │   └── RegisterForm/    # Registration form
│   │   ├── assets/             # Static assets
│   │   ├── App.jsx            # Main application component
│   │   ├── App.css            # Global styles
│   │   └── index.css          # App styles
│   └── public/               # Public assets
├── server/           # Backend Node.js application
│   ├── models/          # Database models
│   │   ├── User.js      # User model
│   │   ├── Loan.js      # Loan model
│   │   └── Notification.js # Notification model
│   ├── index.js         # Main server file
│   ├── vercel.json      # Vercel deployment configuration
│   ├── package.json     # Dependencies
│   └── .env             # Environment variables
```

## 🧪 Testing

### Frontend Testing
- Manual testing through browser
- React development tools for component inspection
- Network monitoring through browser dev tools
- Visual testing of UI components and forms
- Jest unit tests (coming soon)

### Backend Testing
- Manual API testing through Postman or browser
- Environment variable testing
- Database connection testing
- JWT authentication testing
- Route testing
- Mocha unit tests (coming soon)

### Testing Requirements
- Node.js development environment
- MongoDB database
- Postman or similar API testing tool (for backend)
- Modern web browser with developer tools (for frontend)
- Jest (for frontend testing)
- Mocha/Chai (for backend testing)

### Testing Guidelines
1. Frontend
   - Test all form submissions
   - Verify user authentication flow
   - Check loan application process
   - Test notification system
   - Verify dashboard functionality

2. Backend
   - Test all API endpoints
   - Verify JWT authentication
   - Test database operations
   - Check error handling
   - Verify response formats
   - Test role-based access control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

## 🙋‍♂️ FAQ

**Q: How do I apply for a loan?**
A: After logging in, navigate to the Home page and click the "Apply for Loan" button. Fill out the loan application form with your desired amount, tenure, and purpose.

**Q: How can I track my loan application status?**
A: Once you've submitted a loan application, you can track its status in your dashboard. The status will be updated in real-time as it goes through the approval process.

**Q: What are the loan application requirements?**
A: To apply for a loan, you need to:
- Be registered on the platform
- Provide valid personal information
- Specify loan amount and tenure
- Provide a valid reason for the loan

**Q: Can I withdraw my loan application?**
A: Yes, you can withdraw your loan application if it's still in the pending state. Once a loan is approved or rejected, it cannot be withdrawn.

**Q: How do I receive notifications about my loan?**
A: You will receive notifications about your loan status through the notification system in the application. These notifications will appear in the notifications menu and can be configured in your settings.

**Q: How do I access the admin dashboard?**
A: Only users with admin privileges can access the admin dashboard. Contact the system administrator to request admin access if needed.

**Q: What information can I see in the admin dashboard?**
A: The admin dashboard provides:
- Overview of all loan applications
- Loan approval/rejection controls
- Analytics and statistics
- User management capabilities
- Monthly loan trends

**Q: How do I update my profile information?**
A: After logging in, click on your profile icon and select "Edit Profile" to update your personal information. Changes will be saved automatically.

## 🧑‍💻 Author

- **Kundena Akhil** - [Portfolio](https://portfolio-nine-flax-29.vercel.app/)

## 📜 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.
