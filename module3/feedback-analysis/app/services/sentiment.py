import re

from app.models.schemas import SentimentLabel


class SentimentAnalyzer:
    POSITIVE = {"good", "great", "helpful", "supportive", "excellent", "fair", "learned", "mentor", "mentorship", "responsive", "clear", "recommend"}
    NEGATIVE = {"bad", "poor", "unhelpful", "terrible", "unfair", "delay", "delayed", "late", "unresponsive", "ignored", "stressful", "unsafe", "no", "never"}

    def analyze(self, text: str) -> tuple[float, SentimentLabel]:
        tokens = re.findall(r"[a-z]+", text.lower())
        if not tokens:
            return 0.0, SentimentLabel.NEUTRAL
        positive = sum(token in self.POSITIVE for token in tokens)
        negative = sum(token in self.NEGATIVE for token in tokens)
        score = max(-1.0, min(1.0, (positive - negative) / max(positive + negative, 1)))
        label = SentimentLabel.POSITIVE if score > 0.15 else SentimentLabel.NEGATIVE if score < -0.15 else SentimentLabel.NEUTRAL
        return round(score, 6), label
