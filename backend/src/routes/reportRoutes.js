const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const multer = require('multer'); // For file uploads
const path = require('path');

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'luct_reporting'
});

// Multer setup for file uploads (store in 'uploads' folder)
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Middleware for authentication (placeholder - replace with JWT later)
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
  // Add token verification logic here (e.g., using jwt.verify)
  next();
};

// OLD API to submit a lecturer report (keep for compatibility)
router.post('/submit-report', authenticateToken, (req, res) => {
  const {
    faculty_id, class_id, week, lecture_date, course_id, lecturer_id,
    students_present, venue, scheduled_time, topic_taught,
    learning_outcomes, recommendations
  } = req.body;

  const query = `
    INSERT INTO reports (
      faculty_id, class_id, week, lecture_date, course_id, lecturer_id,
      students_present, venue, scheduled_time, topic_taught,
      learning_outcomes, recommendations, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())
  `;

  db.query(query, [
    faculty_id, class_id, week, lecture_date, course_id, lecturer_id,
    students_present, venue, scheduled_time, topic_taught,
    learning_outcomes, recommendations
  ], (err, result) => {
    if (err) {
      return res.status(500).json({ error: `Failed to submit report: ${err.message}` });
    }
    res.status(201).json({ message: 'Report submitted successfully', id: result.insertId });
  });
});

// Enhanced report submission with file upload
router.post('/submit-enhanced-report', authenticateToken, upload.single('supporting_docs'), (req, res) => {
  const {
    faculty_name, class_name, week, lecture_date, course_name, course_code,
    lecturer_name, students_present, total_registered_students, venue,
    scheduled_time, topic_taught, learning_outcomes, recommendations, lecturer_id
  } = req.body;
  const supportingDocs = req.file ? req.file.path : null;

  const query = `
    INSERT INTO reports (
      faculty_name, class_name, week, lecture_date, course_name, course_code,
      lecturer_name, students_present, total_registered_students, venue,
      scheduled_time, topic_taught, learning_outcomes, recommendations,
      supporting_docs, lecturer_id, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())
  `;

  db.query(query, [
    faculty_name, class_name, week, lecture_date, course_name, course_code,
    lecturer_name, students_present, total_registered_students, venue,
    scheduled_time, topic_taught, learning_outcomes, recommendations,
    supportingDocs, lecturer_id
  ], (err, result) => {
    if (err) {
      return res.status(500).json({ error: `Failed to submit enhanced report: ${err.message}` });
    }
    res.status(201).json({ message: 'Enhanced report submitted successfully', id: result.insertId });
  });
});

// Fetch reports with filtering and pagination
router.get('/reports', authenticateToken, (req, res) => {
  const { lecturer_id, faculty, program, date, course, status, page = 1, limit = 5 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT r.*, u.fullName as lecturer_name
    FROM reports r
    LEFT JOIN users u ON r.lecturer_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (lecturer_id) {
    query += ' AND r.lecturer_id = ?';
    params.push(lecturer_id);
  }
  if (faculty) {
    query += ' AND r.faculty_name LIKE ?';
    params.push(`%${faculty}%`);
  }
  if (program) {
    query += ' AND r.course_code LIKE ?';
    params.push(`%${program}%`);
  }
  if (date) {
    query += ' AND DATE(r.lecture_date) = ?';
    params.push(date);
  }
  if (course) {
    query += ' AND r.course_name LIKE ?';
    params.push(`%${course}%`);
  }
  if (status) {
    query += ' AND r.status = ?';
    params.push(status);
  }

  query += ' ORDER BY r.lecture_date DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: `Failed to fetch reports: ${err.message}` });
    }

    const countQuery = 'SELECT COUNT(*) as total FROM reports WHERE 1=1' + query.split('WHERE 1=1')[1].split('ORDER BY')[0];
    db.query(countQuery, params.slice(0, -2), (err, count) => {
      if (err) {
        return res.status(500).json({ error: `Failed to count reports: ${err.message}` });
      }
      res.json({ reports: results, total: count[0].total, page: parseInt(page), limit: parseInt(limit) });
    });
  });
});

// Add feedback to a report
router.post('/reports/feedback', authenticateToken, (req, res) => {
  const { report_id, feedback, role } = req.body;

  if (!report_id || !feedback) {
    return res.status(400).json({ error: 'Report ID and feedback are required' });
  }

  const query = 'UPDATE reports SET feedback = ?, feedback_by = ?, feedback_at = NOW() WHERE id = ?';
  db.query(query, [feedback, role, report_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: `Failed to add feedback: ${err.message}` });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json({ message: 'Feedback added successfully' });
  });
});

// Approve or reject a report
router.post('/reports/approve', authenticateToken, (req, res) => {
  const { report_id, status, role } = req.body;

  if (!report_id || !['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Report ID and valid status (Approved/Rejected) are required' });
  }

  const query = 'UPDATE reports SET status = ?, approved_by = ?, approved_at = NOW() WHERE id = ?';
  db.query(query, [status, role, report_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: `Failed to update status: ${err.message}` });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json({ message: 'Report status updated successfully' });
  });
});

module.exports = router;