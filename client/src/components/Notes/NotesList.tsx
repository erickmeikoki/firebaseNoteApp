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
    setCurrentNote
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
              <div className="card-title">{note.title || "Untitled"}</div>
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
