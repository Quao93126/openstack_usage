import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Grid from '@mui/material/Grid';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import debounce from 'lodash/debounce';
import shallow from 'zustand/shallow';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { range, getMultiSelectionStats } from '@/helpers/avivator';
import {
  useChannelsStore,
  useViewerStore,
  useImageSettingsStore,
  useLoader,
} from '@/state';
import store from '@/reducers';
import { connect } from 'react-redux';
import { Backdrop, Button, Fade, IconButton, Modal } from '@mui/material';
import { Col, Row } from 'react-bootstrap';
import View3DSettingDialog from './View3DSettingDialog';

const mapStateToProps = (state) => ({
  display: state.display,
  content: state.files.content,
});

function ZPosition(props) {
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  const loader = useLoader();
  const { shape, labels } = loader[0];
  const size = shape[labels.indexOf('z')];
  const [zvalue, setZvalue] = useState(
    useViewerStore((store) => store.globalSelection.z),
  );
  const [minValue, setMinValue] = useState(0);

  const [view3D, setView3D] = useState(useViewerStore((store) => store.use3d));

  const { selections, setPropertiesForChannel } = useChannelsStore(
    (store) => store,
    shallow,
  );
  const globalSelection = useViewerStore((store) => store.globalSelection);
  const zpositionData = useSelector((state) => state.measure.zposition);
  const imagePathForOrigin = useSelector(
    (state) => state.files.imagePathForOrigin,
  );

  // 3D Viewer Setting Dialog parameters
  const [openSettingDlg, setOpenSettingDlg] = useState(false);
  const handleSettingDlgOpen = () => setOpenSettingDlg(true);
  const handleSettingDlgClose = () => setOpenSettingDlg(false);

  useEffect(() => {
    if (props.content) {
      if (
        props.content[0] &&
        props.content[0].z !== undefined &&
        Number(props.content[0].z) === 0
      ) {
        useViewerStore.setState({
          globalSelection: { ...globalSelection, z: 1 },
        });
        setZvalue(1);
        setMinValue(1);
      }
    }
  }, [props]);
  useEffect(() => {
    if (
      imagePathForOrigin &&
      imagePathForOrigin !== null &&
      imagePathForOrigin !== ''
    ) {
      useViewerStore.setState({
        globalSelection: { ...globalSelection, z: 1 },
      });
      setZvalue(1);
      setMinValue(1);
    } else {
      useViewerStore.setState({
        globalSelection: { ...globalSelection, z: 0 },
      });
      setZvalue(0);
      setMinValue(0);
    }
  }, [imagePathForOrigin]);

  // eslint-disable-next-line
  const changeSelection = useCallback(
    debounce(
      (_event, newValue) => {
        useViewerStore.setState({
          isChannelLoading: selections.map(() => true),
        });
        // ** update the z position value ** QmQ
        store.dispatch({
          type: 'UPDATE_MEASURE_ZPOSITION',
          payload: { z: newValue },
        });
        setZvalue(newValue);
        const newSelections = [...selections].map((sel) => ({
          ...sel,
          z: newValue,
        }));
        getMultiSelectionStats({
          loader,
          selections: newSelections,
          use3d: false,
        }).then(({ domains, contrastLimits }) => {
          range(newSelections.length).forEach((channel, j) =>
            setPropertiesForChannel(channel, {
              domains: domains[j],
              contrastLimits: contrastLimits[j],
            }),
          );
          useImageSettingsStore.setState({
            onViewportLoad: () => {
              useImageSettingsStore.setState({
                onViewportLoad: () => {},
              });
              useViewerStore.setState({
                isChannelLoading: selections.map(() => false),
              });
            },
          });
          range(newSelections.length).forEach((channel, j) =>
            setPropertiesForChannel(channel, {
              selections: newSelections[j],
            }),
          );
        });
      },
      50,
      { trailing: true },
    ),
    [loader, selections, setPropertiesForChannel],
  );

  const handleSwapSourceButtonClicked = () => {};

  const handle3DView = () => {
    store.dispatch({
      type: 'set_3D_view_state',
      content: !view3D,
    });
    setView3D(!view3D);
  };

  const handle3DSettings = () => {
    handleSettingDlgOpen();
  };

  return (
    <>
      <Grid container sx={{ p: 1 }}>
        <Grid item xs={12}>
          <Row>
            <Col item xs={5}>
              <Box component="h6">Z Position</Box>
            </Col>
            <Col xs={1}></Col>
          </Row>
          <Row>
            <Col xs={4}></Col>
            <Col xs={4}>
              <Button onClick={handle3DView}> 3D View</Button>
            </Col>
            <Col xs={4}>
              <Button onClick={handle3DSettings}>Settings</Button>
            </Col>
          </Row>
        </Grid>
        <Grid item xs={12} sx={{ px: 1, pt: 1 }}>
          <Row sx={{ p: 1 }}>
            <Col item xs={1}>
              <IconButton onClick={handleSwapSourceButtonClicked}>
                <SwapVertIcon />
              </IconButton>
            </Col>
            <Col item xs={1}></Col>
            <Col item xs={9}>
              <Slider
                value={zvalue}
                defaultValue={1}
                onChange={(event, newValue) => {
                  useViewerStore.setState({
                    globalSelection: {
                      ...globalSelection,
                      z: newValue,
                    },
                  });
                  if (event.type === 'keydown') {
                    changeSelection(event, newValue);
                  }
                }}
                valueLabelDisplay="on"
                onChangeCommitted={changeSelection}
                marks={range(size).map((val) => ({ value: val }))}
                min={minValue}
                max={size}
                orientation="horizontal"
              />
            </Col>
          </Row>
        </Grid>
      </Grid>
      {
        <>
          <Modal
            open={openSettingDlg}
            onClose={handleSettingDlgClose}
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
              backdrop: {
                timeout: 500,
              },
            }}
          >
            <Fade in={openSettingDlg}>
              <Box sx={modalStyle}>
                <View3DSettingDialog />
              </Box>
            </Fade>
          </Modal>
        </>
      }
    </>
  );
}
export default connect(mapStateToProps)(ZPosition);
