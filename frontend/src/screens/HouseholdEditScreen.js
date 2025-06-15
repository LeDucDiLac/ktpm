import React, { useState, useEffect, useContext } from "react";
import { Form, Button, Card, Row, Col } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import Message from "../components/Message";
import Loader from "../components/Loader";
import AuthContext from "../context/AuthContext";
import axios from "axios";

const HouseholdEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    apartmentNumber: "",
    address: "",
    note: "",
    active: true,
  });

  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: false,
    validationErrors: {},
  });

  useEffect(() => {
    if (isEditMode) fetchHouseholdDetails();
  }, [id, userInfo]);

  const fetchHouseholdDetails = async () => {
    try {
      setStatus((prev) => ({ ...prev, loading: true, error: "" }));

      const { data } = await axios.get(`/api/households/${id}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });

      setFormData({
        apartmentNumber: data.apartmentNumber,
        address: data.address,
        note: data.note || "",
        active: data.active,
      });
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        error:
          error.response?.data?.message ||
          "Không thể tải thông tin hộ gia đình",
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
    if (!formData.apartmentNumber.trim()) {
      errors.apartmentNumber = "Số căn hộ là bắt buộc";
    }
    if (!formData.address.trim()) {
      errors.address = "Địa chỉ là bắt buộc";
    }
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

      if (isEditMode) {
        await axios.put(`/api/households/${id}`, formData, config);
      } else {
        await axios.post("/api/households", formData, config);
      }

      setStatus((prev) => ({ ...prev, success: true }));
      setTimeout(() => navigate("/households"), 1500);
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        error:
          error.response?.data?.message ||
          `Không thể ${isEditMode ? "cập nhật" : "tạo"} hộ gia đình`,
      }));
    } finally {
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="py-3">
      <Button
        variant="dark"
        className="mb-3"
        onClick={() => navigate("/households")}
      >
        <i className="fas fa-arrow-left me-2"></i>Quay lại
      </Button>

      <Card className="shadow" style={{ background: "#1C1C1E" }}>
        <Card.Header className="border-0 bg-transparent">
          <h4 className="text-light mb-0">
            {isEditMode ? "Chỉnh Sửa Hộ Gia Đình" : "Thêm Hộ Gia Đình Mới"}
          </h4>
        </Card.Header>

        <Card.Body>
          {status.error && <Message variant="danger">{status.error}</Message>}
          {status.success && (
            <Message variant="success">
              Hộ gia đình đã được {isEditMode ? "cập nhật" : "tạo"} thành công!
            </Message>
          )}
          {status.loading && <Loader />}

          <Form onSubmit={handleSubmit} className="text-light">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-home me-2"></i>Số Căn Hộ
                  </Form.Label>
                  <Form.Control
                    name="apartmentNumber"
                    value={formData.apartmentNumber}
                    onChange={handleInputChange}
                    isInvalid={!!status.validationErrors.apartmentNumber}
                    placeholder="VD: A101, B202, ..."
                    className="bg-dark text-light border-secondary"
                  />
                  <Form.Control.Feedback type="invalid">
                    {status.validationErrors.apartmentNumber}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-map-marker-alt me-2"></i>Địa Chỉ
                  </Form.Label>
                  <Form.Control
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    isInvalid={!!status.validationErrors.address}
                    placeholder="VD: Tầng 1, Block A, ..."
                    className="bg-dark text-light border-secondary"
                  />
                  <Form.Control.Feedback type="invalid">
                    {status.validationErrors.address}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>
                <i className="fas fa-sticky-note me-2"></i>Ghi Chú
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                placeholder="Thêm ghi chú về hộ gia đình (không bắt buộc)"
                className="bg-dark text-light border-secondary"
              />
            </Form.Group>

            {isEditMode && (
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  name="active"
                  label="Đang hoạt động"
                  checked={formData.active}
                  onChange={handleInputChange}
                  className="custom-switch"
                />
              </Form.Group>
            )}

            <div className="d-flex justify-content-end">
              <Button
                type="submit"
                variant={isEditMode ? "info" : "success"}
                className="px-4"
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

export default HouseholdEditScreen;
