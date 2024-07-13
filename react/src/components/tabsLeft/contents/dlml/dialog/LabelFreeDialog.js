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
import { TextField, Typography } from '@mui/material';
import Objective from '@/components/tabsRight/contents/viewcontrol/Objective';

const mapStateToProps = (state) => ({
  showLabelFreeDialog: state.measure.showLabelFreeDialog,
});

const LabelFreeDialog = (props) => {
  const [sensitivity, setSensitivity] = useState(50);
  const [type, setType] = useState('a');
  const [viewMode, setViewMode] = useState('merge');

  const [visible, setVisible] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [isTested, setIsTested] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [showFooter, setShowFooter] = useState(true);

  const imagePathForAvivator = useSelector(
    (state) => state.files.imagePathForAvivator,
  );
  const imagePathForOrigin = useSelector(
    (state) => state.files.imagePathForOrigin,
  );

  const draggleRef = React.createRef();

  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });

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

  useEffect(() => {
    setVisible(props.showLabelFreeDialog);
    setIsTested(false);
  }, [props]);

  const close = (event, reason) => {
    // useFlagsStore.setState({ MLDialogICTSelectFlag: false });
    store.dispatch({
      type: 'UPDATE_LABEL_FREE_METHOD_DIALOG_STATUS',
      payload: false,
    });
  };

  const doLabelFreeMethodMeasure = async () => {
    try {
      let sensitivityValue = 50;

      let _payload = {
        original_image_url: imagePathForOrigin,
        sensitivity: sensitivityValue,
      };

      let res = await api_experiment.MLLabelFreeProcessImage(_payload);

      return res;
    } catch {
      alert('Internal Server Error. Please try again');
      return '';
    }
  };

  const handleSelectedMethod = async () => {
    let source = await doLabelFreeMethodMeasure();

    let coloredResultPath = source.result_image_path;
    let resultDirPath = source.file_path;
    let tempImagePath = source.temp_image_path;

    store.dispatch({
      type: 'set_image_path_for_avivator',
      content: tempImagePath,
    });

    store.dispatch({
      type: 'UPDATE_LABEL_FREE_METHOD_SELECT_DIALOG_STATUS',
      payload: true,
    });

    store.dispatch({
      type: 'UPDATE_LABEL_FREE_METHOD_DIALOG_STATUS',
      payload: false,
    });

    store.dispatch({
      type: 'SET_LABEL_FREE_SEGMENT_RESULT_DIR_PATH',
      payload: resultDirPath,
    });
  };

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
            <div className="d-flex border-bottom">
              <DialogTitle>Label Free C0 Method</DialogTitle>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
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
            <Col xs={12} className="card border">
              <h6 className="pb-3">Select Series</h6>
              <div className="ms-5">
                <Button className="mx-3">Call</Button>
                <Button>Clear</Button>
              </div>
            </Col>

            <Col xs={12}>
              <div className="card border has-title">
                <Objective />
              </div>
            </Col>

            <Col xs={12}>
              <div className="card border has-title">
                <div className="card-title">
                  <Typography>Sensitivity </Typography>
                </div>
                <Row style={{ padding: '20px', margin: '20' }}>
                  <Col xs={8}>
                    <Slider
                      type=" slider"
                      id="slider"
                      defaultValue={50}
                      value={sensitivity}
                      min={0}
                      max={100}
                      onChange={(e, newValue) => {
                        setSensitivity(newValue);
                      }}
                    />
                  </Col>
                  <Col xs={4}>
                    <TextField type="number" size="small" value={sensitivity} />
                  </Col>
                </Row>
              </div>
            </Col>

            {isLoading && (
              <ProgressBar
                completed={progress}
                margin="10px 0"
                bgColor="#1976d2"
                height="13px"
              />
            )}
          </Row>
        </div>
      </Modal>
    </>
  );
};

export default connect(mapStateToProps)(LabelFreeDialog);
