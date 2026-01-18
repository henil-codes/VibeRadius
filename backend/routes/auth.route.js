import { registerUser, loginUser, logoutUser } from "../controllers/auth.contorller.js";
import { Router } from "express";

const authRouter = Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/logout", logoutUser);

export default authRouter;