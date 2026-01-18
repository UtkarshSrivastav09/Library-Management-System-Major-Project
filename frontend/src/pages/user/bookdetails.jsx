import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaBookOpen, FaTags, FaBarcode, FaRupeeSign, FaInfoCircle } from "react-icons/fa";
import { RiBookmarkLine } from "react-icons/ri";
import "./bookdetails.css";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";

const SERVER_URL = import.meta.env.VITE_API_URL;

function BookDetails() {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isIssuing, setIsIssuing] = useState(false);

    // ✅ FIXED: Issue book
    async function issueBook(bookid) {
        try {
            setIsIssuing(true);
            const authToken = localStorage.getItem("authToken");

            if (!authToken) {
                showErrorToast("Please login to issue a book.");
                return;
            }

            // ✅ Add await here
            const { data } = await axios.post(
                `${SERVER_URL}/api/borrow/request-issue/${bookid}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            if (data?.error) {
                showErrorToast(data.message);
            } else {
                showSuccessToast(data.message || "Book issued successfully!");
            }
        } catch (err) {
            console.error("Issue book error:", err);
            showErrorToast(
                err.response?.data?.message || "Something went wrong!"
            );
        } finally {
            setIsIssuing(false);
        }
    }

    // ✅ FIXED: Fetch book details
    useEffect(() => {
        async function fetchBook() {
            try {
                setIsLoading(true);

                const { data } = await axios.get(
                    `${SERVER_URL}/api/books/${id}`
                );

                setBook(data.book); // ✅ IMPORTANT
                setError(null);
            } catch (err) {
                console.error("Error fetching book:", err);
                setError("Failed to load book details.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchBook();
    }, [id]);

    // ---------------- UI STATES ----------------

    if (isLoading) {
        return (
            <div className="loading-container">
                <motion.div
                    className="spinner"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                />
                <p>Loading book details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <motion.div className="error-message">
                {error}
            </motion.div>
        );
    }

    if (!book) {
        return (
            <div className="not-found-container">
                <RiBookmarkLine className="not-found-icon" />
                <h2>Book Not Found</h2>
            </div>
        );
    }

    // ---------------- MAIN UI ----------------

    return (
        <motion.div className="book-details-container">
            <div className="book-details">
                <div className="book-cover">
                    <img
                        src={book.coverImage || "https://via.placeholder.com/150x200?text=No+Cover"}
                        alt={book.title}
                        className="book-image"
                    />
                    <div className={`availability-badge ${book.availableCopies > 0 ? "available" : "unavailable"}`}>
                        {book.availableCopies > 0
                            ? `${book.availableCopies} Available`
                            : "Out of Stock"}
                    </div>
                </div>

                <div className="book-info">
                    <h1>{book.title}</h1>
                    <p>by {book.author}</p>

                    <div className="book-meta">
                        <p><FaTags /> {book.category}</p>
                        <p><FaBarcode /> {book.isbn}</p>
                        <p><FaRupeeSign /> ₹{book.price}</p>
                    </div>

                    <div className="book-description">
                        <h3><FaInfoCircle /> Description</h3>
                        <p>{book.description}</p>
                    </div>

                    <motion.button
                        className="issue-button"
                        disabled={book.availableCopies <= 0 || isIssuing}
                        onClick={() => issueBook(book._id)}
                    >
                        <FaBookOpen />
                        {isIssuing
                            ? "Processing..."
                            : book.availableCopies > 0
                                ? "Issue This Book"
                                : "Out of Stock"}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}

export default BookDetails;
