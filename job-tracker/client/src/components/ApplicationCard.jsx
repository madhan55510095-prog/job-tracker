import { STAGES } from "../stages.js";

export default function ApplicationCard({ app, onMove, onDelete }) {
  return (
    <article className="card app-card">
      <h3>{app.company}</h3>
      <p className="role">{app.role}</p>
      {app.location && <p className="muted small">{app.location}</p>}
      {app.jobUrl && (
        <a className="small" href={app.jobUrl} target="_blank" rel="noreferrer">Job posting</a>
      )}

      <div className="card-actions">
        <select value={app.stage} onChange={(e) => onMove(app.id, e.target.value)} aria-label="Move to stage">
          {STAGES.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <button className="icon-btn" title="Delete" onClick={() => onDelete(app.id)}>✕</button>
      </div>
    </article>
  );
}
