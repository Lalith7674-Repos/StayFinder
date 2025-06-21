const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const bookings = require('./routes/bookings');
const payments = require('./routes/payments');
const favorites = require('./routes/favorites');
const reviews = require('./routes/reviews');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Allow CORS for static files in /uploads
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Or specify your frontend origin
  next();
}, express.static(path.join(__dirname, 'public/uploads')));

// Test endpoint to check uploads directory
app.get('/test-uploads', (req, res) => {
  const fs = require('fs');
  const uploadsPath = path.join(__dirname, 'public/uploads');
  
  try {
    const files = fs.readdirSync(uploadsPath);
    res.json({ 
      message: 'Uploads directory contents',
      files: files,
      uploadsPath: uploadsPath
    });
  } catch (error) {
    res.json({ 
      message: 'Error reading uploads directory',
      error: error.message,
      uploadsPath: uploadsPath
    });
  }
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to StayFinder API' });
});

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const Property = require('./models/Property');
    const count = await Property.countDocuments();
    res.json({ 
      message: 'Database connection successful',
      propertyCount: count,
      connectionStatus: mongoose.connection.readyState
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/bookings', bookings);
app.use('/api/payments', payments);
app.use('/api/favorites', favorites);
app.use('/api/reviews', reviews);

// Error handling middleware
app.use(errorHandler);

// Connect to database and start server
const startServer = async () => {
  try {
    // Try to connect to MongoDB
    await connectDB();
    
    // If connection successful, start the server
    const PORT = 5001;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`MongoDB connection status: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    console.log('Please make sure MongoDB is installed and running on your system.');
    console.log('You can start MongoDB using: mongod');
    process.exit(1);
  }
};

// Handle MongoDB connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

startServer(); 