import express from "express";
import { getThumbnailById, getUsersThumbnails } from "../controllers/user-controller.js";
import authMiddleware from "../middleware/auth-middleware.js";

const router = express.Router()

router.route("/thumbnails").get(authMiddleware,getUsersThumbnails);
router.route("/thumbnail/:id").get(authMiddleware,getThumbnailById);


export default router