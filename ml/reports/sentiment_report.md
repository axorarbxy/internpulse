# Sentiment Report

## Summary

- Dataset: `IMDB Dataset.csv` with 49582 rows after deduplication and filtering.
- This dataset is a generic movie-review corpus rather than internship-specific feedback; this is an external-domain caveat.
- The trained model is compared to the baseline lexical rule set used by the service.

## Test metrics

| Metric | Baseline | Model |
|---|---:|---:|
| Accuracy | 0.413 | 0.898 |
| Macro precision | 0.693 | 0.898 |
| Macro recall | 0.412 | 0.898 |
| Macro F1 | 0.462 | 0.898 |
| Weighted F1 | 0.463 | 0.898 |

## Per-class metrics

| Label | Baseline precision | Baseline recall | Baseline F1 | Model precision | Model recall | Model F1 |
|---|---:|---:|---:|---:|---:|---:|
| negative | 0.840 | 0.222 | 0.351 | 0.914 | 0.877 | 0.895 |
| positive | 0.547 | 0.603 | 0.573 | 0.883 | 0.918 | 0.900 |

## Caveats

- Domain mismatch: the data is movie reviews, not internship feedback or student comments.
- The service’s sentiment baseline only supports positive/negative/neutral; the dataset lacks a neutral class, so the neutral label was not modelled.
- The dataset is relatively balanced and duplicates were removed before splitting.
