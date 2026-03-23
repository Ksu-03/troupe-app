const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Simple health check
app.get('/', (req, res) => {
  res.json({ message: 'Troupe API is running!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Auth endpoints
app.post('/api/auth/register', (req, res) => {
  res.json({ message: 'Register endpoint - to be implemented' });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ message: 'Login endpoint - to be implemented' });
});

// Products endpoint
app.get('/api/payments/products', (req, res) => {
  res.json({
    products: [
      { id: 'premium_monthly', name: 'Premium Monthly', price: 3.99 },
      { id: 'premium_yearly', name: 'Premium Yearly', price: 29.99 },
      { id: 'gems_100', name: '100 Gems', price: 0.99 },
      { id: 'gems_500', name: '500 Gems', price: 3.99 },
      { id: 'gems_1200', name: '1200 Gems', price: 7.99 },
      { id: 'gems_3000', name: '3000 Gems', price: 14.99 }
    ]
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test URLs:`);
  console.log(`  - https://troupe-app.up.railway.app/`);
  console.log(`  - https://troupe-app.up.railway.app/health`);
  console.log(`  - https://troupe-app.up.railway.app/api/test`);
  console.log(`  - https://troupe-app.up.railway.app/api/payments/products`);
});
