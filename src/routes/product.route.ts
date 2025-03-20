import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
const router = Router();
const productController = new ProductController();

router.post("/", productController.createProduct);
router.post("/index", productController.createProductIndex);
router.get("/index", productController.getValuetoexistingObj);
router.delete("/index", productController.deleteIndex);

router.get("/search", productController.getPersonalizedSearch);
router.post("/event", productController.recordEvent);
router.get("/profile", productController.getUserProfile);
router.patch("/updateindex", productController.updateindex);
router.get("/:id", productController.getProductById);
router.patch("/attributes", productController.addValuetoexistingObj);
router.patch("/add-value", productController.updateLikeDislikeForProduct);
router.patch("/description", productController.updateDescriptionForProduct);

router.get("/get", productController.getProduct);

export default router;
