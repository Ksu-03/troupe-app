const express = require('express');
const crypto = require('crypto');
const prisma = require('../lib/prisma');

const router = express.Router();

function verifySignature(payload, signature) {
  const hmac = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET);
  const calculated = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(signature));
}

router.post('/nowpayments', async (req, res) => {
  try {
    const signature = req.headers['x-nowpayments-sig'];
    const payload = JSON.stringify(req.body);
    
    if (!verifySignature(payload, signature)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    const event = req.body;
    console.log('NOWPayments webhook:', event.payment_id, event.payment_status);
    
    if (event.payment_status === 'finished') {
      const payment = await prisma.payment.findUnique({
        where: { nowpaymentsId: event.payment_id }
      });
      
      if (!payment || payment.status === 'completed') {
        return res.sendStatus(200);
      }
      
      if (payment.productType.startsWith('premium')) {
        const plan = payment.productType === 'premium_monthly' ? 'monthly' : 'yearly';
        const expiresAt = plan === 'monthly'
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        
        await prisma.user.update({
          where: { id: payment.userId },
          data: {
            isPremium: true,
            premiumPlan: plan,
            premiumExpiresAt: expiresAt
          }
        });
        
      } else if (payment.productType.startsWith('gems')) {
        const gemsMap = {
          gems_100: 100,
          gems_500: 550,
          gems_1200: 1400,
          gems_3000: 3750
        };
        const gemsToAdd = gemsMap[payment.productType];
        
        await prisma.user.update({
          where: { id: payment.userId },
          data: {
            focusGems: { increment: gemsToAdd }
          }
        });
      }
      
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          cryptoCurrency: event.pay_currency,
          cryptoAmount: event.pay_amount
        }
      });
      
      console.log(`Payment completed: ${event.payment_id}`);
    }
    
    res.sendStatus(200);
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(200);
  }
});

module.exports = router;
