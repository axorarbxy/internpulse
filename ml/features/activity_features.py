from __future__ import annotations

import math
from typing import Iterable, Sequence

import numpy as np


def extract_features(events: Sequence[dict] | Iterable[dict], deadline=None):
    """Create a compact tabular feature vector for activity-anomaly detection.

    This is a pure function that follows the README contract for the tabular fraud task.
    It is present even though no activity dataset is currently mapped in this project.
    """
    items = list(events or [])
    if not items:
        return np.zeros(8, dtype=float)

    timestamps = []
    progress_values = []
    durations = []
    for event in items:
        ts = event.get('timestamp') or event.get('time')
        if ts is not None:
            try:
                timestamps.append(float(ts))
            except (TypeError, ValueError):
                pass
        if 'progress_percent' in event:
            try:
                progress_values.append(float(event['progress_percent']))
            except (TypeError, ValueError):
                pass
        if 'duration_minutes' in event:
            try:
                durations.append(float(event['duration_minutes']))
            except (TypeError, ValueError):
                pass

    if not timestamps:
        timestamps = [0.0] * max(1, len(items))
    if not progress_values:
        progress_values = [0.0] * max(1, len(items))
    if not durations:
        durations = [0.0] * max(1, len(items))

    intervals = []
    for i in range(1, len(timestamps)):
        delta = abs(float(timestamps[i]) - float(timestamps[i - 1]))
        if delta > 0:
            intervals.append(delta)

    event_count = float(len(items))
    mean_interval = float(np.mean(intervals)) if intervals else 0.0
    std_interval = float(np.std(intervals)) if len(intervals) > 1 else 0.0
    median_interval = float(np.median(intervals)) if intervals else 0.0
    max_ratio = float((max(intervals) / median_interval) if intervals and median_interval > 0 else 0.0)
    progress_delta = max(progress_values) - min(progress_values) if progress_values else 0.0
    progress_per_hour = float(progress_delta / max(1.0, mean_interval / 3600.0)) if mean_interval > 0 else 0.0
    last_two_hours = 0.0
    if len(progress_values) > 1:
        last_two_hours = float(sum(progress_values[-min(2, len(progress_values)):])) / max(1.0, min(2, len(progress_values)))
    deadline_hours = 0.0
    if deadline is not None:
        try:
            deadline_hours = float(deadline)
        except (TypeError, ValueError):
            deadline_hours = 0.0
    duration_mean = float(np.mean(durations)) if durations else 0.0
    duration_std = float(np.std(durations)) if len(durations) > 1 else 0.0
    duration_max = float(np.max(durations)) if durations else 0.0

    return np.array([
        event_count,
        mean_interval,
        std_interval,
        median_interval,
        max_ratio,
        progress_per_hour,
        last_two_hours,
        deadline_hours,
    ], dtype=float)
