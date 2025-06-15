import React, { useState, useEffect, useContext } from "react";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import Message from "../components/Message";
import Loader from "../components/Loader";
import AuthContext from "../context/AuthContext";
import axios from "axios";

const UserEditScreen = () => {
  const { id } = useParams();
  const isEditMode = !!id;

  // Form fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("accountant");
  const [active, setActive] = useState(true);

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);

  useEffect(() => {
    // Chỉ admin mới được truy cập trang này
    if (!userInfo || userInfo.role !== "admin") {
      navigate("/");
      return;
    }

    if (isEditMode) {
      fetchUserDetails();
    }
  }, [userInfo, navigate, id, isEditMode]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get(`/api/users/${id}`, config);

      setUsername(data.username);
      setFullName(data.fullName);
      setEmail(data.email || "");
      setPhone(data.phone || "");
      setRole(data.role);
      setActive(data.active);

      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : "Không thể tải thông tin người dùng"
      );
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!username) errors.username = "Tên đăng nhập là bắt buộc";
    if (!isEditMode && !password) errors.password = "Mật khẩu là bắt buộc";
    if (password && password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (password && password !== confirmPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    if (!fullName) errors.fullName = "Họ tên là bắt buộc";
    if (!role) errors.role = "Vai trò là bắt buộc";

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const userData = {
        username,
        fullName,
        role,
        email,
        phone,
        active,
      };

      // Chỉ thêm mật khẩu nếu người dùng nhập vào
      if (password) {
        userData.password = password;
      }

      if (isEditMode) {
        await axios.put(`/api/users/${id}`, userData, config);
      } else {
        await axios.post("/api/users", userData, config);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/users");
      }, 1500);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : `Không thể ${isEditMode ? "cập nhật" : "tạo"} người dùng`
      );
    } finally {
      setLoading(false);
    }
  };

  const roleConfig = {
    admin: { label: "Quản trị viên", icon: "user-shield", color: "danger" },
    manager: { label: "Quản lý", icon: "user-tie", color: "info" },
    accountant: { label: "Kế toán", icon: "calculator", color: "warning" },
  };

  return (
    <div className="py-3">
      <Button
        variant="dark"
        className="mb-3"
        onClick={() => navigate("/users")}
      >
        <i className="fas fa-arrow-left me-2"></i>Quay lại
      </Button>

      <Card className="shadow" style={{ background: "#1C1C1E" }}>
        <Card.Header className="border-0 bg-transparent">
          <h4 className="text-light mb-0">
            {isEditMode ? "Chỉnh Sửa Người Dùng" : "Thêm Người Dùng Mới"}
          </h4>
        </Card.Header>

        <Card.Body className="text-light">
          {error && <Message variant="danger">{error}</Message>}
          {success && (
            <Message variant="success">
              {isEditMode
                ? "Người dùng đã được cập nhật"
                : "Người dùng đã được tạo thành công"}
            </Message>
          )}
          {loading && <Loader />}

          <Form onSubmit={submitHandler}>
            <Row className="g-4">
              <Col md={6}>
                <Card className="bg-dark border-0">
                  <Card.Body>
                    <h5 className="mb-4">Thông tin tài khoản</h5>

                    <Form.Group controlId="username" className="mb-3">
                      <Form.Label>
                        <i className="fas fa-user me-2"></i>Tên đăng nhập
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nhập tên đăng nhập"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        isInvalid={!!validationErrors.username}
                        disabled={isEditMode}
                        className="bg-dark text-light border-secondary"
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.username}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group controlId="password" className="mb-3">
                          <Form.Label>
                            <i className="fas fa-lock me-2"></i>
                            {isEditMode ? "Mật khẩu mới" : "Mật khẩu"}
                          </Form.Label>
                          <Form.Control
                            type="password"
                            placeholder={
                              isEditMode
                                ? "Để trống nếu không đổi"
                                : "Nhập mật khẩu"
                            }
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            isInvalid={!!validationErrors.password}
                            className="bg-dark text-light border-secondary"
                            required={!isEditMode}
                          />
                          <Form.Control.Feedback type="invalid">
                            {validationErrors.password}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group
                          controlId="confirmPassword"
                          className="mb-3"
                        >
                          <Form.Label>
                            <i className="fas fa-lock me-2"></i>Xác nhận mật
                            khẩu
                          </Form.Label>
                          <Form.Control
                            type="password"
                            placeholder="Xác nhận mật khẩu"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            isInvalid={!!validationErrors.confirmPassword}
                            className="bg-dark text-light border-secondary"
                            required={!isEditMode || password !== ""}
                          />
                          <Form.Control.Feedback type="invalid">
                            {validationErrors.confirmPassword}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group controlId="role" className="mb-3">
                      <Form.Label>
                        <i className="fas fa-user-tag me-2"></i>Vai trò
                      </Form.Label>
                      <Form.Select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        isInvalid={!!validationErrors.role}
                        className="bg-dark text-light border-secondary"
                        required
                      >
                        {Object.entries(roleConfig).map(
                          ([value, { label }]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          )
                        )}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.role}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="bg-dark border-0">
                  <Card.Body>
                    <h5 className="mb-4">Thông tin cá nhân</h5>

                    <Form.Group controlId="fullName" className="mb-3">
                      <Form.Label>
                        <i className="fas fa-user-circle me-2"></i>Họ và Tên
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nhập họ và tên"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        isInvalid={!!validationErrors.fullName}
                        className="bg-dark text-light border-secondary"
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.fullName}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="email" className="mb-3">
                      <Form.Label>
                        <i className="fas fa-envelope me-2"></i>Email
                      </Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Nhập email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-dark text-light border-secondary"
                      />
                    </Form.Group>

                    <Form.Group controlId="phone" className="mb-3">
                      <Form.Label>
                        <i className="fas fa-phone me-2"></i>Số điện thoại
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nhập số điện thoại"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-dark text-light border-secondary"
                      />
                    </Form.Group>

                    {isEditMode && (
                      <Form.Group controlId="active" className="mb-3">
                        <Form.Check
                          type="switch"
                          label="Đang hoạt động"
                          checked={active}
                          onChange={(e) => setActive(e.target.checked)}
                          className="custom-switch"
                        />
                      </Form.Group>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button
                type="submit"
                variant={isEditMode ? "info" : "success"}
                size="lg"
              >
                <i
                  className={`fas fa-${isEditMode ? "save" : "plus"} me-2`}
                ></i>
                {isEditMode ? "Cập Nhật" : "Tạo Mới"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UserEditScreen;
