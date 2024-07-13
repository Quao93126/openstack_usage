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
import {
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import Objective from '@/components/tabsRight/contents/viewcontrol/Objective';

const mapStateToProps = (state) => ({
  showCellPaintingV3Dialog: state.measure.showCellPaintingV3Dialog,
});

const CellPaintingV3 = (props) => {
  const [sensitivity, setSensitivity] = useState(50);

  const [visible, setVisible] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [showFooter, setShowFooter] = useState(true);
  const [viewMode, setViewMode] = useState('merge');

  const [selectedChannelValue, setSelectedChannelValue] = useState('ChannelY');

  const [selectedNucleusChannel, setSelectedNucleusChannel] =
    useState('ChannelY');
  const [selectedNucleoliChannel, setSelectedNucleoliChannel] =
    useState('ChannelB');
  const [selectedApparatusChannel, setSelectedApparatusChannel] =
    useState('ChannelR');
  const [selectedMitochondriaChannel, setSelectedMitochondriaChannel] =
    useState('ChannelG');
  const [selectedCytoskeltonChannel, setSelectedCytoskeltonChannel] =
    useState('ChannelM');
  const [selectedMenbrameChannel, setSelectedMenbrameChannel] =
    useState('ChannelY');
  const [selectedLysosomeChannel, setSelectedLysosomeChannel] =
    useState('ChannelB');

  const getColorFromChannel = (value) => {
    switch (value) {
      case 'ChannelY':
        return 'yellow';
      case 'ChannelB':
        return 'blue';
      case 'ChannelG':
        return 'green';
      case 'ChannelM':
        return 'magenta';
      case 'ChannelR':
        return 'red';
      case 'ChannelC':
        return 'cyan';
    }
  };

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
    setVisible(props.showCellPaintingV3Dialog);
  }, [props]);

  const close = (event, reason) => {
    // useFlagsStore.setState({ MLDialogICTSelectFlag: false });
    store.dispatch({
      type: 'UPDATE_CELL_PAINTING_V3_METHOD_DIALOG_STATUS',
      payload: false,
    });
  };

  const handleSelectedMethod = () => {
    store.dispatch({
      type: 'UPDATE_CELL_PAINTING_V3_SELECT_METHOD_DIALOG_STATUS',
      payload: true,
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
              <DialogTitle>Cell Painting V3 Method</DialogTitle>
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
            <Col xs={12}>
              <div className="card border has-title">
                <div className="card-title">
                  <Typography>Select Organelle </Typography>
                </div>
                <Row style={{ padding: '5', margin: '5' }}>
                  <Col
                    xs={6}
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      display: 'flex',
                    }}
                  >
                    <Typography>Nucleus</Typography>
                  </Col>
                  <Col xs={6}>
                    <FormControl fullWidth>
                      <Select
                        labelId="channel-select"
                        id="channel-select"
                        style={{
                          backgroundColor: getColorFromChannel(
                            selectedNucleusChannel,
                          ),
                        }}
                        label="Channel"
                        value={selectedNucleusChannel}
                        onChange={(e) => {
                          setSelectedNucleusChannel(e.target.value);
                        }}
                      >
                        <MenuItem value={'ChannelY'}>Channel Y</MenuItem>
                        <MenuItem value={'ChannelB'}>Channel B</MenuItem>
                        <MenuItem value={'ChannelC'}>Channel C</MenuItem>
                        <MenuItem value={'ChannelR'}>Channel R</MenuItem>
                        <MenuItem value={'ChannelG'}>Channel G</MenuItem>
                        <MenuItem value={'ChannelM'}>Channel M</MenuItem>
                      </Select>
                    </FormControl>
                  </Col>
                </Row>
                <Row style={{ padding: '5', margin: '5' }}>
                  <Col
                    xs={6}
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      display: 'flex',
                    }}
                  >
                    <Typography>Nucleoli</Typography>
                  </Col>
                  <Col xs={6}>
                    <FormControl fullWidth>
                      <Select
                        labelId="channel-select"
                        id="channel-select"
                        style={{
                          backgroundColor: getColorFromChannel(
                            selectedNucleoliChannel,
                          ),
                        }}
                        label="Channel"
                        value={selectedNucleoliChannel}
                        onChange={(e) => {
                          setSelectedNucleoliChannel(e.target.value);
                        }}
                      >
                        <MenuItem value={'ChannelY'}>Channel Y</MenuItem>
                        <MenuItem value={'ChannelB'}>Channel B</MenuItem>
                        <MenuItem value={'ChannelC'}>Channel C</MenuItem>
                        <MenuItem value={'ChannelR'}>Channel R</MenuItem>
                        <MenuItem value={'ChannelG'}>Channel G</MenuItem>
                        <MenuItem value={'ChannelM'}>Channel M</MenuItem>
                      </Select>
                    </FormControl>
                  </Col>
                </Row>
                <Row style={{ padding: '5', margin: '5' }}>
                  <Col
                    xs={6}
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      display: 'flex',
                    }}
                  >
                    <Typography>ER/Golgi Apparatus</Typography>
                  </Col>
                  <Col xs={6}>
                    <FormControl fullWidth>
                      <Select
                        labelId="channel-select"
                        id="channel-select"
                        style={{
                          backgroundColor: getColorFromChannel(
                            selectedApparatusChannel,
                          ),
                        }}
                        label="Channel"
                        value={selectedApparatusChannel}
                        onChange={(e) => {
                          setSelectedApparatusChannel(e.target.value);
                        }}
                      >
                        <MenuItem value={'ChannelY'}>Channel Y</MenuItem>
                        <MenuItem value={'ChannelB'}>Channel B</MenuItem>
                        <MenuItem value={'ChannelC'}>Channel C</MenuItem>
                        <MenuItem value={'ChannelR'}>Channel R</MenuItem>
                        <MenuItem value={'ChannelG'}>Channel G</MenuItem>
                        <MenuItem value={'ChannelM'}>Channel M</MenuItem>
                      </Select>
                    </FormControl>
                  </Col>
                </Row>
                <Row style={{ padding: '5', margin: '5' }}>
                  <Col
                    xs={6}
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      display: 'flex',
                    }}
                  >
                    <Typography>Mitochondria</Typography>
                  </Col>
                  <Col xs={6}>
                    <FormControl fullWidth>
                      <Select
                        labelId="channel-select"
                        id="channel-select"
                        style={{
                          backgroundColor: getColorFromChannel(
                            selectedMitochondriaChannel,
                          ),
                        }}
                        label="Channel"
                        value={selectedMitochondriaChannel}
                        onChange={(e) => {
                          setSelectedMitochondriaChannel(e.target.value);
                        }}
                      >
                        <MenuItem value={'ChannelY'}>Channel Y</MenuItem>
                        <MenuItem value={'ChannelB'}>Channel B</MenuItem>
                        <MenuItem value={'ChannelC'}>Channel C</MenuItem>
                        <MenuItem value={'ChannelR'}>Channel R</MenuItem>
                        <MenuItem value={'ChannelG'}>Channel G</MenuItem>
                        <MenuItem value={'ChannelM'}>Channel M</MenuItem>
                      </Select>
                    </FormControl>
                  </Col>
                </Row>
                <Row style={{ padding: '5', margin: '5' }}>
                  <Col
                    xs={6}
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      display: 'flex',
                    }}
                  >
                    <Typography>Action Cytoskelton</Typography>
                  </Col>
                  <Col xs={6}>
                    <FormControl fullWidth>
                      <Select
                        labelId="channel-select"
                        id="channel-select"
                        style={{
                          backgroundColor: getColorFromChannel(
                            selectedCytoskeltonChannel,
                          ),
                        }}
                        label="Channel"
                        value={selectedCytoskeltonChannel}
                        onChange={(e) => {
                          setSelectedCytoskeltonChannel(e.target.value);
                        }}
                      >
                        <MenuItem value={'ChannelY'}>Channel Y</MenuItem>
                        <MenuItem value={'ChannelB'}>Channel B</MenuItem>
                        <MenuItem value={'ChannelC'}>Channel C</MenuItem>
                        <MenuItem value={'ChannelR'}>Channel R</MenuItem>
                        <MenuItem value={'ChannelG'}>Channel G</MenuItem>
                        <MenuItem value={'ChannelM'}>Channel M</MenuItem>
                      </Select>
                    </FormControl>
                  </Col>
                </Row>
                <Row style={{ padding: '5', margin: '5' }}>
                  <Col
                    xs={6}
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      display: 'flex',
                    }}
                  >
                    <Typography>Plasma Menbrame</Typography>
                  </Col>
                  <Col xs={6}>
                    <FormControl fullWidth>
                      <Select
                        labelId="channel-select"
                        id="channel-select"
                        style={{
                          backgroundColor: getColorFromChannel(
                            selectedMenbrameChannel,
                          ),
                        }}
                        label="Channel"
                        value={selectedMenbrameChannel}
                        onChange={(e) => {
                          setSelectedMenbrameChannel(e.target.value);
                        }}
                      >
                        <MenuItem value={'ChannelY'}>Channel Y</MenuItem>
                        <MenuItem value={'ChannelB'}>Channel B</MenuItem>
                        <MenuItem value={'ChannelC'}>Channel C</MenuItem>
                        <MenuItem value={'ChannelR'}>Channel R</MenuItem>
                        <MenuItem value={'ChannelG'}>Channel G</MenuItem>
                        <MenuItem value={'ChannelM'}>Channel M</MenuItem>
                      </Select>
                    </FormControl>
                  </Col>
                </Row>
                <Row style={{ padding: '5', margin: '5' }}>
                  <Col
                    xs={6}
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      display: 'flex',
                    }}
                  >
                    <Typography>Lysosome</Typography>
                  </Col>
                  <Col xs={6}>
                    <FormControl fullWidth>
                      <Select
                        labelId="channel-select"
                        id="channel-select"
                        style={{
                          backgroundColor: getColorFromChannel(
                            selectedLysosomeChannel,
                          ),
                        }}
                        label="Channel"
                        value={selectedLysosomeChannel}
                        onChange={(e) => {
                          setSelectedLysosomeChannel(e.target.value);
                        }}
                      >
                        <MenuItem value={'ChannelY'}>Channel Y</MenuItem>
                        <MenuItem value={'ChannelB'}>Channel B</MenuItem>
                        <MenuItem value={'ChannelC'}>Channel C</MenuItem>
                        <MenuItem value={'ChannelR'}>Channel R</MenuItem>
                        <MenuItem value={'ChannelG'}>Channel G</MenuItem>
                        <MenuItem value={'ChannelM'}>Channel M</MenuItem>
                      </Select>
                    </FormControl>
                  </Col>
                </Row>
              </div>
            </Col>

            <Col xs={12}>
              <div className="card border has-title">
                <div className="card-title">
                  <Typography>Sensitivity </Typography>
                </div>
                <Row style={{ padding: '10px', margin: '10' }}>
                  <Col
                    xs={6}
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      display: 'flex',
                    }}
                  >
                    <Typography>Select Channel</Typography>
                  </Col>
                  <Col xs={6}>
                    <FormControl fullWidth>
                      <Select
                        labelId="channel-select"
                        id="channel-select"
                        style={{
                          backgroundColor:
                            getColorFromChannel(selectedChannelValue),
                        }}
                        label="Channel"
                        value={selectedChannelValue}
                        onChange={(e) => {
                          setSelectedChannelValue(e.target.value);
                        }}
                      >
                        <MenuItem value={'ChannelY'}>Channel Y</MenuItem>
                        <MenuItem value={'ChannelB'}>Channel B</MenuItem>
                        <MenuItem value={'ChannelC'}>Channel C</MenuItem>
                        <MenuItem value={'ChannelR'}>Channel R</MenuItem>
                        <MenuItem value={'ChannelG'}>Channel G</MenuItem>
                        <MenuItem value={'ChannelM'}>Channel M</MenuItem>
                      </Select>
                    </FormControl>
                  </Col>
                </Row>
                <Row style={{ padding: '10px', margin: '10' }}>
                  <Col
                    xs={8}
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      display: 'flex',
                    }}
                  >
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

export default connect(mapStateToProps)(CellPaintingV3);
