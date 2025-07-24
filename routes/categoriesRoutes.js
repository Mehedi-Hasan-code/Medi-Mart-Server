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
    // post category
  })

  return router;
};
