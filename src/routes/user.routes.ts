import { Router } from "express";
import { createUser, getData, getUsers } from "../controllers/userController";

const router = Router();

router.post("/users", createUser);
router.get("/users", getUsers);
router.post("/data", getData);

export default router;
