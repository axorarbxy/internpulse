export default function InternshipCard({ role = 'Internship Title', company = 'Company Name' }) {
  return (
    <div className="internship-card">
      <h4>{role}</h4>
      <p>{company}</p>
    </div>
  );
}
