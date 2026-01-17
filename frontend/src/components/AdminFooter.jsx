import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiLinkedin,
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock
} from 'react-icons/fi';
import './footer.css';

const AdminFooter = () => {

  const handleLinkClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="library-footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-column">
            <h3 className="footer-heading">About Us</h3>
            <p className="footer-about-text">
              The Utkarsh Library serves as the academic hub of our institution,
              providing resources and services to support learning, teaching,
              and research for our students and faculty.
            </p>
            <div className="footer-social">
              <a href="https://www.facebook.com" target="_blank" className="social-icon" aria-label="Facebook">
                <FiFacebook />
              </a>
              <a href="https://github.com/UtkarshSrivastav09" target="_blank" className="social-icon" aria-label="Twitter">
                <FiTwitter />
              </a>
              <a href="https://www.instagram.com" target="_blank" className="social-icon" aria-label="Instagram">
                <FiInstagram />
              </a>
              <a href="https://www.linkedin.com/in/utkarsh-srivastav-b433bb33a/" target="_blank" className="social-icon" aria-label="LinkedIn">
                <FiLinkedin />
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/admin" className="footer-link" onClick={handleLinkClick}>Dashboard</Link></li>
              <li><Link to="/admin/viewbook" className="footer-link" onClick={handleLinkClick}>View Books</Link></li>
              <li><Link to="/admin/addbook" className="footer-link" onClick={handleLinkClick}>Add Books</Link></li>
              <li><Link to="/admin/issued" className="footer-link" onClick={handleLinkClick}>Books Borrowed</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading">Contact Us</h3>
            <ul className="footer-contact-info">
              <li className="contact-item">
                <FiMapPin className="contact-icon" />
                <span>Goel Institute Of Higher Studies, Lucknow, UP</span>
              </li>
              <li className="contact-item">
                <FiMail className="contact-icon" />
                <span>library@utkarsh.edu</span>
              </li>
              <li className="contact-item">
                <FiPhone className="contact-icon" />
                <span>(123) 456-7890</span>
              </li>
              <li className="contact-item">
                <FiClock className="contact-icon" />
                <div>
                  <p>Mon-Fri: 8:00 AM - 10:00 PM</p>
                  <p>Sat-Sun: 10:00 AM - 6:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} Utkarsh Library. All rights reserved.
          </div>
          <div className="footer-legal">
            <a
              href="/public/assets/privacy.pdf"
              className="legal-link"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
            >
              Privacy Policy
            </a>

            <a
              href="/public/assets/Terms Of Use.pdf"
              className="legal-link"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
            >
              Terms Of Use
            </a>
            <Link to="/accessibility" className="legal-link" target='_blank' onClick={handleLinkClick}>Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;

