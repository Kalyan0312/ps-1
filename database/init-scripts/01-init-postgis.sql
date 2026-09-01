-- Enable PostGIS spatial extensions for Cooperative Gig Platform
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verification query
SELECT PostGIS_Full_Version();
