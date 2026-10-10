import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { STAGES } from "../stages.js";
import ApplicationForm from "../components/ApplicationForm.jsx";
import ApplicationCard from "../components/ApplicationCard.jsx";

export default function Board() {
  const { logout } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.listApplications()
      .then(setApps)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter((a) => a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q));
  }, [apps, query]);

  async function handleCreate(data) {
    const created = await api.createApplication(data);
    setApps((prev) => [created, ...prev]);
    setShowForm(false);
  }

  async function handleMove(id, stage) {
    const previous = apps;
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, stage } : a))); // optimistic
    try {
      await api.changeStage(id, stage);
    } catch (e) {
      setApps(previous);
      setError(e.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this application?")) return;
    await api.deleteApplication(id);
    setApps((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="page">
      <header className="topbar">
        <h1>Job Tracker</h1>
        <div className="topbar-actions">
          <input className="search" placeholder="Search company or role" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button className="btn primary" onClick={() => setShowForm(true)}>+ Add application</button>
          <button className="btn" onClick={logout}>Log out</button>
        </div>
      </header>

      {error && <p className="error banner" onClick={() => setError("")}>{error}</p>}
      {showForm && <ApplicationForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}
      {loading && <p className="muted">Loading...</p>}

      <div className="board">
        {STAGES.map((stage) => {
          const items = filtered.filter((a) => a.stage === stage.key);
          return (
            <section className="column" key={stage.key}>
              <h2>{stage.label} <span className="count">{items.length}</span></h2>
              {items.map((a) => (
                <ApplicationCard key={a.id} app={a} onMove={handleMove} onDelete={handleDelete} />
              ))}
              {items.length === 0 && <p className="empty">Nothing here</p>}
            </section>
          );
        })}
      </div>
    </div>
  );
}
