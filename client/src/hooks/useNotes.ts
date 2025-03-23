import { useContext } from "react";
import { NotesContext } from "../context/NotesContext";

export function useNotes() {
  return useContext(NotesContext);
}
