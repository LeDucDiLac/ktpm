import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const UserEditScreen = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  
  // Form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('accountant');
  const [active, setActive] = useState(true);
  
  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  
  useEffect(() => {
    // Chỉ admin mới được truy cập trang này
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/');
      return;
    }
    
    if (isEditMode) {
      fetchUserDetails();
    }
  }, [userInfo, navigate, id, isEditMode]);
  
  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.get(`/api/users/${id}`, config);
      
      setUsername(data.username);
      setFullName(data.fullName);
      setEmail(data.email || '');
      setPhone(data.phone || '');
      setRole(data.role);
      setActive(data.active);
      
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Không thể tải thông tin người dùng'
      );
      setLoading(false);
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!username) errors.username = 'Tên đăng nhập là bắt buộc';
    if (!isEditMode && !password) errors.password = 'Mật khẩu là bắt buộc';
    if (password && password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (password && password !== confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    if (!fullName) errors.fullName = 'Họ tên là bắt buộc';
    if (!role) errors.role = 'Vai trò là bắt buộc';
    
    setValidationErrors(errors);
    
    return Object.keys(errors).length === 0;
  };
  
  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess(false);
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const userData = {
        username,
        fullName,
        role,
        email,
        phone,
        active
      };
      
      // Chỉ thêm mật khẩu nếu người dùng nhập vào
      if (password) {
        userData.password = password;
      }
      
      if (isEditMode) {
        await axios.put(`/api/users/${id}`, userData, config);
      } else {
        await axios.post('/api/users', userData, config);
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/users');
      }, 1500);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : `Không thể ${isEditMode ? 'cập nhật' : 'tạo'} người dùng`
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Link to='/users' className='btn btn-light my-3'>
        <i className="fas fa-arrow-left"></i> Quay lại Danh sách người dùng
      </Link>
      
      <FormContainer>
        <h1>{isEditMode ? 'Chỉnh Sửa Người Dùng' : 'Thêm Người Dùng Mới'}</h1>
        
        {error && <Message variant='danger'>{error}</Message>}
        {success && (
          <Message variant='success'>
            {isEditMode ? 'Người dùng đã được cập nhật thành công' : 'Người dùng đã được tạo thành công'}
          </Message>
        )}
        {loading && <Loader />}
        
        <Form onSubmit={submitHandler}>
          <Form.Group controlId='username' className='mb-3'>
            <Form.Label>Tên đăng nhập</Form.Label>
            <Form.Control
              type='text'
              placeholder='Nhập tên đăng nhập'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              isInvalid={!!validationErrors.username}
              disabled={isEditMode} // Không cho phép sửa username khi edit
              required
            />
            <Form.Control.Feedback type='invalid'>
              {validationErrors.username}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Row>
            <Col md={6}>
              <Form.Group controlId='password' className='mb-3'>
                <Form.Label>{isEditMode ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}</Form.Label>
                <Form.Control
                  type='password'
                  placeholder={isEditMode ? 'Nhập mật khẩu mới' : 'Nhập mật khẩu'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  isInvalid={!!validationErrors.password}
                  required={!isEditMode}
                />
                <Form.Control.Feedback type='invalid'>
                  {validationErrors.password}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group controlId='confirmPassword' className='mb-3'>
                <Form.Label>Xác nhận mật khẩu</Form.Label>
                <Form.Control
                  type='password'
                  placeholder='Xác nhận mật khẩu'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  isInvalid={!!validationErrors.confirmPassword}
                  required={!isEditMode || password !== ''}
                />
                <Form.Control.Feedback type='invalid'>
                  {validationErrors.confirmPassword}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group controlId='fullName' className='mb-3'>
            <Form.Label>Họ và Tên</Form.Label>
            <Form.Control
              type='text'
              placeholder='Nhập họ và tên'
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              isInvalid={!!validationErrors.fullName}
              required
            />
            <Form.Control.Feedback type='invalid'>
              {validationErrors.fullName}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group controlId='role' className='mb-3'>
            <Form.Label>Vai trò</Form.Label>
            <Form.Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              isInvalid={!!validationErrors.role}
              required
            >
              <option value='accountant'>Kế toán</option>
              <option value='manager'>Quản lý</option>
              <option value='admin'>Quản trị viên</option>
            </Form.Select>
            <Form.Control.Feedback type='invalid'>
              {validationErrors.role}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group controlId='email' className='mb-3'>
            <Form.Label>Email</Form.Label>
            <Form.Control
              type='email'
              placeholder='Nhập email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          
          <Form.Group controlId='phone' className='mb-3'>
            <Form.Label>Số điện thoại</Form.Label>
            <Form.Control
              type='text'
              placeholder='Nhập số điện thoại'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Form.Group>
          
          {isEditMode && (
            <Form.Group controlId='active' className='mb-3'>
              <Form.Check
                type='checkbox'
                label='Đang hoạt động'
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
            </Form.Group>
          )}
          
          <Button type='submit' variant='primary' className='mt-3'>
            {isEditMode ? 'Cập Nhật' : 'Tạo Mới'}
          </Button>
        </Form>
      </FormContainer>
    </>
  );
};

export default UserEditScreen; 