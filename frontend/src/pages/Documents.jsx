import { useState, useEffect, useRef } from "react";
import api from "../api";

/* ─── helpers ──────────────────────────────────────────────────── */
function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function fileTypeInfo(fileType, fileName) {
  const ext = (fileType || fileName || "").toLowerCase();
  if (ext.includes("pdf")) return { icon: "📄", label: "PDF", color: "var(--danger-text)", bg: "var(--danger-bg)" };
  if (ext.match(/jpg|jpeg|png|gif|webp|svg/)) return { icon: "🖼️", label: "Image", color: "var(--purple-text)", bg: "var(--purple-bg)" };
  if (ext.match(/doc|docx/)) return { icon: "📝", label: "Word", color: "var(--primary)", bg: "var(--primary-light)" };
  if (ext.match(/xls|xlsx|csv/)) return { icon: "📊", label: "Sheet", color: "var(--success-text)", bg: "var(--success-bg)" };
  return { icon: "📎", label: "File", color: "var(--muted-foreground)", bg: "var(--input-bg)" };
}

function bytesToSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

/* ─── sub-components ────────────────────────────────────────────── */
function Alert({ type, children, onDismiss }) {
  const s = type === "success"
    ? { background: "var(--success-bg)", color: "var(--success-text)", border: "1px solid var(--success-bg)" }
    : { background: "var(--danger-bg)", color: "var(--danger-text)", border: "1px solid var(--danger-bg)" };
  return (
    <div style={{ ...s, padding: "9px 13px", borderRadius: 9, fontSize: 13, fontWeight: 500, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span>{children}</span>
      {onDismiss && <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: 15, lineHeight: 1, padding: "0 2px" }}>×</button>}
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: 76, borderRadius: 13, background: "var(--input-bg)", border: "1px solid var(--border)", animation: "pulse 1.5s ease-in-out infinite" }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}

function EmptyState({ filtered }) {
  return (
    <div style={{ background: "var(--card)", border: "1.5px dashed var(--border)", borderRadius: 14, padding: "48px 24px", textAlign: "center", color: "var(--muted-foreground)" }}>
      <div style={{ fontSize: 42, marginBottom: 12 }}>{filtered ? "🔍" : "📂"}</div>
      <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: "var(--foreground)" }}>
        {filtered ? "No matching documents" : "No documents yet"}
      </p>
      <p style={{ margin: 0, fontSize: 13.5 }}>
        {filtered ? "Try a different search term" : "Upload your first document using the form →"}
      </p>
    </div>
  );
}

/* ─── main component ─────────────────────────────────────────────── */
export default function Documents({ pregnancyId }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null); // document_id pending delete
  const [deleting, setDeleting] = useState(false);

  // upload form
  const [file, setFile] = useState(null);
  const [customName, setCustomName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null); // { type, text }
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();

  const pId = pregnancyId || localStorage.getItem("pregnancy_id");

  /* fetch documents */
  const fetchDocs = async () => {
    setLoading(true);
    try {
      const r = await api.get("/documents");
      setDocuments(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  /* upload */
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { setUploadMsg({ type: "error", text: "⚠ Please select a file." }); return; }
    if (!pId) { setUploadMsg({ type: "error", text: "⚠ No active pregnancy found." }); return; }

    setUploading(true);
    setUploadMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("pregnancy_id", pId);
      if (customName.trim()) fd.append("file_name", customName.trim());

      await api.post("/documents", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadMsg({ type: "success", text: "✓ Document uploaded successfully." });
      setFile(null);
      setCustomName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchDocs();
    } catch (err) {
      setUploadMsg({ type: "error", text: `⚠ ${err.response?.data?.message || err.message}` });
    } finally {
      setUploading(false);
    }
  };

  /* delete */
  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await api.delete(`/documents/${id}`);
      setDeleteConfirm(null);
      fetchDocs();
    } catch {
      setError("Failed to delete document");
    } finally {
      setDeleting(false);
    }
  };

  /* drag & drop */
  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) { setFile(dropped); setCustomName(dropped.name.replace(/\.[^/.]+$/, "")); }
  };

  /* filter */
  const typeOptions = [
    { value: "all", label: "All Files" },
    { value: "pdf", label: "PDF" },
    { value: "image", label: "Images" },
    { value: "doc", label: "Word" },
  ];

  const filtered = documents.filter(doc => {
    const nameMatch = (doc.file_name || "").toLowerCase().includes(search.toLowerCase());
    const typeMatch = filterType === "all" || (doc.file_type || "").toLowerCase().includes(filterType);
    return nameMatch && typeMatch;
  });

  /* stats */
  const stats = [
    { label: "Total", value: documents.length, color: "var(--primary)", bg: "var(--primary-light)" },
    { label: "PDFs", value: documents.filter(d => (d.file_type || "").toLowerCase().includes("pdf")).length, color: "var(--danger-text)", bg: "var(--danger-bg)" },
    { label: "Images", value: documents.filter(d => /jpg|jpeg|png|gif|webp|svg/.test((d.file_type || "").toLowerCase())).length, color: "var(--purple-text)", bg: "var(--purple-bg)" },
  ];

  return (
    <div style={{ color: "var(--foreground)", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        .doc-card { transition: all 0.2s; }
        .doc-card:hover { box-shadow: 0 6px 22px rgba(0,0,0,0.10) !important; transform: translateY(-1.5px); }
        .doc-input { transition: border-color 0.15s, box-shadow 0.15s; background: var(--input-bg) !important; color: var(--foreground) !important; border-color: var(--input-border) !important; }
        .doc-input::placeholder { color: var(--muted-foreground); }
        .doc-input:focus { outline: none; border-color: var(--primary) !important; box-shadow: 0 0 0 3px rgba(232,121,160,0.15); }
        .doc-type-btn { transition: all 0.15s; cursor: pointer; }
        .doc-type-btn:hover { border-color: var(--primary) !important; color: var(--primary) !important; }
        .doc-type-btn.active { background: var(--primary-light) !important; border-color: var(--primary) !important; color: var(--primary) !important; font-weight: 600; }
        .doc-action-btn { transition: all 0.15s; cursor: pointer; }
        .doc-action-btn:hover { opacity: 0.75; }
        .drop-zone { transition: all 0.2s; }
        .drop-zone.over { border-color: var(--primary) !important; background: var(--primary-light) !important; }
        .del-confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(3px); }
        .del-confirm-box { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 28px 28px 24px; max-width: 360px; width: 90%; box-shadow: 0 24px 60px rgba(0,0,0,0.18); }
      `}</style>

      {/* ── PAGE HEADER ───────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--foreground)", margin: "0 0 4px" }}>
          Documents
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--muted-foreground)", margin: 0 }}>
          Manage your medical records, reports, and pregnancy files
        </p>
      </div>

      {/* ── STATS ─────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 13, padding: "16px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--muted-foreground)" }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {error && <Alert type="error" onDismiss={() => setError("")}>{error}</Alert>}

      {/* ── MAIN SPLIT LAYOUT ─────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 22, alignItems: "start" }}>

        {/* ════ LEFT: DOCUMENT LIST ════ */}
        <div>
          {/* Search + filter bar */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
            {/* search */}
            <div style={{ flex: 1, position: "relative" }}>
              <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "var(--muted-foreground)", pointerEvents: "none" }}>🔍</span>
              <input
                className="doc-input"
                type="text"
                placeholder="Search documents…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 34 }}
              />
            </div>
          </div>

          {/* Type filter pills */}
          <div style={{ display: "flex", gap: 7, marginBottom: 16, flexWrap: "wrap" }}>
            {typeOptions.map(t => (
              <button key={t.value}
                className={`doc-type-btn${filterType === t.value ? " active" : ""}`}
                onClick={() => setFilterType(t.value)}
                style={{
                  padding: "5px 13px", borderRadius: 999, fontSize: 12.5, fontWeight: 500, border: "1.5px solid var(--border)",
                  background: filterType === t.value ? "var(--primary-light)" : "var(--card)",
                  color: filterType === t.value ? "var(--primary)" : "var(--muted-foreground)",
                  cursor: "pointer",
                }}>
                {t.label}
              </button>
            ))}
            {(search || filterType !== "all") && (
              <button onClick={() => { setSearch(""); setFilterType("all"); }}
                style={{ padding: "5px 13px", borderRadius: 999, fontSize: 12.5, fontWeight: 500, border: "1.5px solid var(--border)", background: "var(--card)", color: "var(--muted-foreground)", cursor: "pointer" }}>
                ✕ Clear
              </button>
            )}
          </div>

          {/* Results label */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", margin: 0 }}>
              {filterType === "all" && !search ? "All Documents" : "Filtered Results"}
            </h3>
            <span style={{ background: "var(--primary-light)", color: "var(--primary)", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999 }}>
              {filtered.length} {filtered.length === 1 ? "file" : "files"}
            </span>
          </div>

          {/* List */}
          {loading ? <Skeleton /> : filtered.length === 0 ? (
            <EmptyState filtered={search !== "" || filterType !== "all"} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {filtered.map(doc => {
                const typeInfo = fileTypeInfo(doc.file_type, doc.file_name);
                return (
                  <div key={doc.document_id} className="doc-card"
                    style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 13, padding: "13px 16px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>

                    {/* Type icon */}
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: typeInfo.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, gap: 1 }}>
                      <span style={{ fontSize: 18, lineHeight: 1 }}>{typeInfo.icon}</span>
                      <span style={{ fontSize: 8.5, fontWeight: 700, color: typeInfo.color, textTransform: "uppercase", letterSpacing: "0.3px" }}>{typeInfo.label}</span>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 13.5, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {doc.file_name || "Untitled document"}
                      </p>
                      <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: 6 }}>
                        <span>{fmt(doc.upload_date)}</span>
                        {doc.file_size && <><span style={{ opacity: 0.4 }}>·</span><span>{bytesToSize(doc.file_size)}</span></>}
                      </p>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      {/* View */}
                      <a
                        href={doc.file_path ? `${api.defaults?.baseURL || ""}${doc.file_path}` : "#"}
                        target="_blank" rel="noopener noreferrer"
                        className="doc-action-btn"
                        style={{ background: "var(--primary-light)", color: "var(--primary)", border: "1px solid var(--primary-light)", borderRadius: 7, padding: "5px 11px", fontSize: 12, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                        👁 View
                      </a>
                      {/* Download */}
                      <a
                        href={doc.file_path ? `${api.defaults?.baseURL || ""}${doc.file_path}` : "#"}
                        download={doc.file_name || true}
                        className="doc-action-btn"
                        style={{ background: "var(--input-bg)", color: "var(--muted-foreground)", border: "1px solid var(--border)", borderRadius: 7, padding: "5px 11px", fontSize: 12, fontWeight: 500, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                        ⬇ Save
                      </a>
                      {/* Delete */}
                      <button
                        className="doc-action-btn"
                        onClick={() => setDeleteConfirm(doc.document_id)}
                        style={{ background: "var(--danger-bg)", color: "var(--danger-text)", border: "1px solid var(--danger-bg)", borderRadius: 7, padding: "5px 11px", fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                        🗑
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ════ RIGHT: UPLOAD FORM ════ */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "22px", position: "sticky", top: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", margin: "0 0 18px", display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ background: "var(--primary-light)", color: "var(--primary)", borderRadius: 7, padding: "3px 8px", fontSize: 11, fontWeight: 700 }}>New</span>
            Upload Document
          </h3>

          <form onSubmit={handleUpload}>
            {/* Drop zone */}
            <div
              className={`drop-zone${dragOver ? " over" : ""}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${file ? "var(--primary)" : "var(--border)"}`,
                borderRadius: 12,
                padding: "22px 16px",
                textAlign: "center",
                cursor: "pointer",
                marginBottom: 14,
                background: file ? "var(--primary-light)" : "var(--input-bg)",
              }}>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={e => {
                  const f = e.target.files[0];
                  if (f) { setFile(f); setCustomName(f.name.replace(/\.[^/.]+$/, "")); }
                }}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,.csv"
              />
              {file ? (
                <>
                  <div style={{ fontSize: 32, marginBottom: 6 }}>{fileTypeInfo(file.type, file.name).icon}</div>
                  <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 600, color: "var(--primary)", wordBreak: "break-all" }}>{file.name}</p>
                  <p style={{ margin: 0, fontSize: 11.5, color: "var(--muted-foreground)" }}>{bytesToSize(file.size)} · Click to change</p>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 34, marginBottom: 8 }}>📂</div>
                  <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>Drop file here</p>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)" }}>or click to browse</p>
                  <p style={{ margin: "8px 0 0", fontSize: 11, color: "var(--muted-foreground)", opacity: 0.7 }}>PDF, Images, Word, Excel</p>
                </>
              )}
            </div>

            {/* Custom name */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Document Name <span style={{ opacity: 0.6, fontWeight: 400, textTransform: "none" }}>(optional)</span>
              </label>
              <input
                type="text"
                className="doc-input"
                placeholder="e.g. Blood Test Results – Week 20"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Pregnancy ID hint */}
            {!pId && (
              <Alert type="error">⚠ No active pregnancy found. Documents require a pregnancy ID.</Alert>
            )}

            {uploadMsg && (
              <Alert type={uploadMsg.type} onDismiss={() => setUploadMsg(null)}>{uploadMsg.text}</Alert>
            )}

            <button
              type="submit"
              disabled={uploading || !file || !pId}
              style={{
                width: "100%",
                background: "var(--primary)",
                color: "#fff",
                border: "none",
                borderRadius: 9,
                padding: "12px 20px",
                fontWeight: 600,
                fontSize: 14,
                cursor: (uploading || !file || !pId) ? "not-allowed" : "pointer",
                opacity: (uploading || !file || !pId) ? 0.5 : 1,
                transition: "opacity 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}>
              {uploading ? (
                <>
                  <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  Uploading…
                </>
              ) : (
                "⬆ Upload Document"
              )}
            </button>
          </form>

          {/* Tips */}
          <div style={{ marginTop: 18, padding: "13px 14px", background: "var(--input-bg)", borderRadius: 10, border: "1px solid var(--border)" }}>
            <p style={{ margin: "0 0 7px", fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Tips</p>
            {[
              "Use descriptive names for easy search",
              "PDF format preferred for reports",
              "Max 10MB per file recommended",
            ].map(tip => (
              <p key={tip} style={{ margin: "0 0 4px", fontSize: 12, color: "var(--muted-foreground)", display: "flex", gap: 6, alignItems: "flex-start" }}>
                <span style={{ color: "var(--primary)", flexShrink: 0 }}>·</span> {tip}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* ── DELETE CONFIRM MODAL ──────────────────────── */}
      {deleteConfirm && (
        <div className="del-confirm-overlay" onClick={() => !deleting && setDeleteConfirm(null)}>
          <div className="del-confirm-box" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 40, textAlign: "center", marginBottom: 14 }}>🗑️</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", margin: "0 0 8px", textAlign: "center" }}>Delete Document?</h3>
            <p style={{ fontSize: 13.5, color: "var(--muted-foreground)", textAlign: "center", margin: "0 0 22px", lineHeight: 1.5 }}>
              This action cannot be undone. The file will be permanently removed.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                style={{ flex: 1, padding: "10px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--card)", color: "var(--muted-foreground)", fontSize: 13.5, fontWeight: 500, cursor: "pointer" }}>
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                style={{ flex: 1, padding: "10px", borderRadius: 9, border: "none", background: "var(--danger-text)", color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.6 : 1 }}>
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const inputStyle = {
  background: "var(--input-bg, #f3f4f6)",
  border: "1.5px solid var(--input-border, #eef0f4)",
  borderRadius: 9,
  padding: "10px 12px",
  color: "var(--foreground, #111827)",
  fontSize: 13.5,
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.15s, box-shadow 0.15s",
};
