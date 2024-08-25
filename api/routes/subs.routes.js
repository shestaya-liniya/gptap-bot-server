import authJwt from "./../middleware/authJwt.js";
import { allSubs, getOneSub, removeTokens, updateSubTokens } from '../controllers/subs.controller.js'
import { paymentSuccess, paymentWithStars } from '../controllers/payments.controller.js'

export default function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/subs/all",
    [authJwt.verifyToken, authJwt.isAdmin],
    allSubs
  );

  app.post(
    "/api/subs/one",
    getOneSub
  );

  app.post(
    "/api/subs/update-tokens",
    updateSubTokens
  )

  app.get(
    "/api/subs/payment-success",
    paymentSuccess
  );

  app.post(
    "/api/payment",
    paymentWithStars
  )

  app.put(
    "/api/subs/remove-tokens",
    removeTokens
  )
};