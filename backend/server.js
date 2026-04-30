const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS - BULLET PROOF VERSION ✅
// MUNDUGA IDI PETTU. ROUTES KANTE MUNDU.
const corsOptions = {
  origin: 'https://taskmaster-xi-ochre.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
// PREFLIGHT REQUEST KI ANSWER
app.options(/.*/, cors(corsOptions)); 

app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Backend Working! CORS Fixed!');
});

// Nee routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
