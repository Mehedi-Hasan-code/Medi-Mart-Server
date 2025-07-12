module.exports = (categoriesCollection, medicinesCollection) => {
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

  return router;
};
