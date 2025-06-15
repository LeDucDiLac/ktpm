import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import Message from '../components/Message';
import Loader from '../components/Loader';
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
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

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
    counts: {
      households: 0,
      residents: 0,
      fees: 0,
      temporaryResidences: 0,
      temporaryAbsences: 0
    },
    financials: {
      monthlyRevenue: 0,
      revenueByType: {}
    },
    recentPayments: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!userInfo) {
          return;
        }
        
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        const { data } = await axios.get('/api/statistics/dashboard', config);
        setStats(data);
        setLoading(false);
      } catch (error) {
        setError('Không thể tải dữ liệu tổng quan');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [userInfo]);
  
  // Generate monthly trend data based on current monthly revenue
  const monthlyTrend = useMemo(() => {
    // Sử dụng dữ liệu từ API nếu có
    if (stats.financials.monthlyTrend) {
      return {
        labels: stats.financials.monthlyTrend.labels,
        datasets: [
          {
            label: 'Doanh Thu Hàng Tháng',
            data: stats.financials.monthlyTrend.data,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            tension: 0.3,
          },
        ],
      };
    }
    
    // Fallback nếu không có dữ liệu từ API
    const months = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6'];
    const baseValue = stats.financials.monthlyRevenue || 10000000;
    
    // Generate random but consistent data points around the base value
    const data = months.map((_, index) => {
      // Create a consistent pattern based on month index
      const factor = 0.8 + ((index % 3) * 0.15);
      return Math.floor(baseValue * factor);
    });
    
    return {
      labels: months,
      datasets: [
        {
          label: 'Doanh Thu Hàng Tháng',
          data: data,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.3,
        },
      ],
    };
  }, [stats.financials.monthlyRevenue, stats.financials.monthlyTrend]);
  
  // Prepare data for revenue by fee type chart
  const revenueByTypeData = useMemo(() => {
    // Định nghĩa các màu cho biểu đồ
    const colors = {
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',  // Hồng
        'rgba(54, 162, 235, 0.6)',  // Xanh dương
        'rgba(255, 206, 86, 0.6)',  // Vàng
        'rgba(75, 192, 192, 0.6)',  // Xanh lá
        'rgba(153, 102, 255, 0.6)', // Tím
        'rgba(255, 159, 64, 0.6)',  // Cam
        'rgba(199, 199, 199, 0.6)'  // Xám
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(199, 199, 199, 1)'
      ]
    };

    // Lọc các loại phí có giá trị > 0 và sắp xếp theo giá trị giảm dần
    const revenueEntries = Object.entries(stats.financials.revenueByType)
      .filter(([_, value]) => value > 0)
      .sort((a, b) => b[1] - a[1]);
    
    // Tạo labels hiển thị cả tên loại phí và số tiền
    const labels = revenueEntries.map(([label, value]) => 
      `${label}: ${value.toLocaleString()} VND`
    );
    const values = revenueEntries.map(([_, value]) => value);

    return {
      labels: labels,
      datasets: [
        {
          label: 'Doanh Thu Tháng Hiện Tại',
          data: values,
          backgroundColor: colors.backgroundColor.slice(0, labels.length),
          borderColor: colors.borderColor.slice(0, labels.length),
          borderWidth: 1,
        },
      ],
    };
  }, [stats.financials.revenueByType]);
  
  // Prepare data for counts comparison chart
  const countsComparisonData = useMemo(() => ({
    labels: ['Hộ Gia Đình', 'Cư Dân'],
    datasets: [
      {
        label: 'Số Lượng',
        data: [
          stats.counts.households,
          stats.counts.residents
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1,
      },
    ],
  }), [stats.counts.households, stats.counts.residents]);
  
  // Customize chart options for each chart
  const pieChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: `Tỷ lệ doanh thu ${stats.financials.displayMonthName || 'tháng hiện tại'} theo loại phí`,
        font: {
          size: 14,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${value.toLocaleString()} VND (${percentage}%)`;
          },
          title: function(context) {
            // Lấy tên loại phí từ label (bỏ phần số tiền)
            const fullLabel = context[0].label;
            const feeTypeName = fullLabel.split(':')[0];
            return feeTypeName;
          }
        }
      }
    }
  }), [stats.financials.displayMonthName]);

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Số lượng đối tượng quản lý',
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Số lượng'
        }
      }
    }
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Doanh thu 6 tháng gần nhất',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: ${value.toLocaleString()} VND`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Doanh thu (VND)'
        },
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          }
        }
      }
    }
  };
  
  return (
    <>
      <h1 className="mb-4">Bảng Điều Khiển Quản Lý</h1>
      
      {error && <Message variant="danger">{error}</Message>}
      
      {loading ? (
        <Loader />
      ) : (
        <>
          <Row>
            <Col md={3}>
              <Card className="mb-4 bg-primary text-white shadow">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <Card.Title as="h5">Hộ Gia Đình</Card.Title>
                      <Card.Text as="h2">{stats.counts.households}</Card.Text>
                    </div>
                    <i className="fas fa-home fa-2x"></i>
                  </div>
                  <Link to="/households" className="text-white">
                    <small>Xem Chi Tiết &rarr;</small>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3}>
              <Card className="mb-4 bg-success text-white shadow">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <Card.Title as="h5">Cư Dân</Card.Title>
                      <Card.Text as="h2">{stats.counts.residents}</Card.Text>
                    </div>
                    <i className="fas fa-users fa-2x"></i>
                  </div>
                  <Link to="/residents" className="text-white">
                    <small>Xem Chi Tiết &rarr;</small>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3}>
              <Card className="mb-4 bg-warning text-white shadow">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <Card.Title as="h5">Loại Phí</Card.Title>
                      <Card.Text as="h2">{stats.counts.fees}</Card.Text>
                    </div>
                    <i className="fas fa-file-invoice-dollar fa-2x"></i>
                  </div>
                  <Link to="/fees" className="text-white">
                    <small>Xem Chi Tiết &rarr;</small>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3}>
              <Card className="mb-4 bg-info text-white shadow">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <Card.Title as="h5">Doanh Thu</Card.Title>
                      <Card.Text as="h2">{stats.financials.monthlyRevenue.toLocaleString()}</Card.Text>
                    </div>
                    <i className="fas fa-dollar-sign fa-2x"></i>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-light">
                      {stats.financials.displayMonthName || "Tháng hiện tại"}
                    </small>
                    <Link to="/payments" className="text-white">
                      <small>Xem Chi Tiết &rarr;</small>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row className="mb-4">
            <Col md={6}>
              <Card className="shadow h-100">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Tỷ Lệ Doanh Thu</h5>
                  <small className="text-muted">{stats.financials.displayMonthName || "Tháng hiện tại"} theo loại phí</small>
                </Card.Header>
                <Card.Body>
                  {Object.keys(stats.financials.revenueByType).length === 0 ? (
                    <p className="text-center">Không có dữ liệu doanh thu tháng này</p>
                  ) : (
                    <div style={{ height: '300px' }}>
                      <Pie data={revenueByTypeData} options={pieChartOptions} />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="shadow h-100">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Thống Kê Số Lượng</h5>
                  <small className="text-muted">Số lượng hộ gia đình và cư dân</small>
                </Card.Header>
                <Card.Body>
                  <div style={{ height: '300px' }}>
                    <Bar data={countsComparisonData} options={barChartOptions} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row className="mb-4">
            <Col md={12}>
              <Card className="shadow">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Biểu Đồ Doanh Thu</h5>
                  <small className="text-muted">6 tháng gần nhất</small>
                </Card.Header>
                <Card.Body>
                  <div style={{ height: '300px' }}>
                    <Line data={monthlyTrend} options={lineChartOptions} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row>
            <Col md={12}>
              <Card className="mb-4 shadow">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Phí Đã Thanh Toán Gần Đây</h5>
                </Card.Header>
                <Card.Body>
                  {stats.recentPayments.length === 0 ? (
                    <p className="text-center">Không tìm thấy thanh toán gần đây</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Hộ Gia Đình</th>
                            <th>Phí</th>
                            <th>Số Tiền</th>
                            <th>Ngày</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentPayments.map((payment) => (
                            <tr key={payment._id}>
                              <td>
                                {payment.household?.apartmentNumber || 'N/A'}
                              </td>
                              <td>{payment.fee?.name || 'N/A'}</td>
                              <td>{payment.amount.toLocaleString()} VND</td>
                              <td>
                                {new Date(payment.paymentDate).toLocaleDateString('vi-VN')}
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
        </>
      )}
    </>
  );
};

export default DashboardScreen; 