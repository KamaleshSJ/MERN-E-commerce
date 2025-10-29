import express from 'express'
import cookieParser from 'cookie-parser';
import product from './routes/productRoutes.js';
import user from "./routes/userRoutes.js";
import errorHandleMiddleware from './middleware/error.js'

const app = express();


app.use(express.json())
app.use(cookieParser())

app.use('/api/v1',product)
app.use('/api/v1',user)

app.use (errorHandleMiddleware)
export default app;