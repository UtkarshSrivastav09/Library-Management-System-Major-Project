import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiBook, FiClock, FiUser, FiCalendar } from "react-icons/fi";
// import { Server_URL } from "../../utils/config";
import Preloader from "../../components/Preloader";
import "./home.css";


const SERVER_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalBooks: 0,
    totalActiveStudents: 0,
  });
  const [loading, setLoading] = useState(true);

  // ✅ FIX: safe API call + defensive defaults
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
       const { data } = await axios.get(`${SERVER_URL}/api/home`);

      if (data && !data.error) {
        setStats({
          totalCategories: data.stats?.totalCategories || 0,
          totalBooks: data.stats?.totalBooks || 0,
          totalActiveStudents: data.stats?.totalActiveStudents || 0,
        });

        setCategories(Array.isArray(data.categories) ? data.categories : []);
        setNewArrivals(Array.isArray(data.newArrivals) ? data.newArrivals : []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <Preloader />;

  return (
    <div className="library-homepage">
      {/* HERO */}
      <header className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <h1 className="hero-title">Welcome to Utkarsh Central Library</h1>
          <p className="hero-subtitle">
            Access academic resources, textbooks, and research materials
          </p>

          <div className="hero-buttons">
            <Link to="/books" className="btn btn-primary">
              <FiBook size={18} className="mr-2" />
              Browse Collections
            </Link>
          </div>
        </div>
      </header>

      {/* STATS */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-cardhome">
              <FiBook className="stat-icon" />
              <h3>{stats.totalCategories}+</h3>
              <p>Total Categories</p>
            </div>

            <div className="stat-cardhome">
              <FiBook className="stat-icon" />
              <h3>{stats.totalBooks}+</h3>
              <p>Total Books</p>
            </div>

            <div className="stat-cardhome">
              <FiUser className="stat-icon" />
              <h3>{stats.totalActiveStudents}</h3>
              <p>Active Students</p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Browse By Categories</h2>
          <p className="section-subtitle">Find resources for your courses</p>

          <div className="categories-grid">
            {categories.map((cat, index) => (
              <div key={index} className="category-card">
                <div className="category-img-container">
                  <img
                    src={cat.coverImage || "/images/default-subject.jpg"}
                    alt={cat.category || "Category"}
                    loading="lazy"
                  />
                </div>
                <div className="category-info">
                  <h3>{cat.category}</h3>
                  <p>Books: {cat.count || 0}</p>
                  <Link
                    to={`/books?category=${cat.category}`}
                    className="btn btn-outline"
                  >
                    View Collection
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/category" className="btn btn-view-all">
              View All Categories
            </Link>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="na-section">
        <div className="na-container">
          <h2 className="na-heading">New Arrivals</h2>
          <p className="na-subheading">Recently added to our collection</p>

          <div className="na-grid-container">
            {newArrivals.map((book, index) => (
              <div key={index} className="na-book-item">
                <div className="na-cover-wrapper">
                  <img
                    src={book.coverImage || "/images/default-book.jpg"}
                    alt={book.title || "Book"}
                    className="na-cover-image"
                    loading="lazy"
                  />
                </div>
                <div className="na-book-info">
                  <h3 className="na-book-title">{book.title}</h3>
                  <p className="na-book-author">{book.author}</p>
                  <span className="na-book-category">{book.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOURS */}
      <section className="hours-section">
        <div className="container">
          <h2 className="section-title">Library Hours</h2>
          <div className="hours-grid">
            <div className="hours-card">
              <FiClock className="hours-icon" />
              <h3>Regular Hours</h3>
              <p>Monday - Friday: 8:00 AM - 8:00 PM</p>
              <p>Saturday: 10:00 AM - 5:00 PM</p>
              <p>Sunday: Closed</p>
            </div>

            <div className="hours-card">
              <FiCalendar className="hours-icon" />
              <h3>Exam Period</h3>
              <p>Monday - Sunday: 7:00 AM - 11:00 PM</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
