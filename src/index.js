import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({
    path: "./env"
})

connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log("ERR: ", error);
        throw error;
    })

    app.listen(process.env.PORT || 8000, () => {
        console.log(`server running on port: ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGODB connection failed", err);
})