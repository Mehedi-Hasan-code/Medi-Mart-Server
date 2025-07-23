module.exports = (ordersCollection) => {
  const express = require('express');
  const router = express.Router();

  router.get('/sellers', async (req, res) => {
    const sellerEmail = req.query.sellerEmail;
    try {
      const result = await ordersCollection
        .aggregate([
          {
            $match: {
              'sellersGroup.seller': sellerEmail,
            },
          },
          { $unwind: '$sellersGroup' },
          {
            $match: {
              'sellersGroup.seller': sellerEmail,
            },
          },
          { $unwind: '$sellersGroup.items' },
          {
            $addFields: {
              'sellersGroup.items.discountedPrice': {
                $toDouble: '$sellersGroup.items.discountedPrice',
              },
            },
          },
          {
            $group: {
              _id: {
                orderId: '$orderId',
                buyer: '$buyer',
                paymentStatus: '$paymentStatus',
                paymentDate: '$paymentDate',
                paymentMethod: '$paymentMethod',
                transactionId: '$transactionId',
                seller: '$sellersGroup.seller',
              },
              totalAmount: { $sum: '$sellersGroup.items.discountedPrice' },
              items: { $push: '$sellersGroup.items' },
            },
          },
          {
            $project: {
              _id: 0,
              orderId: '$_id.orderId',
              buyer: '$_id.buyer',
              paymentStatus: '$_id.paymentStatus',
              paymentDate: '$_id.paymentDate',
              paymentMethod: '$_id.paymentMethod',
              transactionId: '$_id.transactionId',
              seller: '$_id.seller',
              totalAmount: 1,
              items: 1,
            },
          },
        ])
        .toArray();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        message: 'Failed to fetch seller orders',
        error: error.message,
      });
    }
  });

  router.get('/sales-report', async (req, res) => {
    try {
      const result = await ordersCollection
        .aggregate([
          { $unwind: '$sellersGroup' },
          { $unwind: '$sellersGroup.items' },
          {
            $project: {
              _id: 0,
              orderId: 1,
              buyer: '$buyer',
              seller: '$sellersGroup.seller',
              itemName: '$sellersGroup.items.name',
              itemPrice: {
                $toDouble: '$sellersGroup.items.discountedPrice',
              },
              totalPrice: {
                $toDouble: '$totalPrice',
              },
              status: '$paymentStatus',
              paymentDate: '$paymentDate',
            },
          },
          {
            $sort: {
              orderId: 1,
              seller: 1,
            },
          },
        ])
        .toArray();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        message: 'Failed to generate sales report',
        error: error.message,
      });
    }
  });

  router.get('/admin-dashboard', async (req, res) => {

    const result = await ordersCollection.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: { $toDouble: '$totalPrice' } },
          totalPaid: {
            $sum: {
              $cond: [
                { $eq: ['$paymentStatus', 'paid'] },
                { $toDouble: '$totalPrice' },
                0,
              ],
            },
          },
          totalPending: {
            $sum: {
              $cond: [
                { $eq: ['$paymentStatus', 'pending'] },
                { $toDouble: '$totalPrice' },
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalOrders: 1,
          totalAmount: 1,
          totalPaid: 1,
          totalPending: 1,
        },
      },
    ]).toArray();

    res.send(result)
  });

  return router;
};
