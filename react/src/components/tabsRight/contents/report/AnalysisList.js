import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { MeasureHeader } from '@/constants/filters';

import Vessel from '../viewcontrol/Vessel';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button, MenuItem, Select } from '@mui/material';
import { readRemoteFile } from 'react-papaparse';
import store from '@/reducers';
import Slides from './Slides';
import { useElementSize } from 'usehooks-ts';
import { Typography } from 'antd';

const AnalysisList = () => {
  const [items, setItems] = useState([]);
  const [classSettingValue, setClassSettingValue] = useState('Overlay');

  const experimentName = useSelector((state) => state.experiment.method);

  const [ref, { width }] = useElementSize();

  const [holeSelected, setHoleSelected] = useState(false);

  // const s = useSelector(state => state);

  // useEffect(() => {
  //   console.log(s);
  // },[s])

  //While first loading the component
  useEffect(() => {
    const tempItems = [];

    MeasureHeader.map((item, index) => {
      if (index !== 0) {
        const tempItem = {};
        tempItem['id'] = index;
        tempItem['name'] = item;
        tempItems.push(tempItem);
      }
    });

    setItems(tempItems);
  }, []);

  const [selectedIndex, setSelectedIndex] = React.useState(1);

  const handleListItemClick = (e, number) => {
    setSelectedIndex(number);
    const selectedItem = items[number - 1];
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', e.target.id);
  };

  const handleChangeClassSetting = (e) => {
    store.dispatch({
      type: 'set_selected_channel_in_report',
      content: e.target.value,
    });

    setClassSettingValue(e.target.value);
  };

  const selectedImageItemPath = useSelector(
    (state) => state.files.selectedThumbnailPathForVisual,
  );

  //get the csv path
  const getCsvPath = (path, color) => {
    let csvPath = '';

    if (classSettingValue == 'Overlay') {
      csvPath = path.split('timg')[0] + 'ome_300.csv';
    } else {
      let filenameSplitList = path.split('/');
      let len = filenameSplitList.length;
      let filename = filenameSplitList[len - 2];

      csvPath = path.split(filename)[0] + color + '/ashlar_output.ome_300.csv';
    }

    readRemoteFile(csvPath, {
      complete: (results) => {
        store.dispatch({
          type: 'set_selected_csv_data',
          content: results.data,
        });
      },
      error: (err) => {
        store.dispatch({
          type: 'set_selected_csv_data',
          content: null,
        });
      },
    });
  };

  const handleHoleSelected = () => {
    let flag = !holeSelected;
    setHoleSelected(flag);

    store.dispatch({
      type: 'set_report_tab_hole_selected_flag',
      content: flag,
    });
  };

  useEffect(() => {
    if (selectedImageItemPath !== undefined && selectedImageItemPath !== null) {
      const csvPath = getCsvPath(selectedImageItemPath, classSettingValue);
    }
  }, [classSettingValue, selectedImageItemPath]);

  return (
    <>
      <div className="visual-analysis-items">
        <Select
          defaultValue={'S'}
          onChange={(e) => handleChangeClassSetting(e)}
          value={classSettingValue}
          disabled={experimentName != 'tissuenet'}
        >
          <MenuItem value="Overlay" name="Overlay">
            Overlay
          </MenuItem>

          <MenuItem value="S" name="S">
            S
          </MenuItem>
          <MenuItem value="R" name="R">
            R
          </MenuItem>
          <MenuItem value="G" name="G">
            G
          </MenuItem>
          <MenuItem value="B" name="B">
            B
          </MenuItem>
          <MenuItem value="R+B" name="R+B">
            R+B
          </MenuItem>
          <MenuItem value="R+G" name="R+G">
            R+G
          </MenuItem>
          <MenuItem value="G+B" name="G+B">
            G+B
          </MenuItem>
          <MenuItem value="S+R+B" name="S+R+B">
            S+R+B
          </MenuItem>
          <MenuItem value="S+R+G" name="S+R+G">
            S+R+G
          </MenuItem>
          <MenuItem value="S+R+G+B" name="S+R+G+B">
            S+R+G+B
          </MenuItem>
        </Select>
        <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
          <List component="nav" aria-label="main mailbox folders">
            {items.map((item) => (
              <ListItemButton
                key={`item-${item.id}`}
                selected={selectedIndex === item.id}
                draggable={true}
                id={item.id}
                onDragStart={handleDragStart}
              >
                <ListItemText primary={item.name} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </div>
      <div
        className="visual-sidebar-filter"
        style={{ minWidth: '100%', minHeight: '300px' }}
        ref={ref}
      >
        <Typography style={{ alignItems: 'center', display: 'flex' }}>
          Single Slide
        </Typography>
        {/* <Vessel type="VisualVessel" /> */}
        <Button onClick={handleHoleSelected}>
          <Slides
            width={width}
            count={1}
            showHole={holeSelected}
            areaPercentage={100}
          />
        </Button>
      </div>
    </>
  );
};

export default AnalysisList;
