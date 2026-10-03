import re
from collections import Counter

from app.models.schemas import Theme

_TOKEN_RE = re.compile(r"[a-zA-Z][a-zA-Z]+")
_STOP_WORDS = {
    "about", "after", "again", "against", "all", "also", "am", "an", "and", "any", "are",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
    "but", "by", "can", "did", "do", "does", "doing", "down", "during", "each", "few",
    "for", "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers",
    "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its",
    "itself", "just", "me", "more", "most", "my", "myself", "no", "nor", "not", "of", "off",
    "on", "once", "only", "or", "other", "our", "ours", "ourselves", "out", "over", "own",
    "same", "she", "should", "so", "some", "such", "than", "that", "the", "their", "theirs",
    "them", "themselves", "then", "there", "these", "they", "this", "those", "through",
    "to", "too", "under", "until", "up", "very", "was", "we", "were", "what", "when", "where",
    "which", "while", "who", "whom", "why", "with", "you", "your", "yours", "yourself",
    "yourselves",
}


def _tokenize(text: str) -> list[str]:
    return [token.lower() for token in _TOKEN_RE.findall(text)]


class ThemeExtractor:
    def extract(self, comments: list[str], limit: int = 8) -> list[Theme]:
        if not comments:
            return []
        counts: Counter[str] = Counter()
        for comment in comments:
            for token in _tokenize(comment):
                if token not in _STOP_WORDS and len(token) > 2:
                    counts[token] += 1
        ranked = counts.most_common(limit)
        total = sum(count for _, count in ranked)
        return [
            Theme(theme=term, mentions=int(count), share=round(int(count) / total, 6) if total else 0.0)
            for term, count in ranked
        ]
