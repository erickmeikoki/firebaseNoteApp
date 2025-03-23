import { useState, useEffect } from "react";
import { useNotes } from "../../hooks/useNotes";
import { format } from "date-fns";
import EmptyState from "./EmptyState";
import LoadingState from "./LoadingState";
import { Note } from "../../types";

interface NotesListProps {
  openEditor: (note: Note) => void;
}

export default function NotesList({ openEditor }: NotesListProps) {
  const { 
    filteredNotes, 
    loading, 
    searchTerm, 
    setSearchTerm,
    activeFilter,
    setCurrentNote,
    deleteNote
  } = useNotes();
  
  const [pageTitle, setPageTitle] = useState("All Notes");

  useEffect(() => {
    // Update page title based on active filter
    if (activeFilter === "all") {
      setPageTitle("All Notes");
    } else if (activeFilter === "favorites") {
      setPageTitle("Favorites");
    } else if (activeFilter === "trash") {
      setPageTitle("Trash");
    } else if (activeFilter.startsWith("tag:")) {
      // Find tag name from activeFilter
      const tagId = activeFilter.split(":")[1];
      setPageTitle(`Tag: ${tagId}`); // This would be better with actual tag name
    }
  }, [activeFilter]);

  const handleOpenNote = (note: Note) => {
    setCurrentNote(note);
    openEditor(note);
  };

  const handleDeleteNote = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation(); // Prevent opening the note editor
    
    if (window.confirm("Are you sure you want to delete this note?")) {
      deleteNote(noteId)
        .catch(error => {
          console.error("Error deleting note:", error);
        });
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return format(date, "MMM d, yyyy");
  };

  return (
    <div className="content-inner">
      <div className="search-bar">
        <span className="material-icons search-icon">search</span>
        <input 
          type="text" 
          placeholder="Search notes..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <LoadingState />
      ) : filteredNotes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="notes-grid">
          {filteredNotes.map(note => (
            <div 
              key={note.id} 
              className="card" 
              onClick={() => handleOpenNote(note)}
            >
              <div className="card-title">
                {note.title || "Untitled"}
                <div className="card-actions">
                  <button 
                    className="card-delete-btn" 
                    onClick={(e) => handleDeleteNote(e, note.id)}
                    aria-label="Delete note"
                  >
                    <span className="material-icons">delete</span>
                  </button>
                </div>
              </div>
              <div className="card-meta">
                <span>{formatDate(note.updatedAt)}</span>
                {note.tags && note.tags.length > 0 && (
                  <span 
                    className={`tag tag-${note.tags[0].color || 'blue'}`}
                  >
                    {note.tags[0].name}
                  </span>
                )}
              </div>
              <div className="card-content">
                {/* Strip HTML for preview */}
                {note.content.replace(/<[^>]*>?/gm, '')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
