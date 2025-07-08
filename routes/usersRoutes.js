module.exports = (usersCollection) => {
  const express = require('express');
  const router = express.Router();

  router.post('/', async (req, res) => {
    try {
      const userInfo = req.body;
      if (!userInfo || Object.keys(userInfo).length === 0) {
        res.status(400).json({ message: 'user data is required' });
        return;
      }
      const result = await usersCollection.insertOne(userInfo);

      if (result.insertedId) {
        res.status(201).json({
          message: 'User created successfully',
          userId: result.insertedId,
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      res
        .status(500)
        .json({ message: 'Internal server error while creating user.' });
    }
  });

  return router;
};
