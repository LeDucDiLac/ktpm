import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Row, Col, Card } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const FeeListScreen = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { userInfo } = useContext(AuthContext);
  
  // Check if user is admin
  const isAdmin = userInfo && userInfo.role === 'admin';
  
  useEffect(() => {
    fetchFees();
  }, []);
  
  const fetchFees = async () => {
    try {
      setLoading(true);
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.get('/api/fees', config);
      
      setFees(data);
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Không thể tải danh sách phí'
      );
      setLoading(false);
    }
  };
  
  const deleteFeeHandler = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khoản phí này không?')) {
      try {
        setLoading(true);
        
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        await axios.delete(`/api/fees/${id}`, config);
        
        fetchFees();
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Không thể xóa khoản phí'
        );
        setLoading(false);
      }
    }
  };
  
  // Function to translate fee type into Vietnamese
  const translateFeeType = (feeType) => {
    const translations = {
      'mandatory': 'Bắt buộc',
      'service': 'Dịch vụ',
      'maintenance': 'Bảo trì',
      'voluntary': 'Tự nguyện',
      'contribution': 'Đóng góp',
      'parking': 'Đỗ xe',
      'utilities': 'Tiện ích'
    };
    
    return translations[feeType] || feeType;
  };
  
  return (
    <>
      <Row className="align-items-center mb-3">
        <Col>
          <h1>Danh Sách Phí</h1>
        </Col>
        <Col className="text-right">
          <Link to="/fees/create" className="btn btn-primary">
            <i className="fas fa-plus"></i> Thêm Phí Mới
          </Link>
        </Col>
      </Row>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <Card className="shadow">
          <Card.Body>
            <Table striped bordered hover responsive className="table-sm">
              <thead>
                <tr>
                  <th>Mã Phí</th>
                  <th>Tên</th>
                  <th>Loại</th>
                  <th>Số Tiền</th>
                  <th>Ngày Bắt Đầu</th>
                  <th>Ngày Kết Thúc</th>
                  <th>Trạng Thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee) => (
                  <tr key={fee._id}>
                    <td>{fee.feeCode}</td>
                    <td>{fee.name}</td>
                    <td>{translateFeeType(fee.feeType)}</td>
                    <td>{fee.amount.toLocaleString()} VND</td>
                    <td>
                      {fee.startDate
                        ? new Date(fee.startDate).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </td>
                    <td>
                      {fee.endDate
                        ? new Date(fee.endDate).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </td>
                    <td>
                      {fee.active ? (
                        <span className="text-success">
                          <i className="fas fa-check-circle"></i> Đang kích hoạt
                        </span>
                      ) : (
                        <span className="text-danger">
                          <i className="fas fa-times-circle"></i> Vô hiệu hóa
                        </span>
                      )}
                    </td>
                    <td>
                      <LinkContainer to={`/fees/${fee._id}`}>
                        <Button variant="light" className="btn-sm mx-1">
                          <i className="fas fa-edit"></i>
                        </Button>
                      </LinkContainer>
                      {isAdmin && (
                        <Button
                          variant="danger"
                          className="btn-sm mx-1"
                          onClick={() => deleteFeeHandler(fee._id)}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {fees.length === 0 && (
              <Message>Không tìm thấy khoản phí nào</Message>
            )}
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default FeeListScreen; 