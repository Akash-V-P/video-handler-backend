import { Router } from "express";
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { getTopHundredLikedBooks, getTopHundredViewedBooks, getTopTenLikedAuthors, getTopTenLikedBooks, getTopTenViewedAuthors, getTopTenViewedBooks } from "../controllers/feature.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/like/book/top-ten").get(getTopTenLikedBooks);
router.route("/like/book/top-hundred").get(getTopHundredLikedBooks);
router.route("/like/author/top-ten").get(getTopTenLikedAuthors);
router.route("/view/book/top-ten").get(getTopTenViewedBooks);
router.route("/view/book/top-hundred").get(getTopHundredViewedBooks);
router.route("/view/author/top-ten").get(getTopTenViewedAuthors);


export default router