'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Event {
    id: string;
    title: string;
    startDateTime: string;
    endDateTime: string;
    attendees?: string[];
    description?: string;
}

export default function Dashboard() {
    const [upcoming, setUpcoming] = useState<Event[]>([]);
    const [past, setPast] = useState<Event[]>([]);
    const [loadingSummaryId, setLoadingSummaryId] = useState<string | null>(null);
    const [summaries, setSummaries] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/calendar/meetings`, {
                    withCredentials: true,
                });
                const events: Event[] = res.data.events || [];
                const now = new Date();

                const upcomingEvents = events
                    .filter((e: Event) => new Date(e.startDateTime) >= now)
                    .slice(0, 5);

                const pastEvents = events
                    .filter((e: Event) => new Date(e.startDateTime) < now)
                    .slice(0, 5);

                setUpcoming(upcomingEvents);
                setPast(pastEvents);
            } catch (err) {
                console.error('Failed to fetch events', err);
            }
        };

        fetchEvents();
    }, []);

    const generateSummary = async (event: Event) => {
        setLoadingSummaryId(event.id);
        try {
            const start = new Date(event.startDateTime);
            const end = new Date(event.endDateTime);
            const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);

            const payload = {
                title: event.title,
                time: start.toLocaleString(),
                duration: `${durationMinutes} min`,
                attendees: event.attendees || [],
                description: event.description || '',
            };

            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/api/summary`, payload, {
                withCredentials: true,
            });

            setSummaries((prev) => ({
                ...prev,
                [event.id]: res.data.summary,
            }));
        } catch (error) {
            console.error('Failed to generate summary:', error);
        } finally {
            setLoadingSummaryId(null);
        }
    };

    const EventCard = ({ event }: { event: Event }) => {
        const start = new Date(event.startDateTime);
        const end = new Date(event.endDateTime);
        const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);

        return (
            <div className="bg-gray-900 border border-gray-700 shadow-lg rounded-xl p-5 hover:border-blue-500 transition-all">
                <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                <p className="text-sm text-gray-400">
                    {start.toLocaleDateString()} • {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                    {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-sm text-gray-300 mt-1">⏳ Duration: {durationMinutes} min</p>

                {Array.isArray(event.attendees) && event.attendees.length > 0 && (
                    <p className="text-sm text-gray-300 mt-1">
                        👥 <strong>Attendees:</strong> {event.attendees.join(', ')}
                    </p>
                )}
                {event.description && <p className="text-sm text-gray-400 mt-2 italic">{event.description}</p>}

                <button
                    onClick={() => generateSummary(event)}
                    disabled={loadingSummaryId === event.id}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
                >
                    {loadingSummaryId === event.id ? (
                        <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Generating...
                        </span>
                    ) : (
                        '✨ Generate Summary'
                    )}
                </button>

                {summaries[event.id] && (
                    <div className="mt-3 p-3 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200">
                        <strong>Summary:</strong> {summaries[event.id]}
                    </div>
                )}
            </div>
        );
    };

    return (
        <main className="p-6 bg-gray-950 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-white">📅 Dashboard</h1>

            <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-blue-400">Upcoming Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcoming.length > 0 ? (
                        upcoming.map((event) => <EventCard key={event.id} event={event} />)
                    ) : (
                        <p className="text-gray-500 italic">No upcoming events</p>
                    )}
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 text-green-400">Past Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {past.length > 0 ? (
                        past.map((event) => <EventCard key={event.id} event={event} />)
                    ) : (
                        <p className="text-gray-500 italic">No past events</p>
                    )}
                </div>
            </section>
        </main>
    );
}
