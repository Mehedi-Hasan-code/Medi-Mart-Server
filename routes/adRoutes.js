const { ObjectId } = require('mongodb');

module.exports = (addsCollection,decodeFbToken, verifyAdmin, verifySeller) => {
  const express = require('express');
  const router = express.Router();

  router.get('/',decodeFbToken, verifyAdmin, async (req, res) => {
    try {
      const result = await addsCollection.find().toArray();
      res.send(result);
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Failed to fetch ads', details: error.message });
    }
  });

  router.get('/seller',decodeFbToken, verifySeller, async (req, res) => {
    try {
      const email = req.query.email;
      if (email !== req.decodedFbToken.email) {
        return res.status(403).send({
            success: false,
            message: 'forbidden access',
        });
    }
      const query = { seller: email };
      const result = await addsCollection.find(query).toArray();
      res.send(result);
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Failed to fetch seller ads', details: error.message });
    }
  });

  router.get('/active', async (req, res) => {
    try {
      const query = { status: 'active' };
      const result = await addsCollection.find(query).toArray();
      res.send(result);
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Failed to fetch active ads', details: error.message });
    }
  });

  router.post('/',decodeFbToken, verifySeller, async (req, res) => {
    try {
      const adData = req.body;
      const result = await addsCollection.insertOne(adData);
      res.send(result);
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Failed to create ad', details: error.message });
    }
  });

  router.patch('/:id',decodeFbToken, verifyAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const statusData = req.body;
      const updateDoc = { $set: statusData };
      const result = await addsCollection.updateOne(query, updateDoc);
      res.send(result);
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Failed to update ad', details: error.message });
    }
  });

  return router;
};
