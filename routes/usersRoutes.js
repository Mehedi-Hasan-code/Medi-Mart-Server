const { ObjectId } = require('mongodb');

module.exports = (usersCollection) => {
  const express = require('express');
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const users = await usersCollection.find().toArray();
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Internal server error while getting users' });
    }
  });

  router.get('/role', async (req, res) => {
    try {
      const email = req.query.email;
      if (!email) {
        return res
          .status(400)
          .json({ message: 'Email query parameter is required' });
      }
      const query = { email };
      const user = await usersCollection.findOne(query);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ role: user.role || null });
    } catch (error) {
      console.error('Error fetching user role:', error);
      res
        .status(500)
        .json({ message: 'Internal server error while fetching user role' });
    }
  });

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

  router.patch('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role || Object.keys(role).length === 0) {
        return res.status(400).json({ message: 'Role data is required' });
      }

      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: { role },
      };

      const result = await usersCollection.updateOne(query, updateDoc);

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (result.modifiedCount === 0) {
        return res.status(200).json({
          message: 'User role updated successfully (no changes made)',
        });
      }

      res.status(200).json({
        message: 'User role updated successfully',
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      res
        .status(500)
        .json({ message: 'Internal server error while updating user role' });
    }
  });

  return router;
};
