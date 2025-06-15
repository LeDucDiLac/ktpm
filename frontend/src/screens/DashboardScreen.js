import React, { useContext, useEffect, useState, useMemo } from "react";
import { Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import Message from "../components/Message";
import Loader from "../components/Loader";
import PaymentPieChart from "../components/PaymentPieChart";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardScreen = () => {
  const { userInfo } = useContext(AuthContext);
  const [stats, setStats] = useState({
    counts: { households: 0, residents: 0 },
    financials: { monthlyRevenue: 0 },
    recentPayments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!userInfo) return;
        const { data } = await axios.get("/api/statistics/dashboard", {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setStats(data);
      } catch (err) {
        setError("Không thể tải dữ liệu thống kê");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [userInfo]);

  const monthlyTrendData = useMemo(() => {
    if (!stats.financials?.monthlyTrend) return null;

    return {
      labels: stats.financials.monthlyTrend.labels,
      datasets: [
        {
          label: "Doanh Thu",
          data: stats.financials.monthlyTrend.data,
          borderColor: "#4cd964",
          backgroundColor: "rgba(76, 217, 100, 0.2)",
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }, [stats.financials]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw || 0;
            return `${value.toLocaleString()} VND`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "#e0e0e0",
          callback: (value) => `${value.toLocaleString()} VND`,
        },
      },
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "#e0e0e0",
        },
      },
    },
  };

  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;

  return (
    <div className="py-3">
      <h1 className="mb-4 text-light">Thống kê tổng quan</h1>

      <Row className="g-4 mb-4">
        <Col md={6}>
          <Card
            className="h-100 bg-gradient shadow"
            style={{ background: "#0A84FF" }}
          >
            <Card.Body className="text-white">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="mb-3">Số hộ gia đình</h6>
                  <h2 className="mb-3">{stats.counts.households}</h2>
                  <Link
                    to="/households"
                    className="text-white text-decoration-none"
                  >
                    Chi tiết <i className="fas fa-arrow-right ms-1"></i>
                  </Link>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-home fa-3x opacity-75"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card
            className="h-100 bg-gradient shadow"
            style={{ background: "#30D158" }}
          >
            <Card.Body className="text-white">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="mb-3">Số cư dân</h6>
                  <h2 className="mb-3">{stats.counts.residents}</h2>
                  <Link
                    to="/residents"
                    className="text-white text-decoration-none"
                  >
                    Chi tiết <i className="fas fa-arrow-right ms-1"></i>
                  </Link>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-users fa-3x opacity-75"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={12}>
          <Card className="shadow" style={{ background: "#1C1C1E" }}>
            <Card.Header className="border-0 bg-transparent">
              <h5 className="mb-0 text-light">Thống kê thanh toán</h5>
            </Card.Header>
            <Card.Body>
              <PaymentPieChart userInfo={userInfo} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {monthlyTrendData && (
        <Row className="mb-4">
          <Col md={12}>
            <Card className="shadow" style={{ background: "#1C1C1E" }}>
              <Card.Header className="border-0 bg-transparent">
                <h5 className="mb-0 text-light">Xu hướng doanh thu</h5>
              </Card.Header>
              <Card.Body>
                <div style={{ height: "300px" }}>
                  <Line data={monthlyTrendData} options={chartOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row>
        <Col md={12}>
          <Card className="shadow" style={{ background: "#1C1C1E" }}>
            <Card.Header className="border-0 bg-transparent">
              <h5 className="mb-0 text-light">Thanh toán gần đây</h5>
            </Card.Header>
            <Card.Body>
              {stats.recentPayments.length === 0 ? (
                <p className="text-center text-light">Chưa có thanh toán nào</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-hover">
                    <thead>
                      <tr>
                        <th>Căn hộ</th>
                        <th>Loại phí</th>
                        <th>Số tiền</th>
                        <th>Ngày thanh toán</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentPayments.map((payment) => (
                        <tr key={payment._id}>
                          <td>{payment.household?.apartmentNumber || "N/A"}</td>
                          <td>{payment.fee?.name || "N/A"}</td>
                          <td>{payment.amount.toLocaleString()} VND</td>
                          <td>
                            {new Date(payment.paymentDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardScreen;
