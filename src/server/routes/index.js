const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const products = [
  {
    uuid: 1,
    productName: 'Soylent',
    productDescription: 'Meal replacement that tastes like pancake batter.',
    productPrice: 10.99
  }
];

router.get("/", (req, res, next) => {
  res.render("index", { title: "Express" });
});

router.get('/products/:uuid', function(req, res, next) {
  var productID = req.params.uuid;
  for (var i = 0; i < products.length; i++) {
    if(parseInt(productID) === products[i].uuid) {
      return res.render('product', {productInfo: products[i]});
    } else {
      return res.send("Product does not exist.");
    }
  }
});

router.post('/charge', function(req, res,next) {
  var stripeToken = req.body.stripeToken;
  var price = req.body.price;
  var amount = req.body.price * 100;
  var productName = req.body.name;

  for (var i = 0; i < products.length; i++) {
    if (productName === products[i].productName && parseFloat(price) === parseFloat(products[i].productPrice)) {
      // ensure amount === actual product amount to avoid fraud
      stripe.charges.create({
        card: stripeToken,
        currency: 'usd',
        amount: amount
      },
      function(err, charge) {
        if (err) {
          console.log(err);
          res.send('error');
        } else {
          res.send('success');
        }
      });

    } else {
      console.log('Product name or price mismatch');
      res.send('error');
    }
  }
});

module.exports = router;
