#!/usr/bin/env python3
"""
Write lib/spdxIdentifiers.json from the SPDX tables in Python's `packaging`.

The NeuroContainers builder validates `copyright[].license` with
`packaging.licenses.canonicalize_license_expression`, so the UI accepts the same
license and exception identifiers. Run with the newest `packaging` release the
builder may use: the list only grows, so a newer table never rejects a license
that an older builder accepts.
"""
import json
from pathlib import Path

import packaging
from packaging.licenses._spdx import EXCEPTIONS, LICENSES

OUTPUT = Path(__file__).resolve().parent.parent / "lib" / "spdxIdentifiers.json"

data = {
    "source": f"packaging {packaging.__version__}",
    "licenses": sorted(entry["id"] for entry in LICENSES.values()),
    "exceptions": sorted(entry["id"] for entry in EXCEPTIONS.values()),
}
OUTPUT.write_text(json.dumps(data, indent=1) + "\n", encoding="utf-8")
print(f"Wrote {len(data['licenses'])} licenses and {len(data['exceptions'])} exceptions to {OUTPUT}")
