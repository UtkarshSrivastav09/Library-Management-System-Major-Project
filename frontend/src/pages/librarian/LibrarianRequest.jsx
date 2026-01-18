import React, { useEffect, useState } from "react";
import axios from "axios";

const SERVER_URL = "import.meta.env.VITE_API_URL";

export default function BooksBorrowed() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("authToken");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${SERVER_URL}/librarian/bookissued`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRequests(res.data.issuedBooks || []);
    } catch (err) {
      setError("Failed to fetch issued books");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) return <div className="container mt-5">Loading...</div>;
  if (error) return <div className="container mt-5 alert alert-danger">{error}</div>;

  return (
    <div className="container mt-5">
      <h2>📚 Issued Books</h2>

      {requests.length === 0 ? (
        <div className="alert alert-info">No books issued yet.</div>
      ) : (
        <table className="table table-bordered">
          <thead className="table-primary">
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Book</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r._id}>
                <td>{r.userId?.name}</td>
                <td>{r.userId?.email}</td>
                <td>{r.bookId?.title}</td>
                <td>{r.issueDate ? new Date(r.issueDate).toLocaleDateString() : "—"}</td>
                <td>{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "—"}</td>
                <td>
                  <span
                    className={`badge ${r.status === "issued"
                        ? "bg-success"
                        : r.status === "requested"
                          ? "bg-warning text-dark"
                          : r.status === "return_requested"
                            ? "bg-info text-dark"
                            : "bg-secondary"
                      }`}
                  >
                    {r.status}
                  </span>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
