import { useEffect, useState } from "react";
import axios from "axios";
import "./books.css";
import { useNavigate } from "react-router-dom";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";

const SERVER_URL = import.meta.env.VITE_API_URL;

const Books = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [categories, setCategories] = useState(["All"]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);


  const navigate = useNavigate();

  // ✅ ISSUE BOOK HANDLER
  const issueBook = async (bookid) => {
    try {
      const authToken = localStorage.getItem("authToken");

      if (!authToken) {
        showErrorToast("Please login to issue a book.");
        return;
      }

      const { data } = await axios.post(
        `${SERVER_URL}/api/borrow/request-issue/${bookid}`,
        {},
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (data?.error) {
        showErrorToast(data.message);
      } else {
        showSuccessToast(data.message || "Book issue requested successfully!");
      }
    } catch (error) {
      console.error("Issue book error:", error);
      showErrorToast(
        error.response?.data?.message || "Something went wrong! Please try again."
      );
    }
  };

  const bookDetails = (bookid) => {
    navigate(`/bookdetails/${bookid}`);
  };

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`${SERVER_URL}/api/books`)
      .then((response) => {
        const booksData = Array.isArray(response.data?.books)
          ? response.data.books
          : [];
        setBooks(booksData);
        setFilteredBooks(booksData);

        const uniqueCategories = [
          "All",
          ...new Set(
            booksData.map((book) => book.category).filter(Boolean)
          ),
        ];
        setCategories(uniqueCategories);
      })
      .catch((error) => {
        console.error("Error fetching books:", error);
        setBooks([]);
        setFilteredBooks([]);
        setCategories(["All"]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterBooks(value, selectedCategory);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    filterBooks(searchTerm, category);
  };

  const filterBooks = (search, category) => {
    let filtered = [...books];
    if (category !== "All") {
      filtered = filtered.filter((book) => book.category === category);
    }
    if (search) {
      filtered = filtered.filter((book) =>
        book.title?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredBooks(filtered);
  };

  /* ================= RETURN BOOK ================= */
  const returnBook = async (bookId) => {
    try {
      const authToken = localStorage.getItem("authToken");

      if (!authToken) {
        showErrorToast("Please login to return a book.");
        return;
      }

      const { data } = await axios.post(
        `${SERVER_URL}/api/borrow/request-return/${bookId}`,
        {},
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      data?.error
        ? showErrorToast(data.message)
        : showSuccessToast("Return request sent to librarian!");
    } catch (error) {
      showErrorToast(
        error.response?.data?.message || "Return request failed!"
      );
    }
  };

  return (
    <div className="container-fluid books-container">
      <div className="row">
        {/* SIDEBAR */}
        <div className="col-md-3 p-4 sidebar">
          <h4 className="text-center mb-4">📚 Categories</h4>
          <div className="category-scroll">
            {categories.map((category, index) => (
              <div
                key={index}
                className={`category-item ${selectedCategory === category ? "active" : ""
                  }`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </div>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="col-md-9 main-content">
          <div className="search-header p-3">
            <h2 className="page-title">All Books</h2>
            <div className="search-box">
              <input
                type="text"
                className="form-control"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className="books-grid">
              {filteredBooks.map((book) => (
                <div key={book._id} className="book-card">
                  <div className="card-image-container">
                    <img
                      src={
                        book.coverImage ||
                        "https://via.placeholder.com/150x200?text=No+Cover"
                      }
                      className="card-image"
                      alt={book.title}
                    />
                    <div className="book-badge">{book.category}</div>
                  </div>

                  <div className="card-body">
                    <h5 className="card-title">{book.title}</h5>
                    <p className="card-author">By {book.author}</p>

                    <div className="card-footer">
                      <span className="card-price">₹{book.price}</span>
                      <div className="card-actions">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => bookDetails(book._id)}
                        >
                          Details
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => issueBook(book._id)}
                        >
                          Issue
                        </button>

                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => returnBook(book._id)}
                        >
                          Return
                        </button>

                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-books-found">
              <h4>No books found!</h4>
              <p>Try adjusting your search or category filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Books;
