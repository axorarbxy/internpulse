import re

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.models.schemas import Internship, StudentProfile


def normalize_skill(skill: str) -> str:
    return re.sub(r"\\s+", " ", skill.strip().lower())


def normalized_skills(skills: list[str]) -> set[str]:
    return {normalize_skill(skill) for skill in skills if skill.strip()}


class SkillVectorizer:
    """Fits a TF-IDF index over internship requirements and descriptions."""

    def __init__(self) -> None:
        self._vectorizer = TfidfVectorizer(ngram_range=(1, 2), lowercase=True)
        self._matrix = None
        self._internships: list[Internship] = []

    @property
    def vocabulary_size(self) -> int:
        return len(self._vectorizer.vocabulary_)

    @property
    def internships(self) -> list[Internship]:
        return self._internships

    def fit(self, internships: list[Internship]) -> int:
        if not internships:
            raise ValueError("At least one internship is required to build the index")
        self._internships = list(internships)
        documents = [self._document(internship) for internship in self._internships]
        self._matrix = self._vectorizer.fit_transform(documents)
        return len(self._internships)

    def similarity_scores(self, profile: StudentProfile) -> list[float]:
        if self._matrix is None:
            raise RuntimeError("The internship index has not been built")
        query = self._vectorizer.transform([self._document(profile)])
        return cosine_similarity(query, self._matrix)[0].tolist()

    @staticmethod
    def _document(value: Internship | StudentProfile) -> str:
        if isinstance(value, Internship):
            return " ".join([value.domain, value.title, value.description, *value.required_skills])
        return " ".join([value.target_domain or "", value.resume_text or "", *value.skills])
