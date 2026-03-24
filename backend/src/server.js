// backend/src/server.js - Add this endpoint
app.post('/api/payments/create', async (req, res) => {
  try {
    const { userId, productId, amount, currency } = req.body;
    
    // Create payment in NOWPayments
    const response = await axios.post('https://api.nowpayments.io/v1/payment', {
      price_amount: amount,
      price_currency: 'usd',
      pay_currency: currency || 'usd',
      order_id: `${userId}_${productId}_${Date.now()}`,
      order_description: `Troupe - ${productId}`,
      ipn_callback_url: `${process.env.APP_URL}/webhooks/nowpayments`,
      success_url: `${process.env.FRONTEND_URL}/payment-success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`
    }, {
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    // Save payment to database
    const payment = await prisma.payment.create({
      data: {
        userId,
        productId,
        amount,
        status: 'pending',
        nowpaymentsId: response.data.payment_id,
        checkoutUrl: response.data.invoice_url
      }
    });
    
    res.json({
      success: true,
      checkoutUrl: response.data.invoice_url,
      paymentId: payment.id
    });
    
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});
