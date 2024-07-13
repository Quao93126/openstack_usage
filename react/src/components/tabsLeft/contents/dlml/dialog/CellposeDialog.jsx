import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import { useFlagsStore } from '@/state';
import { Row, Col, Button, Form } from 'react-bootstrap';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import store from '@/reducers';
import * as api_experiment from '@/api/experiment';
import { isNull } from 'lodash';
import { connect, useSelector } from 'react-redux';
import { getImageUrl } from '@/helpers/file';
import { Modal } from 'antd';
import Draggable from 'react-draggable';
import { useState, useEffect } from 'react';
import ProgressBar from '@ramonak/react-progress-bar';
import Channel from '@/components/tabsRight/contents/viewcontrol/Channel';
import { Slider } from '@mui/material';

const mapStateToProps = (state) => ({
  showCellPoseDialog: state.measure.showCellPoseDialog,
});

const CellposeDialog = (props) => {
  const DialogCellposeFlag = useFlagsStore((store) => store.DialogCellposeFlag);
  const state = store.getState();
  const [selectedMethod, setSelectedMethod] = React.useState(
    state.experiment.method,
  );
  const [customName] = React.useState(state.experiment.custom_name);
  const imagePathForOrigin = useSelector(
    (state) => state.files.imagePathForOrigin,
  );
  const segInfo = state.experiment.seg_info;
  const methods = {
    tissuenet: 'TissueNet',
    nuclei: 'Nuclei',
    cyto: 'Cyto',
    layer: 'Layer',
    Wafer: 'wafer',
    livecell: 'LiveCell',
    cyto2: 'Cyto2',
    CP: 'CP',
    CPx: 'CPx',
    TN1: 'TN1',
    TN2: 'TN2',
    TN3: 'TN3',
    LC1: 'LC1',
    LC2: 'LC2',
    LC3: 'LC3',
    LC4: 'LC4',
  };
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const [showFooter, setShowFooter] = useState(true);
  const draggleRef = React.createRef();
  useEffect(() => {
    setVisible(props.showCellPoseDialog);
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

  const close = (_event, reason) => {
    if (reason !== 'backdropClick') {
      useFlagsStore.setState({ IsMLAdvance: false });
      useFlagsStore.setState({ DialogBasicFlag: true });
      // useFlagsStore.setState({ DialogCellposeFlag: false });
    }
    store.dispatch({
      type: 'UPDATE_CELL_POSE_DIALOG_STATUS',
      payload: false,
    });
  };

  const doTest = async () => {
    try {
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
      useFlagsStore.setState({ DialogCustomFlag: false });
      useFlagsStore.setState({ DialogLoadingFlag: true });
      setIsLoading(true);
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
    } catch (e) {
      setIsLoading(false);
      alert('Internal Server Error. Please try again');
    }
  };

  const action = () => {
    segInfo.custom_name = customName;
    segInfo.custom_method = selectedMethod;
    segInfo.outline = outline;
    segInfo.cell_diam = diameter;
    segInfo.chan_segment = segment;
    segInfo.chan_2 = chan2;
    segInfo.f_threshold = f_threshold;
    segInfo.c_threshold = c_threshold;
    segInfo.s_threshold = s_threshold;
    store.dispatch({ type: 'set_seg_info', content: segInfo });
    // useFlagsStore.setState({ DialogCellposeFlag: false });
    useFlagsStore.setState({ DialogCustomNameFlag: true });
    store.dispatch({
      type: 'set_image_path_for_avivator',
      content: imagePathForOrigin,
    });
    store.dispatch({
      type: 'UPDATE_CELL_POSE_DIALOG_STATUS',
      payload: false,
    });
  };

  const [outline, setOutline] = React.useState(0);
  const handleOutline = (event) => {
    setOutline(event.target.value);
  };

  const [diameter, setDiameter] = React.useState(30);
  const handleDiam = (event) => {
    setDiameter(event.target.value);
  };

  const [segment, setSegment] = React.useState(0);

  const handleChangeSegment = (event) => {
    setSegment(event.target.value);
  };
  const [chan2, setChan2] = React.useState(0);

  const handleChangeChan2 = (event) => {
    setChan2(event.target.value);
  };

  const [f_threshold, setF_Threshold] = React.useState(0.4);
  const handleF_Threshold = (event) => {
    setF_Threshold(event.target.value);
  };

  const [c_threshold, setC_Threshold] = React.useState(0.0);
  const handleC_Threshold = (event) => {
    setC_Threshold(event.target.value);
  };

  const [s_threshold, setS_Threshold] = React.useState(0.0);
  const handleS_Threshhold = (event) => {
    setS_Threshold(event.target.value);
  };

  const handleBackdropClick = (e) => {
    //these fail to keep the modal open
    e.stopPropagation();
    return false;
  };

  return (
    <>
      <Modal
        mask={false}
        maskClosable={false}
        keyboard={false}
        wrapClassName="aaa"
        width={450}
        style={{
          position: 'fixed',
          // transform: 'translateX(-50%)',
          left: (document.body.clientWidth - 450) / 2,
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
              <DialogTitle>{`${customName}-${methods[selectedMethod]}`}</DialogTitle>
            </div>
          </div>
        }
        footer={
          !showFooter
            ? null
            : [
                <div className="flex justify-content-center">
                  <Button variant="contained" onClick={doTest}>
                    Test
                  </Button>
                  <Button variant="contained" onClick={action}>
                    Set
                  </Button>
                  <Button variant="contained" onClick={close}>
                    Cancel
                  </Button>
                </div>,
              ]
        }
        visible={visible}
        onOk={action}
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
        <div>
          <Row>
            <Col xs={12}>
              <Channel />
            </Col>
            <Col xs={12}>
              <div className="pt-3 px-3 pb-1 border-bottom">
                {/* <h6>Drawing</h6> */}
                <h6>Select the result image</h6>
                <div>
                  <Row className="mt-3">
                    <Col xs={6} className="mt-3">
                      <FormControl fullWidth>
                        <InputLabel id="segment-label">Result Image</InputLabel>
                        <Select
                          labelId="segment-label"
                          id="segment-label-select"
                          value={outline}
                          label="result type"
                          onChange={handleOutline}
                        >
                          <MenuItem value={0}>Predicted Outlines</MenuItem>
                          <MenuItem value={1}>Predicted Masks</MenuItem>
                          <MenuItem value={2}>Predicted</MenuItem>
                        </Select>
                      </FormControl>
                    </Col>
                  </Row>
                </div>
              </div>
              <div className="pt-2 px-3 pb-1 border-bottom">
                <Row>
                  <Col xs={6}>
                    <h6 className="mt-2">Segmentation</h6>
                  </Col>
                  <Col xs={6}>
                    {/*    <FormControlLabel control={<Checkbox/>} label="use GPU"/>*/}
                  </Col>
                </Row>
                <Row className="mt-0">
                  <Col xs={12}>
                    <Form.Label>cell diameter (pixels)</Form.Label>
                  </Col>
                  <Col xs={6}>
                    <Slider
                      defaultValue={30}
                      value={diameter}
                      onChange={handleDiam}
                      aria-label="thresold slider"
                    />
                    {diameter}
                    {/* <Form.Control
                      type="number"
                      value={diameter}
                      onChange={handleDiam}
                    /> */}
                  </Col>
                  {/* <Button variant="primary">callbrate</Button> */}
                  <Col xs={6}></Col>
                  <Col xs={6} className="mt-3">
                    <FormControl fullWidth>
                      <InputLabel id="segment-label">Segment Color</InputLabel>
                      <Select
                        labelId="segment-label"
                        id="segment-label-select"
                        value={segment}
                        label="chan to segment"
                        onChange={handleChangeSegment}
                      >
                        <MenuItem value={0}>0: gray</MenuItem>
                        <MenuItem value={1}>1: R</MenuItem>
                        <MenuItem value={2}>2: G</MenuItem>
                        <MenuItem value={3}>3: B</MenuItem>
                      </Select>
                    </FormControl>
                  </Col>
                  <Col xs={6} className="mt-3">
                    <FormControl fullWidth>
                      <InputLabel id="chan2-label">Nuclei Color</InputLabel>
                      <Select
                        labelId="chan2-label"
                        id="chan2-select"
                        value={chan2}
                        label="chan2 (optional)"
                        onChange={handleChangeChan2}
                      >
                        <MenuItem value={0}>0: none</MenuItem>
                        <MenuItem value={1}>1: R</MenuItem>
                        <MenuItem value={2}>2: G</MenuItem>
                        <MenuItem value={3}>3: B</MenuItem>
                      </Select>
                    </FormControl>
                  </Col>
                  <Col xs={6} className="mt-3">
                    <Form.Label className="mt-1">flow_threshold</Form.Label>
                  </Col>
                  <Col xs={6} className="mt-3">
                    <Slider
                      defaultValue={0.4}
                      value={f_threshold}
                      step={0.05}
                      max={1}
                      onChange={(e) => handleF_Threshold(e)}
                      aria-label="thresold slider"
                    />
                    {f_threshold}
                    {/* <Form.Control
                      type="text"
                      value={f_threshold}
                      onChange={(e) => handleF_Threshold(e)}
                    /> */}
                  </Col>
                  <Col xs={6} className="mt-3">
                    <Form.Label className="mt-1">cellprob_threshold</Form.Label>
                  </Col>
                  <Col xs={6} className="mt-3">
                    <Slider
                      value={c_threshold}
                      onChange={(e) => handleC_Threshold(e)}
                      aria-label="thresold slider"
                      step={0.05}
                      max={1}
                    />
                    {c_threshold}
                    {/* <Form.Control
                      type="text"
                      value={c_threshold}
                      onChange={(e) => handleC_Threshold(e)}
                    /> */}
                  </Col>
                  <Col xs={6} className="mt-3">
                    <Form.Label className="mt-1">stitch_threshold</Form.Label>
                  </Col>
                  <Col xs={6} className="mt-3">
                    <Slider
                      value={s_threshold}
                      onChange={(e) => handleS_Threshhold(e)}
                      aria-label="thresold slider"
                      step={0.05}
                      max={1}
                    />
                    {s_threshold}
                    {/* <Form.Control
                      type="text"
                      value={s_threshold}
                      onChange={(e) => handleS_Threshhold(e)}
                    /> */}
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
            </Col>
          </Row>
        </div>
      </Modal>
    </>
  );
};
export default connect(mapStateToProps)(CellposeDialog);
