# ML training and artifact pipeline

This folder contains the training pipeline for the subset of tasks that had usable project datasets.

## Available tasks

- `fraud_content` from `Training_Essay_Data.csv`
- `sentiment` from `IMDB Dataset.csv`

The grievance and activity tasks were intentionally skipped because no reliable mapped dataset existed in the project folder.

## Quick start

```bash
 python3.12 -m venv ml/.venv
 . ml/.venv/bin/activate
pip install -r ml/requirements-train.txt
python ml/train_all.py
```

 On Windows, replace `python3.12` with `py -3.12` and activate the environment with `ml/.venv/Scripts/Activate.ps1`.

## Outputs

- `ml/artifacts/fraud_content/model.joblib`
- `ml/artifacts/fraud_content/metadata.json`
- `ml/artifacts/sentiment/model.joblib`
- `ml/artifacts/sentiment/metadata.json`
- `ml/reports/fraud_content_report.md`
- `ml/reports/sentiment_report.md`
- `ml/reports/figures/`

## Notes

- All training is deterministic with `random_state=42`.
- Models are saved in scikit-learn pipeline format and can be reloaded in a fresh Python process.
- The fraud task uses a threshold selected on the validation split to satisfy the recall target.
