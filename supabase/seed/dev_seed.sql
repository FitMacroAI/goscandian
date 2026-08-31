insert into public.business_categories (name, slug) values
  ('Pantry', 'pantry'),
  ('Home Goods', 'home-goods'),
  ('Personal Care', 'personal-care'),
  ('Coffee', 'coffee'),
  ('Apparel', 'apparel'),
  ('Pets', 'pets'),
  ('Outdoor', 'outdoor'),
  ('Gifts', 'gifts')
on conflict do nothing;

insert into public.product_categories (name, slug) values
  ('Snacks', 'snacks'),
  ('Beverages', 'beverages'),
  ('Cleaning', 'cleaning'),
  ('Skincare', 'skincare'),
  ('Clothing', 'clothing'),
  ('Pet Food', 'pet-food'),
  ('Camping', 'camping'),
  ('Pantry Staples', 'pantry-staples')
on conflict do nothing;

insert into public.businesses
  (slug, name, description, story, city, province, website_url, ownership_status, small_business, verification_status, confidence, last_verified_at)
values
  ('northern-larder-test', 'Northern Larder Test Kitchen', 'Fictional small-batch pantry maker.', 'A development fixture for testing story cards and evidence flows.', 'Kingston', 'ON', 'https://example.com/northern-larder', 'canadian_owned', true, 'verified', 'high', '2026-08-30'),
  ('west-coast-home-test', 'West Coast Home Test Goods', 'Fictional reusable home goods studio.', 'A development fixture for testing British Columbia discovery.', 'Victoria', 'BC', 'https://example.com/west-coast-home', 'canadian_owned', true, 'verified', 'medium', '2026-08-30'),
  ('prairie-roast-test', 'Prairie Roast Test Co.', 'Fictional coffee roaster.', 'A development fixture for coffee products and alternatives.', 'Regina', 'SK', 'https://example.com/prairie-roast', 'partially_canadian_owned', true, 'verified', 'medium', '2026-08-30'),
  ('maritime-care-test', 'Maritime Care Test Studio', 'Fictional personal care brand.', 'A development fixture for personal care submissions.', 'Halifax', 'NS', 'https://example.com/maritime-care', 'unknown', true, 'needs_review', 'unknown', null),
  ('laurentian-threads-test', 'Laurentian Threads Test Label', 'Fictional apparel workshop.', 'A development fixture for designed-in-Canada scenarios.', 'Montreal', 'QC', 'https://example.com/laurentian-threads', 'canadian_owned', true, 'verified', 'high', '2026-08-30'),
  ('boreal-pet-test', 'Boreal Pet Test Foods', 'Fictional pet food maker.', 'A development fixture for product of Canada scenarios.', 'Winnipeg', 'MB', 'https://example.com/boreal-pet', 'canadian_owned', true, 'verified', 'high', '2026-08-30'),
  ('rocky-trail-test', 'Rocky Trail Test Supply', 'Fictional outdoor supply shop.', 'A development fixture for imported Canadian brand products.', 'Canmore', 'AB', 'https://example.com/rocky-trail', 'canadian_owned', true, 'verified', 'medium', '2026-08-30'),
  ('bay-gift-test', 'Bay Gift Test House', 'Fictional gift maker.', 'A development fixture for unknown verification states.', 'Charlottetown', 'PE', 'https://example.com/bay-gift', 'unknown', true, 'needs_review', 'unknown', null),
  ('northline-market-test', 'Northline Market Test', 'Fictional local market.', 'A development fixture for businesses with mixed products.', 'Yellowknife', 'NT', 'https://example.com/northline-market', 'canadian_owned', true, 'verified', 'medium', '2026-08-30'),
  ('fundy-soap-test', 'Fundy Soap Test Works', 'Fictional soap maker.', 'A development fixture for New Brunswick discovery.', 'Saint John', 'NB', 'https://example.com/fundy-soap', 'canadian_owned', true, 'verified', 'high', '2026-08-30'),
  ('avalon-bakes-test', 'Avalon Bakes Test Co.', 'Fictional bakery brand.', 'A development fixture for Newfoundland and Labrador records.', 'St. John''s', 'NL', 'https://example.com/avalon-bakes', 'canadian_owned', true, 'verified', 'medium', '2026-08-30'),
  ('yukon-pack-test', 'Yukon Pack Test Outfitters', 'Fictional bag maker.', 'A development fixture for disputed product status.', 'Whitehorse', 'YT', 'https://example.com/yukon-pack', 'canadian_owned', true, 'disputed', 'low', '2026-08-30')
on conflict do nothing;

insert into public.products
  (barcode, name, brand_name, description, canada_status, manufacturing_country, verification_status, confidence, last_verified_at)
select
  lpad((100000000000 + row_number() over())::text, 12, '0'),
  'Development Product ' || row_number() over(),
  b.name,
  'Fictional product fixture for MVP development.',
  (array['product_of_canada','made_in_canada','manufactured_in_canada','designed_in_canada','canadian_brand_imported','not_canadian','unknown'])[1 + ((row_number() over() - 1) % 7)]::public.canada_product_status,
  case when (row_number() over() % 7) in (1,2,3) then 'Canada' else null end,
  case when row_number() over() % 10 = 0 then 'disputed' else 'verified' end::public.verification_status,
  (array['high','medium','low','unknown'])[1 + ((row_number() over() - 1) % 4)]::public.confidence_level,
  case when row_number() over() % 4 = 0 then null else '2026-08-30'::date end
from public.businesses b
cross join generate_series(1, 3)
limit 30
on conflict do nothing;

insert into public.feed_items (business_id, headline, body, media_url, sort_weight, published)
select id, name, coalesce(story, description, 'Development story fixture.'), hero_media_url, 10, true
from public.businesses
limit 12
on conflict do nothing;
