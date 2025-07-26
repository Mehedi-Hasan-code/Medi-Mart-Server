const { ObjectId } = require('mongodb');

module.exports = (categoriesCollection, medicinesCollection ,decodeFbToken, verifyAdmin) => {
  const express = require('express');
  const router = express.Router();

  router.get('/', async (req, res) => {
    const allCategories = await categoriesCollection.find().toArray();
    for (category of allCategories) {
      const count = await medicinesCollection.countDocuments({
        category: category.categoryName,
      });

      await categoriesCollection.updateOne(
        { _id: category._id },
        {
          $set: { medicinesCount: count },
        }
      );
    }

    res.send(allCategories);
  });

  router.post('/', decodeFbToken, verifyAdmin, async (req, res) => {
    try {
      const categoryData = req.body;
    

      const result = await categoriesCollection.insertOne(categoryData);
      
      // Get the inserted document by its ID
      const insertedCategory = await categoriesCollection.findOne({ _id: result.insertedId });
      
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: insertedCategory
      });

    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create category',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  })
  
  router.delete('/:id', decodeFbToken, verifyAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await categoriesCollection.deleteOne(query);
      res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
        data: result
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete category',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  })

  router.put('/:id', decodeFbToken, verifyAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: { ...req.body },
      };
      const result = await categoriesCollection.updateOne(query, updateDoc);
      res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: result
      });
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update category',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  })

  return router;
};
