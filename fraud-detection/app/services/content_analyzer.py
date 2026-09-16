import re
from collections import Counter


class ContentAnalysis:
    def __init__(self, score: float, signals: list[str]) -> None:
        self.score = score
        self.signals = signals


class ContentAnalyzer:
    """Heuristic stylometric baseline; it is not proof of AI authorship."""

    AI_MARKERS = {"moreover", "furthermore", "in conclusion", "it is important to note", "delve", "tapestry"}
    SUSPICIOUS_METADATA_KEYS = {"generated_by", "ai_generated", "automation_tool"}

    def analyze(self, content: str, metadata: dict) -> ContentAnalysis:
        words = re.findall(r"[A-Za-z]+", content.lower())
        sentences = [part.strip() for part in re.split(r"[.!?]+", content) if part.strip()]
        if not words or not sentences:
            return ContentAnalysis(0.0, ["insufficient text for stylometric analysis"])
        signals: list[str] = []
        lexical_diversity = len(set(words)) / len(words)
        sentence_lengths = [len(re.findall(r"[A-Za-z]+", sentence)) for sentence in sentences]
        mean_length = sum(sentence_lengths) / len(sentence_lengths)
        variance = sum((length - mean_length) ** 2 for length in sentence_lengths) / len(sentence_lengths)
        marker_count = sum(content.lower().count(marker) for marker in self.AI_MARKERS)
        score = 0.0
        if lexical_diversity < 0.45 and len(words) >= 40:
            score += 0.3
            signals.append("low lexical diversity")
        if len(sentence_lengths) >= 4 and variance < 12:
            score += 0.25
            signals.append("unusually uniform sentence lengths")
        if marker_count >= 2:
            score += 0.2
            signals.append("repeated formulaic transition phrases")
        metadata_text = " ".join(f"{key}={value}" for key, value in metadata.items()).lower()
        if any(key in metadata_text for key in self.SUSPICIOUS_METADATA_KEYS):
            score += 0.35
            signals.append("submission metadata references an automated generation tool")
        if not signals:
            signals.append("no strong stylometric or metadata signal detected")
        return ContentAnalysis(score=min(1.0, round(score, 6)), signals=signals)
