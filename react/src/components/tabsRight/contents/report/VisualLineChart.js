import * as React from 'react';
import { useState, useRef } from 'react';
import Paper from '@mui/material/Paper';
import { Button } from '@mui/material';
import * as api_experiment from '@/api/experiment';
import {
  ArgumentAxis,
  ValueAxis,
  Chart,
  ScatterSeries,
  Title,
  Legend,
  LineSeries,
  BarSeries,
  ZoomAndPan,
} from '@devexpress/dx-react-chart-material-ui';

import {
  Stack,
  Animation,
  Palette,
  EventTracker,
} from '@devexpress/dx-react-chart';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import NativeSelect from '@mui/material/NativeSelect';
import { useSelector } from 'react-redux';
import { MenuItem, Select, Typography } from '@mui/material';
import { useStyles } from './utils';
import { useEffect } from 'react';
import { MeasureHeader } from '@/constants/filters';
import { Col, Row } from 'react-bootstrap';
import { UMAP } from 'umap-js';
import TSNEVisualizer from './TSNEVisualizer';
import { kMeans } from './utils';
import Plot from 'react-plotly.js';

const VisualLineChart = () => {
  const [displayData, setDisplayData] = useState([]);
  const [allData, setAllData] = useState([]);

  const [items] = useState([
    { id: -1, name: 'Image' },
    { id: 0, name: 'Graph' },
    { id: 1, name: 'Histogram' },

    { id: 2, name: 'Dotplot' },
    { id: 3, name: 'U-MAP' },
    { id: 4, name: 'T-SNE' },
  ]);

  const [selectedChartTypeIndex, setSelectedChartTypeIndex] = useState(0);

  const [selectedMeasureItemIndex, setSelectedMeaureItemIndex] = useState(0);

  const [currentItemsCount, setCurrenItemsCount] = useState(0);

  const [xData, setXData] = useState([]);
  const [yData, setYData] = useState([]);

  const [xAxisLabel, setXAxisLabel] = useState('No');
  const [yAxisLabel, setYAxisLabel] = useState('');

  const [umapData, setUmapData] = useState([]);
  const [umapNamesData, setUmapNamesData] = useState([]);

  const [umapDisplayData, setUmapDisplayData] = useState([]);

  const [xDataForPlot, setXDataForPlot] = useState([]);
  const [yDataForPlot, setYDataForPlot] = useState([]);

  const selectItem = (e) => {
    setSelectedChartTypeIndex(e.target.value);
  };

  const selectedVisualItem = useSelector(
    (state) => state.files.selectedVisualItem,
  );

  const selectedCsvData = useSelector((state) => state.files.selectedCsvData);

  //This is for TissueNT method
  const experimentName = useSelector((state) => state.experiment.method);
  const [tissueNTPlotData, setTissueNTPlotData] = useState([]);

  const mergedImageFlag = useSelector(
    (state) => state.files.tilingMergedImageFlag,
  );
  const currentmodelName = useSelector(
    (state) => state.experiment.current_model,
  );

  const holeSelectedFlag = useSelector(
    (state) => state.files.reportTabHoleSelectedFlag,
  );

  const reportSelectdedChannel = useSelector(
    (state) => state.files.reportSelectdedChannel,
  );

  const imagePathForOrigin = useSelector(
    (state) => state.files.imagePathForOrigin,
  );

  const [heatmapImgLists, setHeatmapImgLists] = useState([]);
  const [heatmapLargeImage, setHeatmapLargeImage] = useState();

  const [ROISelected, setROISelected] = useState(false);

  //For Mouse Dynamic tracking and video files
  const isVideoFile = useSelector((state) => state.files.isVideoFile);
  const imagePathForAvivator = useSelector(
    (state) => state.files.imagePathForAvivator,
  );

  //For graph colors
  const [histogramColor, setHistogramColor] = useState(
    yDataForPlot == [] ? 'blue' : Array(yDataForPlot.length).fill('blue'),
  );
  const [lineGraphColor, setLineGraphColor] = useState(
    yDataForPlot == [] ? 'blue' : Array(yDataForPlot.length).fill('blue'),
  );

  const getImageUrlFromOmeTiff = (imagePathForOmeTiff) => {
    if (imagePathForOmeTiff) {
      let imagePathList = imagePathForOmeTiff.split('image/download/?path=');

      let fullpath = imagePathList[0] + 'static/' + imagePathList[1];

      fullpath = fullpath.replace('.ome.tiff', '.jpg');
      return fullpath;
    }
    return null;
  };
  //if flag == true maskImageUrl
  //else Origin Image
  const getMaskAndOriginImageUrlForChannel = (channel, flag) => {
    if (imagePathForOrigin) {
      let path = getImageUrlFromOmeTiff(imagePathForOrigin);
      let rel_dir = path.split('Overlay/')[0];

      if (flag) {
        if (channel == 'Overlay') {
          return rel_dir + 'tissueResult.jpg';
        }
        return rel_dir + channel + '/' + 'mask_output.jpg';
      } else {
        return rel_dir + channel + '/' + 'ashlar_output.jpg';
      }
    }

    return null;
  };

  const getDotPlotImageUrlForChannel = () => {
    if (imagePathForOrigin) {
      let path = getImageUrlFromOmeTiff(imagePathForOrigin);

      let rel_dir = path;
      if (path.includes('Overlay')) {
        rel_dir = path.split('Overlay/')[0];
      }

      return rel_dir + 'dotplot.jpg';
    }

    return null;
  };

  const getResultForMouseTracking = async () => {
    let res = await api_experiment.getVideoSource(imagePathForAvivator);

    let filelist = res.data.filepath.split('.');
    let temp = res.data.filepath.split('.' + filelist[filelist.length - 1])[0];

    let resultImagePath =
      process.env.REACT_APP_BASE_API_URL + 'static/' + temp + '/plot.png';
    setSelectedDisplayImage(resultImagePath);
  };

  useEffect(() => {
    getResultForMouseTracking();
  }, [isVideoFile]);

  const getHeatMapImageUrlLists = () => {
    if (imagePathForOrigin) {
      let path = getImageUrlFromOmeTiff(imagePathForOrigin);

      let rel_dir = path;
      if (path.includes('Overlay')) {
        rel_dir = path.split('Overlay/')[0];
      } else {
        let tempLists = path.split('/');
        let len = tempLists.length;
        const filename = tempLists[len - 1];
        rel_dir = path.split(filename)[0];
      }
      return [
        rel_dir + '1.png',
        rel_dir + '2.png',
        rel_dir + '3.png',
        rel_dir + '4.png',
        rel_dir + '5.png',
      ];
    }
    return [];
  };

  const getHeatMapImageUrlListsWithROIS = () => {
    if (imagePathForOrigin) {
      let path = getImageUrlFromOmeTiff(imagePathForOrigin);

      let rel_dir = path;
      if (path.includes('Overlay')) {
        rel_dir = path.split('Overlay/')[0];
      } else {
        let tempLists = path.split('/');
        let len = tempLists.length;
        const filename = tempLists[len - 1];
        rel_dir = path.split(filename)[0];
      }
      return [
        rel_dir + 'roi_1.png',
        rel_dir + 'roi_2.png',
        rel_dir + 'roi_3.png',
        rel_dir + 'roi_4.png',
        rel_dir + 'roi_5.png',
      ];
    }
    return [];
  };

  const [selectedDisplayImage, setSelectedDisplayImage] = useState('');

  useEffect(() => {
    if (isVideoFile) return;
    if (holeSelectedFlag) {
      setSelectedDisplayImage(
        getMaskAndOriginImageUrlForChannel(reportSelectdedChannel, true),
      );
    } else {
      setSelectedDisplayImage(
        getMaskAndOriginImageUrlForChannel(reportSelectdedChannel, false),
      );
    }
  }, [reportSelectdedChannel, holeSelectedFlag, currentmodelName]);

  const handleUmapDataSetClear = () => {
    setUmapData([]);
    setUmapDisplayData([]);
    setUmapNamesData([]);
  };

  useEffect(() => {
    if (selectedCsvData === null) {
      setAllData([]);
      setDisplayData([]);
      setCurrenItemsCount(0);
      setXData([]);
      setYData([]);
      return;
    }

    const headerData = selectedCsvData[0];

    const headers = headerData.map((item, index) => ({
      headerName: item.includes(':') ? item.split(':')[0] : '-1',
    }));

    let temp = selectedCsvData;
    const length = temp.length;
    let body = temp.slice(1);
    body.pop();
    const finalResult = [];

    body.map((rowData, index) => {
      const tempRow = {};
      rowData.map((item, index) => {
        if (index !== 0) {
          tempRow[headers[index].headerName] = Number(item);
        }
      });
      finalResult.push(tempRow);
    });

    setAllData(finalResult);
  }, [selectedCsvData]);

  //Functions for drop event
  const handleDrop = (e) => {
    e.preventDefault();
    var data = e.dataTransfer.getData('Text/plain');
    setSelectedMeaureItemIndex(data);

    const itemsCount =
      currentItemsCount === 0 ? 1 : (currentItemsCount % 2) + 1;
    setCurrenItemsCount(itemsCount);
  };

  useEffect(() => {
    if (currentItemsCount === 0) {
      setXData([]);
      setYData([]);
      setDisplayData([]);
    }
    // When the current selected Measurement Item is one, the x axis will be no
    if (currentItemsCount === 1) {
      let res = [];
      let xdata = [];
      allData.map((item, index) => {
        let temp = {};
        temp['x'] = index + 1;
        temp['y'] = item[selectedMeasureItemIndex - 1];
        xdata.push(item[selectedMeasureItemIndex - 1]);
        res.push(temp);
      });

      setDisplayData(res);
      setXData(xdata);
      setXAxisLabel('No');
      setYAxisLabel(MeasureHeader[selectedMeasureItemIndex]);
    }

    if (currentItemsCount === 2) {
      let res = [];
      allData.map((item, index) => {
        let temp = {};
        temp['x'] = xData[index];
        temp['y'] = item[selectedMeasureItemIndex - 1];
        res.push(temp);
      });
      res.sort((obj1, obj2) => {
        if (obj1.x === obj2.x) {
          return obj1.y - obj2.y;
        }
        return obj1.x - obj2.x;
      });
      setDisplayData(res);

      setXAxisLabel(yAxisLabel);
    }
    setYAxisLabel(MeasureHeader[selectedMeasureItemIndex]);

    if (umapData.length == 0) {
      let tempArr = [];
      allData.map((item, index) => {
        let t = item[selectedMeasureItemIndex - 1];
        tempArr.push([t]);
      });
      setUmapData(tempArr);
      setUmapNamesData([MeasureHeader[selectedMeasureItemIndex]]);
    } else {
      let names = [...umapNamesData];
      const currentHeader = MeasureHeader[selectedMeasureItemIndex];
      if (names.includes(currentHeader)) return;
      names.push(currentHeader);
      setUmapNamesData(names);
      let tempArr = [...umapData];
      let res = [];
      allData.map((item, index) => {
        let temp = item[selectedMeasureItemIndex - 1];
        res.push(temp);
      });

      tempArr.map((item, index) => {
        let t = res[index];
        item.push(t);
      });
      setUmapData(tempArr);
    }
  }, [currentItemsCount, allData]);

  useEffect(() => {
    if (experimentName === 'tissuenet') {
      if (allData.length === 0) return;
      let tempArr = [];
      allData.map((item, index) => {
        let t = item[1];
        tempArr.push([t]);
      });

      let res = [];
      allData.map((item, index) => {
        let temp = item[2];
        res.push(temp);
      });

      tempArr.map((item, index) => {
        let t = res[index];
        item.push(t);
      });

      if (tempArr.length === 0) return;

      const nComponents = 2; // Number of dimensions for projection
      const nNeighbors = 15; // Number of neighbors to consider
      const minDist = 0.1; // Minimum distance between points

      // Create a new UMAP instance
      const reducer = new UMAP({ nComponents, nNeighbors, minDist });

      // Fit the UMAP model to the data
      const embedding = reducer.fit(tempArr);

      const arrGroupFlag = kMeans(embedding, 5);

      let result = [];
      embedding.map((item, index) => {
        let temp = {};

        temp['x' + (arrGroupFlag[index] + 1)] = item[0];
        temp['y' + (arrGroupFlag[index] + 1)] = item[1];

        result.push(temp);
      });
      result.sort((obj1, obj2) => {
        if (obj1.x === obj2.x) {
          return obj1.y - obj2.y;
        }
        return obj1.x - obj2.x;
      });

      setXAxisLabel('');
      setYAxisLabel('');
      setTissueNTPlotData(result);
    }
  }, [experimentName]);

  useEffect(() => {
    drawUMAP(umapData);
  }, [umapData]);

  const handleAllowDrop = (e) => {
    e.preventDefault();
  };

  const drawUMAP = (data) => {
    if (data.length == 0) return;
    if (data[0].length < 2) return;
    // Define the UMAP parameters
    const nComponents = 2; // Number of dimensions for projection
    const nNeighbors = 15; // Number of neighbors to consider
    const minDist = 0.1; // Minimum distance between points

    // Create a new UMAP instance
    const reducer = new UMAP({ nComponents, nNeighbors, minDist });

    // Fit the UMAP model to the data
    const embedding = reducer.fit(data);

    let res = [];
    embedding.map((item, index) => {
      let temp = {};
      temp['x'] = item[0];
      temp['y'] = item[1];
      res.push(temp);
    });
    const arrGroupFlag = kMeans(embedding, 5);

    let result = [];
    embedding.map((item, index) => {
      let temp = {};

      temp['x' + (arrGroupFlag[index] + 1)] = item[0];
      temp['y' + (arrGroupFlag[index] + 1)] = item[1];

      result.push(temp);
    });

    setUmapDisplayData(result);

    //console.log(embedding);
  };

  const processHeatMap = async (_payload) => {
    const dir = await api_experiment.processHeatMap(_payload);

    const imgLists = getHeatMapImageUrlLists();
    setHeatmapImgLists(imgLists);
    setHeatmapLargeImage(imgLists[0]);

    //console.log(getHeatMapImageUrlLists())
  };
  // for the dotplot, we send the data to backend
  useEffect(() => {
    if (selectedChartTypeIndex === 2) {
      const _payload = {
        image_path: imagePathForOrigin,
      };
      processHeatMap(_payload);
    }
  }, [selectedChartTypeIndex]);

  const handleClickHeatMapImage = (event, item) => {
    setHeatmapLargeImage(item);
  };

  const handleROISelected = () => {
    let c = !ROISelected;
    if (c) {
      const imgLists = getHeatMapImageUrlListsWithROIS();
      setHeatmapImgLists(imgLists);
      setHeatmapLargeImage(imgLists[0]);
    } else {
      const imgLists = getHeatMapImageUrlLists();
      setHeatmapImgLists(imgLists);
      setHeatmapLargeImage(imgLists[0]);
    }
    setROISelected(c);
  };

  useEffect(() => {
    // console.log(displayData)
    let tempX = [];
    let tempY = [];
    displayData.map((temp) => {
      tempX.push(temp.x);
      tempY.push(temp.y);
    });
    setXDataForPlot(tempX);
    setYDataForPlot(tempY);
  }, [displayData]);

  const handleLineGraphGraphHover = (event) => {
    if (event.points) {
      const pointIndex = event.points[0].pointNumber; // Get the index of the hovered point
      let len = yDataForPlot.length;
      const newColor = Array(len).fill('blue');
      newColor[pointIndex] = 'red';

      setLineGraphColor(newColor); // Update color state
    }
  };

  const handleHistogramGraphHover = (event) => {
    if (event.points) {
      const pointIndex = event.points[0].pointNumber; // Get the index of the hovered point
      let len = yDataForPlot.length;
      const newColor = Array(len).fill('blue');
      newColor[pointIndex] = 'red';

      setHistogramColor(newColor); // Update color state
    }
  };

  return (
    <div
      className="visual-main-panel-screen-content"
      onDrop={handleDrop}
      onDragOver={handleAllowDrop}
    >
      {selectedVisualItem !== null && (
        <h2
          style={{
            fontFamily: 'monospace',
            textAlign: 'center',
            color: 'red',
          }}
        >
          {selectedVisualItem.name}
        </h2>
      )}
      <Box
        sx={{
          minWidth: 70,
          marginTop: '8px',
          paddingTop: '8px',
          marginLeft: '10px',
          paddingLeft: '10px',
        }}
      >
        <FormControl>
          <Select
            labelId="demo-simple-select-helper-label"
            id="demo-simple-select-helper"
            defaultValue={0}
            inputProps={{
              name: 'filter',
              id: 'uncontrolled-native',
            }}
            label="Chart Type"
            onChange={(event) => selectItem(event)}
          >
            {items.map((item) => (
              <MenuItem key={`item-${item.id}`} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {selectedChartTypeIndex >= 0 && selectedChartTypeIndex < 2 && (
        <Paper style={{ height: '83%', overflow: 'auto' }}>
          <Row style={{ height: '90%' }}>
            <Col>
              {selectedChartTypeIndex === 0 && (
                <Plot
                  data={[
                    {
                      x: xDataForPlot,
                      y: yDataForPlot,
                      type: 'scatter',
                      name: '',
                      mode: 'lines+markers',
                      marker: { color: lineGraphColor },
                    },
                  ]}
                  layout={{
                    width: '100%',
                    height: '100%',
                    title: '',
                    xaxis: {
                      title: xAxisLabel,
                    },
                    yaxis: {
                      title: yAxisLabel,
                    },
                  }}
                  onHover={handleLineGraphGraphHover}
                />
              )}

              {selectedChartTypeIndex === 1 && (
                <Plot
                  data={[
                    {
                      x: xDataForPlot,
                      y: yDataForPlot,
                      type: 'bar',
                      name: '',
                      mode: 'lines+markers',
                      marker: { color: histogramColor },
                    },
                  ]}
                  layout={{
                    width: '100%',
                    height: '100%',
                    title: '',
                    xaxis: {
                      title: xAxisLabel,
                    },
                    yaxis: {
                      title: yAxisLabel,
                    },
                  }}
                  onHover={handleHistogramGraphHover}
                />
              )}

              {/* {selectedChartTypeIndex === 2 &&
                experimentName !== 'tissuenet' && (
                  <Chart data={displayData} style={{ height: '100%' }}>
                    <ArgumentAxis></ArgumentAxis>
                    <ValueAxis></ValueAxis>
                    <ScatterSeries
                      valueField="y"
                      argumentField="x"
                      color="#758112"
                    />
                    <Palette scheme={['#E5F5E0', '#31A354']} />
                    <Animation />
                    <EventTracker />
                    <ZoomAndPan />
                  </Chart>
                )}
              {selectedChartTypeIndex === 2 &&
                experimentName === 'tissuenet' && (
                  <img
                    src={getDotPlotImageUrlForChannel()}
                    style={{
                      width: '550px',
                      borderRadius: '5px',
                      padding: '2px',
                    }}
                  />
                )} */}
            </Col>
          </Row>
          <Row style={{ textAlign: 'center', justifyContent: 'center' }}>
            <Typography style={{ textAlign: 'center', color: 'blue' }}>
              {xAxisLabel}
            </Typography>
          </Row>
        </Paper>
      )}
      {selectedChartTypeIndex === 3 && (
        <>
          <Paper style={{ height: '78%', overflow: 'auto' }}>
            <Chart data={umapDisplayData}>
              <ArgumentAxis />
              <ValueAxis />

              <ScatterSeries
                valueField="y1"
                argumentField="x1"
                color="#0000FF"
              />
              <ScatterSeries
                valueField="y2"
                argumentField="x2"
                color="#FF0000"
              />
              <ScatterSeries
                valueField="y3"
                argumentField="x3"
                color="#00FF00"
              />
              <ScatterSeries
                valueField="y4"
                argumentField="x4"
                color="#FFFF00"
              />
              <ScatterSeries
                valueField="y5"
                argumentField="x5"
                color="#00FFFF"
              />

              <Animation />
              <EventTracker />
              <ZoomAndPan />
            </Chart>
          </Paper>
          <Button
            size="medium"
            className="pattern-item-button"
            variant="contained"
            onClick={handleUmapDataSetClear}
          >
            Clear DataSet
          </Button>
        </>
      )}
      {selectedChartTypeIndex === 4 && (
        <Paper style={{ height: '78%', overflow: 'auto' }}>
          <TSNEVisualizer inputData={umapData} />
        </Paper>
      )}

      {selectedChartTypeIndex === -1 && (
        <div
          style={{
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            alignContent: 'center',
          }}
        >
          <img
            src={selectedDisplayImage}
            style={{ width: '550px', borderRadius: '5px', padding: '2px' }}
          />
        </div>
      )}
      {selectedChartTypeIndex === 2 && (
        <div>
          <Row>
            <Col className="col-8">
              <img
                className="heatmapImageViewer"
                src={heatmapLargeImage}
                style={{ width: '450px', borderRadius: '5px', padding: '2px' }}
              />
            </Col>
            <Col className="col-4">
              <Row>
                <Button onClick={handleROISelected}> ROI </Button>
              </Row>
              <Row>
                <Button> Segmentation</Button>
              </Row>
            </Col>
          </Row>
          <Row style={{ paddingLeft: '35px' }}>
            {heatmapImgLists.map((item) => (
              <a onClick={(event) => handleClickHeatMapImage(event, item)}>
                {' '}
                <img src={item} style={{ width: '75px' }}></img>
              </a>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
};

export default VisualLineChart;
