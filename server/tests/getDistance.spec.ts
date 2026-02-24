import { getDistance } from "../src/utils/getDistance";

describe("getDistance", () => {
  const paris = { lat: 48.8566, lng: 2.3522 };
  const london = { lat: 51.5074, lng: -0.1278 };
  const newYork = { lat: 40.7128, lng: -74.006 };

  test("should return 0 when points are identical", () => {
    const distance = getDistance(paris, paris);
    expect(distance).toBeCloseTo(0);
  });

  test("should calculate correct distance between Paris and London (~343 km)", () => {
    const distance = getDistance(paris, london);

    expect(distance).toBeCloseTo(343, 0);
  });

  test("should calculate correct distance between Paris and New York (~5837 km)", () => {
    const distance = getDistance(paris, newYork);

    expect(distance).toBeCloseTo(5837, -2); 
  });

  test("distance should always be positive", () => {
    const distance = getDistance(london, paris);
    expect(distance).toBeGreaterThan(0);
  });

  test("distance should be symmetric", () => {
    const d1 = getDistance(paris, london);
    const d2 = getDistance(london, paris);

    expect(d1).toBeCloseTo(d2);
  });
});