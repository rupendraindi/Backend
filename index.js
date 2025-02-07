import dotenv from "dotenv";
const PORT = process.env.PORT || 5000;
import connectDatabase from "./src/Config/database.js";
import { app } from "./app.js";

dotenv.config({
    path:'./.env'
})

connectDatabase()
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server is running on port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("Not running at",err);
})