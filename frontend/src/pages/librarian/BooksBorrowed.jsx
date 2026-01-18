import React, { useEffect, useState } from "react";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";

const SERVER_URL = import.meta.env.VITE_API_URL + '/api' ;
 
export default function BooksBorrowed() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("role"); // "admin" or "librarian"

  // Determine API endpoint based on role
  const getEndpoint = () => {
    if (role === "admin") return `${SERVER_URL}/admin/issued-books`;
    return `${SERVER_URL}/librarian/issuerequest`;
  };

  // Fetch issue records
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await axios.get(getEndpoint(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Admin route returns array directly, librarian route returns { requests: [...] }
      const data = role === "admin" ? res.data : res.data.requests || [];
      setRecords(data);
    } catch (err) {
      console.error("Fetch issue records error:", err);
      showErrorToast("Failed to fetch issue requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [role]);

  // Approve a request (only for librarians)
  const approveIssue = async (id) => {
    if (role !== "librarian") return;
    try {
      const res = await axios.put(
        `${SERVER_URL}/librarian/approverequest/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showSuccessToast(res.data.message || "Book issued successfully");
      setRecords((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: "issued" } : r))
      );
    } catch (err) {
      console.error(err);
      showErrorToast(err.response?.data?.message || "Issue approval failed");
    }
  };

  // Cancel a request (only for librarians)
  const cancelRequest = async (id) => {
    if (role !== "librarian") return;
    try {
      const res = await axios.delete(`${SERVER_URL}/librarian/cancelrequest/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showSuccessToast(res.data.message);
      setRecords((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
      showErrorToast(err.response?.data?.message || "Failed to cancel request");
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case "requested":
        return "Requested";
      case "issued":
        return "Issued";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  if (loading) return <div className="container mt-5">Loading...</div>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4">📚 Borrowed Books</h2>

      {records.length === 0 ? (
        <div className="alert alert-info">No borrow records found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-primary">
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Book</th>
                <th>Request Date</th>
                <th>Status</th>
                {role === "librarian" && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id}>
                  <td>{r.userId?.name || r.user?.name || "N/A"}</td>
                  <td>{r.userId?.email || r.user?.email || "N/A"}</td>
                  <td>{r.bookId?.title || r.book?.title || "N/A"}</td>
                  <td>
                    {r.requestDate
                      ? new Date(r.requestDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        r.status === "issued"
                          ? "bg-success"
                          : r.status === "requested"
                          ? "bg-warning text-dark"
                          : "bg-secondary"
                      }`}
                    >
                      {formatStatus(r.status)}
                    </span>
                  </td>
                  {role === "librarian" && (
                    <td>
                      {r.status === "requested" && (
                        <>
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() => approveIssue(r._id)}
                          >
                            ✅ Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => cancelRequest(r._id)}
                          >
                            ❌ Cancel
                          </button>
                        </>
                      )}
                      {r.status === "issued" && <span className="text-muted">Issued</span>}
                      {r.status === "cancelled" && (
                        <span className="text-muted">Cancelled</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
