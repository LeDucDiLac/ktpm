import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const FeeEditScreen = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [feeCode, setFeeCode] = useState('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [feeType, setFeeType] = useState('mandatory');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [active, setActive] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  
  useEffect(() => {
    if (isEditMode) {
      fetchFeeDetails();
    }
  }, [id]);
  
  const fetchFeeDetails = async () => {
    try {
      setLoading(true);
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.get(`/api/fees/${id}`, config);
      
      setFeeCode(data.feeCode);
      setName(data.name);
      setAmount(data.amount || '');
      setFeeType(data.feeType || 'mandatory');
      setDescription(data.description || '');
      
      if (data.startDate) {
        const startDateObj = new Date(data.startDate);
        setStartDate(startDateObj.toISOString().split('T')[0]);
      }
      
      if (data.endDate) {
        const endDateObj = new Date(data.endDate);
        setEndDate(endDateObj.toISOString().split('T')[0]);
      }
      
      setActive(data.active);
      
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Không thể tải thông tin phí'
      );
      setLoading(false);
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!feeCode) errors.feeCode = 'Mã phí là bắt buộc';
    if (!name) errors.name = 'Tên phí là bắt buộc';
    if (!amount || amount <= 0) errors.amount = 'Số tiền phải lớn hơn 0';
    
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
      
      const feeData = {
        feeCode,
        name,
        amount: parseFloat(amount),
        feeType,
        description,
        startDate: startDate || null,
        endDate: endDate || null,
        active
      };
      
      if (isEditMode) {
        await axios.put(`/api/fees/${id}`, feeData, config);
      } else {
        await axios.post('/api/fees', feeData, config);
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/fees');
      }, 1500);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : `Không thể ${isEditMode ? 'cập nhật' : 'tạo'} phí`
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Link to='/fees' className='btn btn-light my-3'>
        <i className="fas fa-arrow-left"></i> Quay lại Phí
      </Link>
      
      <FormContainer>
        <h1>{isEditMode ? 'Chỉnh Sửa Phí' : 'Tạo Phí Mới'}</h1>
        
        {error && <Message variant='danger'>{error}</Message>}
        {success && <Message variant='success'>{isEditMode ? 'Phí đã được cập nhật' : 'Phí đã được tạo'}</Message>}
        {loading && <Loader />}
        
        <Form onSubmit={submitHandler}>
          <Form.Group controlId='feeCode' className='mb-3'>
            <Form.Label>Mã Phí</Form.Label>
            <Form.Control
              type='text'
              placeholder='Nhập mã phí'
              value={feeCode}
              onChange={(e) => setFeeCode(e.target.value)}
              isInvalid={!!validationErrors.feeCode}
              required
            />
            <Form.Control.Feedback type='invalid'>
              {validationErrors.feeCode}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group controlId='name' className='mb-3'>
            <Form.Label>Tên Phí</Form.Label>
            <Form.Control
              type='text'
              placeholder='Nhập tên phí'
              value={name}
              onChange={(e) => setName(e.target.value)}
              isInvalid={!!validationErrors.name}
              required
            />
            <Form.Control.Feedback type='invalid'>
              {validationErrors.name}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group controlId='amount' className='mb-3'>
            <Form.Label>Số Tiền</Form.Label>
            <Form.Control
              type='number'
              placeholder='Nhập số tiền'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              isInvalid={!!validationErrors.amount}
              required
              min="0"
              step="0.01"
            />
            <Form.Control.Feedback type='invalid'>
              {validationErrors.amount}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group controlId='feeType' className='mb-3'>
            <Form.Label>Loại Phí</Form.Label>
            <Form.Select
              value={feeType}
              onChange={(e) => setFeeType(e.target.value)}
            >
              <option value='mandatory'>Bắt buộc</option>
              <option value='service'>Dịch vụ</option>
              <option value='maintenance'>Bảo trì</option>
              <option value='water'>Nước</option>
              <option value='electricity'>Điện</option>
              <option value='parking'>Đỗ xe</option>
              <option value='internet'>Internet</option>
              <option value='security'>An ninh</option>
              <option value='cleaning'>Vệ sinh</option>
              <option value='contribution'>Đóng góp</option>
              <option value='other'>Khác</option>
            </Form.Select>
          </Form.Group>
          
          <Form.Group controlId='description' className='mb-3'>
            <Form.Label>Mô Tả</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              placeholder='Nhập mô tả (không bắt buộc)'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>
          
          <Row>
            <Col md={6}>
              <Form.Group controlId='startDate' className='mb-3'>
                <Form.Label>Ngày Bắt Đầu</Form.Label>
                <Form.Control
                  type='date'
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group controlId='endDate' className='mb-3'>
                <Form.Label>Ngày Kết Thúc</Form.Label>
                <Form.Control
                  type='date'
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          
          {isEditMode && (
            <Form.Group controlId='active' className='mb-3'>
              <Form.Check
                type='checkbox'
                label='Hoạt động'
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

export default FeeEditScreen; 