import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFoundScreen = () => {
  return (
    <Row className="justify-content-center mt-5">
      <Col md={6} className="text-center">
        <div className="mb-4">
          <i className="fas fa-exclamation-triangle text-warning" style={{ fontSize: '4rem' }}></i>
        </div>
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p className="lead mb-4">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link to="/">
          <Button variant="primary">Go to Homepage</Button>
        </Link>
      </Col>
    </Row>
  );
};

export default NotFoundScreen; 