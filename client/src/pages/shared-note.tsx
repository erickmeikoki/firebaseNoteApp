import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { getSharedNote } from "../lib/shareUtils";
import { Note } from "../types";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useToast } from "@/hooks/use-toast";
import { exportNoteToPDF } from "../lib/pdfExport";

export default function SharedNote() {
  const [, params] = useRoute("/shared/:shareId");
  const shareId = params?.shareId;
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadSharedNote() {
      if (!shareId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const sharedNote = await getSharedNote(shareId);
        
        if (!sharedNote) {
          setError("This shared note does not exist or has expired");
          return;
        }
        
        setNote(sharedNote);
      } catch (err: any) {
        console.error("Error loading shared note:", err);
        setError(err.message || "Failed to load shared note");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadSharedNote();
  }, [shareId]);
  
  const handleExportToPdf = async () => {
    if (!note) return;
    
    try {
      setExportLoading(true);
      await exportNoteToPDF(note);
      
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
  
  if (isLoading) {
    return (
      <div className="shared-note-page">
        <div className="content-inner">
          <div className="skeleton-card" style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
            <div className="skeleton skeleton-line skeleton-line-sm" style={{ height: "32px", marginBottom: "16px" }}></div>
            <div className="skeleton skeleton-line" style={{ marginBottom: "8px" }}></div>
            <div className="skeleton skeleton-line" style={{ marginBottom: "8px" }}></div>
            <div className="skeleton skeleton-line" style={{ marginBottom: "8px" }}></div>
            <div className="skeleton skeleton-line" style={{ marginBottom: "8px" }}></div>
            <div className="skeleton skeleton-line" style={{ marginBottom: "8px" }}></div>
            <div className="skeleton skeleton-line skeleton-line-md" style={{ marginBottom: "8px" }}></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !note) {
    return (
      <div className="shared-note-page">
        <div className="content-inner">
          <div className="empty-state">
            <span className="material-icons empty-state-icon">error_outline</span>
            <h2 className="empty-state-title">Note Not Found</h2>
            <p className="empty-state-description">
              {error || "This shared note does not exist or has expired"}
            </p>
            <a href="/" className="btn">
              Go to Home
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  const quillModules = {
    toolbar: false // Disable toolbar for read-only view
  };
  
  return (
    <div className="shared-note-page">
      <div className="content-inner">
        <div className="shared-note-container" style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
          <div className="shared-note-header" style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ marginBottom: "8px" }}>{note.title}</h1>
              
              <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "var(--neutral-600)", fontSize: "0.9rem" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span className="material-icons" style={{ fontSize: "16px" }}>schedule</span>
                  {note.createdAt && typeof note.createdAt.toDate === 'function' 
                    ? new Date(note.createdAt.toDate()).toLocaleDateString() 
                    : new Date().toLocaleDateString()}
                </span>
                
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span className="material-icons" style={{ fontSize: "16px" }}>visibility</span>
                  {note.shareInfo?.viewCount || 1} {note.shareInfo?.viewCount === 1 ? "view" : "views"}
                </span>
              </div>
              
              {note.tags && note.tags.length > 0 && (
                <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {note.tags.map(tag => (
                    <div 
                      key={tag.id}
                      className={`tag tag-${tag.color || 'blue'}`}
                    >
                      {tag.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <button
                className="btn btn-secondary"
                onClick={handleExportToPdf}
                disabled={exportLoading}
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
            </div>
          </div>
          
          <div className="shared-note-content" style={{ 
            border: "1px solid var(--neutral-200)", 
            borderRadius: "var(--border-radius-md)", 
            padding: "16px",
            backgroundColor: "white" 
          }}>
            <ReactQuill
              value={note.content}
              readOnly={true}
              modules={quillModules}
              theme="snow"
            />
          </div>
          
          <div style={{ marginTop: "24px", textAlign: "center", padding: "16px", borderTop: "1px solid var(--neutral-200)" }}>
            <p style={{ color: "var(--neutral-600)", fontSize: "0.9rem" }}>
              Shared with QuillNotes. <a href="/" style={{ color: "var(--primary)" }}>Create your own notes</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}