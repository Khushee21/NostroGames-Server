import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './utils/db';
import AuthRouter from './routes/All.routes';
import { sendSuccess, sendError } from './utils/apiResponse';

dotenv.config();

async function bootstrap() {

    //DB connection
    await connectDB();

    const app = express();
    const PORT = process.env.PORT || 8000;

    //ENABLE CORS
    const corsOrigin = process.env.CORS_ORIGIN;

    app.use(cors({
        origin: corsOrigin,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }));

    //BODY PARSERS
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));



    //ROUTES

    app.get('/', (req, res) => {
        sendSuccess(res, { message: 'Nostrogame server is running! ' })
    })
    app.use('/Game', AuthRouter);

    app.use((err: any, _req: Request, res: Response) => {
        console.log('Global err', err);
        sendError(res, 'Internal server erro', 500, err);
    })

    //start listening
    app.listen(PORT, () => {
        console.log(`Nostrogame server running on ${PORT}`)
    });
}

bootstrap().catch(console.error);
