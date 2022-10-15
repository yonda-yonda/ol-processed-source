import {
  crossing,
  getWindow,
  adjustSize,
  normalize,
  rotate
} from "./utils";

it("crossing", () => {
  expect(crossing([
    0, 0, 10, 10
  ], [
    5, 5, 15, 15
  ])).toBeTruthy();
  expect(crossing([
    0, 0, 10, 10
  ], [
    5, 5, 9, 10
  ])).toBeTruthy();
  expect(crossing([
    0, 0, 10, 10
  ], [
    5, 5, 10, 9
  ])).toBeTruthy();
  expect(crossing([
    0, 0, 10, 10
  ], [
    0, 1, 5, 5
  ])).toBeTruthy();
  expect(crossing([
    0, 0, 10, 10
  ], [
    1, 0, 5, 5
  ])).toBeTruthy();
  expect(crossing([
    0, 0, 10, 10
  ], [
    2, 2, 6, 6
  ])).toBeTruthy();

  expect(crossing([
    5, 5, 9, 10
  ], [
    0, 0, 10, 10
  ])).toBeTruthy();
  expect(crossing([
    5, 5, 10, 9
  ], [
    0, 0, 10, 10
  ])).toBeTruthy();
  expect(crossing([
    0, 1, 5, 5
  ], [
    0, 0, 10, 10
  ])).toBeTruthy();
  expect(crossing([
    1, 0, 5, 5
  ], [
    0, 0, 10, 10
  ])).toBeTruthy();
  expect(crossing([
    0, 0, 10, 10
  ], [
    2, 2, 6, 6
  ])).toBeTruthy();
  expect(crossing([
    0, 0, 10, 10
  ], [
    11, 11, 15, 15
  ])).toBeFalsy();
  expect(crossing([
    11, 11, 15, 15
  ], [
    0, 0, 10, 10
  ])).toBeFalsy();
});


it("getWindow", () => {
  expect(getWindow([
    0, 0, 16, 16
  ], 0, 0, 0)).toEqual([0, 16, 16, 0]);
  expect(getWindow([
    0, 0, 16, 16
  ], 1, 0, 0)).toEqual([0, 16, 8, 8]);
  expect(getWindow([
    0, 0, 16, 16
  ], 1, 1, 1)).toEqual([8, 8, 16, 0]);
});

it("adjustSize", () => {
  expect(adjustSize([
    1024, 1024
  ], [
    1024, 1024
  ], 1024 ** 2 + 1, 1024 + 1, 1024 + 1, 256)).toEqual([
    [1024, 1024], [1024, 1024]
  ]);

  expect(adjustSize([
    2048, 1024
  ], [
    1440, 960
  ], 2048 ** 2, 1024, 1024 + 1, 256)).toEqual([
    [1024, 512], [720, 480]
  ]);
  expect(adjustSize([
    2048, 1024
  ], [
    1440, 960
  ], 2048 ** 2, 2048 + 1, 512, 256)).toEqual([
    [1024, 512], [720, 480]
  ]);
  expect(adjustSize([
    2048, 1024
  ], [
    1440, 960
  ], 1024 ** 2, 2048 + 1, 1024 + 1, 256)).toEqual([
    [1448, 724], [1018, 679]
  ]);

  expect(adjustSize([
    1024, 2048
  ], [
    960, 1440
  ], 128 ** 2, 1024 + 1, 2048 + 1, 256)).toEqual([
    [256, 512], [240, 360]
  ]);

  expect(adjustSize([
    1024, 2048
  ], [
    960, 1440
  ], 2048 ** 2, 1024 + 1, 1024, 256)).toEqual([
    [512, 1024], [480, 720]
  ]);
  expect(adjustSize([
    1024, 2048
  ], [
    960, 1440
  ], 2048 ** 2, 512, 2048 + 1, 256)).toEqual([
    [512, 1024], [480, 720]
  ]);
  expect(adjustSize([
    1024, 2048
  ], [
    960, 1440
  ], 1024 ** 2, 1024 + 1, 2048 + 1, 256)).toEqual([
    [724, 1448], [679, 1018]
  ]);

  expect(adjustSize([
    1024, 2048,
  ], [
    960, 1440
  ], 128 ** 2, 1024 + 1, 2048 + 1, 256)).toEqual([
    [256, 512], [240, 360]
  ]);
});

it("normalize", () => {
  expect(normalize(40, 0, 100)).toEqual(0.4);
  expect(normalize(-100, 0, 100)).toEqual(0);
  expect(normalize(500, 0, 100)).toEqual(1);
});

it("rotate", () => {
  expect(rotate(
    [7304, 8000],
    [8.92997575301205, -4.500614786418409, 0, 389511.2734, -4.500614912499997, -8.929975724999965, 0, 7697141.2062, 0, 0, 0, 0, 0, 0, 0, 1])
  ).toEqual([
    [
      353506.35510865273,
      7592828.9090791,
      454735.8163,
      7697141.2062,
    ],
    -0.466834183343637
  ]);
});