# DATA_MAPPING

## Used datasets

| File | Task | Text column | Label column | Mapping | Notes |
|---|---|---|---|---|---|
| `Training_Essay_Data.csv` | `fraud_content` | `text` | `generated` | `0 -> genuine`, `1 -> generated` | Directly matches the fraud-content binary classification task and the service heuristic behavior for AI-like content screening. |
| `IMDB Dataset.csv` | `sentiment` | `review` | `sentiment` | `positive -> positive`, `negative -> negative` | The service supports a neutral label, but this dataset has only positive/negative classes; neutral was not observed. |

## Unused or intentionally skipped datasets

| File | Decision | Reason |
|---|---|---|
| `complaints.csv` | unused | It contains complaint metadata without a direct category/urgency label aligned to the service enums. It is a raw complaint corpus, not a validated grievance-classification dataset. |
| `train.csv` | unused | It has a binary title+abstract label, but the semantics are ambiguous and not clearly aligned to the fraud heuristics in the service; the more conservative choice is to avoid it. |
| `test.csv` | unused | Same ambiguity as `train.csv`; it is a validation split for a separate classification problem rather than a direct fraud-content mapping. |
| `fraud_activity` | not trained | No usable event-log dataset with anomaly labels was present in the project root. |
| `grievance_category` | not trained | No complaint dataset with the required category labels was found. |
| `grievance_urgency` | not trained | No complaint dataset with the required urgency labels was found. |

## Data-quality notes

- Exact duplicates were dropped before splitting.
- No person-identifying columns were used in the text models.
- The `Training_Essay_Data.csv` dataset is a synthetic/LLM-style essay dataset, so the domain caveat applies: it is not a real internship submission corpus and may not generalize perfectly to internship text. |
