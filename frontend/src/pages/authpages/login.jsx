import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./login.css"
const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/users/login",
        { phoneNumber, password },
        { withCredentials: true }
      );
      console.log("Login successfull")
       const userDepartment = response.data?.data?.user?.department;

        if (userDepartment === "Logistics and Operation Planning") {
          navigate("/admin-dashboard");
        } else if (userDepartment === "Driver") {
          navigate("/");
        } else {
          setError("Unknown user department");
        }
      
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2 className="login-title">Login</h2>
        {error && <p className="login-error">{error}</p>}
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">Login</button>
        <p>Don't have a account? <Link to="/register"> Create one</Link></p>
      </form>
    </div>
  );
};

export default Login;
