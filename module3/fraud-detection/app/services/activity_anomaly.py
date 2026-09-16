from datetime import datetime

import numpy as np
from sklearn.ensemble import IsolationForest

from app.models.schemas import ActivityEvent


class ActivityAnalysis:
    def __init__(self, score: float, anomalies: list[str]) -> None:
        self.score = score
        self.anomalies = anomalies


class ActivityAnomalyDetector:
    """Combines an Isolation Forest baseline with a deadline-burst rule."""

    def analyze(self, events: list[ActivityEvent], deadline: datetime | None) -> ActivityAnalysis:
        ordered = sorted(events, key=lambda event: event.timestamp)
        features = []
        intervals = []
        for index, event in enumerate(ordered):
            interval = 0.0 if index == 0 else max(0.0, (event.timestamp - ordered[index - 1].timestamp).total_seconds() / 60)
            intervals.append(interval)
            features.append([interval, event.duration_minutes, event.progress_percent])
        anomalies: list[str] = []
        isolation_ratio = 0.0
        if len(features) >= 5:
            model = IsolationForest(contamination="auto", random_state=42)
            labels = model.fit_predict(np.asarray(features, dtype=float))
            isolation_ratio = float(np.mean(labels == -1))
            if isolation_ratio >= 0.4:
                anomalies.append("activity feature pattern contains multiple statistical outliers")
        span_minutes = (ordered[-1].timestamp - ordered[0].timestamp).total_seconds() / 60
        near_deadline = deadline is not None and 0 <= (deadline - ordered[-1].timestamp).total_seconds() <= 24 * 60 * 60
        progress_jump = ordered[-1].progress_percent - ordered[0].progress_percent
        if len(ordered) >= 3 and span_minutes <= 120 and near_deadline and progress_jump >= 80:
            anomalies.append("most progress was recorded in one burst within 24 hours of the deadline")
        score = min(1.0, (0.45 if anomalies and any("burst" in item for item in anomalies) else 0.0) + (0.55 * isolation_ratio))
        if not anomalies:
            anomalies.append("no strong activity anomaly detected")
        return ActivityAnalysis(score=round(score, 6), anomalies=anomalies)
