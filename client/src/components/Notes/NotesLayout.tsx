import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import NotesList from "./NotesList";
import NoteEditor from "./NoteEditor";
import { useNotes } from "../../hooks/useNotes";
import { Tag, Note, Notebook } from "../../types";
import { Timestamp } from "firebase/firestore";

export default function NotesLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const { currentNote, setCurrentNote, addNote, updateNote, tags, notebooks } = useNotes();
  
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isNewNote, setIsNewNote] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (currentNote) {
      setEditingNote(currentNote);
      setIsEditorOpen(true);
      setIsNewNote(false);
    }
  }, [currentNote]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const openEditor = (note: Note | null = null) => {
    if (note) {
      setEditingNote(note);
      setIsNewNote(false);
    } else {
      // Create a new empty note structure
      setEditingNote({
        id: "",
        title: "",
        content: "",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        tags: [],
        isFavorite: false,
        isArchived: false,
        notebookId: undefined
      });
      setIsNewNote(true);
    }
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingNote(null);
    setCurrentNote(null);
  };

  const handleSaveNote = async (note: {
    title: string;
    content: string;
    tags: Tag[];
    notebookId?: string;
  }) => {
    try {
      if (isNewNote) {
        await addNote({
          title: note.title,
          content: note.content,
          tags: note.tags,
          notebookId: note.notebookId,
          isFavorite: false,
          isArchived: false
        });
      } else if (editingNote) {
        await updateNote(editingNote.id, {
          title: note.title,
          content: note.content,
          tags: note.tags,
          notebookId: note.notebookId
        });
      }
      closeEditor();
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  return (
    <div className="app">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />
      
      <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="top-bar">
          <button className="toggle-sidebar" onClick={toggleSidebar}>
            <span className="material-icons">menu</span>
          </button>
          <h1 className="top-bar-title">My Notes</h1>
        </div>
        
        <NotesList 
          openEditor={openEditor}
        />
        
        <button 
          className="fab" 
          title="Create New Note" 
          onClick={() => openEditor()}
        >
          <span className="material-icons">add</span>
        </button>
      </main>

      {isEditorOpen && editingNote && (
        <NoteEditor
          note={editingNote}
          availableTags={tags}
          availableNotebooks={notebooks}
          isOpen={isEditorOpen}
          isNew={isNewNote}
          onClose={closeEditor}
          onSave={handleSaveNote}
        />
      )}
    </div>
  );
}
