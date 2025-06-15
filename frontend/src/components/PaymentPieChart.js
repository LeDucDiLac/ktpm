import React, { useEffect, useMemo, useState } from "react";
import { Card, Form, Row, Col } from "react-bootstrap";
import { Pie } from "react-chartjs-2";
import axios from "axios";

const formatNumber = (num) =>
  typeof num === "number" ? num.toLocaleString() : num;

const PaymentPieChart = ({ userInfo }) => {
  const [feeTypeData, setFeeTypeData] = useState(null);
  const [paymentStatusData, setPaymentStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showByFeeType, setShowByFeeType] = useState(false); // default to "Theo trạng thái thanh toán"
  const [timeRange, setTimeRange] = useState("month"); // "month" or "all"

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };
        // Add query param for time range
        const query = timeRange === "month" ? "?month=current" : "";
        // Fetch fee type data
        const statsRes = await axios.get(
          `/api/payments/fee-type-summary${query}`,
          config
        );
        setFeeTypeData(statsRes.data);

        // Fetch payment status data
        const statusRes = await axios.get(
          `/api/payments/status-summary${query}`,
          config
        );
        setPaymentStatusData(statusRes.data);
      } catch (err) {
        setFeeTypeData(null);
        setPaymentStatusData(null);
      } finally {
        setLoading(false);
      }
    };
    if (userInfo) fetchData();
  }, [userInfo, timeRange]);

  // Vietnamese labels for payment status
  const paymentStatusItems = [
    {
      label: "Đã thanh toán",
      value: paymentStatusData?.paid || 0,
      color: "rgba(34,197,94,0.7)",
      border: "rgba(21,128,61,1)",
    }, // green
    {
      label: "Sắp hết hạn",
      value: paymentStatusData?.dueSoon || 0,
      color: "rgba(245,158,66,0.7)",
      border: "rgba(120,53,15,1)",
    }, // orange
    {
      label: "Quá hạn",
      value: paymentStatusData?.overdue || 0,
      color: "rgba(239,68,68,0.7)",
      border: "rgba(127,29,29,1)",
    }, // red
  ].sort((a, b) => b.value - a.value);

  const paymentStatusPieData = useMemo(() => {
    return {
      labels: paymentStatusItems.map((i) => i.label),
      datasets: [
        {
          data: paymentStatusItems.map((i) => i.value),
          backgroundColor: paymentStatusItems.map((i) => i.color),
          borderColor: paymentStatusItems.map((i) => i.border),
          borderWidth: 2,
        },
      ],
      _sortedItems: paymentStatusItems,
    };
    // eslint-disable-next-line
  }, [paymentStatusData]);

  // Vietnamese labels for fee types (use your backend's Vietnamese keys directly)
  const feeTypePieData = useMemo(() => {
    if (!feeTypeData) return null;
    const colorList = [
      "rgba(34,197,94,0.7)", // green
      "rgba(99, 102, 241, 0.7)", // indigo
      "rgba(245,158,66,0.7)", // orange
      "rgba(239,68,68,0.7)", // red
      "rgba(167, 139, 250, 0.7)", // purple
      "rgba(244, 114, 182, 0.7)", // pink
      "rgba(59, 130, 246, 0.7)", // blue
    ];
    const entries = Object.entries(feeTypeData)
      .map(([label, value], idx) => ({
        label, // Vietnamese label from backend
        value,
        color: colorList[idx % colorList.length],
        border: colorList[idx % colorList.length].replace("0.7", "1"),
      }))
      .sort((a, b) => b.value - a.value);

    return {
      labels: entries.map((i) => i.label),
      datasets: [
        {
          data: entries.map((i) => i.value),
          backgroundColor: entries.map((i) => i.color),
          borderColor: entries.map((i) => i.border),
          borderWidth: 2,
        },
      ],
      _sortedItems: entries,
    };
  }, [feeTypeData]);

  // Sum for fee type (amount) or payment status (count)
  const getPieTotal = () => {
    if (showByFeeType && feeTypePieData && feeTypePieData._sortedItems) {
      return feeTypePieData._sortedItems.reduce(
        (sum, item) => sum + item.value,
        0
      );
    }
    if (
      !showByFeeType &&
      paymentStatusPieData &&
      paymentStatusPieData._sortedItems
    ) {
      return paymentStatusPieData._sortedItems.reduce(
        (sum, item) => sum + item.value,
        0
      );
    }
    return 0;
  };

  // Render summary, one line per category, in Vietnamese
  const renderStatusSummary = () => {
    if (!paymentStatusPieData || !paymentStatusPieData._sortedItems)
      return null;
    return (
      <div
        style={{
          width: "100%",
          color: "#b0b0b0",
          fontSize: "1.1rem",
          marginTop: 16,
        }}
      >
        {paymentStatusPieData._sortedItems.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 8,
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                color: item.color.replace("0.7", "1"),
                fontWeight: 700,
                marginRight: 8,
              }}
            >
              ●
            </span>
            <span
              style={{
                width: 270,
                display: "inline-block",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.label}:
            </span>
            <b style={{ marginLeft: 24 }}>{formatNumber(item.value)}</b>
          </div>
        ))}
        <div style={{ fontWeight: 700, marginTop: 16, fontSize: "1.15rem" }}>
          Tổng cộng:{" "}
          <span style={{ color: "#fff" }}>{formatNumber(getPieTotal())}</span>
        </div>
      </div>
    );
  };

  const renderFeeTypeSummary = () => {
    if (!feeTypePieData || !feeTypePieData._sortedItems) return null;
    return (
      <div
        style={{
          width: "100%",
          color: "#b0b0b0",
          fontSize: "1.1rem",
          marginTop: 16,
        }}
      >
        {feeTypePieData._sortedItems.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 8,
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                color: item.color.replace("0.7", "1"),
                fontWeight: 700,
                marginRight: 8,
              }}
            >
              ●
            </span>
            <span
              style={{
                width: 270,
                display: "inline-block",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.label}:
            </span>
            <b style={{ marginLeft: 24 }}>{formatNumber(item.value)}</b>
          </div>
        ))}
        <div style={{ fontWeight: 700, marginTop: 16, fontSize: "1.15rem" }}>
          Tổng cộng:{" "}
          <span style={{ color: "#fff" }}>
            {formatNumber(getPieTotal())} VND
          </span>
        </div>
      </div>
    );
  };

  // Add the time range selector to the header
  return (
    <Card
      className="shadow h-100"
      style={{ background: "#121212", color: "#b0b0b0" }}
    >
      <Card.Header className="bg-black" style={{ color: "#b0b0b0" }}>
        <div className="d-flex flex-wrap align-items-center justify-content-between">
          <div>
            <Form.Check
              inline
              label="Theo loại phí"
              type="checkbox"
              id="show-by-feetype"
              checked={showByFeeType}
              onChange={() => setShowByFeeType(true)}
              style={{ color: "#b0b0b0" }}
            />
            <Form.Check
              inline
              label="Theo trạng thái thanh toán"
              type="checkbox"
              id="show-by-payment-status"
              checked={!showByFeeType}
              onChange={() => setShowByFeeType(false)}
              style={{ color: "#b0b0b0" }}
            />
          </div>
          <Form.Select
            size="sm"
            style={{
              width: 160,
              background: "#181a1b",
              color: "#b0b0b0",
              border: "1px solid #333",
            }}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="month">Tháng này</option>
            <option value="all">Tất cả</option>
          </Form.Select>
        </div>
        <h5 className="mb-0 mt-2" style={{ color: "#b0b0b0" }}>
          {showByFeeType
            ? "Doanh thu theo loại phí"
            : "Thanh toán theo trạng thái"}
        </h5>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="text-center">Đang tải...</div>
        ) : (
          <Row style={{ width: "100%" }}>
            <Col md={6} xs={12}>
              <div style={{ height: "480px", width: "100%" }}>
                {showByFeeType && feeTypePieData && (
                  <Pie data={feeTypePieData} />
                )}
                {!showByFeeType && paymentStatusPieData && (
                  <Pie data={paymentStatusPieData} />
                )}
              </div>
            </Col>
            <Col md={6} xs={12} className="d-flex align-items-center">
              <div style={{ width: "100%", whiteSpace: "nowrap" }}>
                {showByFeeType && renderFeeTypeSummary()}
                {!showByFeeType && renderStatusSummary()}
              </div>
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
};

export default PaymentPieChart;
