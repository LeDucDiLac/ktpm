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

const UserListScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);

  useEffect(() => {
    // Chỉ admin mới được truy cập trang này
    if (!userInfo || userInfo.role !== "admin") {
      navigate("/");
      return;
    }

    fetchUsers();
  }, [userInfo, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get("/api/users", config);

      setUsers(data);
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : "Không thể tải danh sách người dùng"
      );
      setLoading(false);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này không?")) {
      try {
        setLoading(true);

        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        await axios.delete(`/api/users/${id}`, config);

        setSuccess("Đã xóa người dùng thành công");
        fetchUsers();
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : "Không thể xóa người dùng"
        );
        setLoading(false);
      }
    }
  };

  // Lọc danh sách người dùng theo từ khóa tìm kiếm
  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.username?.toLowerCase().includes(searchLower) ||
      user.fullName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower)
    );
  });

  const roleConfig = {
    admin: { label: "Quản trị viên", icon: "user-shield", color: "danger" },
    manager: { label: "Quản lý", icon: "user-tie", color: "info" },
    accountant: { label: "Kế toán", icon: "calculator", color: "warning" },
  };

  // Hàm định dạng tên vai trò
  const formatRole = (role) => {
    switch (role) {
      case "admin":
        return "Quản trị viên";
      case "manager":
        return "Quản lý";
      case "accountant":
        return "Kế toán";
      default:
        return role;
    }
  };

  return (
    <div className="py-3">
      <Row className="align-items-center mb-3">
        <Col>
          <h1 className="text-light mb-0">Quản Lý Người Dùng</h1>
        </Col>
        <Col xs="auto">
          <Button variant="success" onClick={() => navigate("/users/create")}>
            <i className="fas fa-plus me-2"></i>Thêm Người Dùng
          </Button>
        </Col>
      </Row>

      <Card className="shadow" style={{ background: "#1C1C1E" }}>
        <Card.Body>
          <Row className="mb-3 g-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text className="bg-dark border-secondary">
                  <i className="fas fa-search"></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Tìm kiếm theo tên, email, vai trò..."
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
            <Col md={6} className="text-md-end">
              <small className="text-light">
                {filteredUsers.length} người dùng
              </small>
            </Col>
          </Row>

          {success && <Message variant="success">{success}</Message>}
          {error && <Message variant="danger">{error}</Message>}

          {loading ? (
            <Loader />
          ) : (
            <div className="table-responsive">
              <Table hover variant="dark" className="mb-0">
                <thead>
                  <tr>
                    <th>Tên đăng nhập</th>
                    <th>Họ và tên</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <strong>{user.username}</strong>
                      </td>
                      <td>{user.fullName}</td>
                      <td>
                        {user.email || (
                          <span className="text-secondary">
                            <i className="fas fa-minus"></i>
                          </span>
                        )}
                      </td>
                      <td>
                        <Badge
                          bg={roleConfig[user.role]?.color || "secondary"}
                          className="text-white"
                        >
                          <i
                            className={`fas fa-${
                              roleConfig[user.role]?.icon || "user"
                            } me-1`}
                          ></i>
                          {roleConfig[user.role]?.label || user.role}
                        </Badge>
                      </td>
                      <td>
                        <Badge
                          bg={user.active ? "success" : "danger"}
                          className="d-inline-block w-100 text-center"
                        >
                          <i
                            className={`fas fa-${
                              user.active ? "check" : "times"
                            }-circle me-1`}
                          ></i>
                          {user.active ? "Đang hoạt động" : "Đã vô hiệu hóa"}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            variant="dark"
                            size="sm"
                            onClick={() => navigate(`/users/${user._id}/edit`)}
                            title="Chỉnh sửa"
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => deleteHandler(user._id)}
                            disabled={user._id === userInfo._id}
                            title={
                              user._id === userInfo._id
                                ? "Không thể xóa tài khoản hiện tại"
                                : "Xóa"
                            }
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-3">
                  <Message variant="info">
                    Không tìm thấy người dùng nào
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

export default UserListScreen;
