import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import TSNE from 'tsne-js';
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

function TSNEVisualizer(props) {
  const [tsneData, setTSNEData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [xAxisRange, setXAxisRange] = useState([-10, 10]);
  useEffect(() => {
    const inputData = props.inputData;

    if (inputData.length === 0) return;
    if (inputData[0].length < 2) return;

    let model = new TSNE({
      dim: 2,
      perplexity: 30.0,
      earlyExaggeration: 4.0,
      learningRate: 1.0,
      nIter: 15,
      metric: 'euclidean',
    });

    // inputData is a nested array which can be converted into an ndarray
    // alternatively, it can be an array of coordinates (second argument should be specified as 'sparse')
    model.init({
      data: inputData,
      type: 'dense',
    });

    // `error`,  `iter`: final error and iteration number
    // note: computation-heavy action happens here
    let [error, iter] = model.run();

    // `output` is unpacked ndarray (regular nested javascript array)
    let output = model.getOutput();

    setTSNEData(output);
  }, [props]);

  useEffect(() => {
    let res = [];
    let minx = 1000;
    let maxx = -1000;
    tsneData.map((item, index) => {
      let temp = {};
      temp['x'] = item[0];
      temp['y'] = item[1];
      if (minx > item[1]) minx = item[1];
      if (maxx < item[1]) maxx = item[1];
      res.push(temp);
    });
    for (let i = 0; i < 1000; i++) {
      let temp = {};
      temp['x'] = Math.random() * (maxx - minx) + minx;
      temp['y'] = Math.random() * (maxx - minx) + minx;
      res.push(temp);
    }
    res.sort((obj1, obj2) => {
      if (obj1.x === obj2.x) {
        return obj1.y - obj2.y;
      }
      return obj1.x - obj2.x;
    });
    setXAxisRange([minx, maxx]);
    setDisplayData(res);
  }, [tsneData]);

  return (
    <Chart data={displayData}>
      <ArgumentAxis visualRange={xAxisRange} showGrid={true} />
      <ValueAxis />

      <ScatterSeries valueField="y" argumentField="x" />

      {/* <Title text={umapNamesData.map(item => <>{item}, </>)} style = {{fontsize : "16px"}} /> */}
      <Animation />
      <EventTracker />
      <ZoomAndPan />
    </Chart>
  );
}

export default TSNEVisualizer;
