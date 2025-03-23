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
    description = "Notes you delete will appear here. You can restore or permanently delete them.";
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
      <div className="empty-state-description">
        {showPermissionsHelp ? (
          <div>
            <p>To use this application, please update your Firebase security rules in the Firebase Console:</p>
            <div style={{ margin: "10px 0" }}>
              <ol style={{ textAlign: "left", margin: "10px 0", paddingLeft: "20px" }}>
                <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", textDecoration: "underline" }}>Firebase Console</a></li>
                <li>Select your project: <strong>note-taker-1a709</strong></li>
                <li>Go to Firestore Database in the left sidebar</li>
                <li>Select the "Rules" tab</li>
                <li>Update your rules to allow read/write access:</li>
              </ol>
            </div>
            <div style={{ 
              textAlign: "left", 
              background: "#f5f5f5", 
              padding: "10px", 
              borderRadius: "4px", 
              overflow: "auto"
            }}>
              <code style={{ display: "block", margin: 0, fontSize: "0.8rem", whiteSpace: "pre" }}>
                {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`}
              </code>
            </div>
            <p style={{ marginTop: "10px" }}>
              This allows any authenticated user to read and write data. Click "Publish" after updating the rules.
            </p>
            <p style={{ marginTop: "10px", fontWeight: "bold" }}>
              Also check these additional settings:
            </p>
            <div style={{ margin: "10px 0" }}>
              <ol style={{ textAlign: "left", margin: "10px 0", paddingLeft: "20px" }}>
                <li>Go to Authentication in the sidebar</li>
                <li>Make sure Google Sign-in method is enabled</li>
                <li>Add the URL of this app to the Authorized domains list</li>
              </ol>
            </div>
          </div>
        ) : (
          <p>{description}</p>
        )}
      </div>
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
