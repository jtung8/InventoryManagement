"""CSV validation logic for the import endpoint.

Supports two CSV schemas:
  - inventory_snapshot: sku, name, category, available, unit_cost
  - sales_history:      order_id, order_date, sku, quantity, unit_price

Auto-detects CSV type from headers. Extra columns are passed through
without validation. All detection and trimming behavior is reported
via the warnings list so nothing happens silently.
"""

from __future__ import annotations

import csv
import io
from dataclasses import dataclass, field
from datetime import datetime

# ---------------------------------------------------------------------------
# Schema definitions
# ---------------------------------------------------------------------------

INVENTORY_SNAPSHOT_REQUIRED = ["sku", "name", "category", "available", "unit_cost"]
SALES_HISTORY_REQUIRED = ["order_id", "order_date", "sku", "quantity", "unit_price"]

MAX_CELL_LENGTH = 500
MAX_ROWS = 10_000
MAX_FILE_BYTES = 5 * 1024 * 1024  # 5 MB
PREVIEW_LIMIT = 10


@dataclass
class ValidationResult:
    csv_type: str
    detected_columns: list[str]
    required_columns: list[str]
    optional_columns_found: list[str]
    accepted_rows: list[dict[str, str]]
    rejected_rows: list[dict]  # each has rowNumber, data, errors
    warnings: list[str]
    total_rows: int = 0


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _normalize_header(h: str) -> str:
    """Lowercase and strip whitespace from a header."""
    return h.strip().lower()


def _truncate(value: str) -> str:
    """Truncate a cell value to MAX_CELL_LENGTH."""
    if len(value) > MAX_CELL_LENGTH:
        return value[:MAX_CELL_LENGTH]
    return value


def _detect_csv_type(
    normalized_headers: list[str],
) -> tuple[str, list[str]] | None:
    """Detect CSV type by checking which required column set is a subset.

    Returns (csv_type, required_columns) or None if no match.
    """
    inv_set = set(INVENTORY_SNAPSHOT_REQUIRED)
    sales_set = set(SALES_HISTORY_REQUIRED)
    header_set = set(normalized_headers)

    if inv_set.issubset(header_set):
        return ("inventory_snapshot", INVENTORY_SNAPSHOT_REQUIRED)
    if sales_set.issubset(header_set):
        return ("sales_history", SALES_HISTORY_REQUIRED)
    return None


# ---------------------------------------------------------------------------
# Field validators
# ---------------------------------------------------------------------------

def _validate_non_negative_int(value: str, field_name: str) -> list[str]:
    """Validate that value is a non-negative integer."""
    errors: list[str] = []
    stripped = value.strip()
    if not stripped:
        errors.append(f"{field_name} is required (empty value)")
        return errors
    try:
        n = int(stripped)
        if n < 0:
            errors.append(f"{field_name} must be >= 0, got {n}")
    except ValueError:
        errors.append(f"{field_name} must be a non-negative integer, got '{stripped}'")
    return errors


def _validate_positive_int(value: str, field_name: str) -> list[str]:
    """Validate that value is a positive integer (> 0)."""
    errors: list[str] = []
    stripped = value.strip()
    if not stripped:
        errors.append(f"{field_name} is required (empty value)")
        return errors
    try:
        n = int(stripped)
        if n <= 0:
            errors.append(f"{field_name} must be > 0, got {n}")
    except ValueError:
        errors.append(f"{field_name} must be a positive integer, got '{stripped}'")
    return errors


def _validate_non_negative_float(value: str, field_name: str) -> list[str]:
    """Validate that value is a non-negative float."""
    errors: list[str] = []
    stripped = value.strip()
    if not stripped:
        errors.append(f"{field_name} is required (empty value)")
        return errors
    try:
        n = float(stripped)
        if n < 0:
            errors.append(f"{field_name} must be >= 0, got {n}")
    except ValueError:
        errors.append(f"{field_name} must be a non-negative number, got '{stripped}'")
    return errors


def _validate_non_empty(value: str, field_name: str) -> list[str]:
    """Validate that value is not empty after trimming."""
    if not value.strip():
        return [f"{field_name} is required (empty value)"]
    return []


def _validate_iso_datetime(value: str, field_name: str) -> list[str]:
    """Validate that value is a parseable ISO 8601 datetime."""
    errors: list[str] = []
    stripped = value.strip()
    if not stripped:
        errors.append(f"{field_name} is required (empty value)")
        return errors
    try:
        datetime.fromisoformat(stripped.replace("Z", "+00:00"))
    except ValueError:
        errors.append(f"{field_name} must be a valid ISO 8601 datetime, got '{stripped}'")
    return errors


# Mapping from (csv_type, field_name) -> validator function
_VALIDATORS: dict[tuple[str, str], callable] = {
    # Inventory snapshot
    ("inventory_snapshot", "sku"): lambda v: _validate_non_empty(v, "sku"),
    ("inventory_snapshot", "name"): lambda v: _validate_non_empty(v, "name"),
    ("inventory_snapshot", "category"): lambda v: _validate_non_empty(v, "category"),
    ("inventory_snapshot", "available"): lambda v: _validate_non_negative_int(v, "available"),
    ("inventory_snapshot", "unit_cost"): lambda v: _validate_non_negative_float(v, "unit_cost"),
    # Sales history
    ("sales_history", "order_id"): lambda v: _validate_non_empty(v, "order_id"),
    ("sales_history", "order_date"): lambda v: _validate_iso_datetime(v, "order_date"),
    ("sales_history", "sku"): lambda v: _validate_non_empty(v, "sku"),
    ("sales_history", "quantity"): lambda v: _validate_positive_int(v, "quantity"),
    ("sales_history", "unit_price"): lambda v: _validate_non_negative_float(v, "unit_price"),
}


# ---------------------------------------------------------------------------
# Main validation function
# ---------------------------------------------------------------------------

def validate_csv(content: str) -> ValidationResult:
    """Parse and validate CSV content.

    Returns a ValidationResult with accepted rows, rejected rows,
    detected columns, and warnings. Never raises on bad data -
    all issues are captured in the result.

    Raises ValueError if the content cannot be parsed at all
    (e.g. empty file, no headers, unrecognized CSV type).
    """
    reader = csv.DictReader(io.StringIO(content))

    if reader.fieldnames is None:
        raise ValueError("CSV file is empty or has no headers")

    raw_headers = list(reader.fieldnames)
    normalized_headers = [_normalize_header(h) for h in raw_headers]
    warnings: list[str] = []

    # Report header trimming
    for raw, norm in zip(raw_headers, normalized_headers):
        if raw != norm and raw.strip().lower() == norm:
            warnings.append(
                f"Column '{raw}' had whitespace/casing differences (normalized to '{norm}')"
            )

    # Detect CSV type
    detection = _detect_csv_type(normalized_headers)
    if detection is None:
        inv_str = ", ".join(INVENTORY_SNAPSHOT_REQUIRED)
        sales_str = ", ".join(SALES_HISTORY_REQUIRED)
        det_str = ", ".join(normalized_headers)
        raise ValueError(
            f"Could not detect CSV type. "
            f"Required columns for inventory_snapshot: [{inv_str}]. "
            f"Required columns for sales_history: [{sales_str}]. "
            f"Detected columns: [{det_str}]"
        )

    csv_type, required_columns = detection

    # Identify optional (extra) columns
    required_set = set(required_columns)
    optional_found = [h for h in normalized_headers if h not in required_set]
    if optional_found:
        for col in optional_found:
            warnings.append(
                f"Column '{col}' is not a recognized required column for "
                f"{csv_type} - included as pass-through"
            )

    # Validate rows
    accepted: list[dict[str, str]] = []
    rejected: list[dict] = []
    total_rows = 0

    for row_idx, raw_row in enumerate(reader, start=2):  # row 1 is header
        total_rows += 1

        if total_rows > MAX_ROWS:
            warnings.append(
                f"CSV has more than {MAX_ROWS} rows. Only the first {MAX_ROWS} were processed."
            )
            break

        # Build normalized row dict with truncated values
        row: dict[str, str] = {}
        row_warnings_generated = False
        for raw_key, raw_val in raw_row.items():
            if raw_key is None or raw_val is None:
                continue
            norm_key = _normalize_header(raw_key)
            val = _truncate(raw_val)

            # Detect and report trimming on required fields
            if norm_key in required_set and raw_val != raw_val.strip():
                if not row_warnings_generated:
                    warnings.append(
                        f"Row {row_idx}: trailing/leading whitespace in '{norm_key}' was auto-trimmed"
                    )
                    row_warnings_generated = True

            row[norm_key] = val.strip()

        # Validate required fields
        row_errors: list[str] = []
        for col in required_columns:
            cell_value = row.get(col, "")
            validator = _VALIDATORS.get((csv_type, col))
            if validator:
                row_errors.extend(validator(cell_value))

        if row_errors:
            rejected.append({
                "row_number": row_idx,
                "data": row,
                "errors": row_errors,
            })
        else:
            accepted.append(row)

    return ValidationResult(
        csv_type=csv_type,
        detected_columns=normalized_headers,
        required_columns=required_columns,
        optional_columns_found=optional_found,
        accepted_rows=accepted,
        rejected_rows=rejected,
        warnings=warnings,
        total_rows=total_rows,
    )
