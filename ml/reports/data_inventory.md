# Data inventory

## Root CSV inventory

| File | Rows | Columns | Missing values | Duplicates | Notes |
|---|---:|---|---|---:|---|
| `complaints.csv` | 18,120,603 | `Date received`, `Product`, `Sub-product`, `Issue`, `Sub-issue`, `Company public response`, `Company`, `State`, `ZIP code`, `Tags`, `Submitted via`, `Date sent to company`, `Company response to consumer`, `Timely response?`, `Complaint ID` | None major except sparse metadata columns | 0 | Large complaint corpus with no supervised label aligned to the grievance enums. Not used. |
| `IMDB Dataset.csv` | 50,000 | `review`, `sentiment` | 0 | 418 | Used for the sentiment task. |
| `test.csv` | 5,732 | `title`, `abstract`, `label` | 0 | 0 | Ambiguous text-classification dataset; not used under conservative mapping. |
| `train.csv` | 22,930 | `title`, `abstract`, `label` | 0 | 0 | Ambiguous text-classification dataset; not used under conservative mapping. |
| `Training_Essay_Data.csv` | 29,145 | `text`, `generated` | 0 | 1,805 | Used for the fraud-content task. |

## Label distributions

- `IMDB Dataset.csv`: `positive` = 25,000, `negative` = 25,000
- `Training_Essay_Data.csv`: `generated` = 14,574, `0` = 14,571
- `train.csv`: `label` = 11,465 / 11,465 for 0 and 1
- `test.csv`: `label` = 2,866 / 2,866 for 0 and 1

## Notes

- `complaints.csv` is not a labeled grievance task and therefore not used.
- No activity-log anomaly dataset with a clear `fraud_activity` label was present in the project root.
- No raw names/emails/phones were printed anywhere in the project reports; only aggregate counts are shared.
