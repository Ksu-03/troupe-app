const express = require('express');
const axios = require('axios');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const PRODUCTS = {
  premium_monthly: { price: 3.99, type: 'subscription', description: 'Troupe Premium - Monthly' },
  premium_yearly: { price: 29.99, type: 'subscription', description: 'Troupe Premium - Yearly' },
  gems_100: { price: 0.99, type: 'gems', gems: 100, description: '100 Focus Gems' },
  gems_500: { price: 3.99, type: 'gems', gems: 550, description: '550 Focus Gems' },
  gems_1200: { price: 7.99, type: 'gems', gems: 1400, description: '1400 Focus Gems' },
  gems_3000: { price: 14.99, type: 'gems', gems: 3750, description: '3750 Focus Gems' }
};

router.get('/products', async (req, res) => {
  const catalog = Object.entries(PRODUCTS).map(([id, data]) => ({
    id,
    name: data.description,
    price: data.price,
    currency: 'USD',
    gems: data.gems || null,
    type: data.type
  }));
  
  res.json({ products: catalog });
});

router.post('/create', authenticate, async (req, res) => {
  try {
    const { productId } = req.body;
    
    const product = PRODUCTS[productId];
    if (!product) {
      return res.status(400).json({ error: 'Invalid product' });
    }
    
    const orderId = `${req.userId}_${productId}_${Date.now()}`;
    
    const response = await axios.post('https://api.nowpayments.io/v1/payment', {
      price_amount: product.price,
      price_currency: 'usd',
      pay_currency: 'usd',
      order_id: orderId,
      order_description: product.description,
      ipn_callback_url: `${process.env.APP_URL}/webhooks/nowpayments`,
      case: 'success'
    }, {
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    const payment = await prisma.payment.create({
      data: {
        userId: req.userId,
        nowpaymentsId: response.data.payment_id,
        productType: productId,
        amountUsd: product.price,
        status: 'pending',
        checkoutUrl: response.data.invoice_url
      }
    });
    
    res.json({
      success: true,
      paymentId: payment.id,
      checkoutUrl: response.data.invoice_url
    });
    
  } catch (error) {
    console.error('Create payment error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

router.get('/status/:paymentId', authenticate, async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.paymentId }
    });
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    if (payment.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json({
      status: payment.status,
      completedAt: payment.completedAt
    });
    
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

module.exports = router;
