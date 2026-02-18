# 🚀 CareerHub - Your Gateway to Career Opportunities

A **fully functional** modern job portal that connects job seekers with employers using **MongoDB** and **Express.js** backend.

> **Fast. Secure. Reliable.** Your career starts here! 💼

---

## ✨ Features

✅ **User Authentication** (Register/Login with JWT & Secure Password Hashing)  
✅ **Profile Management** (Separate profiles for Job Seekers & Employers)  
✅ **Job Posting** (Employers can post and manage job listings)  
✅ **Job Applications** (Track and manage applications)  
✅ **Professional Dashboard** (View opportunities, applications & profile)  
✅ **Password Recovery** (Forgot/Reset password functionality)  
✅ **Resume Upload** (Job seekers can upload resumes)  
✅ **Profile Photo Upload** (Professional profile pictures)  
✅ **Responsive Design** (Works on all devices)  
✅ **Modern UI** (Advanced styling with gradients & animations)  
✅ **MongoDB Database** (Reliable and scalable)  

---

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - Modern UI library
- **React Router 6** - Navigation & routing
- **Axios** - HTTP client for API calls
- **Lucide React** - Icon library
- **Recharts** - Data visualization
- **CSS3** - Beautiful styling with animations

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - Document database
- **Mongoose** - ODM for MongoDB
- **bcryptjs** - Secure password hashing
- **JWT** - Secure authentication tokens
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variable management

---

## 📦 Installation

### Prerequisites
- **Node.js** v14+ ([Download](https://nodejs.org/))
- **npm** or **yarn** (comes with Node.js)
- **MongoDB** ([Local](https://www.mongodb.com/try/download/community) or [Cloud Atlas](https://www.mongodb.com/cloud/atlas))
- **Git** (optional, for cloning)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/nikhil6393/job-listing-portal.git
cd job-listing-portal

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd server
npm install
cd ..

# 4. Configure environment variables (see below)
# 5. Start the application (see Running section)
```

---

## ⚙️ Configuration

### 1. MongoDB Setup

**Option A: Using MongoDB Atlas (Cloud - Recommended)**
```
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account & sign in
3. Create a new project
4. Create a free M0 cluster
5. Add IP address to network access (0.0.0.0 for development)
6. Create database user with username & password
7. Get connection string: "Connect" → "Drivers" → copy connection string
8. Replace <username>, <password>, and <cluster> in the string
```

**Option B: Using Local MongoDB**
```
1. Install MongoDB Community Edition
2. Start MongoDB service (Windows: net start MongoDB)
3. Connection string: mongodb://localhost:27017/jobportal
```

### 2. Backend Configuration

Create `server/.env` file:
```env
# MongoDB connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobportal

# JWT secret key (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server port
PORT=5000

# Node environment
NODE_ENV=development
```

### 3. Frontend Configuration

Create `.env.local` file in the root directory:
```env
# Backend API URL
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🚀 Running the Application

### Terminal 1: Start Backend Server

```bash
cd server
npm start
```

**Expected output:**
```
✓ MongoDB connected successfully
✓ Database: jobportal
✓ Server running on http://localhost:5000
```

### Terminal 2: Start Frontend Application

```bash
npm start
```

**App opens at:** `http://localhost:3000`

> The frontend will automatically open in your default browser with hot-reload enabled.

---

## 📱 How to Use

### 1. **Home Page**
- Welcome screen with navigation
- "Sign Up" or "Login" buttons
- Clear call-to-action for Job Seekers & Employers

### 2. **Register**
- Fill in: Email, Name, Password, Account Type
- Choose role: **Job Seeker** or **Employer**
- Password validation & confirmation
- Click "Create Account"

### 3. **Login**
- Enter registered email and password
- Secure JWT authentication
- Session persists until logout

### 4. **Job Seeker Dashboard**
- **Profile Management**: Upload photo, update bio, skills
- **Resume Upload**: Store and manage resumes
- **Browse Jobs**: View job listings from employers
- **Apply for Jobs**: Submit applications to positions
- **Track Applications**: View status of applications
- **Job Details**: View complete job descriptions

### 5. **Employer Dashboard**
- **Company Profile**: Set up employer profile
- **Post Jobs**: Create new job listings
- **Manage Listings**: Edit or delete job posts
- **View Applications**: See applicants for posted jobs
- **Track Candidates**: Monitor application progress

### 6. **Password Recovery**
- Click "Forgot Password" on login page
- Enter registered email
- Receive reset instructions
- Create new secure password

### 7. **Logout**
- Click logout button in dashboard
- Session terminates securely
- Redirected to home page

---

## 🗄️ Database Structure

### Users Collection
```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  displayName: "John Doe",
  password: "hashed_with_bcryptjs",
  userType: "jobseeker",        // "jobseeker" or "employer"
  phone: "+1234567890",
  bio: "Professional summary",
  profilePhoto: "url_or_base64",
  createdAt: ISODate("2024-01-18"),
  updatedAt: ISODate("2024-01-18")
}
```

### Jobs Collection
```javascript
{
  _id: ObjectId,
  title: "Senior Developer",
  description: "Job description",
  company: "Company Name",
  location: "City, Country",
  salary: "50000-70000",
  jobType: "Full-time",        // "Full-time", "Part-time", "Contract"
  postedBy: ObjectId,          // Reference to user
  createdAt: ISODate("2024-01-18"),
  applicants: [ObjectId]       // Array of user IDs
}
```

### Applications Collection
```javascript
{
  _id: ObjectId,
  jobId: ObjectId,             // Reference to job
  applicantId: ObjectId,       // Reference to user (job seeker)
  resume: "url_or_base64",
  status: "pending",           // "pending", "accepted", "rejected"
  appliedAt: ISODate("2024-01-18")
}
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT token |
| GET | `/api/auth/current-user` | Get logged-in user (requires token) |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |

### Profile Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile/me` | Get current user profile |
| PUT | `/api/profile/update` | Update profile (requires token) |
| POST | `/api/profile/upload-photo` | Upload profile photo |
| POST | `/api/profile/upload-resume` | Upload resume |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | Get all job listings |
| GET | `/api/jobs/:id` | Get job details |
| POST | `/api/jobs/create` | Post new job (employer, requires token) |
| PUT | `/api/jobs/:id/edit` | Edit job (requires token) |
| DELETE | `/api/jobs/:id` | Delete job (requires token) |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/apply` | Apply for a job (requires token) |
| GET | `/api/applications/my-applications` | Get user's applications (requires token) |
| GET | `/api/applications/received` | Get applications received (employer, requires token) |
| PUT | `/api/applications/:id/status` | Update application status (requires token) |

---

## 🔐 Authentication Flow

```
1. User fills registration form with email & password
2. Password is hashed using bcryptjs
3. User data stored in MongoDB
4. On login: credentials validated against stored hash
5. JWT token generated and sent to frontend
6. Token stored in browser localStorage
7. Token automatically sent with each API request
8. Backend verifies token for protected routes
9. Invalid/expired tokens return 401 Unauthorized
```

---

## 📁 Project Structure

```
job-listing-portal/
│
├── 📂 server/                              # Express.js Backend
│   ├── server.js                          # Main server & routes
│   ├── package.json                       # Backend dependencies
│   ├── .env                               # Environment config
│   └── test-connection.js                 # MongoDB connection test
│
├── 📂 src/                                # React Frontend
│   ├── App.js                             # Main app component
│   ├── index.js                           # Entry point
│   │
│   ├── 📂 pages/                          # Page components
│   │   ├── Home.js
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Dashboard.js
│   │   ├── ProfessionalDashboard.js
│   │   ├── ForgotPassword.js
│   │   ├── ResetPassword.js
│   │   └── 📂 auth/, dashboard/, jobs/    # Sub-route pages
│   │
│   ├── 📂 components/                     # Reusable components
│   │   ├── JobList.js
│   │   ├── JobPost.js
│   │   ├── JobDetailsModal.js
│   │   ├── JobApplications.js
│   │   ├── EmployerProfileForm.js
│   │   ├── JobSeekerProfileForm.js
│   │   ├── ProfilePhotoUpload.js
│   │   ├── ResumeUpload.js
│   │   ├── CareerHubLogo.js
│   │   └── 📂 features/                   # Feature-specific components
│   │
│   ├── 📂 services/                       # API & business logic
│   │   ├── mongoAuthService.js            # MongoDB authentication
│   │   ├── authService.js                 # Auth utilities
│   │   ├── jobService.js                  # Job operations
│   │   ├── profileService.js              # Profile management
│   │   ├── validationService.js           # Form validation
│   │   └── profileHelperService.js        # Helper functions
│   │
│   ├── 📂 api/                            # API configuration
│   │   └── apiClient.js                   # Axios instance setup
│   │
│   ├── 📂 config/                         # App configuration
│   │   └── api.config.js                  # API endpoints
│   │
│   ├── 📂 constants/                      # App constants
│   │   └── app.constants.js               # Static values
│   │
│   ├── 📂 utils/                          # Utility functions
│   │   ├── date.utils.js
│   │   ├── error.utils.js
│   │   ├── storage.utils.js
│   │   ├── validation.utils.js
│   │   └── index.js
│   │
│   ├── 📂 styles/                         # CSS files
│   │   ├── App.css
│   │   ├── Auth.css
│   │   ├── Dashboard.css
│   │   ├── Home.css
│   │   ├── JobList.css
│   │   ├── JobPost.css
│   │   ├── JobApplications.css
│   │   ├── JobDetailsModal.css
│   │   ├── ProfilePhotoUpload.css
│   │   ├── ProfessionalDashboard.css
│   │   └── 📂 base/, components/, utilities/
│   │
│   └── 📂 assets/                         # Images & icons
│       ├── 📂 icons/
│       └── 📂 images/
│
├── 📂 public/                              # Static files
│   ├── index.html
│   └── 📂 images/
│
├── .gitignore
├── .env.local                             # Frontend env variables
├── package.json                           # Frontend dependencies
├── README.md                              # This file
└── .kombai                                # Kombai AI config (optional)
```

---

## 🧪 Testing the Application

### Test User Accounts

**Job Seeker Account:**
```
Email: jobseeker@test.com
Password: Test@12345
Name: Test Job Seeker
```

**Employer Account:**
```
Email: employer@test.com
Password: Test@12345
Company: Test Company
```

### Test Workflows

1. **Registration Flow**
   - Go to Register page
   - Fill all fields with valid data
   - Select user type (Job Seeker/Employer)
   - Submit and verify email
   
2. **Login Flow**
   - Go to Login page
   - Enter credentials
   - Verify redirect to dashboard
   
3. **Job Posting (Employer)**
   - Login as employer
   - Go to "Post Job"
   - Fill job details
   - Submit listing
   
4. **Job Application (Job Seeker)**
   - Login as job seeker
   - Browse jobs
   - Click "Apply"
   - Upload resume
   - View application status

### View in MongoDB

```bash
mongosh
> use jobportal
> db.users.find()                    # View all users
> db.jobs.find()                     # View all jobs
> db.applications.find()             # View applications
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| **MongoDB connection error** | Check connection string in `server/.env`. Verify MongoDB is running. Check IP whitelist in MongoDB Atlas. |
| **Port 5000 in use** | Change `PORT` in `server/.env` to another port (e.g., 5001) |
| **API returns 401 Unauthorized** | Clear localStorage, logout, and login again. Check JWT token expiration. |
| **Module not found errors** | Run `npm install` in both root and `server/` directories. |
| **"Cannot find module 'dotenv'"** | `cd server && npm install` then `npm start` |
| **Blank page on frontend** | Check `REACT_APP_API_URL` in `.env.local`. Verify backend is running on port 5000. |
| **Cannot upload resume/photo** | Check file size (max 10MB). Verify file format. Check CORS settings. |
| **Login fails silently** | Check MongoDB connection. Verify user exists in database. Check password hash. |
| **CORS errors in console** | Ensure backend CORS is enabled. Check `server/server.js` line 14: `app.use(cors())` |
| **Refresh page causes 404** | Add catch-all route in `App.js` or enable `fallback.html` for React Router. |

### Common Error Messages

**"MongoDB connection timeout"**
- Check internet connection (for Atlas)
- Wait 30-60 seconds and retry
- Verify cluster is deployed in MongoDB Atlas

**"Authentication failed"**
- Check username/password in connection string
- Ensure special characters are URL-encoded in password
- Verify database user has access to the database

**"Module 'react-scripts' not found"**
```bash
npm install
npm start
```

**Port already in use**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

---

## 📚 Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [JWT.io](https://jwt.io/) - JWT tokens explained
- [Mongoose Documentation](https://mongoosejs.com/)

---

## 🚀 Deployment

### Deploy Backend (Node.js + MongoDB)

**Option 1: Render.com** (Recommended for free tier)
```bash
# 1. Push code to GitHub
# 2. Connect Render to GitHub repo
# 3. Create new Web Service
# 4. Set environment variables (MONGODB_URI, JWT_SECRET)
# 5. Deploy
```

**Option 2: Heroku**
```bash
heroku login
heroku create job-listing-portal-server
git push heroku main
heroku config:set MONGODB_URI=your_connection_string
```

**Option 3: Railway.app**
- Connect GitHub repository
- Add MongoDB plugin
- Set environment variables
- Deploy automatically

### Deploy Frontend (React)

**Option 1: Vercel** (Recommended)
```bash
npm install -g vercel
vercel
# Follow prompts and deploy
```

**Option 2: Netlify**
```bash
npm run build
# Drag & drop 'build' folder to Netlify
```

**Option 3: GitHub Pages**
```bash
npm run build
# Push to gh-pages branch
```

---

## 🔒 Security Best Practices

✅ **Never commit `.env` file** - Add to `.gitignore`  
✅ **Use strong JWT_SECRET** - Generate random 32+ character string  
✅ **Enable HTTPS** - Use SSL certificates in production  
✅ **Validate inputs** - Server-side validation on all endpoints  
✅ **Hash passwords** - Always use bcryptjs (never store plain text)  
✅ **Secure headers** - Use helmet.js for Express  
✅ **CORS configuration** - Whitelist specific domains  
✅ **Rate limiting** - Prevent brute force attacks  
✅ **Keep dependencies updated** - `npm audit` regularly  

---

## 📈 Future Enhancements

- ⭐ Job search with filters & sorting
- 🔔 Email notifications for applications
- ⭐ User ratings & reviews system
- 💬 Real-time messaging between users
- 📊 Analytics dashboard for employers
- 🔍 Advanced search with saved jobs
- 📱 Mobile app (React Native)
- 🌍 Multi-language support
- 🎯 Skill-based job recommendations
- 🔐 Two-factor authentication

---

## 💡 Tips & Tricks

### Quick Development Setup
```bash
# Create root .env.local
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env.local

# Create server/.env
echo "MONGODB_URI=mongodb://localhost:27017/jobportal" > server/.env
echo "JWT_SECRET=your_secret_key" >> server/.env
echo "PORT=5000" >> server/.env
```

### View Network Requests
- Open DevTools (F12) → Network tab
- Filter by XHR to see API calls
- Check request/response in Console for errors

### Debug MongoDB Queries
```bash
mongosh
> use jobportal
> db.collection.find().pretty()  # Pretty print results
```

### Hot Reload for Backend
```bash
cd server
npm install --save-dev nodemon
# Update package.json: "dev": "nodemon server.js"
npm run dev  # Auto-restarts on file changes
```

---

## ❓ FAQ

**Q: Can I use MongoDB Compass instead of mongosh?**  
A: Yes! Download MongoDB Compass for a GUI to browse your database.

**Q: How do I reset the database?**  
A: In mongosh: `db.dropDatabase()` - WARNING: This deletes all data!

**Q: Can I use different port for frontend?**  
A: Yes, React will ask on startup if 3000 is busy.

**Q: Is JWT token stored securely?**  
A: localStorage is accessible to JavaScript. Consider httpOnly cookies in production.

**Q: How do I change the database name?**  
A: Edit MONGODB_URI in .env - change `jobportal` to your desired name.

---

## 📞 Support

- **Issues?** Check the [Troubleshooting](#-troubleshooting) section
- **MongoDB Help?** Visit [MongoDB Docs](https://docs.mongodb.com/)
- **React Questions?** Check [React Official Docs](https://react.dev/)
- **Express Help?** See [Express Guide](https://expressjs.com/)

---

## 📝 License

MIT License - Feel free to use this project for personal or commercial purposes.

---

## 👨‍💻 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ⭐ Show Your Support

If this project helped you, please consider giving it a ⭐ on GitHub!

---

**Happy coding! 🚀 Made with ❤️ for aspiring developers and job seekers**


