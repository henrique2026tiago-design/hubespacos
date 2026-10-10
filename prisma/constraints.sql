-- Incorporar à migration inicial antes de aplicá-la.
-- Restrição de sobreposição funciona mesmo com requisições simultâneas.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Space"
  ADD CONSTRAINT "Space_capacity_positive" CHECK ("capacity" > 0),
  ADD CONSTRAINT "Space_prices_valid"
    CHECK ("pricePerHour" > 0 AND "pricePeakHour" >= "pricePerHour");

ALTER TABLE "Reservation"
  ADD CONSTRAINT "Reservation_time_order" CHECK ("endTime" > "startTime"),
  ADD CONSTRAINT "Reservation_price_positive" CHECK ("totalPrice" > 0),
  ADD CONSTRAINT "Reservation_no_overlap"
    EXCLUDE USING gist (
      "spaceId" WITH =,
      tsrange("date" + "startTime", "date" + "endTime", '[)') WITH &&
    )
    WHERE ("status" IN ('PENDING', 'CONFIRMED'));
