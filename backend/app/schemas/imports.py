"""Pydantic models for the CSV import endpoint."""

from pydantic import BaseModel, ConfigDict, Field


class RejectedRow(BaseModel):
    """A single row that failed validation."""

    model_config = ConfigDict(populate_by_name=True)

    row_number: int = Field(alias="rowNumber")
    data: dict[str, str]
    errors: list[str]


class ImportResult(BaseModel):
    """Response from POST /api/v1/imports/upload.

    Designed to be fully transparent: every field tells the caller
    what was detected, what was expected, and what happened.
    """

    model_config = ConfigDict(populate_by_name=True)

    csv_type: str = Field(alias="csvType")
    detected_columns: list[str] = Field(alias="detectedColumns")
    required_columns: list[str] = Field(alias="requiredColumns")
    optional_columns_found: list[str] = Field(alias="optionalColumnsFound")
    total_rows: int = Field(alias="totalRows")
    accepted_count: int = Field(alias="acceptedCount")
    rejected_count: int = Field(alias="rejectedCount")
    warnings: list[str]
    accepted_preview: list[dict[str, str]] = Field(alias="acceptedPreview")
    rejected_rows: list[RejectedRow] = Field(alias="rejectedRows")
