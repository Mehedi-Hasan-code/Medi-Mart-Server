require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const usersRoutes = require('./routes/usersRoutes');
const categoriesRoutes = require('./routes/categoriesRoutes');
const medicinesRoutes = require('./routes/medicinesRoutes');

const app = express();
const port = 3000;

// middleware
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // database and collections
    const database = client.db('Medi-Mart');
    const usersCollection = database.collection('users');
    const categoriesCollection = database.collection('categories');
    const medicinesCollection = database.collection('medicines');

    // Mount routes
    app.use('/users', usersRoutes(usersCollection));
    app.use('/categories', categoriesRoutes(categoriesCollection));
    app.use('/medicines', medicinesRoutes(medicinesCollection))

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
