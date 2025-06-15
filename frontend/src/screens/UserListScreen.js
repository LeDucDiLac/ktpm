import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const UserListScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  
  useEffect(() => {
    // Chỉ admin mới được truy cập trang này
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/');
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
      
      const { data } = await axios.get('/api/users', config);
      
      setUsers(data);
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Không thể tải danh sách người dùng'
      );
      setLoading(false);
    }
  };
  
  const deleteHandler = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) {
      try {
        setLoading(true);
        
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        await axios.delete(`/api/users/${id}`, config);
        
        setSuccess('Đã xóa người dùng thành công');
        fetchUsers();
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Không thể xóa người dùng'
        );
        setLoading(false);
      }
    }
  };
  
  // Lọc danh sách người dùng theo từ khóa tìm kiếm
  const filteredUsers = users.filter(
    (user) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.username?.toLowerCase().includes(searchLower) ||
        user.fullName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.role?.toLowerCase().includes(searchLower)
      );
    }
  );
  
  // Hàm định dạng tên vai trò
  const formatRole = (role) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'manager':
        return 'Quản lý';
      case 'accountant':
        return 'Kế toán';
      default:
        return role;
    }
  };
  
  return (
    <>
      <Row className="align-items-center mb-3">
        <Col>
          <h1>Quản Lý Người Dùng</h1>
        </Col>
        <Col className="text-end">
          <Button 
            className="btn-sm"
            onClick={() => navigate('/users/create')}
          >
            <i className="fas fa-plus"></i> Thêm Người Dùng
          </Button>
        </Col>
      </Row>

      {success && <Message variant="success">{success}</Message>}
      {error && <Message variant="danger">{error}</Message>}

      <Row className="mb-3">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              variant="outline-secondary"
              onClick={() => setSearchTerm('')}
            >
              Xóa
            </Button>
          </InputGroup>
        </Col>
      </Row>

      {loading ? (
        <Loader />
      ) : (
        <>
          <Table striped bordered hover responsive className="table-sm">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên đăng nhập</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user._id}</td>
                  <td>{user.username}</td>
                  <td>{user.fullName}</td>
                  <td>{user.email || 'Chưa cung cấp'}</td>
                  <td>{formatRole(user.role)}</td>
                  <td>
                    {user.active ? (
                      <span className="text-success">Hoạt động</span>
                    ) : (
                      <span className="text-danger">Đã vô hiệu hóa</span>
                    )}
                  </td>
                  <td>
                    <LinkContainer to={`/users/${user._id}/edit`}>
                      <Button variant="light" className="btn-sm mx-1" title="Chỉnh sửa">
                        <i className="fas fa-edit"></i>
                      </Button>
                    </LinkContainer>
                    <Button
                      variant="danger"
                      className="btn-sm mx-1"
                      onClick={() => deleteHandler(user._id)}
                      disabled={user._id === userInfo._id} // Không thể xóa chính mình
                      title="Xóa"
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredUsers.length === 0 && (
            <Message>Không tìm thấy người dùng nào</Message>
          )}
        </>
      )}
    </>
  );
};

export default UserListScreen; 