import mainApiService from '@/services/mainApiService';

export const getImageByPath = async (path) => {
  const blob = await mainApiService.get(`${path}`, {
    responseType: 'blob',
  });
  const file = new File([blob], path, { type: 'image/tiff' });
  file.path = path;
  return file;
};

//Get the image of ome tiff file extension from the original url
export const getOmeTiffUrl = (url) => {
  let tempUrl = url;
  const ext = url.split('.').pop();
  if (ext !== 'tiff' && ext !== 'tif') {
    const newExtension = 'ome.tiff';
    tempUrl = url.replace(/\.[^/.]+$/, `.${newExtension}`);
  }

  const serverUrl = tempUrl.split('static')[0];
  const path = tempUrl.split('static')[1];

  const newUrl = serverUrl + `image/download/?path=${path}`;

  return newUrl;
};

//calculate the suitable col and row number
export const calculateSuitableDim = (size) => {
  let col = 1;
  let row = size;

  for (let i = 1; i * i <= size; i++) {
    if (size % i === 0) {
      col = i;
      row = size / i;
    }
  }

  return [col, row];
};

//get the images from tiles, row and col
export const getImageListFromCertainTiles = (tiles, row, col) => {
  const lists = [];
  const tempList = [];
  //console.log(tiles);
  if (tiles) {
    if (tiles.length > 0) {
      if (
        tiles[0].row !== undefined &&
        tiles[0].col !== undefined &&
        tiles[0].row !== '' &&
        tiles[0].col !== ''
      ) {
        tiles.map((tile) => {
          tempList.push({
            row: Number(
              typeof tile.row == 'number'
                ? tile.row
                : tile.row.charCodeAt() - 'A'.charCodeAt(),
            ),
            col: Number(tile.col),
          });
          if (
            Number(
              typeof tile.row == 'number'
                ? tile.row
                : tile.row.charCodeAt() - 'A'.charCodeAt(),
            ) === row &&
            Number(tile.col) === col
          ) {
            lists.push(tile);
          }
        });
      } else return tiles;
    }
  }
  return lists;
};

export const extractNumbers = (temp) => {
  if (typeof temp === 'number') return temp;
  let res = '';
  let numbers = temp.match(/\d+/g);
  if (numbers === null) return 0;
  if (numbers.length === 0) return 0;
  numbers.forEach((element) => {
    res += element;
  });
  return parseInt(res);
};
