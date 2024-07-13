import React, { useCallback, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import shallow from 'zustand/shallow';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AddIcon from '@mui/icons-material/Add';
import PaletteIcon from '@mui/icons-material/Palette';
import {
  useChannelsStore,
  useImageSettingsStore,
  useLoader,
  useMetadata,
  useViewerStore,
} from '@/state';
import { ChannelColors } from '@/constants/enums';
import { MAX_CHANNELS } from '@hms-dbmi/viv';
import { getSingleSelectionStats, randomId } from '@/helpers/avivator';
import { COLOR_PALETTE } from '@/constants';
import { connect } from 'react-redux';
import store from '@/reducers';
import { Col, Row } from 'react-bootstrap';

const mapStateToProps = (state) => ({
  content: state.files.content,
});

const Channel = (prop) => {
  const loader = useLoader();
  const metadata = useMetadata();
  const { labels } = loader[0];
  const imagePathForOrigin = useSelector(
    (state) => state.files.imagePathForOrigin,
  );

  const mergeImageByTilingFlag = useSelector(
    (state) => state.files.tilingMergedImageFlag,
  );

  const {
    channelsVisible,
    colors,
    selections,
    selectedChannel,
    setChannleVisible,
    selectChannel,
    addChannel,
    setPropertiesForChannel,
  } = useChannelsStore((state) => state, shallow);

  const {
    globalSelection,
    isViewerLoading,
    use3d,
    setIsChannelLoading,
    addIsChannelLoading,
  } = useViewerStore((store) => store, shallow);
  const measureChannelData = useSelector((state) => state.measure.channel_data);
  // console.log('------------***', channelsVisible)
  const channels = useMemo(() => {
    const _channels = Object.values(ChannelColors).map(({ rgb, symbol }) => {
      const chId = colors.findIndex((c) => c.toString() === rgb.toString());

      return {
        // disabled:
        disabled: false,
        id: chId,
        symbol,
        color: rgb,
        visible: chId >= 0 && channelsVisible[chId],
        cssColor:
          symbol === ChannelColors.white.symbol ? 'gray' : `rgb(${rgb})`,
      };
    });
    // console.log('=======****>', _channels)
    store.dispatch({
      type: 'UPDATE_MEASURE_CHANNEL_DATA',
      payload: _channels,
    });
    return _channels;
  }, [colors, channelsVisible]);

  const handleAddChannel = useCallback(() => {
    let selection = Object.fromEntries(labels.map((l) => [l, 0]));
    selection = { ...selection, ...globalSelection };
    const numSelectionsBeforeAdd = selections.length;
    getSingleSelectionStats({
      loader,
      selection,
      use3d,
    }).then(({ domain, contrastLimits }) => {
      setPropertiesForChannel(numSelectionsBeforeAdd, {
        domains: domain,
        contrastLimits,
        channelsVisible: true,
      });
      useImageSettingsStore.setState({
        onViewportLoad: () => {
          useImageSettingsStore.setState({ onViewportLoad: () => {} });
          setIsChannelLoading(numSelectionsBeforeAdd, false);
        },
      });
      addIsChannelLoading(true);
      const {
        Pixels: { Channels },
      } = metadata;
      const { c } = selection;
      addChannel({
        selections: {
          ...selection,
          c: numSelectionsBeforeAdd % Channels.length,
        },
        ids: randomId(),
        channelsVisible: false,
        colors:
          (Channels[c].Color && Channels[c].Color.slice(0, -1)) ??
          COLOR_PALETTE[numSelectionsBeforeAdd % COLOR_PALETTE.length],
      });
    });
  }, [
    labels,
    loader,
    globalSelection,
    use3d,
    addChannel,
    addIsChannelLoading,
    selections,
    setIsChannelLoading,
    setPropertiesForChannel,
    metadata,
  ]);

  const handleToggle = (chId) => {
    setChannleVisible(chId);
    if (!channelsVisible[chId]) {
      selectChannel(chId);
    }
  };
  useEffect(() => {
    let flag = true;
    channels.map(({ id, cssColor: color, symbol, disabled, visible }, idx) => {
      if (visible === true) flag = false;
    });

    if (flag) {
      // console.log("T")
    } else {
      // console.log("R")
    }
  }, [channels]);
  const handleSelect = (chId) => {
    selectChannel(chId);
  };

  return (
    <Box px={1}>
      <Row>
        <Col sx={4}>
          <Typography variant="card-title" gutterBottom>
            Channels
          </Typography>
        </Col>
        <Col sx={4}></Col>
        <Col sx={4}>
          <Button>mono/color</Button>
        </Col>
      </Row>

      <Stack direction="row" justifyContent="space-between">
        <Stack direction="column" alignItems="center">
          <Button
            variant="icon"
            onClick={handleAddChannel}
            disabled={false}
            /*{selections.length === MAX_CHANNELS || isViewerLoading}*/
          >
            <AddIcon fontSize="1rem" />
          </Button>
          <Button variant="icon">
            <PaletteIcon fontSize="1rem" />
          </Button>
        </Stack>
        {channels.map(
          ({ id, cssColor: color, symbol, disabled, visible }, idx) => (
            <Box
              key={idx}
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={() => handleToggle(id)}
                    checked={idx === 0 ? true : visible}
                    disabled={disabled}
                    size="small"
                    sx={{
                      color,
                      padding: 0,
                      '&.Mui-checked': { color },
                    }}
                  />
                }
                label={symbol}
                labelPlacement="bottom"
                sx={{ m: 0 }}
              />
              <IconButton
                size="small"
                sx={{ p: 0, mt: -1 }}
                disabled={disabled}
                color={id === selectedChannel ? 'info' : 'default'}
                onClick={() => handleSelect(id)}
              >
                <ArrowDropDownIcon fontSize="small" />
              </IconButton>
            </Box>
          ),
        )}
      </Stack>
      <Divider sx={{ mx: -1 }} />
    </Box>
  );
};

export default connect(mapStateToProps)(Channel);
