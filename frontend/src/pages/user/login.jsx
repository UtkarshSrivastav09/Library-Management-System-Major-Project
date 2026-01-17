import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./login.css";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";

// ✅ Backend URL (Vite-safe)
const SERVER_URL = "http://localhost:5000";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        `${SERVER_URL}/api/users/login`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { token, user } = response.data;

      localStorage.setItem("authToken", token);
      localStorage.setItem("role", user.role);

      showSuccessToast("Login Successful!");

      if (user.role === "admin" || user.role === "librarian") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      showErrorToast(error.response?.data?.message || "Login Failed!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">User Login</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className="form-input"
            />
            {errors.email && (
              <span className="error-text">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              {...register("password", { required: "Password is required" })}
              className="form-input"
            />
            {errors.password && (
              <span className="error-text">{errors.password.message}</span>
            )}
          </div>

          <div className="forgot-password">
            <button
              type="button"
              className="forgot-btn"
              onClick={() => navigate("/forgetpassword")}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="btn-submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
