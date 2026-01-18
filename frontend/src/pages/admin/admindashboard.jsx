import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import "./AdminDashboard.css";

const SERVER_URL = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const [selectedSection, setSelectedSection] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [librarians, setLibrarians] = useState([]);
  const [books, setBooks] = useState([]);
  const [latestBooks, setLatestBooks] = useState([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0); // active students
  const [totalCategories, setTotalCategories] = useState(0);
  const [borrowRequests, setBorrowRequests] = useState(0);
  const [issuedCount, setIssuedCount] = useState(0);
  const [occupancyPercent, setOccupancyPercent] = useState(0);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [categoryData, setCategoryData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ["#3498db", "#f39c12", "#9b59b6", "#e74c3c", "#2ecc71"],
      },
    ],
  });

  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("role");

  // ================= GET USERS =================
  const getUsers = async () => {
    try {
      const { data } = await axios.get(`${SERVER_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allUsers = Array.isArray(data.users) ? data.users : [];
      const students = allUsers.filter((u) => u.role === "user");
      const libs = allUsers.filter((u) => u.role === "librarian");

      setUsers(students);
      setLibrarians(libs);
      setTotalUsers(allUsers.length);
      setActiveUsers(students.length); // assuming all students are active
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // ================= GET BOOKS =================
  const getBooks = async () => {
    try {
      const { data } = await axios.get(`${SERVER_URL}/api/books`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const bookList = Array.isArray(data.books) ? data.books : [];
      setBooks(bookList);
      setTotalBooks(bookList.length);

      // ===== Category distribution =====
      const categoryCount = bookList.reduce((acc, book) => {
        const category = book.category || "Uncategorized";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      setCategoryData({
        labels: Object.keys(categoryCount),
        datasets: [
          {
            data: Object.values(categoryCount),
            backgroundColor: ["#3498db", "#f39c12", "#9b59b6", "#e74c3c", "#2ecc71"],
          },
        ],
      });

      setTotalCategories(Object.keys(categoryCount).length);
    } catch (error) {
      console.error("Error fetching books:", error.response?.data?.message || error.message);
    }
  };

  // ================= GET LATEST BOOKS =================
  const getLatestBooks = async () => {
    try {
      const { data } = await axios.get(`${SERVER_URL}/api/books/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const latest = Array.isArray(data.books) ? data.books : [];
      setLatestBooks(latest);
    } catch (error) {
      console.error("Error fetching latest books:", error);
    }
  };

  // ================= GET BORROW STATS =================
  const getBorrowStats = async () => {
    try {
      const { data } = await axios.get(`${SERVER_URL}/api/admin/borrow-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBorrowRequests(data.requested || 0);
      setIssuedCount(data.issued || 0);
      setOccupancyPercent(
        totalBooks > 0 ? Math.round((data.issued / totalBooks) * 100) : 0
      );
    } catch (error) {
      console.error("Error fetching borrow stats:", error);
    }
  };

  // ================= GET ISSUED BOOKS =================
  const getIssuedBooks = async () => {
    try {
      const { data } = await axios.get(`${SERVER_URL}/api/admin/issued-books`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIssuedBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching issued books:", error.response?.data?.message || error.message);
    }
  };

  // ================= HANDLE SECTION =================
  const handleSectionChange = (section) => setSelectedSection(section);

  useEffect(() => {
    getUsers();
    getBooks();
    getLatestBooks();
  }, []);

  useEffect(() => {
    if (totalBooks > 0) {
      getBorrowStats();
    }
  }, [totalBooks]);

  useEffect(() => {
    if (selectedSection === "issued") {
      getIssuedBooks();
    }
  }, [selectedSection]);

  // ================= RENDER =================
  return (
    <div className="admin-dashboard">
      <div className="row g-0">
        {/* Sidebar */}
        <nav className="col-md-3 col-lg-2 admin-sidebar">
          <h4 className="admin-sidebar-title">
            {role === "admin" ? "📌 Admin Panel" : "📌 Librarian Panel"}
          </h4>
          <ul className="admin-nav">
            {["dashboard", "users", "librarians", "books", "issued"].map((section) => {
              if (section === "librarians" && role !== "admin") return null;
              const labels = {
                dashboard: "📊 Dashboard",
                users: "👥 Users",
                librarians: "📚 Librarians",
                books: "📖 Books",
                issued: "📕 Issued Books",
              };
              return (
                <li key={section} className="admin-nav-item">
                  <button
                    className={`admin-nav-btn ${selectedSection === section ? "active" : ""}`}
                    onClick={() => handleSectionChange(section)}
                  >
                    {labels[section]}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Main */}
        <main className="col-md-9 col-lg-10 admin-main">
          {selectedSection === "dashboard" && (
            <>
              <h2 className="admin-section-title">📊 Dashboard Overview</h2>
              <div className="stats-grid">
                <div className="stat-card books">
                  <h3>Total Books</h3>
                  <p>{totalBooks}</p>
                </div>
                <div className="stat-card users">
                  <h3>Total Users</h3>
                  <p>{totalUsers}</p>
                </div>
                <div className="stat-card active-users">
                  <h3>Active Students</h3>
                  <p>{activeUsers}</p>
                </div>
                <div className="stat-card categories">
                  <h3>Total Categories</h3>
                  <p>{totalCategories}</p>
                </div>
                {role === "admin" && (
                  <div className="stat-card librarians">
                    <h3>Total Librarians</h3>
                    <p>{librarians.length}</p>
                  </div>
                )}
                <div className="stat-card borrow">
                  <h3>Borrow Requests</h3>
                  <p>{borrowRequests}</p>
                </div>
                <div className="stat-card issued">
                  <h3>Books Issued</h3>
                  <p>{issuedCount}</p>
                </div>
              </div>

              <div className="progress-grid">
                <div className="progress-card">
                  <h3>Books Issued Progress</h3>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${occupancyPercent}%` }}>
                      {occupancyPercent}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="chart-activity-grid">
                <div className="chart-card">
                  <h3>Category Distribution</h3>
                  <div style={{ height: "250px" }}>
                    <Pie data={categoryData} options={{ maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }} />
                  </div>
                </div>

                <div className="activity-card">
                  <h3>Recent Addition</h3>
                  <div className="activity-list">
                    {latestBooks.slice(0, 4).map((book, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-icon">📚</div>
                        <div className="activity-text">
                          <strong>{book.title}</strong> added on{" "}
                          {new Date(book.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Users Section */}
          {selectedSection === "users" && (
            <>
              <h2 className="admin-section-title">👥 Users Management</h2>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Stream</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u._id}>
                        <td>{i + 1}</td>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.stream || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Librarians Section */}
          {selectedSection === "librarians" && role === "admin" && (
            <>
              <h2 className="admin-section-title">📚 Librarians Management</h2>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {librarians.map((lib, i) => (
                      <tr key={lib._id}>
                        <td>{i + 1}</td>
                        <td>{lib.name}</td>
                        <td>{lib.email}</td>
                        <td>{lib.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Books Section */}
          {selectedSection === "books" && (
            <>
              <h2 className="admin-section-title">📖 Books Inventory</h2>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Category</th>
                      <th>Total Copies</th>
                      <th>Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((b, i) => (
                      <tr key={b._id}>
                        <td>{i + 1}</td>
                        <td>{b.title}</td>
                        <td>{b.author}</td>
                        <td>{b.category || "-"}</td>
                        <td>{b.totalCopies || 0}</td>
                        <td>{b.availableCopies || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Issued Books Section */}
          {selectedSection === "issued" && (
            <>
              <h2 className="admin-section-title">📕 Issued Books</h2>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Book</th>
                      <th>Issued Date</th>
                      <th>Return Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issuedBooks.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center" }}>No books issued</td>
                      </tr>
                    ) : (
                      issuedBooks.map((item, i) => (
                        <tr key={item._id}>
                          <td>{i + 1}</td>
                          <td>{item.user?.name}</td>
                          <td>{item.book?.title}</td>
                          <td>{new Date(item.issueDate).toLocaleDateString()}</td>
                          <td>{new Date(item.returnDate).toLocaleDateString()}</td>
                          <td>{item.status}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
