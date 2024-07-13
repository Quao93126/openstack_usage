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
  Box,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
  tabsClasses,
} from '@mui/material';
import Objective from '@/components/tabsRight/contents/viewcontrol/Objective';
import { TabContext, TabList, TabPanel } from '@mui/lab';

import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import { CellPaintingMeasureItems } from './cellPaintingItems';

const mapStateToProps = (state) => ({
  showCellPaintingV3SelectDialog: state.measure.showCellPaintingV3SelectDialog,
});

const CellPaintingV3SelectDialog = (props) => {
  const [sensitivity, setSensitivity] = useState(50);

  const [visible, setVisible] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [showFooter, setShowFooter] = useState(true);
  const [viewMode, setViewMode] = useState('merge');

  const [value, setValue] = React.useState('B');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const [leftItems, setLeftItems] = useState(CellPaintingMeasureItems);
  const [rigthItems, setRightItems] = useState([]);

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
    setVisible(props.showCellPaintingV3SelectDialog);
  }, [props]);

  const close = (event, reason) => {
    // useFlagsStore.setState({ MLDialogICTSelectFlag: false });
    store.dispatch({
      type: 'UPDATE_CELL_PAINTING_V3_SELECT_METHOD_DIALOG_STATUS',
      payload: false,
    });
  };

  const handleSelectedMethod = () => {
    // store.dispatch({
    //   type: 'UPDATE_CELL_PAINTING_V3_SELECT_METHOD_DIALOG_STATUS',
    //   payload: true,
    // });
    setIsLoading(true);
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
  };

  return (
    <>
      <Modal
        mask={false}
        maskClosable={false}
        keyboard={false}
        wrapClassName="aaa"
        width={950}
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
        <div className="mx-3 my-2" style={{ width: 900, height: 500 }}>
          <Row style={{ height: '100%' }}>
            <Col xs={5} style={{ height: '100%' }}>
              <div className="card border has-title" style={{ height: '100%' }}>
                <div className="card-title">
                  <Typography>Measure Candidate </Typography>
                </div>
                <Row style={{ padding: '10px', margin: '10' }}>
                  <Col xs={12}>
                    <Box sx={{ width: '100%', typography: 'body1' }}>
                      <TabContext value={value}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                          <Tabs
                            value={value}
                            onChange={handleChange}
                            variant="scrollable"
                            scrollButtons
                            aria-label="visible arrows tabs example"
                            sx={{
                              [`& .${tabsClasses.scrollButtons}`]: {
                                '&.Mui-disabled': { opacity: 0.3 },
                              },
                            }}
                          >
                            <Tab label="B" value="B" />
                            <Tab label="C" value="C" />
                            <Tab label="O" value="O" />
                            <Tab label="R" value="R" />
                            <Tab label="G" value="G" />
                            <Tab label="M" value="M" />
                            <Tab label="Y" value="Y" />
                          </Tabs>
                        </Box>
                        <TabPanel
                          value="B"
                          style={{ height: '400px', overflowY: 'scroll' }}
                        >
                          <List>
                            {leftItems.map((item) => (
                              <ListItem>{item}</ListItem>
                            ))}
                          </List>
                        </TabPanel>
                        <TabPanel
                          value="C"
                          style={{ height: '400px', overflowY: 'scroll' }}
                        >
                          {leftItems.map((item) => (
                            <ListItem>{item}</ListItem>
                          ))}
                        </TabPanel>
                        <TabPanel
                          value="O"
                          style={{ height: '400px', overflowY: 'scroll' }}
                        >
                          {leftItems.map((item) => (
                            <ListItem>{item}</ListItem>
                          ))}
                        </TabPanel>
                      </TabContext>
                    </Box>
                  </Col>
                </Row>
              </div>
            </Col>

            <Col
              xs={2}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <Button style={{ marginTop: 10, marginBottom: 10 }}>
                <ArrowForwardIosIcon />
              </Button>

              <Button
                style={{ marginTop: 10, marginBottom: 10 }}
                onClick={() => {
                  setLeftItems([]);
                  setRightItems(CellPaintingMeasureItems);
                }}
              >
                <KeyboardDoubleArrowRightIcon />
              </Button>
              <Button style={{ marginTop: 10, marginBottom: 10 }}>
                <ArrowBackIosNewIcon />
              </Button>
              <Button
                style={{ marginTop: 10, marginBottom: 10 }}
                onClick={() => {
                  setLeftItems(CellPaintingMeasureItems);
                  setRightItems([]);
                }}
              >
                <KeyboardDoubleArrowLeftIcon />
              </Button>
            </Col>

            <Col xs={5} style={{ height: '100%' }}>
              <div className="card border has-title" style={{ height: '100%' }}>
                <div className="card-title">
                  <Typography>Select Measure </Typography>
                </div>
                <Row style={{ padding: '10px', margin: '10' }}>
                  <Col xs={12}>
                    <Box sx={{ width: '100%', typography: 'body1' }}>
                      <TabContext value={value}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                          <Tabs
                            value={value}
                            onChange={handleChange}
                            variant="scrollable"
                            scrollButtons
                            aria-label="visible arrows tabs example"
                            sx={{
                              [`& .${tabsClasses.scrollButtons}`]: {
                                '&.Mui-disabled': { opacity: 0.3 },
                              },
                            }}
                          >
                            <Tab label="B" value="B" />
                            <Tab label="C" value="C" />
                            <Tab label="O" value="O" />
                            <Tab label="R" value="R" />
                            <Tab label="G" value="G" />
                            <Tab label="M" value="M" />
                            <Tab label="Y" value="Y" />
                          </Tabs>
                        </Box>
                        <TabPanel
                          value="B"
                          style={{ height: '400px', overflowY: 'scroll' }}
                        >
                          {rigthItems.map((item) => (
                            <ListItem>{item}</ListItem>
                          ))}
                        </TabPanel>

                        <TabPanel
                          value="C"
                          style={{ height: '400px', overflowY: 'scroll' }}
                        >
                          {rigthItems.map((item) => (
                            <ListItem>{item}</ListItem>
                          ))}
                        </TabPanel>
                        <TabPanel
                          value="O"
                          style={{ height: '400px', overflowY: 'scroll' }}
                        >
                          {rigthItems.map((item) => (
                            <ListItem>{item}</ListItem>
                          ))}
                        </TabPanel>
                      </TabContext>
                    </Box>
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

export default connect(mapStateToProps)(CellPaintingV3SelectDialog);
