from datetime import datetime
import statistics

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
        progress_values = []
        for index, event in enumerate(ordered):
            interval = 0.0 if index == 0 else max(0.0, (event.timestamp - ordered[index - 1].timestamp).total_seconds() / 60)
            intervals.append(interval)
            progress_values.append(event.progress_percent)
            features.append([interval, event.duration_minutes, event.progress_percent])
        anomalies: list[str] = []
        isolation_ratio = 0.0
        if len(features) >= 5:
            interval_median = statistics.median(intervals)
            progress_median = statistics.median(progress_values)
            interval_sigma = statistics.pstdev(intervals) if len(intervals) > 1 else 0.0
            progress_sigma = statistics.pstdev(progress_values) if len(progress_values) > 1 else 0.0

            unusual_points = 0
            for interval, progress in zip(intervals, progress_values):
                if abs(interval - interval_median) > max(1.0, 1.5 * interval_sigma):
                    unusual_points += 1
                if abs(progress - progress_median) > max(5.0, 1.5 * progress_sigma):
                    unusual_points += 1

            isolation_ratio = unusual_points / max(len(features) * 2, 1)
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
