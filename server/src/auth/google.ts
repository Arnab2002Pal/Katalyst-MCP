import express from 'express';
import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const googleAuthRouter = express.Router();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_CALLBACK
);

// Scopes: calendar read-only and basic profile
const SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
];

// Step 1: start OAuth flow
googleAuthRouter.get('/google', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
    });
    res.redirect(url);
});

// Step 2: callback
googleAuthRouter.get('/google/callback', async (req, res) => {
    try {
        const code = req.query.code as string;
        const { tokens } = await oauth2Client.getToken(code);

        // Save tokens in session
        (req.session as any).tokens = tokens;
        oauth2Client.setCredentials(tokens);

        // Get user info
        const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
        const userinfo = await oauth2.userinfo.get();

        const existingUser = await prisma.user.upsert({
            where: { googleId: userinfo.data.id! },
            update: {
                name: userinfo.data.name ?? '',
                email: userinfo.data.email ?? '',
                accessToken: tokens.access_token!,
                refreshToken: tokens.refresh_token ?? null
            },
            create: {
                googleId: userinfo.data.id!,
                name: userinfo.data.name ?? '',
                email: userinfo.data.email ?? '',
                accessToken: tokens.access_token!,
                refreshToken: tokens.refresh_token ?? null
            }
        });

        (req.session as any).userId = existingUser.id;
        (req.session as any).user = {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email
        };

        // Google Calendar API instance
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // Past 5 events (sorted descending)
        const pastEventsRes = await calendar.events.list({
            calendarId: 'primary',
            timeMax: new Date().toISOString(),
            maxResults: 50, // fetch more to allow filtering
            singleEvents: true,
            orderBy: 'startTime'
        });
        const pastEvents = (pastEventsRes.data.items ?? [])
            .filter(ev => {
                const start = ev.start?.dateTime ?? ev.start?.date;
                return start && new Date(start) < new Date();
            })
            .sort((a, b) => {
                const ta = new Date(a.start?.dateTime ?? a.start?.date ?? '').getTime();
                const tb = new Date(b.start?.dateTime ?? b.start?.date ?? '').getTime();
                return tb - ta; // latest first
            })
            .slice(0, 5);

        // Upcoming 5 events
        const upcomingEventsRes = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 5,
            singleEvents: true,
            orderBy: 'startTime'
        });
        const upcomingEvents = upcomingEventsRes.data.items ?? [];

        // Merge & upsert in DB
        const allEvents = [...pastEvents, ...upcomingEvents];
        for (const event of allEvents) {
            if (!event.id) continue;
            await prisma.event.upsert({
                where: {
                    googleEventId_userId: {
                        googleEventId: event.id,
                        userId: existingUser.id
                    }
                },
                update: {
                    title: event.summary ?? null,
                    description: event.description ?? null,
                    startDateTime: event.start?.dateTime ? new Date(event.start.dateTime) : null,
                    endDateTime: event.end?.dateTime ? new Date(event.end.dateTime) : null,
                    attendees: event.attendees ? JSON.parse(JSON.stringify(event.attendees)) : null
                },
                create: {
                    googleEventId: event.id,
                    userId: existingUser.id,
                    title: event.summary ?? null,
                    description: event.description ?? null,
                    startDateTime: event.start?.dateTime ? new Date(event.start.dateTime) : null,
                    endDateTime: event.end?.dateTime ? new Date(event.end.dateTime) : null,
                    attendees: event.attendees ? JSON.parse(JSON.stringify(event.attendees)) : null
                }
            });
        }

        // Redirect to dashboard
        res.redirect(process.env.FRONTEND_URL
            ? `${process.env.FRONTEND_URL}/dashboard`
            : 'http://localhost:3000/dashboard');
    } catch (err) {
        console.error('OAuth callback error', err);
        res.status(500).send('Authentication failed');
    }
});


// Middleware to ensure auth
export async function ensureAuth(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) {
    const tokens = (req.session as any)?.tokens;
    const userId = (req.session as any)?.userId;

    if (!tokens || !userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    oauth2Client.setCredentials(tokens);
    (req as any).oauth2Client = oauth2Client;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        (req as any).currentUser = user;
        next();
    } catch (err) {
        console.error('ensureAuth error', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

