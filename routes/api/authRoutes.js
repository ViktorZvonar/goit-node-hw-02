const express = require("express");

const router = express.Router();

const ctrl = require("../../controllers/authConrollers");

const validation = require("../../middlewares/validationAuth");

const authenticate = require("../../middlewares/authorization");

const authSchemas = require("../../schemas/userSchema");

const upload = require("../../middlewares/getAvatar");

router.post(
  "/register",
  upload.single("avatar"),
  validation(authSchemas.registerSchema),
  ctrl.register
);
router.get("/verify/:verificationToken", ctrl.verifyEmail);
router.post(
  "/verify",
  validation(authSchemas.emailSchema),
  ctrl.resendVerifiedEmail
);
router.post("/login", validation(authSchemas.loginSchema), ctrl.login);
router.get("/current", authenticate, ctrl.getCurrent);
router.post("/logout", authenticate, ctrl.logout);
router.patch(
  "/",
  authenticate,
  validation(authSchemas.updateSubscriptionSchema),
  ctrl.updateSubscription
);

router.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  ctrl.updateAvatar
);

module.exports = router;
