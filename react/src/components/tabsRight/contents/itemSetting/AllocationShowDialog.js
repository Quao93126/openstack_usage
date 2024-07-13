import React, { useState, useEffect } from 'react';

import { connect, useSelector } from 'react-redux';
import { Modal } from 'antd';
import Draggable from 'react-draggable';
import store from '@/reducers';
import { Col, Row } from 'react-bootstrap';
import { Box, Tab, Tabs } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import BasicDL from './contents/methods/BasicDL';
import BasicML from './contents/methods/BasicML';
import AdvanceDL from './contents/methods/AdvanceDL';
import AdvanceML from './contents/methods/AdvanceML';
import ProgressBar from '@ramonak/react-progress-bar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { getImageUrl } from '@/helpers/file';
import { isNull } from 'lodash';
import * as api_experiment from '@/api/experiment';
import { useFlagsStore } from '@/state';

const mapStateToProps = (state) => ({
  showAllocationCallDialog: state.measure.showAllocationCallDialog,
});

const AllocationShowDialog = (props) => {
  const [progress, setProgress] = useState(0);
  const maxDialogWidth = 800;
  const [visible, setVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(true);
  const [disabled, setDisabled] = useState(true);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const [showFooter, setShowFooter] = useState(true);
  const draggleRef = React.createRef();

  //Here is the parameters for DL and ML method
  const [diameter, setDiameter] = React.useState(30);
  const [segment, setSegment] = React.useState(0);
  const [f_threshold, setF_Threshold] = React.useState(0.4);
  const [c_threshold, setC_Threshold] = React.useState(0.0);
  const [s_threshold, setS_Threshold] = React.useState(0.0);
  const [chan2, setChan2] = React.useState(0);
  const [outline, setOutline] = React.useState(0);

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

  const [currentColor, setCurrentColor] = useState('S');
  const [currentMethod, setCurrentMethod] = useState('DL');
  const [currentMethodLevel, setCurrentMethodLevel] = useState('basic');

  useEffect(() => {
    setVisible(props.showAllocationCallDialog);
  }, [props]);

  const handleTest = () => {
    // store.dispatch({
    //   type: 'UPDATE_ALLOCATION_CALL_DIALOG_POPUP_STATUS',
    //   payload: false,
    // });
    if (currentMethodLevel === 'advance') {
      if (!checkPassword()) {
        setIsPasswordCorrect(false);
        return;
      }

      setProgress(0);
      setIsLoading(true);
      useFlagsStore.setState({ DialogLoadingFlag: true });

      //do process

      setProgress(100);
      useFlagsStore.setState({ DialogLoadingFlag: false });
      setIsLoading(false);
    } else {
    }
  };

  const checkPassword = () => {
    if (password === '') {
      setIsPasswordCorrect(false);
      return false;
    }
    setIsPasswordCorrect(true);
    return true;
  };

  const doAdvanceProcess = async () => {
    if (!checkPassword()) {
      return;
    }

    setIsLoading(true);
    setProgress(0);

    const state = store.getState();
    if (isNull(state.files.imagePathForOrigin)) {
      alert('Please enter your image file!');
      return;
    }
    let imgPath = '';
    if (typeof state.files.imagePathForOrigin === 'string') {
      imgPath = state.files.imagePathForOrigin;
    } else if (typeof state.files.imagePathForOrigin === 'object') {
      imgPath = state.files.imagePathForOrigin[0].path;
    }
    let exp_name = imgPath.split('/');

    setIsLoading(true);
    useFlagsStore.setState({ DialogLoadingFlag: true });

    let modelInfo = {};
    modelInfo.cell_diam = diameter;
    modelInfo.chan_segment = segment;
    modelInfo.chan_2 = chan2;
    modelInfo.f_threshold = f_threshold;
    modelInfo.c_threshold = c_threshold;
    modelInfo.s_threshold = s_threshold;
    modelInfo.outline = outline;
    let initProgress = 10;
    let timeInterval = setInterval(() => {
      initProgress += 10;
      if (initProgress >= 100) {
        initProgress = 100;
      }
      setProgress(initProgress);
      if (initProgress === 100) {
        clearInterval(timeInterval);
      }
    }, 4000);
    let result = await api_experiment.dlTestSegment(
      imgPath,
      exp_name,
      modelInfo,
    );
    let imagePathForAvivator = null;
    if (result.data.error) {
      //alert("Error occured while getting the tree")
    } else {
      if (result.data.success === 'NO') {
        alert(
          'Your custom model is not suitable for this image. Please choose another model',
        );
        return;
      }
      let file_path = result.data.success;
      const file = await getImageUrl(file_path, false, true);
      if (file) {
        imagePathForAvivator = file;
        store.dispatch({
          type: 'set_image_path_for_avivator',
          content: imagePathForAvivator,
        });
      }
    }
    useFlagsStore.setState({ DialogLoadingFlag: false });
    setIsLoading(false);
  };

  const doBasicProcess = async () => {
    setIsLoading(true);
    setProgress(0);

    const state = store.getState();
    if (isNull(state.files.imagePathForOrigin)) {
      alert('Please enter your image file!');
      return;
    }
    let imgPath = '';
    if (typeof state.files.imagePathForOrigin === 'string') {
      imgPath = state.files.imagePathForOrigin;
    } else if (typeof state.files.imagePathForOrigin === 'object') {
      imgPath = state.files.imagePathForOrigin[0].path;
    }
    let exp_name = imgPath.split('/');

    setIsLoading(true);
    useFlagsStore.setState({ DialogLoadingFlag: true });

    let modelInfo = {};
    modelInfo.cell_diam = diameter;
    modelInfo.chan_segment = segment;
    modelInfo.chan_2 = chan2;
    modelInfo.f_threshold = f_threshold;
    modelInfo.c_threshold = c_threshold;
    modelInfo.s_threshold = s_threshold;
    modelInfo.outline = outline;
    let initProgress = 10;
    let timeInterval = setInterval(() => {
      initProgress += 10;
      if (initProgress >= 100) {
        initProgress = 100;
      }
      setProgress(initProgress);
      if (initProgress === 100) {
        clearInterval(timeInterval);
      }
    }, 4000);
    let result = await api_experiment.dlTestSegment(
      imgPath,
      exp_name,
      modelInfo,
    );
    let imagePathForAvivator = null;
    if (result.data.error) {
      //alert("Error occured while getting the tree")
    } else {
      if (result.data.success === 'NO') {
        alert(
          'Your custom model is not suitable for this image. Please choose another model',
        );
        return;
      }
      let file_path = result.data.success;
      const file = await getImageUrl(file_path, false, true);
      if (file) {
        imagePathForAvivator = file;
        store.dispatch({
          type: 'set_image_path_for_avivator',
          content: imagePathForAvivator,
        });
      }
    }
    useFlagsStore.setState({ DialogLoadingFlag: false });
    setIsLoading(false);
  };

  const handleSelect = (e) => {
    if (currentMethodLevel === 'advance') {
      doAdvanceProcess();
    } else {
      doBasicProcess();
    }
    // store.dispatch({
    //   type: 'UPDATE_ALLOCATION_CALL_DIALOG_POPUP_STATUS',
    //   payload: false,
    // });
  };

  const handleCancel = (e) => {
    store.dispatch({
      type: 'UPDATE_ALLOCATION_CALL_DIALOG_POPUP_STATUS',
      payload: false,
    });
  };

  const handleColorTabChange = (event, value) => {
    setCurrentColor(value);
  };

  const handleProcessMethodChange = (event, value) => {
    setCurrentMethod(value);
  };

  const handleProcessMethodLevelChange = (event, value) => {
    setCurrentMethodLevel(value);
  };

  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <Modal
        mask={false}
        maskClosable={false}
        keyboard={false}
        wrapClassName="aaa"
        width={848}
        style={{
          position: 'fixed',
          // transform: 'translateX(-50%)',
          left: (document.body.clientWidth - 848) / 2,
        }}
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
            <div className="flex justify-between items-end">
              <div className="flex">
                <div className="flex flex-col justify-between">
                  <div>Allocation of AI Method</div>
                </div>
              </div>
            </div>
          </div>
        }
        footer={
          !showFooter
            ? null
            : [
                <div className="flex justify-content-center">
                  <button
                    onClick={handleTest}
                    className="btn btn-outline-dark"
                    style={{ marginRight: '10px' }}
                  >
                    Test
                  </button>
                  <button
                    onClick={handleSelect}
                    className="btn btn-outline-dark"
                    style={{ marginRight: '10px' }}
                  >
                    Select
                  </button>
                  <button onClick={handleCancel} className="btn btn-primary">
                    Cancel
                  </button>
                </div>,
              ]
        }
        visible={visible}
        onOk={handleSelect}
        onCancel={handleCancel}
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
        <div className="mx-1 my-1" style={{ width: 750 }}>
          <TabContext>
            <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
              <Tabs
                onChange={handleColorTabChange}
                textColor="secondary"
                indicatorColor="secondary"
                value={currentColor}
              >
                <Tab label="ChS" value="S" />
                <Tab label="ChB" value="B" />
                <Tab label="ChG" value="G" />
                <Tab label="ChR" value="R" />
                <Tab label="ChC" value="C" />
                <Tab label="ChY" value="Y" />
                <Tab label="ChM" value="M" />
              </Tabs>
            </Box>
            <TabPanel>
              <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                <Tabs
                  onChange={handleProcessMethodChange}
                  textColor="primary"
                  indicatorColor="primary"
                  value={currentMethod}
                >
                  <Tab label="Deep Learning" value="DL" />
                  <Tab label="Machine Learning" value="ML" />
                </Tabs>
              </Box>
              <TabPanel>
                <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                  <Tabs
                    onChange={handleProcessMethodLevelChange}
                    textColor="primary"
                    indicatorColor="primary"
                    value={currentMethodLevel}
                  >
                    <Tab label="Basic" value="basic" />
                    <Tab label="Advance" value="advance" />
                  </Tabs>
                </Box>

                {currentMethodLevel == 'basic' && currentMethod == 'DL' && (
                  <TabPanel>
                    <BasicDL />
                  </TabPanel>
                )}
                {currentMethodLevel == 'basic' && currentMethod == 'ML' && (
                  <TabPanel>
                    <BasicML />
                  </TabPanel>
                )}
                {currentMethodLevel == 'advance' && currentMethod == 'DL' && (
                  <TabPanel>
                    <AdvanceDL />
                  </TabPanel>
                )}
                {currentMethodLevel == 'advance' && currentMethod == 'ML' && (
                  <TabPanel>
                    <AdvanceML />
                  </TabPanel>
                )}
              </TabPanel>
            </TabPanel>
          </TabContext>
          {currentMethodLevel == 'advance' && (
            <div>
              <Typography className="pb-3">
                Please type your password to use this advance mode.
              </Typography>
              <TextField
                id="outlined-password-input"
                label="Password"
                type="password"
                className="pb-3"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                autoComplete="current-password"
              />
              {isPasswordCorrect == false && (
                <Alert severity="error">
                  <AlertTitle>Error</AlertTitle>
                  Password is incorrect, please type again.
                </Alert>
              )}
            </div>
          )}
        </div>
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
export default connect(mapStateToProps)(AllocationShowDialog);
