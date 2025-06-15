import React, { useState, useEffect, useContext } from "react";
import { Form, Button, Row, Col, Card, Table, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Message from "../components/Message";
import Loader from "../components/Loader";
import AuthContext from "../context/AuthContext";

const PaymentSearchScreen = () => {
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  // Search form states
  const [searchCriteria, setSearchCriteria] = useState({
    apartmentNumber: "",
    feeName: "",
    feeType: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
    payerName: "",
  });

  // Results and UI states
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  const feeTypes = {
    mandatory: {
      label: "Bắt buộc",
      icon: "exclamation-circle",
      color: "danger",
    },
    service: { label: "Dịch vụ", icon: "concierge-bell", color: "info" },
    maintenance: { label: "Bảo trì", icon: "tools", color: "warning" },
    water: { label: "Nước", icon: "water", color: "primary" },
    electricity: { label: "Điện", icon: "bolt", color: "warning" },
    parking: { label: "Đỗ xe", icon: "parking", color: "success" },
    internet: { label: "Internet", icon: "wifi", color: "info" },
    security: { label: "An ninh", icon: "shield-alt", color: "danger" },
    cleaning: { label: "Vệ sinh", icon: "broom", color: "success" },
    contribution: {
      label: "Đóng góp",
      icon: "hand-holding-usd",
      color: "primary",
    },
    other: { label: "Khác", icon: "circle", color: "secondary" },
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchCriteria((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const searchPayments = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      Object.entries(searchCriteria).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const { data } = await axios.get(
        `/api/payments/search?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      setPayments(data);
      setTotalAmount(data.reduce((sum, payment) => sum + payment.amount, 0));
      setSearched(true);
    } catch (error) {
      setError(error.response?.data?.message || "Lỗi khi tìm kiếm thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setSearchCriteria({
      apartmentNumber: "",
      feeName: "",
      feeType: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
      payerName: "",
    });
    setSearched(false);
    setPayments([]);
    setTotalAmount(0);
  };

  return (
    <div className="py-3">
      <Row className="align-items-center mb-3">
        <Col>
          <h1 className="text-light mb-0">Tìm Kiếm Thanh Toán</h1>
        </Col>
        <Col xs="auto">
          <Button variant="dark" onClick={() => navigate("/payments")}>
            <i className="fas fa-arrow-left me-2"></i>Quay lại
          </Button>
        </Col>
      </Row>

      <Card className="shadow mb-4" style={{ background: "#1C1C1E" }}>
        <Card.Body>
          <Form onSubmit={searchPayments}>
            <Row className="g-3">
              <Col md={6} lg={4}>
                <Form.Group controlId="apartmentNumber">
                  <Form.Label>
                    <i className="fas fa-home me-2"></i>Số Căn Hộ
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="apartmentNumber"
                    placeholder="Nhập số căn hộ"
                    value={searchCriteria.apartmentNumber}
                    onChange={handleInputChange}
                    className="bg-dark text-light border-secondary"
                  />
                </Form.Group>
              </Col>

              <Col md={6} lg={4}>
                <Form.Group controlId="feeName">
                  <Form.Label>
                    <i className="fas fa-file-invoice-dollar me-2"></i>Tên Phí
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="feeName"
                    placeholder="Nhập tên phí"
                    value={searchCriteria.feeName}
                    onChange={handleInputChange}
                    className="bg-dark text-light border-secondary"
                  />
                </Form.Group>
              </Col>

              <Col md={6} lg={4}>
                <Form.Group controlId="feeType">
                  <Form.Label>
                    <i className="fas fa-tags me-2"></i>Loại Phí
                  </Form.Label>
                  <Form.Select
                    name="feeType"
                    value={searchCriteria.feeType}
                    onChange={handleInputChange}
                    className="bg-dark text-light border-secondary"
                  >
                    <option value="">Tất cả loại</option>
                    {Object.entries(feeTypes).map(([type, { label }]) => (
                      <option key={type} value={type}>
                        {label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6} lg={3}>
                <Form.Group controlId="startDate">
                  <Form.Label>
                    <i className="fas fa-calendar me-2"></i>Từ Ngày
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={searchCriteria.startDate}
                    onChange={handleInputChange}
                    className="bg-dark text-light border-secondary"
                  />
                </Form.Group>
              </Col>

              <Col md={6} lg={3}>
                <Form.Group controlId="endDate">
                  <Form.Label>
                    <i className="fas fa-calendar-alt me-2"></i>Đến Ngày
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={searchCriteria.endDate}
                    onChange={handleInputChange}
                    className="bg-dark text-light border-secondary"
                  />
                </Form.Group>
              </Col>

              <Col md={6} lg={3}>
                <Form.Group controlId="minAmount">
                  <Form.Label>
                    <i className="fas fa-money-bill-wave me-2"></i>Số Tiền Tối
                    Thiểu
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="minAmount"
                    placeholder="VND"
                    value={searchCriteria.minAmount}
                    onChange={handleInputChange}
                    min="0"
                    step="1000"
                    className="bg-dark text-light border-secondary"
                  />
                </Form.Group>
              </Col>

              <Col md={6} lg={3}>
                <Form.Group controlId="maxAmount">
                  <Form.Label>
                    <i className="fas fa-money-bill-wave me-2"></i>Số Tiền Tối
                    Đa
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="maxAmount"
                    placeholder="VND"
                    value={searchCriteria.maxAmount}
                    onChange={handleInputChange}
                    min="0"
                    step="1000"
                    className="bg-dark text-light border-secondary"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-between mt-4">
              <Button
                variant="outline-danger"
                onClick={clearForm}
                className="px-4"
              >
                <i className="fas fa-trash-alt me-2"></i>Xóa Bộ Lọc
              </Button>
              <Button type="submit" variant="primary" className="px-4">
                <i className="fas fa-search me-2"></i>Tìm Kiếm
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : searched ? (
        <Card className="shadow" style={{ background: "#1C1C1E" }}>
          <Card.Header className="border-0 bg-transparent">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="text-light mb-0">
                Kết Quả Tìm Kiếm
                <Badge bg="info" className="ms-2">
                  {payments.length} thanh toán
                </Badge>
              </h5>
              {payments.length > 0 && (
                <h5 className="text-success mb-0">
                  Tổng: {totalAmount.toLocaleString()} VND
                </h5>
              )}
            </div>
          </Card.Header>

          <Card.Body>
            {payments.length === 0 ? (
              <Message variant="info">
                Không tìm thấy thanh toán nào phù hợp
              </Message>
            ) : (
              <div className="table-responsive">
                <Table hover variant="dark" className="mb-0">
                  <thead>
                    <tr>
                      <th>Căn Hộ</th>
                      <th>Loại Phí</th>
                      <th>Số Tiền</th>
                      <th>Ngày Thanh Toán</th>
                      <th>Người Nộp</th>
                      <th>Ghi Chú</th>
                      <th className="text-center">Chi Tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment._id}>
                        <td>
                          <Link
                            to={`/households/${payment.household?._id}`}
                            className="text-info text-decoration-none"
                          >
                            {payment.household?.apartmentNumber || "N/A"}
                          </Link>
                        </td>
                        <td>
                          <Badge
                            bg={
                              feeTypes[payment.fee?.feeType]?.color ||
                              "secondary"
                            }
                            className="me-2"
                          >
                            <i
                              className={`fas fa-${
                                feeTypes[payment.fee?.feeType]?.icon || "circle"
                              } me-1`}
                            ></i>
                            {feeTypes[payment.fee?.feeType]?.label || "Khác"}
                          </Badge>
                          {payment.fee?.name}
                        </td>
                        <td className="text-success">
                          {payment.amount.toLocaleString()} VND
                        </td>
                        <td>
                          {new Date(payment.paymentDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </td>
                        <td>{payment.payerName || "N/A"}</td>
                        <td>
                          {payment.note ? (
                            <span title={payment.note}>
                              {payment.note.length > 30
                                ? `${payment.note.substring(0, 30)}...`
                                : payment.note}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="text-center">
                          <Button
                            variant="dark"
                            size="sm"
                            onClick={() => navigate(`/payments/${payment._id}`)}
                          >
                            <i className="fas fa-eye"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      ) : null}
    </div>
  );
};

export default PaymentSearchScreen;
