import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Col, Container } from 'react-bootstrap';
// import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Icon from '@mdi/react';
import { mdiRefresh, mdiCog, mdiPlay } from '@mdi/js';
import { connect } from 'react-redux';
import store from '@/reducers';
import {
  useChannelsStore,
  useImageSettingsStore,
  useLoader,
  useViewerStore,
} from '@/state';
import debounce from 'lodash/debounce';
import { getMultiSelectionStats, range } from '@/helpers/avivator';
import { unstable_batchedUpdates } from 'react-dom';
import shallow from 'zustand/shallow';
import { Slider } from '@mui/material';
import { extractNumbers } from '@/components/tabsLeft/contents/file/PositionDialog/tabs/utils';
import { isVideoFile } from 'react-md';

const Input = styled(TextField)`
  width: 50px;
  border
`;

const mapStateToProps = (state) => ({
  displayOption: state.display,
  content: state.files.content,
  files: state.files.files,
  selectedVesselHole: state.vessel.selectedVesselHole,
  isImageLoading: state.files.isImageLoading,
  isVideoFile: state.files.isVideoFile,
  videoTimeDuration: state.files.videoTimeDuration,
  videoCurrentTime: state.files.videoCurrentTime,
});

const Timeline = (props) => {
  const loader = useLoader();
  const { shape, labels } = loader[0];

  const label = 't';
  const { isImageLoading } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [sliderRange, setSliderRange] = useState([
    { value: 0, step: 1 },
    { value: 1, step: 1 },
    { value: 2, step: 1 },
    { value: 3, step: 1 },
    { value: 4, step: 1 },
    { value: 5, step: 1 },
    { value: 6, step: 1 },
    { value: 7, step: 1 },
    { value: 8, step: 1 },
    { value: 9, step: 1 },
    { value: 10, step: 1 },
  ]);
  const [value, setValue] = useState(0);
  const [minSlider, setMinSlider] = useState(0);
  const [maxSlider, setMaxSlider] = useState(100);

  const imagePathForOrigin = useSelector(
    (state) => state.files.imagePathForOrigin,
  );

  const [selectedTime, setSelectedTime] = useState(-1);

  const [selections, setPropertiesForChannel] = useChannelsStore(
    (store) => [store.selections, store.setPropertiesForChannel],
    shallow,
  );
  const globalSelection = useViewerStore((store) => store.globalSelection);
  const changeSelection = useCallback(
    debounce(
      (newValue) => {
        useViewerStore.setState({
          isChannelLoading: selections.map(() => true),
        });
        store.dispatch({
          type: 'UPDATE_MEASURE_ZPOSITION',
          payload: {
            [label]: newValue,
          },
        });
        const newSelections = [...selections].map((sel) => ({
          ...sel,
          [label]: newValue,
        }));

        getMultiSelectionStats({
          loader,
          selections: newSelections,
          use3d: false,
        }).then(({ domains, contrastLimits }) => {
          unstable_batchedUpdates(() => {
            range(newSelections.length).forEach((channel, j) =>
              setPropertiesForChannel(channel, {
                domains: domains[j],
                contrastLimits: contrastLimits[j],
              }),
            );
          });
          unstable_batchedUpdates(() => {
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
        });
      },
      50,
      { trailing: true },
    ),
    [loader, selections],
  );

  const updateTime = (newValue) => {
    useViewerStore.setState({
      globalSelection: {
        ...globalSelection,
        [label]: newValue,
      },
    });
    changeSelection(newValue);
    store.dispatch({ type: 'vessel_selectedVesselTime', content: newValue });
  };

  const SliderChange = (newValue) => {
    setIsLoading(false);
    setValue(newValue);
    updateTime(newValue);
    setIsLoading(true);
  };

  const onRefresh = () => {
    setValue(0);
    updateTime(0);
  };

  useEffect(() => {
    if (props.isVideoFile) {
      if (props.videoCurrentTime === NaN) {
        setValue(0);
      }
      setMaxSlider(props.videoTimeDuration);
      setValue(props.videoCurrentTime);
    }
  }, [props.isVideoFile, props.videoTimeDuration, props.videoCurrentTime]);

  useEffect(() => {
    if (props.content) {
      if (props.content[0] && props.content[0].time !== undefined) {
        const newValue = extractNumbers(props.content[0].time);
        if (selectedTime !== newValue) {
          if (newValue === 0) {
            SliderChange(1);
            setSelectedTime(newValue);
          } else {
            SliderChange(newValue);
            setSelectedTime(newValue);
          }
        }
      } else {
        SliderChange(0);
      }
    }
  }, [props]);

  useEffect(() => {
    if (
      imagePathForOrigin &&
      imagePathForOrigin !== null &&
      imagePathForOrigin !== ''
    ) {
      setMinSlider(1);
      SliderChange(1);
      setSelectedTime(1);
    }
  }, [imagePathForOrigin]);

  const onSetting = () => {};
  // const onPlay = () => {
  // }
  // const onStop = () => {
  // }
  // const onRewind = () => {
  // }
  // const onFForward = () => {
  // }

  const InputChange = (event) => {
    let currentValue =
      event.target.value === '' ? '' : Number(event.target.value);
    if (currentValue < minSlider) {
      setValue(minSlider);
    } else if (currentValue > maxSlider) {
      setValue(maxSlider);
    } else {
      setIsLoading(false);
      setValue(currentValue);
      updateTime(currentValue);
      setIsLoading(true);
    }
  };

  useEffect(() => {
    const timeControlLabels = labels.filter((itemLabel) => itemLabel === label);
    if (timeControlLabels.length > 0) {
      const size = shape[labels.indexOf('t')];
      setMaxSlider(size);
      setIsLoading(true);
      if (size > 0) {
        setValue(1);
        let ranges = [];
        for (let i = 0; i < size; i++) {
          ranges.push({
            value: i + 1,
            step: 1,
          });
        }
        setSliderRange(ranges);
      }
    }
  }, [labels]);

  return (
    <>
      <div className={`common-border ${isLoading ? '' : 'cover-gray'}`}>
        {/* || !isImageLoading  */}
        <div className="d-flex justify-space-between align-center">
          <h6>Timeline</h6>
          <div>
            <div className="spacer"></div>
            <IconButton color="primary" size="small" onClick={onRefresh}>
              <Icon path={mdiRefresh} size={1} />
            </IconButton>
            <IconButton color="primary" size="small" onClick={onSetting}>
              <Icon path={mdiCog} size={1} />
            </IconButton>
          </div>
        </div>
        <Container fluid={true} className="px-0 py-0 mt-2">
          <Grid container spacing={1} alignItems="left">
            <Grid item xs={2}>
              <Icon path={mdiPlay} size={1} />
            </Grid>
            <Grid item xs={6} m>
              {/* <StepRangeSlider
                defaultValue = {value}
                value={value}
                range={sliderRange}
                onChange={(value) => {
                  SliderChange(value);
                }}
                disabled={!isLoading || isImageLoading}
                className="color-blue"
              /> */}

              {/* <input
                type="range"
                onChange={(value) => {
                  SliderChange(value);
                }}
                min={minSlider}
                max={maxSlider}
                step={1}
                value={value}
                disabled={!isLoading || isImageLoading}
                className="custom-slider"
              ></input> */}

              <Slider
                value={value}
                defaultValue={value}
                disabled={!isVideoFile ? !isLoading || isImageLoading : false}
                valueLabelDisplay="on"
                // onChange={(value) => {
                //   SliderChange(value);
                // }}
                min={minSlider}
                max={maxSlider}
                orientation="horizontal"
              />
            </Grid>
            <Grid item xs={4}>
              <p>{value}</p>
              {/* <Input
                className="pa-0 ma-0 ml-2 no-underline"
                value={value}
                size="small"
                onChange={InputChange}
                variant="standard"
                style={{ BorderNone: true, border: 'none' }}
                InputProps={{
                  step: 1,
                  min: minSlider,
                  max: maxSlider,
                  type: 'number',
                  'aria-labelledby': 'input-slider',
                  disableUnderline: true,
                  disabled: true,
                }}
              /> */}
            </Grid>
          </Grid>
          <div
            className="d-flex justify-center pa-0 ma-0"
            style={{ marginTop: '-28px' }}
          >
            <Col md={4}></Col>
          </div>
        </Container>
      </div>
    </>
  );
};

export default connect(mapStateToProps)(Timeline);
