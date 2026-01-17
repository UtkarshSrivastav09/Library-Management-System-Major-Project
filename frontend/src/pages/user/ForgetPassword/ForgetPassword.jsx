import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./ForgotPassword.css";

const SERVER_URL = "http://localhost:5000";

function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const payload = {
        email: data.email.trim(),
      };

      const res = await axios.post(
        `${SERVER_URL}/api/users/forgot-password`,
        payload,
        { timeout: 10000 } // 10 sec safety timeout
      );

      alert(res.data.message || "OTP sent successfully");

      navigate("/verifyotp", {
        state: { email: payload.email },
      });

    } catch (err) {
      console.error("Forgot password error:", err);

      if (err.response) {
        alert(err.response.data.message || "Server error");
      } else if (err.request) {
        alert("Server not responding. Try again later.");
      } else {
        alert("Something went wrong");
      }
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2 className="forgot-password-title">Forgot Password</h2>

        <p className="forgot-password-subtitle">
          Enter your email to receive a password reset OTP
        </p>

        <form
          className="forgot-password-form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="forgot-password-form-group">
            <label htmlFor="email" className="forgot-password-label">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your registered email"
              className={`forgot-password-input ${
                errors.email ? "input-error" : ""
              }`}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />

            {errors.email && (
              <p className="forgot-password-error">
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="forgot-password-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <div className="forgot-password-footer">
          Remember your password?{" "}
          <Link to="/login" className="forgot-password-login-link">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
