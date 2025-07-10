module.exports = (categoriesCollection) => {
  const express = require('express');
  const router = express.Router();

  router.get('/', async (req, res) => {
    const result = await categoriesCollection.find().toArray();
    res.send(result);
  });

  return router;
};
