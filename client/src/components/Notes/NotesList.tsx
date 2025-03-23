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
    deleteNote,
    permanentlyDeleteNote,
    restoreNote,
    toggleFavorite
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
    
    if (window.confirm(activeFilter === "trash" 
        ? "Are you sure you want to permanently delete this note? This cannot be undone."
        : "Are you sure you want to move this note to trash?")) {
      
      if (activeFilter === "trash") {
        permanentlyDeleteNote(noteId)
          .catch(error => {
            console.error("Error permanently deleting note:", error);
          });
      } else {
        deleteNote(noteId)
          .catch(error => {
            console.error("Error moving note to trash:", error);
          });
      }
    }
  };

  const handleRestoreNote = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation(); // Prevent opening the note editor
    
    restoreNote(noteId)
      .catch(error => {
        console.error("Error restoring note:", error);
      });
  };

  const handleToggleFavorite = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation(); // Prevent opening the note editor
    
    toggleFavorite(noteId)
      .catch(error => {
        console.error("Error toggling favorite status:", error);
      });
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
                  {activeFilter === "trash" ? (
                    <button 
                      className="card-action-btn" 
                      onClick={(e) => handleRestoreNote(e, note.id)}
                      aria-label="Restore note"
                      title="Restore note"
                    >
                      <span className="material-icons">restore</span>
                    </button>
                  ) : (
                    <button 
                      className={`card-action-btn ${note.isFavorite ? 'active' : ''}`} 
                      onClick={(e) => handleToggleFavorite(e, note.id)}
                      aria-label={note.isFavorite ? "Remove from favorites" : "Add to favorites"}
                      title={note.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <span className="material-icons">
                        {note.isFavorite ? "star" : "star_outline"}
                      </span>
                    </button>
                  )}
                  <button 
                    className="card-action-btn delete" 
                    onClick={(e) => handleDeleteNote(e, note.id)}
                    aria-label={activeFilter === "trash" ? "Delete permanently" : "Move to trash"}
                    title={activeFilter === "trash" ? "Delete permanently" : "Move to trash"}
                  >
                    <span className="material-icons">
                      {activeFilter === "trash" ? "delete_forever" : "delete"}
                    </span>
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
