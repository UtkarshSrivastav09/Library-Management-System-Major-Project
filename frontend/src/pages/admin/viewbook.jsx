import { useState, useEffect } from "react";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";
import "./viewbook.css";

const SERVER_URL = import.meta.env.VITE_API_URL;

const ViewBooks = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    isbn: "",
    price: "",
    totalCopies: "",
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  // ================= FETCH BOOKS =================
  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/books`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      console.log("📚 ViewBooks API:", response.data);

      const bookList = Array.isArray(response.data)
        ? response.data
        : response.data.books || response.data.data || [];

      setBooks(bookList);
    } catch (error) {
      console.error(
        "Error fetching books:",
        error.response?.data || error.message
      );
      showErrorToast("Failed to load books");
    }
  };

  // ================= DELETE BOOK =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;

    try {
      await axios.delete(`${SERVER_URL}/api/books/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      showSuccessToast("Book deleted successfully!");
      fetchBooks();
    } catch (error) {
      console.error(
        "Error deleting book:",
        error.response?.data || error.message
      );
      showErrorToast("Failed to delete book!");
    }
  };

  // ================= EDIT BOOK =================
  const handleEdit = (book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title || "",
      author: book.author || "",
      category: book.category || "",
      isbn: book.isbn || "",
      price: book.price || "",
      totalCopies: book.totalCopies || "",
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ================= UPDATE BOOK =================
  const handleUpdate = async () => {
    try {
      await axios.put(
        `${SERVER_URL}/api/books/update/${selectedBook._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      showSuccessToast("Book updated successfully!");
      setShowModal(false);
      fetchBooks();
    } catch (error) {
      console.error(
        "Error updating book:",
        error.response?.data || error.message
      );
      showErrorToast("Failed to update book!");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="admin-book-heading">📖 Manage Library Books</h2>

      <div className="row">
        {books.length > 0 ? (
          books.map((book) => (
            <div key={book._id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
              <div className="card book-card">
                <div className="book-image-wrapper">
                  <img
                    src={book.coverImage || "https://via.placeholder.com/200"}
                    className="book-image"
                    alt={book.title}
                  />
                </div>

                <div className="card-body">
                  <h5 className="card-title">{book.title}</h5>
                  <p className="book-author">{book.author}</p>
                  <p className="book-category">📚 {book.category || "-"}</p>
                  <p className="book-isbn">🔢 ISBN: {book.isbn}</p>
                  <p className="book-price">💰 ₹{book.price}</p>
                </div>

                <div className="card-footer text-center">
                  <button
                    className="btn edit-btn me-2"
                    onClick={() => handleEdit(book)}
                  >
                    ✏ Edit
                  </button>
                  <button
                    className="btn delete-btn"
                    onClick={() => handleDelete(book._id)}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <h5 className="text-muted">No books found.</h5>
          </div>
        )}
      </div>

      {/* ================= EDIT MODAL ================= */}
      {showModal && selectedBook && (
        <div className="modal d-block">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Edit Book</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">
                <input className="form-control mb-2" name="title" value={formData.title} onChange={handleChange} />
                <input className="form-control mb-2" name="author" value={formData.author} onChange={handleChange} />
                <input className="form-control mb-2" name="category" value={formData.category} onChange={handleChange} />
                <input className="form-control mb-2" name="isbn" value={formData.isbn} onChange={handleChange} />
                <input className="form-control mb-2" name="price" type="number" value={formData.price} onChange={handleChange} />
                <input className="form-control" name="totalCopies" type="number" value={formData.totalCopies} onChange={handleChange} />
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-success" onClick={handleUpdate}>
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewBooks;
