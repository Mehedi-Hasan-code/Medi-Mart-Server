module.exports = (medicinesCollection) => {
  const express = require('express');
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const { limit, page } = req.query;
      const skip = (page - 1) * limit;

      const result = await medicinesCollection
        .find()
        .skip(skip)
        .limit(Number(limit))
        .toArray();
      res
        .status(200)
        .json({ message: 'Medicine fetched successfully', result });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Failed to get medicine', error });
    }
  });

  router.get('/top-discount', async (req, res) => {
    try {
      // Find top 9 medicines sorted by discount (as number) in descending order
      const result = await medicinesCollection
        .find()
        .sort({ discount: -1 })
        .limit(9)
        .toArray();
      res
        .status(200)
        .json({
          message: 'Top discount medicines fetched successfully',
          medicines: result,
        });
    } catch (error) {
      res
        .status(500)
        .json({
          message: 'Failed to fetch top discount medicines',
          error: error.message,
        });
    }
  });

  router.get('/count', async (req, res) => {
    try {
      const count = await medicinesCollection.countDocuments();
      res.status(200).json({ count });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to get medicine count',
        error: error.message,
      });
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

  router.get('/:category', async (req, res) => {
    try {
      const { category } = req.params;
      if (!category) {
        res.status(400).json({ message: 'Category name is Required' });
      }
      const query = { category };
      const result = await medicinesCollection.find(query).toArray();
      res
        .status(200)
        .json({ message: 'Medicines fetched successfully', medicines: result });
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Failed to fetch medicines', error: error.message });
    }
  });

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

  return router;
};
