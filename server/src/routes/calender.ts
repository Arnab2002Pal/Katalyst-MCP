// src/routes/calendar.ts
import express from 'express';
import { google } from 'googleapis';
import { ensureAuth } from '../auth/google.js';
import { prisma } from '../prisma.js';

export const calendarRouter = express.Router();

// helper: convert Google event to fields we store
function mapGoogleEventToFields(e: any, userId: string) {
    // parse start & end (dateTime or date)
    const startStr = e.start?.dateTime ?? e.start?.date;
    const endStr = e.end?.dateTime ?? e.end?.date;

    const startDateTime = startStr ? new Date(startStr) : null;
    const endDateTime = endStr ? new Date(endStr) : null;

    const attendees = e.attendees ?? [];

    return {
        googleEventId: e.id,
        userId,
        title: e.summary ?? null,
        description: e.description ?? null,
        startDateTime,
        endDateTime,
        attendees,
    };
}

calendarRouter.get('/meetings', ensureAuth, async (req, res) => {
    try {
        const currentUser = (req as any).currentUser;

        const events = await prisma.event.findMany({
            where: { userId: currentUser.id },
            orderBy: { startDateTime: 'desc' }
        });

        res.json({ events });
    } catch (err) {
        console.error('Meetings fetch error', err);
        res.status(500).json({ error: 'Failed to fetch meetings' });
    }
});

// GET /api/calendar/stored?limit=20
// Return stored events from DB for current user
calendarRouter.get('/stored', ensureAuth, async (req, res) => {
    const currentUser = (req as any).currentUser;
    const limit = Math.min(200, Number(req.query.limit ?? 50));

    try {
        const events = await prisma.event.findMany({
            where: { userId: currentUser.id },
            orderBy: { startDateTime: 'desc' },
            take: limit,
        });

        return res.json({ events });
    } catch (err) {
        console.error('Stored events fetch error', err);
        return res.status(500).json({ error: 'Failed to fetch stored events' });
    }
});
