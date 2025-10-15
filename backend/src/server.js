require('dotenv').config({ path: 'C:\\Users\\user\\luct-reporting-system\\.env' });

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const xlsx = require('xlsx');

const app = express();

// Middleware - Fixed CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());

// Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '57606583',
  database: process.env.DB_NAME || 'luct_reporting',
  charset: 'utf8mb4'
});

// Pre-loaded Data (your existing data remains the same)
let registeredUsers = [
  // Students
  {
    id: 1001,
    username: 'tankiso',
    email: 'tankiso.ramabolu@student.limkokwing.ac.ls',
    password: 'password123',
    role: 'student',
    fullName: 'Tankiso Ramabolu',
    phone: '+266 1234 5678',
    department: 'FICT',
    studentNumber: 'ST2024001',
    yearOfStudy: 2,
    program: 'BSc in Information Technology',
    employeeId: null,
    qualification: 'BSc IT Student',
    specialization: 'Software Development',
    createdAt: new Date().toISOString()
  },
  {
    id: 1002,
    username: 'tumelo',
    email: 'tumelo.mapa@student.limkokwing.ac.ls',
    password: 'password123',
    role: 'student',
    fullName: 'Tumelo Mapa',
    phone: '+266 1234 5679',
    department: 'FICT',
    studentNumber: 'ST2024002',
    yearOfStudy: 2,
    program: 'BSc in Information Technology',
    employeeId: null,
    qualification: 'BSc IT Student',
    specialization: 'Networking',
    createdAt: new Date().toISOString()
  },
  // ... (rest of your user data remains the same)
];

// Pre-loaded Courses Data (your existing courses data remains the same)
let availableCourses = [
  {
    id: 1,
    code: 'DIWA2110',
    name: 'Web Application Development',
    lecturer_name: 'Dr. Liteboho Molaoa',
    lecturer_id: 2001,
    credits: 3,
    faculty: 'FICT',
    program: 'BSc in Information Technology',
    class_name: 'BSCITY2S1',
    total_registered: 25,
    description: 'Learn modern web development with React and Node.js. Build responsive web applications and understand full-stack development principles.',
    course_outline: 'Course Outline:\n\nWeek 1: Introduction to Web Development\nWeek 2: HTML5 & CSS3 Fundamentals\nWeek 3: JavaScript Basics\nWeek 4: React Introduction\nWeek 5: Node.js Backend Development\nWeek 6: Database Integration\nWeek 7: Project Development\nWeek 8: Deployment and Testing',
    classes: [
      { id: 1, name: 'Morning Class', venue: 'Room 101', time: 'Mon 09:00-11:00' },
      { id: 2, name: 'Afternoon Class', venue: 'Room 102', time: 'Tue 14:00-16:00' }
    ]
  },
  // ... (rest of your courses data remains the same)
];

// Other data storage (your existing data remains the same)
let studentModules = [];
let ratingsData = [];
let attendanceRecords = [];
let classAttendanceRecords = [];
let weeklyTopics = [];
let lecturerReports = [];
let classRepresentatives = [
  { student_id: 1001, course_id: 1, course_code: 'DIWA2110', student_name: 'Tankiso Ramabolu' },
  { student_id: 1002, course_id: 2, course_code: 'BIDC1210', student_name: 'Tumelo Mapa' }
];

// Auto-register some sample modules for testing
studentModules.push(
  {
    id: 1,
    student_id: 1001,
    course_id: 1,
    course_code: 'DIWA2110',
    course_name: 'Web Application Development',
    lecturer_name: 'Dr. Liteboho Molaoa',
    class_time: 'Mon 09:00-11:00',
    venue: 'Room 101',
    course_outline: availableCourses[0].course_outline,
    status: 'registered',
    registration_date: new Date().toISOString()
  }
);

// Database connection with better error handling
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    console.log('Using secure demo mode with pre-loaded data...');
  } else {
    console.log('Connected to MySQL Database');
    initializeDatabase();
  }
});

// Database Initialization (your existing initialization code remains the same)
function initializeDatabase() {
  const createTables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('student', 'lecturer', 'prl', 'pl') NOT NULL,
      full_name VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      department VARCHAR(100),
      student_number VARCHAR(20) UNIQUE,
      year_of_study INT,
      program VARCHAR(100),
      employee_id VARCHAR(20) UNIQUE,
      qualification VARCHAR(100),
      specialization VARCHAR(100),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    // ... (rest of your table creation queries remain the same)
  ];

  createTables.forEach((query) => {
    db.query(query, (err) => {
      if (err) console.error('Table creation error:', err.message);
    });
  });
}

// Database Middleware
app.use((req, res, next) => {
  if (db.state === 'connected') {
    req.db = db;
  } else {
    req.db = {
      query: (sql, params, callback) => {
        if (callback) callback(null, []);
      }
    };
  }
  next();
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Access token required' });
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'luct-secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Role Middleware
const requireRole = (allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

// ==================== HEALTH CHECK ENDPOINT ====================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: db.state === 'connected' ? 'Connected' : 'Demo Mode',
    pre_loaded_data: {
      users: registeredUsers.length,
      courses: availableCourses.length,
      student_modules: studentModules.length,
      lecturer_reports: lecturerReports.length,
      ratings: ratingsData.length
    },
    timestamp: new Date().toISOString()
  });
});

// ==================== AUTHENTICATION ENDPOINTS ====================
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  console.log('Login attempt from frontend:', { username });

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const user = registeredUsers.find(u => u.username === username);
  
  if (!user) {
    console.log('User not found:', username);
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  if (user.password !== password) {
    console.log('Invalid password for user:', username);
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  console.log('Login successful for:', username);

  const userResponse = {
    id: user.id,
    username: user.username,
    role: user.role,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    department: user.department,
    studentNumber: user.studentNumber,
    employeeId: user.employeeId,
    program: user.program
  };

  const token = jwt.sign({ 
    id: user.id, 
    role: user.role,
    username: user.username 
  }, process.env.JWT_SECRET || 'luct-secret', { expiresIn: '24h' });
  
  res.json({ 
    token, 
    user: userResponse,
    message: `Login successful as ${user.role}`
  });
});

// ==================== STUDENT ENDPOINTS ====================
app.get('/api/student/available-courses', authenticateToken, requireRole(['student']), (req, res) => {
  res.json(availableCourses);
});

app.get('/api/student/modules', authenticateToken, requireRole(['student']), (req, res) => {
  const userModules = studentModules.filter(module => module.student_id === req.user.id);
  res.json(userModules);
});

// ==================== LECTURER ENDPOINTS ====================
app.get('/api/lecturer/classes', authenticateToken, requireRole(['lecturer']), (req, res) => {
  const userClasses = availableCourses.filter(course => course.lecturer_id === req.user.id);
  res.json(userClasses);
});

// ==================== PRL ENDPOINTS ====================
app.get('/api/prl/courses', authenticateToken, requireRole(['prl']), (req, res) => {
  res.json(availableCourses);
});

// ==================== PL ENDPOINTS ====================
app.get('/api/pl/courses', authenticateToken, requireRole(['pl']), (req, res) => {
  res.json(availableCourses);
});

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log('==================================================');
  console.log('LUCT Professional University System');
  console.log('==================================================');
  console.log(`Server running on port: ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Database: ${db.state === 'connected' ? 'MySQL Connected' : 'Demo Mode with Pre-loaded Data'}`);
  console.log(`Frontend URL: http://localhost:3000`);
  console.log(`CORS enabled for: http://localhost:3000`);
  console.log('==================================================');
  console.log('Test Login Credentials:');
  console.log('Students: tankiso, tumelo, majara, silase, tumelos');
  console.log('Lecturers: liteboho, palesa, tsekiso, takura, masechaba');
  console.log('PRL: nthatisi');
  console.log('PL: udak');
  console.log('Password for all: password123');
  console.log('==================================================');
});