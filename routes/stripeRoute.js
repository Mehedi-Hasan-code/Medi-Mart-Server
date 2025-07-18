module.exports = (ordersCollection, paymentsCollection) => {
  const express = require('express');
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const router = express.Router();

  router.post('/', async (req, res) => {
    try {
      const sellersGroup = req.body;

      const getItemsDataForStripe = () => {
        if (!sellersGroup) return [];

        // Convert seller groups to Stripe line items
        const line_items = sellersGroup.flatMap((sellerGroup) =>
          sellerGroup.items.map((item) => ({
            price_data: {
              currency: 'usd',
              product_data: {
                name: item.name,
                images: [item.image],
                metadata: {
                  seller: item.seller,
                  price: item.discountedPrice,
                  image: item.image,
                },
              },
              unit_amount: Math.round(parseFloat(item.discountedPrice) * 100),
            },
            quantity: item.quantity,
          }))
        );

        return line_items;
      };

      const line_items = getItemsDataForStripe();
      console;
      const session = await stripe.checkout.sessions.create({
        line_items: line_items,
        mode: 'payment',
        shipping_address_collection: {
          allowed_countries: ['US', 'BD'],
        },
        success_url: `${process.env.BASE_URL}/complete?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.BASE_URL}/canceled`,
      });

      res.send(session.url);
    } catch (error) {
      console.error('Stripe checkout error:', error);
      res
        .status(500)
        .json({ error: 'An error occurred while processing payment.' });
    }
  });

  router.post('/verify-payment', async (req, res) => {
    const { session_id } = req.query;
    const OrderData = req.body;

    if (!session_id) {
      return res.status(400).json({
        error: 'Missing session id in the query',
      });
    }

    try {
      const [session, lineItems] = await Promise.all([
        stripe.checkout.sessions.retrieve(session_id, {
          expand: ['payment_intent.payment_method'],
        }),
        stripe.checkout.sessions.listLineItems(session_id, {
          expand: ['data.price.product'],
        }),
      ]);

      if (session.payment_status === 'paid') {
        const transactionId = session.payment_intent.id;
        OrderData.transactionId = transactionId;
        const PaymentData = {
          transactionId: transactionId,
          buyer: OrderData.buyer,
          total_amount: OrderData.totalPrice,
          status: 'pending',
          payment_method: 'stripe',
        };
        const isInserted = await paymentsCollection.findOne({ transactionId });

        if (!isInserted) {
          const [paymentResult, orderResult] = await Promise.all([
            paymentsCollection.insertOne(PaymentData),
            ordersCollection.insertOne(OrderData),
          ]);

          return res.status(200).json({
            payment_success: true,
            insert_success: true,
            message: 'Payment successful and data is inserted',
            paymentResult,
            orderResult,
          });
        }

        return res.status(200).json({
          payment_success: true,
          insert_success: false,
          message: 'Payment successful and data already exist',
          customer_email: session.customer_details.email,
          amount_total: session.amount_total,
          items: lineItems,
          transactionId: transactionId,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Payment not completed',
          status: session.payment_status,
        });
      }
    } catch (error) {
      console.log('Error verifying session', error.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    9;
  });

  return router;
};
