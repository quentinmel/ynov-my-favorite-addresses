/// <reference types="jest" />
import { map } from "./map";

describe("map", () => {
  it("should call the transformation function the correct number of times with correct parameters", () => {
    const items = [1, 2, 3];
    const spyFn = jest.fn((x: number) => x * 2);

    const result = map(items, spyFn);

    // Vérifie que la fonction est appelée le bon nombre de fois
    expect(spyFn).toHaveBeenCalledTimes(3);

    // Vérifie que chaque appel a reçu le bon paramètre
    expect(spyFn).toHaveBeenNthCalledWith(1, 1);
    expect(spyFn).toHaveBeenNthCalledWith(2, 2);
    expect(spyFn).toHaveBeenNthCalledWith(3, 3);

    // Vérifie le résultat
    expect(result).toEqual([2, 4, 6]);
  });

  it("should return an empty array when given an empty array", () => {
    const spyFn = jest.fn();
    const result = map([], spyFn);

    expect(spyFn).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});
