import React from "react";
import { Row, Col, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

const NotFoundScreen = () => {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100">
      <Card
        className="text-center border-0 shadow-lg"
        style={{ background: "#1C1C1E", maxWidth: "500px" }}
      >
        <Card.Body className="p-5">
          <div className="error-icon mb-4">
            <div
              className="circle-pulse"
              style={{
                background: "rgba(255, 193, 7, 0.1)",
                borderRadius: "50%",
                width: "120px",
                height: "120px",
                position: "relative",
                margin: "0 auto",
              }}
            >
              <i
                className="fas fa-exclamation-triangle text-warning"
                style={{
                  fontSize: "3.5rem",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              ></i>
            </div>
          </div>

          <h1
            className="display-1 text-light mb-3"
            style={{
              fontWeight: "700",
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            404
          </h1>

          <h2 className="text-light mb-3">Không tìm thấy trang</h2>

          <p className="text-secondary mb-4">
            Trang bạn đang tìm kiếm có thể đã bị xóa, thay đổi tên, hoặc tạm
            thời không khả dụng.
          </p>

          <div className="d-flex justify-content-center gap-3">
            <Button as={Link} to="/" variant="primary" className="px-4 py-2">
              <i className="fas fa-home me-2"></i>
              Trang chủ
            </Button>

            <Button
              onClick={() => window.history.back()}
              variant="outline-light"
              className="px-4 py-2"
            >
              <i className="fas fa-arrow-left me-2"></i>
              Quay lại
            </Button>
          </div>
        </Card.Body>
      </Card>

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
          .error-icon .circle-pulse {
            animation: pulse 2s infinite;
          }
          .card {
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
        `}
      </style>
    </div>
  );
};

export default NotFoundScreen;
