module.exports = (paymentsCollection) => {
  const express = require('express');
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const router = express.Router();

  router.post('/', async (req, res) => {
    const orderData = req.body;

    const getItemsDataForStripe = () => {
      if (!orderData) return [];

      // Group items by seller first
      const sellerGroups = orderData.sellers;

      // Convert seller groups to Stripe line items
      const line_items = sellerGroups.flatMap((sellerGroup) =>
        sellerGroup.items.map((item) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              metadata: {
                seller: item.seller,
                price: item.discountedPrice,
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
    console.log(line_items);

    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: ['US', 'BD']
      },
      success_url: `${process.env.BASE_URL}/success`,
      cancel_url: `${process.env.BASE_URL}/cancel`,
    });

    console.log(session);
    res.send(session.url);
  });

  return router;
};
