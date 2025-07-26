require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const admin = require('firebase-admin');

const usersRoutes = require('./routes/usersRoutes');
const categoriesRoutes = require('./routes/categoriesRoutes');
const medicinesRoutes = require('./routes/medicinesRoutes');
const stripeRoute = require('./routes/stripeRoute');
const paymentsRoutes = require('./routes/paymentsRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const adRoutes = require('./routes/adRoutes');

const app = express();
const port = process.env.PORT || 3000;

// firebase admin
const decoded = Buffer.from(process.env.FB_ADMIN_SECRET, 'base64').toString(
  'utf-8'
);
const serviceAccount = JSON.parse(decoded);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// middleware
app.use(
  cors({
    origin: 'http://localhost:5173',
    // origin: 'https://drive-nest.web.app',
    credentials: true,
  })
);
app.use(express.json());

// custom middleware
const decodeFbToken = async (req, res, next) => {
  try {
    const fbToken = req.headers?.authorization?.split(' ')[1];

    if (!fbToken) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      });
    }

    const decodedFbToken = await admin.auth().verifyIdToken(fbToken);
    req.decodedFbToken = decodedFbToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

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
    // verify admin
    const verifyAdmin = async (req, res, next) => {
      const email = req.decodedFbToken.email;
      const query = { email };
      const user = await usersCollection.findOne(query);

      if (!user || user.role !== 'admin') {
        return res.status(403).send({ message: 'Forbidden access' });
      }
      next();
    };

    const verifySeller = async (req, res, next) => {
      const email = req.decodedFbToken.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      if (!user || user.role !== 'seller') {
        return res.status(403).send({ message: 'Forbidden access' });
      }
      next();
    };

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // database and collections
    const database = client.db('Medi-Mart');
    const usersCollection = database.collection('users');
    const categoriesCollection = database.collection('categories');
    const medicinesCollection = database.collection('medicines');
    const ordersCollection = database.collection('orders');
    const paymentsCollection = database.collection('payments');
    const addsCollection = database.collection('ads');

    // Mount routes
    app.use('/users', usersRoutes(usersCollection, decodeFbToken, verifyAdmin));
    app.use(
      '/categories',
      categoriesRoutes(
        categoriesCollection,
        medicinesCollection,
        decodeFbToken,
        verifyAdmin
      )
    );
    app.use(
      '/medicines',
      medicinesRoutes(medicinesCollection, decodeFbToken, verifySeller)
    );
    app.use('/checkout', stripeRoute(paymentsCollection, ordersCollection));
    app.use(
      '/payments',
      paymentsRoutes(paymentsCollection, ordersCollection, decodeFbToken)
    );
    app.use(
      '/orders',
      ordersRoutes(ordersCollection, decodeFbToken, verifyAdmin, verifySeller)
    );
    app.use(
      '/ads',
      adRoutes(addsCollection, decodeFbToken, verifyAdmin, verifySeller)
    );

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
