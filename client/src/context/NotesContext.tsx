import { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { collection, query, where, orderBy, onSnapshot, doc, addDoc, updateDoc, deleteDoc, Timestamp, getDoc, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";
import { AuthContext } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Note, Tag, Notebook } from "@/types";

interface NotesContextType {
  notes: Note[];
  tags: Tag[];
  notebooks: Notebook[];
  loading: boolean;
  activeFilter: string;
  activeNotebook: string | null;
  searchTerm: string;
  currentNote: Note | null;
  setCurrentNote: (note: Note | null) => void;
  setActiveFilter: (filter: string) => void;
  setActiveNotebook: (notebookId: string | null) => void;
  setSearchTerm: (term: string) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, note: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  permanentlyDeleteNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  addTag: (tag: Omit<Tag, 'id'>) => Promise<string>;
  addNotebook: (notebook: Omit<Notebook, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateNotebook: (id: string, notebook: Partial<Omit<Notebook, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteNotebook: (id: string) => Promise<void>;
  moveNoteToNotebook: (noteId: string, notebookId: string | null) => Promise<void>;
  filteredNotes: Note[];
}

export const NotesContext = createContext<NotesContextType>({
  notes: [],
  tags: [],
  notebooks: [],
  loading: true,
  activeFilter: "all",
  activeNotebook: null,
  searchTerm: "",
  currentNote: null,
  setCurrentNote: () => {},
  setActiveFilter: () => {},
  setActiveNotebook: () => {},
  setSearchTerm: () => {},
  addNote: async () => {},
  updateNote: async () => {},
  deleteNote: async () => {},
  permanentlyDeleteNote: async () => {},
  restoreNote: async () => {},
  toggleFavorite: async () => {},
  addTag: async () => "",
  addNotebook: async () => "",
  updateNotebook: async () => {},
  deleteNotebook: async () => {},
  moveNoteToNotebook: async () => {},
  filteredNotes: [],
});

export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeNotebook, setActiveNotebook] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  
  const { currentUser } = useContext(AuthContext);
  const { toast } = useToast();

  // Fetch notes from Firebase when user is authenticated
  useEffect(() => {
    if (!currentUser) {
      setNotes([]);
      setTags([]);
      setNotebooks([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to notes collection
    const notesQuery = query(
      collection(db, "notes"),
      where("userId", "==", currentUser.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribeNotes = onSnapshot(notesQuery, 
      // Success handler
      async (snapshot) => {
        const notesData: Note[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          notesData.push({
            id: doc.id,
            title: data.title,
            content: data.content,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            tags: data.tags || [],
            isFavorite: data.isFavorite || false,
            isArchived: data.isArchived || false,
            notebookId: data.notebookId || null,
          });
        });
        
        setNotes(notesData);
        setLoading(false);
      },
      // Error handler
      (error) => {
        console.error("Error fetching notes:", error);
        toast({
          title: "Firestore Access Error",
          description: "Please update your Firebase security rules to allow read/write access.",
          variant: "destructive",
        });
        // Set empty data and stop loading state
        setNotes([]);
        setLoading(false);
      }
    );

    // Subscribe to tags collection
    const tagsQuery = query(
      collection(db, "tags"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribeTags = onSnapshot(
      tagsQuery, 
      // Success handler
      (snapshot) => {
        const tagsData: Tag[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          tagsData.push({
            id: doc.id,
            name: data.name,
            color: data.color,
          });
        });
        
        // Count notes for each tag
        const tagsWithCount = tagsData.map(tag => {
          const count = notes.filter(note => 
            note.tags.some(noteTag => noteTag.id === tag.id)
          ).length;
          
          return { ...tag, count };
        });
        
        setTags(tagsWithCount);
      },
      // Error handler
      (error) => {
        console.error("Error fetching tags:", error);
        // Set empty tags
        setTags([]);
      }
    );

    // Subscribe to notebooks collection
    const notebooksQuery = query(
      collection(db, "notebooks"),
      where("userId", "==", currentUser.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribeNotebooks = onSnapshot(
      notebooksQuery,
      // Success handler
      (snapshot) => {
        const notebooksData: Notebook[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          notebooksData.push({
            id: doc.id,
            name: data.name,
            description: data.description || "",
            color: data.color || "#4f46e5",
            icon: data.icon || "📓",
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });
        
        setNotebooks(notebooksData);
      },
      // Error handler
      (error) => {
        console.error("Error fetching notebooks:", error);
        // Set empty notebooks
        setNotebooks([]);
      }
    );

    return () => {
      unsubscribeNotes();
      unsubscribeTags();
      unsubscribeNotebooks();
    };
  }, [currentUser, toast]);

  // Add a new note
  const addNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) return;

    try {
      const now = Timestamp.now();
      await addDoc(collection(db, "notes"), {
        ...note,
        userId: currentUser.uid,
        createdAt: now,
        updatedAt: now,
      });
      
      toast({
        title: "Success",
        description: "Note created successfully",
      });
    } catch (error: any) {
      console.error("Error adding note:", error);
      
      if (error.code === "permission-denied") {
        toast({
          title: "Firestore Access Error",
          description: "Please update your Firebase security rules to allow write access.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create note",
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  // Update an existing note
  const updateNote = async (id: string, note: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!currentUser) return;

    try {
      const noteRef = doc(db, "notes", id);
      await updateDoc(noteRef, {
        ...note,
        updatedAt: Timestamp.now(),
      });
      
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating note:", error);
      
      if (error.code === "permission-denied") {
        toast({
          title: "Firestore Access Error",
          description: "Please update your Firebase security rules to allow write access.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to update note",
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  // Move note to trash (soft delete)
  const deleteNote = async (id: string) => {
    if (!currentUser) return;

    try {
      const noteRef = doc(db, "notes", id);
      // We only update isArchived status and updatedAt timestamp
      // This preserves other properties like isFavorite
      await updateDoc(noteRef, {
        isArchived: true,
        updatedAt: Timestamp.now()
      });
      
      toast({
        title: "Success",
        description: "Note moved to trash",
      });
    } catch (error: any) {
      console.error("Error moving note to trash:", error);
      
      if (error.code === "permission-denied") {
        toast({
          title: "Firestore Access Error",
          description: "Please update your Firebase security rules to allow write access.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to move note to trash",
          variant: "destructive",
        });
      }
      throw error;
    }
  };
  
  // Permanently delete a note
  const permanentlyDeleteNote = async (id: string) => {
    if (!currentUser) return;

    try {
      await deleteDoc(doc(db, "notes", id));
      
      toast({
        title: "Success",
        description: "Note permanently deleted",
      });
    } catch (error: any) {
      console.error("Error permanently deleting note:", error);
      
      if (error.code === "permission-denied") {
        toast({
          title: "Firestore Access Error",
          description: "Please update your Firebase security rules to allow write access.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to delete note",
          variant: "destructive",
        });
      }
      throw error;
    }
  };
  
  // Restore note from trash
  const restoreNote = async (id: string) => {
    if (!currentUser) return;

    try {
      const noteRef = doc(db, "notes", id);
      
      // We only update isArchived status and updatedAt timestamp
      // This preserves other properties like isFavorite
      await updateDoc(noteRef, {
        isArchived: false,
        updatedAt: Timestamp.now()
      });
      
      toast({
        title: "Success",
        description: "Note restored from trash",
      });
    } catch (error: any) {
      console.error("Error restoring note:", error);
      
      if (error.code === "permission-denied") {
        toast({
          title: "Firestore Access Error",
          description: "Please update your Firebase security rules to allow write access.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to restore note",
          variant: "destructive",
        });
      }
      throw error;
    }
  };
  
  // Toggle favorite status
  const toggleFavorite = async (id: string) => {
    if (!currentUser) return;
    
    try {
      const noteRef = doc(db, "notes", id);
      const noteSnap = await getDoc(noteRef);
      const noteData = noteSnap.data();
      
      if (!noteData) {
        throw new Error("Note not found");
      }
      
      await updateDoc(noteRef, {
        isFavorite: !noteData.isFavorite,
        updatedAt: Timestamp.now()
      });
      
      toast({
        title: "Success",
        description: noteData.isFavorite ? "Removed from favorites" : "Added to favorites",
      });
    } catch (error: any) {
      console.error("Error toggling favorite status:", error);
      
      if (error.code === "permission-denied") {
        toast({
          title: "Firestore Access Error",
          description: "Please update your Firebase security rules to allow write access.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to update favorite status",
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  // Add a new tag
  const addTag = async (tag: Omit<Tag, 'id'>): Promise<string> => {
    if (!currentUser) return "";

    try {
      const docRef = await addDoc(collection(db, "tags"), {
        ...tag,
        userId: currentUser.uid,
      });
      
      toast({
        title: "Success",
        description: "Tag created successfully",
      });
      
      return docRef.id;
    } catch (error: any) {
      console.error("Error adding tag:", error);
      
      if (error.code === "permission-denied") {
        toast({
          title: "Firestore Access Error",
          description: "Please update your Firebase security rules to allow write access.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create tag",
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  // Add a new notebook
  const addNotebook = async (notebook: Omit<Notebook, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!currentUser) return "";

    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, "notebooks"), {
        ...notebook,
        userId: currentUser.uid,
        createdAt: now,
        updatedAt: now,
      });
      
      toast({
        title: "Success",
        description: "Notebook created successfully",
      });
      
      return docRef.id;
    } catch (error: any) {
      console.error("Error adding notebook:", error);
      
      if (error.code === "permission-denied") {
        toast({
          title: "Firestore Access Error",
          description: "Please update your Firebase security rules to allow write access.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create notebook",
          variant: "destructive",
        });
      }
      throw error;
    }
  };
  
  // Update an existing notebook
  const updateNotebook = async (id: string, notebook: Partial<Omit<Notebook, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!currentUser) return;

    try {
      const notebookRef = doc(db, "notebooks", id);
      await updateDoc(notebookRef, {
        ...notebook,
        updatedAt: Timestamp.now(),
      });
      
      toast({
        title: "Success",
        description: "Notebook updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating notebook:", error);
      
      if (error.code === "permission-denied") {
        toast({
          title: "Firestore Access Error",
          description: "Please update your Firebase security rules to allow write access.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to update notebook",
          variant: "destructive",
        });
      }
      throw error;
    }
  };
  
  // Delete a notebook
  const deleteNotebook = async (id: string) => {
    if (!currentUser) return;

    try {
      // Check if there are any notes in this notebook
      const notesInNotebook = notes.filter(note => note.notebookId === id && !note.isArchived);
      
      if (notesInNotebook.length > 0) {
        // Move all notes to no notebook
        const batch = writeBatch(db);
        
        notesInNotebook.forEach(note => {
          const noteRef = doc(db, "notes", note.id);
          batch.update(noteRef, { 
            notebookId: null,
            updatedAt: Timestamp.now()
          });
        });
        
        await batch.commit();
      }
      
      // Delete the notebook
      await deleteDoc(doc(db, "notebooks", id));
      
      toast({
        title: "Success",
        description: "Notebook deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting notebook:", error);
      
      if (error.code === "permission-denied") {
        toast({
          title: "Firestore Access Error",
          description: "Please update your Firebase security rules to allow write access.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to delete notebook",
          variant: "destructive",
        });
      }
      throw error;
    }
  };
  
  // Move a note to a notebook
  const moveNoteToNotebook = async (noteId: string, notebookId: string | null) => {
    if (!currentUser) return;

    try {
      const noteRef = doc(db, "notes", noteId);
      
      await updateDoc(noteRef, {
        notebookId: notebookId,
        updatedAt: Timestamp.now()
      });
      
      toast({
        title: "Success",
        description: notebookId ? "Note moved to notebook" : "Note removed from notebook",
      });
    } catch (error: any) {
      console.error("Error moving note to notebook:", error);
      
      if (error.code === "permission-denied") {
        toast({
          title: "Firestore Access Error",
          description: "Please update your Firebase security rules to allow write access.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to move note",
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  // Filter notes based on activeFilter, activeNotebook, and searchTerm
  const filteredNotes = notes.filter(note => {
    // First filter by category/filter
    let passesFilter = true;
    
    if (activeFilter === "favorites") {
      passesFilter = note.isFavorite && !note.isArchived; // Only show favorites that are not in trash
    } else if (activeFilter === "trash") {
      passesFilter = note.isArchived;
    } else if (activeFilter === "all") {
      passesFilter = !note.isArchived;
    } else if (activeFilter.startsWith("tag:")) {
      const tagId = activeFilter.split(":")[1];
      passesFilter = !note.isArchived && note.tags.some(tag => tag.id === tagId);
    }
    
    // Then filter by notebook if one is active (except in trash view)
    if (passesFilter && activeNotebook && activeFilter !== "trash") {
      passesFilter = note.notebookId === activeNotebook;
    }
    
    // Then filter by search term if it exists
    if (passesFilter && searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      return (
        note.title.toLowerCase().includes(lowerSearchTerm) || 
        note.content.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    return passesFilter;
  });

  const value = {
    notes,
    tags,
    notebooks,
    loading,
    activeFilter,
    activeNotebook,
    searchTerm,
    currentNote,
    setCurrentNote,
    setActiveFilter,
    setActiveNotebook,
    setSearchTerm,
    addNote,
    updateNote,
    deleteNote,
    permanentlyDeleteNote,
    restoreNote,
    toggleFavorite,
    addTag,
    addNotebook,
    updateNotebook,
    deleteNotebook,
    moveNoteToNotebook,
    filteredNotes,
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
};
