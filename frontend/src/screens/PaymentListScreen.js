import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Badge } from 'react-bootstrap';

const PaymentListScreen = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  
  // Check if user is admin
  const isAdmin = userInfo && (userInfo.role === 'admin' || userInfo.role === 'accountant');
  
  useEffect(() => {
    fetchPayments();
  }, [userInfo]);
  
  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.get('/api/payments', config);
      setPayments(data);
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Không thể tải danh sách thanh toán'
      );
      setLoading(false);
    }
  };
  
  const handleRefund = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn hoàn tiền khoản thanh toán này? Hành động này không thể hoàn tác.')) {
      try {
        setLoading(true);
        
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        await axios.put(`/api/payments/${id}/refund`, {}, config);
        
        fetchPayments();
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Không thể hoàn tiền khoản thanh toán'
        );
        setLoading(false);
      }
    }
  };
  
  const filteredPayments = payments.filter(
    (payment) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (
        payment.household?.apartmentNumber?.toLowerCase().includes(searchLower) ||
        payment.fee?.name?.toLowerCase().includes(searchLower) ||
        payment.receiptNumber?.toLowerCase().includes(searchLower) ||
        (payment.payerName && payment.payerName.toLowerCase().includes(searchLower))
      );
      
      const matchesStatus = statusFilter === '' || payment.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    }
  );
  
  const handleSearch = (e) => {
    e.preventDefault();
    fetchPayments();
  };
  
  return (
    <>
      <Row className="align-items-center mb-3">
        <Col>
          <h1>Thanh Toán</h1>
        </Col>
        <Col className="text-end">
          <Button 
            className="btn-sm"
            onClick={() => navigate('/payments/create')}
          >
            <i className="fas fa-plus"></i> Tạo Thanh Toán
          </Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Tìm kiếm thanh toán..."
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
        <Col md={3}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="paid">Đã thanh toán</option>
            <option value="pending">Chưa thanh toán</option>
            <option value="overdue">Quá hạn</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Button
            variant="outline-secondary"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
            }}
          >
            Xóa tất cả
          </Button>
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
                <th>Loại Phí</th>
                <th>Căn Hộ</th>
                <th>Số Tiền</th>
                <th>Phương thức</th>
                <th>Trạng thái</th>
                <th>Ngày thanh toán</th>
                <th>Ghi chú</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment._id}>
                  <td>
                    <Link to={`/payments/${payment._id}`}>
                      {payment.fee ? payment.fee.name : 'N/A'}
                    </Link>
                  </td>
                  <td>
                    {payment.household
                      ? payment.household.apartmentNumber
                      : 'N/A'}
                  </td>
                  <td>
                    {payment.amount?.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                  </td>
                  <td>{payment.method}</td>
                  <td>
                    <Badge
                      bg={
                        payment.status === 'paid'
                          ? 'success'
                          : payment.status === 'overdue'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {payment.status === 'paid'
                        ? 'Đã thanh toán'
                        : payment.status === 'overdue'
                        ? 'Quá hạn'
                        : 'Chưa thanh toán'}
                    </Badge>
                  </td>
                  <td>
                    {payment.paymentDate
                      ? new Date(payment.paymentDate).toLocaleDateString(
                          'vi-VN'
                        )
                      : 'N/A'}
                  </td>
                  <td>{payment.note || 'N/A'}</td>
                  <td>
                    <Button
                      variant="light"
                      className="btn-sm"
                      onClick={() => navigate(`/payments/${payment._id}`)}
                    >
                      <i className="fas fa-eye"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredPayments.length === 0 && (
            <Message>Không tìm thấy khoản thanh toán nào</Message>
          )}
        </>
      )}
    </>
  );
};

export default PaymentListScreen; 