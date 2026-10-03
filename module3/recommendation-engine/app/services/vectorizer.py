import math
import re
from collections import Counter

from app.models.schemas import Internship, StudentProfile

_TOKEN_RE = re.compile(r"[a-z0-9]+")


def _tokenize(text: str) -> list[str]:
    return _TOKEN_RE.findall(text.lower())


def _vectorize(text: str, idf: dict[str, float]) -> dict[str, float]:
    counts = Counter(_tokenize(text))
    if not counts:
        return {}
    total = sum(counts.values())
    return {term: (count / total) * idf.get(term, 1.0) for term, count in counts.items()}


def _dot(left: dict[str, float], right: dict[str, float]) -> float:
    return sum(left[term] * right[term] for term in left if term in right)


def _norm(vector: dict[str, float]) -> float:
    return math.sqrt(sum(value * value for value in vector.values()))


def _cosine_similarity(left: dict[str, float], right: dict[str, float]) -> float:
    denominator = _norm(left) * _norm(right)
    if denominator == 0:
        return 0.0
    return _dot(left, right) / denominator


def normalize_skill(skill: str) -> str:
    return re.sub(r"\\s+", " ", skill.strip().lower())


def normalized_skills(skills: list[str]) -> set[str]:
    return {normalize_skill(skill) for skill in skills if skill.strip()}


class SkillVectorizer:
    """Fits a TF-IDF index over internship requirements and descriptions."""

    def __init__(self) -> None:
        self._idf: dict[str, float] = {}
        self._document_vectors: list[dict[str, float]] = []
        self._internships: list[Internship] = []

    @property
    def vocabulary_size(self) -> int:
        return len(self._idf)

    @property
    def internships(self) -> list[Internship]:
        return self._internships

    def fit(self, internships: list[Internship]) -> int:
        if not internships:
            raise ValueError("At least one internship is required to build the index")
        self._internships = list(internships)
        documents = [self._document(internship) for internship in self._internships]
        doc_freq: Counter[str] = Counter()
        for document in documents:
            seen: set[str] = set()
            for term in _tokenize(document):
                if term not in seen:
                    seen.add(term)
                    doc_freq[term] += 1

        total_docs = len(documents)
        self._idf = {
            term: math.log((1 + total_docs) / (1 + frequency)) + 1.0
            for term, frequency in doc_freq.items()
        }

        self._document_vectors = [
            _vectorize(document, self._idf) for document in documents
        ]
        return len(self._internships)

    def similarity_scores(self, profile: StudentProfile) -> list[float]:
        if not self._document_vectors:
            raise RuntimeError("The internship index has not been built")
        query_vector = _vectorize(self._document(profile), self._idf)
        return [
            _cosine_similarity(query_vector, document_vector)
            for document_vector in self._document_vectors
        ]

    @staticmethod
    def _document(value: Internship | StudentProfile) -> str:
        if isinstance(value, Internship):
            return " ".join([value.domain, value.title, value.description, *value.required_skills])
        return " ".join([value.target_domain or "", value.resume_text or "", *value.skills])
