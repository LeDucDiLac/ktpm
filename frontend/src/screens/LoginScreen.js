import React, { useState, useEffect, useContext } from "react";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import Message from "../components/Message";
import Loader from "../components/Loader";
import AuthContext from "../context/AuthContext";

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login, userInfo, loading } = useContext(AuthContext);

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (userInfo) {
      navigate("/dashboard");
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    const result = await login(username, password);

    if (!result.success) {
      setError(result.message);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center py-5"
      style={{ background: "#121212" }}
    >
      <Col md={5} lg={4} className="px-4">
        <div className="text-center mb-4">
          <h1 className="text-light mb-2" style={{ fontWeight: 700 }}>
            APARTMENT
          </h1>
          <p className="text-secondary">Hệ thống quản lý chung cư</p>
        </div>

        <Card
          className="shadow-lg border-0"
          style={{ background: "#1C1C1E", borderRadius: "1rem" }}
        >
          <Card.Body className="p-4">
            <h2
              className="text-light text-center mb-4"
              style={{ fontWeight: 600 }}
            >
              Đăng nhập
            </h2>

            {error && <Message variant="danger">{error}</Message>}
            {loading && <Loader />}

            <Form onSubmit={submitHandler}>
              <Form.Group controlId="username" className="mb-3">
                <Form.Label className="text-light">
                  <i className="fas fa-user me-2"></i>Tên đăng nhập
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-dark text-light border-secondary"
                  style={{ borderRadius: "0.5rem" }}
                  required
                />
              </Form.Group>

              <Form.Group controlId="password" className="mb-4">
                <Form.Label className="text-light">
                  <i className="fas fa-lock me-2"></i>Mật khẩu
                </Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-dark text-light border-secondary"
                    style={{ borderRadius: "0.5rem" }}
                    required
                  />
                  <Button
                    variant="link"
                    className="position-absolute end-0 top-50 translate-middle-y text-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ zIndex: 10 }}
                  >
                    <i
                      className={`fas fa-eye${showPassword ? "-slash" : ""}`}
                    ></i>
                  </Button>
                </div>
              </Form.Group>

              <Button
                type="submit"
                variant="primary"
                className="w-100 py-2 mb-3"
                style={{
                  borderRadius: "0.5rem",
                  fontWeight: 600,
                  backgroundColor: "#3358ff",
                  border: "none",
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Đăng nhập
                  </>
                )}
              </Button>
            </Form>


          </Card.Body>
        </Card>

        <div className="text-center mt-4">
          <p className="text-secondary mb-0">
            © {new Date().getFullYear()} Apartment Management System
          </p>
        </div>
      </Col>
    </div>
  );
};

export default LoginScreen;
