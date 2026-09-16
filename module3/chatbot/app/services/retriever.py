from dataclasses import dataclass

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.models.schemas import FAQEntry


@dataclass(frozen=True)
class RetrievalResult:
    faq: FAQEntry | None
    score: float


class FAQRetriever:
    def __init__(self, faqs: list[FAQEntry], threshold: float = 0.16) -> None:
        if not faqs:
            raise ValueError("The FAQ index requires at least one entry")
        self.faqs = list(faqs)
        self.threshold = threshold
        self._vectorizer = TfidfVectorizer(ngram_range=(1, 2), lowercase=True)
        documents = [self._document(faq) for faq in self.faqs]
        self._matrix = self._vectorizer.fit_transform(documents)

    def retrieve(self, query: str) -> RetrievalResult:
        query_vector = self._vectorizer.transform([query])
        scores = cosine_similarity(query_vector, self._matrix)[0]
        best_index = int(scores.argmax())
        score = float(scores[best_index])
        return RetrievalResult(
            faq=self.faqs[best_index] if score >= self.threshold else None,
            score=round(score, 6),
        )

    @staticmethod
    def _document(faq: FAQEntry) -> str:
        return " ".join([faq.question, *faq.keywords, faq.answer])
