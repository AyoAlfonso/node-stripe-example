const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const products = [
  {
    productName: "Soylent",
    productDescription: "Meal replacement that tastes like pancake batter.",
    productPrice: 10.99
  }
];

router.get("/", (req, res, next) => {
  res.render("index", { title: "Express" });
});

router.get("/products/:name", (req, res, next) => {
  const productName = req.params.name;
  for (let i = 0; i < products.length; i++) {
    if (productName === products[i].productName) {
      return res.render("product", { productInfo: products[i] });
    } else {
      return res.send("Product does not exist.");
    }
  }
});

router.post("/charge", (req, res, next) => {
  const stripeToken = req.body.stripeToken;
  const amount = req.body.price * 100;

  // ensure amount === actual product amount to avoid fraud

  stripe.charges.create(
    {
      card: stripeToken,
      currency: "usd",
      amount
    },
    (err, charge) => {
      if (err) {
        console.log(err);
        res.send("error");
      } else {
        res.send("success");
      }
    }
  );
});

export default router;
