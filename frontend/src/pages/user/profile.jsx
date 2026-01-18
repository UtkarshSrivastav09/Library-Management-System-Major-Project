import { useEffect, useState } from "react";
import axios from "axios";
import "./profile.css";
import { getAuthToken } from "../../utils/auth";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";

// ✅ Backend URL
const SERVER_URL = import.meta.env.VITE_API_URL;

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [issuedRequests, setIssuedRequests] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch profile
  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        `${SERVER_URL}/api/users/profile`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      setUser(response.data.user);
    } catch (error) {
      console.error("Profile error:", error);
      showErrorToast("Failed to load profile");
    }
  };

  // 🔹 Fetch issued books
  const fetchIssuedBooks = async () => {
    try {
      const response = await axios.get(
        `${SERVER_URL}/api/books/issued`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      const books = response.data.issuedBooks || [];

      setIssuedBooks(books.filter(b => b.status === "Issued"));
      setIssuedRequests(books.filter(b => b.status === "Requested"));
      setReturnRequests(books.filter(b => b.status === "Requested Return"));
    } catch (error) {
      console.error("Books error:", error);
    }
  };

  // 🔹 Return book
  const returnBook = async (borrowId) => {
    try {
      const response = await axios.put(
        `${SERVER_URL}/api/books/returnrequest/${borrowId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      showSuccessToast(response.data.message);
      fetchIssuedBooks();
    } catch (error) {
      showErrorToast(error.response?.data?.message || "Something went wrong!");
    }
  };

  useEffect(() => {
    Promise.all([fetchProfile(), fetchIssuedBooks()])
      .finally(() => setLoading(false));
  }, []);

  // 🔹 Loading state
  if (loading) {
    return <p className="loading">Loading...</p>;
  }

  if (!user) {
    return <p className="loading">No profile data</p>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-info card">
          <h1>{user.name}</h1>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>

        <div className="profile-sections">

          {/* Issued Books */}
          <div className="section-card issued-books">
            <h2>📚 Issued Books</h2>
            {issuedBooks.length === 0 ? (
              <p>No books currently issued.</p>
            ) : (
              <table>
                <tbody>
                  {issuedBooks.map(book => (
                    <tr key={book._id}>
                      <td>{book.bookId.title}</td>
                      <td>{new Date(book.issueDate).toLocaleDateString()}</td>
                      <td>{new Date(book.dueDate).toLocaleDateString()}</td>
                      <td>{book.status}</td>
                      <td>₹{book.fine}</td>
                      <td>
                        <button onClick={() => returnBook(book._id)}>
                          Request Return
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Issued Requests */}
          <div className="section-card">
            <h2>📝 Issued Requests</h2>
            {issuedRequests.length === 0
              ? <p>No pending issue requests.</p>
              : issuedRequests.map(b => <p key={b._id}>{b.bookId.title}</p>)
            }
          </div>

          {/* Return Requests */}
          <div className="section-card">
            <h2>🔄 Return Requests</h2>
            {returnRequests.length === 0
              ? <p>No pending return requests.</p>
              : returnRequests.map(b => <p key={b._id}>{b.bookId.title}</p>)
            }
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
