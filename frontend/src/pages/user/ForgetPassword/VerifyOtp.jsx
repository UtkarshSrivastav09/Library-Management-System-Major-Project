import { useForm } from "react-hook-form";
import axios from "axios";
// import { Server_URL } from "../../../utils/config";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "./VerifyOtp.css";

const Server_URL = "http://localhost:5000";

function VerifyOTP() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  useEffect(() => {
    if (email) setValue("email", email);
  }, [email, setValue]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        email: (data.email || email).trim(),
        otp: data.otp.toString()
      };

      const res = await axios.post(
        `${Server_URL}/api/users/verify-otp`,
        payload
      );

      alert(res.data.message);
      navigate("/resetpass", { state: { email: payload.email } });

    } catch (err) {
      alert(err.response?.data?.message || "Invalid or expired OTP");
    }
  };


  const resendOTP = async () => {
    try {
      await axios.post(`${Server_URL}/users/resend-otp`, { email });
      alert("OTP resent successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="verify-otp-container">
      <div className="verify-otp-card">
        <h2>Verify OTP</h2>
        <p>We've sent a 6-digit code to <b>{email}</b></p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="verify-otp-form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your registered email"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <p className="verify-otp-error">{errors.email.message}</p>}
          </div>

          <div className="verify-otp-form-group">
            <label>OTP Code</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit code"
              {...register("otp", {
                required: "OTP is required",
                pattern: { value: /^[0-9]{6}$/, message: "OTP must be 6 digits" }
              })}
            />
            {errors.otp && <p className="verify-otp-error">{errors.otp.message}</p>}
            <button type="button" className="resend-color" onClick={resendOTP}>Resend OTP</button>
          </div>

          <button type="submit" className="veri-otp" disabled={isSubmitting}>
            {isSubmitting ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default VerifyOTP;