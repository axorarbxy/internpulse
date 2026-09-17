import {
  LayoutDashboard,
  Search,
  Briefcase,
  User,
  BarChart3,
  Award,
  Sparkles,
  MessageSquare,
  Bot,
  LogOut
} from "lucide-react";

import "./Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">

      <nav className="sidebar-menu">

        <a href="#" className="sidebar-link active">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </a>

        <a href="#" className="sidebar-link">
          <Search size={20} />
          <span>Internships</span>
        </a>

        <a href="#" className="sidebar-link">
          <Briefcase size={20} />
          <span>My Internships</span>
        </a>

        <a href="#" className="sidebar-link">
          <User size={20} />
          <span>Profile</span>
        </a>

        <a href="#" className="sidebar-link">
          <BarChart3 size={20} />
          <span>Analytics</span>
        </a>

        <a href="#" className="sidebar-link">
          <Award size={20} />
          <span>Certificates</span>
        </a>

        <a href="#" className="sidebar-link">
          <Sparkles size={20} />
          <span>Recommendations</span>
        </a>

        <a href="#" className="sidebar-link">
          <MessageSquare size={20} />
          <span>Messages</span>
        </a>

        <a href="#" className="sidebar-link">
          <Bot size={20} />
          <span>Chatbot</span>
        </a>

      </nav>

      <div className="sidebar-bottom">
        <a href="#" className="sidebar-link logout">
          <LogOut size={20} />
          <span>Logout</span>
        </a>
      </div>

    </aside>
  );
}

export default Sidebar;
