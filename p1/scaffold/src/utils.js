import {lab} from 'd3-color';

export function findMinMax(data, accessorKey) {
  const stats = {min: Infinity, max: -Infinity};

  return data.reduce((acc, d) => {
    if (d[accessorKey] > acc.max) {
      acc.max = d[accessorKey];
    }
    if (d[accessorKey] < acc.min) {
      acc.min = d[accessorKey];
    }
    return acc;
  }, stats);
}

export function findCountyColor(countyID, data, snapScale, housingScale) {
  if (countyID in data) {

    const lightScale = 10;
    const blueScale = 40;
    const countyData = data[countyID];
    const snapRating = 5 - snapScale(countyData[0]);
    const housingRating = (housingScale(countyData[1]));

    const ls = lightScale * snapRating;
    const bs = blueScale * (snapRating);
    const lh = lightScale * housingRating;
    const bh = -1 * blueScale * (housingRating);
    const eqs = bs + bh;

    if (eqs !== 0 && (ls + lh < 75)) {
      return lab(ls + lh + 20, 0, bs + bh);
    }
    return lab(ls + lh + 20, 0, bs + bh);

  }
  // green if missing data
  return lab(50, -160, 0);
}
