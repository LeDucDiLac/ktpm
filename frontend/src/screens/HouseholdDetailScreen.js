import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Button, ListGroup, Table, Alert, Badge } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const HouseholdDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [household, setHousehold] = useState(null);
  const [residents, setResidents] = useState([]);
  const [feeStatus, setFeeStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { userInfo } = useContext(AuthContext);
  
  useEffect(() => {
    fetchHouseholdData();
  }, [id, userInfo]);
  
  const fetchHouseholdData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      // Make all requests in parallel
      const [householdResponse, residentsResponse, feeStatusResponse] = await Promise.all([
        axios.get(`/api/households/${id}`, config),
        axios.get(`/api/households/${id}/residents`, config),
        axios.get(`/api/payments/household/${id}/fee-status`, config)
      ]);
      
      setHousehold(householdResponse.data);
      setResidents(residentsResponse.data);
      setFeeStatus(feeStatusResponse.data.feeStatus);
      
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Không thể tải dữ liệu hộ gia đình'
      );
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddResident = () => {
    navigate(`/residents/create?household=${household._id}`);
  };

  const handleCreatePayment = (feeId, isDebt = false) => {
    navigate(`/payments/create?household=${household._id}&fee=${feeId}&isDebt=${isDebt}`);
  };

  // Helper function to get badge variant based on status
  const getStatusBadge = (status) => {
    switch(status) {
      case 'paid':
        return <Badge bg="success">Đã thanh toán</Badge>;
      case 'pending':
        return <Badge bg="warning">Chưa thanh toán</Badge>;
      case 'overdue':
        return <Badge bg="danger">Quá hạn</Badge>;
      default:
        return <Badge bg="secondary">Không áp dụng</Badge>;
    }
  };
  
  return (
    <>
      <Link to='/households' className='btn btn-light my-3'>
        <i className="fas fa-arrow-left"></i> Quay lại Danh sách Hộ dân
      </Link>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : household ? (
        <>
          <Row>
            <Col md={5}>
              <Card className="mb-4">
                <Card.Header>
                  <h4>Thông tin Hộ gia đình</h4>
                </Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <Row>
                        <Col md={5}><strong>Căn hộ:</strong></Col>
                        <Col>{household.apartmentNumber}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col md={5}><strong>Địa chỉ:</strong></Col>
                        <Col>{household.address}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col md={5}><strong>Trạng thái:</strong></Col>
                        <Col>
                          {household.active ? (
                            <span className="text-success">Đang hoạt động</span>
                          ) : (
                            <span className="text-danger">Không hoạt động</span>
                          )}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col md={5}><strong>Ngày tạo:</strong></Col>
                        <Col>
                          {new Date(household.creationDate).toLocaleDateString()}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                    {household.note && (
                      <ListGroup.Item>
                        <Row>
                          <Col md={5}><strong>Ghi chú:</strong></Col>
                          <Col>{household.note}</Col>
                        </Row>
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Card.Body>
                <Card.Footer>
                  <Row>
                    <Col>
                      <Link
                        to={`/households/${household._id}/edit`}
                        className="btn btn-primary btn-sm"
                      >
                        <i className="fas fa-edit"></i> Chỉnh sửa
                      </Link>
                    </Col>
                  </Row>
                </Card.Footer>
              </Card>
            </Col>
            
            <Col md={7}>
              <Card className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h4>Cư dân ({residents.length})</h4>
                  <Button 
                    variant="success" 
                    size="sm"
                    onClick={handleAddResident}
                  >
                    <i className="fas fa-plus"></i> Thêm cư dân
                  </Button>
                </Card.Header>
                <Card.Body>
                  {residents.length === 0 ? (
                    <Alert variant="info">
                      Không có cư dân trong hộ gia đình này. Hãy thêm cư dân để bắt đầu.
                    </Alert>
                  ) : (
                    <Table striped hover responsive className="table-sm">
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
                                <i className="fas fa-user-check text-success me-1" title="Chủ hộ"></i>
                              )}
                              {resident.fullName}
                            </td>
                            <td>{resident.idCard || 'N/A'}</td>
                            <td>{resident.gender === 'male' ? 'Nam' : 'Nữ'}</td>
                            <td>
                              {resident.active ? (
                                <span className="text-success">Đang hoạt động</span>
                              ) : (
                                <span className="text-danger">Không hoạt động</span>
                              )}
                            </td>
                            <td>
                              <Link to={`/residents/${resident._id}`}>
                                <Button variant="light" className="btn-sm">
                                  <i className="fas fa-eye"></i>
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row>
            <Col>
              <Card className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h4>Trạng thái Thanh toán</h4>
                  <Link to={`/payments?household=${household._id}`} className="btn btn-info btn-sm">
                    <i className="fas fa-history"></i> Lịch sử thanh toán
                  </Link>
                </Card.Header>
                <Card.Body>
                  {feeStatus.length === 0 ? (
                    <Alert variant="info">
                      Không có khoản phí nào được áp dụng cho hộ gia đình này.
                    </Alert>
                  ) : (
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Loại phí</th>
                          <th>Số tiền</th>
                          <th>Tháng hiện tại</th>
                          <th>Tháng trước</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feeStatus.map((fee) => (
                          <tr key={fee._id}>
                            <td>{fee.name}</td>
                            <td>{fee.amount.toLocaleString('vi-VN')} VND</td>
                            <td>{getStatusBadge(fee.currentMonthStatus)}</td>
                            <td>
                              {getStatusBadge(fee.lastMonthStatus)}
                              {fee.lastMonthStatus === 'overdue' && (
                                <span className="ms-2 text-danger">
                                  <i className="fas fa-exclamation-triangle"></i>
                                </span>
                              )}
                            </td>
                            <td>
                              {fee.currentMonthStatus === 'pending' && (
                                <Button 
                                  variant="success" 
                                  size="sm"
                                  onClick={() => handleCreatePayment(fee._id)}
                                >
                                  <i className="fas fa-money-bill"></i> Thanh toán
                                </Button>
                              )}
                              {fee.lastMonthStatus === 'overdue' && fee.currentMonthStatus === 'paid' && (
                                <Button 
                                  variant="warning" 
                                  size="sm"
                                  onClick={() => handleCreatePayment(fee._id, true)}
                                >
                                  <i className="fas fa-exclamation-circle"></i> Thanh toán nợ
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <Message>Không tìm thấy hộ gia đình</Message>
      )}
    </>
  );
};

export default HouseholdDetailScreen; 