import { Bell, UserCircle } from "lucide-react";
import "./Navbar.css";

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-logo">
        <span className="logo-icon">🌐</span>
        <span>InternPulse</span>
      </div>

      <div className="navbar-right">
        <button className="icon-button" title="Notifications">
          <Bell size={21} />
        </button>

        <div className="profile">
          <UserCircle size={28} />
          <span>Student</span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
