import express from "express"
import path from "path"
import cors from "cors"
import authrouter from "./routes/authRoutes.js"
import DBConnection from "./database/db.js"
import cookieParser from "cookie-parser"
import problemrouter from "./routes/problemRoutes.js"
import testcaserouter from "./routes/testcaseRoutes.js"
import submissionrouter from "./routes/submissionRoutes.js"
import { fileURLToPath } from 'url';

const app = express();
app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(
  '/avatar',
  express.static(path.join(__dirname, 'avatar'))
);

DBConnection();

app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));





app.use('/', authrouter);
app.use('/admin',testcaserouter);
app.use('/',problemrouter);
app.use('/',submissionrouter);

app.listen(5000,()=>{
    console.log("Server connected to port 5000");
})