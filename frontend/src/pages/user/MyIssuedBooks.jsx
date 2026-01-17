import React, { useEffect, useState } from "react";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";

const SERVER_URL = "http://localhost:5000/api/librarian";

export default function MyIssuedBooks() {
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("authToken");
  const userId = localStorage.getItem("userId"); // store logged-in user id in localStorage

  // ================= FETCH ISSUED BOOKS =================
  const fetchIssuedBooks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${SERVER_URL}/bookissued`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter only books issued to the current user
      const userBooks = (res.data.issuedBooks || []).filter(
        (b) => b.userId?._id === userId
      );

      setIssuedBooks(userBooks);
    } catch (err) {
      console.error("Error fetching issued books:", err);
      showErrorToast("Failed to fetch your issued books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssuedBooks();
  }, []);

  // ================= REQUEST RETURN =================
  const requestReturn = async (borrowId) => {
    try {
      const res = await axios.put(
        `${SERVER_URL}/request-return/${borrowId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showSuccessToast(res.data.message || "Return request sent!");

      // Update local status
      setIssuedBooks((prev) =>
        prev.map((b) =>
          b._id === borrowId ? { ...b, status: "return_requested" } : b
        )
      );
    } catch (err) {
      console.error("Error requesting return:", err);
      showErrorToast("Failed to request return");
    }
  };

  if (loading)
    return <div className="container mt-5">Loading your issued books...</div>;

  return (
    <div className="container mt-5">
      <h2>📚 My Issued Books</h2>

      {issuedBooks.length === 0 ? (
        <div className="alert alert-info">You have no issued books.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-primary">
              <tr>
                <th>Book Title</th>
                <th>Author</th>
                <th>Issue Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {issuedBooks.map((b) => (
                <tr key={b._id}>
                  <td>{b.bookId?.title || "N/A"}</td>
                  <td>{b.bookId?.author || "N/A"}</td>
                  <td>
                    {b.issueDate
                      ? new Date(b.issueDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        b.status === "issued"
                          ? "bg-success"
                          : b.status === "return_requested"
                          ? "bg-warning text-dark"
                          : "bg-secondary"
                      }`}
                    >
                      {b.status === "issued"
                        ? "Issued"
                        : b.status === "return_requested"
                        ? "Return Requested"
                        : b.status}
                    </span>
                  </td>
                  <td>
                    {b.status === "issued" ? (
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => requestReturn(b._id)}
                      >
                        🔁 Request Return
                      </button>
                    ) : (
                      <span>Waiting for approval</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
