import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {
  FileText, Plus, Upload, Share2, Bold, Italic,
  Underline as UnderlineIcon, List, ListOrdered,
  Heading1, ArrowLeft, Save
} from "lucide-react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function App() {
  const [userId, setUserId] = useState(1);
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function request(path, options = {}, uid = userId) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "X-User-ID": String(uid),
        ...(options.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...options.headers,
      },
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.detail || "Request failed");
    }
    return response.json();
  }

  async function loadDocuments(uid = userId) {
    try {
      setError("");
      const data = await request("/documents", {}, uid);
      setDocuments(data);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, [userId]);

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: "",
    onUpdate: ({ editor }) => {
      setStatus("Unsaved changes");
    },
  });

  function openDocument(doc) {
    setSelected(doc);
    setTitle(doc.title);
    editor?.commands.setContent(doc.content || "", { emitUpdate: false });
    setStatus("Saved");
    setError("");
  }

  async function saveDocument() {
    if (!selected) return;
    try {
      setStatus("Saving...");
      const updated = await request(`/documents/${selected.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title,
          content: editor?.getHTML() || "",
        }),
      });
      setSelected(updated);
      setStatus("Saved");
      await loadDocuments();
    } catch (e) {
      setError(e.message);
      setStatus("Save failed");
    }
  }

  async function createDocument() {
    try {
      const doc = await request("/documents", {
        method: "POST",
        body: JSON.stringify({
          title: "Untitled Document",
          content: "<p></p>",
        }),
      });
      await loadDocuments();
      openDocument(doc);
    } catch (e) {
      setError(e.message);
    }
  }

  async function importFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/\.(txt|md)$/i.test(file.name) || file.size > 1024 * 1024) {
      setError("Upload a .txt or .md file up to 1 MB.");
      event.target.value = "";
      return;
    }
    const form = new FormData();
    form.append("file", file);
    try {
      const doc = await request("/documents/import", {
        method: "POST",
        body: form,
      });
      await loadDocuments();
      openDocument(doc);
    } catch (e) {
      setError(e.message);
    }
    event.target.value = "";
  }

  async function shareDocument() {
    if (!selected) return;
    const target = userId === 1 ? 2 : 1;
    try {
      await request(`/documents/${selected.id}/share`, {
        method: "POST",
        body: JSON.stringify({ user_id: target }),
      });
      setStatus(`Shared with ${target === 1 ? "Alice" : "Bob"}`);
      await loadDocuments();
    } catch (e) {
      setError(e.message);
    }
  }

  function switchUser(uid) {
    setSelected(null);
    setUserId(uid);
    setStatus("");
    setError("");
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand"><FileText size={25} /> Draftly</div>
        <div className="account">
          <span>Demo account</span>
          <select value={userId} onChange={(e) => switchUser(Number(e.target.value))}>
            <option value={1}>Alice</option>
            <option value={2}>Bob</option>
          </select>
        </div>
      </header>

      <main className="container">
        {error && <div className="error">{error}</div>}

        {!selected ? (
          <>
            <div className="heading">
              <div>
                <h1>My workspace</h1>
                <p>Create, edit, and share documents with your team.</p>
              </div>
              <div className="actions">
                <label className="button secondary">
                  <Upload size={17} /> Import file
                  <input type="file" accept=".txt,.md" hidden onChange={importFile} />
                </label>
                <button onClick={createDocument}><Plus size={17} /> New document</button>
              </div>
            </div>

            <p className="hint">Import supports UTF-8 .txt and .md files (maximum 1 MB).</p>

            <h2>Owned documents</h2>
            <div className="doc-grid">
              {documents.filter(d => d.is_owner).map(doc => (
                <button className="doc-card" key={doc.id} onClick={() => openDocument(doc)}>
                  <FileText size={27} />
                  <strong>{doc.title}</strong>
                  <small>Owned by you</small>
                </button>
              ))}
            </div>

            <h2>Shared with me</h2>
            <div className="doc-grid">
              {documents.filter(d => !d.is_owner).map(doc => (
                <button className="doc-card" key={doc.id} onClick={() => openDocument(doc)}>
                  <Share2 size={27} />
                  <strong>{doc.title}</strong>
                  <small>Shared document</small>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="editor-page">
            <div className="editor-header">
              <button className="back" onClick={() => { setSelected(null); loadDocuments(); }}>
                <ArrowLeft size={18} /> Documents
              </button>
              <input
                className="title-input"
                value={title}
                maxLength={200}
                onChange={(e) => { setTitle(e.target.value); setStatus("Unsaved changes"); }}
              />
              <div className="editor-actions">
                <span className="save-status">{status}</span>
                {selected.is_owner && (
                  <button className="secondary" onClick={shareDocument}>
                    <Share2 size={16} /> Share
                  </button>
                )}
                <button onClick={saveDocument}><Save size={16} /> Save</button>
              </div>
            </div>

            <div className="toolbar">
              {[
                [Bold, () => editor?.chain().focus().toggleBold().run(), "Bold"],
                [Italic, () => editor?.chain().focus().toggleItalic().run(), "Italic"],
                [UnderlineIcon, () => editor?.chain().focus().toggleUnderline().run(), "Underline"],
                [Heading1, () => editor?.chain().focus().toggleHeading({ level: 1 }).run(), "Heading"],
                [List, () => editor?.chain().focus().toggleBulletList().run(), "Bullet list"],
                [ListOrdered, () => editor?.chain().focus().toggleOrderedList().run(), "Numbered list"],
              ].map(([Icon, action, label]) => (
                <button key={label} title={label} onClick={action}><Icon size={18} /></button>
              ))}
            </div>

            <div className="paper">
              <EditorContent editor={editor} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
