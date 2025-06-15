const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Only use morgan in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bluemoon_apartment', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    if (process.env.NODE_ENV === 'production') {
      console.error('Error details:', err.message);
    } else {
      process.exit(1);
    }
  });

// Define Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/households', require('./routes/householdRoutes'));
app.use('/api/residents', require('./routes/residentRoutes'));
app.use('/api/fees', require('./routes/feeRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/statistics', require('./routes/statisticRoutes'));

// Base route for API testing
app.get('/api', (req, res) => {
  res.json({ message: 'BlueMoon Apartment Fee Management API' });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// For traditional server environments
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express API for Vercel serverless deployment
module.exports = app; 