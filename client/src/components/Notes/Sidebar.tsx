import { useAuth } from "../../hooks/useAuth";
import { useNotes } from "../../hooks/useNotes";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const { currentUser, logout } = useAuth();
  const { tags, activeFilter, setActiveFilter } = useNotes();

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
              {getInitials(currentUser?.displayName)}
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
