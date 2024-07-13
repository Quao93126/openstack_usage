import * as React from 'react';
import { Row, Col } from 'react-bootstrap';
import Button from '@mui/material/Button';
import ListSubheader from '@mui/material/ListSubheader';
import Slider from '@mui/material/Slider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import { useFlagsStore } from '@/state';
import Draggable from 'react-draggable';
import Paper from '@mui/material/Paper';
import {
  Box,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { RENDERING_MODES } from '@hms-dbmi/viv';
import { useState } from 'react';
import { useEffect } from 'react';
import { useImageSettingsStore } from '@/state';
import MuiInput from '@mui/material/Input';
import { styled } from '@mui/material/styles';
import ProgressBar from '@ramonak/react-progress-bar';
import { useSelector } from 'react-redux';
import store from '@/reducers';

const Input = styled(MuiInput)`
  width: 42px;
`;

const View3DSettingDialog = () => {
  const RENDERINGMODES = [
    RENDERING_MODES.MAX_INTENSITY_PROJECTION,
    RENDERING_MODES.MIN_INTENSITY_PROJECTION,
    RENDERING_MODES.ADDITIVE,
  ];

  const COLORMAPTYPES = [
    'jet',
    'hsv',
    'hot',
    'cool',
    'spring',
    'summer',
    'autumn',
    'winter',
    'bone',
    'copper',
    'greys',
    'yignbu',
    'greens',
    'yiorrd',
    'bluered',
    'rdbu',
    'picnic',
    'rainbow',
    'portland',
    'blackbody',
    'earth',
    'electric',
    'alpha',
    'viridis',
    'inferno',
    'magma',
    'plasma',
    'warm',
    'rainbow-soft',
    'bathymetry',
    'cdom',
    'chlorophyll',
    'density',
    'freesurface-blue',
    'freesurface-red',
    'oxygen',
    'par',
    'phase',
    'salinity',
    'temperature',
    'turbidity',
    'velocity-blue',
    'velocity-green',
    'cubehelix',
  ];

  const DISTUNITS = ['pixel', 'cm', 'mm', 'um', 'nm', 'pm'];
  const BACKGROUND_SETTINGS = ['white', 'black', 'none'];

  const IMAGE_LOAD_MODES = [
    'white_background',
    'black_background',
    'original_mode',
    'max_projection',
    'min_projection',
    'addition',
  ];
  const [isLoading, setIsLoading] = useState(false);

  const [selectedRenderingMode, setSelectedRenderingMode] = useState(
    RENDERINGMODES[0],
  );
  const [selectedColormapTypes, setSelectedColormapTypes] = useState(
    COLORMAPTYPES[0],
  );

  const [blackBackgroundValue, setBlackBackgroundValue] = useState(0);
  const [whiteBackgroundValue, setWhiteBackgroundValue] = useState(0);

  const [backgroundType, setBackgroundType] = useState('none');

  const [progress, setProgress] = useState(0);

  const imagePathForOrigin = useSelector(
    (state) => state.files.imagePathForOrigin,
  );

  const getUrlPathForResult = (mode) => {
    let pathWithOutExt = imagePathForOrigin.split('.ome.tiff')[0];
    switch (mode) {
      case 'white':
        return pathWithOutExt + '_white.ome.tiff';
        break;
      case 'black':
        return pathWithOutExt + '_black.ome.tiff';
        break;
      case RENDERING_MODES.MAX_INTENSITY_PROJECTION:
        return pathWithOutExt + '_max_projection.ome.tiff';

      case RENDERING_MODES.MIN_INTENSITY_PROJECTION:
        return pathWithOutExt + '_min_projection.ome.tiff';
      default:
        break;
    }
  };

  const handleBlackBackInputChange = (event) => {
    setBlackBackgroundValue(
      event.target.value === '' ? 0 : Number(event.target.value),
    );
  };

  const handleBlackBackValueBlur = () => {
    if (blackBackgroundValue < 0) {
      setBlackBackgroundValue(0);
    } else if (blackBackgroundValue > 100) {
      setBlackBackgroundValue(100);
    }
  };

  const asyncTimeout = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  const handleWhiteBackValueChange = (event) => {
    setWhiteBackgroundValue(
      event.target.value === '' ? 0 : Number(event.target.value),
    );
  };

  const handleWhiteBackValueBlur = () => {
    if (whiteBackgroundValue < 0) {
      setWhiteBackgroundValue(0);
    } else if (whiteBackgroundValue > 100) {
      setWhiteBackgroundValue(100);
    }
  };
  const handleClickSetButton = async () => {
    setIsLoading(true);

    for (let i = 0; i < 5; i++) {
      await asyncTimeout(1000);
      setProgress(10 * (i + 1));
    }

    for (let i = 5; i < 9; i++) {
      await asyncTimeout(2500);
      setProgress(10 * (i + 1));
    }

    setProgress(100);

    store.dispatch({
      type: 'set_image_path_for_avivator',
      content: getUrlPathForResult(backgroundType),
    });
  };

  useEffect(() => {
    useImageSettingsStore.setState({
      renderingMode: selectedRenderingMode,
      colormap: selectedColormapTypes,
    });
  }, [selectedRenderingMode, selectedColormapTypes]);

  const handleChangeBackgroundType = (event) => {
    setBackgroundType(event.target.value);
  };

  return (
    <>
      <DialogTitle style={{ textAlign: 'left', fontSize: '28px' }}>
        3D Viewer Setting
      </DialogTitle>
      <Divider />
      <FormGroup>
        <h4 style={{ paddingBottom: '15px' }}> Background</h4>
        <Row style={{ paddingBottom: '15px' }}>
          <Col md={5}>
            <Typography> Background select</Typography>
          </Col>
          <Col>
            <Select
              labelId="demo-simple-select-helper-label"
              id="demo-simple-select-helper"
              inputProps={{
                name: 'filter',
                id: 'uncontrolled-native',
              }}
              defaultValue="none"
              value={backgroundType}
              onChange={handleChangeBackgroundType}
            >
              {BACKGROUND_SETTINGS.map((item) => (
                <MenuItem key={`item-${item}`} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </Col>
        </Row>
        <Row>
          <Col md={5}>
            <Typography> Black Background</Typography>
          </Col>
          <Col>
            <Slider
              size="small"
              aria-label="Small"
              valueLabelDisplay="auto"
              value={blackBackgroundValue}
              onChange={handleBlackBackInputChange}
            />
          </Col>
          <Col>
            <Input
              value={blackBackgroundValue}
              size="small"
              onChange={handleBlackBackInputChange}
              onBlur={handleBlackBackValueBlur}
              inputProps={{
                step: 10,
                min: 0,
                max: 100,
                type: 'number',
                'aria-labelledby': 'input-slider',
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col md={5}>
            <Typography> White Background</Typography>
          </Col>
          <Col>
            <Slider
              size="small"
              aria-label="Small"
              valueLabelDisplay="auto"
              value={whiteBackgroundValue}
              onChange={handleWhiteBackValueChange}
              min={0}
              max={100}
            />
          </Col>
          <Col>
            <Input
              value={whiteBackgroundValue}
              size="small"
              onChange={handleWhiteBackValueChange}
              onBlur={handleWhiteBackValueBlur}
              inputProps={{
                step: 10,
                min: 0,
                max: 100,
                type: 'number',
                'aria-labelledby': 'input-slider',
              }}
            />
          </Col>
        </Row>
      </FormGroup>
      <Divider />
      <FormGroup>
        <h4 style={{ paddingBottom: '15px' }}>Z Stack</h4>
        <Row>
          <Col md={5}>
            <Typography> 3D Z Stack Pitch</Typography>
          </Col>
          <Col>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox defaultChecked />}
                label="Optimize automatically"
              />
              <FormControlLabel
                control={<Checkbox />}
                label="Adjust manually"
              />
            </FormGroup>
            <Row>
              <Col md={8}>
                <Slider
                  defaultValue={50}
                  aria-label="Default"
                  valueLabelDisplay="auto"
                />
              </Col>
              <Col md={2}>
                <input
                  type="number"
                  defaultValue={50}
                  style={{ width: '50px' }}
                ></input>
              </Col>
            </Row>
            <FormControl>
              <Select
                labelId="demo-simple-select-helper-label"
                id="demo-simple-select-helper"
                inputProps={{
                  name: 'filter',
                  id: 'uncontrolled-native',
                }}
                defaultValue="pixel"
              >
                {DISTUNITS.map((item) => (
                  <MenuItem key={`item-${item}`} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Col>
        </Row>

        <Row>
          <Col md={5}>
            <Typography> Rendering Mode</Typography>
          </Col>
          <Col>
            <FormControl>
              <Select
                labelId="demo-simple-select-helper-label"
                id="demo-simple-select-helper"
                inputProps={{
                  name: 'filter',
                  id: 'uncontrolled-native',
                }}
                defaultValue={RENDERING_MODES.MAX_INTENSITY_PROJECTION}
                onChange={(event) => {
                  setSelectedRenderingMode(event.target.value);
                }}
              >
                {RENDERINGMODES.map((item) => (
                  <MenuItem key={`item-${item}`} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Col>
        </Row>
        {/* <Row>
          <Col md={5}>
            <Typography> ColorMap Types</Typography>
          </Col>
          <Col>
            <FormControl>
              <Select
                labelId="demo-simple-select-helper-label"
                id="demo-simple-select-helper"
                inputProps={{
                  name: 'filter',
                  id: 'uncontrolled-native',
                }}
                style={{
                  alignContent: 'center',
                  alignItems: 'center',
                }}
                defaultValue={COLORMAPTYPES[0]}
                onChange={(event) => {
                  setSelectedColormapTypes(event.target.value);
                }}
              >
                {COLORMAPTYPES.map((item) => (
                  <MenuItem key={`item-${item}`} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Col>
        </Row> */}
      </FormGroup>
      <div>
        {isLoading && (
          <ProgressBar
            completed={progress}
            margin="10px 0"
            bgColor="#1976d2"
            height="13px"
          />
        )}
      </div>

      <hr />
      <Row>
        <Col md={9}></Col>
        <Button onClick={handleClickSetButton}>Set</Button>
      </Row>
    </>
  );
};
export default View3DSettingDialog;
