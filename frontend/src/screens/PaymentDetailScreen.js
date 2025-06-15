import React, { useState, useEffect, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Row, Col, Card, Badge, Button } from "react-bootstrap";
import axios from "axios";
import Loader from "../components/Loader";
import Message from "../components/Message";
import AuthContext from "../context/AuthContext";

const PaymentDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { userInfo } = useContext(AuthContext);

  const paymentMethods = {
    cash: { label: "Tiền mặt", icon: "money-bill-wave" },
    bank_transfer: { label: "Chuyển khoản", icon: "university" },
    other: { label: "Khác", icon: "circle" },
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

  useEffect(() => {
    fetchPayment();
  }, [id, userInfo]);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/payments/${id}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setPayment(data);
    } catch (error) {
      setError(
        error.response?.data?.message || "Không thể tải thông tin thanh toán"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-3">
      <Button
        variant="dark"
        className="mb-3"
        onClick={() => navigate("/payments")}
      >
        <i className="fas fa-arrow-left me-2"></i>Quay lại
      </Button>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        payment && (
          <>
            <Card className="shadow mb-4" style={{ background: "#1C1C1E" }}>
              <Card.Header className="border-0 bg-transparent">
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="text-light mb-0">Chi tiết thanh toán</h4>
                  {getStatusBadge(payment.status)}
                </div>
              </Card.Header>

              <Card.Body className="text-light">
                <Row className="g-4">
                  <Col md={6}>
                    <div className="bg-dark p-4 rounded h-100">
                      <h5 className="mb-4">Thông tin thanh toán</h5>

                      <div className="mb-3">
                        <small className="text-secondary">Mã thanh toán</small>
                        <div>{payment._id}</div>
                      </div>

                      <div className="mb-3">
                        <small className="text-secondary">Loại phí</small>
                        <div className="h5 mb-0">{payment.fee?.name}</div>
                      </div>

                      <div className="mb-3">
                        <small className="text-secondary">Số tiền</small>
                        <div className="h4 text-success mb-0">
                          {payment.amount?.toLocaleString()} VND
                        </div>
                      </div>

                      <div className="mb-3">
                        <small className="text-secondary">Phương thức</small>
                        <div>
                          <i
                            className={`fas fa-${
                              paymentMethods[payment.method]?.icon || "circle"
                            } me-2`}
                          ></i>
                          {paymentMethods[payment.method]?.label ||
                            payment.method}
                        </div>
                      </div>

                      {payment.note && (
                        <div className="mb-3">
                          <small className="text-secondary">Ghi chú</small>
                          <div>{payment.note}</div>
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col md={6}>
                    <div className="bg-dark p-4 rounded h-100">
                      <h5 className="mb-4">Thông tin căn hộ</h5>

                      <div className="mb-3">
                        <small className="text-secondary">Căn hộ</small>
                        <div>
                          <Link
                            to={`/households/${payment.household?._id}`}
                            className="h5 text-info text-decoration-none"
                          >
                            {payment.household?.apartmentNumber}
                          </Link>
                        </div>
                      </div>



                      <div className="mb-3">
                        <small className="text-secondary">
                          Người thanh toán
                        </small>
                        <div>{payment.payerName || "N/A"}</div>
                      </div>

                      <div className="mb-3">
                        <small className="text-secondary">
                          Ngày thanh toán
                        </small>
                        <div>
                          {payment.paymentDate ? (
                            <span
                              title={new Date(
                                payment.paymentDate
                              ).toLocaleString("vi-VN")}
                            >
                              {new Date(payment.paymentDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </span>
                          ) : (
                            "Chưa thanh toán"
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        <small className="text-secondary">Ngày tạo</small>
                        <div>
                          {new Date(payment.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </div>
                      </div>

                      <div>
                        <small className="text-secondary">
                          Cập nhật lần cuối
                        </small>
                        <div>
                          {new Date(payment.updatedAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {userInfo?.role === "admin" && payment.status === "paid" && (
              <Card className="shadow" style={{ background: "#1C1C1E" }}>
                <Card.Body>
                  <div className="d-flex justify-content-end">
                    <Button
                      variant="warning"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Bạn có chắc chắn muốn hoàn tiền cho thanh toán này không?"
                          )
                        ) {
                          // Add refund logic here
                        }
                      }}
                    >
                      <i className="fas fa-undo me-2"></i>Hoàn tiền
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            )}
          </>
        )
      )}
    </div>
  );
};

export default PaymentDetailScreen;
