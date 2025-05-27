import express from "express"
import cors from "cors"
import router from "./routes/authRoutes.js"
import DBConnection from "./database/db.js"
import cookieParser from "cookie-parser"

const app = express();
app.use(express.json());

DBConnection();

app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));





app.use('/', router);

app.listen(5000,()=>{
    console.log("Server connected to port 5000");
})