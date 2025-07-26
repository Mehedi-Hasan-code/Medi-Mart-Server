module.exports = (paymentsCollection, ordersCollection, decodeFbToken) => {
  const express = require('express');
  const router = express.Router();

  router.get('/', decodeFbToken, async (req, res) => {
    const query = {};
    const email = req.query.email;

    if (email) {
      query.buyer = email;
      if (email !== req.decodedFbToken.email) {
        return res.status(403).send({
          success: false,
          message: 'forbidden access',
        });
      }
    }

    try {
      const result = await paymentsCollection.find(query).toArray();
      res.status(200).json(result);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Failed to fetch payments', error: error.message });
    }
  });

  router.patch('/:transactionId', async (req, res) => {
    try {
      const transactionId = req.params.transactionId;
      const query = { transactionId };
      const updateDocForOrders = { $set: { paymentStatus: 'paid' } };
      const updateDocForPayments = { $set: { status: 'paid' } };
      const payment = paymentsCollection.updateOne(query, updateDocForPayments);
      const orders = ordersCollection.updateOne(query, updateDocForOrders);

      const [paymentResult, ordersResult] = await Promise.all([
        payment,
        orders,
      ]);
      res.json({
        payment: paymentResult,
        orders: ordersResult,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to update payment and order status',
        error: error.message,
      });
    }
  });

  return router;
};
