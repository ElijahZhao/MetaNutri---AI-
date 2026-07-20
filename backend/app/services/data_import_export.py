import csv
import json
import pandas as pd
from io import StringIO, BytesIO
from typing import Dict, List, Any, Optional
from datetime import datetime

class DataExporter:
    @staticmethod
    def export_to_csv(data: List[Dict[str, Any]], filename: str = None) -> str:
        if not data:
            return ""
        
        headers = data[0].keys()
        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=headers)
        writer.writeheader()
        writer.writerows(data)
        
        return output.getvalue()

    @staticmethod
    def export_to_json(data: List[Dict[str, Any]], filename: str = None) -> str:
        return json.dumps(data, indent=2, default=str)

    @staticmethod
    def export_to_excel(data: List[Dict[str, Any]], filename: str = "export.xlsx") -> BytesIO:
        df = pd.DataFrame(data)
        output = BytesIO()
        df.to_excel(output, index=False)
        output.seek(0)
        return output

class DataImporter:
    @staticmethod
    def import_from_csv(csv_content: str) -> List[Dict[str, Any]]:
        reader = csv.DictReader(StringIO(csv_content))
        return list(reader)

    @staticmethod
    def import_from_json(json_content: str) -> List[Dict[str, Any]]:
        return json.loads(json_content)

    @staticmethod
    def import_from_excel(excel_bytes: bytes) -> List[Dict[str, Any]]:
        df = pd.read_excel(BytesIO(excel_bytes))
        return df.to_dict("records")

def sanitize_data(data: Dict[str, Any]) -> Dict[str, Any]:
    sanitized = {}
    for key, value in data.items():
        if isinstance(value, datetime):
            sanitized[key] = value.isoformat()
        elif isinstance(value, (int, float, str, bool)) or value is None:
            sanitized[key] = value
        else:
            sanitized[key] = str(value)
    return sanitized

def convert_data_format(data: List[Dict[str, Any]], output_format: str) -> str:
    if output_format == "csv":
        return DataExporter.export_to_csv(data)
    elif output_format == "json":
        return DataExporter.export_to_json(data)
    elif output_format == "xlsx":
        return DataExporter.export_to_excel(data)
    else:
        raise ValueError(f"Unsupported format: {output_format}")

def validate_data(data: List[Dict[str, Any]], required_fields: List[str] = None) -> Dict[str, Any]:
    errors = []
    valid_records = []
    
    for i, record in enumerate(data):
        record_errors = []
        
        if required_fields:
            for field in required_fields:
                if field not in record or record[field] is None or record[field] == "":
                    record_errors.append(f"Missing required field: {field}")
        
        if record_errors:
            errors.append({"row": i + 1, "errors": record_errors})
        else:
            valid_records.append(record)
    
    return {
        "valid": valid_records,
        "invalid": len(data) - len(valid_records),
        "errors": errors,
        "total": len(data),
        "success_rate": len(valid_records) / len(data) if data else 0
    }