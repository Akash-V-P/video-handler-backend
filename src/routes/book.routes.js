import { Router } from "express";
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { getAllBooks, getBookById, togglePublishStatus, publishABook, deleteBook, updateBook } from "../controllers/book.controller.js";


const router = Router();

router.use(verifyJWT);


router.route("/").get(getAllBooks)
                 .post(
                    upload.fields(
                        [
                            {
                                name: bookFile,
                                maxCount: 1
                            },
                            {
                                name: coverImage,
                                maxCount: 1
                            }
                        ]
                    ),
                    publishABook
                 )

router.route("/:videoId").patch(upload.single("coverImage"),updateBook)
                         .delete(deleteBook)
                         .get(getBookById)

router.route("/toggle/publish/:videoId").patch(togglePublishStatus)


export default router;