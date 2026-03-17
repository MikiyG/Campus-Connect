import "../styles/SignUp.css";
import TopNavbar from "../components/TopNavbar";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import api from "../utils/api";

export default function SignUp() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [university, setUniversity] = useState("");
  const [studentId, setStudentId] = useState("");
  const [batch, setBatch] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [idFile, setIdFile] = useState(null);

  const fullNameRef = useRef(null);
  const universityRef = useRef(null);
  const studentIdRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);
  const idInputRef = useRef(null);

  const focusFirstError = (fieldErrors) => {
    const order = [
      "full_name",
      "university",
      "student_id",
      "email",
      "password",
      "id_image",
    ];
    for (const f of order) {
      if (fieldErrors[f]) {
        if (f === "full_name") {
          fullNameRef.current?.focus();
          fullNameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        if (f === "university") {
          universityRef.current?.focus();
          universityRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        if (f === "student_id") {
          studentIdRef.current?.focus();
          studentIdRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        if (f === "email") {
          emailRef.current?.focus();
          emailRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        if (f === "password") {
          passwordRef.current?.focus();
          passwordRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        if (f === "id_image") {
          idInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        break;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setErrors({});

    // if for some reason state didn't capture the selected file, read from the input ref
    const pickedFile = idFile || idInputRef.current?.files?.[0] || null;

    const fieldErrors = {};
    if (!fullName) fieldErrors.full_name = "Full name is required";
    if (!university) fieldErrors.university = "University is required";
    if (!studentId) fieldErrors.student_id = "Student ID is required";
    if (!email) fieldErrors.email = "Email is required";
    if (!password) fieldErrors.password = "Password is required";
    if (!pickedFile) fieldErrors.id_image = "Student ID image is required";

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      focusFirstError(fieldErrors);
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      passwordRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("full_name", fullName);
      form.append("email", email);
      form.append("password", password);
      form.append("student_id", studentId);
      form.append("university", university);
      form.append("batch", batch);
      if (pickedFile) {
        console.log('Appending file to FormData:', pickedFile.name, pickedFile.type, pickedFile.size);
        form.append("id_image", pickedFile);
      } else {
        console.log('No file picked');
      }

      console.log('Sending request to /auth/register');
      const res = await api.post("/auth/register", form);
      setSuccess(
        res.data?.message || "Account created. Please wait up to 48 hours for admin approval."
      );
      setTimeout(() => navigate("/login"), 3500);
    } catch (err) {
      console.error("SignUp error", err);
      const resp = err.response;
      const msg = resp?.data?.message || resp?.data?.error || err.message || "Could not create account";
      setError(msg);
      if (resp?.data && resp.data.field) {
        setErrors({ [resp.data.field]: resp.data.message || msg });
        if (resp.data.field === "id_image") idInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        if (resp.data.field === "email") emailRef.current?.focus();
      } else if (resp?.data && typeof resp.data === "object") {
        if (resp.data.errors && typeof resp.data.errors === "object") setErrors(resp.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopNavbar />
      <div className="signup-page">
        <section className="signup-hero">
          <div className="overlay" />
          <div className="glow-accent"></div>
          <div className="glow-accent-2"></div>

          <div className="signup-container">
            <h1>Join Campus Connect</h1>
            <p className="subtitle">Verify your student status & join your campus network</p>

            <form className="signup-form" onSubmit={handleSubmit}>
              <input
                ref={fullNameRef}
                type="text"
                placeholder="Full Name"
                className={`form-input ${errors.full_name ? "input-error" : ""}`}
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setErrors((prev) => ({ ...prev, full_name: undefined }));
                }}
                required
              />
              {errors.full_name && <div className="field-error">{errors.full_name}</div>}

              <select
                ref={universityRef}
                required
                className={`form-input form-select ${errors.university ? "input-error" : ""}`}
                value={university}
                onChange={(e) => {
                  setUniversity(e.target.value);
                  setErrors((prev) => ({ ...prev, university: undefined }));
                }}
              >
                <option value="">Select Your University</option>
                <option>Hilcoe</option>
                <option>Addis Ababa University</option>
                <option>St. Mary's University</option>
                <option>Unity University</option>
                <option>Other</option>
              </select>

              <div className="signup-row">
                <input
                  ref={studentIdRef}
                  type="text"
                  placeholder="Student ID"
                  className={`form-input ${errors.student_id ? "input-error" : ""}`}
                  value={studentId}
                  onChange={(e) => {
                    setStudentId(e.target.value);
                    setErrors((prev) => ({ ...prev, student_id: undefined }));
                  }}
                  required
                />
                {errors.student_id && <div className="field-error">{errors.student_id}</div>}

                <select required className="form-input form-select" value={batch} onChange={(e) => setBatch(e.target.value)}>
                  <option value="">Batch/Year</option>
                  {Array.from({ length: 12 }, (_, i) => {
                    const year = 2015 + i;
                    if (year > 2026) return null;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>

              <input
                ref={emailRef}
                type="email"
                placeholder="Your Email"
                className={`form-input ${errors.email ? "input-error" : ""}`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value.trim());
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                required
              />
              {errors.email && <div className="field-error">{errors.email}</div>}

              <div className="signup-row">
                <input
                  ref={passwordRef}
                  type="password"
                  placeholder="Password"
                  className={`form-input ${errors.password ? "input-error" : ""}`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  required
                />
                <input
                  ref={confirmRef}
                  type="password"
                  placeholder="Confirm Password"
                  className={`form-input ${errors.password ? "input-error" : ""}`}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
                {errors.password && <div className="field-error">{errors.password}</div>}
              </div>

              <div className="upload-box">
                <input
                  ref={idInputRef}
                  name="id_image"
                  type="file"
                  id="id-upload"
                  accept="image/*"
                  onChange={(e) => {
                    setIdFile(e.target.files?.[0] || null);
                    setErrors((prev) => ({ ...prev, id_image: undefined }));
                  }}
                />
                <label htmlFor="id-upload" className="upload-label">
                  <div className="upload-content">
                    <span className="upload-icon">↑</span>
                    <p>
                      <span className="click-text">Click to upload</span> your student ID image <strong>(required)</strong>
                    </p>
                    {(idFile || idInputRef.current?.files?.[0]) && (
                      <p style={{ fontSize: 12, marginTop: 6 }}>Selected: {(idFile || idInputRef.current.files[0]).name}</p>
                    )}
                  </div>
                </label>
              </div>
              {errors.id_image && (
                <div className="field-error" style={{ textAlign: "center" }}>
                  {errors.id_image}
                </div>
              )}

              <div className="terms-wrapper">
                <label className="signup-checkbox">
                  <input type="checkbox" required />
                  <span className="checkmark"></span>
                  <span className="checkbox-text">
                    I agree to the <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a> and <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                  </span>
                </label>
              </div>

              {error && <p style={{ color: "#ff4d4d", marginTop: 12 }}>{error}</p>}
              {success && <p style={{ color: "#8fffa1", marginTop: 12 }}>{success}</p>}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>

            <div className="login-link-wrapper">
              <p className="login-link">
                Already have an account? <Link to="/login">Log in</Link>
              </p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}