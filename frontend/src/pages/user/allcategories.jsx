import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Loader from "../../components/Preloader";
import { showErrorToast } from "../../utils/toasthelper";
import "./allcategories.css";

// ✅ Backend URL (Vite-safe)
const SERVER_URL = "http://localhost:5000";

export default function ViewAllCategories() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);

  // ✅ Fetch books safely
  const fetchCategories = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(`${SERVER_URL}/api/books`);

      const booksData = Array.isArray(data)
        ? data
        : Array.isArray(data?.books)
          ? data.books
          : [];


      setBooks(booksData);
      setFilteredBooks(booksData);

      const countMap = {};
      booksData.forEach((book) => {
        if (book?.category) {
          countMap[book.category] = (countMap[book.category] || 0) + 1;
        }
      });

      setCategoryCounts(countMap);
    } catch (error) {
      console.error("Error fetching categories:", error);
      showErrorToast("Failed to load categories");
      setBooks([]);
      setFilteredBooks([]);
      setCategoryCounts({});
    } finally {
      setLoading(false);
    }
  };

  // ✅ Category filter
  const handleCategoryClick = (category) => {
    setActiveCategory(category);

    if (category === "All") {
      setFilteredBooks(books);
    } else {
      setFilteredBooks(
        books.filter((book) => book.category === category)
      );
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ Unique categories
  const uniqueCategories = [
    "All",
    ...new Set(books.map((b) => b.category).filter(Boolean)),
  ];

  return (
    <div className="all-categories-container">
      <div className="all-categories-row">

        {/* SIDEBAR */}
        <nav className="all-categories-sidebar">
          <h5 className="all-categories-sidebar-title">Categories</h5>
          <ul className="all-categories-nav">
            {uniqueCategories.map((category, index) => (
              <li
                key={index}
                className={`all-categories-nav-item ${activeCategory === category ? "active" : ""
                  }`}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </li>
            ))}
          </ul>
        </nav>

        {/* MAIN CONTENT */}
        <main className="all-categories-main">
          <h2 className="all-categories-main-title">
            Explore All Categories
          </h2>

          {loading ? (
            <Loader />
          ) : filteredBooks.length > 0 ? (
            <div className="all-categories-grid">
              {[...new Set(filteredBooks.map((b) => b.category))].map(
                (category, index) => {
                  const categoryBook = filteredBooks.find(
                    (b) => b.category === category
                  );

                  return (
                    <div key={index} className="all-categories-card-wrapper">
                      <div className="all-categories-card shadow-sm">
                        <img
                          src={
                            categoryBook?.coverImage ||
                            "https://via.placeholder.com/300x400?text=No+Image"
                          }
                          alt={category}
                          className="all-categories-card-img"
                        />

                        <div className="all-categories-card-body">
                          <h5 className="all-categories-card-title">
                            {category}
                          </h5>
                          <p className="text-muted">
                            Books: {categoryCounts[category] || 0}
                          </p>
                          <Link to="/books" className="all-categories-btn">
                            Explore
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div className="all-categories-empty">
              <p>No books found in this category.</p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
