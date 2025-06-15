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
import { LinkContainer } from "react-router-bootstrap";
import { useNavigate } from "react-router-dom";
import Message from "../components/Message";
import Loader from "../components/Loader";
import AuthContext from "../context/AuthContext";
import axios from "axios";

const HouseholdListScreen = () => {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState("all");
  const [sortField, setSortField] = useState("apartmentNumber");
  const [sortDirection, setSortDirection] = useState("asc");

  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  const isAdmin = userInfo?.role === "admin";

  useEffect(() => {
    fetchHouseholds();
  }, [userInfo]);

  const fetchHouseholds = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/households", {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setHouseholds(data);
    } catch (error) {
      setError(
        error.response?.data?.message || "Không thể tải danh sách hộ gia đình"
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hộ gia đình này không?")) {
      try {
        setLoading(true);
        await axios.delete(`/api/households/${id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        fetchHouseholds();
      } catch (error) {
        setError(error.response?.data?.message || "Không thể xóa hộ gia đình");
        setLoading(false);
      }
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

  const sortedAndFilteredHouseholds = [...households]
    .filter((household) => {
      const matchesSearch =
        household.apartmentNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        household.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterActive === "all"
          ? true
          : filterActive === "active"
          ? household.active
          : !household.active;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "apartmentNumber":
          comparison = a.apartmentNumber.localeCompare(b.apartmentNumber);
          break;
        case "address":
          comparison = a.address.localeCompare(b.address);
          break;
        case "householdHead":
          const nameA = a.householdHead?.fullName || "";
          const nameB = b.householdHead?.fullName || "";
          comparison = nameA.localeCompare(nameB);
          break;
        default:
          comparison = 0;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

  return (
    <div className="py-3">
      <Row className="align-items-center mb-3">
        <Col>
          <h1 className="text-light mb-0">Hộ Gia Đình</h1>
        </Col>
        <Col xs="auto">
          <Button
            variant="success"
            onClick={() => navigate("/households/create")}
          >
            <i className="fas fa-plus me-2"></i>Thêm Hộ Gia Đình
          </Button>
        </Col>
      </Row>

      <Card className="shadow" style={{ background: "#1C1C1E" }}>
        <Card.Body>
          <Row className="mb-3 align-items-center g-3">
            <Col md={4}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm theo số căn hộ hoặc địa chỉ"
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
            <Col md={4}>
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
            <Col md={4} className="text-md-end">
              <small className="text-light">
                {sortedAndFilteredHouseholds.length} hộ gia đình
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
                      onClick={() => handleSort("apartmentNumber")}
                      style={{ cursor: "pointer" }}
                    >
                      Căn Hộ{" "}
                      {sortField === "apartmentNumber" && (
                        <i className={`fas fa-sort-${sortDirection}`}></i>
                      )}
                    </th>
                    <th
                      onClick={() => handleSort("address")}
                      style={{ cursor: "pointer" }}
                    >
                      Địa Chỉ{" "}
                      {sortField === "address" && (
                        <i className={`fas fa-sort-${sortDirection}`}></i>
                      )}
                    </th>
                    <th
                      onClick={() => handleSort("householdHead")}
                      style={{ cursor: "pointer" }}
                    >
                      Chủ Hộ{" "}
                      {sortField === "householdHead" && (
                        <i className={`fas fa-sort-${sortDirection}`}></i>
                      )}
                    </th>
                    <th>Trạng Thái</th>
                    <th className="text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAndFilteredHouseholds.map((household) => (
                    <tr key={household._id}>
                      <td>
                        <strong>{household.apartmentNumber}</strong>
                      </td>
                      <td>{household.address}</td>
                      <td>
                        {household.householdHead ? (
                          household.householdHead.fullName
                        ) : (
                          <Badge bg="warning" text="dark">
                            Chưa gán
                          </Badge>
                        )}
                      </td>
                      <td>
                        <Badge
                          bg={household.active ? "success" : "danger"}
                          className="d-inline-block w-100 text-center"
                        >
                          <i
                            className={`fas fa-${
                              household.active ? "check" : "times"
                            }-circle me-1`}
                          ></i>
                          {household.active
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
                              navigate(`/households/${household._id}`)
                            }
                          >
                            <i className="fas fa-eye"></i>
                          </Button>
                          <Button
                            variant="dark"
                            size="sm"
                            onClick={() =>
                              navigate(`/households/${household._id}/edit`)
                            }
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => deleteHandler(household._id)}
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
              {sortedAndFilteredHouseholds.length === 0 && (
                <div className="text-center py-3">
                  <Message variant="info">
                    Không tìm thấy hộ gia đình nào
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

export default HouseholdListScreen;
