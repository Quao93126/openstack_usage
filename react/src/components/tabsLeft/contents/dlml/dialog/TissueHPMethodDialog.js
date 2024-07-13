import * as React from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import { useFlagsStore } from '@/state';
import { Button, Col, Row } from 'react-bootstrap';
import Checkbox from '@mui/material/Checkbox';
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
import Channel from '@/components/tabsLeft/contents/dlml/dialog/ChannelDialog';
import ToggleButton from '@mui/material/ToggleButton';
import Icon from '@mdi/react';
import { mdiImageCheck, mdiImageOutline } from '@mdi/js';
import { COLORS } from '@/constants';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Modal } from 'antd';
import Draggable from 'react-draggable';
import { getMeasureImage } from '@/api/image';
import ProgressBar from '@ramonak/react-progress-bar';
import { Switch, Typography } from '@mui/material';
import LightMode from '@mui/icons-material/LightMode';
import { Adjust } from '@material-ui/icons';

const mapStateToProps = (state) => ({
  showTissueHPMethodDialog: state.measure.showTissueHPMethodDialog,
});

const pickColorbarStyle = {
  width: '20px',
  height: '100%',
  backgroundColor: 'red' /* For browsers that do not support gradients */,
  backgroundImage:
    'linear-gradient(red,  magenta, yellow,olive,purple, green, darkgreen, turquoise, blue, darkblue,gray, white)',
};

const arrowTriangleStyle = {
  width: '0',
  height: '0',
  borderTop: '6px solid transparent',
  borderBottom: ' 6px solid transparent',
  borderLeft: '6px solid green',
};

const arrowTriangleHideStyle = {
  width: '0',
  height: '0',
  borderTop: '6px solid transparent',
  borderBottom: ' 6px solid transparent',
  borderLeft: '6px solid white',
};

const TissueHPMethodDialog = (props) => {
  const colors = [
    {
      key: 'R',
      value: '0 0 255',
    },
    {
      key: 'B+R',
      value: '255 0 255',
    },
    {
      key: 'G+R',
      value: '0 255 255',
    },

    {
      key: 'S+B+G',
      value: '128 128 0',
    },
    {
      key: 'S+B+R',
      value: '128 0 128',
    },
    {
      key: 'S+G+R',
      value: '0 255 255',
    },

    {
      key: 'G',
      value: '0 128 0',
    },
    {
      key: 'B+G',
      value: '255 255 0',
    },
    {
      key: 'S+G',
      value: '125,255,128',
    },

    {
      key: 'B',
      value: '255 0 0',
    },
    {
      key: 'S+B',
      value: '255,128,128',
    },
    {
      key: 'S',
      value: '128 128 128',
    },
    {
      key: 'S+B+G+R',
      value: '255 255 255',
    },
  ];
  const DialogICTSelectFlag = useFlagsStore(
    (store) => store.MLDialogICTSelectFlag,
  );
  const [sensitivity, setSensitivity] = useState(50);
  const [type, setType] = useState('a');
  const [viewMode, setViewMode] = useState('merge');

  const maxDialogWidth = 800;
  const [visible, setVisible] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [isTested, setIsTested] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedColors, setSelectedColors] = useState(['S']);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const [showFooter, setShowFooter] = useState(true);
  const draggleRef = React.createRef();
  const imagePathForAvivator = useSelector(
    (state) => state.files.imagePathForAvivator,
  );
  const imagePathForOrigin = useSelector(
    (state) => state.files.imagePathForOrigin,
  );

  // useEffect(() => {
  //   if (props.showTissueHPMethodDialog) {
  //     let path = imagePathForOrigin;
  //     if (imagePathForOrigin) {
  //       path = path.replace(
  //         'ashlar_output.ome.tiff',
  //         'test_roi_output.ome.tiff',
  //       );
  //       store.dispatch({
  //         type: 'set_image_path_for_avivator',
  //         content: path,
  //       });
  //     }
  //   }
  // }, [props.showTissueHPMethodDialog, imagePathForOrigin]);

  const [selectedColorOption, setSelectedColorOption] = useState('S');

  // Result Path States
  const [maskResultPath, setMaskResultPath] = useState('');
  const [flowResultPath, setFlowResultPath] = useState('');
  const [dotplotResultPath, setDotPlotResultPath] = useState('');

  const tilingMergedImageFlag = useSelector(
    (state) => state.files.tilingMergedImageFlag,
  );

  //Result Path States for Test ROI
  const [testOriginalResultPath, setTestOriginalResultPath] = useState('');
  const [testMaskResultPath, setTestMaskResultPath] = useState('');
  const [testFlowResultPath, setTestFlowResultPath] = useState('');
  const [testDotplotResultPath, setTestDotPlotResultPath] = useState('');

  //Switch between binarization and dot plot display for result
  const [toggleDotPlotSwitchChecked, setToggleDotPlotSwitchChecked] =
    useState(false);
  const handleToggleDotPlotSwitchChanged = () => {
    setToggleDotPlotSwitchChecked(!toggleDotPlotSwitchChecked);
    const checked = !toggleDotPlotSwitchChecked;
    if (checked) {
      if (flowResultPath === '') return;
      store.dispatch({
        type: 'set_image_path_for_avivator',
        content: flowResultPath,
      });
    } else {
      if (maskResultPath === '') return;
      store.dispatch({
        type: 'set_image_path_for_avivator',
        content: maskResultPath,
      });
    }
  };

  //Swtich Bright Mode
  const [brightModeSelected, SetBrightModeSelected] = useState(false);
  const handleBrightToggleSelected = () => {
    let flag = !brightModeSelected;
    SetBrightModeSelected(flag);

    if (flag) {
      setBinaryModeSelected(false);
    } else {
      setBinaryModeSelected(true);
    }
  };

  // Switch Binary Mode
  const [binaryModeSelected, setBinaryModeSelected] = useState(false);
  const handleBinrayToggleSelected = () => {
    let flag = !binaryModeSelected;
    setBinaryModeSelected(flag);
    if (flag) {
      SetBrightModeSelected(false);
    } else SetBrightModeSelected(true);
  };

  //Switch GPU use select
  const [toggleGPUModeSelected, setToggleGPUModeSelected] = useState(true);

  // Switch between monochrome and color display of colocalization results
  const [toggleOriginalSwitchChecked, setToggleOriginalSwitchChecked] =
    useState(false);
  const handleToggleOriginaltSwitchChanged = () => {
    setToggleOriginalSwitchChecked(!toggleOriginalSwitchChecked);
  };

  useEffect(() => {
    setVisible(props.showTissueHPMethodDialog);
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
    // useFlagsStore.setState({ MLDialogICTSelectFlag: false });
    store.dispatch({
      type: 'UPDATE_TISSUE_HP_METHOD_DIALOG_STATUS',
      payload: false,
    });
  };

  const handleBackdropClick = (e) => {
    e.stopPropagation();
    return false;
  };

  useEffect(() => {
    if (imagePathForAvivator) {
      if (typeof imagePathForAvivator !== 'string') return;
      let path = imagePathForAvivator.toLowerCase();
      if (path.indexOf('pointa') >= 0) {
        setType('a');
      }
      if (path.indexOf('pointb') >= 0) {
        setType('b');
      }
      if (path.indexOf('pointc') >= 0) {
        setType('c');
      }
      if (path.indexOf('pointd') >= 0) {
        setType('d');
      }
    }
  }, [imagePathForAvivator]);

  const getCorrectUrl = (url) => {
    // console.log(url)
    const urlList = url.split('download/?path=');
    let backUrl = '';
    if (urlList.length < 2) return url;
    if (urlList[1][0] == '/') {
      backUrl = urlList[1].substr(1);
    }
    const res = urlList[0] + 'download/?path=' + backUrl;
    return res;
  };

  const doMeasure = async () => {
    try {
      setIsLoading(true);
      setProgress(10);
      const state = store.getState();
      let fullPath = state.files.imagePathForOrigin;
      let imgPath = '';
      if (typeof fullPath === 'string') {
        let subPath = /path=(.*)/.exec(fullPath)[1];
        imgPath = subPath.split('/').slice(1).join('/');
      } else {
        let paths = [];
        for (let i = 0; i < fullPath.length; i++) {
          paths.push(fullPath[i].path);
        }
        imgPath = paths.join(',');
      }

      useFlagsStore.setState({ DialogLoadingFlag: true });

      let _payload = {
        original_image_url: imgPath,
        colors: selectedColors,
        colorOption: selectedColorOption,
        tilingMergedImageFlag: tilingMergedImageFlag,
        sensitivity,
      };

      store.dispatch({
        type: 'UPDATE_ML_MEASURE_PARAMS',
        payload: {
          method: 'TissueHP',
          colors: selectedColors,
          sensitivity,
        },
      });
      let res = await api_experiment.MLTissueNTProcessImage(_payload);

      setProgress(60);

      _payload = {
        image_path: res.image_path,
        mask_output_path: res.mask_output_path,
        flow_output_path: res.flow_output_path,
        dotplot_output_path: res.dotplot_output_path,
      };
      res = await api_experiment.TissueConvertResult(_payload);

      setProgress(100);

      useFlagsStore.setState({ DialogLoadingFlag: false });

      let mask_image_path = getImageUrl(res.mask_output, false, true);
      let flow_image_path = getImageUrl(res.flow_output, false, true);
      let dotplot_image_path = getImageUrl(res.dotplot_output, false, true);

      setFlowResultPath(flow_image_path);
      setMaskResultPath(mask_image_path);
      setDotPlotResultPath(dotplot_image_path);

      //console.log(mask_image_path)

      return [mask_image_path, flow_image_path, dotplot_image_path];
    } catch (e) {
      setIsLoading(false);
      alert('Internal Server Error. Please try again');
      return '';
    }
  };

  const doTestMeasure = async () => {
    try {
      setIsLoading(true);
      setProgress(10);
      const state = store.getState();
      let fullPath = state.files.imagePathForOrigin;
      let imgPath = '';
      if (typeof fullPath === 'string') {
        let subPath = /path=(.*)/.exec(fullPath)[1];
        imgPath = subPath.split('/').slice(1).join('/');
      } else {
        let paths = [];
        for (let i = 0; i < fullPath.length; i++) {
          paths.push(fullPath[i].path);
        }
        imgPath = paths.join(',');
      }

      imgPath = imgPath.replace(
        'ashlar_output.ome.tiff',
        'test_roi_output.ome.tiff',
      );

      setTestOriginalResultPath(imgPath);

      useFlagsStore.setState({ DialogLoadingFlag: true });

      let _payload = {
        original_image_url: imgPath,
        colors: selectedColors,
        colorOption: selectedColorOption,
        tilingMergedImageFlag: tilingMergedImageFlag,
        sensitivity,
      };

      let res = await api_experiment.MLTissueNTTestProcessImage(_payload);

      //console.log(res)

      setProgress(60);

      _payload = {
        image_path: res.image_path,
        mask_output_path: res.mask_output_path,
        flow_output_path: res.flow_output_path,
        dotplot_output_path: res.dotplot_output_path,
      };
      res = await api_experiment.TissueConvertResult(_payload);

      setProgress(100);

      useFlagsStore.setState({ DialogLoadingFlag: false });

      let mask_image_path = getImageUrl(res.mask_output, false, true);
      let flow_image_path = getImageUrl(res.flow_output, false, true);
      let dotplot_image_path = getImageUrl(res.dotplot_output, false, true);

      setTestFlowResultPath(flow_image_path);
      setTestMaskResultPath(mask_image_path);
      setTestDotPlotResultPath(dotplot_image_path);

      //console.log(mask_image_path)

      return [mask_image_path, flow_image_path, dotplot_image_path];
    } catch (e) {
      setIsLoading(false);
      alert('Internal Server Error. Please try again');
      return '';
    }
  };

  const handleTest = async () => {
    if (selectedColors.length === 0) {
      alert('Please select colors');
      return;
    }

    let [mask_image_path, flow_image_path, dotplot_image_path] =
      await doTestMeasure();
    setIsTested(true);
    SetBrightModeSelected(true);
    setToggleOriginalSwitchChecked(true);
  };

  const handleChangeViewMode = (e, newViewMode) => {
    e.stopPropagation();
    setViewMode(newViewMode);
  };

  const handleColorToggle = (color) => {
    let newColors = [].concat(selectedColors);
    if (newColors.indexOf(color) >= 0) {
      newColors.splice(newColors.indexOf(color), 1);
    } else {
      newColors.push(color);
    }
    setSelectedColors(newColors);
    setSelectedColorOption(color);
    const colorObject = colors.find((item) => item.value === color);
    if (colorObject) {
      setSelectedColorOption(colorObject.key);
    }
  };

  const handleSelectedMethod = async () => {
    if (selectedColors.length === 0) {
      alert('Please select colors');
      return;
    }
    await doMeasure();
    setIsTested(false);
    SetBrightModeSelected(true);
    setToggleOriginalSwitchChecked(true);
  };

  const handleDaysChange = (event) => {
    // let value = event.target.value;
    // console.log('handle-days-change:', value);
    setType(event.target.value);
  };

  const handleDragStartEvent = (ev) => {
    ev.dataTransfer.setData('text', ev.target.key);
  };

  const handleDropEvent = (ev) => {
    ev.preventDefault();
  };

  const allowDrop = (ev) => {
    ev.preventDefault();
  };

  const displayResult = () => {
    if (!isTested) {
      if (brightModeSelected) {
        if (toggleOriginalSwitchChecked) {
          store.dispatch({
            type: 'set_image_path_for_avivator',
            content: flowResultPath,
          });
        } else {
          store.dispatch({
            type: 'set_image_path_for_avivator',
            content: imagePathForOrigin,
          });
        }
      } else {
        if (toggleDotPlotSwitchChecked) {
          store.dispatch({
            type: 'set_image_path_for_avivator',
            content: dotplotResultPath,
          });
        } else {
          store.dispatch({
            type: 'set_image_path_for_avivator',
            content: maskResultPath,
          });
        }
      }
    } else {
      if (brightModeSelected) {
        if (toggleOriginalSwitchChecked) {
          store.dispatch({
            type: 'set_image_path_for_avivator',
            content: testFlowResultPath,
          });
        } else {
          store.dispatch({
            type: 'set_image_path_for_avivator',
            content: testOriginalResultPath,
          });
        }
      } else {
        if (toggleDotPlotSwitchChecked) {
          store.dispatch({
            type: 'set_image_path_for_avivator',
            content: testDotplotResultPath,
          });
        } else {
          store.dispatch({
            type: 'set_image_path_for_avivator',
            content: testMaskResultPath,
          });
        }
      }
    }
  };

  //display mode
  useEffect(() => {
    displayResult();
  }, [
    binaryModeSelected,
    brightModeSelected,
    toggleDotPlotSwitchChecked,
    toggleOriginalSwitchChecked,
  ]);

  return (
    <>
      <Modal
        mask={false}
        maskClosable={false}
        keyboard={false}
        wrapClassName="aaa"
        width={527}
        style={{
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
            <div className="d-flex ">
              <Row>
                <DialogTitle>TissueNT Method</DialogTitle>
              </Row>
              <tr />

              <ToggleButton
                style={{ paddingLeft: '15px' }}
                value="check"
                selected={brightModeSelected}
                onChange={handleBrightToggleSelected}
              >
                <LightMode />
              </ToggleButton>
              <Row
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '10px',
                }}
              >
                <Switch
                  disabled={!brightModeSelected}
                  checked={toggleOriginalSwitchChecked}
                  onChange={handleToggleOriginaltSwitchChanged}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
              </Row>

              <ToggleButton
                style={{ paddingLeft: '15px' }}
                value="check"
                selected={binaryModeSelected}
                onChange={handleBinrayToggleSelected}
              >
                <Adjust />
              </ToggleButton>

              <Row
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '10px',
                }}
              >
                <Switch
                  disabled={!binaryModeSelected}
                  checked={toggleDotPlotSwitchChecked}
                  onChange={handleToggleDotPlotSwitchChanged}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
              </Row>

              {/* <ToggleButtonGroup
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
              </ToggleButtonGroup> */}
            </div>
          </div>
        }
        footer={
          !showFooter
            ? null
            : [
                <div className="flex justify-content-center">
                  <Row
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '10px',
                    }}
                  >
                    <Typography>Use GPU</Typography>
                    <Switch
                      checked={toggleGPUModeSelected}
                      onChange={() => {
                        setToggleGPUModeSelected(!toggleGPUModeSelected);
                      }}
                      inputProps={{ 'aria-label': 'controlled' }}
                    />
                  </Row>

                  <button
                    onClick={handleTest}
                    className="btn btn-outline-dark"
                    style={{ marginRight: '10px' }}
                  >
                    Test
                  </button>
                  <button
                    onClick={handleSelectedMethod}
                    className="btn btn-primary"
                    style={{ marginRight: '10px' }}
                  >
                    Select
                  </button>
                  <button
                    onClick={close}
                    className="btn btn-outline-dark"
                    style={{ marginRight: '10px' }}
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
        <div className="mx-3 my-2" style={{ width: 450 }}>
          <Row>
            <Col xs={12}>
              <Channel />
            </Col>
            <Col xs={12}>
              <div className="card border has-title">
                <div className="card-title">
                  <label>Colocalization Color</label>
                </div>
                <div
                  style={{
                    padding: '15px',
                    maxHeight: '300px',
                    overflowY: 'scroll',
                  }}
                >
                  <FormControl component="fieldset" style={{ width: '100%' }}>
                    <Row>
                      <Col xs={10}>
                        {colors.map((color, index) => (
                          <Draggable axis="y" bounds="parent">
                            <div
                              className="Color"
                              key={color}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <FormControlLabel
                                key={index}
                                checked={selectedColors.includes(color.key)}
                                control={
                                  <Checkbox
                                    onChange={() => {
                                      handleColorToggle(color.key);
                                    }}
                                  />
                                }
                                label={color.key}
                              />

                              <div
                                style={
                                  selectedColors.includes(color.key)
                                    ? arrowTriangleStyle
                                    : arrowTriangleHideStyle
                                }
                              ></div>
                            </div>
                          </Draggable>
                        ))}
                      </Col>

                      <Col xs={2}>
                        <div style={pickColorbarStyle} />
                      </Col>
                    </Row>
                  </FormControl>
                </div>
              </div>

              <div
                className="card border has-title"
                style={{ marginTop: '20px' }}
              >
                <div className="card-title">
                  <label>Sensitivity</label>
                </div>
                <div
                  style={{ padding: '15px' }}
                  className="flex-input-container"
                >
                  <Slider
                    value={sensitivity}
                    onChange={(event, newValue) => {
                      setSensitivity(newValue);
                    }}
                    valueLabelDisplay="auto"
                    min={0}
                    max={100}
                    orientation="horizontal"
                  />

                  <InputBase
                    value={sensitivity}
                    type="number"
                    onChange={(event) => {
                      setSensitivity(event.target.value);
                    }}
                  />
                </div>
              </div>
            </Col>
          </Row>
          {isLoading && (
            <ProgressBar
              completed={progress}
              margin="10px 0"
              bgColor="#1976d2"
              height="13px"
            />
          )}
        </div>
      </Modal>
    </>
  );
};

export default connect(mapStateToProps)(TissueHPMethodDialog);
