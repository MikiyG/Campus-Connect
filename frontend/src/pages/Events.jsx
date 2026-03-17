// src/pages/Events.jsx
import "../styles/Events.css";
import TopNavbar from "../components/TopNavbar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function Events() {
  const { user } = useAuth();
  const userId = user?._id || user?.id || null;

  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
  });
  const [creating, setCreating] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const [allRes, myRes] = await Promise.all([
        api.get("/events"),
        api.get("/events/mine"),
      ]);
      setEvents(allRes.data || []);
      setMyEvents(myRes.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load events"
      );
      setEvents([]);
      setMyEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      // Send null explicitly when date is empty to avoid invalid date issues
      const eventData = {
        title: form.title,
        description: form.description,
      };
      
      // Only include date if it has a value
      if (form.date && form.date.trim()) {
        eventData.date = form.date;
      }
      
      await api.post("/events", eventData);
      setForm({ title: "", description: "", date: "" });
      await loadEvents();
      alert(
        "Event submitted. It will appear publicly after admin approval."
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.message ||
          "Could not create event"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (event) => {
    if (!window.confirm("Delete this event? This cannot be undone.")) return;
    try {
      await api.delete(`/events/${event._id || event.id}`);
      await loadEvents();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.message ||
          "Could not delete event"
      );
    }
  };

  const isJoined = (event) => {
    if (!userId || !Array.isArray(event.attendees)) return false;
    return event.attendees.some((id) => String(id) === String(userId));
  };

  const toggleJoin = async (event) => {
    if (!userId) return;
    const joined = isJoined(event);
    try {
      const url = `/events/${event._id || event.id}/${joined ? "leave" : "join"}`;
      const res = await api.post(url);
      const updated = res.data;
      setEvents((prev) =>
        prev.map((e) =>
          String(e._id || e.id) === String(updated._id || updated.id)
            ? updated
            : e
        )
      );
      setMyEvents((prev) =>
        prev.map((e) =>
          String(e._id || e.id) === String(updated._id || updated.id)
            ? updated
            : e
        )
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.message ||
          "Could not update attendance"
      );
    }
  };

  const renderEventCard = (event, showCreator = true, showDelete = true) => {
    const creator = event.created_by;
    const mine = creator && userId && String(creator._id || creator.id) === String(userId);
    const joined = isJoined(event);

    return (
      <div className="event-card" key={event._id || event.id}>
        <h3>{event.title}</h3>
        {event.description && <p>{event.description}</p>}
        <p className="date">
          {event.date ? new Date(event.date).toLocaleString() : "Date TBA"}
        </p>
        {showCreator && creator && (
          <p className="event-meta">
            Created by{" "}
            <span>
              {creator.full_name || creator.email || "Unknown user"}
            </span>
          </p>
        )}
        <p className="event-meta">
          Status: <span>{event.status}</span>
        </p>
        <div className="event-actions">
          <button
            className="btn-primary small"
            type="button"
            onClick={() => toggleJoin(event)}
          >
            {joined ? "Leave Event" : "Join Event"}
          </button>
          {showDelete && mine && (
            <button
              className="btn-danger small"
              type="button"
              onClick={() => handleDelete(event)}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <TopNavbar />
      <div className="events-page">
        <section className="events-hero">
          <div className="overlay" />
          <div className="glow-accent"></div>
          <div className="glow-accent-2"></div>

          <div className="events-container">
            <h1>Campus Events</h1>
            <p className="subtitle">
              Discover and create events across connected universities.
            </p>

            <div className="events-layout">
              <div className="events-left">
                <h2>Create an Event</h2>
                <p className="muted">
                  Share workshops, parties, fairs, and more with other
                  students.
                </p>
                <form className="event-form" onSubmit={handleCreate}>
                  <input
                    type="text"
                    name="title"
                    placeholder="Event title"
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                  <textarea
                    name="description"
                    placeholder="Short description (optional)"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                  />
                  <input
                    type="datetime-local"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                  />
                  <button
                    className="btn-primary"
                    type="submit"
                    disabled={creating}
                  >
                    {creating ? "Creating…" : "Create Event"}
                  </button>
                </form>
              </div>

              <div className="events-right">
                {loading && <p>Loading events…</p>}
                {error && <p style={{ color: "#ff4d4d" }}>{error}</p>}

                {!loading && !error && (
                  <>
                    <h2>All Upcoming Events</h2>
                    <div className="events-grid">
                      {events.length === 0 && (
                        <p style={{ color: "#ccc" }}>
                          No approved events yet. Be the first to create one!
                        </p>
                      )}
                      {events.map((ev) => renderEventCard(ev, true, true))}
                    </div>

                    <h2 style={{ marginTop: "3rem" }}>My Events</h2>
                    <p className="muted">
                      Events you created (including pending approval).
                    </p>
                    <div className="events-grid">
                      {myEvents.length === 0 && (
                        <p style={{ color: "#ccc" }}>
                          You have not created any events yet.
                        </p>
                      )}
                      {myEvents.map((ev) =>
                        renderEventCard(ev, true, true)
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}