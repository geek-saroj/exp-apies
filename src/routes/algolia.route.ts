import express from "express";

const router = express.Router();

router.post("/push", (req: any, res): any => {
  return res.status(200).json({ message: "Product created successfully" });
});

router.get("/search", (req: any, res: any) => {
  return res.status(200).json({ message: "Product created successfully" });
});

export default router;
