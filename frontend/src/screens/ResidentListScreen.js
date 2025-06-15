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

const ResidentListScreen = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState("all");
  const [sortField, setSortField] = useState("fullName");
  const [sortDirection, setSortDirection] = useState("asc");

  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  const isAdmin = userInfo?.role === "admin";

  useEffect(() => {
    fetchResidents();
  }, [userInfo]);

  const fetchResidents = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/residents", {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setResidents(data);
    } catch (error) {
      setError(
        error.response?.data?.message || "Không thể tải danh sách cư dân"
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

  const deleteHandler = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa cư dân này không?")) {
      try {
        setLoading(true);
        await axios.delete(`/api/residents/${id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        fetchResidents();
      } catch (error) {
        setError(error.response?.data?.message || "Không thể xóa cư dân");
        setLoading(false);
      }
    }
  };

  const filteredAndSortedResidents = residents
    .filter((resident) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        resident.fullName?.toLowerCase().includes(searchLower) ||
        resident.phone?.toLowerCase().includes(searchLower) ||
        resident.household?.apartmentNumber
          ?.toLowerCase()
          .includes(searchLower);

      const matchesFilter =
        filterActive === "all"
          ? true
          : filterActive === "active"
          ? resident.active
          : !resident.active;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "fullName":
          comparison = (a.fullName || "").localeCompare(b.fullName || "");
          break;
        case "dateOfBirth":
          comparison =
            new Date(a.dateOfBirth || 0) - new Date(b.dateOfBirth || 0);
          break;
        case "apartmentNumber":
          comparison = (a.household?.apartmentNumber || "").localeCompare(
            b.household?.apartmentNumber || ""
          );
          break;
        default:
          comparison = String(a[sortField] || "").localeCompare(
            String(b[sortField] || "")
          );
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

  return (
    <div className="py-3">
      <Row className="align-items-center mb-3">
        <Col>
          <h1 className="text-light mb-0">Cư Dân</h1>
        </Col>
        <Col xs="auto">
          <Button
            variant="success"
            onClick={() => navigate("/residents/create")}
          >
            <i className="fas fa-plus me-2"></i>Thêm Cư Dân
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
                  placeholder="Tìm kiếm theo tên, CCCD, SĐT..."
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
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="bg-dark text-light border-secondary"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </Form.Select>
            </Col>

            <Col md={5} className="text-md-end">
              <small className="text-light">
                {filteredAndSortedResidents.length} cư dân
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
                      onClick={() => handleSort("fullName")}
                      style={{ cursor: "pointer" }}
                    >
                      Họ Tên{" "}
                      {sortField === "fullName" && (
                        <i className={`fas fa-sort-${sortDirection}`}></i>
                      )}
                    </th>

                    <th
                      onClick={() => handleSort("dateOfBirth")}
                      style={{ cursor: "pointer" }}
                    >
                      Ngày Sinh{" "}
                      {sortField === "dateOfBirth" && (
                        <i className={`fas fa-sort-${sortDirection}`}></i>
                      )}
                    </th>
                    <th>Giới Tính</th>
                    <th>Điện Thoại</th>
                    <th
                      onClick={() => handleSort("apartmentNumber")}
                      style={{ cursor: "pointer" }}
                    >
                      Căn Hộ{" "}
                      {sortField === "apartmentNumber" && (
                        <i className={`fas fa-sort-${sortDirection}`}></i>
                      )}
                    </th>
                    <th>Trạng Thái</th>
                    <th className="text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedResidents.map((resident) => (
                    <tr key={resident._id}>
                      <td>
                        <Link
                          to={`/residents/${resident._id}`}
                          className="text-info text-decoration-none"
                        >
                          {resident.fullName}
                        </Link>
                      </td>
                      <td>
                        {resident.dateOfBirth
                          ? new Date(resident.dateOfBirth).toLocaleDateString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </td>
                      <td>
                        <i
                          className={`fas fa-${
                            resident.gender === "male" ? "mars" : "venus"
                          } me-2`}
                        ></i>
                        {resident.gender === "male" ? "Nam" : "Nữ"}
                      </td>
                      <td>{resident.phone || "N/A"}</td>
                      <td>
                        {resident.household ? (
                          <Link
                            to={`/households/${resident.household._id}`}
                            className="text-info text-decoration-none"
                          >
                            {resident.household.apartmentNumber}
                          </Link>
                        ) : (
                          <Badge bg="warning" text="dark">
                            Chưa gán
                          </Badge>
                        )}
                      </td>
                      <td>
                        <Badge
                          bg={resident.active ? "success" : "danger"}
                          className="d-inline-block w-100 text-center"
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
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            variant="dark"
                            size="sm"
                            onClick={() =>
                              navigate(`/residents/${resident._id}`)
                            }
                          >
                            <i className="fas fa-eye"></i>
                          </Button>
                          <Button
                            variant="dark"
                            size="sm"
                            onClick={() =>
                              navigate(`/residents/${resident._id}/edit`)
                            }
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => deleteHandler(resident._id)}
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
              {filteredAndSortedResidents.length === 0 && (
                <div className="text-center py-3">
                  <Message variant="info">Không tìm thấy cư dân nào</Message>
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ResidentListScreen;
