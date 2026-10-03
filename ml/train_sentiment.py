from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_recall_fscore_support, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

ROOT = Path(__file__).resolve().parent
DATASET_PATH = (ROOT.parent / 'IMDB Dataset.csv').resolve()
ARTIFACT_DIR = ROOT / 'artifacts' / 'sentiment'
REPORT_PATH = ROOT / 'reports' / 'sentiment_report.md'
FIGURES_DIR = ROOT / 'reports' / 'figures'


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open('rb') as handle:
        for chunk in iter(lambda: handle.read(65536), b''):
            digest.update(chunk)
    return digest.hexdigest()


def baseline_label(text: str):
    if 'good' in text.lower() or 'great' in text.lower():
        return 'positive'
    if 'bad' in text.lower() or 'worst' in text.lower() or 'terrible' in text.lower():
        return 'negative'
    return 'neutral'


def save_confusion_matrix(y_true, y_pred, path: Path):
    cm = confusion_matrix(y_true, y_pred, labels=['negative', 'neutral', 'positive'])
    fig, ax = plt.subplots(figsize=(5, 4))
    ax.imshow(cm, cmap='Blues')
    ax.set_title('Sentiment confusion matrix')
    ax.set_xlabel('Predicted')
    ax.set_ylabel('Actual')
    ax.set_xticks([0, 1, 2])
    ax.set_yticks([0, 1, 2])
    ax.set_xticklabels(['negative', 'neutral', 'positive'])
    ax.set_yticklabels(['negative', 'neutral', 'positive'])
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            ax.text(j, i, int(cm[i, j]), ha='center', va='center', color='black' if cm[i, j] < cm.max() / 2 else 'white')
    fig.tight_layout()
    fig.savefig(path, dpi=180)
    plt.close(fig)


def main():
    df = pd.read_csv(DATASET_PATH)
    df = df[['review', 'sentiment']].dropna().copy()
    df['review'] = df['review'].fillna('').astype(str).str.strip()
    df = df.drop_duplicates(subset=['review'], keep='first').copy()
    df['sentiment'] = df['sentiment'].astype(str).str.lower()
    df = df[df['sentiment'].isin(['positive', 'negative'])].copy()

    X = df['review']
    y = df['sentiment'].to_numpy()

    X_tr, X_temp, y_tr, y_temp = train_test_split(X, y, train_size=0.70, stratify=y, random_state=42)
    X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.50, stratify=y_temp, random_state=42)

    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), min_df=2, strip_accents='unicode')),
        ('clf', LogisticRegression(class_weight='balanced', max_iter=2000, solver='liblinear', random_state=42)),
    ])
    pipeline.fit(X_tr, y_tr)

    y_pred = pipeline.predict(X_test)
    heuristic_pred = np.array([baseline_label(text) for text in X_test], dtype=object)

    per_class = precision_recall_fscore_support(y_test, y_pred, labels=['negative', 'positive'], zero_division=0)
    baseline_per_class = precision_recall_fscore_support(y_test, heuristic_pred, labels=['negative', 'positive'], zero_division=0)

    metrics = {
        'test': {
            'accuracy': float(accuracy_score(y_test, y_pred)),
            'macro_precision': float(precision_score(y_test, y_pred, average='macro', labels=['negative', 'positive'], zero_division=0)),
            'macro_recall': float(recall_score(y_test, y_pred, average='macro', labels=['negative', 'positive'], zero_division=0)),
            'macro_f1': float(f1_score(y_test, y_pred, average='macro', labels=['negative', 'positive'], zero_division=0)),
            'weighted_f1': float(f1_score(y_test, y_pred, average='weighted', zero_division=0)),
            'per_class': {
                'negative': {'precision': float(per_class[0][0]), 'recall': float(per_class[1][0]), 'f1': float(per_class[2][0])},
                'positive': {'precision': float(per_class[0][1]), 'recall': float(per_class[1][1]), 'f1': float(per_class[2][1])},
            },
        },
        'baseline_test': {
            'accuracy': float(accuracy_score(y_test, heuristic_pred)),
            'macro_precision': float(precision_score(y_test, heuristic_pred, average='macro', labels=['negative', 'positive'], zero_division=0)),
            'macro_recall': float(recall_score(y_test, heuristic_pred, average='macro', labels=['negative', 'positive'], zero_division=0)),
            'macro_f1': float(f1_score(y_test, heuristic_pred, average='macro', labels=['negative', 'positive'], zero_division=0)),
            'weighted_f1': float(f1_score(y_test, heuristic_pred, average='weighted', zero_division=0)),
            'per_class': {
                'negative': {'precision': float(baseline_per_class[0][0]), 'recall': float(baseline_per_class[1][0]), 'f1': float(baseline_per_class[2][0])},
                'positive': {'precision': float(baseline_per_class[0][1]), 'recall': float(baseline_per_class[1][1]), 'f1': float(baseline_per_class[2][1])},
            },
        },
    }

    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    FIGURES_DIR.mkdir(parents=True, exist_ok=True)
    save_confusion_matrix(y_test, y_pred, FIGURES_DIR / 'sentiment_confusion_matrix.png')
    joblib.dump(pipeline, ARTIFACT_DIR / 'model.joblib')

    metadata = {
        'task': 'sentiment',
        'model_version': '1.0.0+20261002',
        'trained_at': datetime.now(timezone.utc).isoformat(),
        'input_type': 'text',
        'label_classes': ['negative', 'positive'],
        'positive_class': 'positive',
        'threshold': 0.5,
        'feature_count': int(len(pipeline.named_steps['tfidf'].get_feature_names_out())),
        'metrics': metrics,
        'dataset': [{
            'file': str(DATASET_PATH.name),
            'rows_used': int(len(df)),
            'sha256': file_sha256(DATASET_PATH),
        }],
        'random_state': 42,
        'python_version': __import__('platform').python_version(),
        'sklearn_version': __import__('sklearn').__version__,
        'joblib_version': __import__('joblib').__version__,
        'numpy_version': __import__('numpy').__version__,
    }
    (ARTIFACT_DIR / 'metadata.json').write_text(json.dumps(metadata, indent=2), encoding='utf-8')

    report = f'''# Sentiment Report

## Summary

- Dataset: `{DATASET_PATH.name}` with {len(df)} rows after deduplication and filtering.
- This dataset is a generic movie-review corpus rather than internship-specific feedback; this is an external-domain caveat.
- The trained model is compared to the baseline lexical rule set used by the service.

## Test metrics

| Metric | Baseline | Model |
|---|---:|---:|
| Accuracy | {metrics['baseline_test']['accuracy']:.3f} | {metrics['test']['accuracy']:.3f} |
| Macro precision | {metrics['baseline_test']['macro_precision']:.3f} | {metrics['test']['macro_precision']:.3f} |
| Macro recall | {metrics['baseline_test']['macro_recall']:.3f} | {metrics['test']['macro_recall']:.3f} |
| Macro F1 | {metrics['baseline_test']['macro_f1']:.3f} | {metrics['test']['macro_f1']:.3f} |
| Weighted F1 | {metrics['baseline_test']['weighted_f1']:.3f} | {metrics['test']['weighted_f1']:.3f} |

## Per-class metrics

| Label | Baseline precision | Baseline recall | Baseline F1 | Model precision | Model recall | Model F1 |
|---|---:|---:|---:|---:|---:|---:|
| negative | {metrics['baseline_test']['per_class']['negative']['precision']:.3f} | {metrics['baseline_test']['per_class']['negative']['recall']:.3f} | {metrics['baseline_test']['per_class']['negative']['f1']:.3f} | {metrics['test']['per_class']['negative']['precision']:.3f} | {metrics['test']['per_class']['negative']['recall']:.3f} | {metrics['test']['per_class']['negative']['f1']:.3f} |
| positive | {metrics['baseline_test']['per_class']['positive']['precision']:.3f} | {metrics['baseline_test']['per_class']['positive']['recall']:.3f} | {metrics['baseline_test']['per_class']['positive']['f1']:.3f} | {metrics['test']['per_class']['positive']['precision']:.3f} | {metrics['test']['per_class']['positive']['recall']:.3f} | {metrics['test']['per_class']['positive']['f1']:.3f} |

## Caveats

- Domain mismatch: the data is movie reviews, not internship feedback or student comments.
- The service’s sentiment baseline only supports positive/negative/neutral; the dataset lacks a neutral class, so the neutral label was not modelled.
- The dataset is relatively balanced and duplicates were removed before splitting.
'''
    REPORT_PATH.write_text(report, encoding='utf-8')


if __name__ == '__main__':
    main()
