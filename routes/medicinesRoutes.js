module.exports = (medicinesCollection) => {
  const express = require('express');
  const router = express.Router();

  router.post('/', async (req, res) => {
    try {
      const medicine = req.body;
      if (!medicine) {
        return res
          .status(400)
          .json({ message: 'Medicine information is required' });
      }
      const result = await medicinesCollection.insertOne(medicine);
      res.status(201).json({
        message: 'Medicine added successfully',
        medicineId: result.insertedId,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Failed to add medicine', error: error.message });
    }
  });

  router.get('/seller', async (req, res) => {
    try {
      const { email } = req.query;
      if (!email) {
        res.status(400).json({ message: 'Seller Email Is Required' });
      }
      const query = { seller: email };
      const result = await medicinesCollection.find(query).toArray();
      res.status(200).json({
        message: 'Medicines fetched successfully',
        medicines: result,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to fetch medicines',
        error: error.message,
      });
    }
  });

  return router;
};
