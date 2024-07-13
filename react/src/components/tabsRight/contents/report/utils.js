import { makeStyles } from '@material-ui/core/styles';

//get the Edit Image List from the row and col
export const getImageList = (tiles, row, col) => {
  const lists = [];
  const tempList = [];
  if (tiles && row !== undefined && col !== undefined) {
    if (tiles.length > 0) {
      if (
        tiles[0].row !== undefined &&
        tiles[0].col !== undefined &&
        tiles[0].row !== '' &&
        tiles[0].col !== ''
      ) {
        tiles.map((tile) => {
          tempList.push({
            row: Number(tile.row),
            col: Number(tile.col),
          });
          if (Number(tile.row) === row && Number(tile.col) === col) {
            lists.push(tile);
          }
        });
      } else return tiles;
    }
  }
  return lists;
};

export const useStyles = makeStyles(() => ({
  select: {
    '&:before': {
      borderColor: 'white',
    },
    '&:after': {
      borderColor: 'white',
    },
    '&:hover:not(.Mui-disabled):before': {
      borderColor: 'white',
    },
  },
}));

//Get the MaxRow, MaxCol, and VesselType
export const getVesselType = (items) => {
  let maxRow = 0;
  let maxCol = 0;

  if (!items) {
    return 1;
  }

  items.forEach((tile) => {
    let row = tile.row;
    if (maxRow < row) maxRow = row;
    if (maxCol < Number(tile.col)) maxCol = Number(tile.col);
  });

  let series = items[0].series;

  if (series === '' || series === undefined) {
    return 1;
  }

  if (series.includes('Slide')) {
    if (maxRow + 1 === 1 && maxCol === 1) {
      return 1;
    }
    if (maxRow + 1 === 1 && maxCol === 2) {
      return 2;
    }
    if (maxRow + 1 === 1 && maxCol === 4) {
      return 4;
    }
  } else if (series.includes('Plate')) {
    if (maxRow + 1 === 2 && maxCol === 2) {
      return 7;
    }
    if (maxRow + 1 === 2 && maxCol === 3) {
      return 8;
    }
    if (maxRow + 1 === 3 && maxCol === 4) {
      return 9;
    }
    if (maxRow + 1 === 4 && maxCol === 6) {
      return 10;
    }
    if (maxRow + 1 === 6 && maxCol === 8) {
      return 11;
    }
    if (maxRow + 1 === 8 && maxCol === 12) {
      return 12;
    }
    if (maxRow + 1 === 16 && maxCol === 24) {
      return 13;
    }
  } else {
    return 14;
  }

  return 1;
};

export const kMeans = (data, k = 1) => {
  const centroids = data.slice(0, k);
  const distances = Array.from({ length: data.length }, () =>
    Array.from({ length: k }, () => 0),
  );
  const classes = Array.from({ length: data.length }, () => -1);
  let itr = true;

  while (itr) {
    itr = false;

    for (let d in data) {
      for (let c = 0; c < k; c++) {
        distances[d][c] = Math.hypot(
          ...Object.keys(data[0]).map(
            (key) => data[d][key] - centroids[c][key],
          ),
        );
      }
      const m = distances[d].indexOf(Math.min(...distances[d]));
      if (classes[d] !== m) itr = true;
      classes[d] = m;
    }

    for (let c = 0; c < k; c++) {
      centroids[c] = Array.from({ length: data[0].length }, () => 0);
      const size = data.reduce((acc, _, d) => {
        if (classes[d] === c) {
          acc++;
          for (let i in data[0]) centroids[c][i] += data[d][i];
        }
        return acc;
      }, 0);
      for (let i in data[0]) {
        centroids[c][i] = parseFloat(Number(centroids[c][i] / size).toFixed(2));
      }
    }
  }

  return classes;
};
