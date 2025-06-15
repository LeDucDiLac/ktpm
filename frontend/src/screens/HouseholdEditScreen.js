import React, { useState, useEffect, useContext } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const HouseholdEditScreen = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [active, setActive] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  
  useEffect(() => {
    if (isEditMode) {
      fetchHouseholdDetails();
    }
  }, [id, isEditMode, userInfo]);
  
  const fetchHouseholdDetails = async () => {
    try {
      setLoading(true);
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.get(`/api/households/${id}`, config);
      
      setApartmentNumber(data.apartmentNumber);
      setAddress(data.address);
      setNote(data.note || '');
      setActive(data.active);
      
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Không thể tải thông tin hộ gia đình'
      );
      setLoading(false);
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!apartmentNumber.trim()) {
      errors.apartmentNumber = 'Số căn hộ là bắt buộc';
    }
    
    if (!address.trim()) {
      errors.address = 'Địa chỉ là bắt buộc';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const householdData = {
        apartmentNumber,
        address,
        note,
        active
      };
      
      if (isEditMode) {
        await axios.put(`/api/households/${id}`, householdData, config);
      } else {
        await axios.post('/api/households', householdData, config);
      }
      
      setLoading(false);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/households');
      }, 2000);
      
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : `Không thể ${isEditMode ? 'cập nhật' : 'tạo'} hộ gia đình`
      );
      setLoading(false);
    }
  };
  
  return (
    <>
      <Link to='/households' className='btn btn-light my-3'>
        <i className="fas fa-arrow-left"></i> Quay lại
      </Link>
      
      <FormContainer>
        <h1>{isEditMode ? 'Chỉnh Sửa Hộ Gia Đình' : 'Thêm Hộ Gia Đình Mới'}</h1>
        
        {error && <Message variant='danger'>{error}</Message>}
        {success && (
          <Message variant='success'>
            Hộ gia đình đã được {isEditMode ? 'cập nhật' : 'tạo'} thành công!
          </Message>
        )}
        {loading && <Loader />}
        
        <Form onSubmit={submitHandler} noValidate>
          <Form.Group controlId='apartmentNumber' className='mb-3'>
            <Form.Label>Số Căn Hộ</Form.Label>
            <Form.Control
              type='text'
              placeholder='Nhập số căn hộ'
              value={apartmentNumber}
              onChange={(e) => setApartmentNumber(e.target.value)}
              isInvalid={!!validationErrors.apartmentNumber}
              required
            />
            <Form.Control.Feedback type='invalid'>
              {validationErrors.apartmentNumber}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group controlId='address' className='mb-3'>
            <Form.Label>Địa Chỉ</Form.Label>
            <Form.Control
              type='text'
              placeholder='Nhập địa chỉ'
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              isInvalid={!!validationErrors.address}
              required
            />
            <Form.Control.Feedback type='invalid'>
              {validationErrors.address}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group controlId='note' className='mb-3'>
            <Form.Label>Ghi Chú</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              placeholder='Nhập ghi chú (không bắt buộc)'
              value={note}
              onChange={(e) => setNote(e.target.value)}
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

export default HouseholdEditScreen; 