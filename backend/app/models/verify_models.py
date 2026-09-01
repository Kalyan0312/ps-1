import sys
from pathlib import Path

# Add root directory to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
sys.path.insert(0, str(ROOT_DIR))

from app.core.database import Base
import app.models as models

def main():
    tables = list(Base.metadata.tables.keys())
    print(f"Total registered SQLAlchemy tables: {len(tables)}")
    for i, t in enumerate(sorted(tables), 1):
        table_obj = Base.metadata.tables[t]
        cols = len(table_obj.columns)
        fks = len(table_obj.foreign_keys)
        indexes = len(table_obj.indexes)
        print(f"  {i:2d}. {t:<25} | Columns: {cols:2d} | Foreign Keys: {fks:2d} | Indexes: {indexes:2d}")

    expected_tables = [
        "users", "worker_profiles", "customer_profiles", "admin_profiles",
        "cooperatives", "service_categories", "worker_skills", "worker_documents",
        "worker_availabilities", "bookings", "payments", "invoices", "price_rules",
        "welfare_contributions", "welfare_claims", "ratings", "grievances",
        "sos_alerts", "notifications", "locations"
    ]

    missing = [t for t in expected_tables if t not in tables]
    if missing:
        print(f"\nERROR: Missing expected tables: {missing}")
        sys.exit(1)
    else:
        print(f"\nSUCCESS: All {len(expected_tables)} required models successfully defined and validated in Base.metadata!")

if __name__ == "__main__":
    main()
