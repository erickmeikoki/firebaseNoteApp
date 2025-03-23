import { useNotes } from "../../hooks/useNotes";

export default function EmptyState() {
  const { activeFilter, searchTerm } = useNotes();

  let title = "No notes found";
  let description = "Create your first note by clicking the + button below.";

  if (searchTerm) {
    title = "No matching notes";
    description = "Try a different search term.";
  } else if (activeFilter === "favorites") {
    title = "No favorite notes";
    description = "Mark notes as favorites to see them here.";
  } else if (activeFilter === "trash") {
    title = "Trash is empty";
    description = "Notes you delete will appear here.";
  } else if (activeFilter.startsWith("tag:")) {
    title = "No notes with this tag";
    description = "Add this tag to notes to see them here.";
  }

  return (
    <div className="empty-state">
      <span className="material-icons empty-state-icon">note_add</span>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">
        {description}
      </p>
      {!searchTerm && activeFilter !== "trash" && (
        <button className="btn">
          <span className="material-icons">add</span>
          Create Note
        </button>
      )}
    </div>
  );
}
