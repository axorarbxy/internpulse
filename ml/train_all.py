from __future__ import annotations

import json
import runpy
from pathlib import Path

ROOT = Path(__file__).resolve().parent

TASKS = [
    'fraud_content',
    'sentiment',
]

for task in TASKS:
    script = ROOT / f'train_{task}.py'
    if not script.exists():
        raise FileNotFoundError(f'Missing training script for task: {task}')
    runpy.run_path(str(script), run_name='__main__')

print(json.dumps({'trained_tasks': TASKS}, indent=2))
