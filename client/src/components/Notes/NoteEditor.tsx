import { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Note, Tag, Notebook } from "../../types";
import { useToast } from "@/hooks/use-toast";
import { useNotes } from "../../hooks/useNotes";
import { exportNoteToPDF } from "../../lib/pdfExport";

interface NoteEditorProps {
  note: Note;
  availableTags: Tag[];
  availableNotebooks: Notebook[];
  isOpen: boolean;
  isNew: boolean;
  onClose: () => void;
  onSave: (note: { title: string; content: string; tags: Tag[]; notebookId?: string }) => void;
}

export default function NoteEditor({ 
  note, 
  availableTags,
  availableNotebooks, 
  isOpen, 
  isNew,
  onClose, 
  onSave 
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [selectedTags, setSelectedTags] = useState<Tag[]>(note.tags || []);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | undefined>(note.notebookId);
  const [isLoading, setIsLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { deleteNote, toggleFavorite } = useNotes();

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setSelectedTags(note.tags || []);
    setSelectedNotebookId(note.notebookId);
    setError(null);
  }, [note]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onSave({
        title,
        content,
        tags: selectedTags,
        notebookId: selectedNotebookId
      });
    } catch (err: any) {
      console.error("Error saving note:", err);
      
      if (err.code === "permission-denied") {
        setError("Firebase permissions error: Please update your Firestore security rules.");
        toast({
          title: "Permissions Error",
          description: "Please update your Firebase security rules to allow write access.",
          variant: "destructive",
        });
      } else {
        setError(err.message || "Failed to save note");
        toast({
          title: "Error",
          description: err.message || "Failed to save note",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && e.target === modalRef.current) {
      onClose();
    }
  };
  
  const handleDelete = async () => {
    if (isNew) return; // Don't try to delete a note that hasn't been saved yet
    
    if (window.confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
      try {
        setIsLoading(true);
        setError(null);
        await deleteNote(note.id);
        onClose();
        toast({
          title: "Success",
          description: "Note deleted successfully",
        });
      } catch (err: any) {
        console.error("Error deleting note:", err);
        
        if (err.code === "permission-denied") {
          setError("Firebase permissions error: Please update your Firestore security rules.");
          toast({
            title: "Permissions Error",
            description: "Please update your Firebase security rules to allow write access.",
            variant: "destructive",
          });
        } else {
          setError(err.message || "Failed to delete note");
          toast({
            title: "Error",
            description: err.message || "Failed to delete note",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleToggleFavorite = async () => {
    if (isNew) return; // Don't toggle favorite on a note that hasn't been saved yet
    
    try {
      await toggleFavorite(note.id);
      // No need to close the editor
    } catch (err: any) {
      console.error("Error toggling favorite status:", err);
      if (err.code === "permission-denied") {
        toast({
          title: "Permissions Error",
          description: "Please update your Firebase security rules to allow write access.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: err.message || "Failed to update favorite status",
          variant: "destructive",
        });
      }
    }
  };

  const toggleTag = (tag: Tag) => {
    setSelectedTags(prev => {
      const isSelected = prev.some(t => t.id === tag.id);
      if (isSelected) {
        return prev.filter(t => t.id !== tag.id);
      } else {
        return [...prev, tag];
      }
    });
  };

  const isTagSelected = (tagId: string) => {
    return selectedTags.some(tag => tag.id === tagId);
  };
  
  const handleExportToPdf = async () => {
    if (isNew) {
      toast({
        title: "Save Required",
        description: "Please save the note before exporting to PDF.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setExportLoading(true);
      // Create a temporary note object with current edited content
      const currentNote = {
        ...note,
        title,
        content,
        tags: selectedTags
      };
      
      await exportNoteToPDF(currentNote);
      
      toast({
        title: "Success",
        description: "Note exported to PDF successfully",
      });
    } catch (err: any) {
      console.error("Error exporting note to PDF:", err);
      toast({
        title: "Export Error",
        description: err.message || "Failed to export note to PDF",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image'
  ];

  return (
    <div 
      className="modal-backdrop" 
      ref={modalRef}
      onClick={handleClickOutside}
    >
      <div className="modal">
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 className="modal-title">{isNew ? "Create Note" : "Edit Note"}</h2>
            {!isNew && (
              <button 
                className={`toolbar-btn ${note.isFavorite ? 'active' : ''}`}
                onClick={handleToggleFavorite}
                title={note.isFavorite ? "Remove from favorites" : "Add to favorites"}
                style={{ marginLeft: "10px" }}
              >
                <span className="material-icons">
                  {note.isFavorite ? "star" : "star_outline"}
                </span>
              </button>
            )}
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {error && (
            <div className="alert alert-error" style={{ marginBottom: "16px" }}>
              <span className="material-icons">error</span>
              <span>{error}</span>
            </div>
          )}
          
          <div className="form-group">
            <input 
              type="text" 
              className={`form-input ${!title.trim() && error ? 'error' : ''}`}
              placeholder="Note Title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {!title.trim() && error && (
              <div className="form-error">Title is required</div>
            )}
          </div>
          <div className="form-group">
            <ReactQuill 
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              placeholder="Write your note here..."
            />
          </div>
          <div className="form-group">
            <label className="form-label">Notebook</label>
            <select
              className="form-input"
              value={selectedNotebookId || ""}
              onChange={(e) => setSelectedNotebookId(e.target.value || undefined)}
            >
              <option value="">No notebook</option>
              {availableNotebooks.map(notebook => (
                <option key={notebook.id} value={notebook.id}>
                  {notebook.icon} {notebook.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Tags</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {availableTags.map(tag => (
                <div 
                  key={tag.id}
                  className={`tag tag-${tag.color || 'blue'}`}
                  style={{ 
                    cursor: "pointer", 
                    backgroundColor: isTagSelected(tag.id) 
                      ? tag.color === 'blue' 
                        ? 'rgba(74, 111, 255, 0.3)' 
                        : tag.color === 'purple' 
                          ? 'rgba(108, 92, 231, 0.3)' 
                          : 'rgba(40, 167, 69, 0.3)'
                      : tag.color === 'blue' 
                        ? 'rgba(74, 111, 255, 0.1)' 
                        : tag.color === 'purple' 
                          ? 'rgba(108, 92, 231, 0.1)' 
                          : 'rgba(40, 167, 69, 0.1)'
                  }}
                  onClick={() => toggleTag(tag)}
                >
                  <span>{tag.name}</span>
                  {isTagSelected(tag.id) && (
                    <span className="material-icons" style={{ fontSize: "16px" }}>check</span>
                  )}
                </div>
              ))}
              <button className="btn-ghost" style={{ fontSize: "0.8rem" }}>
                <span className="material-icons" style={{ fontSize: "16px" }}>add</span>
                Add Tag
              </button>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            {!isNew && (
              <button 
                className="btn btn-secondary" 
                onClick={handleDelete}
                disabled={isLoading}
                style={{ 
                  backgroundColor: "rgba(220, 53, 69, 0.1)", 
                  color: "var(--error)",
                  borderColor: "rgba(220, 53, 69, 0.2)" 
                }}
              >
                <span className="material-icons" style={{ fontSize: "16px", marginRight: "4px" }}>delete</span>
                Delete
              </button>
            )}
            <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
              {!isNew && (
                <button 
                  className="btn btn-secondary" 
                  onClick={handleExportToPdf}
                  disabled={isLoading || exportLoading}
                  style={{
                    backgroundColor: "rgba(25, 135, 84, 0.1)",
                    color: "var(--success)",
                    borderColor: "rgba(25, 135, 84, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <span className="material-icons" style={{ fontSize: "16px" }}>
                    picture_as_pdf
                  </span>
                  {exportLoading ? "Exporting..." : "Export PDF"}
                </button>
              )}
              <button 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={isLoading || exportLoading}
              >
                Cancel
              </button>
              <button 
                className="btn" 
                onClick={handleSave}
                disabled={isLoading || exportLoading}
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
