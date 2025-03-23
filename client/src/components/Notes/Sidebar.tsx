import { useAuth } from "../../hooks/useAuth";
import { useNotes } from "../../hooks/useNotes";
import { useState } from "react";
import { Notebook } from "@/types";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const { currentUser, logout } = useAuth();
  const { 
    tags, 
    notebooks, 
    activeFilter, 
    activeNotebook, 
    setActiveFilter, 
    setActiveNotebook, 
    addNotebook 
  } = useNotes();
  
  const [showNewNotebookInput, setShowNewNotebookInput] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState("");

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const getInitials = (name: string | null): string => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  const handleCreateNotebook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotebookName.trim()) return;
    
    try {
      await addNotebook({
        name: newNotebookName.trim(),
        description: "",
        color: "#4f46e5", // Default color
        icon: "📓", // Default icon
      });
      
      // Reset input
      setNewNotebookName("");
      setShowNewNotebookInput(false);
    } catch (error) {
      console.error("Error creating notebook:", error);
    }
  };
  
  const handleNotebookClick = (notebookId: string, e: React.MouseEvent) => {
    e.preventDefault();
    // If clicking on already active notebook, deactivate it
    if (activeNotebook === notebookId) {
      setActiveNotebook(null);
    } else {
      setActiveNotebook(notebookId);
    }
    
    // Make sure we're in non-trash view
    if (activeFilter === 'trash') {
      setActiveFilter('all');
    }
    
    // Close sidebar on mobile
    if (window.innerWidth <= 768) toggleSidebar();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <span className="material-icons">description</span>
          <span>NoteSpace</span>
        </div>
      </div>
      
      <div className="sidebar-content">
        <div className="nav-section">
          <ul className="nav-list">
            <li className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveFilter('all');
                  if (window.innerWidth <= 768) toggleSidebar();
                }}
              >
                <span className="material-icons">notes</span>
                <span>All Notes</span>
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activeFilter === 'favorites' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveFilter('favorites');
                  if (window.innerWidth <= 768) toggleSidebar();
                }}
              >
                <span className="material-icons">star</span>
                <span>Favorites</span>
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activeFilter === 'trash' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveFilter('trash');
                  if (window.innerWidth <= 768) toggleSidebar();
                }}
              >
                <span className="material-icons">delete</span>
                <span>Trash</span>
              </a>
            </li>
          </ul>
        </div>
        
        {/* Notebooks Section */}
        <div className="nav-section">
          <div className="nav-section-header">
            <div className="nav-section-title">Notebooks</div>
            <button 
              className="btn-ghost btn-icon btn-sm" 
              title="Create notebook"
              onClick={() => setShowNewNotebookInput(true)}
            >
              <span className="material-icons">add</span>
            </button>
          </div>
          
          {showNewNotebookInput && (
            <form onSubmit={handleCreateNotebook} className="new-notebook-form">
              <input
                type="text"
                value={newNotebookName}
                onChange={(e) => setNewNotebookName(e.target.value)}
                placeholder="Notebook name"
                className="input-sm"
                autoFocus
              />
              <div className="form-actions">
                <button type="submit" className="btn-sm btn-primary">Create</button>
                <button 
                  type="button" 
                  className="btn-sm btn-ghost"
                  onClick={() => {
                    setShowNewNotebookInput(false);
                    setNewNotebookName("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
          
          <ul className="nav-list">
            {notebooks.map(notebook => (
              <li className="nav-item" key={notebook.id}>
                <a 
                  href="#" 
                  className={`nav-link ${activeNotebook === notebook.id ? 'active' : ''}`}
                  onClick={(e) => handleNotebookClick(notebook.id, e)}
                >
                  <span className="notebook-icon">{notebook.icon || "📓"}</span>
                  <span>{notebook.name}</span>
                </a>
              </li>
            ))}
            {notebooks.length === 0 && !showNewNotebookInput && (
              <li className="empty-list-message">No notebooks yet</li>
            )}
          </ul>
        </div>
        
        {/* Tags Section */}
        {tags.length > 0 && (
          <div className="nav-section">
            <div className="nav-section-title">Tags</div>
            <ul className="nav-list">
              {tags.map(tag => (
                <li className="nav-item" key={tag.id}>
                  <a 
                    href="#" 
                    className={`nav-link ${activeFilter === `tag:${tag.id}` ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveFilter(`tag:${tag.id}`);
                      if (window.innerWidth <= 768) toggleSidebar();
                    }}
                  >
                    <span 
                      className="material-icons" 
                      style={{ color: tag.color === 'blue' ? 'var(--primary)' : 
                              tag.color === 'purple' ? 'var(--secondary)' : 
                              'var(--success)' }}
                    >
                      label
                    </span>
                    <span>{tag.name}</span>
                    {tag.count !== undefined && tag.count > 0 && (
                      <span className="badge">{tag.count}</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="sidebar-footer">
        <div className="user-profile">
          {currentUser?.photoURL ? (
            <img 
              src={currentUser.photoURL} 
              alt={currentUser.displayName || "User"} 
              className="avatar" 
              style={{ width: "32px", height: "32px", objectFit: "cover" }}
            />
          ) : (
            <div className="avatar">
              {currentUser && currentUser.displayName 
                ? getInitials(currentUser.displayName) 
                : getInitials(null)}
            </div>
          )}
          
          <div className="user-info">
            <div className="user-name">{currentUser?.displayName || "User"}</div>
            <div className="user-email">{currentUser?.email}</div>
          </div>
          
          <button 
            className="btn-ghost btn-icon" 
            title="Log out" 
            onClick={handleLogout}
          >
            <span className="material-icons">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
