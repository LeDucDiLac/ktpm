import React, { useState, useEffect, useContext } from "react";
import {
  Table,
  Button,
  Row,
  Col,
  Form,
  InputGroup,
  Card,
  Badge,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import Message from "../components/Message";
import Loader from "../components/Loader";
import AuthContext from "../context/AuthContext";
import axios from "axios";

const PaymentListScreen = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState("paymentDate");
  const [sortDirection, setSortDirection] = useState("desc");

  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  const isAdmin =
    userInfo && (userInfo.role === "admin" || userInfo.role === "accountant");

  const paymentMethods = {
    cash: { label: "Tiền mặt", icon: "money-bill-wave" },
    bank_transfer: { label: "Chuyển khoản", icon: "university" },
    other: { label: "Khác", icon: "circle" },
  };

  useEffect(() => {
    fetchPayments();
  }, [userInfo]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/payments", {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setPayments(data);
    } catch (error) {
      setError(
        error.response?.data?.message || "Không thể tải danh sách thanh toán"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      paid: { bg: "success", icon: "check-circle", text: "Đã thanh toán" },
      pending: { bg: "warning", icon: "clock", text: "Chưa thanh toán" },
      overdue: { bg: "danger", icon: "exclamation-circle", text: "Quá hạn" },
      refunded: { bg: "info", icon: "undo", text: "Đã hoàn tiền" },
    };
    const badge = badges[status] || badges.pending;
    return (
      <Badge bg={badge.bg} className="d-inline-flex align-items-center gap-1">
        <i className={`fas fa-${badge.icon}`}></i> {badge.text}
      </Badge>
    );
  };

  const sortedAndFilteredPayments = payments
    .filter((payment) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        payment.household?.apartmentNumber
          ?.toLowerCase()
          .includes(searchLower) ||
        payment.fee?.name?.toLowerCase().includes(searchLower) ||
        payment.receiptNumber?.toLowerCase().includes(searchLower) ||
        (payment.payerName &&
          payment.payerName.toLowerCase().includes(searchLower));

      const matchesStatus = !statusFilter || payment.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "paymentDate":
          comparison =
            new Date(b.paymentDate || 0) - new Date(a.paymentDate || 0);
          break;
        default:
          comparison = String(a[sortField]).localeCompare(String(b[sortField]));
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

  const handleRefund = async (paymentId) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn hoàn tiền cho thanh toán này không?"
      )
    ) {
      try {
        setLoading(true);
        await axios.post(
          `/api/payments/${paymentId}/refund`,
          {},
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        fetchPayments(); // Refresh the list
      } catch (error) {
        setError(
          error.response?.data?.message || "Không thể hoàn tiền thanh toán"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="py-3">
      <Row className="align-items-center mb-3">
        <Col>
          <h1 className="text-light mb-0">Thanh Toán</h1>
        </Col>
        <Col xs="auto">
          <Button
            variant="success"
            onClick={() => navigate("/payments/create")}
          >
            <i className="fas fa-plus me-2"></i>Tạo thanh toán mới
          </Button>
        </Col>
      </Row>

      <Card className="shadow" style={{ background: "#1C1C1E" }}>
        <Card.Body>
          <Row className="mb-3 g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text className="bg-dark border-secondary">
                  <i className="fas fa-search"></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Tìm kiếm theo căn hộ, loại phí..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-dark text-light border-secondary"
                />
                {searchTerm && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => setSearchTerm("")}
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                )}
              </InputGroup>
            </Col>

            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-dark text-light border-secondary"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="paid">Đã thanh toán</option>
                <option value="pending">Chưa thanh toán</option>
                <option value="overdue">Quá hạn</option>
                <option value="refunded">Đã hoàn tiền</option>
              </Form.Select>
            </Col>

            <Col md={5} className="text-md-end">
              <small className="text-light">
                {sortedAndFilteredPayments.length} thanh toán
              </small>
            </Col>
          </Row>

          {error && <Message variant="danger">{error}</Message>}

          {loading ? (
            <Loader />
          ) : (
            <div className="table-responsive">
              <Table hover variant="dark" className="mb-0">
                <thead>
                  <tr>
                    <th
                      onClick={() => handleSort("fee.name")}
                      style={{ cursor: "pointer" }}
                    >
                      Loại Phí{" "}
                      {sortField === "fee.name" && (
                        <i className={`fas fa-sort-${sortDirection}`}></i>
                      )}
                    </th>
                    <th
                      onClick={() => handleSort("household.apartmentNumber")}
                      style={{ cursor: "pointer" }}
                    >
                      Căn Hộ{" "}
                      {sortField === "household.apartmentNumber" && (
                        <i className={`fas fa-sort-${sortDirection}`}></i>
                      )}
                    </th>
                    <th
                      onClick={() => handleSort("amount")}
                      style={{ cursor: "pointer" }}
                    >
                      Số Tiền{" "}
                      {sortField === "amount" && (
                        <i className={`fas fa-sort-${sortDirection}`}></i>
                      )}
                    </th>
                    <th>Phương thức</th>
                    <th>Trạng thái</th>
                    <th
                      onClick={() => handleSort("paymentDate")}
                      style={{ cursor: "pointer" }}
                    >
                      Ngày thanh toán{" "}
                      {sortField === "paymentDate" && (
                        <i className={`fas fa-sort-${sortDirection}`}></i>
                      )}
                    </th>
                    <th>Ghi chú</th>
                    <th className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAndFilteredPayments.map((payment) => (
                    <tr key={payment._id}>
                      <td>
                        <Link
                          to={`/payments/${payment._id}`}
                          className="text-info text-decoration-none"
                        >
                          {payment.fee?.name || "N/A"}
                        </Link>
                      </td>
                      <td>
                        <Link
                          to={`/households/${payment.household?._id}`}
                          className="text-info text-decoration-none"
                        >
                          {payment.household?.apartmentNumber || "N/A"}
                        </Link>
                      </td>
                      <td>{payment.amount?.toLocaleString()} VND</td>
                      <td>
                        <i
                          className={`fas fa-${
                            paymentMethods[payment.method]?.icon || "circle"
                          } me-2`}
                        ></i>
                        {paymentMethods[payment.method]?.label ||
                          payment.method}
                      </td>
                      <td>{getStatusBadge(payment.status)}</td>
                      <td>
                        {payment.paymentDate ? (
                          <span
                            title={new Date(payment.paymentDate).toLocaleString(
                              "vi-VN"
                            )}
                          >
                            {new Date(payment.paymentDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td>
                        {payment.note ? (
                          <span title={payment.note}>
                            {payment.note.length > 20
                              ? `${payment.note.substring(0, 20)}...`
                              : payment.note}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            variant="dark"
                            size="sm"
                            onClick={() => navigate(`/payments/${payment._id}`)}
                          >
                            <i className="fas fa-eye"></i>
                          </Button>
                          {isAdmin && payment.status === "paid" && (
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleRefund(payment._id)}
                              title="Hoàn tiền"
                            >
                              <i className="fas fa-undo"></i>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {sortedAndFilteredPayments.length === 0 && (
                <div className="text-center py-3">
                  <Message variant="info">
                    Không tìm thấy thanh toán nào
                  </Message>
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default PaymentListScreen;
