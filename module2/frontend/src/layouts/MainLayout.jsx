export default function MainLayout({ children }) {
  return (
    <div className="main-layout">
      <header className="main-header">
        <h1>Smart Internship Management System</h1>
      </header>
      <main className="main-content">{children}</main>
    </div>
  );
}
