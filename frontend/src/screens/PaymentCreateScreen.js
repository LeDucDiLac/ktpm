import React, { useState, useEffect, useContext, useCallback } from "react";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Message from "../components/Message";
import Loader from "../components/Loader";
import AuthContext from "../context/AuthContext";
import axios from "axios";

const PaymentCreateScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy query params từ URL
  const searchParams = new URLSearchParams(location.search);
  const householdParam = searchParams.get("household");
  const feeParam = searchParams.get("fee");
  const isDebtPayment = searchParams.get("isDebt") === "true";

  const [households, setHouseholds] = useState([]);
  const [fees, setFees] = useState([]);

  // Form fields
  const [householdId, setHouseholdId] = useState(householdParam || "");
  const [feeId, setFeeId] = useState(feeParam || "");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [payerName, setPayerName] = useState("");
  const [payerId, setPayerId] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [note, setNote] = useState("");

  // Period field for debt payments
  const [period, setPeriod] = useState("");

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const { userInfo } = useContext(AuthContext);

  const fetchHouseholdHead = useCallback(async () => {
    try {
      if (!householdId || !userInfo) return;

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get(
        `/api/households/${householdId}/residents`,
        config
      );

      // Tìm chủ hộ hoặc người đầu tiên trong danh sách
      const householdHead =
        data.find((resident) => resident.isHouseholdHead) || data[0];

      if (householdHead) {
        setPayerName(householdHead.fullName || "");
        setPayerId(householdHead.idCard || "");
        setPayerPhone(householdHead.phone || "");
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin chủ hộ:", error);
    }
  }, [householdId, userInfo]);

  const fetchHouseholds = useCallback(async () => {
    try {
      if (!userInfo) return;

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get("/api/households", config);
      setHouseholds(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách hộ gia đình:", error);
    }
  }, [userInfo]);

  const fetchFees = useCallback(async () => {
    try {
      if (!userInfo) return;

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get("/api/fees", config);
      setFees(data.filter((fee) => fee.active));
    } catch (error) {
      console.error("Lỗi khi tải danh sách phí:", error);
    }
  }, [userInfo]);

  // Tải danh sách hộ dân và phí khi component mount
  useEffect(() => {
    fetchHouseholds();
    fetchFees();
  }, [userInfo, fetchHouseholds, fetchFees]);

  // Khi feeId thay đổi, cập nhật số tiền
  useEffect(() => {
    if (feeId) {
      const fee = fees.find((f) => f._id === feeId);
      if (fee) {
        setAmount(fee.amount);
      }
    }
  }, [feeId, fees]);

  // Nếu đã chọn hộ dân và có thông tin về chủ hộ, điền thông tin người thanh toán
  useEffect(() => {
    if (householdId) {
      fetchHouseholdHead();
    }
  }, [householdId, fetchHouseholdHead]);

  // Set default period for debt payment
  useEffect(() => {
    if (isDebtPayment) {
      // Set to previous month by default
      const today = new Date();
      const lastMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
      const lastMonthYear =
        today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
      const lastMonthDate = new Date(lastMonthYear, lastMonth, 1);
      setPeriod(lastMonthDate.toISOString().split("T")[0]);

      // Set default note for debt payment
      setNote("Thanh toán nợ tháng trước");
    } else {
      // Set to current month for regular payments
      const today = new Date();
      const currentMonthDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      setPeriod(currentMonthDate.toISOString().split("T")[0]);
    }
  }, [isDebtPayment]);

  const validateForm = () => {
    const errors = {};

    if (!householdId) errors.householdId = "Hộ gia đình là bắt buộc";
    if (!feeId) errors.feeId = "Loại phí là bắt buộc";
    if (!amount || amount <= 0) errors.amount = "Số tiền phải lớn hơn 0";
    if (!paymentDate) errors.paymentDate = "Ngày thanh toán là bắt buộc";
    if (!period) errors.period = "Kỳ thanh toán là bắt buộc";

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      // Ensure period is a proper date string
      let periodDate = period;
      if (period && period.length === 7) {
        // If only month and year are provided (YYYY-MM format)
        periodDate = `${period}-01`; // Add day to make it a valid date
      }

      const paymentData = {
        household: householdId,
        fee: feeId,
        amount: parseFloat(amount),
        paymentDate,
        payerName,
        payerId,
        payerPhone,
        receiptNumber,
        note,
        period: periodDate,
        method: paymentMethod,
      };

      await axios.post("/api/payments", paymentData, config);

      setSuccess(true);
      setTimeout(() => {
        navigate("/payments");
      }, 1500);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : "Không thể tạo thanh toán"
      );
    } finally {
      setLoading(false);
    }
  };

  // Generate unique receipt number
  useEffect(() => {
    const generateReceiptNumber = () => {
      const date = new Date();
      const year = date.getFullYear().toString().substr(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");

      return `PM${year}${month}${day}${random}`;
    };

    setReceiptNumber(generateReceiptNumber());
  }, []);

  const paymentMethods = {
    cash: { label: "Tiền mặt", icon: "money-bill-wave" },
    bank_transfer: { label: "Chuyển khoản", icon: "university" },
    other: { label: "Khác", icon: "circle" },
  };

  return (
    <div className="py-3">
      <Button
        variant="dark"
        className="mb-3"
        onClick={() => navigate("/payments")}
      >
        <i className="fas fa-arrow-left me-2"></i>Quay lại
      </Button>

      <Card className="shadow" style={{ background: "#1C1C1E" }}>
        <Card.Header className="border-0 bg-transparent">
          <h4 className="text-light mb-0">Tạo Thanh Toán Mới</h4>
        </Card.Header>

        <Card.Body className="text-light">
          {error && <Message variant="danger">{error}</Message>}
          {success && (
            <Message variant="success">
              Thanh toán đã được tạo thành công
            </Message>
          )}
          {loading && <Loader />}

          <Form onSubmit={submitHandler}>
            <Row className="g-4">
              <Col md={6}>
                <Card className="bg-dark border-0">
                  <Card.Body>
                    <h5 className="mb-4">Thông tin thanh toán</h5>

                    <Form.Group controlId="household" className="mb-3">
                      <Form.Label>
                        <i className="fas fa-home me-2"></i>Hộ Gia Đình
                      </Form.Label>
                      <Form.Select
                        value={householdId}
                        onChange={(e) => setHouseholdId(e.target.value)}
                        isInvalid={!!validationErrors.householdId}
                        className="bg-dark text-light border-secondary"
                        required
                      >
                        <option value="">Chọn Hộ Gia Đình</option>
                        {households.map((household) => (
                          <option key={household._id} value={household._id}>
                            {household.apartmentNumber}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.householdId}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="fee" className="mb-3">
                      <Form.Label>
                        <i className="fas fa-file-invoice-dollar me-2"></i>Loại
                        Phí
                      </Form.Label>
                      <Form.Select
                        value={feeId}
                        onChange={(e) => setFeeId(e.target.value)}
                        isInvalid={!!validationErrors.feeId}
                        className="bg-dark text-light border-secondary"
                        required
                      >
                        <option value="">Chọn Loại Phí</option>
                        {fees.map((fee) => (
                          <option key={fee._id} value={fee._id}>
                            {fee.name} ({fee.amount.toLocaleString()} VND)
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.feeId}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="amount" className="mb-3">
                      <Form.Label>
                        <i className="fas fa-money-bill me-2"></i>Số Tiền
                      </Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Nhập số tiền"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        isInvalid={!!validationErrors.amount}
                        className="bg-dark text-light border-secondary"
                        required
                        min="0"
                        step="1000"
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.amount}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group controlId="paymentDate" className="mb-3">
                          <Form.Label>
                            <i className="fas fa-calendar-alt me-2"></i>Ngày
                            Thanh Toán
                          </Form.Label>
                          <Form.Control
                            type="date"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            isInvalid={!!validationErrors.paymentDate}
                            className="bg-dark text-light border-secondary"
                            required
                          />
                          <Form.Control.Feedback type="invalid">
                            {validationErrors.paymentDate}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group controlId="period" className="mb-3">
                          <Form.Label>
                            <i className="fas fa-clock me-2"></i>
                            {isDebtPayment
                              ? "Kỳ Thanh Toán (Nợ)"
                              : "Kỳ Thanh Toán"}
                          </Form.Label>
                          <Form.Control
                            type="month"
                            value={period.substring(0, 7)}
                            onChange={(e) => setPeriod(e.target.value)}
                            isInvalid={!!validationErrors.period}
                            className="bg-dark text-light border-secondary"
                            required
                          />
                          <Form.Text className="text-muted">
                            {isDebtPayment
                              ? "Chọn tháng cần thanh toán nợ"
                              : "Chọn tháng áp dụng"}
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group controlId="method" className="mb-3">
                      <Form.Label>
                        <i className="fas fa-credit-card me-2"></i>Phương thức
                        thanh toán
                      </Form.Label>
                      <Form.Select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="bg-dark text-light border-secondary"
                        required
                      >
                        {Object.entries(paymentMethods).map(
                          ([key, { label }]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          )
                        )}
                      </Form.Select>
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="bg-dark border-0">
                  <Card.Body>
                    <h5 className="mb-4">Thông tin người thanh toán</h5>

                    <Form.Group controlId="payerName" className="mb-3">
                      <Form.Label>
                        <i className="fas fa-user me-2"></i>Người Thanh Toán
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nhập tên người thanh toán"
                        value={payerName}
                        onChange={(e) => setPayerName(e.target.value)}
                        className="bg-dark text-light border-secondary"
                        readOnly
                      />
                    </Form.Group>

                    <Form.Group controlId="payerId" className="mb-3">
                      <Form.Label>
                        <i className="fas fa-id-card me-2"></i>Số CMND/CCCD
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nhập số CMND/CCCD"
                        value={payerId}
                        onChange={(e) => setPayerId(e.target.value)}
                        className="bg-dark text-light border-secondary"
                        readOnly
                      />
                    </Form.Group>

                    <Form.Group controlId="payerPhone" className="mb-3">
                      <Form.Label>
                        <i className="fas fa-phone-alt me-2"></i>Số Điện Thoại
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nhập số điện thoại"
                        value={payerPhone}
                        onChange={(e) => setPayerPhone(e.target.value)}
                        className="bg-dark text-light border-secondary"
                        readOnly
                      />
                    </Form.Group>

                    <Form.Group controlId="receiptNumber" className="mb-3">
                      <Form.Label>
                        <i className="fas fa-receipt me-2"></i>Số Biên Nhận
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nhập số biên nhận"
                        value={receiptNumber}
                        onChange={(e) => setReceiptNumber(e.target.value)}
                        className="bg-dark text-light border-secondary"
                        readOnly
                      />
                    </Form.Group>

                    <Form.Group controlId="note" className="mb-3">
                      <Form.Label>
                        <i className="fas fa-sticky-note me-2"></i>Ghi Chú
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Nhập ghi chú (nếu có)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="bg-dark text-light border-secondary"
                        readOnly
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Button
              type="submit"
              variant="primary"
              className="w-100 py-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Đang tạo thanh toán...
                </>
              ) : (
                <>
                  <i className="fas fa-plus-circle me-2"></i>Tạo Thanh Toán
                </>
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PaymentCreateScreen;
