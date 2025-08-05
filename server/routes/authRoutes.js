
import express from "express";
import { register, login } from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();


router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, (req, res) => {
  res.status(200).json({
    message: 'Protected profile route accessed',
    user: req.user
  });
});


export default router;