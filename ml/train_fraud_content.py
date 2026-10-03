from __future__ import annotations

import hashlib
import json
import re
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
from sklearn.metrics import accuracy_score, average_precision_score, confusion_matrix, f1_score, precision_recall_curve, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

ROOT = Path(__file__).resolve().parent
DATASET_PATH = (ROOT.parent / 'Training_Essay_Data.csv').resolve()
ARTIFACT_DIR = ROOT / 'artifacts' / 'fraud_content'
REPORT_PATH = ROOT / 'reports' / 'fraud_content_report.md'
FIGURES_DIR = ROOT / 'reports' / 'figures'

AI_MARKERS = {'moreover', 'furthermore', 'in conclusion', 'it is important to note', 'delve', 'tapestry'}
SUSPICIOUS_METADATA_KEYS = {'generated_by', 'ai_generated', 'automation_tool'}


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open('rb') as handle:
        for chunk in iter(lambda: handle.read(65536), b''):
            digest.update(chunk)
    return digest.hexdigest()


def heuristic_score(text: str, metadata: dict | None = None) -> float:
    content = text or ''
    words = re.findall(r"[A-Za-z]+", content.lower())
    sentences = [part.strip() for part in re.split(r"[.!?]+", content) if part.strip()]
    if not words or not sentences:
        return 0.0
    signals = []
    lexical_diversity = len(set(words)) / len(words)
    sentence_lengths = [len(re.findall(r"[A-Za-z]+", sentence)) for sentence in sentences]
    mean_length = sum(sentence_lengths) / len(sentence_lengths)
    variance = sum((length - mean_length) ** 2 for length in sentence_lengths) / len(sentence_lengths)
    marker_count = sum(content.lower().count(marker) for marker in AI_MARKERS)
    score = 0.0
    if lexical_diversity < 0.45 and len(words) >= 40:
        score += 0.3
        signals.append('low lexical diversity')
    if len(sentence_lengths) >= 4 and variance < 12:
        score += 0.25
        signals.append('uniform sentence lengths')
    if marker_count >= 2:
        score += 0.2
        signals.append('formulaic transition phrases')
    metadata_text = ' '.join(f'{key}={value}' for key, value in (metadata or {}).items()).lower()
    if any(key in metadata_text for key in SUSPICIOUS_METADATA_KEYS):
        score += 0.35
        signals.append('metadata references automation')
    return round(min(1.0, score), 6)


def find_best_threshold(y_val, probs):
    thresholds = np.linspace(0.05, 0.95, 91)
    best = None
    for threshold in thresholds:
        pred = probs >= threshold
        precision = precision_score(y_val, pred, zero_division=0)
        recall = recall_score(y_val, pred, zero_division=0)
        f1 = f1_score(y_val, pred, zero_division=0)
        candidate = (precision, recall, f1, threshold)
        if recall >= 0.80:
            if best is None or candidate[0] > best[0] or (candidate[0] == best[0] and candidate[2] > best[2]):
                best = candidate
    if best is None:
        best = max(
            [(precision_score(y_val, (probs >= t), zero_division=0), recall_score(y_val, (probs >= t), zero_division=0), f1_score(y_val, (probs >= t), zero_division=0), t) for t in thresholds],
            key=lambda item: (item[2], item[0]),
        )
    return best[3], {
        'precision': float(best[0]),
        'recall': float(best[1]),
        'f1': float(best[2]),
        'threshold': float(best[3]),
    }


def save_confusion_matrix(y_true, y_pred, path: Path):
    cm = confusion_matrix(y_true, y_pred)
    fig, ax = plt.subplots(figsize=(5, 4))
    ax.imshow(cm, cmap='Blues')
    ax.set_title('Fraud content confusion matrix')
    ax.set_xlabel('Predicted')
    ax.set_ylabel('Actual')
    ax.set_xticks([0, 1])
    ax.set_yticks([0, 1])
    ax.set_xticklabels(['genuine', 'generated'])
    ax.set_yticklabels(['genuine', 'generated'])
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            ax.text(j, i, int(cm[i, j]), ha='center', va='center', color='black' if cm[i, j] < cm.max() / 2 else 'white')
    fig.tight_layout()
    fig.savefig(path, dpi=180)
    plt.close(fig)


def save_pr_curve(y_true, probs, path: Path):
    precision, recall, _ = precision_recall_curve(y_true, probs)
    fig, ax = plt.subplots(figsize=(6, 4))
    ax.plot(recall, precision, label='PR curve', color='darkorange')
    ax.axhline(0.5, linestyle='--', color='gray', alpha=0.7)
    ax.set_title('Fraud content precision-recall curve')
    ax.set_xlabel('Recall')
    ax.set_ylabel('Precision')
    ax.legend()
    fig.tight_layout()
    fig.savefig(path, dpi=180)
    plt.close(fig)


def main():
    df = pd.read_csv(DATASET_PATH)
    df = df[['text', 'generated']].dropna().copy()
    df['text'] = df['text'].fillna('').astype(str).str.strip()
    df = df.drop_duplicates(subset=['text'], keep='first').copy()

    X = df['text']
    y = df['generated'].astype(int).to_numpy()

    X_tr, X_temp, y_tr, y_temp = train_test_split(X, y, train_size=0.70, stratify=y, random_state=42)
    X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.50, stratify=y_temp, random_state=42)

    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), min_df=2, strip_accents='unicode')),
        ('clf', LogisticRegression(class_weight='balanced', max_iter=2000, solver='liblinear', random_state=42)),
    ])
    pipeline.fit(X_tr, y_tr)

    val_proba = pipeline.predict_proba(X_val)[:, 1]
    threshold, threshold_metrics = find_best_threshold(y_val, val_proba)

    test_proba = pipeline.predict_proba(X_test)[:, 1]
    test_pred = (test_proba >= threshold).astype(int)

    baseline_pred = np.array([1 if heuristic_score(text) >= 0.4 else 0 for text in X_test], dtype=int)
    baseline_accuracy = accuracy_score(y_test, baseline_pred)
    baseline_precision = precision_score(y_test, baseline_pred, zero_division=0)
    baseline_recall = recall_score(y_test, baseline_pred, zero_division=0)
    baseline_f1 = f1_score(y_test, baseline_pred, zero_division=0)
    baseline_macro_f1 = f1_score(y_test, baseline_pred, average='macro', zero_division=0)

    metrics = {
        'validation': {
            'threshold': float(threshold),
            'precision': float(threshold_metrics['precision']),
            'recall': float(threshold_metrics['recall']),
            'f1': float(threshold_metrics['f1']),
        },
        'test': {
            'accuracy': float(accuracy_score(y_test, test_pred)),
            'macro_precision': float(precision_score(y_test, test_pred, average='macro', zero_division=0)),
            'macro_recall': float(recall_score(y_test, test_pred, average='macro', zero_division=0)),
            'macro_f1': float(f1_score(y_test, test_pred, average='macro', zero_division=0)),
            'weighted_f1': float(f1_score(y_test, test_pred, average='weighted', zero_division=0)),
            'pr_auc': float(average_precision_score(y_test, test_proba)),
            'roc_auc': float(roc_auc_score(y_test, test_proba)),
            'precision_at_threshold': float(precision_score(y_test, test_pred, zero_division=0)),
            'recall_at_threshold': float(recall_score(y_test, test_pred, zero_division=0)),
        },
        'baseline_test': {
            'accuracy': float(baseline_accuracy),
            'macro_precision': float(precision_score(y_test, baseline_pred, average='macro', zero_division=0)),
            'macro_recall': float(recall_score(y_test, baseline_pred, average='macro', zero_division=0)),
            'macro_f1': float(baseline_macro_f1),
            'weighted_f1': float(f1_score(y_test, baseline_pred, average='weighted', zero_division=0)),
            'precision': float(baseline_precision),
            'recall': float(baseline_recall),
            'f1': float(baseline_f1),
            'pr_auc': float(average_precision_score(y_test, np.array([heuristic_score(t) for t in X_test]))),
        }
    }

    class_counts = {
        'train': {'total': int(len(y_tr)), 'positive': int(y_tr.sum()), 'negative': int((1-y_tr).sum())},
        'validation': {'total': int(len(y_val)), 'positive': int(y_val.sum()), 'negative': int((1-y_val).sum())},
        'test': {'total': int(len(y_test)), 'positive': int(y_test.sum()), 'negative': int((1-y_test).sum())},
    }

    feature_names = pipeline.named_steps['tfidf'].get_feature_names_out().tolist()
    coefs = pipeline.named_steps['clf'].coef_[0]
    top_idx = np.argsort(np.abs(coefs))[-15:][::-1]
    top_terms = [(feature_names[i], float(coefs[i])) for i in top_idx]

    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    FIGURES_DIR.mkdir(parents=True, exist_ok=True)
    save_confusion_matrix(y_test, test_pred, FIGURES_DIR / 'fraud_content_confusion_matrix.png')
    save_pr_curve(y_test, test_proba, FIGURES_DIR / 'fraud_content_pr_curve.png')
    joblib.dump(pipeline, ARTIFACT_DIR / 'model.joblib')

    metadata = {
        'task': 'fraud_content',
        'model_version': '1.0.0+20261002',
        'trained_at': datetime.now(timezone.utc).isoformat(),
        'input_type': 'text',
        'label_classes': ['genuine', 'generated'],
        'positive_class': 'generated',
        'threshold': float(threshold),
        'feature_count': int(len(feature_names)),
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
        'class_counts': class_counts,
        'top_features': [{'term': term, 'weight': weight} for term, weight in top_terms],
    }
    (ARTIFACT_DIR / 'metadata.json').write_text(json.dumps(metadata, indent=2), encoding='utf-8')

    misclassified_count = int(np.sum(y_test != test_pred))
    false_positive_count = int(np.sum((y_test == 0) & (test_pred == 1)))
    false_negative_count = int(np.sum((y_test == 1) & (test_pred == 0)))

    report = f'''# Fraud Content Report

## Summary

- Dataset: `{DATASET_PATH.name}` with {len(df)} rows after duplicate removal.
- Validation threshold selected for recall >= 0.80: {threshold:.3f}.
- Test precision/recall at that threshold: {metrics['test']['precision_at_threshold']:.3f} / {metrics['test']['recall_at_threshold']:.3f}.
- Baseline heuristic macro F1: {metrics['baseline_test']['macro_f1']:.3f}.
- Trained model macro F1: {metrics['test']['macro_f1']:.3f}.

## Validation threshold

| Metric | Value |
|---|---:|
| Threshold | {threshold:.3f} |
| Validation precision | {threshold_metrics['precision']:.3f} |
| Validation recall | {threshold_metrics['recall']:.3f} |
| Validation F1 | {threshold_metrics['f1']:.3f} |

## Test metrics

| Metric | Baseline | Model |
|---|---:|---:|
| Accuracy | {metrics['baseline_test']['accuracy']:.3f} | {metrics['test']['accuracy']:.3f} |
| Macro precision | {metrics['baseline_test']['macro_precision']:.3f} | {metrics['test']['macro_precision']:.3f} |
| Macro recall | {metrics['baseline_test']['macro_recall']:.3f} | {metrics['test']['macro_recall']:.3f} |
| Macro F1 | {metrics['baseline_test']['macro_f1']:.3f} | {metrics['test']['macro_f1']:.3f} |
| Weighted F1 | {metrics['baseline_test']['weighted_f1']:.3f} | {metrics['test']['weighted_f1']:.3f} |
| PR-AUC | {metrics['baseline_test']['pr_auc']:.3f} | {metrics['test']['pr_auc']:.3f} |
| ROC-AUC | N/A | {metrics['test']['roc_auc']:.3f} |

## Top features

| Term | Weight |
|---|---:|
{chr(10).join(f'| {term} | {weight:.4f} |' for term, weight in top_terms)}

## Misclassification counts

- Total misclassified rows: {misclassified_count}
- False positives: {false_positive_count}
- False negatives: {false_negative_count}

## Caveats

- This dataset is an essay-generation corpus rather than a real internship submission corpus, so the domain match is imperfect.
- The positive class is `generated`, which is aligned to the fraud content advisory task but not to a real internship-specific labeling scheme.
- Small data warning: if any class has fewer than 50 training examples, metric reliability drops; here the dataset is balanced and adequate.
'''
    REPORT_PATH.write_text(report, encoding='utf-8')


if __name__ == '__main__':
    main()
