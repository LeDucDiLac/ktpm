import React, { useState, useEffect, useContext } from "react";
import { Row, Col, Card, Button, Table, Badge } from "react-bootstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import Message from "../components/Message";
import Loader from "../components/Loader";
import AuthContext from "../context/AuthContext";
import axios from "axios";

const HouseholdDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);

  const [household, setHousehold] = useState(null);
  const [residents, setResidents] = useState([]);
  const [feeStatus, setFeeStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHouseholdData();
  }, [id, userInfo]);

  const fetchHouseholdData = async () => {
    try {
      setLoading(true);
      setError("");

      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };

      const [householdResponse, residentsResponse, feeStatusResponse] =
        await Promise.all([
          axios.get(`/api/households/${id}`, config),
          axios.get(`/api/households/${id}/residents`, config),
          axios.get(`/api/payments/household/${id}/fee-status`, config),
        ]);

      setHousehold(householdResponse.data);
      setResidents(residentsResponse.data);
      setFeeStatus(feeStatusResponse.data.feeStatus);
    } catch (error) {
      setError(
        error.response?.data?.message || "Không thể tải dữ liệu hộ gia đình"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddResident = () =>
    navigate(`/residents/create?household=${household._id}`);
  const handleCreatePayment = (feeId, isDebt = false) => {
    navigate(
      `/payments/create?household=${household._id}&fee=${feeId}&isDebt=${isDebt}`
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      paid: { bg: "success", icon: "check-circle", text: "Đã thanh toán" },
      pending: { bg: "warning", icon: "clock", text: "Chưa thanh toán" },
      overdue: { bg: "danger", icon: "exclamation-circle", text: "Quá hạn" },
      default: { bg: "secondary", icon: "minus-circle", text: "Không áp dụng" },
    };
    const badge = badges[status] || badges.default;
    return (
      <Badge bg={badge.bg} className="d-inline-flex align-items-center gap-1">
        <i className={`fas fa-${badge.icon}`}></i> {badge.text}
      </Badge>
    );
  };

  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;
  if (!household) return <Message>Không tìm thấy hộ gia đình</Message>;

  return (
    <div className="py-3">
      <Button
        variant="dark"
        className="mb-3"
        onClick={() => navigate("/households")}
      >
        <i className="fas fa-arrow-left me-2"></i>Quay lại
      </Button>

      <Row className="g-4">
        <Col lg={5}>
          <Card className="shadow h-100" style={{ background: "#1C1C1E" }}>
            <Card.Header className="border-0 bg-transparent">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="text-light mb-0">Thông tin căn hộ</h4>
                <Button
                  variant="info"
                  size="sm"
                  onClick={() => navigate(`/households/${household._id}/edit`)}
                >
                  <i className="fas fa-edit me-1"></i>Chỉnh sửa
                </Button>
              </div>
            </Card.Header>

            <Card.Body className="text-light">
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="mb-0">Căn hộ {household.apartmentNumber}</h2>
                  <Badge
                    bg={household.active ? "success" : "danger"}
                    className="px-3 py-2"
                  >
                    <i
                      className={`fas fa-${
                        household.active ? "check" : "times"
                      }-circle me-2`}
                    ></i>
                    {household.active ? "Đang hoạt động" : "Không hoạt động"}
                  </Badge>
                </div>
                <p className="text-secondary mb-0">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  {household.address}
                </p>
              </div>

              <div className="mb-4">
                <h6 className="text-secondary mb-3">Chi tiết</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span>Ngày tạo:</span>
                  <span>
                    {new Date(household.creationDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Số cư dân:</span>
                  <span>{residents.length}</span>
                </div>
              </div>

              {household.note && (
                <div className="bg-dark p-3 rounded">
                  <h6 className="text-secondary mb-2">Ghi chú</h6>
                  <p className="mb-0">{household.note}</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7}>
          <Card className="shadow mb-4" style={{ background: "#1C1C1E" }}>
            <Card.Header className="border-0 bg-transparent">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="text-light mb-0">
                  Cư dân <Badge bg="secondary">{residents.length}</Badge>
                </h4>
                <Button variant="success" size="sm" onClick={handleAddResident}>
                  <i className="fas fa-user-plus me-1"></i>Thêm cư dân
                </Button>
              </div>
            </Card.Header>

            <Card.Body>
              {residents.length === 0 ? (
                <Message variant="info">
                  Chưa có cư dân trong hộ gia đình này
                </Message>
              ) : (
                <div className="table-responsive">
                  <Table hover variant="dark" className="mb-0">
                    <thead>
                      <tr>
                        <th>Họ tên</th>
                        <th>CCCD/CMND</th>
                        <th>Giới tính</th>
                        <th>Trạng thái</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {residents.map((resident) => (
                        <tr key={resident._id}>
                          <td>
                            {resident._id === household.householdHead?._id && (
                              <Badge bg="info" className="me-2">
                                <i className="fas fa-user-check me-1"></i>Chủ hộ
                              </Badge>
                            )}
                            {resident.fullName}
                          </td>
                          <td>{resident.idCard || "N/A"}</td>
                          <td>
                            <i
                              className={`fas fa-${
                                resident.gender === "male" ? "mars" : "venus"
                              } me-1`}
                            ></i>
                            {resident.gender === "male" ? "Nam" : "Nữ"}
                          </td>
                          <td>
                            <Badge
                              bg={resident.active ? "success" : "danger"}
                              className="w-100 text-center"
                            >
                              <i
                                className={`fas fa-${
                                  resident.active ? "check" : "times"
                                }-circle me-1`}
                              ></i>
                              {resident.active
                                ? "Đang hoạt động"
                                : "Không hoạt động"}
                            </Badge>
                          </td>
                          <td className="text-end">
                            <Button
                              variant="dark"
                              size="sm"
                              onClick={() =>
                                navigate(`/residents/${resident._id}`)
                              }
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

          <Card className="shadow" style={{ background: "#1C1C1E" }}>
            <Card.Header className="border-0 bg-transparent">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="text-light mb-0">Trạng thái thanh toán</h4>
                <Button
                  variant="info"
                  size="sm"
                  onClick={() =>
                    navigate(`/payments?household=${household._id}`)
                  }
                >
                  <i className="fas fa-history me-1"></i>Lịch sử
                </Button>
              </div>
            </Card.Header>

            <Card.Body>
              {feeStatus.length === 0 ? (
                <Message variant="info">
                  Không có khoản phí nào được áp dụng
                </Message>
              ) : (
                <div className="table-responsive">
                  <Table hover variant="dark" className="mb-0">
                    <thead>
                      <tr>
                        <th>Loại phí</th>
                        <th>Số tiền</th>
                        <th>Tháng hiện tại</th>
                        <th>Tháng trước</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeStatus.map((fee) => (
                        <tr key={fee._id}>
                          <td>{fee.name}</td>
                          <td>{fee.amount.toLocaleString("vi-VN")} VND</td>
                          <td>{getStatusBadge(fee.currentMonthStatus)}</td>
                          <td>{getStatusBadge(fee.lastMonthStatus)}</td>
                          <td className="text-end">
                            {fee.currentMonthStatus === "pending" && (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleCreatePayment(fee._id)}
                              >
                                <i className="fas fa-money-bill me-1"></i>Thanh
                                toán
                              </Button>
                            )}
                            {fee.lastMonthStatus === "overdue" &&
                              fee.currentMonthStatus === "paid" && (
                                <Button
                                  variant="warning"
                                  size="sm"
                                  onClick={() =>
                                    handleCreatePayment(fee._id, true)
                                  }
                                >
                                  <i className="fas fa-exclamation-circle me-1"></i>
                                  Thanh toán nợ
                                </Button>
                              )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HouseholdDetailScreen;
