"""
PostgreSQL + PostGIS setup script for Cooperative Gig Platform.
Run this once after PostgreSQL 16 is installed.
Usage:
    python scripts/setup_postgres.py
"""

import subprocess
import sys
import os

# PostgreSQL install paths to check
PG_BIN_CANDIDATES = [
    r"C:\Program Files\PostgreSQL\16\bin",
    r"C:\Program Files\PostgreSQL\15\bin",
    r"C:\Program Files\PostgreSQL\17\bin",
]

def find_psql():
    for d in PG_BIN_CANDIDATES:
        psql = os.path.join(d, "psql.exe")
        if os.path.exists(psql):
            return d, psql
    # Try PATH
    import shutil
    p = shutil.which("psql")
    if p:
        return os.path.dirname(p), p
    return None, None

def run_psql(bin_dir, sql, user="postgres", db="postgres", extra_env=None):
    psql = os.path.join(bin_dir, "psql.exe")
    env = os.environ.copy()
    env["PGPASSWORD"] = "gig_password"
    if extra_env:
        env.update(extra_env)
    result = subprocess.run(
        [psql, "-U", user, "-d", db, "-c", sql, "-v", "ON_ERROR_STOP=1"],
        capture_output=True, text=True, env=env
    )
    return result

def main():
    print("=== Cooperative Gig Platform — PostgreSQL Setup ===\n")

    bin_dir, psql_path = find_psql()
    if not psql_path:
        print("ERROR: psql.exe not found. Is PostgreSQL 16 installed?")
        sys.exit(1)

    print(f"Found psql at: {psql_path}")

    # 1. Test superuser connection
    print("\n[1] Testing superuser (postgres) connection...")
    env = os.environ.copy()
    env["PGPASSWORD"] = "gig_password"
    result = subprocess.run(
        [psql_path, "-U", "postgres", "-c", "SELECT 1;"],
        capture_output=True, text=True, env=env
    )
    if result.returncode != 0:
        # Try without password (peer auth or trust)
        env["PGPASSWORD"] = ""
        result = subprocess.run(
            [psql_path, "-U", "postgres", "-c", "SELECT 1;"],
            capture_output=True, text=True, env=env
        )
    if result.returncode != 0:
        print(f"ERROR: Cannot connect as postgres superuser.\nstderr: {result.stderr}")
        print("\nTry setting PGPASSWORD env variable to the postgres superuser password.")
        sys.exit(1)
    print("  Connected as postgres superuser ✓")

    # 2. Create gig_user role
    print("\n[2] Creating gig_user role...")
    r = run_psql(bin_dir, "CREATE ROLE gig_user WITH LOGIN PASSWORD 'gig_password';")
    if r.returncode != 0 and "already exists" not in r.stderr:
        print(f"  Warning: {r.stderr.strip()}")
    else:
        print("  gig_user role created (or already exists) ✓")

    # 3. Create cooperative_gig database
    print("\n[3] Creating cooperative_gig database...")
    r = run_psql(bin_dir, "CREATE DATABASE cooperative_gig OWNER gig_user;")
    if r.returncode != 0 and "already exists" not in r.stderr:
        print(f"  Warning: {r.stderr.strip()}")
    else:
        print("  cooperative_gig database created (or already exists) ✓")

    # 4. Enable PostGIS
    print("\n[4] Enabling PostGIS extension...")
    r = run_psql(bin_dir, "CREATE EXTENSION IF NOT EXISTS postgis;", user="postgres", db="cooperative_gig")
    if r.returncode != 0:
        print(f"  WARNING: Could not enable PostGIS: {r.stderr.strip()}")
        print("  PostGIS may need to be installed separately via StackBuilder.")
    else:
        print("  PostGIS extension enabled ✓")

    # 5. Enable postgis_topology
    print("\n[5] Enabling postgis_topology extension...")
    r = run_psql(bin_dir, "CREATE EXTENSION IF NOT EXISTS postgis_topology;", user="postgres", db="cooperative_gig")
    if r.returncode != 0:
        print(f"  Note: postgis_topology not available: {r.stderr.strip()}")
    else:
        print("  postgis_topology extension enabled ✓")

    # 6. Grant privileges
    print("\n[6] Granting privileges to gig_user...")
    r = run_psql(bin_dir, "GRANT ALL PRIVILEGES ON DATABASE cooperative_gig TO gig_user;")
    if r.returncode != 0:
        print(f"  Warning: {r.stderr.strip()}")
    else:
        print("  Privileges granted ✓")

    # 7. Grant schema privileges
    r = run_psql(bin_dir, "GRANT ALL ON SCHEMA public TO gig_user;", user="postgres", db="cooperative_gig")
    if r.returncode == 0:
        print("  Schema privileges granted ✓")

    # 8. Verify PostGIS
    print("\n[7] Verifying PostGIS version...")
    r = run_psql(bin_dir, "SELECT PostGIS_Version();", user="gig_user", db="cooperative_gig",
                 extra_env={"PGPASSWORD": "gig_password"})
    if r.returncode == 0:
        print(f"  PostGIS version: {r.stdout.strip()}")
    else:
        print(f"  PostGIS not available: {r.stderr.strip()}")

    print("\n=== Setup Complete! ===")
    print("Database:   cooperative_gig")
    print("User:       gig_user")
    print("URL:        postgresql+asyncpg://gig_user:***@localhost:5432/cooperative_gig")
    print("\nNext step: Run alembic migrations with:")
    print("  alembic upgrade head")

if __name__ == "__main__":
    main()
