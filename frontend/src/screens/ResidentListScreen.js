import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const ResidentListScreen = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  
  useEffect(() => {
    fetchResidents();
  }, [userInfo]);
  
  const fetchResidents = async () => {
    try {
      setLoading(true);
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.get('/api/residents', config);
      
      setResidents(data);
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Không thể tải danh sách cư dân'
      );
      setLoading(false);
    }
  };
  
  const deleteHandler = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cư dân này không?')) {
      try {
        setLoading(true);
        
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        await axios.delete(`/api/residents/${id}`, config);
        
        fetchResidents();
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Không thể xóa cư dân'
        );
        setLoading(false);
      }
    }
  };
  
  const filteredResidents = residents.filter(
    (resident) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        resident.fullName?.toLowerCase().includes(searchLower) ||
        resident.idCard?.toLowerCase().includes(searchLower) ||
        resident.phone?.toLowerCase().includes(searchLower) ||
        resident.household?.apartmentNumber?.toLowerCase().includes(searchLower)
      );
    }
  );
  
  return (
    <>
      <Row className="align-items-center mb-3">
        <Col>
          <h1>Cư Dân</h1>
        </Col>
        <Col className="text-end">
          <Button 
            className="btn-sm"
            onClick={() => navigate('/residents/create')}
          >
            <i className="fas fa-plus"></i> Thêm Cư Dân
          </Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Tìm kiếm cư dân..."
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
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <Table striped bordered hover responsive className="table-sm">
            <thead>
              <tr>
                <th>Họ Tên</th>
                <th>CMND/CCCD</th>
                <th>Ngày Sinh</th>
                <th>Giới Tính</th>
                <th>Điện Thoại</th>
                <th>Hộ Gia Đình</th>
                <th>Trạng Thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredResidents.map((resident) => (
                <tr key={resident._id}>
                  <td>{resident.fullName}</td>
                  <td>{resident.idCard || 'N/A'}</td>
                  <td>{resident.dateOfBirth ? new Date(resident.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A'}</td>
                  <td>{resident.gender === 'male' ? 'Nam' : resident.gender === 'female' ? 'Nữ' : 'N/A'}</td>
                  <td>{resident.phone || 'N/A'}</td>
                  <td>
                    {resident.household ? (
                      <>
                        {resident.household.apartmentNumber}
                      </>
                    ) : (
                      'Chưa gán'
                    )}
                  </td>
                  <td>
                    {resident.active ? (
                      <span className="text-success">Hoạt động</span>
                    ) : (
                      <span className="text-danger">Không hoạt động</span>
                    )}
                  </td>
                  <td>
                    <LinkContainer to={`/residents/${resident._id}`}>
                      <Button variant="light" className="btn-sm mx-1">
                        <i className="fas fa-eye"></i>
                      </Button>
                    </LinkContainer>
                    <LinkContainer to={`/residents/${resident._id}/edit`}>
                      <Button variant="light" className="btn-sm mx-1">
                        <i className="fas fa-edit"></i>
                      </Button>
                    </LinkContainer>
                    {userInfo.role === 'admin' && (
                      <Button
                        variant="danger"
                        className="btn-sm mx-1"
                        onClick={() => deleteHandler(resident._id)}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredResidents.length === 0 && (
            <Message>Không tìm thấy cư dân nào</Message>
          )}
        </>
      )}
    </>
  );
};

export default ResidentListScreen; 