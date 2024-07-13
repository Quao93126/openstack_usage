import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col } from 'react-bootstrap';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tooltip from '@mui/material/Tooltip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import DialogPM from '../../DialogPM';
import Icon from '@mdi/react';
import { mdiWeatherSunny } from '@mdi/js';
import { connect, useSelector } from 'react-redux';
import Vessel from '../../../../../tabsRight/contents/viewcontrol/Vessel';
import Objective from '../../../../../tabsRight/contents/viewcontrol/Objective';
import Channel from '../../../../../tabsRight/contents/viewcontrol/Channel';
import ImageAdjust from '../../../../../tabsRight/contents/viewcontrol/ImageAdjust';
import ZPosition from '../../../../../tabsRight/contents/viewcontrol/ZPosition';
import Timeline from '../../../../../tabsRight/contents/viewcontrol/Timeline';
import store from '../../../../../../reducers';
import useTilingStore from '@/stores/useTilingStore';
import { DialogActions, ImageList, ImageListItem, Paper } from '@mui/material';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import Avivator from '../../../../../avivator/Avivator';
import {
  Alignments,
  CHANNELS_INDEX,
  Directions,
  SortOrder,
  tilingAlignButtons,
  tilingMenus,
} from './constants';
import { buildPyramid } from '@/api/tiling';
import { Typography } from 'react-md';
import { toTiffPath } from '@/helpers/avivator';
import {
  calculateSuitableDim,
  extractNumbers,
  getImageByPath,
  getImageListFromCertainTiles,
  getOmeTiffUrl,
} from './utils';
import { ConfirmationNumberOutlined } from '@material-ui/icons';

let stylingTiling = {
  ToggleButtonGroup: { margin: '0 auto', width: '22px', height: '22px' },
};

const TabTiling = (props) => {
  const allTiles = useTilingStore().tiles;

  const [selectedChannel, setSelectedChannel] = useState('Overlay');

  const [selectedImageFileIndex, setSelectedImageFileIndex] = useState(0);

  // get the series array
  const [tiles, setTiles] = useState([]);
  const [tileSeries, setTileSeries] = useState([]);
  const [currentSeriesIdx, setCurrentSeriesIdx] = useState(0);

  //tab left index
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tilingBondingPatternMatch, setTilingBondingPatterMatch] =
    useState(false);

  //Parameters in Alignment UI
  const [alignRow, setAlignRow] = useState(1);
  const [alignCol, setAlignCol] = useState(tiles ? tiles.length : 1);
  const [alignBorder, setAlignBorder] = useState(0);
  const [alignGapX, setalignGapX] = useState(0);
  const [aligngapY, setaligngapY] = useState(0);
  const [align, setAlign] = useState(Alignments.raster);
  const [dir, setDir] = useState(Directions.horizontal);
  const [dim, setDim] = useState();
  const [sortOrder, setSortOrder] = useState(SortOrder.ascending);
  const [alignment, setAlignment] = useState('align');
  const [alignImages, setAlignImages] = useState([]);

  //parameters in bonding
  const [selectBondRadioIdx, setSelectBondRadioIdx] = useState('0');
  const [overlapX, setOverlapX] = useState(285);
  const [overlapY, setOverlapY] = useState(230);

  //Parameters in Shading UI
  const [gamma, setGamma] = useState(10);

  //Path used in displaying Images
  const [resultImagePath, setResultImagePath] = useState('');
  const [finalResultImagePath, setFinalResultImagePath] = useState('');

  //Logs
  const [infoMessage, setInfoMessage] = useState();

  // get Row, Col, vessel type
  const [vesselType, setVesselType] = useState(1);

  // the editing list corresponding to well hole
  const [holeImageList, setHoleImageList] = useState([]);

  const selectedImage = useSelector((state) => state.selectedImage);

  //the parameter for the editing
  const [displayEditingEnabled, setDisplayEditingEnabled] = useState(false);

  // the path for avivator

  const [pathAvivator, setPathAvivator] = useState('');
  const [pathOrigin, setPathOrigin] = useState('');

  const [buildFlag, setBuildFlag] = useState(false);

  //Get the MaxRow, MaxCol, and VesselType
  const getVesselType = () => {
    let maxRow = 0;
    let maxCol = 0;

    if (!tiles) {
      setVesselType(1);
      return;
    }

    tiles.forEach((tile) => {
      let row =
        typeof tile.row == 'number'
          ? tile.row
          : tile.row.charCodeAt() - 'A'.charCodeAt();
      if (maxRow < row) maxRow = row;
      if (maxCol < Number(tile.col)) maxCol = Number(tile.col);
    });

    let series = tiles[0].strSeries;

    if (series === '') {
      setVesselType(1);
      return;
    }

    if (maxRow * maxCol === 0) {
      setVesselType(1);
      return;
    }
    if (series.includes('Slide')) {
      if (maxRow + 1 === 1 && maxCol === 1) {
        setVesselType(1);
      }
      if (maxRow + 1 === 1 && maxCol === 2) {
        setVesselType(2);
      }
      if (maxRow + 1 === 1 && maxCol === 4) {
        setVesselType(4);
      }

      return;
    } else if (series.includes('Plate')) {
      if (maxRow + 1 === 2 && maxCol === 2) {
        setVesselType(7);
      }
      if (maxRow + 1 === 2 && maxCol === 3) {
        setVesselType(8);
      }
      if (maxRow + 1 === 3 && maxCol === 4) {
        setVesselType(9);
      }
      if (maxRow + 1 === 4 && maxCol === 6) {
        setVesselType(10);
      }
      if (maxRow + 1 === 6 && maxCol === 8) {
        setVesselType(11);
      }
      if (maxRow + 1 === 8 && maxCol === 12) {
        setVesselType(12);
      }
      if (maxRow + 1 === 16 && maxCol === 24) {
        setVesselType(13);
      }
      return;
    } else {
      setVesselType(14);
    }

    return;
  };

  const getSeries = (tiles) => {
    if (!tiles || tiles.length === 0) return [];
    if (!tiles[0].strSeries) return [];

    const Arr = [];
    tiles.map((tile) => {
      Arr.push(tile.strSeries);
    });

    const tempSet = new Set(Arr);
    const tempArray = [...tempSet];

    return tempArray;
  };

  //when the all tiles loaded, need to get series array and  set the current series
  useEffect(() => {
    const tempArr = getSeries(allTiles);

    setTileSeries(tempArr);
    setCurrentSeriesIdx(0);
  }, [allTiles]);

  //When the series Idx is changed
  useEffect(() => {
    if (!tileSeries || !allTiles) return;
    const cur_series = tileSeries[currentSeriesIdx];

    if (tileSeries.length === 0) {
      setTiles(allTiles);
      return;
    }

    const filteredTiles = allTiles.filter(
      (tile) => tile.strSeries === cur_series,
    );

    if (filteredTiles) setTiles(filteredTiles);
    else setTiles([]);
  }, [currentSeriesIdx, tileSeries]);

  // When the tiles reload, set dim by default 1 * tiles.length()
  useEffect(() => {
    if (!tiles || tiles.length === 0) return;

    //console.log(tiles)

    if (tiles) {
      setInfoMessage(`${tiles.length} images are loaded.`);

      const sortedTiles = tiles.sort((a, b) =>
        a.filename.localeCompare(b.filename),
      );

      let tile = sortedTiles[0];

      if (tile) {
        if (
          tile.row !== undefined &&
          tile.col !== undefined &&
          tile.series !== undefined &&
          tile.series !== '' &&
          tile.col !== '' &&
          tile.field !== ''
        ) {
          let newContent = [];

          getVesselType();

          sortedTiles.map((tile) => {
            let tempContent = {};

            tempContent.z = parseInt(tile.z) === 'NaN' ? 0 : parseInt(tile.z);
            tempContent.time =
              parseInt(tile.time) === 'NaN' ? 0 : parseInt(tile.time);
            tempContent.dimensionChanged = tile.dimensionChanged;
            let row =
              typeof tile.row == 'number'
                ? tile.row
                : tile.row.charCodeAt() - 'A'.charCodeAt();
            tempContent.col = parseInt(tile.col) === 0 ? 1 : tile.col;
            tempContent.series = tile.strSeries;
            tempContent.channel = tile.channel;

            tempContent.filename = tile.filename;
            tempContent.path = tile.path;
            tempContent.thumbnail = tile.thumbnail;
            tempContent.url = tile.url;
            tempContent.row = row;

            newContent.push(tempContent);
          });

          newContent[0].objective = tile.objective ? tile.objective : -1;

          //current series
          newContent[0].selectedSeriesIdx = currentSeriesIdx;
          newContent[0].seriesCount = tileSeries.length;

          //const tempChannels = [1, 1, 1, 1, 0, 0, 0];
          const tempChannels = [1, 0, 0, 0, 0, 0, 0];

          sortedTiles.map((tile) => {
            let row =
              typeof tile.row == 'number'
                ? tile.row
                : tile.row.charCodeAt() - 'A'.charCodeAt();
            let col = parseInt(tile.col) === 0 ? 1 : tile.col;
            tile.row = row;
            tile.col = col;
          });

          //console.log(newContent);
          let images = getImageListFromCertainTiles(sortedTiles, 0, 1);

          images.map((image) => {
            const idx = Number(CHANNELS_INDEX[image.channel]);
            if (idx < 6) tempChannels[idx] = 1;
          });
          newContent[0].channels = tempChannels;

          const holeimages = [];
          if (tile.channel !== '') {
            images.map((image) => {
              if (image.channel === selectedChannel) holeimages.push(image);
            });
            setHoleImageList(holeimages);
          } else setHoleImageList(images);

          //console.log("ttt")
          //console.log(newContent);
          store.dispatch({ type: 'content_addContent', content: newContent });

          //console.log(newContent);
          //console.log(images)
        } else {
          let newContent = [];

          sortedTiles.map((tile) => {
            let tempContent = {};
            tempContent.dimensionChanged = false;
            tempContent.row = 0;
            tempContent.col = 0;
            tempContent.series = 'Slide';
            tempContent.channel = 0;
            tempContent.vesselID = 1;

            tempContent.filename = tile.filename;
            tempContent.path = tile.path;
            tempContent.thumbnail = tile.thumbnail;
            tempContent.url = tile.url;

            newContent.push(tempContent);
          });

          store.dispatch({ type: 'content_addContent', content: newContent });
          setHoleImageList(sortedTiles);
        }
      }
    }
  }, [tiles]);

  //when the series is changed in vessel dialog
  useEffect(() => {
    const changedSeriesIdx = props.selectedVesselIdx;
    setCurrentSeriesIdx(changedSeriesIdx);
  }, [props.selectedVesselIdx]);

  //get the image lists for alignment
  const getAlignImageList = (lists) => {
    if (lists.length === 0) return [];

    const arr = [];
    const res = [];
    lists.map((item) => {
      const url = item.url.split('/static/')[0];
      if (item.ashlar_path !== '' && item.ashlar_path !== undefined) {
        if (!displayEditingEnabled) setDisplayEditingEnabled(true);
        const path = item.ashlar_path.split('/static/')[1];

        const filename = path.split('.')[0] + '.timg';
        const ext = path.split('.')[1];
        const fullpath = url + '/static/' + filename;

        const series = extractNumbers(item.field);
        const newFileName =
          'tile_image_series' + series.toString().padStart(5, '0') + '.' + ext;

        if (!arr.includes(fullpath)) {
          arr.push(fullpath);
          const new_item = {
            thumbnail: fullpath,
            _id: item._id,
            field: item.field,
            row: item.row,
            col: item.col,
            filename: newFileName,
          };
          res.push(new_item);
        }
      }
    });

    const [col, row] = calculateSuitableDim(res.length);
    setAlignCol(col);
    setAlignRow(row);
    setDim([row, col]);

    return res;
  };

  //When the holeImageLists is reload
  useEffect(() => {
    async function process() {
      if (holeImageList) {
        if (holeImageList[0]) {
          const alignImageList = getAlignImageList(holeImageList);
          setAlignImages(alignImageList);

          // let source = null;
          // if (holeImageList.length > 1) {
          //   source = await Promise.all(
          //     holeImageList.map((item) => getImageByPath(toTiffPath(item.path))),
          //   );
          // }
          // else {
          //   source = getOmeTiffUrl(holeImageList[0].url);
          // }

          // console.log(source);

          // store.dispatch({ type: 'set_image_path_for_avivator', content: source });
          // store.dispatch({ type: 'set_image_path_for_result', content: source });
        }
      }
    }
    process();
  }, [holeImageList]);

  //get the Edit Image List from the row and col
  const getImageList = (row, col) => {
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

  // set the Hole Image List and display
  // params; row, col
  const setHoleImages = (row, col) => {
    const lists = getImageList(row, col);

    const sortedTiles = lists.sort((a, b) =>
      a.filename.localeCompare(b.filename),
    );

    if (!sortedTiles || sortedTiles.length === 0) return;

    setHoleImageList(sortedTiles);

    //const tempChannels = [1, 1, 1, 1, 0, 0, 0];
    const tempChannels = [1, 0, 0, 0, 0, 0, 0];
    let time = 'p00';
    let channel = 0;

    if (
      sortedTiles[0].time !== undefined &&
      sortedTiles[0].channel !== undefined &&
      sortedTiles[0].z !== undefined
    ) {
      time = sortedTiles[0].time;

      sortedTiles.map((image) => {
        const idx = Number(CHANNELS_INDEX[image.channel]);
        tempChannels[idx] = 1;
      });
    }

    const fullList = tiles.sort((a, b) => a.filename.localeCompare(b.filename));

    if (
      fullList[0].strSeries !== undefined &&
      fullList[0].row !== undefined &&
      fullList[0].channel !== undefined &&
      fullList[0].strSeries !== '' &&
      fullList[0].row !== '' &&
      fullList[0].channel !== ''
    ) {
      let newContent = [];
      let tempContent = {};
      tempContent.z =
        parseInt(sortedTiles[0].z) == 'NaN' ? 0 : parseInt(sortedTiles[0].z);
      tempContent.time =
        parseInt(sortedTiles[0].time) == 'NaN'
          ? 0
          : parseInt(sortedTiles[0].time);
      tempContent.dimensionChanged = sortedTiles[0].dimensionChanged;
      tempContent.row = row;
      tempContent.col = col;
      tempContent.series = sortedTiles[0].strSeries;
      tempContent.channel = Number(CHANNELS_INDEX[sortedTiles[0].channel]);

      newContent.push(tempContent);

      fullList.map((tile) => {
        let tempContent = {};

        tempContent.z = tile.z;
        tempContent.time = tile.time;
        tempContent.dimensionChanged = tile.dimensionChanged;
        tempContent.row =
          typeof tile.row == 'number'
            ? tile.row
            : tile.row.charCodeAt() - 'A'.charCodeAt();

        tempContent.col = parseInt(tile.col) === 0 ? 1 : tile.col;
        tempContent.series = tile.strSeries;
        tempContent.channel = Number(CHANNELS_INDEX[tile.channel]);

        tempContent.filename = tile.filename;
        tempContent.path = tile.path;
        tempContent.thumbnail = tile.thumbnail;
        tempContent.url = tile.url;
        tempContent.objective = tile.objective ? tile.objective : -1;
        newContent.push(tempContent);
      });

      newContent[0].channels = tempChannels;

      //current series
      newContent[0].selectedSeriesIdx = currentSeriesIdx;
      newContent[0].seriesCount = tileSeries.length;

      store.dispatch({ type: 'content_addContent', content: newContent });
    }
  };

  //When the row and col are changed
  //display the change of the holes in the vessel
  useEffect(() => {
    const hole = props.selectedVesselHole;

    if (!tiles) return;

    if (vesselType === 1 || vesselType === 2 || vesselType == 4) {
      const fullList = tiles.sort((a, b) =>
        a.filename.localeCompare(b.filename),
      );
      if (!fullList || fullList.length === 0) return;

      if (
        fullList[0].strSeries !== undefined &&
        fullList[0].row !== undefined &&
        fullList[0].channel !== undefined &&
        fullList[0].strSeries !== '' &&
        fullList[0].row !== '' &&
        fullList[0].channel !== ''
      ) {
        let newContent = [];

        fullList.map((tile) => {
          let tempContent = {};

          tempContent.z = tile.z;
          tempContent.time = tile.time;
          tempContent.dimensionChanged = tile.dimensionChanged;
          tempContent.row =
            typeof tile.row == 'number'
              ? tile.row
              : tile.row.charCodeAt() - 'A'.charCodeAt();
          tempContent.col = parseInt(tile.col) === 0 ? 1 : tile.col;

          tempContent.series = tile.strSeries;
          tempContent.channel = Number(CHANNELS_INDEX[tile.channel]);

          tempContent.filename = tile.filename;
          tempContent.path = tile.path;
          tempContent.thumbnail = tile.thumbnail;
          tempContent.url = tile.url;

          newContent.push(tempContent);
        });

        //const tempChannels = [1, 1, 1, 1, 0, 0, 0];
        const tempChannels = [1, 0, 0, 0, 0, 0, 0];

        //current series
        newContent[0].selectedSeriesIdx = currentSeriesIdx;
        newContent[0].seriesCount = tileSeries.length;

        fullList.map((image) => {
          const idx = Number(CHANNELS_INDEX[image.channel]);
          tempChannels[idx] = 1;
        });

        newContent[0].objective = fullList[0].objective
          ? fullList[0].objective
          : -1;
        newContent[0].channels = tempChannels;

        store.dispatch({ type: 'content_addContent', content: newContent });

        return;
      }
    }

    if (hole) {
      if (hole.row !== undefined && hole.col !== undefined) {
        setHoleImages(hole.row, hole.col);
      }
    }
  }, [props.selectedVesselHole]);

  //Get the Correction Image Path from the server
  const getCorrectionImagePath = () => {
    //Load an OME_TIFF file
    //Load an OME_TIFF file
    const filename = alignImages[0].filename.split('.')[0] + '.timg';

    const resultpath =
      alignImages[0].thumbnail.replace(filename, '') +
      'shading_output.ome.tiff';

    return getOmeTiffUrl(resultpath);
  };

  //Get the Normalize Image Path from the server
  const getNormalizeImagePath = () => {
    //Load an OME_TIFF file
    const filename = alignImages[0].filename.split('.')[0] + '.timg';

    const resultpath =
      alignImages[0].thumbnail.replace(filename, '') +
      'shading_output1.ome.tiff';

    return getOmeTiffUrl(resultpath);
  };

  //Get the white Balance Image Path from the server
  const getWhiteBalanceImagePath = () => {
    //Load an OME_TIFF file
    const filename = alignImages[0].filename.split('.')[0] + '.timg';

    const resultpath =
      alignImages[0].thumbnail.replace(filename, '') + 'white_output.ome.tiff';

    return getOmeTiffUrl(resultpath);
  };

  //Get the black Balance Image Path from the server
  const getBlackBalanceImagePath = () => {
    //Load an OME_TIFF file
    const filename = alignImages[0].filename.split('.')[0] + '.timg';

    const resultpath =
      alignImages[0].thumbnail.replace(filename, '') + 'black_output.ome.tiff';

    return getOmeTiffUrl(resultpath);
  };

  //Get the gamma Image Path from the server
  const getGammaImagePath = (gamma) => {
    //Load an OME_TIFF file
    const filename = alignImages[0].filename.split('.')[0] + '.timg';
    const resultpath =
      alignImages[0].thumbnail.replace(filename, '') +
      'gamma' +
      gamma.toString() +
      '_output.ome.tiff';

    return getOmeTiffUrl(resultpath);
  };

  const getSnapToEdgeImagePath = () => {
    //Get the Snap To Edge Image Path from the server
    //Load an OME_TIFF file
    const filename = alignImages[0].filename.split('.')[0] + '.timg';
    const resultpath =
      alignImages[0].thumbnail.replace(filename, '') + 'snap_to_edge.ome.tiff';
    return getOmeTiffUrl(resultpath);
  };

  //Get the result image path from the server
  const getResultPath = () => {
    //Load an OME_TIFF file
    const filename = alignImages[0].filename.split('.')[0] + '.timg';

    const resultpath =
      alignImages[0].thumbnail.replace(filename, '') + 'ashlar_output.ome.tiff';

    return getOmeTiffUrl(resultpath);
  };

  //when the tiles loaded, return the sort tiles by field
  const sorted = useMemo(() => {
    if (!tiles || tiles.length === 0) return [];
    if (sortOrder === SortOrder.ascending) {
      if (tiles.length > 0) {
        if (!tiles[0].field) return tiles;
      }
      return tiles.sort(
        (a, b) =>
          Number(extractNumbers(a.field)) - Number(extractNumbers(b.field)),
      );
    } else {
      return tiles.sort(
        (a, b) =>
          Number(extractNumbers(b.field)) - Number(extractNumbers(a.field)),
      );
    }
  }, [tiles]);

  // return tiles aligned in alignment function
  const alignedImageList = useMemo(() => {
    let sortedTiles;
    if (!alignImages || alignImages.length === 0) return [];
    if (alignImages.length > 1 && alignImages[0].field) {
      if (sortOrder === SortOrder.ascending) {
        sortedTiles = alignImages.sort(
          (a, b) =>
            Number(extractNumbers(a.field)) - Number(extractNumbers(b.field)),
        );
      } else
        sortedTiles = alignImages.sort(
          (a, b) =>
            Number(extractNumbers(b.field)) - Number(extractNumbers(a.field)),
        );
    } else sortedTiles = alignImages;

    //console.log(sortedTiles);

    if (!dim) {
      return alignImages;
    }

    //console.log(sortedTiles);

    const cols = dim[1];
    const rows = dim[0];

    let chunks = [];

    // if the direction is horizontal
    if (dir === Directions.horizontal) {
      for (let i = 0; i < sortedTiles.length; i += cols) {
        chunks.push(sortedTiles.slice(i, i + cols));
      }

      // Reverse every second sub-array for snake layout
      if (align === Alignments.snake) {
        for (let i = 1; i < chunks.length; i += 2) {
          chunks[i].reverse();
        }
      }
    } // if the direction is vertical
    else if (dir === Directions.vertical) {
      for (let i = 0; i < rows; i++) chunks.push([]);
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          chunks[i].push(sortedTiles.at(j * rows + i));
        }
      }

      if (align === Alignments.snake) {
        let temp = chunks;
        chunks = [];
        for (let i = 0; i < rows; i++) chunks.push([]);
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            if (j % 2 === 1) {
              chunks[i][j] = temp[rows - i - 1][j];
            } else chunks[i][j] = temp[i][j];
          }
        }
      }
    }

    // Join the sub-arrays back together
    const temp = [].concat(...chunks);
    const result = [];
    temp.forEach((v) => {
      if (v !== undefined) {
        result.push(v);
      }
    });
    return result;
  }, [sorted, align, dir, dim, sortOrder, alignImages]);

  // When the row is changed in alignment part
  const inputTilingRows = (event) => {
    if (!alignImages || alignImages.length === 0) return;
    let r = Number(event.target.value);
    if (r <= 0) r = 1;
    setAlignRow(event.target.value === '' ? '' : r);
    if (alignImages) {
      if (alignImages.length < r) {
        setAlignRow(alignImages.length);
        setAlignCol(1);
        setDim([alignImages.length, 1]);
      } else {
        let c = Math.ceil(alignImages.length / r);
        setAlignCol(c);
        setDim([r, c]);
      }
    }
  };

  // When the col is changed in alignment part
  const inputTilingCols = (event) => {
    if (!alignImages) return;
    let c = Number(event.target.value);
    if (c <= 0) c = 1;
    setAlignCol(event.target.value === '' ? '' : c);

    if (alignImages) {
      if (alignImages.length < c) {
        setAlignCol(alignImages.length);
        setAlignRow(1);
        setDim([1, alignImages.length]);
      }
      let r = Math.ceil(alignImages.length / c);
      setAlignRow(r);
      setDim([r, c]);
    }
  };

  // when the border is changed in alignment
  const inputTilingBorder = (event) => {
    setAlignBorder(event.target.value === '' ? '' : Number(event.target.value));
  };

  //When the gap is changed in alignment
  const inputTilingGapX = (event) => {
    if (Number(event.target.value) < 0) return;
    setalignGapX(event.target.value === '' ? '' : Number(event.target.value));
  };
  const inputTilingGapY = (event) => {
    if (Number(event.target.value) < 0) return;
    setaligngapY(event.target.value === '' ? '' : Number(event.target.value));
  };

  //When the alignment Image buttons are clicked
  const handleAlignment = (event) => {
    const v = event.target.name;
    setInfoMessage(`${v} options was clicked.`);
  };

  //when the radio button in alignment was changed
  const handleAlignOptionChange = (e) => {
    if (e.target.value === 'Up-Down') {
      if (dir === Directions.horizontal) {
        setDir(Directions.vertical);
      } else setDir(Directions.horizontal);
    } else if (e.target.value === 'Left-Right') {
      if (align === Alignments.raster) {
        setAlign(Alignments.snake);
      } else setAlign(Alignments.raster);
    } else if (e.target.value === 'DecendingOrder') {
      if (sortOrder === SortOrder.ascending) setSortOrder(SortOrder.descending);
      else setSortOrder(SortOrder.ascending);
    }
  };

  const SnapToEdge = () => {
    if (alignImages && alignImages.length > 0) {
      setInfoMessage('Snap To Edge started.');

      let path = getSnapToEdgeImagePath();

      store.dispatch({ type: 'set_image_path_for_avivator', content: path });
      store.dispatch({ type: 'set_image_path_for_result', content: path });
      setInfoMessage('Snap To Edge finished.');
    } else {
      setInfoMessage('There is no image to process0, please check the images.');
    }
  };

  const PatternMatching = () => {
    if (alignImages && alignImages.length > 0) {
      setInfoMessage('Pattern Matching Function started');

      let path = getResultPath();

      store.dispatch({ type: 'set_image_path_for_avivator', content: path });
      store.dispatch({ type: 'set_image_path_for_result', content: path });
      setInfoMessage('Pattern matching finished.');
    } else {
      setInfoMessage('There is no image to process0, please check the images.');
    }
  };
  const autoPatternMatching = () => {};

  //When the radio button in bonding was changed
  const handleChange = (event) => {
    if (event.target.id === '3') {
      if (tilingBondingPatternMatch === false) {
        setTilingBondingPatterMatch(true);
        event.target.checked = true;
      } else {
        setTilingBondingPatterMatch(false);
        event.target.checked = false;
        setSelectBondRadioIdx('1');
        return;
      }
    } else setTilingBondingPatterMatch(false);
    setSelectBondRadioIdx(event.target.id);

    if (event.target.id === '2') {
      SnapToEdge();
    }

    if (event.target.id === '1') {
      normalizeImgLuminance();
    }
  };

  const normalizeImgLuminance = async () => {
    if (alignImages && alignImages.length > 0) {
      setInfoMessage('Normalize started.');

      const timestamp = new Date().getTime();

      const filepath = alignImages[0].thumbnail.split('/static/')[1];
      const filename = alignImages[0].filename.split('.')[0];

      const thumbpath =
        alignImages[0].thumbnail.replace(filename + '.timg', '') +
        'shading_output1.timg?' +
        timestamp.toString();

      setResultImagePath(thumbpath);

      setBuildFlag(true);

      setInfoMessage('Normalizing Image finished.');

      const pathForAvivator = getNormalizeImagePath();
      setPathAvivator(pathForAvivator);
    } else {
      setInfoMessage(
        'There is no image to normalize, please check the images.',
      );
    }
  };
  const correctLighting = async () => {
    if (alignImages && alignImages.length > 0) {
      setInfoMessage('Correction started.');

      const timestamp = new Date().getTime();

      const filepath = alignImages[0].thumbnail.split('/static/')[1];
      const filename = alignImages[0].filename.split('.')[0];

      const thumbpath =
        alignImages[0].thumbnail.replace(filename + '.timg', '') +
        'shading_output.timg?' +
        timestamp.toString();

      setResultImagePath(thumbpath);

      setBuildFlag(true);

      const pathForAvivator = getCorrectionImagePath();
      setPathAvivator(pathForAvivator);

      setInfoMessage('Shading Correction Image finished.');
    } else {
      setInfoMessage('There is no image to correct, please check the images.');
    }
  };

  const handleBlackBalance = () => {
    if (alignImages && alignImages.length > 0) {
      setInfoMessage('Black Balance started.');

      const timestamp = new Date().getTime();

      const filepath = alignImages[0].thumbnail.split('/static/')[1];
      const filename = alignImages[0].filename.split('.')[0];

      const thumbpath =
        alignImages[0].thumbnail.replace(filename + '.timg', '') +
        'black_output.timg?' +
        timestamp.toString();

      setResultImagePath(thumbpath);

      setBuildFlag(true);

      const pathForAvivator = getBlackBalanceImagePath();
      setPathAvivator(pathForAvivator);

      setInfoMessage('Black Balance Image finished.');
    } else {
      setInfoMessage('There is no image , please check the images.');
    }
  };

  const handleWhiteBalance = () => {
    if (alignImages && alignImages.length > 0) {
      setInfoMessage('White Balance started.');

      const timestamp = new Date().getTime();

      const filepath = alignImages[0].thumbnail.split('/static/')[1];
      const filename = alignImages[0].filename.split('.')[0];

      const thumbpath =
        alignImages[0].thumbnail.replace(filename + '.timg', '') +
        'white_output.timg?' +
        timestamp.toString();

      setResultImagePath(thumbpath);

      setBuildFlag(true);

      const pathForAvivator = getWhiteBalanceImagePath();
      setPathAvivator(pathForAvivator);

      setInfoMessage('White Balance Image finished.');
    } else {
      setInfoMessage('There is no image , please check the images.');
    }
  };

  const decreaseImgLuminance = () => {
    setGamma(gamma - 1);
    handleChangeLuminance(gamma - 1);
  };
  const increaseImgLuminance = () => {
    setGamma(gamma + 1);
    handleChangeLuminance(gamma + 1);
  };

  const handleChangeLuminance = async (gamma) => {
    if (alignImages && alignImages.length > 0) {
      setInfoMessage('Gamma Correction started.');

      const timestamp = new Date().getTime();

      const filepath = alignImages[0].thumbnail.split('/static/')[1];
      const filename = alignImages[0].filename.split('.')[0];

      const thumbpath =
        alignImages[0].thumbnail.replace(filename + '.timg', '') +
        'gamma' +
        gamma.toString() +
        '_output.timg?' +
        timestamp.toString();

      setResultImagePath(thumbpath);

      setBuildFlag(true);

      const pathForAvivator = getGammaImagePath(gamma);
      setPathAvivator(pathForAvivator);

      setInfoMessage(
        'Brighten Image by Gamma.Gamma Value : ' + (gamma / 10).toString(),
      );
    }
  };

  const resetImgLuminance = () => {
    setGamma(10);
    handleChangeLuminance(10);
  };
  const bestFit = async () => {
    handleChangeLuminance(8);
    setInfoMessage('Best Fit Image has been Display.');
  };

  //Build Merging Images in Alignment Part
  const onClickedBuildButton = async () => {
    if (alignImages && alignImages.length > 0) {
      const filepath = alignImages[0].thumbnail.split('/static/')[1];
      const filename = alignImages[0].filename.split('.')[0];
      const dir_name = filepath.split(filename)[0].trim();

      //console.log(dir_name)

      const ashlarParams = {
        width: alignCol,
        height: alignRow,
        layout: align,
        direction: dir,
        dirname: dir_name,
        sortOrder: sortOrder === SortOrder.ascending,
        overlapX: Number(overlapX),
        overlapY: Number(overlapY),
      };

      //console.log(ashlarParams)

      setInfoMessage('Build Started');
      const output = await buildPyramid(ashlarParams);

      let path = getResultPath();
      const timestamp = new Date().getTime();
      const thumbpath =
        alignImages[0].thumbnail.replace(filename + '.timg', '') +
        'ashlar_output.timg?' +
        timestamp.toString();

      setResultImagePath(thumbpath);

      setBuildFlag(true);

      store.dispatch({
        type: 'set_image_path_for_avivator',
        content: pathAvivator,
      });
      store.dispatch({
        type: 'set_image_path_for_result',
        content: pathAvivator,
      });
      store.dispatch({
        type: 'set_image_path_for_origin',
        content: pathOrigin,
      });

      // store.dispatch({ type: 'set_image_path_for_avivator', content: path });
      // store.dispatch({ type: 'set_image_path_for_result', content: path });

      // This process is for the TISSUENT method or other DL and ML methods
      const tempPath =
        path.split('download/?path=/')[0] +
        'download/?path=' +
        path.split('download/?path=/')[1];
      // store.dispatch({ type: 'set_image_path_for_origin', content: tempPath });

      setPathAvivator(path);
      setPathOrigin(tempPath);

      // store.dispatch({
      //   type: 'set_tiling_merged_image',
      //   payload: true,
      // });

      setInfoMessage(
        'Build Finished. You can see the result Image in result page.',
      );
    } else {
      setInfoMessage('There is no image to merge, please check the images.');
    }
  };

  //When the list item clicked in left tab in the Tiling Part
  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
    setInfoMessage('');
    if (index === 0 || index === 1) {
      store.dispatch({
        type: 'set_tiling_merged_image',
        payload: false,
      });
    }
    if (index === 3 || index === 4) {
    }
    if (index === 5) {
      setInfoMessage('Result Image is displayed here.');
      store.dispatch({
        type: 'set_image_path_for_avivator',
        content: pathAvivator,
      });
      store.dispatch({
        type: 'set_image_path_for_result',
        content: pathAvivator,
      });
      store.dispatch({
        type: 'set_image_path_for_origin',
        content: pathOrigin,
      });

      store.dispatch({
        type: 'set_tiling_merged_image',
        payload: true,
      });
    }
  };

  useEffect(() => {
    if (selectedIndex == 5) {
      store.dispatch({
        type: 'set_image_path_for_avivator',
        content: pathAvivator,
      });
      store.dispatch({
        type: 'set_image_path_for_result',
        content: pathAvivator,
      });

      store.dispatch({
        type: 'set_image_path_for_origin',
        content: pathOrigin,
      });
    }
  }, [pathAvivator]);

  return (
    <>
      <Row
        no-gutters="true"
        className="m-0 drop pa-5"
        style={{ maxWidth: '100%', height: '520px' }}
      >
        <Col xs={1} className="border p-0">
          <List className="border p-0" id="position-dlg-span">
            {tilingMenus.map((menuTitle, idx) => {
              return (
                <ListItemButton
                  style={{ fontSize: '12px !important' }}
                  className="border"
                  key={idx}
                  onClick={(event) => handleListItemClick(event, idx)}
                >
                  <ListItemText primary={menuTitle} />
                </ListItemButton>
              );
            })}
          </List>
        </Col>
        <Col xs={3} className="p-0 h-100">
          {/* Tiling Control Panel  */}
          <div className="control-panel h-100">
            {/* Editing */}
            {selectedIndex === 0 && (
              <Card className="h-100" variant="outlined">
                <CardContent className="pa-1">
                  <h5>Editing</h5>
                </CardContent>
                <div className="inside overflow-auto">
                  {holeImageList !== undefined && holeImageList !== null ? (
                    <List>
                      {holeImageList.map((item, idx) => {
                        if (idx === selectedImageFileIndex) {
                          return (
                            <ListItemButton
                              style={{
                                width: 'fit-content',
                                backgroundColor: 'lightblue',
                              }}
                              className="border"
                              key={idx}
                            >
                              <p className="label-text margin-0">
                                {item.filename}
                              </p>
                            </ListItemButton>
                          );
                        } else {
                          return (
                            <ListItemButton
                              style={{
                                width: 'fit-content',
                                backgroundColor: 'white',
                              }}
                              className="border"
                              key={idx}
                            >
                              <p className="label-text margin-0">
                                {item.filename}
                              </p>
                            </ListItemButton>
                          );
                        }
                      })}
                    </List>
                  ) : (
                    <></>
                  )}
                </div>
              </Card>
            )}
            {/* Alignment */}
            {selectedIndex === 1 && (
              <Card className="h-100" variant="outlined">
                <CardContent className="pa-1">
                  <h5>Alignment</h5>
                </CardContent>
                <div className="inside p-3">
                  <ToggleButtonGroup
                    type="radio"
                    name="tiling-align"
                    value={alignment}
                    exclusive
                    // onChange={(e) => {handleAlignment(e)}}
                    aria-label="text alignment"
                  >
                    {[...Array(6)].map((_, i) => {
                      let url_link = require(`../../../../../../assets/images/pos_align_${i}.png`);
                      return (
                        <Tooltip title={tilingAlignButtons[i]} key={i}>
                          <ToggleButton
                            key={`ToggleButton_${i}`}
                            name={tilingAlignButtons[i]}
                            onChange={(e) => handleAlignment(e)}
                          >
                            <img
                              name={tilingAlignButtons[i]}
                              style={{
                                ...stylingTiling.ToggleButtonGroup,
                                filter: i === 3 ? 'grayscale(1)' : '',
                              }}
                              src={url_link}
                              alt="no image"
                            />
                          </ToggleButton>
                        </Tooltip>
                      );
                    })}
                  </ToggleButtonGroup>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          onChange={handleAlignOptionChange}
                          value="Left-Right"
                        />
                      }
                      label="Left-Right"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          onChange={handleAlignOptionChange}
                          value="Up-Down"
                        />
                      }
                      label="Up-Down"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          onChange={handleAlignOptionChange}
                          value="DecendingOrder"
                        />
                      }
                      label="Descending Order"
                    />
                  </FormGroup>
                  <Row className="mt-4 mr-4">
                    <Col xs={6}>
                      <TextField
                        value={alignRow}
                        size="small"
                        onChange={inputTilingRows}
                        className="range-field"
                        label="Row"
                        inputProps={{
                          type: 'number',
                        }}
                      />
                    </Col>
                    <Col xs={6}>
                      <TextField
                        value={alignCol}
                        size="small"
                        onChange={inputTilingCols}
                        className="range-field"
                        label="Column"
                        inputProps={{
                          type: 'number',
                        }}
                      />
                    </Col>
                  </Row>
                  <Row className="mt-4 mr-4">
                    <Col xs={4}>
                      <TextField
                        value={alignBorder}
                        size="small"
                        onChange={inputTilingBorder}
                        className="range-field"
                        label="Border"
                        inputProps={{
                          type: 'number',
                        }}
                      />
                    </Col>
                    <Col xs={4}>
                      <TextField
                        value={alignGapX}
                        size="small"
                        onChange={inputTilingGapX}
                        className="range-field"
                        label="GapX"
                        inputProps={{
                          type: 'number',
                        }}
                      />
                    </Col>
                    <Col xs={4}>
                      <TextField
                        value={aligngapY}
                        size="small"
                        onChange={inputTilingGapY}
                        className="range-field"
                        label="GapY"
                        inputProps={{
                          type: 'number',
                        }}
                      />
                    </Col>
                  </Row>
                  <Button onClick={onClickedBuildButton}> Merge Image</Button>
                </div>
              </Card>
            )}
            {/* Bonding */}
            {selectedIndex === 2 && (
              <Card className="h-100" variant="outlined">
                <CardContent className="pa-1">
                  <h5>Bonding</h5>
                </CardContent>
                <div className="inside p-3">
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          onChange={handleChange}
                          id="1"
                          title="1"
                          checked={selectBondRadioIdx === '1'}
                        />
                      }
                      label="None"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          onChange={handleChange}
                          id="2"
                          title="2"
                          checked={selectBondRadioIdx === '2'}
                        />
                      }
                      label="Snap To Edge"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          onChange={handleChange}
                          id="3"
                          title="3"
                          checked={selectBondRadioIdx === '3'}
                        />
                      }
                      label="Pattern Match"
                    />
                  </FormGroup>
                  <DialogPM />
                  {tilingBondingPatternMatch && (
                    <>
                      <Row className="mr-4">
                        <Col xs={8} style={{ paddingTop: '20px' }}>
                          <TextField
                            className="range-field"
                            label="Border"
                            defaultValue={25}
                            inputProps={{
                              type: 'number',
                            }}
                          />
                        </Col>
                        <Col xs={8} style={{ paddingTop: '20px' }}>
                          <TextField
                            className="range-field"
                            label="Overlap X"
                            value={overlapX}
                            onChange={(e) => {
                              setOverlapX(e.target.value);
                            }}
                            inputProps={{
                              type: 'number',
                            }}
                          />
                        </Col>
                        <Col xs={8} style={{ paddingTop: '20px' }}>
                          <TextField
                            className="range-field"
                            label="Overlap Y"
                            value={overlapY}
                            onChange={(e) => {
                              setOverlapY(e.target.value);
                            }}
                            inputProps={{
                              type: 'number',
                            }}
                          />
                        </Col>
                        <Button
                          elevation="2"
                          className="mt-5"
                          onClick={onClickedBuildButton}
                        >
                          Match
                        </Button>
                      </Row>
                      <Row>
                        <Button
                          elevation="2"
                          className="mt-5"
                          onClick={autoPatternMatching}
                        >
                          Auto Matching
                        </Button>
                      </Row>
                    </>
                  )}
                </div>
              </Card>
            )}
            {/* Shading */}
            {selectedIndex === 3 && (
              <Card className="h-100" variant="outlined">
                <CardContent className="pa-1">
                  <h5>Shading</h5>
                </CardContent>
                <div className="inside p-3">
                  <Row className="mt-4 mr-4">
                    <Col xs={6}>
                      <Button
                        className="px-0"
                        style={{
                          minWidth: '34px',
                          height: '34px',
                          color: '#009688',
                        }}
                        onClick={normalizeImgLuminance}
                      >
                        Normalize
                      </Button>
                    </Col>
                  </Row>
                  <Row className="mt-4 mr-4">
                    <Col xs={6}>
                      <Button
                        className="px-0"
                        style={{
                          minWidth: '34px',
                          height: '34px',
                          color: '#009688',
                        }}
                        onClick={correctLighting}
                      >
                        Correct
                      </Button>
                    </Col>
                  </Row>
                </div>
              </Card>
            )}
            {/* Display */}
            {selectedIndex === 4 && (
              <Card className="h-100" variant="outlined">
                <CardContent className="pa-1">
                  <h5>Display</h5>
                </CardContent>
                <div className="inside p-3">
                  <Row className="mt-4 mr-4">
                    <Col xs={6}>
                      <Icon color="yellow" path={mdiWeatherSunny} size={1} />
                      <Button
                        className="px-0"
                        style={{
                          minWidth: '34px',
                          height: '34px',
                          color: '#009688',
                        }}
                        onClick={decreaseImgLuminance}
                      >
                        -
                      </Button>
                      <Icon color="yellow" path={mdiWeatherSunny} size={1} />
                      <Button
                        className="px-0"
                        style={{
                          minWidth: '34px',
                          height: '34px',
                          color: '#009688',
                        }}
                        onClick={increaseImgLuminance}
                      >
                        +
                      </Button>
                    </Col>
                  </Row>
                  <Row className="mt-4 mr-4">
                    <Col xs={6}>
                      <Button
                        className="px-0"
                        style={{
                          minWidth: '34px',
                          height: '34px',
                          color: '#009688',
                        }}
                        onClick={resetImgLuminance}
                      >
                        Reset
                      </Button>
                    </Col>
                  </Row>
                  <Row className="mt-4 mr-4">
                    <Col xs={6}>
                      <Button
                        className="px-0"
                        style={{
                          minWidth: '34px',
                          height: '34px',
                          color: '#009688',
                        }}
                        onClick={bestFit}
                      >
                        BestFit
                      </Button>
                    </Col>
                  </Row>
                </div>
              </Card>
            )}
            {/* Result */}
            {selectedIndex === 5 && (
              <Card className="h-100" variant="outlined">
                <CardContent className="pa-1">
                  <h5>Result</h5>
                </CardContent>
                <div className="inside p-3">
                  <div>
                    <Button
                      className="px-0"
                      style={{
                        minWidth: '34px',
                        height: '34px',
                        color: '#009688',
                      }}
                      onClick={handleWhiteBalance}
                    >
                      White Balance
                    </Button>
                  </div>

                  <br />

                  <div>
                    <Button
                      className="px-0"
                      style={{
                        minWidth: '34px',
                        height: '34px',
                        color: '#009688',
                      }}
                      onClick={handleBlackBalance}
                    >
                      Black Balance
                    </Button>
                  </div>

                  {/* <Row className="mt-4 mr-4">
                    <Col xs={6}>
                      <ToggleButtonGroup color="primary">
                        <ToggleButton value="true">
                          <Icon path={mdiCropFree} size={1} />
                        </ToggleButton>
                        <ToggleButton value="false">
                          <Icon path={mdiClose} size={1} />
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Col>
                  </Row>
                  <Row className="mt-4 mr-4">
                    <Col xs={6}>
                      <Button depressed="true" onClick={exportTiledImage}>
                        Tiled Image
                      </Button>

                    </Col>
                  </Row> */}
                </div>
              </Card>
            )}
            {/* Option */}
            {selectedIndex === 6 && (
              <Card className="h-100" variant="outlined">
                <CardContent className="pa-1">
                  <h5>Option</h5>
                </CardContent>
              </Card>
            )}
          </div>
        </Col>
        <Col
          xs={5}
          className="p-0 h-100"
          sx={{ height: '100%', width: '100%' }}
        >
          {/*  Tiling Preview  */}
          <div style={{ flexDirection: 'column' }}>
            {selectedIndex === 0 && displayEditingEnabled === false && (
              <Paper
                variant="outlined"
                sx={{ height: '800px', width: '600px' }}
              >
                <TransformWrapper minScale={0.2}>
                  <TransformComponent
                    wrapperStyle={{ height: '800px', width: '600px' }}
                  >
                    <ImageList
                      cols={1}
                      sx={{
                        mb: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                        height: '100%',
                        width: '100%',
                      }}
                    >
                      {holeImageList.map(({ _id, thumbnail, filename }) => (
                        <>
                          <p style={{ fontFamily: 'monospace' }}>{filename}</p>
                          <ImageListItem key={_id}>
                            <img
                              src={thumbnail}
                              alt={filename}
                              style={{ width: 200, height: 'auto' }}
                            />
                          </ImageListItem>
                        </>
                      ))}
                    </ImageList>
                  </TransformComponent>
                </TransformWrapper>
              </Paper>
            )}
            {selectedIndex === 0 && displayEditingEnabled === true && (
              <Paper
                variant="outlined"
                sx={{ height: '800px', width: '600px' }}
              >
                <TransformWrapper minScale={0.2}>
                  <TransformComponent
                    wrapperStyle={{ height: '800px', width: '600px' }}
                  >
                    <ImageList
                      cols={alignCol}
                      gap={alignGapX}
                      padding={alignBorder}
                      sx={{
                        mb: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                        height: '100%',
                        width: '100%',
                      }}
                    >
                      {alignedImageList.map(({ _id, thumbnail, filename }) => (
                        <ImageListItem key={_id}>
                          <img
                            src={thumbnail}
                            alt={filename}
                            style={{ width: 100, height: 'auto' }}
                          />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  </TransformComponent>
                </TransformWrapper>
              </Paper>
            )}

            {(selectedIndex === 1 ||
              (selectedIndex === 2 && buildFlag === false)) && (
              <Paper
                variant="outlined"
                sx={{ height: '800px', width: '600px' }}
              >
                <TransformWrapper minScale={0.2}>
                  <TransformComponent
                    wrapperStyle={{ height: '800px', width: '600px' }}
                  >
                    <ImageList
                      cols={alignCol}
                      gap={alignGapX}
                      padding={alignBorder}
                      sx={{
                        mb: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                        height: '100%',
                        width: '100%',
                      }}
                    >
                      {alignedImageList.map(({ _id, thumbnail, filename }) => (
                        <ImageListItem key={_id}>
                          <img
                            src={thumbnail}
                            alt={filename}
                            style={{ width: 100, height: 'auto' }}
                          />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  </TransformComponent>
                </TransformWrapper>
              </Paper>
            )}

            {(selectedIndex === 3 ||
              (selectedIndex === 2 && buildFlag === true) ||
              selectedIndex === 4 ||
              selectedIndex == 5) && (
              <Paper
                variant="outlined"
                sx={{ height: '800px', width: '600px' }}
              >
                <TransformWrapper minScale={0.2}>
                  <TransformComponent
                    wrapperStyle={{ height: '800px', width: '600px' }}
                  >
                    <img src={resultImagePath} alt={'Result Image'} />
                  </TransformComponent>
                </TransformWrapper>
              </Paper>
            )}
          </div>
        </Col>
        <Col
          xs={3}
          className="p-0 border"
          style={{ height: '100%', position: 'relative', overflowY: 'scroll' }}
        >
          <Vessel />
          <Objective />
          <Channel />

          <ImageAdjust />
          <ZPosition />
          <Timeline />
        </Col>
      </Row>
      <Row>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Typography sx={{ flexGrow: 1 }}>{infoMessage}</Typography>
        </DialogActions>
      </Row>
    </>
  );
};

const mapStateToProps = (state) => ({
  content: state.files.content,
  selectedVesselHole: state.vessel.selectedVesselHole,
  selectedVesselIdx: state.vessel.currentVesselSeriesIdx,
});

export default connect(mapStateToProps)(TabTiling);
