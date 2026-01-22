import express from "express";
import { deleteThumbnail, generateThumbnail } from "../controllers/thumbnail-controller.js";
import authMiddleware from "../middleware/auth-middleware.js";

const router = express.Router()

router.route("/generate").post(authMiddleware,generateThumbnail);
router.route("/delete/:id").delete(authMiddleware,deleteThumbnail);


export default router