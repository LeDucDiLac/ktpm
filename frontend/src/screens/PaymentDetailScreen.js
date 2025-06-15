import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Row, Col, ListGroup, Badge, Container } from 'react-bootstrap';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';
import AuthContext from '../context/AuthContext';

const PaymentDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { userInfo } = useContext(AuthContext);
  
  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await axios.get(`/api/payments/${id}`, config);
        setPayment(data);
        setLoading(false);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
        );
        setLoading(false);
      }
    };

    if (userInfo) {
      fetchPayment();
    } else {
      navigate('/login');
    }
  }, [id, navigate, userInfo]);
  
  return (
    <Container>
      <Link to="/payments" className="btn btn-light my-3">
        Quay lại
      </Link>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <h1>Chi tiết thanh toán</h1>
          <Row>
            <Col md={12}>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h2>Thông tin cơ bản</h2>
                  <Row>
                    <Col md={6}>
                      <p>
                        <strong>ID: </strong> {payment._id}
                      </p>
                      <p>
                        <strong>Tên phí: </strong>
                        {payment.fee?.name}
                      </p>
                      <p>
                        <strong>Căn hộ: </strong>
                        {payment.household?.apartmentNumber}
                      </p>
                      <p>
                        <strong>Số tiền: </strong>
                        {payment.amount?.toLocaleString('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        })}
                      </p>
                      <p>
                        <strong>Phương thức: </strong>
                        {payment.method}
                      </p>
                    </Col>
                    <Col md={6}>
                      <p>
                        <strong>Trạng thái: </strong>
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
                      </p>
                      <p>
                        <strong>Ngày thanh toán: </strong>
                        {payment.paymentDate
                          ? new Date(payment.paymentDate).toLocaleDateString(
                              'vi-VN'
                            )
                          : 'N/A'}
                      </p>
                      <p>
                        <strong>Ngày tạo: </strong>
                        {new Date(payment.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                      <p>
                        <strong>Cập nhật lần cuối: </strong>
                        {new Date(payment.updatedAt).toLocaleDateString('vi-VN')}
                      </p>
                    </Col>
                  </Row>
                </ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default PaymentDetailScreen; 