-- Migration: Service areas table and seed data
-- Date: 2026-01-22
-- Description: Creates service_areas table and seeds El Dorado and OKC zip codes

CREATE TABLE IF NOT EXISTS service_areas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  zip_code TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  region TEXT NOT NULL CHECK(region IN ('el-dorado', 'okc')),
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_service_areas_zip ON service_areas(zip_code);
CREATE INDEX IF NOT EXISTS idx_service_areas_region ON service_areas(region);
CREATE INDEX IF NOT EXISTS idx_service_areas_active ON service_areas(is_active);

-- Seed El Dorado, AR region zip codes
INSERT OR IGNORE INTO service_areas (zip_code, city, state, region) VALUES
  ('71730', 'El Dorado', 'AR', 'el-dorado'),
  ('71731', 'El Dorado', 'AR', 'el-dorado'),
  ('71752', 'Magnolia', 'AR', 'el-dorado'),
  ('71753', 'Magnolia', 'AR', 'el-dorado'),
  ('71701', 'Camden', 'AR', 'el-dorado'),
  ('71720', 'Bearden', 'AR', 'el-dorado'),
  ('71740', 'Emerson', 'AR', 'el-dorado'),
  ('71743', 'Gurdon', 'AR', 'el-dorado'),
  ('71744', 'Hampton', 'AR', 'el-dorado'),
  ('71747', 'Huttig', 'AR', 'el-dorado'),
  ('71748', 'Ivan', 'AR', 'el-dorado'),
  ('71749', 'Junction City', 'AR', 'el-dorado'),
  ('71758', 'Norphlet', 'AR', 'el-dorado'),
  ('71762', 'Smackover', 'AR', 'el-dorado'),
  ('71764', 'Stephens', 'AR', 'el-dorado'),
  ('71765', 'Strong', 'AR', 'el-dorado'),
  ('71766', 'Taylor', 'AR', 'el-dorado');

-- Seed Oklahoma City region zip codes
INSERT OR IGNORE INTO service_areas (zip_code, city, state, region) VALUES
  ('73101', 'Oklahoma City', 'OK', 'okc'),
  ('73102', 'Oklahoma City', 'OK', 'okc'),
  ('73103', 'Oklahoma City', 'OK', 'okc'),
  ('73104', 'Oklahoma City', 'OK', 'okc'),
  ('73105', 'Oklahoma City', 'OK', 'okc'),
  ('73106', 'Oklahoma City', 'OK', 'okc'),
  ('73107', 'Oklahoma City', 'OK', 'okc'),
  ('73108', 'Oklahoma City', 'OK', 'okc'),
  ('73109', 'Oklahoma City', 'OK', 'okc'),
  ('73110', 'Midwest City', 'OK', 'okc'),
  ('73111', 'Oklahoma City', 'OK', 'okc'),
  ('73112', 'Oklahoma City', 'OK', 'okc'),
  ('73114', 'Oklahoma City', 'OK', 'okc'),
  ('73115', 'Oklahoma City', 'OK', 'okc'),
  ('73116', 'Oklahoma City', 'OK', 'okc'),
  ('73117', 'Oklahoma City', 'OK', 'okc'),
  ('73118', 'Oklahoma City', 'OK', 'okc'),
  ('73119', 'Oklahoma City', 'OK', 'okc'),
  ('73120', 'Oklahoma City', 'OK', 'okc'),
  ('73121', 'Oklahoma City', 'OK', 'okc'),
  ('73122', 'Oklahoma City', 'OK', 'okc'),
  ('73127', 'Oklahoma City', 'OK', 'okc'),
  ('73128', 'Oklahoma City', 'OK', 'okc'),
  ('73129', 'Oklahoma City', 'OK', 'okc'),
  ('73130', 'Oklahoma City', 'OK', 'okc'),
  ('73132', 'Oklahoma City', 'OK', 'okc'),
  ('73134', 'Oklahoma City', 'OK', 'okc'),
  ('73135', 'Oklahoma City', 'OK', 'okc'),
  ('73139', 'Oklahoma City', 'OK', 'okc'),
  ('73141', 'Oklahoma City', 'OK', 'okc'),
  ('73142', 'Oklahoma City', 'OK', 'okc'),
  ('73145', 'Oklahoma City', 'OK', 'okc'),
  ('73149', 'Oklahoma City', 'OK', 'okc'),
  ('73150', 'Oklahoma City', 'OK', 'okc'),
  ('73159', 'Oklahoma City', 'OK', 'okc'),
  ('73160', 'Moore', 'OK', 'okc'),
  ('73162', 'Oklahoma City', 'OK', 'okc'),
  ('73165', 'Oklahoma City', 'OK', 'okc'),
  ('73170', 'Oklahoma City', 'OK', 'okc'),
  ('73173', 'Oklahoma City', 'OK', 'okc'),
  ('73013', 'Edmond', 'OK', 'okc'),
  ('73003', 'Edmond', 'OK', 'okc'),
  ('73034', 'Edmond', 'OK', 'okc'),
  ('73012', 'Edmond', 'OK', 'okc'),
  ('73025', 'Edmond', 'OK', 'okc'),
  ('73064', 'Mustang', 'OK', 'okc'),
  ('73069', 'Norman', 'OK', 'okc'),
  ('73071', 'Norman', 'OK', 'okc'),
  ('73072', 'Norman', 'OK', 'okc'),
  ('73099', 'Yukon', 'OK', 'okc');
