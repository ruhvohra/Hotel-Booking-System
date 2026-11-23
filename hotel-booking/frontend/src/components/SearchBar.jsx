import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Users } from "lucide-react";

export default function SearchBar({ onSearch, compact = false }) {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [form, setForm] = useState({
    search: "",
    checkIn: today,
    checkOut: tomorrow,
    guests: 2,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (form.search) params.set("search", form.search);
    if (form.checkIn) params.set("checkIn", form.checkIn);
    if (form.checkOut) params.set("checkOut", form.checkOut);
    if (form.guests) params.set("guests", form.guests);
    if (onSearch) onSearch(form);
    else navigate(`/hotels?${params.toString()}`);
  };

  const barStyle = compact
    ? {
        background: "#fff",
        borderRadius: 14,
        padding: "12px 16px",
        display: "flex",
        gap: 12,
        alignItems: "center",
        flexWrap: "wrap",
        boxShadow: "var(--shadow-sm)",
        border: "1px solid var(--sand)",
      }
    : {
        background: "rgba(255,255,255,0.97)",
        borderRadius: 20,
        padding: "8px",
        display: "flex",
        gap: 4,
        alignItems: "stretch",
        boxShadow: "var(--shadow-lg)",
        border: "1px solid rgba(201,168,76,0.15)",
      };

  const fieldStyle = compact
    ? { flex: 1, minWidth: 140 }
    : {
        flex: 1,
        padding: "12px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        minWidth: 140,
      };

  return (
    <form onSubmit={handleSubmit} style={barStyle}>
      {!compact && (
        <>
          <div style={fieldStyle}>
            <label
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 2,
              }}
            >
              Destination
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MapPin size={15} color="var(--gold)" />
              <input
                value={form.search}
                onChange={(e) => setForm({ ...form, search: e.target.value })}
                placeholder="City, hotel, or landmark..."
                style={{
                  border: "none",
                  outline: "none",
                  fontSize: 14,
                  width: "100%",
                  padding: 0,
                  background: "transparent",
                }}
              />
            </div>
          </div>
          <div
            style={{ width: 1, background: "var(--sand)", margin: "8px 0" }}
          />
          <div style={fieldStyle}>
            <label
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 2,
              }}
            >
              Check In
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar size={15} color="var(--gold)" />
              <input
                type="date"
                value={form.checkIn}
                min={today}
                onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                style={{
                  border: "none",
                  outline: "none",
                  fontSize: 14,
                  width: "100%",
                  padding: 0,
                  background: "transparent",
                }}
              />
            </div>
          </div>
          <div
            style={{ width: 1, background: "var(--sand)", margin: "8px 0" }}
          />
          <div style={fieldStyle}>
            <label
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 2,
              }}
            >
              Check Out
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar size={15} color="var(--gold)" />
              <input
                type="date"
                value={form.checkOut}
                min={form.checkIn}
                onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                style={{
                  border: "none",
                  outline: "none",
                  fontSize: 14,
                  width: "100%",
                  padding: 0,
                  background: "transparent",
                }}
              />
            </div>
          </div>
          <div
            style={{ width: 1, background: "var(--sand)", margin: "8px 0" }}
          />
          <div style={fieldStyle}>
            <label
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 2,
              }}
            >
              Guests
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Users size={15} color="var(--gold)" />
              <select
                value={form.guests}
                onChange={(e) => setForm({ ...form, guests: e.target.value })}
                style={{
                  border: "none",
                  outline: "none",
                  fontSize: 14,
                  padding: 0,
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} Guest{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-gold"
            style={{ borderRadius: 14, padding: "14px 28px", fontSize: 15 }}
          >
            <Search size={18} />
            Search
          </button>
        </>
      )}
      {compact && (
        <>
          <Search size={18} color="var(--gold)" />
          <input
            value={form.search}
            onChange={(e) => setForm({ ...form, search: e.target.value })}
            placeholder="Search hotels, cities..."
            style={{
              border: "none",
              outline: "none",
              fontSize: 14,
              flex: 1,
              background: "transparent",
            }}
          />
          <input
            type="date"
            value={form.checkIn}
            onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
            style={{
              border: "none",
              outline: "none",
              fontSize: 13,
              background: "transparent",
              color: "var(--muted)",
            }}
          />
          <button type="submit" className="btn btn-gold btn-sm">
            Search
          </button>
        </>
      )}
    </form>
  );
}
