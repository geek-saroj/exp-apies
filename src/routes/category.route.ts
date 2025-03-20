import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";

const router = Router();
const categoryController = new CategoryController();

router.post("/", categoryController.createCategory);
router.get("/get/:id", categoryController.getProduct);

export default router;
