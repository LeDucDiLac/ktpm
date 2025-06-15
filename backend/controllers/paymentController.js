const Payment = require("../models/paymentModel");
const Fee = require("../models/feeModel");
const Household = require("../models/householdModel");
const asyncHandler = require("express-async-handler");

// Helper to get start and end of current month
function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );
  return { start, end };
}

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
const getPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find()
    .populate("fee", "name feeType amount")
    .populate("household", "apartmentNumber")
    .sort({ paymentDate: -1 });

  res.json(payments);
});

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate("fee", "name feeType amount startDate endDate")
    .populate("household", "apartmentNumber");

  if (!payment) {
    res.status(404);
    throw new Error("Payment not found");
  }

  res.json(payment);
});

// @desc    Create a payment
// @route   POST /api/payments
// @access  Private/Admin/Accountant
const createPayment = asyncHandler(async (req, res) => {
  const {
    fee,
    household,
    amount,
    paymentDate,
    payerName,
    payerId,
    payerPhone,
    receiptNumber,
    note,
    period,
  } = req.body;

  // Check if fee exists
  const feeExists = await Fee.findById(fee);
  if (!feeExists) {
    res.status(404);
    throw new Error("Fee not found");
  }

  // Check if household exists
  const householdExists = await Household.findById(household);
  if (!householdExists) {
    res.status(404);
    throw new Error("Household not found");
  }

  // Determine the period if not provided (default to current month)
  let paymentPeriod = period;
  if (!paymentPeriod) {
    const paymentDate = new Date();
    paymentPeriod = new Date(
      paymentDate.getFullYear(),
      paymentDate.getMonth(),
      1
    );
  } else if (typeof paymentPeriod === "string") {
    paymentPeriod = new Date(paymentPeriod);
  }

  // Check if payment already exists for this fee, household and period
  const paymentExists = await Payment.findOne({
    fee,
    household,
    period: {
      $gte: new Date(paymentPeriod.getFullYear(), paymentPeriod.getMonth(), 1),
      $lt: new Date(
        paymentPeriod.getFullYear(),
        paymentPeriod.getMonth() + 1,
        1
      ),
    },
  });

  if (paymentExists) {
    res.status(400);
    throw new Error(
      "A payment for this fee already exists for this household in the specified period"
    );
  }

  const payment = await Payment.create({
    fee,
    household,
    amount: amount || feeExists.amount,
    paymentDate: paymentDate || Date.now(),
    payerName,
    payerId,
    payerPhone,
    receiptNumber,
    collector: req.user._id, // User who created the payment
    note,
    period: paymentPeriod,
    status: "paid", // Automatically set status to paid when creating a payment
  });

  // Populate the new payment with fee and household details
  const populatedPayment = await Payment.findById(payment._id)
    .populate("fee", "name feeType amount")
    .populate("household", "apartmentNumber")
    .populate("collector", "name");

  res.status(201).json(populatedPayment);
});

// @desc    Update a payment
// @route   PUT /api/payments/:id
// @access  Private/Admin/Accountant
const updatePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);

  if (payment) {
    payment.status = req.body.status || payment.status;
    payment.paymentDate = req.body.paymentDate || payment.paymentDate;
    payment.amount = req.body.amount || payment.amount;
    payment.method = req.body.method || payment.method;

    const updatedPayment = await payment.save();
    res.json(updatedPayment);
  } else {
    res.status(404);
    throw new Error("Payment not found");
  }
});

// @desc    Get payments by household
// @route   GET /api/payments/household/:id
// @access  Private
const getPaymentsByHousehold = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ household: req.params.id })
    .populate("fee", "name amount dueDate")
    .populate("household", "apartmentNumber");
  res.json(payments);
});

// @desc    Get payments by fee
// @route   GET /api/payments/fee/:id
// @access  Private
const getPaymentsByFee = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ fee: req.params.id })
    .populate("fee", "name amount dueDate")
    .populate("household", "apartmentNumber");
  res.json(payments);
});

// @desc    Search payments
// @route   GET /api/payments/search
// @access  Private
const searchPayments = asyncHandler(async (req, res) => {
  const {
    apartmentNumber,
    feeName,
    feeType,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    payerName,
    keyword,
  } = req.query;

  // Build search conditions
  let searchConditions = {};
  let populateConditions = {};

  // Amount range
  if (minAmount || maxAmount) {
    searchConditions.amount = {};
    if (minAmount) searchConditions.amount.$gte = parseFloat(minAmount);
    if (maxAmount) searchConditions.amount.$lte = parseFloat(maxAmount);
  }

  // Date range
  if (startDate || endDate) {
    searchConditions.paymentDate = {};
    if (startDate) searchConditions.paymentDate.$gte = new Date(startDate);
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999); // End of day
      searchConditions.paymentDate.$lte = endDateTime;
    }
  }

  // Payer name
  if (payerName) {
    searchConditions.payerName = { $regex: payerName, $options: "i" };
  }

  // Legacy keyword search
  if (keyword) {
    searchConditions.$or = [
      { status: { $regex: keyword, $options: "i" } },
      { method: { $regex: keyword, $options: "i" } },
      { payerName: { $regex: keyword, $options: "i" } },
      { receiptNumber: { $regex: keyword, $options: "i" } },
    ];
  }

  // Execute the query with population
  let query = Payment.find(searchConditions)
    .populate("household", "apartmentNumber")
    .populate("fee", "name feeType amount dueDate")
    .sort({ paymentDate: -1 });

  let payments = await query;

  if (apartmentNumber) {
    payments = payments.filter((payment) =>
      payment.household?.apartmentNumber
        ?.toLowerCase()
        .includes(apartmentNumber.toLowerCase())
    );
  }

  if (feeName) {
    payments = payments.filter((payment) =>
      payment.fee?.name?.toLowerCase().includes(feeName.toLowerCase())
    );
  }

  if (feeType) {
    payments = payments.filter((payment) => payment.fee?.feeType === feeType);
  }

  res.json(payments);
});

// @desc    Get fee payment status for a household
// @route   GET /api/payments/household/:id/fee-status
// @access  Private
const getHouseholdFeeStatus = asyncHandler(async (req, res) => {
  const householdId = req.params.id;

  // Kiểm tra nếu hộ gia đình tồn tại
  const household = await Household.findById(householdId);
  if (!household) {
    res.status(404);
    throw new Error("Không tìm thấy hộ gia đình");
  }

  // Lấy tất cả các loại phí đang hoạt động
  const activeFees = await Fee.find({ active: true });

  // Lấy tất cả các khoản thanh toán của hộ gia đình
  const householdPayments = await Payment.find({
    household: householdId,
  }).populate("fee", "name feeType amount startDate endDate");

  // Lấy tháng hiện tại và tháng trước
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Kiểm tra quá hạn cho các khoản phí tháng trước
  const firstDayLastMonth = new Date(lastMonthYear, lastMonth, 1);
  const lastDayLastMonth = new Date(currentYear, currentMonth, 0);

  // Kiểm tra các khoản phí tháng hiện tại
  const firstDayCurrentMonth = new Date(currentYear, currentMonth, 1);
  const lastDayCurrentMonth = new Date(currentYear, currentMonth + 1, 0);

  // Kết quả sẽ chứa trạng thái cho từng loại phí
  const feeStatus = activeFees.map((fee) => {
    // Tìm khoản thanh toán cho phí này trong tháng hiện tại (ưu tiên sử dụng period)
    const currentMonthPayment = householdPayments.find(
      (payment) =>
        payment.fee._id.toString() === fee._id.toString() &&
        ((payment.period &&
          payment.period >= firstDayCurrentMonth &&
          payment.period <= lastDayCurrentMonth) ||
          (!payment.period &&
            payment.paymentDate >= firstDayCurrentMonth &&
            payment.paymentDate <= lastDayCurrentMonth))
    );

    // Tìm khoản thanh toán cho phí này trong tháng trước (ưu tiên sử dụng period)
    const lastMonthPayment = householdPayments.find(
      (payment) =>
        payment.fee._id.toString() === fee._id.toString() &&
        ((payment.period &&
          payment.period >= firstDayLastMonth &&
          payment.period <= lastDayLastMonth) ||
          (!payment.period &&
            payment.paymentDate >= firstDayLastMonth &&
            payment.paymentDate <= lastDayLastMonth))
    );

    // Kiểm tra có khoản nào quá hạn không
    const isLastMonthOverdue =
      !lastMonthPayment && fee.startDate <= lastDayLastMonth;

    return {
      _id: fee._id,
      name: fee.name,
      feeType: fee.feeType,
      amount: fee.amount,
      currentMonthStatus: currentMonthPayment ? "paid" : "pending",
      lastMonthStatus: lastMonthPayment
        ? "paid"
        : isLastMonthOverdue
        ? "overdue"
        : "not_applicable",
      currentMonthPayment: currentMonthPayment || null,
      lastMonthPayment: lastMonthPayment || null,
    };
  });

  res.json({
    household: {
      _id: household._id,
      apartmentNumber: household.apartmentNumber,
    },
    feeStatus,
  });
});

// @desc    Get payment status summary for dashboard pie chart
// @route   GET /api/payments/status-summary
// @access  Private
const getPaymentStatusSummary = asyncHandler(async (req, res) => {
  let paidMatch = {};
  let pendingMatch = {};
  let overdueMatch = {};

  let start, end;
  if (req.query.month === "current") {
    const range = getCurrentMonthRange();
    start = range.start;
    end = range.end;
    paidMatch.paymentDate = { $gte: start, $lte: end };
    pendingMatch.dueDate = { $gte: start, $lte: end };
    overdueMatch.dueDate = { $gte: start, $lte: end };
  }

  const now = new Date();
  const soon = new Date();
  soon.setDate(now.getDate() + 7);

  // Paid: paymentDate in this month
  const paidCount = await Payment.countDocuments({
    status: "paid",
    ...paidMatch,
  });

  // Get all pending and overdue payments for this month
  let pendingPayments = [];
  let overduePayments = [];
  if (req.query.month === "current") {
    pendingPayments = await Payment.find({
      status: "pending",
      dueDate: { $gte: start, $lte: end },
    });
    overduePayments = await Payment.find({
      status: "overdue",
      dueDate: { $gte: start, $lte: end },
    });
  } else {
    pendingPayments = await Payment.find({ status: "pending" });
    overduePayments = await Payment.find({ status: "overdue" });
  }

  // Sắp hết hạn: pending, dueDate within next 7 days and dueDate >= now
  const dueSoonCount = pendingPayments.filter(
    (p) => p.dueDate >= now && p.dueDate <= soon
  ).length;

  // Quá hạn: pending, dueDate < now + all overdue
  const overduePendingCount = pendingPayments.filter(
    (p) => p.dueDate < now
  ).length;
  const overdueExplicitCount = overduePayments.length;
  const overdueCount = overduePendingCount + overdueExplicitCount;

  res.json({
    paid: paidCount,
    dueSoon: dueSoonCount,
    overdue: overdueCount,
  });
});

// @desc    Get payment totals grouped by fee type
// @route   GET /api/payments/fee-type-summary
// @access  Private
const getPaymentFeeTypeSummary = asyncHandler(async (req, res) => {
  let match = { status: "paid" };
  if (req.query.month === "current") {
    const { start, end } = getCurrentMonthRange();
    match.paymentDate = { $gte: start, $lte: end };
  }

  const result = await Payment.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "fees",
        localField: "fee",
        foreignField: "_id",
        as: "feeDetails",
      },
    },
    { $unwind: "$feeDetails" },
    {
      $group: {
        _id: "$feeDetails.name",
        total: { $sum: "$amount" },
      },
    },
  ]);
  // Format as { [feeName]: total }
  const summary = {};
  result.forEach((item) => {
    summary[item._id] = item.total;
  });
  res.json(summary);
});

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  getPaymentsByHousehold,
  getPaymentsByFee,
  searchPayments,
  getHouseholdFeeStatus,
  getPaymentStatusSummary,
  getPaymentFeeTypeSummary,
};
