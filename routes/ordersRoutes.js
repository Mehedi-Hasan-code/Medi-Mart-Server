module.exports = (ordersCollection) => {
  const express = require('express');
  const router = express.Router();

  router.post('/', async (req, res) => {
    try {
      const orderDetails = req.body
      if (!orderDetails) {
        return res.status(400).json({ message: 'Order Details is needed' });
      }
      const result = await ordersCollection.insertOne(orderDetails);

      res.status(201).json({
        message: 'Order placed successfully',
        orderId: result.insertedId,
      });
    } catch (error) {
      console.error('Error placing order:', error);
      res
        .status(500)
        .json({ message: 'Failed to place order', error: error.message });
    }
  });

  return router;
};
