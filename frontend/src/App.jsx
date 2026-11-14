
import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {
  FileText,
  Plus,
  Upload,
  Share2,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  ArrowLeft,
  Save,
  Sparkles,
  FolderOpen,
  Clock3,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import "./App.css";

const API =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function App() {
  const [userId, setUserId] = useState(1);
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [editorVersion, setEditorVersion] = useState(0);

  const ownedDocuments = documents.filter((doc) => doc.is_owner);
  const sharedDocuments = documents.filter((doc) => !doc.is_owner);

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
    onUpdate: () => {
      setStatus("Unsaved changes");
    },
    onSelectionUpdate: () => {
      setEditorVersion((version) => version + 1);
    },
    onTransaction: () => {
      setEditorVersion((version) => version + 1);
    },
  });

  function openDocument(doc) {
    setSelected(doc);
    setTitle(doc.title);
    editor?.commands.setContent(doc.content || "", {
      emitUpdate: false,
    });
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

  const formattingButtons = [
    {
      Icon: Bold,
      label: "Bold",
      action: () => editor?.chain().focus().toggleBold().run(),
      active: () => editor?.isActive("bold"),
    },
    {
      Icon: Italic,
      label: "Italic",
      action: () => editor?.chain().focus().toggleItalic().run(),
      active: () => editor?.isActive("italic"),
    },
    {
      Icon: UnderlineIcon,
      label: "Underline",
      action: () => editor?.chain().focus().toggleUnderline().run(),
      active: () => editor?.isActive("underline"),
    },
    {
      Icon: Heading1,
      label: "Heading",
      action: () =>
        editor?.chain().focus().toggleHeading({ level: 1 }).run(),
      active: () => editor?.isActive("heading", { level: 1 }),
    },
    {
      Icon: List,
      label: "Bullet list",
      action: () => editor?.chain().focus().toggleBulletList().run(),
      active: () => editor?.isActive("bulletList"),
    },
    {
      Icon: ListOrdered,
      label: "Numbered list",
      action: () => editor?.chain().focus().toggleOrderedList().run(),
      active: () => editor?.isActive("orderedList"),
    },
  ];

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <FileText size={25} />
          <span>Draftly<span className="brand-dot">.</span></span>
        </div>

        <div className="account">
          <span className="demo-label">DEMO WORKSPACE</span>
          <div className="avatar">
            {userId === 1 ? "A" : "B"}
          </div>
          <select
            aria-label="Demo account"
            value={userId}
            onChange={(e) => switchUser(Number(e.target.value))}
          >
            <option value={1}>Alice</option>
            <option value={2}>Bob</option>
          </select>
        </div>
      </header>

      <main className="container">
        {error && (
          <div className="error" role="alert">
            <AlertCircle size={17} />
            {error}
          </div>
        )}

        {!selected ? (
          <>
            <div className="welcome-banner">
              <div className="welcome-copy">
                <span className="eyebrow">
                  <Sparkles size={14} />
                  YOUR CREATIVE SPACE
                </span>

                <h1>
                  Good to see you, {userId === 1 ? "Alice" : "Bob"}.
                </h1>

                <p>
                  A little space for big ideas. Pick up where you
                  left off, or start something new.
                </p>

                <div className="welcome-stats">
                  <span>
                    <FileText size={15} />
                    {ownedDocuments.length} owned
                  </span>
                  <span>
                    <Share2 size={15} />
                    {sharedDocuments.length} shared
                  </span>
                </div>
              </div>

              <div className="welcome-art" aria-hidden="true">
                <div className="art-page art-page-back" />
                <div className="art-page art-page-front">
                  <span className="art-line wide" />
                  <span className="art-line" />
                  <span className="art-line short" />
                  <Sparkles size={25} />
                </div>
              </div>
            </div>

            <div className="workspace-actions">
              <div>
                <h2>Your library</h2>
                <p>
                  Everything you're working on, all in one place.
                </p>
              </div>

              <div className="actions">
                <label className="button secondary import-button">
                  <Upload size={17} />
                  Import file
                  <input
                    type="file"
                    accept=".txt,.md"
                    hidden
                    onChange={importFile}
                  />
                </label>

                <button onClick={createDocument}>
                  <Plus size={17} />
                  New document
                </button>
              </div>
            </div>

            <p className="hint">
              Supports UTF-8 .txt and .md imports up to 1 MB.
            </p>

            <div className="section-heading">
              <h2>
                <FolderOpen size={19} />
                Owned documents
              </h2>
              <span>{ownedDocuments.length} documents</span>
            </div>

            {ownedDocuments.length > 0 ? (
              <div className="doc-grid">
                {ownedDocuments.map((doc) => (
                  <button
                    className="doc-card"
                    key={doc.id}
                    onClick={() => openDocument(doc)}
                  >
                    <span className="doc-icon">
                      <FileText size={23} />
                    </span>
                    <strong>{doc.title}</strong>
                    <small>
                      <Clock3 size={13} />
                      Your document
                    </small>
                    <span className="doc-card-footer">
                      Open document →
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FileText size={30} />
                <h3>Your story starts here</h3>
                <p>
                  Create your first document to get started.
                </p>
                <button onClick={createDocument}>
                  <Plus size={16} />
                  Create document
                </button>
              </div>
            )}

            <div className="section-heading">
              <h2>
                <Share2 size={19} />
                Shared with me
              </h2>
              <span>{sharedDocuments.length} documents</span>
            </div>

            {sharedDocuments.length > 0 ? (
              <div className="doc-grid">
                {sharedDocuments.map((doc) => (
                  <button
                    className="doc-card shared-card"
                    key={doc.id}
                    onClick={() => openDocument(doc)}
                  >
                    <span className="doc-icon">
                      <Share2 size={23} />
                    </span>
                    <strong>{doc.title}</strong>
                    <small>
                      <Share2 size={13} />
                      Shared document
                    </small>
                    <span className="doc-card-footer">
                      Open document →
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="empty-state compact">
                <Share2 size={25} />
                <p>
                  Documents shared with you will appear here.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="editor-page">
            <div className="editor-header">
              <button
                className="back"
                onClick={() => {
                  if (
                    status === "Unsaved changes" &&
                    !window.confirm("Discard unsaved changes?")
                  ) {
                    return;
                  }
                  setSelected(null);
                  loadDocuments();
                }}
              >
                <ArrowLeft size={18} />
                Documents
              </button>

              <input
                className="title-input"
                aria-label="Document title"
                value={title}
                maxLength={200}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setStatus("Unsaved changes");
                }}
              />

              <div className="editor-actions">
                <span className={`save-status ${
                  status === "Saved" ? "is-saved" : ""
                }`}>
                  {status === "Saved" && (
                    <CheckCircle2 size={15} />
                  )}
                  {status}
                </span>

                {selected.is_owner && (
                  <button
                    className="secondary"
                    onClick={shareDocument}
                  >
                    <Share2 size={16} />
                    Share
                  </button>
                )}

                <button onClick={saveDocument}>
                  <Save size={16} />
                  Save
                </button>
              </div>
            </div>

            <div className="editor-shell">
              <div className="toolbar">
                <span className="toolbar-label">
                  FORMAT
                </span>

                <span className="toolbar-divider" />

                {formattingButtons.map(
                  ({ Icon, label, action, active }) => (
                    <button
                      key={label}
                      type="button"
                      title={label}
                      aria-label={label}
                      aria-pressed={Boolean(active())}
                      className={active() ? "active" : ""}
                      onClick={action}
                    >
                      <Icon size={18} />
                    </button>
                  )
                )}
              </div>

              <div className="paper">
                <EditorContent editor={editor} />
              </div>
            </div>

            <div className="editor-footer">
              <span>
                <Sparkles size={14} />
                Made for ideas worth sharing.
              </span>
              <span>Draftly workspace</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
