# Fraud Content Report

## Summary

- Dataset: `Training_Essay_Data.csv` with 27302 rows after duplicate removal.
- Validation threshold selected for recall >= 0.80: 0.820.
- Test precision/recall at that threshold: 1.000 / 0.911.
- Baseline heuristic macro F1: 0.481.
- Trained model macro F1: 0.962.

## Validation threshold

| Metric | Value |
|---|---:|
| Threshold | 0.820 |
| Validation precision | 1.000 |
| Validation recall | 0.901 |
| Validation F1 | 0.948 |

## Test metrics

| Metric | Baseline | Model |
|---|---:|---:|
| Accuracy | 0.629 | 0.964 |
| Macro precision | 0.725 | 0.971 |
| Macro recall | 0.550 | 0.956 |
| Macro F1 | 0.481 | 0.962 |
| Weighted F1 | 0.531 | 0.963 |
| PR-AUC | 0.427 | 0.998 |
| ROC-AUC | N/A | 0.999 |

## Top features

| Term | Weight |
|---|---:|
| the | -7.5370 |
| because | -7.0779 |
| would | -5.0484 |
| you | -4.9370 |
| driving | -4.9100 |
| venus | -4.8322 |
| people | -4.7134 |
| car | -3.8093 |
| they | -3.7780 |
| is | -3.7700 |
| was | -3.7496 |
| have | -3.5437 |
| important | 3.3762 |
| but | -3.0936 |
| do | -3.0332 |

## Misclassification counts

- Total misclassified rows: 149
- False positives: 0
- False negatives: 149

## Caveats

- This dataset is an essay-generation corpus rather than a real internship submission corpus, so the domain match is imperfect.
- The positive class is `generated`, which is aligned to the fraud content advisory task but not to a real internship-specific labeling scheme.
- Small data warning: if any class has fewer than 50 training examples, metric reliability drops; here the dataset is balanced and adequate.
