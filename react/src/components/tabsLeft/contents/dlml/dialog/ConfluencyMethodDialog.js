import * as React from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import { useFlagsStore, useViewerStore } from '@/state';
import { Col, Row } from 'react-bootstrap';
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
import { Modal } from 'antd';
import Draggable from 'react-draggable';
import { getMeasureImage } from '@/api/image';
import ProgressBar from '@ramonak/react-progress-bar';
import {
  Box,
  FormGroup,
  IconButton,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import Button from '@mui/material/Button';

const mapStateToProps = (state) => ({
  showConfluencyMethodDialog: state.measure.showConfluencyMethodDialog,
});

const ConfluencyMethodDialog = (props) => {
  const [title, setTitle] = useState('Mridge');

  const DialogICTSelectFlag = useFlagsStore(
    (store) => store.MLDialogMfiberSelectFlag,
  );
  const [sensitivity, setSensitivity] = useState(30);
  const [progress, setProgress] = useState(0);
  const [viewMode, setViewMode] = useState('merge');

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
  const imagePathForAvivator = useSelector(
    (state) => state.files.imagePathForAvivator,
  );
  const imagePathForOrigin = useSelector(
    (state) => state.files.imagePathForOrigin,
  );

  useEffect(() => {
    setVisible(props.showConfluencyMethodDialog);
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
      type: 'UPDATE_CONFLUENCY_METHOD_DIALOG_STATUS',
      payload: false,
    });
  };

  const handleBackdropClick = (e) => {
    e.stopPropagation();
    return false;
  };

  const doMeasure = async () => {
    setIsLoading(true);
    const state = store.getState();
    let fullPath = state.files.imagePathForOrigin;
    let subPath = /path=(.*)/.exec(fullPath)[1];
    let imgPath = subPath.split('/').slice(1).join('/');

    try {
      setProgress(10);
      useFlagsStore.setState({ DialogLoadingFlag: true });
      let _payload = {
        original_image_url: imgPath,
        sensitivity,
      };
      store.dispatch({
        type: 'UPDATE_ML_MEASURE_PARAMS',
        payload: {
          sensitivity,
        },
      });
      let res = await api_experiment.DLMRIDGEProcessImage(_payload);

      //console.log(res);

      setProgress(60);
      store.dispatch({
        type: 'set_measure_result_zip_path',
        content: res.zip_path,
      });
      _payload = {
        image_path: res.image_path,
        original_image_path: imgPath,
      };
      res = await api_experiment.MLConvertResult(_payload);
      setProgress(100);
      useFlagsStore.setState({ DialogLoadingFlag: false });
      let source = getImageUrl(res.image_path, false, true);
      let source1 = getImageUrl(res.count_path, false, true);
      store.dispatch({ type: 'set_image_path_for_result', content: source1 });
      store.dispatch({
        type: 'set_image_path_for_count_result',
        content: source1,
      });
      store.dispatch({
        type: 'set_csv_path_for_result',
        content: res.csv_path,
      });
      setIsTested(true);
      setIsLoading(false);
      return source1;
    } catch (e) {
      setIsLoading(false);
      alert('Internal Server Error. Please try again');
      return '';
    }
  };

  const handleTest = async () => {
    let source = await doMeasure();
    if (source) {
      let content = await getMeasureImage([imagePathForOrigin, source]);
      store.dispatch({ type: 'set_image_path_for_avivator', content: content });
    }
  };

  const handleChangeViewMode = (e, newViewMode) => {
    e.stopPropagation();
    setViewMode(newViewMode);
  };

  const handleSelectedMethod = async () => {
    if (!isTested) {
      await doMeasure();
    } else {
      store.dispatch({
        type: 'set_image_path_for_avivator',
        content: imagePathForOrigin,
      });
    }
    store.dispatch({
      type: 'UPDATE_CONFLUENCY_METHOD_DIALOG_STATUS',
      payload: false,
    });
  };

  return (
    <>
      <Modal
        mask={false}
        maskClosable={false}
        keyboard={false}
        wrapClassName="aaa"
        width={920}
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
            <div className="d-flex border-bottom">
              <DialogTitle>Confluency Method</DialogTitle>
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
        <div className="mx-3 my-2" style={{ width: 880, padding: '20px' }}>
          <Row>
            <Col xs={6}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '15px',
                }}
              >
                <Typography style={{ marginRight: '15px' }}>
                  {' '}
                  Patient ID
                </Typography>
                <input
                  id="outlined-basic"
                  label="Patient ID"
                  variant="outlined"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Typography style={{ marginRight: '15px' }}> Date</Typography>
                <input type="date" id="start" name="trip-start" />
              </div>
            </Col>
            <Col xs={3}></Col>

            <Col xs={2}>
              <Button
                variant="contained"
                color="primary"
                component="label"
                style={{ marginTop: '20px' }}
              >
                Select
              </Button>
            </Col>
          </Row>
          <Row>
            <Col xs={4}>
              <div
                class="container"
                style={{
                  position: 'relative',
                  height: '172px',
                  height: '172px',
                  border: 'solid 1px blue',
                  justifyContent: 'center',
                  marginTop: '20px',
                }}
              >
                <img
                  src=" "
                  alt="OB2X Image"
                  style={{
                    width: '100%',
                    height: 'auto',
                    opacity: '0',
                    minWidth: '172px',
                  }}
                />
                <div
                  class="topleft"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '16px',
                    fontSize: '18px',
                  }}
                >
                  2X
                </div>
              </div>
            </Col>
            <Col xs={4}>
              <div
                class="container"
                style={{
                  position: 'relative',
                  height: '172px',
                  height: '172px',
                  border: 'solid 1px blue',
                  justifyContent: 'center',
                  marginTop: '20px',
                }}
              >
                <img
                  src=" "
                  alt="OB10X Image"
                  style={{
                    width: '100%',
                    height: 'auto',
                    opacity: '0',
                    minWidth: '172px',
                  }}
                />
                <div
                  class="topleft"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '16px',
                    fontSize: '18px',
                  }}
                >
                  10X
                </div>
              </div>
            </Col>
            <Col xs={4}>
              <div
                class="container"
                style={{
                  position: 'relative',
                  height: '172px',
                  height: '172px',
                  border: 'solid 1px blue',
                  justifyContent: 'center',
                  marginTop: '20px',
                }}
              >
                <img
                  src=" "
                  alt="OB20X Image"
                  style={{
                    width: '100%',
                    height: 'auto',
                    opacity: '0',
                    minWidth: '172px',
                  }}
                />
                <div
                  class="topleft"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '16px',
                    fontSize: '18px',
                  }}
                >
                  20X
                </div>
              </div>
            </Col>
          </Row>
          <Row style={{ marginTop: 20 }}>
            <Typography style={{ marginLeft: 20 }}>XX %</Typography>
          </Row>
          <Row>
            <Button
              variant="contained"
              color="primary"
              component="label"
              style={{ marginTop: '20px' }}
            >
              Add
            </Button>
          </Row>

          <Row>
            <Col xs={2}></Col>
            <Col xs={4}>
              <Box component="section" sx={{ p: 2, border: '1px dashed grey' }}>
                <Row>
                  <Button
                    variant="contained"
                    color="primary"
                    component="label"
                    style={{ marginTop: '20px', marginLeft: '10px' }}
                  >
                    Excel
                  </Button>
                </Row>
                <Row>
                  <Button
                    variant="contained"
                    color="primary"
                    component="label"
                    style={{ marginTop: '20px', marginLeft: '10px' }}
                  >
                    Report
                  </Button>
                </Row>
              </Box>
            </Col>
            <Col xs={4}>
              <Box component="section" sx={{ p: 2, border: '1px dashed grey' }}>
                <Row>
                  <FormGroup>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Fast"
                    />
                  </FormGroup>
                </Row>
                <Row>
                  <Button
                    variant="contained"
                    color="primary"
                    component="label"
                    style={{ marginTop: '20px', marginLeft: '10px' }}
                  >
                    Confluency
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    component="label"
                    style={{ marginTop: '20px', marginLeft: '10px' }}
                  >
                    With Quality Judgement
                  </Button>
                </Row>
              </Box>
            </Col>
            <Col>
              <Tooltip title="Setting">
                <IconButton>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
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
export default connect(mapStateToProps)(ConfluencyMethodDialog);
