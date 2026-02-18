const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require('crypto');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase payload limit for profile data
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal';

// Connect to MongoDB with better error handling
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
  .then(() => {
    console.log('✓ MongoDB connected successfully');
    const dbName = mongoURI.includes('@') 
      ? mongoURI.split('/').pop().split('?')[0] 
      : mongoURI.split('/').pop();
    console.log(`✓ Database: ${dbName}`);
  })
  .catch(err => {
    console.error('✗ MongoDB connection error:', err.message);
    console.error('✗ Error details:', err.name);
    
    if (err.message.includes('authentication failed') || err.message.includes('bad auth')) {
      console.error('\n⚠️  AUTHENTICATION ERROR:');
      console.error('   - Check your MongoDB username and password');
      console.error('   - For MongoDB Atlas: Make sure password is URL-encoded if it contains special characters');
      console.error('   - Verify database user has proper permissions');
    } else if (err.message.includes('ECONNREFUSED')) {
      console.error('\n⚠️  CONNECTION REFUSED:');
      console.error('   - MongoDB is not running locally');
      console.error('   - Start MongoDB: net start MongoDB (Windows)');
      console.error('   - Or use MongoDB Atlas cloud database');
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
      console.error('\n⚠️  NETWORK ERROR:');
      console.error('   - Check your internet connection (for Atlas)');
      console.error('   - Verify MongoDB Atlas cluster is running');
      console.error('   - Check IP whitelist in Atlas Network Access');
    }
    
    console.error('\n📝 Connection string format:');
    console.error('   Local: mongodb://localhost:27017/jobportal');
    console.error('   Atlas: mongodb+srv://username:password@cluster.mongodb.net/jobportal');
    console.error('\n💡 Tip: Check server/.env file for MONGODB_URI');
  });

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['jobseeker', 'employer'],
    required: true
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

// Job Seeker Profile Schema
const jobSeekerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  firstName: String,
  lastName: String,
  email: String,
  phoneNumber: String,
  dateOfBirth: Date,
  gender: String,
  currentCity: String,
  state: String,
  zipCode: String,
  country: String,
  address: String,
  headline: String,
  professionalSummary: String,
  experience: Number,
  skills: [String],
  preferredJobTypes: [String],
  preferredLocations: [String],
  salaryExpectation: String,
  willingToRelocate: Boolean,
  openToWork: Boolean,
  resumeUrl: String,
  resumeFileName: String,
  profilePhoto: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Employer Profile Schema
const employerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: String,
  companyType: String,
  industry: String,
  companySize: String,
  foundedYear: Number,
  website: String,
  companyDescription: String,
  contactPersonName: String,
  email: String,
  phoneNumber: String,
  alternatePhone: String,
  officeAddress: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  registrationNumber: String,
  taxId: String,
  profilePhoto: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const JobSeekerProfile = mongoose.model('JobSeekerProfile', jobSeekerProfileSchema);
const EmployerProfile = mongoose.model('EmployerProfile', employerProfileSchema);

// Job Schema
const jobSchema = new mongoose.Schema({
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: { type: String, required: true },
  company: String,
  description: String,
  requirements: [String],
  responsibilities: [String],
  jobType: String,
  workMode: String,
  experience: String,
  salary: String,
  location: String,
  city: String,
  state: String,
  country: String,
  skills: [String],
  benefits: [String],
  applicationDeadline: Date,
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Job = mongoose.model('Job', jobSchema);

// Job Application Schema
const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  jobSeekerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  candidateName: String,
  candidateEmail: String,
  coverLetter: String,
  resume: String,
  status: {
    type: String,
    enum: ['applied', 'reviewed', 'shortlisted', 'rejected', 'selected'],
    default: 'applied'
  },
  appliedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Application = mongoose.model('Application', applicationSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ===== Authentication Routes =====

// Register User
app.post('/api/auth/register', async (req, res) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database connection not available. Please check MongoDB connection.' 
      });
    }

    const { email, password, displayName, userType } = req.body;

    // Validation
    if (!email || !password || !displayName || !userType) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate userType
    if (!['jobseeker', 'employer'].includes(userType)) {
      return res.status(400).json({ error: 'Invalid user type. Must be "jobseeker" or "employer"' });
    }

    // Normalize email (lowercase and trim) - schema already handles lowercase, but ensure consistency
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      email: normalizedEmail,
      displayName: displayName.trim(),
      password: hashedPassword,
      userType
    });

    await newUser.save();

    // Create initial empty profile for the user
    try {
      if (userType === 'jobseeker') {
        await JobSeekerProfile.create({
          userId: newUser._id,
          email: newUser.email
        });
      } else if (userType === 'employer') {
        await EmployerProfile.create({
          userId: newUser._id,
          email: newUser.email
        });
      }
    } catch (profileError) {
      // Log error but don't fail registration
      console.error('Failed to create initial profile:', profileError);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        uid: newUser._id,
        email: newUser.email,
        displayName: newUser.displayName,
        userType: newUser.userType,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ 
      error: error.message || 'Registration failed. Please try again.' 
    });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database connection not available. Please check MongoDB connection.' 
      });
    }

    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Normalize email (lowercase and trim)
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email (email is already lowercase in schema)
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      console.log(`Login attempt failed: User not found for email: ${normalizedEmail}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      console.log(`Login attempt failed: Password mismatch for email: ${normalizedEmail}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`Login successful for user: ${user.email}`);

    res.status(200).json({
      token,
      user: {
        uid: user._id,
        email: user.email,
        displayName: user.displayName,
        userType: user.userType,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Login failed. Please try again.' });
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get Current User
app.get('/api/auth/current-user', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      uid: user._id,
      email: user.email,
      displayName: user.displayName,
      userType: user.userType,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update User Profile
app.put('/api/auth/update-profile', verifyToken, async (req, res) => {
  try {
    const { displayName } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { 
        displayName,
        updatedAt: Date.now()
      },
      { new: true }
    ).select('-password');

    res.status(200).json({
      uid: user._id,
      email: user.email,
      displayName: user.displayName,
      userType: user.userType,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Logout (client-side token removal)
app.post('/api/auth/logout', (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
});

// Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Don't reveal if email exists for security
      return res.status(200).json({ 
        message: 'If an account with this email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token and expiry (1 hour)
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // For now, we'll just log the link. In production, send via email
    console.log(`\n${'='.repeat(60)}`);
    console.log('PASSWORD RESET LINK');
    console.log(`${'='.repeat(60)}`);
    console.log(`Email: ${user.email}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log(`Token: ${resetToken}`);
    console.log(`Expires in: 1 hour`);
    console.log(`${'='.repeat(60)}\n`);

    res.status(200).json({ 
      message: 'If an account with this email exists, a password reset link has been sent. Check your email and console logs for development.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: error.message || 'Failed to process forgot password request' });
  }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Hash the token to find the user
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching reset token and token not expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.updatedAt = Date.now();
    await user.save();

    console.log(`Password reset successfully for user: ${user.email}`);

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: error.message || 'Failed to reset password' });
  }
});

// ===== Profile Routes =====

// Get Job Seeker Profile
app.get('/api/profiles/jobseeker/:userId', verifyToken, async (req, res) => {
  try {
    // Verify user owns this profile
    const userIdStr = req.userId.toString();
    const paramUserIdStr = req.params.userId.toString();
    
    if (userIdStr !== paramUserIdStr) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Convert userId to ObjectId for query
    const userId = new mongoose.Types.ObjectId(req.params.userId);
    const profile = await JobSeekerProfile.findOne({ userId });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Get job seeker profile error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Create or Update Job Seeker Profile
app.post('/api/profiles/jobseeker/:userId', verifyToken, async (req, res) => {
  try {
    // Verify user owns this profile
    const userIdStr = req.userId.toString();
    const paramUserIdStr = req.params.userId.toString();
    
    if (userIdStr !== paramUserIdStr) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Convert userId to ObjectId
    const userId = new mongoose.Types.ObjectId(req.params.userId);
    const profileData = {
      ...req.body,
      userId: userId,
      updatedAt: Date.now()
    };

    const profile = await JobSeekerProfile.findOneAndUpdate(
      { userId: userId },
      profileData,
      { new: true, upsert: true }
    );

    res.status(200).json(profile);
  } catch (error) {
    console.error('Create/update job seeker profile error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update Job Seeker Profile
app.put('/api/profiles/jobseeker/:userId', verifyToken, async (req, res) => {
  try {
    // Verify user owns this profile
    const userIdStr = req.userId.toString();
    const paramUserIdStr = req.params.userId.toString();
    
    if (userIdStr !== paramUserIdStr) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Convert userId to ObjectId
    const userId = new mongoose.Types.ObjectId(req.params.userId);
    const profile = await JobSeekerProfile.findOneAndUpdate(
      { userId: userId },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Update job seeker profile error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete Job Seeker Profile
app.delete('/api/profiles/jobseeker/:userId', verifyToken, async (req, res) => {
  try {
    // Verify user owns this profile
    const userIdStr = req.userId.toString();
    const paramUserIdStr = req.params.userId.toString();
    
    if (userIdStr !== paramUserIdStr) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Convert userId to ObjectId
    const userId = new mongoose.Types.ObjectId(req.params.userId);
    await JobSeekerProfile.findOneAndDelete({ userId: userId });
    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Delete job seeker profile error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Get Employer Profile
app.get('/api/profiles/employer/:userId', verifyToken, async (req, res) => {
  try {
    // Verify user owns this profile
    const userIdStr = req.userId.toString();
    const paramUserIdStr = req.params.userId.toString();
    
    if (userIdStr !== paramUserIdStr) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Convert userId to ObjectId
    const userId = new mongoose.Types.ObjectId(req.params.userId);
    const profile = await EmployerProfile.findOne({ userId });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Get employer profile error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Create or Update Employer Profile
app.post('/api/profiles/employer/:userId', verifyToken, async (req, res) => {
  try {
    // Verify user owns this profile
    const userIdStr = req.userId.toString();
    const paramUserIdStr = req.params.userId.toString();
    
    if (userIdStr !== paramUserIdStr) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Convert userId to ObjectId
    const userId = new mongoose.Types.ObjectId(req.params.userId);
    const profileData = {
      ...req.body,
      userId: userId,
      updatedAt: Date.now()
    };

    const profile = await EmployerProfile.findOneAndUpdate(
      { userId: userId },
      profileData,
      { new: true, upsert: true }
    );

    res.status(200).json(profile);
  } catch (error) {
    console.error('Create/update employer profile error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update Employer Profile
app.put('/api/profiles/employer/:userId', verifyToken, async (req, res) => {
  try {
    // Verify user owns this profile
    const userIdStr = req.userId.toString();
    const paramUserIdStr = req.params.userId.toString();
    
    if (userIdStr !== paramUserIdStr) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Convert userId to ObjectId
    const userId = new mongoose.Types.ObjectId(req.params.userId);
    const profile = await EmployerProfile.findOneAndUpdate(
      { userId: userId },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Update employer profile error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete Employer Profile
app.delete('/api/profiles/employer/:userId', verifyToken, async (req, res) => {
  try {
    // Verify user owns this profile
    const userIdStr = req.userId.toString();
    const paramUserIdStr = req.params.userId.toString();
    
    if (userIdStr !== paramUserIdStr) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Convert userId to ObjectId
    const userId = new mongoose.Types.ObjectId(req.params.userId);
    await EmployerProfile.findOneAndDelete({ userId: userId });
    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Delete employer profile error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// ===== Job Routes =====

// Get all jobs (with optional filters)
app.get('/api/jobs', async (req, res) => {
  try {
    const { jobType, workMode, search, limit = 10 } = req.query;
    
    const query = { status: 'active' };
    
    if (jobType) query.jobType = jobType;
    if (workMode) query.workMode = workMode;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single job by ID
app.get('/api/jobs/:jobId', async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.status(200).json(job);
  } catch (error) {
    console.error('Get job error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Create a new job (Employers only)
app.post('/api/jobs', verifyToken, async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      employerId: req.userId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    const job = new Job(jobData);
    await job.save();
    
    res.status(201).json(job);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a job (Employers only - their own jobs)
app.put('/api/jobs/:jobId', verifyToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Verify ownership
    if (job.employerId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.jobId,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    
    res.status(200).json(updatedJob);
  } catch (error) {
    console.error('Update job error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete a job (Employers only - their own jobs)
app.delete('/api/jobs/:jobId', verifyToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Verify ownership
    if (job.employerId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await Job.findByIdAndDelete(req.params.jobId);
    
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Get jobs posted by employer
app.get('/api/jobs/employer/:employerId', verifyToken, async (req, res) => {
  try {
    const jobs = await Job.find({ employerId: req.params.employerId })
      .sort({ createdAt: -1 });
    
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Get employer jobs error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid employer ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// ===== Job Application Routes =====

// Apply for a job (Job seekers only)
app.post('/api/jobs/:jobId/apply', verifyToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter = '', resume = '' } = req.body;

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobId,
      jobSeekerId: req.userId
    });

    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    // Get job seeker details
    const user = await User.findById(req.userId);
    const jobSeekerProfile = await JobSeekerProfile.findOne({ userId: req.userId });

    const application = new Application({
      jobId,
      jobSeekerId: req.userId,
      employerId: job.employerId,
      candidateName: user.displayName,
      candidateEmail: user.email,
      coverLetter,
      resume: jobSeekerProfile?.resumeUrl || resume,
      status: 'applied'
    });

    await application.save();

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get applications for a job (Employers only - their own jobs)
app.get('/api/jobs/:jobId/applications', verifyToken, async (req, res) => {
  try {
    const { jobId } = req.params;

    // Verify job exists and belongs to employer
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.employerId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const applications = await Application.find({ jobId })
      .populate('jobSeekerId', 'displayName email')
      .sort({ appliedAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's applications (Job seekers only)
app.get('/api/user/applications', verifyToken, async (req, res) => {
  try {
    const applications = await Application.find({ jobSeekerId: req.userId })
      .populate('jobId', 'title company location salary')
      .sort({ appliedAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all applications for employer's jobs (Employers only)
app.get('/api/employer/applications', verifyToken, async (req, res) => {
  try {
    // Get all jobs posted by this employer
    const employerJobs = await Job.find({ employerId: req.userId });
    const jobIds = employerJobs.map(job => job._id);

    // Get all applications for those jobs
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('jobId', 'title company location salary')
      .populate('jobSeekerId', 'displayName email')
      .sort({ appliedAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    console.error('Get employer applications error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get application stats for jobseeker (monthly counts)
app.get('/api/user/application-stats', verifyToken, async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const applications = await Application.find({
      jobSeekerId: req.userId,
      appliedAt: { $gte: sixMonthsAgo }
    });

    // Group by month
    const monthlyStats = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = monthNames[date.getMonth()];
      monthlyStats[monthKey] = {
        name: monthKey,
        applicationSent: 0,
        interviews: 0,
        rejected: 0
      };
    }

    // Count applications by status and month
    applications.forEach(app => {
      const monthKey = monthNames[new Date(app.appliedAt).getMonth()];
      if (monthlyStats[monthKey]) {
        monthlyStats[monthKey].applicationSent++;
        if (app.status === 'shortlisted' || app.status === 'reviewed') {
          monthlyStats[monthKey].interviews++;
        } else if (app.status === 'rejected') {
          monthlyStats[monthKey].rejected++;
        }
      }
    });

    const statsArray = Object.values(monthlyStats);
    res.status(200).json(statsArray);
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get application stats for employer (monthly counts)
app.get('/api/employer/stats', verifyToken, async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Get all jobs posted by employer
    const employerJobs = await Job.find({ employerId: req.userId });
    const jobIds = employerJobs.map(job => job._id);

    // Get applications for those jobs
    const applications = await Application.find({
      jobId: { $in: jobIds },
      appliedAt: { $gte: sixMonthsAgo }
    });

    // Group by month
    const monthlyStats = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = monthNames[date.getMonth()];
      monthlyStats[monthKey] = {
        name: monthKey,
        applicationSent: 0,
        interviews: 0,
        rejected: 0
      };
    }

    // Count applications by status and month
    applications.forEach(app => {
      const monthKey = monthNames[new Date(app.appliedAt).getMonth()];
      if (monthlyStats[monthKey]) {
        monthlyStats[monthKey].applicationSent++;
        if (app.status === 'shortlisted' || app.status === 'reviewed') {
          monthlyStats[monthKey].interviews++;
        } else if (app.status === 'rejected') {
          monthlyStats[monthKey].rejected++;
        }
      }
    });

    const statsArray = Object.values(monthlyStats);
    res.status(200).json(statsArray);
  } catch (error) {
    console.error('Get employer stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update application status (Employers only - their own jobs)
app.put('/api/applications/:applicationId', verifyToken, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['applied', 'reviewed', 'shortlisted', 'rejected', 'selected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get application
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Verify employer owns the job
    if (application.employerId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    application.status = status;
    application.updatedAt = Date.now();
    await application.save();

    res.status(200).json({
      message: 'Application status updated',
      application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  const mongoStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  const isConnected = mongoStatus === 1;
  
  res.status(isConnected ? 200 : 503).json({ 
    status: 'Server is running',
    mongodb: {
      status: mongoStates[mongoStatus] || 'unknown',
      connected: isConnected,
      message: isConnected 
        ? 'MongoDB is connected and ready' 
        : 'MongoDB is not connected. Check server logs for connection errors.'
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});
