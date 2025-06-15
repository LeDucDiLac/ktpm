import React, { useState, useEffect, useContext } from "react";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import Message from "../components/Message";
import Loader from "../components/Loader";
import AuthContext from "../context/AuthContext";
import axios from "axios";

const FeeEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    feeCode: "",
    name: "",
    amount: "",
    feeType: "mandatory",
    description: "",
    startDate: "",
    endDate: "",
    active: true,
  });

  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: false,
    validationErrors: {},
  });

  const feeTypes = [
    { value: "mandatory", label: "Bắt buộc", icon: "exclamation-circle" },
    { value: "service", label: "Dịch vụ", icon: "concierge-bell" },
    { value: "maintenance", label: "Bảo trì", icon: "tools" },
    { value: "water", label: "Nước", icon: "water" },
    { value: "electricity", label: "Điện", icon: "bolt" },
    { value: "parking", label: "Đỗ xe", icon: "parking" },
    { value: "internet", label: "Internet", icon: "wifi" },
    { value: "security", label: "An ninh", icon: "shield-alt" },
    { value: "cleaning", label: "Vệ sinh", icon: "broom" },
    { value: "contribution", label: "Đóng góp", icon: "hand-holding-usd" },
    { value: "other", label: "Khác", icon: "ellipsis-h" },
  ];

  useEffect(() => {
    if (id) fetchFeeDetails();
  }, [id]);

  const fetchFeeDetails = async () => {
    try {
      setStatus((prev) => ({ ...prev, loading: true, error: "" }));
      const { data } = await axios.get(`/api/fees/${id}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });

      setFormData({
        feeCode: data.feeCode,
        name: data.name,
        amount: data.amount || "",
        feeType: data.feeType || "mandatory",
        description: data.description || "",
        startDate: data.startDate
          ? new Date(data.startDate).toISOString().split("T")[0]
          : "",
        endDate: data.endDate
          ? new Date(data.endDate).toISOString().split("T")[0]
          : "",
        active: data.active,
      });
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        error: error.response?.data?.message || "Không thể tải thông tin phí",
      }));
    } finally {
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.feeCode) errors.feeCode = "Mã phí là bắt buộc";
    if (!formData.name) errors.name = "Tên phí là bắt buộc";
    if (!formData.amount || formData.amount <= 0)
      errors.amount = "Số tiền phải lớn hơn 0";

    setStatus((prev) => ({ ...prev, validationErrors: errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setStatus((prev) => ({
        ...prev,
        loading: true,
        error: "",
        success: false,
      }));

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (id) {
        await axios.put(`/api/fees/${id}`, submitData, config);
      } else {
        await axios.post("/api/fees", submitData, config);
      }

      setStatus((prev) => ({ ...prev, success: true }));
      setTimeout(() => navigate("/fees"), 1500);
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        error:
          error.response?.data?.message ||
          `Không thể ${id ? "cập nhật" : "tạo"} phí`,
      }));
    } finally {
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="py-3">
      <Link to="/fees" className="btn btn-dark mb-3">
        <i className="fas fa-arrow-left me-2"></i>Quay lại
      </Link>

      <Card className="shadow-sm" style={{ background: "#1C1C1E" }}>
        <Card.Header className="border-0 bg-transparent">
          <h4 className="text-light mb-0">
            {id ? "Chỉnh Sửa Phí" : "Tạo Phí Mới"}
          </h4>
        </Card.Header>

        <Card.Body>
          {status.error && <Message variant="danger">{status.error}</Message>}
          {status.success && (
            <Message variant="success">
              {id ? "Phí đã được cập nhật" : "Phí đã được tạo"}
            </Message>
          )}
          {status.loading && <Loader />}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mã Phí</Form.Label>
                  <Form.Control
                    name="feeCode"
                    value={formData.feeCode}
                    onChange={handleInputChange}
                    isInvalid={!!status.validationErrors.feeCode}
                    placeholder="VD: PGX, PDV, ..."
                  />
                  <Form.Control.Feedback type="invalid">
                    {status.validationErrors.feeCode}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên Phí</Form.Label>
                  <Form.Control
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    isInvalid={!!status.validationErrors.name}
                    placeholder="VD: Phí gửi xe, Phí dịch vụ, ..."
                  />
                  <Form.Control.Feedback type="invalid">
                    {status.validationErrors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số Tiền</Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    isInvalid={!!status.validationErrors.amount}
                    min="0"
                    step="1000"
                    placeholder="VD: 100000"
                  />
                  <Form.Control.Feedback type="invalid">
                    {status.validationErrors.amount}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Loại Phí</Form.Label>
                  <Form.Select
                    name="feeType"
                    value={formData.feeType}
                    onChange={handleInputChange}
                  >
                    {feeTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Mô Tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Thêm mô tả chi tiết về khoản phí..."
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày Bắt Đầu</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày Kết Thúc</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            {id && (
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  name="active"
                  label="Kích hoạt"
                  checked={formData.active}
                  onChange={handleInputChange}
                />
              </Form.Group>
            )}

            <div className="d-flex justify-content-end">
              <Button
                type="submit"
                variant={id ? "info" : "success"}
                className="px-4"
              >
                <i className={`fas fa-${id ? "save" : "plus"} me-2`}></i>
                {id ? "Cập Nhật" : "Tạo Mới"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default FeeEditScreen;
