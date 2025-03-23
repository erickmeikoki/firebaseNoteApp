import { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { collection, query, where, orderBy, onSnapshot, doc, addDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { AuthContext } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Tag {
  id: string;
  name: string;
  color: string;
  count?: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  tags: Tag[];
  isFavorite: boolean;
  isArchived: boolean;
}

interface NotesContextType {
  notes: Note[];
  tags: Tag[];
  loading: boolean;
  activeFilter: string;
  searchTerm: string;
  currentNote: Note | null;
  setCurrentNote: (note: Note | null) => void;
  setActiveFilter: (filter: string) => void;
  setSearchTerm: (term: string) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, note: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  addTag: (tag: Omit<Tag, 'id'>) => Promise<string>;
  filteredNotes: Note[];
}

export const NotesContext = createContext<NotesContextType>({
  notes: [],
  tags: [],
  loading: true,
  activeFilter: "all",
  searchTerm: "",
  currentNote: null,
  setCurrentNote: () => {},
  setActiveFilter: () => {},
  setSearchTerm: () => {},
  addNote: async () => {},
  updateNote: async () => {},
  deleteNote: async () => {},
  addTag: async () => "",
  filteredNotes: [],
});

export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  
  const { currentUser } = useContext(AuthContext);
  const { toast } = useToast();

  // Fetch notes from Firebase when user is authenticated
  useEffect(() => {
    if (!currentUser) {
      setNotes([]);
      setTags([]);
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

    const unsubscribeNotes = onSnapshot(notesQuery, async (snapshot) => {
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
        });
      });
      
      setNotes(notesData);
      setLoading(false);
    });

    // Subscribe to tags collection
    const tagsQuery = query(
      collection(db, "tags"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribeTags = onSnapshot(tagsQuery, (snapshot) => {
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
    });

    return () => {
      unsubscribeNotes();
      unsubscribeTags();
    };
  }, [currentUser]);

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
      toast({
        title: "Error",
        description: error.message || "Failed to create note",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: error.message || "Failed to update note",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Delete a note
  const deleteNote = async (id: string) => {
    if (!currentUser) return;

    try {
      await deleteDoc(doc(db, "notes", id));
      
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete note",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: error.message || "Failed to create tag",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Filter notes based on activeFilter and searchTerm
  const filteredNotes = notes.filter(note => {
    // First filter by category
    let passesFilter = true;
    
    if (activeFilter === "favorites") {
      passesFilter = note.isFavorite;
    } else if (activeFilter === "trash") {
      passesFilter = note.isArchived;
    } else if (activeFilter === "all") {
      passesFilter = !note.isArchived;
    } else if (activeFilter.startsWith("tag:")) {
      const tagId = activeFilter.split(":")[1];
      passesFilter = !note.isArchived && note.tags.some(tag => tag.id === tagId);
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
    loading,
    activeFilter,
    searchTerm,
    currentNote,
    setCurrentNote,
    setActiveFilter,
    setSearchTerm,
    addNote,
    updateNote,
    deleteNote,
    addTag,
    filteredNotes,
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
};
