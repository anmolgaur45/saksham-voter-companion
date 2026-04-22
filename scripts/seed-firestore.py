#!/usr/bin/env python3
"""Load data/constituencies.json into Firestore."""
import json
import sys
from pathlib import Path

from google.cloud import firestore


def main() -> None:
    data_path = Path(__file__).parent.parent / "data" / "constituencies.json"
    if not data_path.exists():
        print(f"ERROR: {data_path} not found", file=sys.stderr)
        sys.exit(1)

    constituencies = json.loads(data_path.read_text())
    client = firestore.Client(database="saksham-voter-companion")
    col = client.collection("constituencies")

    for c in constituencies:
        col.document(c["id"]).set(c)
        print(f"seeded {c['name']}, {c['state']}")

    print(f"\ndone — {len(constituencies)} constituencies written")


if __name__ == "__main__":
    main()
