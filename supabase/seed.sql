CREATE TABLE IF NOT EXISTS tours (
  id bigint generated always as identity primary key,
  title text not null,
  category text,
  duration text,
  rating text,
  price numeric,
  discount text,
  image_url text,
  badge text,
  status text default 'Active',
  created_at timestamptz default now()
);

INSERT INTO tours (title, duration, rating, price, discount) VALUES ('Nobile Life Camp: Desert Safari + VIP Dinner + Live show + Transfers','6h','4.6 (10)',971,NULL);
INSERT INTO tours (title, duration, rating, price, discount) VALUES ('Sunset Desert Safari: Quad Bike, Sandboarding, Camel Ride + BBQ Dinner','7h','4.3 (95)',324,'30% OFF');
INSERT INTO tours (title, duration, rating, price, discount) VALUES ('Dubai: Premium Desert Safari Activities','5h - 7h','5.0 (21)',530,NULL);
INSERT INTO tours (title, duration, rating, price, discount) VALUES ('Dubai: Desert Safari Activities','1h - 4h','4.7 (100)',91,NULL);
INSERT INTO tours (title, duration, rating, price, discount) VALUES ('Dubai: Morning Desert Safari Activities','4h - 5h','4.7 (300)',101,NULL);
INSERT INTO tours (title, duration, rating, price, discount) VALUES ('Dubai: Guided Luxury Desert Safari + Breakfast + Transfers','5h',NULL,2415,NULL);
INSERT INTO tours (title, duration, rating, price, discount) VALUES ('Burj Khalifa + Desert Safari (Attraction Pass)','','4.6 (100)',256,'15% OFF');
INSERT INTO tours (title, duration, rating, price, discount) VALUES ('Premium Desert Safari: Camel Ride, Falconry and BBQ Dinner at Al Khayma Camp','7h','4.8 (384)',351,NULL);
INSERT INTO tours (title, duration, rating, price, discount) VALUES ('Dubai Royal Desert Fortress: Safari by Land Cruiser','6h','4.6 (39)',599,'5% OFF');
INSERT INTO tours (title, duration, rating, price, discount) VALUES ('Dubai: Sunset Desert Safari, Dune Bashing & Sandboarding + BBQ Dinner','7h','4.4 (648)',106,'56% OFF');
INSERT INTO tours (title, duration, rating, price, discount) VALUES ('Dubai: Evening Desert Safari Activities','6h - 7h','4.7 (310)',99,'24% OFF');
INSERT INTO tours (title, duration, rating, price, discount) VALUES ('Dubai Desert Safari: Sandboarding, Dune Bashing and BBQ Dinner','6h','4.4 (511)',103,'50% OFF');
INSERT INTO tours (title, duration, rating, price, discount) VALUES ('Dubai: Premium Sunset Safari, Quad Bike, Sandboard + BBQ Dinner','7h','4.7 (108)',277,NULL);
INSERT INTO tours (title, duration, rating, price, discount) VALUES ('Dubai: Budget Desert Safari Activities','6h - 7h','4.0 (84)',70,NULL);
INSERT INTO tours (title, duration, rating, price, discount) VALUES ('Hatta Safari from Dubai: Dam, Heritage Village, Honey Garden & Breakfast','6h','5.0 (5)',332,NULL);
INSERT INTO tours (title, duration, rating, price, discount) VALUES ('Dune Buggy & Private Dinner in the Dunes in Mleiha National Park','5h',NULL,3422,NULL);
INSERT INTO tours (title, duration, rating, price, discount) VALUES ('Dubai: Morning City Tour & Evening Desert Safari Combo','9h',NULL,252,NULL);
INSERT INTO tours (title, duration, rating, price, discount) VALUES ('Noble Life Camp: Desert Safari + Live Show + Dinner + Transfers','7h 30m',NULL,1303,NULL);
INSERT INTO tours (title, duration, rating, price, discount) VALUES ('Dubai: Guided Camel Desert Safari + Dinner + Transfers + Falcon Show','7h',NULL,800,NULL);
INSERT INTO tours (title, duration, rating, price, discount) VALUES ('Dubai: Guided Luxury Desert Safari + Falconry Show + Dinner + Transfers','7h',NULL,1962,NULL);
INSERT INTO tours (title, duration, rating, price, discount) VALUES ('Dubai: Desert Safari + Guided Tour','10h - 12h','4.7 (9)',352,NULL);
INSERT INTO tours (title, duration, rating, price, discount) VALUES ('Dubai: Private or Shared Lahbab Desert Morning Safari + Transfers + Camel Ride','4h','New',121,NULL);
INSERT INTO tours (title, duration, rating, price, discount) VALUES ('Dubai: Private or Shared Lahbab Desert Safari + Hotel Transfers + BBQ Dinner','7h','New',171,NULL);
INSERT INTO tours (title, duration, rating, price, discount) VALUES ('Dubai: Fort Lisaili with Camel Ride, BBQ Dinner, Live Shows & Hotel Transfer','6h','3.5 (6)',0,'Temporarily unavailable');

-- RLS policies for anon access (adjust for production)
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tours_select_all" ON tours FOR SELECT USING (true);
CREATE POLICY "tours_insert_all" ON tours FOR INSERT WITH CHECK (true);
CREATE POLICY "tours_update_all" ON tours FOR UPDATE USING (true);
CREATE POLICY "tours_delete_all" ON tours FOR DELETE USING (true);

CREATE TABLE IF NOT EXISTS categories (
  id bigint generated always as identity primary key,
  name text not null,
  created_at timestamptz default now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_select_all" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_insert_all" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "categories_update_all" ON categories FOR UPDATE USING (true);
CREATE POLICY "categories_delete_all" ON categories FOR DELETE USING (true);

INSERT INTO categories (name) VALUES ('Desert Safaris'),('City Tours'),('Water Parks'),('Attractions'),('Cruise & Boat Tours');

INSERT INTO categories (name) VALUES ('ATV') ON CONFLICT DO NOTHING;

INSERT INTO categories (name) VALUES ('Private Safari Camp');

ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url text;

UPDATE tours SET category='Desert Safaris' WHERE category IS NULL;
