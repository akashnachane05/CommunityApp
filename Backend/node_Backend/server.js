const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const alumniRoutes = require('./routes/alumniRoutes');
const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const mentorshipRoutes = require('./routes/mentorshipRoutes');
const webinarRoutes = require('./routes/webinarRoutes');
const projectRoutes = require('./routes/projectRoutes');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());


 // For parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {   
    useUnifiedTopology: true,connectTimeoutMS: 30000,  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));
  







app.use('/api/users', userRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/mentorships', mentorshipRoutes);
app.use('/api/webinars', webinarRoutes);
app.use('/api/projects', projectRoutes);
  



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
