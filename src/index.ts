import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './utils/db';
import logger from './middleware/logger';
import AuthRouter from './routes/Auth.routes';

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

    //LOGGING
    app.use(logger)

    //ROUTES

    app.get('/', (req, res) => {
        res.send({ message: 'Nostrogame server is running!' });
    })
    app.use('/Auth', AuthRouter);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        console.log(err);
        res.status(500).send({ error: 'Something went wrong' });
    })

    //start listening
    app.listen(PORT, () => {
        console.log(`Nostrogame server running on ${PORT}`)
    });
}

bootstrap().catch(console.error);
