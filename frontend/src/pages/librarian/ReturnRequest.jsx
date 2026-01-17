import React, { useEffect, useState } from "react";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";

const SERVER_URL = "http://localhost:5000/api/librarian";

export default function ReturnRequest() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("authToken");

  // ================= FETCH RETURN REQUESTS =================
  const fetchReturnRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${SERVER_URL}/returnrequest`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRequests(res.data.requests || []);
    } catch (err) {
      console.error("Error fetching return requests:", err);
      showErrorToast("Failed to fetch return requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnRequests();
  }, []);

  // ================= APPROVE RETURN =================
  const approveReturn = async (id) => {
    try {
      const res = await axios.put(
        `${SERVER_URL}/approvereturnrequest/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      showSuccessToast(res.data.message || "Book returned successfully");

      // Remove approved return from list
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Error approving return:", err);
      showErrorToast(
        err.response?.data?.message || "Return approval failed"
      );
    }
  };

  // ================= STATUS FORMAT =================
  const formatStatus = (status) => {
    switch (status) {
      case "issued":
        return "Issued";
      case "return_requested":
        return "Return Requested";
      case "returned":
        return "Returned";
      default:
        return status;
    }
  };

  if (loading) {
    return <div className="container mt-5">Loading return requests...</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">📚 Return Requests</h2>

      {requests.length === 0 ? (
        <div className="alert alert-info">No return requests</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-primary">
              <tr>
                <th>User</th>
                <th>Book</th>
                <th>Fine</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((r) => (
                <tr key={r._id}>
                  <td>{r.userId?.name || "N/A"}</td>
                  <td>{r.bookId?.title || "N/A"}</td>
                  <td>₹{r.fine || 0}</td>
                  <td>
                    <span
                      className={`badge ${
                        r.status === "issued"
                          ? "bg-success"
                          : r.status === "return_requested"
                          ? "bg-warning text-dark"
                          : "bg-secondary"
                      }`}
                    >
                      {formatStatus(r.status)}
                    </span>
                  </td>
                  <td>
                    {r.status === "return_requested" ? (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => approveReturn(r._id)}
                      >
                        ✅ Approve Return
                      </button>
                    ) : (
                      "-"
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
