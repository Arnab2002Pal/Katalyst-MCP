import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { googleAuthRouter } from './auth/google';
import { calendarRouter } from './routes/calender';
import summaryRouter from './routes/summary';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use(
    session({
        secret: process.env.SESSION_SECRET ?? 'dev-secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false, // set to true in production with HTTPS
            sameSite: "lax",
        },
    })
);

app.use('/auth', googleAuthRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/summary', summaryRouter);

app.get('/', (req, res) => {
    res.send('Katalyst MCP backend (Phase 1)');
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});