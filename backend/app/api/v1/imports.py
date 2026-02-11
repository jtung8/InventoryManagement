"""CSV import/upload endpoint."""

from fastapi import APIRouter, HTTPException, UploadFile

from app.schemas.imports import ImportResult, RejectedRow
from app.services.csv_validator import MAX_FILE_BYTES, PREVIEW_LIMIT, validate_csv
from app.services.seed_data import store_uploaded_rows

router = APIRouter(prefix="/imports", tags=["imports"])


@router.post("/upload", response_model=ImportResult)
async def upload_csv(file: UploadFile) -> ImportResult:
    """Upload and validate a CSV file.

    Accepts inventory_snapshot or sales_history CSVs.
    Returns validation results including accepted/rejected counts,
    per-row errors, detected columns, and warnings.

    No data is persisted to a database in this phase.
    TODO: Persist accepted rows to DB (Phase 1, Step 6).
    """
    # Validate content type (basic check - also accept octet-stream
    # since some clients send that for .csv files)
    if file.content_type and file.content_type not in (
        "text/csv",
        "application/vnd.ms-excel",
        "application/octet-stream",
        "text/plain",
    ):
        raise HTTPException(
            status_code=400,
            detail=f"Expected a CSV file, got content type '{file.content_type}'",
        )

    # Read file with size guard
    raw_bytes = await file.read()
    if len(raw_bytes) > MAX_FILE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({len(raw_bytes)} bytes). Maximum is {MAX_FILE_BYTES} bytes (5 MB).",
        )

    # Decode to string
    try:
        content = raw_bytes.decode("utf-8")
    except UnicodeDecodeError:
        try:
            content = raw_bytes.decode("latin-1")
        except UnicodeDecodeError:
            raise HTTPException(
                status_code=400,
                detail="Could not decode file. Please upload a UTF-8 or Latin-1 encoded CSV.",
            )

    # Validate CSV
    try:
        result = validate_csv(content)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    # Build response
    rejected = [
        RejectedRow(
            row_number=r["row_number"],
            data=r["data"],
            errors=r["errors"],
        )
        for r in result.rejected_rows
    ]

    # Store accepted rows in memory so dashboard/products endpoints
    # can serve uploaded data instead of seed data.
    # TODO: Replace with DB persistence (Phase 1, Step 6).
    if result.accepted_rows:
        store_uploaded_rows(result.csv_type, result.accepted_rows)

    return ImportResult(
        csv_type=result.csv_type,
        detected_columns=result.detected_columns,
        required_columns=result.required_columns,
        optional_columns_found=result.optional_columns_found,
        total_rows=result.total_rows,
        accepted_count=len(result.accepted_rows),
        rejected_count=len(result.rejected_rows),
        warnings=result.warnings,
        accepted_preview=result.accepted_rows[:PREVIEW_LIMIT],
        rejected_rows=rejected,
    )
