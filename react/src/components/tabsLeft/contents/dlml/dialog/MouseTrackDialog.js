import * as React from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import { useFlagsStore, useViewerStore } from '@/state';
import { Button, Col, Row } from 'react-bootstrap';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Slider from '@mui/material/Slider';
import { range } from '@/helpers/avivator';
import InputBase from '@mui/material/InputBase';
import { useState, useEffect } from 'react';
import * as api_experiment from '@/api/experiment';
import store from '@/reducers';
import { getImageUrl } from '@/helpers/file';
import { connect, useSelector } from 'react-redux';
import Channel from '@/components/tabsRight/contents/viewcontrol/Channel';
import ToggleButton from '@mui/material/ToggleButton';
import Icon from '@mdi/react';
import { mdiImageCheck, mdiImageOutline } from '@mdi/js';
import { COLORS } from '@/constants';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Modal, Typography } from 'antd';
import Draggable from 'react-draggable';
import { getMeasureImage } from '@/api/image';
import ProgressBar from '@ramonak/react-progress-bar';
import ReactPlayer from 'react-player';
import screenfull from 'screenfull';
import Container from '@mui/material/Container';
import { Upload } from '@mui/icons-material';
//import Plot from 'react-plotly.js';
import { random } from 'lodash';
import { Switch } from '@mui/material';

const mapStateToProps = (state) => ({
  showDynamicMouseMethodDialog: state.measure.showDynamicMouseMethodDialog,
  videoTimeDuration: state.files.videoTimeDuration,
});

const MouseTrackDialog = (props) => {
  const [filePath, setFilePath] = useState('');
  const [progress, setProgress] = useState(0);
  const [viewMode, setViewMode] = useState('merge');
  const [statusMessage, setStatusMessage] = useState('');
  const [filedata, setFileData] = useState(null);

  const [graphViewed, setGraphViewed] = useState(false);

  const [resultImg, setResultImg] = useState('');

  const maxDialogWidth = 800;
  const [visible, setVisible] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [isTested, setIsTested] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const [showFooter, setShowFooter] = useState(true);
  const draggleRef = React.createRef();

  useEffect(() => {
    setVisible(props.showDynamicMouseMethodDialog);
    setIsTested(false);
  }, [props]);

  const onStart = (event, uiData) => {
    const { clientWidth, clientHeight } = window?.document?.documentElement;
    const targetRect = draggleRef?.current?.getBoundingClientRect();
    setBounds({
      left: -targetRect?.left + uiData?.x,
      right: clientWidth - (targetRect?.right - uiData?.x),
      top: -targetRect?.top + uiData?.y,
      bottom: clientHeight - (targetRect?.bottom - uiData?.y),
    });
  };

  const close = (event, reason) => {
    store.dispatch({
      type: 'UPDATE_DYNAMIC_MOUSE_METHOD_DIALOG_STATUS',
      payload: false,
    });
  };

  const handleBackdropClick = (e) => {
    e.stopPropagation();
    return false;
  };

  const inputRef = React.useRef();
  const [source, setSource] = useState();

  const [timeFrame, setTimeFrame] = useState(120);
  const [currentTimeFrame, setCurrentTimeFrame] = useState(1);

  const [graphTimeFrame, setGraphTimeFrame] = useState([]);
  const [graphSnoutX, setGraphSnoutX] = useState([]);
  const [graphSnoutY, setGraphSnoutY] = useState([]);
  const [graphHeadX, setGraphHeadX] = useState([]);
  const [graphHeadY, setGraphHeadY] = useState([]);
  const [graphFLeftLegX, setGraphFLeftLegX] = useState([]);
  const [graphFLeftLegY, setGraphFLeftLegY] = useState([]);
  const [graphFRightLegX, setGraphFRightLegX] = useState([]);
  const [graphFRightLegY, setGraphFRightLegY] = useState([]);
  const [graphBLeftLegX, setGraphBLeftLegX] = useState([]);
  const [graphBLeftLegY, setGraphBLeftLegY] = useState([]);
  const [graphBRightLegX, setGraphBRightLegX] = useState([]);
  const [graphBRightLegY, setGraphBRightLegY] = useState([]);
  const [graphTailBaseX, setGraphTailBaseX] = useState([]);
  const [graphTailBaseY, setGraphTailBaseY] = useState([]);
  const [graph3DViewModeSelected, setGraph3DViewModeSelected] = useState(false);

  const handleToggle3DGraphViewSwitchChanged = () => {
    setGraph3DViewModeSelected(!graph3DViewModeSelected);
  };

  useEffect(() => {
    let temp = [];
    for (let i = 0; i < props.videoTimeDuration; i++) {
      temp.push(i);
    }
    setGraphTimeFrame(temp);
  }, [props.videoTimeDuration]);

  const asyncTimeout = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };
  const imagePathForAvivator = useSelector(
    (state) => state.files.imagePathForAvivator,
  );

  const handleSetVideoUrl = async () => {
    let res = await api_experiment.getVideoSource(imagePathForAvivator);
    setSource(
      process.env.REACT_APP_BASE_API_URL + 'static/' + res.data.filepath,
    );
  };

  useEffect(() => {
    if (Array.isArray(imagePathForAvivator)) return;
    if (imagePathForAvivator === null || imagePathForAvivator === '') return;

    // if (
    //   imagePathForAvivator.includes('.mp4') ||
    //   imagePathForAvivator.includes('.avi')
    // )
    //   handleSetVideoUrl();
  }, [imagePathForAvivator]);

  const doMeasure = async () => {};

  //the result directory is placed in that folder
  // for.e.g if the filepath is .../temp.mp4
  // the result path will be  .../temp/result.mp4

  const getResultVideoPath = (path) => {
    let templist = path.split('.');
    let file_extension = '.' + templist[templist.length - 1];

    let dirPath = path.split(file_extension)[0];

    return dirPath + '/result.mp4';
  };

  const handleTrain = async () => {
    setIsLoading(true);
    setProgress(0);

    let _payload = {
      source: filePath,
    };

    for (let i = 0; i < 5; i++) {
      await asyncTimeout(3000);
      setProgress(10 * (i + 1));
    }

    for (let i = 5; i < 9; i++) {
      await asyncTimeout(5000);
      setProgress(10 * (i + 1));
    }

    setProgress(100);

    let res = await api_experiment.getVideoSource(imagePathForAvivator);

    let temp_path =
      process.env.REACT_APP_BASE_API_URL + 'static/' + res.data.filepath;

    setSource(getResultVideoPath(temp_path));

    if (res.data.filePath !== undefined) {
      let avivator_path = res.data.filePath.split('.')[0] + '/result.mp4';

      store.dispatch({
        type: 'set_image_path_for_avivator',
        content: avivator_path,
      });
    }

    setIsLoading(false);
  };
  const handleChangeViewMode = (e, newViewMode) => {
    e.stopPropagation();
    setViewMode(newViewMode);
  };

  const handleSelectedMethod = async () => {
    // store.dispatch({
    //   type: 'UPDATE_DYNAMIC_MOUSE_METHOD_DIALOG_STATUS',
    //   payload: false,
    // });

    setGraphViewed(!graphViewed);

    setResultImg(process.env.PUBLIC_URL + '/temp/trajectory.png');
  };

  return (
    <>
      <Modal
        mask={false}
        maskClosable={false}
        keyboard={false}
        wrapClassName="aaa"
        style={{
          minWidth: '800px',
          position: 'fixed',
          // transform: 'translateX(-50%)',
          left: (document.body.clientWidth - 848) / 2,
        }}
        // zIndex={-1}
        title={
          <div
            style={{
              width: '100%',
              cursor: 'move',
            }}
            onMouseOver={() => {
              if (disabled) {
                setDisabled(false);
              }
            }}
            onMouseOut={() => {
              setDisabled(true);
            }}
            // fix eslintjsx-a11y/mouse-events-have-key-events
            // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/master/docs/rules/mouse-events-have-key-events.md
            onFocus={() => {}}
            onBlur={() => {}}
            // end
          >
            <div className="d-flex border-bottom">
              <DialogTitle>Dynamic Mouse Tracking Method</DialogTitle>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleChangeViewMode}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <ToggleButton
                  className="toggleBtn"
                  value="unmerge"
                  aria-label="list"
                >
                  <Icon
                    path={mdiImageOutline}
                    size={1}
                    color={COLORS.LIGHT_CYAN}
                  />
                </ToggleButton>
                <ToggleButton
                  className="toggleBtn"
                  value="unmerge"
                  aria-label="module"
                >
                  <Icon
                    path={mdiImageCheck}
                    size={1}
                    color={COLORS.LIGHT_CYAN}
                  />
                </ToggleButton>
              </ToggleButtonGroup>
              <Switch
                checked={graph3DViewModeSelected}
                onChange={handleToggle3DGraphViewSwitchChanged}
                inputProps={{ 'aria-label': 'controlled' }}
              />
            </div>
          </div>
        }
        footer={
          !showFooter
            ? null
            : [
                <div className="flex justify-content-center">
                  <button
                    onClick={handleTrain}
                    className="btn btn-primary"
                    style={{ marginRight: '10px' }}
                  >
                    Train
                  </button>
                  <button
                    onClick={handleSelectedMethod}
                    className="btn btn-primary"
                    style={{ marginRight: '10px' }}
                  >
                    Show the result
                  </button>
                  <button
                    onClick={close}
                    style={{ marginRight: '10px' }}
                    className="btn btn-outline-dark"
                  >
                    Cancel
                  </button>
                </div>,
              ]
        }
        visible={visible}
        onOk={handleSelectedMethod}
        onCancel={close}
        modalRender={(modal) => (
          <Draggable
            disabled={disabled}
            bounds={bounds}
            onStart={(event, uiData) => onStart(event, uiData)}
            key="measure-item-dialog"
          >
            <div aa="2" ref={draggleRef}>
              {modal}
            </div>
          </Draggable>
        )}
      >
        <Container>
          <div className="playerDiv">
            {!graphViewed && (
              <ReactPlayer
                width={'100%'}
                height="100%"
                style={{ minWidth: '650px' }}
                url={
                  source
                    ? source
                    : 'https://drive.google.com/drive/folders/161WAYAdW8Fiq7wfBCySX4ej-tORlmgrz'
                }
                playing={false}
                muted={true}
                controls={true}
              />
            )}

            {resultImg && resultImg != '' && !graph3DViewModeSelected && (
              <>
                {/* <Plot
                  data={[
                    {
                      x: [graphSnoutX[currentTimeFrame]],
                      y: [graphSnoutY[currentTimeFrame]],
                      type: 'scatter',
                      name: 'snout',
                      mode: 'markers',
                      marker: { color: '#8100FF' },
                    },
                    {
                      x: [graphHeadX[currentTimeFrame]],
                      y: [graphHeadY[currentTimeFrame]],
                      type: 'scatter',
                      name: 'head',
                      mode: 'markers',
                      marker: { color: '#00B6F3' },
                    },
                    {
                      x: [graphFLeftLegX[currentTimeFrame]],
                      y: [graphFLeftLegY[currentTimeFrame]],
                      type: 'scatter',
                      name: 'front left leg',
                      mode: 'markers',
                      marker: { color: '#5EF1BD' },
                    },
                    {
                      x: [graphFRightLegX[currentTimeFrame]],
                      y: [graphFRightLegY[currentTimeFrame]],
                      type: 'scatter',
                      name: 'front right leg',
                      mode: 'markers',
                      marker: { color: '#89F9BC' },
                    },
                    {
                      x: [graphBLeftLegX[currentTimeFrame]],
                      y: [graphBLeftLegY[currentTimeFrame]],
                      type: 'scatter',
                      name: 'back left leg',
                      mode: 'markers',
                      marker: { color: '#A88054' },
                    },
                    {
                      x: [graphBRightLegX[currentTimeFrame]],
                      y: [graphBRightLegY[currentTimeFrame]],
                      type: 'scatter',
                      name: 'back right leg',
                      mode: 'markers',
                      marker: { color: '#FBB667' },
                    },
                    {
                      x: [graphTailBaseX[currentTimeFrame]],
                      y: [graphTailBaseY[currentTimeFrame]],
                      type: 'scatter',
                      name: 'tail base',
                      mode: 'markers',
                      marker: { color: '#FF7032' },
                    },
                  ]}
                  layout={{
                    width: 700,
                    height: 700,
                    xaxis: { range: [0, 1280] },
                    yaxis: { range: [0, 720] },
                    title: 'Mouse Tracking Result',
                  }}
                />
                <Slider
                  defaultValue={1}
                  valueLabelDisplay="on"
                  onChange={(e) => {
                    setCurrentTimeFrame(e.target.value);
                  }}
                  min={1}
                  max={timeFrame}
                  orientation="horizontal"
                /> */}
              </>
            )}
            {resultImg && resultImg != '' && graph3DViewModeSelected && (
              <>
                {/* <Plot
                  data={[
                    {
                      x: graphTimeFrame,
                      y: graphSnoutX,
                      z: graphSnoutY,
                      type: 'scatter3d',
                      name: 'snout',
                      mode: 'markers',
                      marker: { color: '#8100FF', size: 2 },
                    },
                    {
                      x: graphTimeFrame,
                      y: graphHeadX,
                      z: graphHeadY,
                      type: 'scatter3d',
                      name: 'head',
                      mode: 'markers',
                      marker: { color: '#00B6F3', size: 2 },
                    },
                    {
                      x: graphTimeFrame,
                      y: graphFLeftLegX,
                      z: graphFLeftLegY,
                      type: 'scatter3d',
                      name: 'front left leg',
                      mode: 'markers',
                      marker: { color: '#5EF1BD', size: 2 },
                    },
                    {
                      x: graphTimeFrame,
                      y: graphFRightLegX,
                      z: graphFRightLegY,
                      type: 'scatter3d',
                      name: 'front right leg',
                      mode: 'markers',
                      marker: { color: '#89F9BC', size: 2 },
                    },
                    {
                      x: graphTimeFrame,
                      y: graphBLeftLegX,
                      z: graphBLeftLegY,
                      type: 'scatter3d',
                      name: 'back left leg',
                      mode: 'markers',
                      marker: { color: '#A88054', size: 2 },
                    },
                    {
                      x: graphTimeFrame,
                      y: graphBRightLegX,
                      z: graphBRightLegY,
                      type: 'scatter3d',
                      name: 'back right leg',
                      mode: 'markers',
                      marker: { color: '#FBB667', size: 2 },
                    },
                    {
                      x: graphTimeFrame,
                      y: graphTailBaseX,
                      z: graphTailBaseY,
                      type: 'scatter3d',
                      name: 'tail base',
                      mode: 'markers',
                      marker: { color: '#FF7032', size: 2 },
                    },
                  ]}
                  layout={{
                    width: 700,
                    height: 700,
                    yaxis: { range: [0, 1280] },
                    zaxis: { range: [0, 720] },
                    title: 'Mouse Tracking Result',
                  }}
                /> */}
              </>
            )}
          </div>
        </Container>

        {isLoading && (
          <ProgressBar
            completed={progress}
            margin="10px 0"
            bgColor="#1976d2"
            height="13px"
          />
        )}
      </Modal>
    </>
  );
};
export default connect(mapStateToProps)(MouseTrackDialog);
