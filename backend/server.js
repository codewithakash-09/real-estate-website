require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const propertiesRouter = require('./routes/properties');
const leadsRouter = require('./routes/leads');
const authRouter = require('./routes/auth');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/properties', propertiesRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/auth', authRouter);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/realestate', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
