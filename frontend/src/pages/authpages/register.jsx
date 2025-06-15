import React, { useState } from "react";
import axios from "axios";
import "./Register.css";
import { Link } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    phoneNumber: "",
    emailId: "",
    adharNo: "",
    password: "",
    department: "",
    vehicleType: "",
    vehicleNumber: "",
    licenseNumber: "",
  });

  const [files, setFiles] = useState({
    Adharphoto: null,
    govtIdProof: null,
    licenseDocument: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFiles((prev) => ({ ...prev, [name]: files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      Object.entries(files).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      const response = await axios.post("http://localhost:3000/api/v1/users/register", data);
      console.log(response.data);
      alert("Registration successful!");
    } catch (err) {
        console.error(err.response?.data || err.message);
      console.error(err);
      alert("Registration failed.");
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Create Account</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label>Full Name:</label>
          <input name="fullname" onChange={handleChange} value={formData.fullname} />
        </div>

        <div className="form-group">
          <label>Phone Number:</label>
          <input name="phoneNumber" onChange={handleChange} value={formData.phoneNumber} />
        </div>

        <div className="form-group">
          <label>Email ID:</label>
          <input name="emailId" onChange={handleChange} value={formData.emailId} />
        </div>

        <div className="form-group">
          <label>Aadhar Number:</label>
          <input name="adharNo" onChange={handleChange} value={formData.adharNo} />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input type="password" name="password" onChange={handleChange} value={formData.password} />
        </div>

        <div className="form-group">
          <label>Department:</label>
          <select name="department" onChange={handleChange} value={formData.department}>
            <option value="">Select Department</option>
            <option value="Driver">Driver</option>
            <option value="Logistics and Operation Planning">Logistics and Operation Planning</option>
          </select>
        </div>

        {formData.department === "Driver" && (
          <>
            <div className="form-group">
              <label>Vehicle Type:</label>
              <input name="vehicleType" onChange={handleChange} value={formData.vehicleType} />
            </div>
            <div className="form-group">
              <label>Vehicle Number:</label>
              <input name="vehicleNumber" onChange={handleChange} value={formData.vehicleNumber} />
            </div>
            <div className="form-group">
              <label>License Number:</label>
              <input name="licenseNumber" onChange={handleChange} value={formData.licenseNumber} />
            </div>
            <div className="form-group">
              <label>License Document:</label>
              <input type="file" name="licenseDocument" onChange={handleFileChange} className="file-input"/>
            </div>
          </>
        )}

        <div className="form-group">
          <label>Aadhar Photo:</label>
          <input type="file" name="Adharphoto" onChange={handleFileChange} className="file-input" />
        </div>

        <div className="form-group">
          <label>Govt ID Proof:</label>
          <input type="file" name="govtIdProof" onChange={handleFileChange} className="file-input"/>
        </div>

        <button type="submit" className="register-button">Submit</button>
        <p>Already have an account <Link to= "/login">Login</Link></p>
      </form>
    </div>
  );
};

export default Register;
