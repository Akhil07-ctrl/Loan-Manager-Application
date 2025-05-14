const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Loan = require('./models/Loan');
const Notification = require('./models/Notification');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// POST /register 
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists" });
    }

    // Create new user
    const user = new User({ username, email, password });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error registering user", error: err });
  }
});



// POST /login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username,
        role: user.role 
      }, 
      process.env.JWT_SECRET, 
      {
        expiresIn: '7d',
      }
    );

    res.json({ 
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err });
  }
});

// Update user's last login time
app.post('/api/user/login-time', verifyToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { lastLogin: new Date() });
    res.status(200).json({ message: 'Login time updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get user profile
app.get('/api/user/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Create a new loan application
app.post('/api/loans', verifyToken, async (req, res) => {
  try {
    const { fullName, amount, tenure, reason, employmentAddress } = req.body;
    console.log(req.user.id)
    const loan = new Loan({
      userId: req.user.id,
      fullName,
      amount,
      tenure,
      reason,
      employmentAddress,
      status: 'Pending'
    });
    
    await loan.save();
    res.status(201).json(loan);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error creating loan application', error });
  }
});

// Get user's loans
// Get analytics data for admin dashboard
app.get('/api/admin/analytics', verifyToken, isAdmin, async (req, res) => {
  try {
    // Get current date and date 6 months ago
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Get monthly loans data
    const monthlyLoans = await Loan.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get monthly repayments data from repayments array
    const monthlyRepayments = await Loan.aggregate([
      {
        $unwind: '$repayments'
      },
      {
        $match: {
          'repayments.date': { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$repayments.date' },
            month: { $month: '$repayments.date' }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$repayments.amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get monthly outstanding loans using remainingAmount
    const monthlyOutstandingLoans = await Loan.aggregate([
      {
        $match: {
          status: 'Approved',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalAmount: { $sum: '$remainingAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get loan status distribution
    const loanStatusDistribution = {
      pending: await Loan.countDocuments({ status: 'Pending' }),
      approved: await Loan.countDocuments({ status: 'Approved' }),
      rejected: await Loan.countDocuments({ status: 'Rejected' }),
      completed: await Loan.countDocuments({ status: 'Completed' })
    };

    // Process data into arrays for the last 6 months
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    }).reverse();

    const processedMonthlyLoans = months.map(({ year, month }) => {
      const found = monthlyLoans.find(item => 
        item._id.year === year && item._id.month === month
      );
      return found ? found.count : 0;
    });

    const processedMonthlyRepayments = months.map(({ year, month }) => {
      const found = monthlyRepayments.find(item =>
        item._id.year === year && item._id.month === month
      );
      return found ? found.count : 0;
    });

    const processedMonthlyOutstanding = months.map(({ year, month }) => {
      const found = monthlyOutstandingLoans.find(item =>
        item._id.year === year && item._id.month === month
      );
      return found ? found.totalAmount : 0;
    });

    res.json({
      monthlyLoans: processedMonthlyLoans,
      monthlyRepayments: processedMonthlyRepayments,
      monthlyOutstandingLoans: processedMonthlyOutstanding,
      loanStatusDistribution
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics data', error });
  }
});

// Get user's loans
app.get('/api/loans/user', verifyToken, async (req, res) => {
  try {
    const loans = await Loan.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching loans', error });
  }
});

// Delete/withdraw a loan application (only if it's still pending)
app.delete('/api/loans/:id', verifyToken, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    // Check if the loan belongs to the user
    if (loan.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to withdraw this loan' });
    }
    
    // Only allow withdrawal if the loan is still pending
    if (loan.status !== 'Pending') {
      return res.status(400).json({ message: 'Cannot withdraw a loan that has already been processed' });
    }
    
    await Loan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Loan application withdrawn successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error withdrawing loan application', error });
  }
});

// ADMIN ROUTES

// Get dashboard statistics
// Process (approve/reject) a loan
app.post('/api/loans/:id/process', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be approve or reject.' });
    }

    const loan = await Loan.findById(id);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status !== 'Pending') {
      return res.status(400).json({ message: 'Can only process pending loans' });
    }

    loan.status = action === 'approve' ? 'Approved' : 'Rejected';
    loan.notes = notes;
    loan.dateProcessed = new Date();
    loan.processedBy = req.user.id;

    // If approved, set the initial remaining amount
    if (action === 'approve') {
      loan.remainingAmount = loan.amount;
    }

    // Create notification for loan status change
    await Notification.create({
      userId: loan.userId,
      title: `Loan ${action === 'approve' ? 'Approved' : 'Rejected'}`,
      message: `Your loan application for $${loan.amount} has been ${action === 'approve' ? 'approved' : 'rejected'}${notes ? `: ${notes}` : ''}`,
      type: 'loan_status',
      relatedLoan: loan._id
    });

    await loan.save();
    res.json(loan);
  } catch (error) {
    console.error('Error processing loan:', error);
    res.status(500).json({ message: 'Error processing loan', error });
  }
});

// Record a loan repayment
app.post('/api/loans/:id/repayment', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const loan = await Loan.findById(id);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status !== 'Approved') {
      return res.status(400).json({ message: 'Can only accept payments for approved loans' });
    }

    if (amount <= 0 || amount > loan.remainingAmount) {
      return res.status(400).json({ 
        message: 'Invalid payment amount. Must be greater than 0 and less than or equal to remaining amount' 
      });
    }

    // Add the repayment record
    loan.repayments.push({
      amount,
      date: new Date(),
      processedBy: req.user.id
    });

    // Update remaining amount
    loan.remainingAmount -= amount;
    loan.lastPaymentDate = new Date();

    // Check if loan is fully paid
    if (loan.remainingAmount === 0) {
      loan.status = 'Completed';
      
      // Create notification for loan completion
      await Notification.create({
        userId: loan.userId,
        title: 'Loan Completed',
        message: `Congratulations! Your loan of $${loan.amount} has been fully repaid.`,
        type: 'loan_status',
        relatedLoan: loan._id
      });
    } else {
      // Create notification for payment received
      await Notification.create({
        userId: loan.userId,
        title: 'Payment Received',
        message: `Payment of $${amount} received. Remaining balance: $${loan.remainingAmount}`,
        type: 'payment',
        relatedLoan: loan._id
      });
    }

    await loan.save();
    res.json(loan);
  } catch (error) {
    console.error('Error recording repayment:', error);
    res.status(500).json({ message: 'Error recording repayment', error });
  }
});

// Get loan details with repayment history
app.get('/api/loans/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const loan = await Loan.findById(id)
      .populate('userId', 'username email')
      .populate('processedBy', 'username')
      .populate('repayments.processedBy', 'username');

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Only allow admin or the loan owner to view details
    if (req.user.role !== 'admin' && loan.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(loan);
  } catch (error) {
    console.error('Error fetching loan details:', error);
    res.status(500).json({ message: 'Error fetching loan details', error });
  }
});

// Get user's notifications
app.get('/api/notifications', verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('relatedLoan', 'amount status')
      .limit(50);

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications', error });
  }
});

// Mark notifications as read
app.post('/api/notifications/read', verifyToken, async (req, res) => {
  try {
    const { notificationIds } = req.body;

    await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        userId: req.user.id
      },
      { read: true }
    );

    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ message: 'Error marking notifications as read', error });
  }
});

// Get unread notification count
app.get('/api/notifications/unread/count', verifyToken, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user.id,
      read: false
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Error fetching unread count', error });
  }
});

app.get('/api/admin/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalLoans = await Loan.countDocuments();
    const pendingLoans = await Loan.countDocuments({ status: 'Pending' });
    const approvedLoans = await Loan.countDocuments({ status: 'Approved' });
    const rejectedLoans = await Loan.countDocuments({ status: 'Rejected' });
    
    // Calculate total cash disbursed
    const approvedLoansData = await Loan.find({ status: 'Approved' });
    const totalCashDisbursed = approvedLoansData.reduce((total, loan) => total + loan.amount, 0);
    
    // Get recent loans
    const recentLoans = await Loan.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'username email');
    
    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-password');
    
    res.json({
      activeUsers,
      totalLoans,
      pendingLoans,
      approvedLoans,
      rejectedLoans,
      totalCashDisbursed,
      recentLoans,
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin statistics', error });
  }
});

// Get all loans (admin)
app.get('/api/admin/loans', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const loans = await Loan.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'username email');
    
    const total = await Loan.countDocuments(query);
    
    res.json({
      loans,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching loans', error });
  }
});

// Get all users (admin)
app.get('/api/admin/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password');
    
    const total = await User.countDocuments();
    
    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

// Update loan status (admin)
app.patch('/api/admin/loans/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const loan = await Loan.findById(id);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    loan.status = status;
    loan.notes = notes;
    loan.dateProcessed = new Date();
    loan.processedBy = req.user.id;
    
    await loan.save();
    
    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: 'Error updating loan', error });
  }
});

// Create admin user (for initial setup)
app.post('/api/create-admin', async (req, res) => {
  const { username, email, password, adminSecret } = req.body;

  // Check admin secret (should match environment variable)
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ message: "Invalid admin secret" });
  }

  try {
    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists" });
    }

    // Create new admin user
    const user = new User({ 
      username, 
      email, 
      password,
      role: 'admin'
    });
    await user.save();

    res.status(201).json({ message: "Admin user created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error creating admin user", error: err });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
