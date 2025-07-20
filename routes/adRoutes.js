module.exports = (addsCollection) => {
  const express = require('express');
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const result = await addsCollection.find().toArray();
      res.send(result);
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Failed to fetch ads', details: error.message });
    }
  });

  router.get('/seller', async (req, res) => {
    try {
      const email = req.query.email;
      const query = { seller: email };
      const result = await addsCollection.find(query).toArray();
      res.send(result);
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Failed to fetch seller ads', details: error.message });
    }
  });

  router.post('/', async (req, res) => {
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

  return router;
};
