import { useNotes } from "../../hooks/useNotes";
import { useState, useEffect } from "react";

export default function EmptyState() {
  const { activeFilter, searchTerm, notes, loading } = useNotes();
  const [showPermissionsHelp, setShowPermissionsHelp] = useState(false);

  useEffect(() => {
    // If loading is finished and we still have no notes, show permissions help
    if (!loading && notes.length === 0) {
      const timer = setTimeout(() => {
        setShowPermissionsHelp(true);
      }, 1000); // Show after 1 second of empty state
      
      return () => clearTimeout(timer);
    }
  }, [loading, notes]);

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
      <span className="material-icons empty-state-icon">
        {showPermissionsHelp ? "lock" : "note_add"}
      </span>
      <h3 className="empty-state-title">
        {showPermissionsHelp ? "Firestore Permissions Required" : title}
      </h3>
      <p className="empty-state-description">
        {showPermissionsHelp ? (
          <>
            To use this application, please update your Firebase security rules in the Firebase Console:
            <ol style={{ textAlign: "left", marginTop: "10px", marginBottom: "10px" }}>
              <li>Go to the Firebase Console</li>
              <li>Select your project</li>
              <li>Go to Firestore Database</li>
              <li>Select the "Rules" tab</li>
              <li>Update your rules to allow read/write access:</li>
            </ol>
            <pre style={{ 
              textAlign: "left", 
              background: "#f5f5f5", 
              padding: "10px", 
              borderRadius: "4px", 
              overflow: "auto",
              fontSize: "0.8rem" 
            }}>
              {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`}
            </pre>
            <div style={{ marginTop: "10px" }}>
              This allows any authenticated user to read and write their own data.
            </div>
          </>
        ) : (
          description
        )}
      </p>
      {!searchTerm && activeFilter !== "trash" && !showPermissionsHelp && (
        <button className="btn">
          <span className="material-icons">add</span>
          Create Note
        </button>
      )}
      
      {showPermissionsHelp && (
        <button 
          className="btn" 
          onClick={() => window.open("https://console.firebase.google.com/", "_blank")}
          style={{ marginTop: "15px" }}
        >
          <span className="material-icons">open_in_new</span>
          Open Firebase Console
        </button>
      )}
    </div>
  );
}
