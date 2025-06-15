import React, { useState, useEffect, useContext } from "react";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import Message from "../components/Message";
import Loader from "../components/Loader";
import AuthContext from "../context/AuthContext";
import axios from "axios";

const ResidentEditScreen = () => {
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const householdIdParam = queryParams.get("household");

  const isEditMode = !!id;

  const [households, setHouseholds] = useState([]);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [idCard, setIdCard] = useState("");
  const [idCardDate, setIdCardDate] = useState("");
  const [idCardPlace, setIdCardPlace] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [nationality, setNationality] = useState("Việt Nam");
  const [ethnicity, setEthnicity] = useState("Kinh");
  const [religion, setReligion] = useState("Không");
  const [occupation, setOccupation] = useState("");
  const [workplace, setWorkplace] = useState("");
  const [phone, setPhone] = useState("");
  const [householdId, setHouseholdId] = useState(householdIdParam || "");
  const [note, setNote] = useState("");
  const [active, setActive] = useState(true);

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);

  useEffect(() => {
    fetchHouseholds();

    if (isEditMode) {
      fetchResidentDetails();
    }
  }, [id]);

  const fetchHouseholds = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get("/api/households", config);
      setHouseholds(data.filter((h) => h.active));
    } catch (error) {
      console.error("Lỗi khi tải danh sách hộ gia đình:", error);
    }
  };

  const fetchResidentDetails = async () => {
    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get(`/api/residents/${id}`, config);

      setFullName(data.fullName);

      if (data.dateOfBirth) {
        const dateObj = new Date(data.dateOfBirth);
        setDateOfBirth(dateObj.toISOString().split("T")[0]);
      }

      setGender(data.gender || "");
      setIdCard(data.idCard || "");

      if (data.idCardDate) {
        const dateObj = new Date(data.idCardDate);
        setIdCardDate(dateObj.toISOString().split("T")[0]);
      }

      setIdCardPlace(data.idCardPlace || "");
      setPlaceOfBirth(data.placeOfBirth || "");
      setNationality(data.nationality || "Việt Nam");
      setEthnicity(data.ethnicity || "Kinh");
      setReligion(data.religion || "Không");
      setOccupation(data.occupation || "");
      setWorkplace(data.workplace || "");
      setPhone(data.phone || "");
      setHouseholdId(data.household?._id || "");
      setNote(data.note || "");
      setActive(data.active);

      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : "Không thể tải thông tin cư dân"
      );
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!fullName) errors.fullName = "Họ tên là bắt buộc";
    if (!gender) errors.gender = "Giới tính là bắt buộc";

    if (idCard && !/^\d+$/.test(idCard)) {
      errors.idCard = "CMND/CCCD chỉ được chứa số";
    }

    if (phone && !/^\d+$/.test(phone)) {
      errors.phone = "Số điện thoại chỉ được chứa số";
    }

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

      const residentData = {
        fullName,
        dateOfBirth: dateOfBirth || null,
        gender,
        idCard,
        idCardDate: idCardDate || null,
        idCardPlace,
        placeOfBirth,
        nationality,
        ethnicity,
        religion,
        occupation,
        workplace,
        phone,
        household: householdId || null,
        note,
        active,
      };

      if (isEditMode) {
        await axios.put(`/api/residents/${id}`, residentData, config);
      } else {
        await axios.post("/api/residents", residentData, config);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/residents");
      }, 1500);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : `Không thể ${isEditMode ? "cập nhật" : "tạo"} cư dân`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-3">
      <Button
        variant="dark"
        className="mb-3"
        onClick={() => navigate("/residents")}
      >
        <i className="fas fa-arrow-left me-2"></i>Quay lại
      </Button>

      <Card className="shadow" style={{ background: "#1C1C1E" }}>
        <Card.Header className="border-0 bg-transparent">
          <h4 className="text-light mb-0">
            {isEditMode ? "Chỉnh Sửa Cư Dân" : "Thêm Cư Dân Mới"}
          </h4>
        </Card.Header>

        <Card.Body className="text-light">
          {error && <Message variant="danger">{error}</Message>}
          {success && (
            <Message variant="success">
              {isEditMode
                ? "Cư dân đã được cập nhật"
                : "Cư dân đã được tạo thành công"}
            </Message>
          )}
          {loading && <Loader />}

          <Form onSubmit={submitHandler}>
            <Row className="g-4">
              <Col md={6}>
                <Card className="bg-dark border-0">
                  <Card.Body>
                    <h5 className="mb-4">Thông tin cá nhân</h5>

                    <Form.Group controlId="fullName" className="mb-3">
                      <Form.Label>
                        <i className="fas fa-user me-2"></i>Họ và Tên
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nhập họ và tên"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        isInvalid={!!validationErrors.fullName}
                        className="bg-dark text-light border-secondary"
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.fullName}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group controlId="dateOfBirth" className="mb-3">
                          <Form.Label>
                            <i className="fas fa-birthday-cake me-2"></i>Ngày
                            Sinh
                          </Form.Label>
                          <Form.Control
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="bg-dark text-light border-secondary"
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group controlId="gender" className="mb-3">
                          <Form.Label>
                            <i className="fas fa-venus-mars me-2"></i>Giới Tính
                          </Form.Label>
                          <Form.Select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            isInvalid={!!validationErrors.gender}
                            className="bg-dark text-light border-secondary"
                            required
                          >
                            <option value="">Chọn giới tính</option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="other">Khác</option>
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {validationErrors.gender}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group controlId="placeOfBirth" className="mb-3">
                      <Form.Label>
                        <i className="fas fa-map-marker-alt me-2"></i>Nơi Sinh
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nhập nơi sinh"
                        value={placeOfBirth}
                        onChange={(e) => setPlaceOfBirth(e.target.value)}
                        className="bg-dark text-light border-secondary"
                      />
                    </Form.Group>

                    <Row>
                      <Col md={4}>
                        <Form.Group controlId="nationality" className="mb-3">
                          <Form.Label>
                            <i className="fas fa-flag me-2"></i>Quốc Tịch
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Nhập quốc tịch"
                            value={nationality}
                            onChange={(e) => setNationality(e.target.value)}
                            className="bg-dark text-light border-secondary"
                          />
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group controlId="ethnicity" className="mb-3">
                          <Form.Label>
                            <i className="fas fa-users me-2"></i>Dân Tộc
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Nhập dân tộc"
                            value={ethnicity}
                            onChange={(e) => setEthnicity(e.target.value)}
                            className="bg-dark text-light border-secondary"
                          />
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group controlId="religion" className="mb-3">
                          <Form.Label>
                            <i className="fas fa-pray me-2"></i>Tôn Giáo
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Nhập tôn giáo"
                            value={religion}
                            onChange={(e) => setReligion(e.target.value)}
                            className="bg-dark text-light border-secondary"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="bg-dark border-0">
                  <Card.Body>
                    <h5 className="mb-4">Thông tin liên hệ</h5>

                    <Row>
                      <Col md={6}>
                        <Form.Group controlId="occupation" className="mb-3">
                          <Form.Label>
                            <i className="fas fa-briefcase me-2"></i>Nghề Nghiệp
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Nhập nghề nghiệp"
                            value={occupation}
                            onChange={(e) => setOccupation(e.target.value)}
                            className="bg-dark text-light border-secondary"
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group controlId="workplace" className="mb-3">
                          <Form.Label>
                            <i className="fas fa-building me-2"></i>Nơi Làm Việc
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Nhập nơi làm việc"
                            value={workplace}
                            onChange={(e) => setWorkplace(e.target.value)}
                            className="bg-dark text-light border-secondary"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group controlId="phone" className="mb-3">
                      <Form.Label>
                        <i className="fas fa-phone me-2"></i>Số Điện Thoại
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nhập số điện thoại"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        isInvalid={!!validationErrors.phone}
                        className="bg-dark text-light border-secondary"
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.phone}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="household" className="mb-3">
                      <Form.Label>
                        <i className="fas fa-home me-2"></i>Hộ Gia Đình
                      </Form.Label>
                      <Form.Select
                        value={householdId}
                        onChange={(e) => setHouseholdId(e.target.value)}
                        className="bg-dark text-light border-secondary"
                      >
                        <option value="">Không thuộc hộ nào</option>
                        {households.map((household) => (
                          <option key={household._id} value={household._id}>
                            {household.apartmentNumber}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group controlId="note" className="mb-3">
                      <Form.Label>
                        <i className="fas fa-sticky-note me-2"></i>Ghi Chú
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Nhập ghi chú (không bắt buộc)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="bg-dark text-light border-secondary"
                      />
                    </Form.Group>

                    {isEditMode && (
                      <Form.Group controlId="active" className="mb-3">
                        <Form.Check
                          type="switch"
                          label="Đang hoạt động"
                          checked={active}
                          onChange={(e) => setActive(e.target.checked)}
                          className="custom-switch"
                        />
                      </Form.Group>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button
                type="submit"
                variant={isEditMode ? "info" : "success"}
                size="lg"
              >
                <i
                  className={`fas fa-${isEditMode ? "save" : "plus"} me-2`}
                ></i>
                {isEditMode ? "Cập Nhật" : "Tạo Mới"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ResidentEditScreen;
