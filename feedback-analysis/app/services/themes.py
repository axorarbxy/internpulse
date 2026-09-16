from sklearn.feature_extraction.text import CountVectorizer

from app.models.schemas import Theme


class ThemeExtractor:
    def extract(self, comments: list[str], limit: int = 8) -> list[Theme]:
        if not comments:
            return []
        vectorizer = CountVectorizer(stop_words="english", ngram_range=(1, 2), token_pattern=r"(?u)\b[a-zA-Z][a-zA-Z]+\b")
        matrix = vectorizer.fit_transform(comments)
        counts = matrix.sum(axis=0).A1
        terms = vectorizer.get_feature_names_out()
        ranked = sorted(zip(terms, counts), key=lambda item: (-int(item[1]), item[0]))[:limit]
        total = sum(int(count) for _, count in ranked)
        return [
            Theme(theme=term, mentions=int(count), share=round(int(count) / total, 6) if total else 0.0)
            for term, count in ranked
        ]
