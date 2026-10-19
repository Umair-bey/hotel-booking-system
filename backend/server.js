const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
// Uses Render's port in production, 3000 locally
const PORT = process.env.PORT || 3000; 

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Routes
const roomRoutes = require('./routes/rooms');
const bookingRoutes = require('./routes/bookings');

app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});