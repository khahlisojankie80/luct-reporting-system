import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = ({ userRole, userName, userId, onLogout }) => {
  const [studentModules, setStudentModules] = useState([]);
  const [lecturerClasses, setLecturerClasses] = useState([]);
  const [lecturerReports, setLecturerReports] = useState([]);
  const [prlCourses, setPrlCourses] = useState([]);
  const [prlReports, setPrlReports] = useState([]);
  const [prlMonitoring, setPrlMonitoring] = useState([]);
  const [prlClasses, setPrlClasses] = useState([]);
  const [plCourses, setPlCourses] = useState([]);
  const [plReports, setPlReports] = useState([]);
  const [plMonitoring, setPlMonitoring] = useState([]);
  const [plClasses, setPlClasses] = useState([]);
  const [plLecturers, setPlLecturers] = useState([]);
  const [ratingsSummary, setRatingsSummary] = useState([]);
  const [monitoringData, setMonitoringData] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [classRepresentatives, setClassRepresentatives] = useState([]);
  const [weeklyTopics, setWeeklyTopics] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allSystemCourses, setAllSystemCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({});
  const [ratingData, setRatingData] = useState({
    target_id: '',
    target_type: 'course',
    rating: 0,
    comment: ''
  });
  const [attendanceData, setAttendanceData] = useState({
    selectedCourse: '',
    date: new Date().toISOString().split('T')[0],
    present: true
  });
  const [reportData, setReportData] = useState({
    faculty_name: 'FICT',
    class_name: '',
    week_of_reporting: '',
    date_of_lecture: new Date().toISOString().split('T')[0],
    course_name: '',
    course_code: '',
    actual_students_present: '',
    total_registered_students: '',
    venue: '',
    scheduled_lecture_time: '',
    topic_taught: '',
    learning_outcomes: '',
    recommendations: ''
  });
  const [prlFeedback, setPrlFeedback] = useState({
    report_id: '',
    feedback: ''
  });
  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    lecturer_id: '',
    credits: 3,
    description: '',
    faculty: 'FICT',
    program: 'BSc in Information Technology',
    class_name: 'BSCITY2S1',
    total_registered: 0
  });
  const [isClassRep, setIsClassRep] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showCourseManagement, setShowCourseManagement] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const API_BASE_URL = 'https://luct-reporting-system-osro.onrender.com';

  useEffect(() => {
    if (userRole) {
      loadDashboardData();
      if (userRole === 'pl' || userRole === 'prl') {
        loadSystemData();
      }
    }
  }, [userRole, activeTab]);

  const loadDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      setError('');

      const headers = { 'Authorization': `Bearer ${token}` };

      if (userRole === 'student') {
        const modulesResponse = await fetch(`${API_BASE_URL}/api/student/modules`, { headers });
        if (modulesResponse.ok) {
          const modules = await modulesResponse.json();
          setStudentModules(modules);
        }

        const coursesResponse = await fetch(`${API_BASE_URL}/api/student/available-courses`, { headers });
        if (coursesResponse.ok) {
          const courses = await coursesResponse.json();
          setAvailableCourses(courses);
        }

        const attendanceResponse = await fetch(`${API_BASE_URL}/api/student/attendance`, { headers });
        if (attendanceResponse.ok) {
          const attendance = await attendanceResponse.json();
          setAttendanceRecords(attendance);
        }

        const classRepResponse = await fetch(`${API_BASE_URL}/api/student/classrep-status`, { headers });
        if (classRepResponse.ok) {
          const data = await classRepResponse.json();
          setIsClassRep(data.isClassRep);
          if (data.isClassRep) {
            setClassRepresentatives(data.representatives || []);
          }
        }
      }

      if (userRole === 'lecturer') {
        const classesResponse = await fetch(`${API_BASE_URL}/api/lecturer/classes`, { headers });
        if (classesResponse.ok) {
          const classes = await classesResponse.json();
          setLecturerClasses(classes);
        }

        if (activeTab === 'reports') {
          const reportsResponse = await fetch(`${API_BASE_URL}/api/lecturer/reports`, { headers });
          if (reportsResponse.ok) {
            const reports = await reportsResponse.json();
            setLecturerReports(reports);
          }
        }
      }

      if (userRole === 'prl') {
        const coursesResponse = await fetch(`${API_BASE_URL}/api/prl/courses`, { headers });
        if (coursesResponse.ok) {
          const courses = await coursesResponse.json();
          setPrlCourses(courses);
        }

        if (activeTab === 'reports') {
          const reportsResponse = await fetch(`${API_BASE_URL}/api/prl/reports`, { headers });
          if (reportsResponse.ok) {
            const reports = await reportsResponse.json();
            setPrlReports(reports);
          }
        }

        if (activeTab === 'monitoring') {
          const monitoringResponse = await fetch(`${API_BASE_URL}/api/prl/monitoring`, { headers });
          if (monitoringResponse.ok) {
            const monitoring = await monitoringResponse.json();
            setPrlMonitoring(monitoring);
          }
        }

        if (activeTab === 'classes') {
          const classesResponse = await fetch(`${API_BASE_URL}/api/prl/classes`, { headers });
          if (classesResponse.ok) {
            const classes = await classesResponse.json();
            setPrlClasses(classes);
          }
        }

        if (activeTab === 'rating') {
          const ratingsResponse = await fetch(`${API_BASE_URL}/api/ratings/summary`, { headers });
          if (ratingsResponse.ok) {
            const ratings = await ratingsResponse.json();
            setRatingsSummary(ratings);
          }
        }
      }

      if (userRole === 'pl') {
        const coursesResponse = await fetch(`${API_BASE_URL}/api/pl/courses`, { headers });
        if (coursesResponse.ok) {
          const courses = await coursesResponse.json();
          setPlCourses(courses);
        }

        if (activeTab === 'reports') {
          const reportsResponse = await fetch(`${API_BASE_URL}/api/pl/reports`, { headers });
          if (reportsResponse.ok) {
            const reports = await reportsResponse.json();
            setPlReports(reports);
          }
        }

        if (activeTab === 'monitoring') {
          const monitoringResponse = await fetch(`${API_BASE_URL}/api/pl/monitoring`, { headers });
          if (monitoringResponse.ok) {
            const monitoring = await monitoringResponse.json();
            setPlMonitoring(monitoring);
          }
        }

        if (activeTab === 'classes') {
          const classesResponse = await fetch(`${API_BASE_URL}/api/pl/classes`, { headers });
          if (classesResponse.ok) {
            const classes = await classesResponse.json();
            setPlClasses(classes);
          }
        }

        if (activeTab === 'lecturers') {
          const lecturersResponse = await fetch(`${API_BASE_URL}/api/pl/lecturers`, { headers });
          if (lecturersResponse.ok) {
            const lecturers = await lecturersResponse.json();
            setPlLecturers(lecturers);
          }
        }

        if (activeTab === 'rating') {
          const ratingsResponse = await fetch(`${API_BASE_URL}/api/ratings/summary`, { headers });
          if (ratingsResponse.ok) {
            const ratings = await ratingsResponse.json();
            setRatingsSummary(ratings);
          }
        }
      }

      if (activeTab === 'monitoring' && (userRole === 'student' || userRole === 'lecturer')) {
        const monitoringResponse = await fetch(`${API_BASE_URL}/api/monitoring`, { headers });
        if (monitoringResponse.ok) {
          const monitoring = await monitoringResponse.json();
          setMonitoringData(monitoring);
        }
      }

      if (activeTab === 'rating' && (userRole === 'student' || userRole === 'lecturer')) {
        const ratingsResponse = await fetch(`${API_BASE_URL}/api/ratings`, { headers });
        if (ratingsResponse.ok) {
          // Ratings loaded
        }
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load data. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const loadSystemData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      const usersResponse = await fetch(`${API_BASE_URL}/api/users`, { headers });
      if (usersResponse.ok) {
        const users = await usersResponse.json();
        setAllUsers(users);
      }

      const coursesResponse = await fetch(`${API_BASE_URL}/api/courses`, { headers });
      if (coursesResponse.ok) {
        const courses = await coursesResponse.json();
        setAllSystemCourses(courses);
      }

    } catch (error) {
      console.error('Error loading system data:', error);
    }
  };

  const handleSearch = (data, query, fields) => {
    if (!query.trim()) return data;
    
    return data.filter(item => 
      fields.some(field => 
        String(item[field] || '').toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const getFilteredData = () => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      switch (activeTab) {
        case 'courses': return userRole === 'student' ? availableCourses : plCourses;
        case 'reports': return userRole === 'lecturer' ? lecturerReports : prlReports;
        case 'classes': return userRole === 'lecturer' ? lecturerClasses : prlClasses;
        case 'lecturers': return plLecturers;
        case 'rating': return ratingsSummary;
        default: return [];
      }
    }

    switch (activeTab) {
      case 'courses':
        const coursesData = userRole === 'student' ? availableCourses : plCourses;
        return handleSearch(coursesData, query, ['code', 'name', 'lecturer_name', 'program']);
      
      case 'reports':
        const reportsData = userRole === 'lecturer' ? lecturerReports : prlReports;
        return handleSearch(reportsData, query, ['course_code', 'course_name', 'lecturer_name', 'week_of_reporting']);
      
      case 'classes':
        const classesData = userRole === 'lecturer' ? lecturerClasses : prlClasses;
        return handleSearch(classesData, query, ['code', 'name', 'lecturer_name', 'class_name']);
      
      case 'lecturers':
        return handleSearch(plLecturers, query, ['name', 'employee_id', 'qualification', 'specialization']);
      
      case 'rating':
        return handleSearch(ratingsSummary, query, ['course_code', 'course_name', 'lecturer', 'program']);
      
      default:
        return [];
    }
  };

  const handleRegisterModule = async (courseId, courseCode, courseName, lecturerName) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/register-module`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          course_id: courseId,
          course_code: courseCode,
          course_name: courseName,
          lecturer_name: lecturerName
        }),
      });

      if (response.ok) {
        alert('Module registered successfully!');
        loadDashboardData();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to register module');
      }
    } catch (error) {
      setError('Error registering module');
    }
  };

  const handleDeleteModule = async (moduleId, courseName) => {
    const token = localStorage.getItem('token');
    if (!window.confirm(`Are you sure you want to unregister from ${courseName}?`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/student/delete-module`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ module_id: moduleId }),
      });

      if (response.ok) {
        alert('Module unregistered successfully!');
        setStudentModules(prev => prev.filter(module => module.id !== moduleId));
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to unregister module');
      }
    } catch (error) {
      setError('Error unregistering module');
    }
  };

  const handleMarkAttendance = async () => {
    const token = localStorage.getItem('token');
    if (!attendanceData.selectedCourse) {
      setError('Please select a course.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/student/mark-attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          course_id: attendanceData.selectedCourse,
          date: attendanceData.date,
          present: attendanceData.present,
          student_name: userName
        })
      });

      if (response.ok) {
        alert('Attendance marked successfully!');
        setAttendanceData({
          selectedCourse: '',
          date: new Date().toISOString().split('T')[0],
          present: true
        });
        loadDashboardData();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to mark attendance');
      }
    } catch (error) {
      setError('Error marking attendance');
    }
  };

  const handleSubmitReport = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/lecturer/submit-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reportData)
      });

      if (response.ok) {
        alert('Report submitted successfully!');
        setReportData({
          faculty_name: 'FICT',
          class_name: '',
          week_of_reporting: '',
          date_of_lecture: new Date().toISOString().split('T')[0],
          course_name: '',
          course_code: '',
          actual_students_present: '',
          total_registered_students: '',
          venue: '',
          scheduled_lecture_time: '',
          topic_taught: '',
          learning_outcomes: '',
          recommendations: ''
        });
        setShowReportForm(false);
        loadDashboardData();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit report');
      }
    } catch (error) {
      setError('Error submitting report');
    }
  };

  const handlePRLFeedback = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/prl/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(prlFeedback)
      });

      if (response.ok) {
        alert('Feedback submitted successfully!');
        setPrlFeedback({
          report_id: '',
          feedback: ''
        });
        loadDashboardData();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit feedback');
      }
    } catch (error) {
      setError('Error submitting feedback');
    }
  };

  const handleAddCourse = async () => {
    const token = localStorage.getItem('token');
    
    if (!courseForm.code || !courseForm.name) {
      setError('Course code and name are required');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(courseForm)
      });

      if (response.ok) {
        const result = await response.json();
        alert('Course added successfully!');
        setCourseForm({
          code: '',
          name: '',
          lecturer_id: '',
          credits: 3,
          description: '',
          faculty: 'FICT',
          program: 'BSc in Information Technology',
          class_name: 'BSCITY2S1',
          total_registered: 0
        });
        setShowCourseForm(false);
        await loadDashboardData();
        await loadSystemData();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add course');
      }
    } catch (error) {
      console.error('Error adding course:', error);
      setError('Error adding course: ' + error.message);
    }
  };

  const handleAssignLecturer = async (courseId, lecturerId) => {
    const token = localStorage.getItem('token');
    if (!lecturerId) {
      setError('Please select a lecturer');
      return;
    }

    try {
      const course = allSystemCourses.find(c => c.id === courseId);
      const lecturer = allUsers.find(u => u.id === parseInt(lecturerId));
      
      if (!course) {
        setError('Course not found');
        return;
      }

      if (!lecturer) {
        setError('Lecturer not found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...course,
          lecturer_id: lecturer.id,
          lecturer_name: lecturer.fullName
        })
      });

      if (response.ok) {
        alert(`Lecturer ${lecturer.fullName} assigned to ${course.code} successfully!`);
        await loadDashboardData();
        await loadSystemData();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to assign lecturer');
      }
    } catch (error) {
      console.error('Error assigning lecturer:', error);
      setError('Error assigning lecturer: ' + error.message);
    }
  };

  const handleDeleteCourse = async (courseId, courseName) => {
    const token = localStorage.getItem('token');
    if (!window.confirm(`Are you sure you want to delete "${courseName}"? This action cannot be undone.`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Course deleted successfully!');
        await loadDashboardData();
        await loadSystemData();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      setError('Error deleting course: ' + error.message);
    }
  };

  const handleRatingSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!ratingData.target_id || ratingData.rating === 0) {
      setError('Please select a target and provide a rating.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ratingData)
      });

      if (response.ok) {
        alert('Rating submitted successfully!');
        setRatingData({
          target_id: '',
          target_type: 'course',
          rating: 0,
          comment: ''
        });
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit rating.');
      }
    } catch (error) {
      setError('Error submitting rating.');
    }
  };

  const handleStarClick = (starValue) => {
    setRatingData(prev => ({ ...prev, rating: starValue }));
  };

  const handleDownloadTimetable = async () => {
    const token = localStorage.getItem('token');
    const endpoint = userRole === 'student' ? 'student' : 'lecturer';
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/${endpoint}/timetable`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${endpoint}_timetable_${userName}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download timetable');
      }
    } catch (error) {
      setError('Error downloading timetable');
    }
  };

  const handleDownloadReports = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reports_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download reports');
      }
    } catch (error) {
      setError('Error downloading reports');
    }
  };

  const filteredCourses = availableCourses.filter(course =>
    course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.lecturer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isCourseRegistered = (courseId) => {
    return studentModules.some(module => module.course_id === courseId);
  };

  const renderTabs = () => {
    const tabs = [];
    
    if (userRole === 'student') {
      tabs.push(
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'courses', label: 'Available Courses' },
        { id: 'attendance', label: 'Attendance' },
        { id: 'monitoring', label: 'Monitoring' },
        { id: 'rating', label: 'Rating' }
      );
    } else if (userRole === 'lecturer') {
      tabs.push(
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'classes', label: 'My Classes' },
        { id: 'reports', label: 'Reports' },
        { id: 'monitoring', label: 'Monitoring' },
        { id: 'rating', label: 'Rating' }
      );
    } else if (userRole === 'prl') {
      tabs.push(
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'courses', label: 'Courses' },
        { id: 'reports', label: 'Reports' },
        { id: 'monitoring', label: 'Monitoring' },
        { id: 'rating', label: 'Rating' },
        { id: 'classes', label: 'Classes' }
      );
    } else if (userRole === 'pl') {
      tabs.push(
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'courses', label: 'Courses' },
        { id: 'reports', label: 'Reports' },
        { id: 'monitoring', label: 'Monitoring' },
        { id: 'classes', label: 'Classes' },
        { id: 'lecturers', label: 'Lecturers' },
        { id: 'rating', label: 'Rating' }
      );
    }

    return (
      <div className="tabs-container">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  };

  const renderStudentDashboard = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="dashboard-cards">
            <div className="card">
              <div className="card-header">
                <h3>My Registered Modules</h3>
                <span className="badge">{studentModules.length} modules</span>
              </div>
              {studentModules.length > 0 ? (
                <div className="module-list">
                  {studentModules.map(module => (
                    <div key={module.id} className="module-item">
                      <div className="module-info">
                        <strong>{module.course_code} - {module.course_name}</strong>
                        <div className="module-details">
                          <span>Lecturer: {module.lecturer_name}</span>
                          <span>Class: {module.class_time} | {module.venue}</span>
                          <span>Status: <span className="status-badge">{module.status}</span></span>
                        </div>
                      </div>
                      <div className="module-actions">
                        <button
                          className="view-outline-btn"
                          onClick={() => alert(`Course Outline:\n\n${module.course_outline || 'No outline available'}`)}
                        >
                          View Outline
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteModule(module.id, module.course_name)}
                        >
                          Unregister
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No modules registered yet.</p>
                  <p className="hint">Browse available courses to register.</p>
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Quick Attendance</h3>
              </div>
              <div className="attendance-form">
                <select 
                  className="form-select"
                  value={attendanceData.selectedCourse}
                  onChange={(e) => setAttendanceData(prev => ({ ...prev, selectedCourse: e.target.value }))}
                >
                  <option value="">Select Course</option>
                  {studentModules.map(module => (
                    <option key={module.id} value={module.course_id}>
                      {module.course_code} - {module.course_name}
                    </option>
                  ))}
                </select>
                
                <input
                  type="date"
                  className="form-input"
                  value={attendanceData.date}
                  onChange={(e) => setAttendanceData(prev => ({ ...prev, date: e.target.value }))}
                />
                
                <div className="attendance-options">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="attendance"
                      checked={attendanceData.present}
                      onChange={() => setAttendanceData(prev => ({ ...prev, present: true }))}
                    />
                    Present
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="attendance"
                      checked={!attendanceData.present}
                      onChange={() => setAttendanceData(prev => ({ ...prev, present: false }))}
                    />
                    Absent
                  </label>
                </div>
                
                <button 
                  className="submit-btn primary"
                  onClick={handleMarkAttendance}
                  disabled={!attendanceData.selectedCourse}
                >
                  Mark Attendance
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Quick Actions</h3>
              </div>
              <div className="quick-actions">
                <button 
                  className="action-btn"
                  onClick={() => setActiveTab('courses')}
                >
                  Browse Courses
                </button>
                <button 
                  className="action-btn"
                  onClick={handleDownloadTimetable}
                >
                  Download Timetable
                </button>
                <button 
                  className="action-btn"
                  onClick={() => setActiveTab('attendance')}
                >
                  View Attendance
                </button>
              </div>
            </div>
          </div>
        );

      case 'courses':
        return (
          <div className="card full-width">
            <div className="card-header">
              <h3>Available Courses - FICT BSCIT</h3>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search courses by code, name, or lecturer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button 
                    className="clear-search"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            
            <div className="courses-info">
              <span className="results-count">
                Showing {filteredCourses.length} of {availableCourses.length} courses
                {searchQuery && ` for "${searchQuery}"`}
              </span>
            </div>

            <div className="courses-grid">
              {filteredCourses.length > 0 ? (
                filteredCourses.map(course => {
                  const isRegistered = isCourseRegistered(course.id);
                  return (
                    <div key={course.id} className={`course-item ${isRegistered ? 'registered' : ''}`}>
                      <div className="course-header">
                        <strong className="course-code">{course.code}</strong>
                        <span className="credits-badge">{course.credits} credits</span>
                      </div>
                      <h4 className="course-name">{course.name}</h4>
                      <div className="course-details">
                        <div className="detail-item">
                          <span className="label">Lecturer:</span>
                          <span className="value">{course.lecturer_name}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Description:</span>
                          <span className="value">{course.description}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Total Registered:</span>
                          <span className="value">{course.total_registered} students</span>
                        </div>
                        {course.classes && course.classes.length > 0 && (
                          <div className="detail-item">
                            <span className="label">Available Classes:</span>
                            <div className="classes-list">
                              {course.classes.map(cls => (
                                <span key={cls.id} className="class-tag">
                                  {cls.name} ({cls.time}, {cls.venue})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="course-actions">
                        <button
                          className={`register-btn ${isRegistered ? 'registered' : 'primary'}`}
                          onClick={() => handleRegisterModule(
                            course.id, 
                            course.code, 
                            course.name, 
                            course.lecturer_name
                          )}
                          disabled={isRegistered}
                        >
                          {isRegistered ? (
                            'Registered'
                          ) : (
                            'Register Now'
                          )}
                        </button>
                        {isRegistered && (
                          <button
                            className="view-outline-btn secondary"
                            onClick={() => {
                              const module = studentModules.find(m => m.course_id === course.id);
                              alert(`Course Outline:\n\n${module?.course_outline || 'No outline available'}`);
                            }}
                          >
                            View Outline
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <p>No courses found {searchQuery && `matching "${searchQuery}"`}</p>
                  {searchQuery && (
                    <button 
                      className="clear-search-btn"
                      onClick={() => setSearchQuery('')}
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'attendance':
        return (
          <div className="card full-width">
            <div className="card-header">
              <h3>My Attendance Records</h3>
              <button className="action-btn" onClick={handleDownloadTimetable}>
                Download Timetable
              </button>
            </div>
            {attendanceRecords.length > 0 ? (
              <div className="attendance-records">
                <table className="records-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Course</th>
                      <th>Status</th>
                      <th>Marked By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map(record => (
                      <tr key={record.id}>
                        <td>{record.date}</td>
                        <td>{record.course_code}</td>
                        <td>
                          <span className={`status-badge status-${record.status.toLowerCase()}`}>
                            {record.status}
                          </span>
                        </td>
                        <td>{record.marked_by}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No attendance records yet.</p>
                <p className="hint">Mark your attendance for today's classes.</p>
              </div>
            )}
          </div>
        );

      case 'monitoring':
        return (
          <div className="card full-width">
            <div className="card-header">
              <h3>Academic Monitoring</h3>
            </div>
            {monitoringData.length > 0 ? (
              <div className="monitoring-stats">
                {monitoringData.map((item, index) => (
                  <div key={index} className="monitoring-item">
                    <strong>{item.course_name}</strong>
                    <div className="monitoring-details">
                      <div className="metric">
                        <span className="label">Attendance:</span>
                        <span className="value">{item.attendance_rate ? `${item.attendance_rate.toFixed(1)}%` : 'N/A'}</span>
                      </div>
                      <div className="metric">
                        <span className="label">Performance:</span>
                        <span className="value">{item.performance_score || 'N/A'}</span>
                      </div>
                      <div className="metric">
                        <span className="label">Rating:</span>
                        <span className="value">{item.avg_rating ? `${item.avg_rating}/5` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No monitoring data available.</p>
              </div>
            )}
          </div>
        );

      case 'rating':
        return (
          <div className="card full-width">
            <div className="card-header">
              <h3>Rate Courses & Lectures</h3>
            </div>
            <div className="rating-interface">
              <div className="rating-form">
                <select 
                  className="form-select"
                  value={ratingData.target_type}
                  onChange={(e) => setRatingData(prev => ({ ...prev, target_type: e.target.value, target_id: '' }))}
                >
                  <option value="course">Rate Course</option>
                  <option value="lecture">Rate Lecture</option>
                  <option value="lecturer">Rate Lecturer</option>
                </select>

                <select 
                  className="form-select"
                  value={ratingData.target_id}
                  onChange={(e) => setRatingData(prev => ({ ...prev, target_id: e.target.value }))}
                >
                  <option value="">Select {ratingData.target_type}</option>
                  {ratingData.target_type === 'course' && studentModules.map(module => (
                    <option key={module.id} value={module.id}>
                      {module.course_name} - {module.lecturer_name}
                    </option>
                  ))}
                  {ratingData.target_type === 'lecture' && studentModules.map(module => (
                    <option key={module.id} value={module.id}>
                      {module.course_name} Lecture
                    </option>
                  ))}
                  {ratingData.target_type === 'lecturer' && [...new Set(studentModules.map(m => m.lecturer_name))].map(lecturer => (
                    <option key={lecturer} value={lecturer}>
                      {lecturer}
                    </option>
                  ))}
                </select>
                
                {ratingData.target_id && (
                  <>
                    <div className="star-rating-container">
                      <label>Your Rating:</label>
                      <div className="star-rating">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span 
                            key={star} 
                            className={`star ${star <= ratingData.rating ? 'active' : ''}`}
                            onClick={() => handleStarClick(star)}
                            title={`${star} star${star > 1 ? 's' : ''}`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="rating-text">{ratingData.rating}/5</span>
                      </div>
                    </div>
                    
                    <div className="feedback-section">
                      <label>Comments (optional):</label>
                      <textarea 
                        placeholder="Share your feedback..."
                        className="feedback-textarea"
                        value={ratingData.comment}
                        onChange={(e) => setRatingData(prev => ({ ...prev, comment: e.target.value }))}
                        rows="3"
                      ></textarea>
                    </div>
                    
                    <button 
                      className="submit-rating-btn primary"
                      onClick={handleRatingSubmit}
                      disabled={!ratingData.target_id || ratingData.rating === 0}
                    >
                      Submit Rating
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderLecturerDashboard = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="dashboard-cards">
            <div className="card">
              <div className="card-header">
                <h3>My Classes</h3>
                <span className="badge">{lecturerClasses.length} classes</span>
              </div>
              {lecturerClasses.length > 0 ? (
                <div className="classes-list">
                  {lecturerClasses.map(course => (
                    <div key={course.id} className="class-item">
                      <div className="class-info">
                        <strong>{course.code} - {course.name}</strong>
                        <div className="class-details">
                          <span>Students: {course.total_registered}</span>
                          <span>Credits: {course.credits}</span>
                          {course.classes && course.classes.length > 0 && (
                            <span>Schedule: {course.classes[0].time}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No classes assigned.</p>
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Quick Actions</h3>
              </div>
              <div className="quick-actions">
                <button 
                  className="action-btn primary"
                  onClick={() => setShowReportForm(true)}
                >
                  Submit Report
                </button>
                <button 
                  className="action-btn"
                  onClick={handleDownloadTimetable}
                >
                  Download Timetable
                </button>
                <button 
                  className="action-btn"
                  onClick={() => setActiveTab('reports')}
                >
                  View Reports
                </button>
              </div>
            </div>
          </div>
        );

      case 'classes':
        return (
          <div className="card full-width">
            <div className="card-header">
              <h3>My Teaching Schedule</h3>
              <button className="action-btn" onClick={handleDownloadTimetable}>
                Download Timetable
              </button>
            </div>
            {lecturerClasses.length > 0 ? (
              <div className="classes-table">
                <table>
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Course Name</th>
                      <th>Schedule</th>
                      <th>Venue</th>
                      <th>Registered Students</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lecturerClasses.map(course => (
                      <tr key={course.id}>
                        <td><strong>{course.code}</strong></td>
                        <td>{course.name}</td>
                        <td>
                          {course.classes && course.classes.map(cls => (
                            <div key={cls.id}>{cls.time}</div>
                          ))}
                        </td>
                        <td>
                          {course.classes && course.classes.map(cls => (
                            <div key={cls.id}>{cls.venue}</div>
                          ))}
                        </td>
                        <td>{course.total_registered}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No classes assigned.</p>
              </div>
            )}
          </div>
        );

      case 'reports':
        return (
          <div className="card full-width">
            <div className="card-header">
              <h3>Lecture Reports</h3>
              <div className="header-actions">
                <button 
                  className="action-btn primary"
                  onClick={() => setShowReportForm(true)}
                >
                  New Report
                </button>
                <button 
                  className="action-btn secondary"
                  onClick={handleDownloadReports}
                >
                  Export Reports
                </button>
              </div>
            </div>

            {showReportForm && (
              <div className="report-form-overlay">
                <div className="report-form">
                  <div className="form-header">
                    <h3>Submit Lecture Report</h3>
                    <button 
                      className="close-btn"
                      onClick={() => setShowReportForm(false)}
                    >
                      Close
                    </button>
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Faculty Name *</label>
                      <input
                        type="text"
                        value={reportData.faculty_name}
                        onChange={(e) => setReportData(prev => ({ ...prev, faculty_name: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Class Name *</label>
                      <input
                        type="text"
                        value={reportData.class_name}
                        onChange={(e) => setReportData(prev => ({ ...prev, class_name: e.target.value }))}
                        placeholder="e.g., BSCITY2S1"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Week of Reporting *</label>
                      <input
                        type="text"
                        value={reportData.week_of_reporting}
                        onChange={(e) => setReportData(prev => ({ ...prev, week_of_reporting: e.target.value }))}
                        placeholder="e.g., Week 1"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Date of Lecture *</label>
                      <input
                        type="date"
                        value={reportData.date_of_lecture}
                        onChange={(e) => setReportData(prev => ({ ...prev, date_of_lecture: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Course Name *</label>
                      <input
                        type="text"
                        value={reportData.course_name}
                        onChange={(e) => setReportData(prev => ({ ...prev, course_name: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Course Code *</label>
                      <input
                        type="text"
                        value={reportData.course_code}
                        onChange={(e) => setReportData(prev => ({ ...prev, course_code: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Actual Students Present *</label>
                      <input
                        type="number"
                        value={reportData.actual_students_present}
                        onChange={(e) => setReportData(prev => ({ ...prev, actual_students_present: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Total Registered Students *</label>
                      <input
                        type="number"
                        value={reportData.total_registered_students}
                        onChange={(e) => setReportData(prev => ({ ...prev, total_registered_students: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Venue *</label>
                      <input
                        type="text"
                        value={reportData.venue}
                        onChange={(e) => setReportData(prev => ({ ...prev, venue: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Scheduled Lecture Time *</label>
                      <input
                        type="text"
                        value={reportData.scheduled_lecture_time}
                        onChange={(e) => setReportData(prev => ({ ...prev, scheduled_lecture_time: e.target.value }))}
                        placeholder="e.g., Mon 09:00-11:00"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Topic Taught *</label>
                    <textarea
                      value={reportData.topic_taught}
                      onChange={(e) => setReportData(prev => ({ ...prev, topic_taught: e.target.value }))}
                      rows="3"
                      required
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Learning Outcomes</label>
                    <textarea
                      value={reportData.learning_outcomes}
                      onChange={(e) => setReportData(prev => ({ ...prev, learning_outcomes: e.target.value }))}
                      rows="2"
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Recommendations</label>
                    <textarea
                      value={reportData.recommendations}
                      onChange={(e) => setReportData(prev => ({ ...prev, recommendations: e.target.value }))}
                      rows="2"
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      className="submit-btn primary"
                      onClick={handleSubmitReport}
                    >
                      Submit Report
                    </button>
                    <button 
                      className="cancel-btn"
                      onClick={() => setShowReportForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {lecturerReports.length > 0 ? (
              <div className="reports-list">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Week</th>
                      <th>Course</th>
                      <th>Date</th>
                      <th>Students Present</th>
                      <th>Status</th>
                      <th>PRL Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lecturerReports.map(report => (
                      <tr key={report.id}>
                        <td>{report.week_of_reporting}</td>
                        <td>{report.course_code}</td>
                        <td>{report.date_of_lecture}</td>
                        <td>{report.actual_students_present}/{report.total_registered_students}</td>
                        <td>
                          <span className={`status-badge status-${report.status.toLowerCase()}`}>
                            {report.status}
                          </span>
                        </td>
                        <td>{report.prl_feedback || 'No feedback yet'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No reports submitted yet.</p>
                <button 
                  className="action-btn primary"
                  onClick={() => setShowReportForm(true)}
                >
                  Submit Your First Report
                </button>
              </div>
            )}
          </div>
        );

      case 'monitoring':
        return (
          <div className="card full-width">
            <div className="card-header">
              <h3>Teaching Analytics</h3>
            </div>
            {monitoringData.length > 0 ? (
              <div className="analytics-grid">
                {monitoringData.map((item, index) => (
                  <div key={index} className="analytics-card">
                    <h4>{item.course_name}</h4>
                    <div className="analytics-metrics">
                      <div className="metric">
                        <span className="metric-value">{item.attendance_rate}%</span>
                        <span className="metric-label">Attendance</span>
                      </div>
                      <div className="metric">
                        <span className="metric-value">{item.performance_score}</span>
                        <span className="metric-label">Performance</span>
                      </div>
                      <div className="metric">
                        <span className="metric-value">{item.avg_rating}/5</span>
                        <span className="metric-label">Rating</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No monitoring data available.</p>
              </div>
            )}
          </div>
        );

      case 'rating':
        return (
          <div className="card full-width">
            <div className="card-header">
              <h3>Rating System</h3>
              <button 
                className="action-btn"
                onClick={() => {
                  setRatingData({
                    target_id: '',
                    target_type: 'course',
                    rating: 0,
                    comment: ''
                  });
                }}
              >
                Submit Rating
              </button>
            </div>
            
            <div className="rating-interface">
              <div className="rating-form">
                <select 
                  className="form-select"
                  value={ratingData.target_type}
                  onChange={(e) => setRatingData(prev => ({ ...prev, target_type: e.target.value, target_id: '' }))}
                >
                  <option value="course">Rate Course</option>
                  <option value="student">Rate Student Performance</option>
                </select>

                <select 
                  className="form-select"
                  value={ratingData.target_id}
                  onChange={(e) => setRatingData(prev => ({ ...prev, target_id: e.target.value }))}
                >
                  <option value="">Select {ratingData.target_type}</option>
                  {ratingData.target_type === 'course' && lecturerClasses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                  {ratingData.target_type === 'student' && (
                    <option value="overall">Overall Student Performance</option>
                  )}
                </select>
                
                {ratingData.target_id && (
                  <>
                    <div className="star-rating-container">
                      <label>Your Rating:</label>
                      <div className="star-rating">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span 
                            key={star} 
                            className={`star ${star <= ratingData.rating ? 'active' : ''}`}
                            onClick={() => handleStarClick(star)}
                          >
                            ★
                          </span>
                        ))}
                        <span className="rating-text">{ratingData.rating}/5</span>
                      </div>
                    </div>
                    
                    <button 
                      className="submit-rating-btn primary"
                      onClick={handleRatingSubmit}
                    >
                      Submit Rating
                    </button>
                  </>
                )}
              </div>

              <div className="ratings-received">
                <h4>Ratings for Your Courses</h4>
                {lecturerClasses.map(course => (
                  <div key={course.id} className="rating-summary-item">
                    <strong>{course.code} - {course.name}</strong>
                    <div className="rating-stars">
                      {'★'.repeat(4)} <span className="rating-text">4.2/5</span>
                    </div>
                    <div className="rating-count">Based on 15 ratings</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderPRLDashboard = () => {
    const filteredData = getFilteredData();

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="dashboard-cards">
            <div className="card">
              <div className="card-header">
                <h3>Courses in My Stream</h3>
                <span className="badge">{prlCourses.length} courses</span>
              </div>
              {prlCourses.length > 0 ? (
                <div className="courses-list">
                  {prlCourses.map(course => (
                    <div key={course.id} className="course-item">
                      <strong>{course.code} - {course.name}</strong>
                      <div>Lecturer: {course.lecturer_name}</div>
                      <div>Students: {course.total_registered}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No courses in your stream.</p>
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Pending Reports</h3>
                <span className="badge">
                  {prlReports.filter(r => r.status === 'Pending').length} pending
                </span>
              </div>
              <div className="quick-actions">
                <button 
                  className="action-btn primary"
                  onClick={() => setActiveTab('reports')}
                >
                  Review Reports
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Submit Rating</h3>
              </div>
              <div className="quick-actions">
                <button 
                  className="action-btn"
                  onClick={() => {
                    setRatingData({
                      target_id: '',
                      target_type: 'course',
                      rating: 0,
                      comment: ''
                    });
                    setActiveTab('rating');
                  }}
                >
                  Rate Courses
                </button>
              </div>
            </div>
          </div>
        );

      case 'courses':
        return (
          <div className="card full-width">
            <div className="card-header">
              <h3>All Courses in Stream</h3>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button 
                    className="clear-search"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            {filteredData.length > 0 ? (
              <div className="courses-table">
                <table>
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Course Name</th>
                      <th>Lecturer</th>
                      <th>Credits</th>
                      <th>Registered Students</th>
                      <th>Program</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map(course => (
                      <tr key={course.id}>
                        <td><strong>{course.code}</strong></td>
                        <td>{course.name}</td>
                        <td>{course.lecturer_name}</td>
                        <td>{course.credits}</td>
                        <td>{course.total_registered}</td>
                        <td>{course.program}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No courses found {searchQuery && `matching "${searchQuery}"`}</p>
                {searchQuery && (
                  <button 
                    className="clear-search-btn"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        );

      case 'reports':
        return (
          <div className="card full-width">
            <div className="card-header">
              <h3>Lecture Reports Review</h3>
              <div className="header-actions">
                <button 
                  className="action-btn secondary"
                  onClick={handleDownloadReports}
                >
                  Export Reports
                </button>
              </div>
            </div>
            {filteredData.length > 0 ? (
              <div className="reports-list">
                {filteredData.map(report => (
                  <div key={report.id} className="report-item">
                    <div className="report-header">
                      <strong>{report.course_code} - {report.course_name}</strong>
                      <span className={`status-badge status-${report.status.toLowerCase()}`}>
                        {report.status}
                      </span>
                    </div>
                    <div className="report-details">
                      <div>Lecturer: {report.lecturer_name}</div>
                      <div>Week: {report.week_of_reporting} | Date: {report.date_of_lecture}</div>
                      <div>Students: {report.actual_students_present}/{report.total_registered_students}</div>
                      <div>Topic: {report.topic_taught}</div>
                      {report.learning_outcomes && (
                        <div>Outcomes: {report.learning_outcomes}</div>
                      )}
                    </div>
                    {report.status === 'Pending' && (
                      <div className="feedback-section">
                        <textarea
                          placeholder="Provide feedback for this report..."
                          value={prlFeedback.report_id === report.id ? prlFeedback.feedback : ''}
                          onChange={(e) => setPrlFeedback({
                            report_id: report.id,
                            feedback: e.target.value
                          })}
                          rows="3"
                        />
                        <button 
                          className="submit-btn primary small"
                          onClick={handlePRLFeedback}
                          disabled={!prlFeedback.feedback || prlFeedback.report_id !== report.id}
                        >
                          Submit Feedback
                        </button>
                      </div>
                    )}
                    {report.prl_feedback && (
                      <div className="feedback-display">
                        <strong>Your Feedback:</strong> {report.prl_feedback}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No reports to review {searchQuery && `matching "${searchQuery}"`}</p>
                {searchQuery && (
                  <button 
                    className="clear-search-btn"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        );

      case 'monitoring':
        return (
          <div className="card full-width">
            <div className="card-header">
              <h3>Stream Monitoring</h3>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search monitoring data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button 
                    className="clear-search"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            {filteredData.length > 0 ? (
              <div className="monitoring-table">
                <table>
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Lecturer</th>
                      <th>Attendance</th>
                      <th>Performance</th>
                      <th>Rating</th>
                      <th>Students</th>
                      <th>Reports</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <tr key={index}>
                        <td><strong>{item.course_name}</strong></td>
                        <td>{item.lecturer}</td>
                        <td>{item.attendance_rate}%</td>
                        <td>{item.performance_score}</td>
                        <td>
                          <div className="rating-display">
                            {'★'.repeat(Math.floor(item.avg_rating))}
                            <span className="rating-value">({item.avg_rating})</span>
                          </div>
                        </td>
                        <td>{item.total_students}</td>
                        <td>{item.reports_submitted}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No monitoring data found {searchQuery && `matching "${searchQuery}"`}</p>
                {searchQuery && (
                  <button 
                    className="clear-search-btn"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        );

      case 'rating':
        return (
          <div className="card full-width">
            <div className="card-header">
              <h3>Course Ratings Overview</h3>
              <div className="header-actions">
                <button 
                  className="action-btn"
                  onClick={() => {
                    setRatingData({
                      target_id: '',
                      target_type: 'course',
                      rating: 0,
                      comment: ''
                    });
                  }}
                >
                  Submit Rating
                </button>
              </div>
            </div>

            <div className="rating-interface">
              <div className="rating-form">
                <h4>Submit Your Rating</h4>
                <select 
                  className="form-select"
                  value={ratingData.target_type}
                  onChange={(e) => setRatingData(prev => ({ ...prev, target_type: e.target.value, target_id: '' }))}
                >
                  <option value="course">Rate Course</option>
                  <option value="lecturer">Rate Lecturer</option>
                </select>

                <select 
                  className="form-select"
                  value={ratingData.target_id}
                  onChange={(e) => setRatingData(prev => ({ ...prev, target_id: e.target.value }))}
                >
                  <option value="">Select {ratingData.target_type}</option>
                  {ratingData.target_type === 'course' && prlCourses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name} - {course.lecturer_name}
                    </option>
                  ))}
                  {ratingData.target_type === 'lecturer' && [...new Set(prlCourses.map(c => c.lecturer_name))].map(lecturer => (
                    <option key={lecturer} value={lecturer}>
                      {lecturer}
                    </option>
                  ))}
                </select>
                
                {ratingData.target_id && (
                  <>
                    <div className="star-rating-container">
                      <label>Your Rating:</label>
                      <div className="star-rating">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span 
                            key={star} 
                            className={`star ${star <= ratingData.rating ? 'active' : ''}`}
                            onClick={() => handleStarClick(star)}
                          >
                            ★
                          </span>
                        ))}
                        <span className="rating-text">{ratingData.rating}/5</span>
                      </div>
                    </div>
                    
                    <button 
                      className="submit-rating-btn primary"
                      onClick={handleRatingSubmit}
                    >
                      Submit Rating
                    </button>
                  </>
                )}
              </div>
            </div>

            {ratingsSummary.length > 0 ? (
              <div className="ratings-overview">
                <table>
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Lecturer</th>
                      <th>Average Rating</th>
                      <th>Total Ratings</th>
                      <th>Rating Distribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratingsSummary.map((course, index) => (
                      <tr key={index}>
                        <td><strong>{course.course_code}</strong> - {course.course_name}</td>
                        <td>{course.lecturer}</td>
                        <td>
                          <div className="rating-display">
                            {'★'.repeat(Math.floor(course.average_rating))}
                            <span className="rating-value">({course.average_rating})</span>
                          </div>
                        </td>
                        <td>{course.total_ratings}</td>
                        <td>
                          <div className="rating-distribution">
                            {[5, 4, 3, 2, 1].map(star => (
                              <span key={star} className="distribution-item">
                                {star}★: {course.ratings_breakdown[star]}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No ratings data available.</p>
              </div>
            )}
          </div>
        );

      case 'classes':
        return (
          <div className="card full-width">
            <div className="card-header">
              <h3>Classes Overview</h3>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search classes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button 
                    className="clear-search"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            {filteredData.length > 0 ? (
              <div className="classes-overview">
                <table>
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Course Name</th>
                      <th>Lecturer</th>
                      <th>Program</th>
                      <th>Class</th>
                      <th>Students</th>
                      <th>Schedule</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((classItem, index) => (
                      <tr key={index}>
                        <td><strong>{classItem.code}</strong></td>
                        <td>{classItem.name}</td>
                        <td>{classItem.lecturer}</td>
                        <td>{classItem.program}</td>
                        <td>{classItem.class_name}</td>
                        <td>{classItem.total_students}</td>
                        <td>{classItem.schedule}</td>
                        <td>
                          <span className="status-badge status-active">
                            {classItem.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No classes data found {searchQuery && `matching "${searchQuery}"`}</p>
                {searchQuery && (
                  <button 
                    className="clear-search-btn"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderPLDashboard = () => {
    const filteredData = getFilteredData();

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="dashboard-cards">
            <div className="card">
              <div className="card-header">
                <h3>Program Overview</h3>
              </div>
              <div className="program-stats">
                <div className="stat-item">
                  <span className="stat-number">{plCourses.length}</span>
                  <span className="stat-label">Total Courses</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {allUsers.filter(u => u.role === 'student').length}
                  </span>
                  <span className="stat-label">Students</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {allUsers.filter(u => u.role === 'lecturer').length}
                  </span>
                  <span className="stat-label">Lecturers</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Approved Reports</h3>
                <span className="badge">
                  {plReports.filter(r => r.status === 'Approved').length} approved
                </span>
              </div>
              <div className="quick-actions">
                <button 
                  className="action-btn primary"
                  onClick={() => setActiveTab('reports')}
                >
                  View Reports
                </button>
                <button 
                  className="action-btn secondary"
                  onClick={handleDownloadReports}
                >
                  Export Reports
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Course Management</h3>
              </div>
              <div className="quick-actions">
                <button 
                  className="action-btn primary"
                  onClick={() => setShowCourseForm(true)}
                >
                  Add New Course
                </button>
                <button 
                  className="action-btn"
                  onClick={() => setActiveTab('courses')}
                >
                  Manage Courses
                </button>
              </div>
            </div>
          </div>
        );

      case 'courses':
        return (
          <div className="card full-width">
            <div className="card-header">
              <h3>Program Courses Management</h3>
              <div className="header-actions">
                <button 
                  className="action-btn primary"
                  onClick={() => setShowCourseForm(true)}
                >
                  Add New Course
                </button>
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  {searchQuery && (
                    <button 
                      className="clear-search"
                      onClick={() => setSearchQuery('')}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {showCourseForm && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <div className="modal-header">
                    <h3>Add New Course</h3>
                    <button 
                      className="close-btn"
                      onClick={() => setShowCourseForm(false)}
                    >
                      Close
                    </button>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Course Code *</label>
                      <input
                        type="text"
                        value={courseForm.code}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, code: e.target.value }))}
                        placeholder="e.g., DIWA2110"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Course Name *</label>
                      <input
                        type="text"
                        value={courseForm.name}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Web Application Development"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Lecturer</label>
                      <select
                        value={courseForm.lecturer_id}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, lecturer_id: e.target.value }))}
                      >
                        <option value="">Select Lecturer</option>
                        {allUsers.filter(u => u.role === 'lecturer').map(lecturer => (
                          <option key={lecturer.id} value={lecturer.id}>
                            {lecturer.fullName} ({lecturer.qualification})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Credits</label>
                      <input
                        type="number"
                        value={courseForm.credits}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, credits: parseInt(e.target.value) || 3 }))}
                        min="1"
                        max="6"
                      />
                    </div>
                    <div className="form-group">
                      <label>Program</label>
                      <select
                        value={courseForm.program}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, program: e.target.value }))}
                      >
                        <option value="BSc in Information Technology">BSc in Information Technology</option>
                        <option value="BSc in Software Engineering with Multimedia">BSc in Software Engineering with Multimedia</option>
                        <option value="Diploma in Information Technology">Diploma in Information Technology</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Class Name</label>
                      <input
                        type="text"
                        value={courseForm.class_name}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, class_name: e.target.value }))}
                        placeholder="e.g., BSCITY2S1"
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Description</label>
                      <textarea
                        value={courseForm.description}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                        rows="3"
                        placeholder="Course description..."
                      />
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button 
                      className="submit-btn primary"
                      onClick={handleAddCourse}
                      disabled={!courseForm.code || !courseForm.name}
                    >
                      Add Course
                    </button>
                    <button 
                      className="cancel-btn"
                      onClick={() => setShowCourseForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {filteredData.length > 0 ? (
              <div className="courses-management-table">
                <table>
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Course Name</th>
                      <th>Lecturer</th>
                      <th>Credits</th>
                      <th>Program</th>
                      <th>Class</th>
                      <th>Students</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map(course => (
                      <tr key={course.id}>
                        <td><strong>{course.code}</strong></td>
                        <td>{course.name}</td>
                        <td>
                          <select
                            value={course.lecturer_id || ''}
                            onChange={(e) => handleAssignLecturer(course.id, e.target.value)}
                            className="lecturer-select"
                          >
                            <option value="">Assign Lecturer</option>
                            {allUsers.filter(u => u.role === 'lecturer').map(lecturer => (
                              <option key={lecturer.id} value={lecturer.id}>
                                {lecturer.fullName} ({lecturer.qualification})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>{course.credits}</td>
                        <td>{course.program}</td>
                        <td>{course.class_name}</td>
                        <td>{course.total_registered}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="delete-btn small"
                              onClick={() => handleDeleteCourse(course.id, course.name)}
                              title="Delete Course"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No courses found {searchQuery && `matching "${searchQuery}"`}</p>
                {searchQuery && (
                  <button 
                    className="clear-search-btn"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search
                  </button>
                )}
                <button 
                  className="action-btn primary"
                  onClick={() => setShowCourseForm(true)}
                >
                  Add Your First Course
                </button>
              </div>
            )}
          </div>
        );

      case 'reports':
        return (
          <div className="card full-width">
            <div className="card-header">
              <h3>Approved Reports</h3>
              <div className="header-actions">
                <button 
                  className="action-btn secondary"
                  onClick={handleDownloadReports}
                >
                  Export Reports
                </button>
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  {searchQuery && (
                    <button 
                      className="clear-search"
                      onClick={() => setSearchQuery('')}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
            {filteredData.length > 0 ? (
              <div className="reports-list">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Lecturer</th>
                      <th>Week</th>
                      <th>Date</th>
                      <th>Students Present</th>
                      <th>PRL Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map(report => (
                      <tr key={report.id}>
                        <td>{report.course_code}</td>
                        <td>{report.lecturer_name}</td>
                        <td>{report.week_of_reporting}</td>
                        <td>{report.date_of_lecture}</td>
                        <td>{report.actual_students_present}/{report.total_registered_students}</td>
                        <td>{report.prl_feedback || 'No feedback'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No approved reports found {searchQuery && `matching "${searchQuery}"`}</p>
                {searchQuery && (
                  <button 
                    className="clear-search-btn"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        );

      case 'monitoring':
        return (
          <div className="card full-width">
            <div className="card-header">
              <h3>Program Monitoring</h3>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search programs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button 
                    className="clear-search"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            {filteredData.length > 0 ? (
              <div className="program-monitoring">
                <table>
                  <thead>
                    <tr>
                      <th>Program</th>
                      <th>Courses</th>
                      <th>Students</th>
                      <th>Lecturers</th>
                      <th>Attendance</th>
                      <th>Rating</th>
                      <th>Completion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((program, index) => (
                      <tr key={index}>
                        <td><strong>{program.program}</strong></td>
                        <td>{program.total_courses}</td>
                        <td>{program.total_students}</td>
                        <td>{program.total_lecturers}</td>
                        <td>{program.average_attendance}%</td>
                        <td>
                          <div className="rating-display">
                            {'★'.repeat(Math.floor(program.average_rating))}
                            <span className="rating-value">({program.average_rating})</span>
                          </div>
                        </td>
                        <td>{program.completion_rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No program monitoring data found {searchQuery && `matching "${searchQuery}"`}</p>
                {searchQuery && (
                  <button 
                    className="clear-search-btn"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        );

      case 'classes':
        return (
          <div className="card full-width">
            <div className="card-header">
              <h3>Program Classes</h3>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search classes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button 
                    className="clear-search"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            {plClasses.length > 0 ? (
              <div className="program-classes">
                {plClasses.map((program, index) => (
                  <div key={index} className="program-class-group">
                    <h4>{program.program}</h4>
                    <div className="classes-grid">
                      {program.classes.map((classItem, classIndex) => (
                        <div key={classIndex} className="class-card">
                          <strong>{classItem.name}</strong>
                          <div>Students: {classItem.total_students}</div>
                          <div>Active Courses: {classItem.active_courses}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No classes data available.</p>
              </div>
            )}
          </div>
        );

      case 'lecturers':
        return (
          <div className="card full-width">
            <div className="card-header">
              <h3>Lecturers Overview</h3>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search lecturers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button 
                    className="clear-search"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            {filteredData.length > 0 ? (
              <div className="lecturers-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Employee ID</th>
                      <th>Qualification</th>
                      <th>Specialization</th>
                      <th>Courses</th>
                      <th>Students</th>
                      <th>Rating</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((lecturer, index) => (
                      <tr key={index}>
                        <td><strong>{lecturer.name}</strong></td>
                        <td>{lecturer.employee_id}</td>
                        <td>{lecturer.qualification}</td>
                        <td>{lecturer.specialization}</td>
                        <td>{lecturer.courses_assigned}</td>
                        <td>{lecturer.total_students}</td>
                        <td>
                          <div className="rating-display">
                            {'★'.repeat(Math.floor(lecturer.average_rating))}
                            <span className="rating-value">({lecturer.average_rating})</span>
                          </div>
                        </td>
                        <td>
                          <span className="status-badge status-active">
                            {lecturer.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No lecturers found {searchQuery && `matching "${searchQuery}"`}</p>
                {searchQuery && (
                  <button 
                    className="clear-search-btn"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        );

      case 'rating':
        return (
          <div className="card full-width">
            <div className="card-header">
              <h3>Program Ratings Overview</h3>
              <div className="header-actions">
                <button 
                  className="action-btn"
                  onClick={() => {
                    setRatingData({
                      target_id: '',
                      target_type: 'course',
                      rating: 0,
                      comment: ''
                    });
                  }}
                >
                  Submit Rating
                </button>
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Search ratings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  {searchQuery && (
                    <button 
                      className="clear-search"
                      onClick={() => setSearchQuery('')}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="rating-interface">
              <div className="rating-form">
                <h4>Submit Your Rating</h4>
                <select 
                  className="form-select"
                  value={ratingData.target_type}
                  onChange={(e) => setRatingData(prev => ({ ...prev, target_type: e.target.value, target_id: '' }))}
                >
                  <option value="course">Rate Course</option>
                  <option value="lecturer">Rate Lecturer</option>
                  <option value="program">Rate Program</option>
                </select>

                <select 
                  className="form-select"
                  value={ratingData.target_id}
                  onChange={(e) => setRatingData(prev => ({ ...prev, target_id: e.target.value }))}
                >
                  <option value="">Select {ratingData.target_type}</option>
                  {ratingData.target_type === 'course' && plCourses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name} - {course.lecturer_name}
                    </option>
                  ))}
                  {ratingData.target_type === 'lecturer' && [...new Set(plCourses.map(c => c.lecturer_name))].map(lecturer => (
                    <option key={lecturer} value={lecturer}>
                      {lecturer}
                    </option>
                  ))}
                  {ratingData.target_type === 'program' && (
                    <option value="BSc IT">BSc in Information Technology</option>
                  )}
                </select>
                
                {ratingData.target_id && (
                  <>
                    <div className="star-rating-container">
                      <label>Your Rating:</label>
                      <div className="star-rating">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span 
                            key={star} 
                            className={`star ${star <= ratingData.rating ? 'active' : ''}`}
                            onClick={() => handleStarClick(star)}
                          >
                            ★
                          </span>
                        ))}
                        <span className="rating-text">{ratingData.rating}/5</span>
                      </div>
                    </div>
                    
                    <button 
                      className="submit-rating-btn primary"
                      onClick={handleRatingSubmit}
                    >
                      Submit Rating
                    </button>
                  </>
                )}
              </div>
            </div>

            {filteredData.length > 0 ? (
              <div className="ratings-overview">
                <table>
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Lecturer</th>
                      <th>Program</th>
                      <th>Average Rating</th>
                      <th>Total Ratings</th>
                      <th>Rating Distribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((course, index) => (
                      <tr key={index}>
                        <td><strong>{course.course_code}</strong> - {course.course_name}</td>
                        <td>{course.lecturer}</td>
                        <td>{course.program || 'BSc IT'}</td>
                        <td>
                          <div className="rating-display">
                            {'★'.repeat(Math.floor(course.average_rating))}
                            <span className="rating-value">({course.average_rating})</span>
                          </div>
                        </td>
                        <td>{course.total_ratings}</td>
                        <td>
                          <div className="rating-distribution">
                            {[5, 4, 3, 2, 1].map(star => (
                              <span key={star} className="distribution-item">
                                {star}★: {course.ratings_breakdown[star]}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No ratings data found {searchQuery && `matching "${searchQuery}"`}</p>
                {searchQuery && (
                  <button 
                    className="clear-search-btn"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderDashboard = () => {
    switch (userRole) {
      case 'student':
        return renderStudentDashboard();
      case 'lecturer':
        return renderLecturerDashboard();
      case 'prl':
        return renderPRLDashboard();
      case 'pl':
        return renderPLDashboard();
      default:
        return null;
    }
  };

  if (loading) return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="loading-spinner"></div>
        <h2>Loading your dashboard...</h2>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>
          {userRole === 'student' && 'Student Portal'}
          {userRole === 'lecturer' && 'Lecturer Portal'}
          {userRole === 'prl' && 'Principal Lecturer Dashboard'}
          {userRole === 'pl' && 'Program Leader Dashboard'}
        </h2>
        <p>
          Welcome back, {userName}!
        </p>
        <div className="header-actions">
          <div className={`user-badge badge-${userRole}`}>
            {userRole.toUpperCase()} Access
            {userRole === 'student' && isClassRep && ' | Class Representative'}
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
      
      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError('')} className="close-error">Close</button>
        </div>
      )}

      {renderTabs()}

      {['courses', 'reports', 'monitoring', 'classes', 'lecturers', 'rating'].includes(activeTab) && (
        <div className="search-section">
          <div className="search-container">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button 
                className="clear-search"
                onClick={() => setSearchQuery('')}
              >
                Clear
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="search-results-info">
              Found {getFilteredData().length} results for "{searchQuery}"
            </div>
          )}
        </div>
      )}

      {renderDashboard()}

      <footer className="dashboard-footer">
        <p>© 2025 Limkokwing University of Creative Technology - Faculty of ICT. All rights reserved.</p>
        <p>Web Application Development - DIWA2110 | Assignment 2</p>
      </footer>
    </div>
  );
};

export default Dashboard;