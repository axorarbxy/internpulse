export default function ProfileCard({ name = 'User Profile' }) {
  return (
    <div className="profile-card">
      <h4>{name}</h4>
      <p>Profile information summary.</p>
    </div>
  );
}
