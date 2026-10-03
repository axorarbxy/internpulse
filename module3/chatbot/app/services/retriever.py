import math
import re
from collections import Counter
from dataclasses import dataclass

from app.models.schemas import FAQEntry

_TOKEN_RE = re.compile(r"[a-z0-9]+(?:'[a-z0-9]+)?")


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


@dataclass(frozen=True)
class RetrievalResult:
    faq: FAQEntry | None
    score: float


class FAQRetriever:
    def __init__(self, faqs: list[FAQEntry], threshold: float = 0.25) -> None:
        if not faqs:
            raise ValueError("The FAQ index requires at least one entry")
        self.faqs = list(faqs)
        self.threshold = threshold
        self._idf = self._build_idf()
        self._document_vectors = [
            _vectorize(self._document(faq), self._idf) for faq in self.faqs
        ]

    def _build_idf(self) -> dict[str, float]:
        doc_freq: Counter[str] = Counter()
        for faq in self.faqs:
            seen: set[str] = set()
            for term in _tokenize(self._document(faq)):
                if term not in seen:
                    seen.add(term)
                    doc_freq[term] += 1
        total_docs = len(self.faqs)
        return {
            term: math.log((1 + total_docs) / (1 + frequency)) + 1.0
            for term, frequency in doc_freq.items()
        }

    def retrieve(self, query: str) -> RetrievalResult:
        if not query.strip():
            return RetrievalResult(faq=None, score=0.0)
        query_vector = _vectorize(query, self._idf)
        best_index = -1
        best_score = 0.0
        for index, document_vector in enumerate(self._document_vectors):
            score = _cosine_similarity(query_vector, document_vector)
            if score > best_score:
                best_score = score
                best_index = index
        score = float(best_score)
        return RetrievalResult(
            faq=self.faqs[best_index] if best_index >= 0 and score >= self.threshold else None,
            score=round(score, 6),
        )

    @staticmethod
    def _document(faq: FAQEntry) -> str:
        return " ".join([faq.question, *faq.keywords, faq.answer])
