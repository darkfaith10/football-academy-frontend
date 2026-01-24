import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Check, X, Calendar, DollarSign, Users, RefreshCw } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const App = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('students');
  const [stats, setStats] = useState({ totalStudents: 0, presentToday: 0, feesPaidThisMonth: 0 });
  const [newStudent, setNewStudent] = useState({
    name: '',
    age: '',
    parentContact: '',
    monthlyFee: '1000',
    joinDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadStudents();
    loadStats();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/students`);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
      alert('Failed to load students. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const addStudent = async () => {
    if (!newStudent.name || !newStudent.age || !newStudent.parentContact) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      });

      if (response.ok) {
        setNewStudent({
          name: '',
          age: '',
          parentContact: '',
          monthlyFee: '1000',
          joinDate: new Date().toISOString().split('T')[0]
        });
        setShowAddModal(false);
        loadStudents();
        loadStats();
      } else {
        alert('Failed to add student');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Failed to add student. Make sure the backend server is running.');
    }
  };

  const deleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const response = await fetch(`${API_URL}/students/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          loadStudents();
          loadStats();
        } else {
          alert('Failed to delete student');
        }
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Failed to delete student');
      }
    }
  };

  const markAttendance = async (studentId, date = new Date().toISOString().split('T')[0]) => {
    try {
      const response = await fetch(`${API_URL}/students/${studentId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date })
      });

      if (response.ok) {
        loadStudents();
        loadStats();
      } else {
        alert('Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance');
    }
  };

  const toggleFeePayment = async (studentId, month) => {
    try {
      const response = await fetch(`${API_URL}/students/${studentId}/fees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month })
      });

      if (response.ok) {
        loadStudents();
        loadStats();
      } else {
        alert('Failed to update fee payment');
      }
    } catch (error) {
      console.error('Error updating fee payment:', error);
      alert('Failed to update fee payment');
    }
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const getMonthName = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getAttendanceCount = (student) => {
    const currentMonth = getCurrentMonth();
    return student.attendance.filter(date => date.startsWith(currentMonth)).length;
  };

  const getTotalAttendance = (student) => {
    return student.attendance.length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="text-green-600" />
                Football Academy Manager
              </h1>
              <p className="text-gray-600 mt-1">Manage students, attendance & fees</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { loadStudents(); loadStats(); }}
                className="bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                disabled={loading}
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
              >
                <Plus size={20} />
                Add Student
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Students</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalStudents}</p>
              </div>
              <Users className="text-blue-600" size={32} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Present Today</p>
                <p className="text-2xl font-bold text-gray-800">{stats.presentToday}</p>
              </div>
              <Calendar className="text-green-600" size={32} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Fees Paid (This Month)</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.feesPaidThisMonth}/{stats.totalStudents}
                </p>
              </div>
              <DollarSign className="text-yellow-600" size={32} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'students'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'attendance'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Attendance
            </button>
            <button
              onClick={() => setActiveTab('fees')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'fees'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Fee Management
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="animate-spin inline-block text-green-600" size={48} />
            <p className="text-gray-600 mt-4">Loading...</p>
          </div>
        )}

        {/* Students Tab */}
        {!loading && activeTab === 'students' && (
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">This Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map(student => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.age}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.parentContact}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{getTotalAttendance(student)} days</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{getAttendanceCount(student)} days</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => deleteStudent(student._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {students.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No students added yet. Click "Add Student" to get started.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {!loading && activeTab === 'attendance' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Mark Attendance - {new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}
              </h3>
            </div>
            <div className="grid gap-3">
              {students.map(student => {
                const isPresent = student.attendance.includes(new Date().toISOString().split('T')[0]);
                return (
                  <div
                    key={student._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{student.name}</p>
                      <p className="text-sm text-gray-600">Age: {student.age} | This month: {getAttendanceCount(student)} days</p>
                    </div>
                    <button
                      onClick={() => markAttendance(student._id)}
                      className={`px-6 py-2 rounded-lg flex items-center gap-2 transition ${
                        isPresent
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {isPresent ? <Check size={18} /> : <X size={18} />}
                      {isPresent ? 'Present' : 'Absent'}
                    </button>
                  </div>
                );
              })}
            </div>
            {students.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No students to mark attendance for.
              </div>
            )}
          </div>
        )}

        {/* Fees Tab */}
        {!loading && activeTab === 'fees' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Fee Management - {getMonthName(getCurrentMonth())}
              </h3>
            </div>
            <div className="grid gap-3">
              {students.map(student => {
                const isPaid = student.feesPaid.includes(getCurrentMonth());
                return (
                  <div
                    key={student._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{student.name}</p>
                      <p className="text-sm text-gray-600">
                        Monthly Fee: ₹{student.monthlyFee} | Contact: {student.parentContact}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleFeePayment(student._id, getCurrentMonth())}
                      className={`px-6 py-2 rounded-lg flex items-center gap-2 transition ${
                        isPaid
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      {isPaid ? <Check size={18} /> : <X size={18} />}
                      {isPaid ? 'Paid' : 'Unpaid'}
                    </button>
                  </div>
                );
              })}
            </div>
            {students.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No students to manage fees for.
              </div>
            )}
          </div>
        )}

        {/* Add Student Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Student</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter student name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    value={newStudent.age}
                    onChange={(e) => setNewStudent({ ...newStudent, age: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter age"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Contact *
                  </label>
                  <input
                    type="tel"
                    value={newStudent.parentContact}
                    onChange={(e) => setNewStudent({ ...newStudent, parentContact: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter contact number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={newStudent.monthlyFee}
                    onChange={(e) => setNewStudent({ ...newStudent, monthlyFee: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter monthly fee"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Join Date
                  </label>
                  <input
                    type="date"
                    value={newStudent.joinDate}
                    onChange={(e) => setNewStudent({ ...newStudent, joinDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={addStudent}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Add Student
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;