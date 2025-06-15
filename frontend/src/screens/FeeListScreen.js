import React, { useState, useEffect, useContext } from "react";
import { Table, Button, Row, Col, Card, Badge, Form } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router-dom";
import Message from "../components/Message";
import Loader from "../components/Loader";
import AuthContext from "../context/AuthContext";
import axios from "axios";

const FeeListScreen = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterActive, setFilterActive] = useState("all"); // 'all', 'active', 'inactive'
  const [sortField, setSortField] = useState("feeCode");
  const [sortDirection, setSortDirection] = useState("asc");

  const { userInfo } = useContext(AuthContext);
  const isAdmin = userInfo?.role === "admin";

  const feeTypes = {
    mandatory: {
      label: "Bắt buộc",
      color: "danger",
      icon: "exclamation-circle",
    },
    service: { label: "Dịch vụ", color: "info", icon: "concierge-bell" },
    maintenance: { label: "Bảo trì", color: "warning", icon: "tools" },
    contribution: {
      label: "Đóng góp",
      color: "success",
      icon: "hand-holding-usd",
    },
    parking: { label: "Đỗ xe", color: "primary", icon: "parking" },
    utilities: { label: "Tiện ích", color: "secondary", icon: "bolt" },
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/fees", {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setFees(data);
    } catch (error) {
      setError(error.response?.data?.message || "Không thể tải danh sách phí");
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

  const sortedFees = [...fees].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "amount":
        comparison = a.amount - b.amount;
        break;
      case "startDate":
        comparison = new Date(a.startDate) - new Date(b.startDate);
        break;
      default:
        comparison = String(a[sortField]).localeCompare(String(b[sortField]));
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const filteredFees = sortedFees.filter((fee) => {
    if (filterActive === "active") return fee.active;
    if (filterActive === "inactive") return !fee.active;
    return true;
  });

  const deleteFeeHandler = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khoản phí này không?")) {
      try {
        setLoading(true);
        await axios.delete(`/api/fees/${id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        fetchFees();
      } catch (error) {
        setError(error.response?.data?.message || "Không thể xóa khoản phí");
        setLoading(false);
      }
    }
  };

  return (
    <div className="py-3">
      <Row className="align-items-center mb-3">
        <Col>
          <h1 className="text-light mb-0">Danh Sách Phí</h1>
        </Col>
        <Col xs="auto">
          <Link to="/fees/create" className="btn btn-success">
            <i className="fas fa-plus me-2"></i>Thêm Phí Mới
          </Link>
        </Col>
      </Row>

      {error && <Message variant="danger">{error}</Message>}

      <Card className="shadow" style={{ background: "#1C1C1E" }}>
        <Card.Body>
          <Row className="mb-3 align-items-center">
            <Col md={4}>
              <Form.Group>
                <Form.Select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value)}
                  className="bg-dark text-light"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang kích hoạt</option>
                  <option value="inactive">Vô hiệu hóa</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={8} className="text-md-end">
              <small className="text-light">
                {filteredFees.length} khoản phí
              </small>
            </Col>
          </Row>

          {loading ? (
            <Loader />
          ) : (
            <div className="table-responsive">
              <Table hover variant="dark" className="mb-0">
                <thead>
                  <tr>
                    <th
                      onClick={() => handleSort("feeCode")}
                      style={{ cursor: "pointer" }}
                    >
                      Mã Phí{" "}
                      {sortField === "feeCode" && (
                        <i className={`fas fa-sort-${sortDirection}`}></i>
                      )}
                    </th>
                    <th
                      onClick={() => handleSort("name")}
                      style={{ cursor: "pointer" }}
                    >
                      Tên{" "}
                      {sortField === "name" && (
                        <i className={`fas fa-sort-${sortDirection}`}></i>
                      )}
                    </th>
                    <th
                      onClick={() => handleSort("feeType")}
                      style={{ cursor: "pointer" }}
                    >
                      Loại{" "}
                      {sortField === "feeType" && (
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
                    <th
                      onClick={() => handleSort("startDate")}
                      style={{ cursor: "pointer" }}
                    >
                      Thời Gian{" "}
                      {sortField === "startDate" && (
                        <i className={`fas fa-sort-${sortDirection}`}></i>
                      )}
                    </th>
                    <th>Trạng Thái</th>
                    <th className="text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFees.map((fee) => (
                    <tr key={fee._id}>
                      <td>{fee.feeCode}</td>
                      <td>{fee.name}</td>
                      <td>
                        <Badge bg={feeTypes[fee.feeType]?.color || "secondary"}>
                          <i
                            className={`fas fa-${
                              feeTypes[fee.feeType]?.icon || "circle"
                            } me-1`}
                          ></i>
                          {feeTypes[fee.feeType]?.label || fee.feeType}
                        </Badge>
                      </td>
                      <td>{fee.amount.toLocaleString()} VND</td>
                      <td>
                        <small>
                          Từ:{" "}
                          {fee.startDate
                            ? new Date(fee.startDate).toLocaleDateString(
                                "vi-VN"
                              )
                            : "N/A"}
                          <br />
                          Đến:{" "}
                          {fee.endDate
                            ? new Date(fee.endDate).toLocaleDateString("vi-VN")
                            : "N/A"}
                        </small>
                      </td>
                      <td>
                        <Badge
                          bg={fee.active ? "success" : "danger"}
                          className="d-inline-block w-100 text-center"
                        >
                          <i
                            className={`fas fa-${
                              fee.active ? "check" : "times"
                            }-circle me-1`}
                          ></i>
                          {fee.active ? "Đang kích hoạt" : "Vô hiệu hóa"}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <LinkContainer to={`/fees/${fee._id}`}>
                            <Button variant="dark" size="sm">
                              <i className="fas fa-edit"></i>
                            </Button>
                          </LinkContainer>
                          {isAdmin && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => deleteFeeHandler(fee._id)}
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {filteredFees.length === 0 && (
                <div className="text-center py-3">
                  <Message variant="info">Không tìm thấy khoản phí nào</Message>
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default FeeListScreen;
