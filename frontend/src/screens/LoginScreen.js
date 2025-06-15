import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import AuthContext from '../context/AuthContext';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login, userInfo, loading } = useContext(AuthContext);
  
  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (userInfo) {
      navigate('/dashboard');
    }
  }, [navigate, userInfo]);
  
  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(username, password);
    
    if (!result.success) {
      setError(result.message);
    } else {
      navigate('/dashboard');
    }
  };
  
  return (
    <Row className="justify-content-md-center mt-5">
      <Col md={6}>
        <Card className="p-4 shadow">
          <Card.Body>
            <h2 className="text-center mb-4">Đăng nhập</h2>
            
            {error && <Message variant="danger">{error}</Message>}
            {loading && <Loader />}
            
            <Form onSubmit={submitHandler}>
              <Form.Group controlId="username" className="mb-3">
                <Form.Label>Tên đăng nhập</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Form.Group>
              
              <Form.Group controlId="password" className="mb-3">
                <Form.Label>Mật khẩu</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>
              
              <Button
                type="submit"
                variant="primary"
                className="w-100 mt-3"
                disabled={loading}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </Form>

            <div className="alert alert-info mt-3">
              <p className="mb-0"><strong>Lưu ý:</strong> Tài khoản quản lý chỉ được cấp bởi quản trị viên hệ thống.</p>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default LoginScreen; 