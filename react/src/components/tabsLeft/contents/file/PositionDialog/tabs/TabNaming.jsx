import BoxBetween from '@/components/mui/BoxBetween';
import BoxCenter from '@/components/mui/BoxCenter';
import {
  Box,
  Button,
  DialogActions,
  Divider,
  FormControl,
  FormHelperText,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import {
  DEFAULT_NAME_PATTERNS,
  DEFAULT_CHANNEL_PATTERNS,
  NAME_PATTERN_ORDER,
  NAME_TABLE_COLUMNS,
} from './constants';
import useTilingStore from '@/stores/useTilingStore';
import DialogContent from '@/components/mui/DialogContent';
import DataTable from '@/components/mui/DataTable';
import { updateTilesMetaInfo } from '@/api/tiling';
import LoadingButton from '@mui/lab/LoadingButton';
import { Col, Row } from 'react-bootstrap';
import store from '@/reducers';

export default function TabNaming() {
  const { tiles, loadTiles, setTiles } = useTilingStore();
  const [processTilesList, setProcessTilesList] = useState([]);
  const exampleBox = useRef(null);

  const [contents, setContents] = useState([]);
  const [searchrows, setSearchRows] = useState([]); // Search Bar
  const [selectedFileName, setSelectedFileName] = useState('');
  const [namePattern, setNamePattern] = useState(DEFAULT_NAME_PATTERNS);
  const [channelPattern, setChannelPattern] = useState(
    DEFAULT_CHANNEL_PATTERNS,
  );
  const [updating, setUpdating] = useState(false);
  //Variables for Except Files

  const [extList, setExtList] = useState([]);

  const [exceptFileNameList, setExceptFileNameList] = useState([]);

  const [exceptFileWord, setExceptFileWord] = useState('');
  const [currentExt, setCurrentExt] = useState();

  const [showExceptFilesFlag, setShowExceptFilesFlag] = useState(false);
  const [showChannelsFlag, setShowChannelsFlag] = useState(false);

  useEffect(() => {
    setProcessTilesList(tiles);
  }, []);

  useEffect(() => {
    const contents = processTilesList.map((tile, idx) => ({
      ...tile,
      id: idx + 1,
    }));
    setContents(contents);

    contents.map((content) => {
      content.series = content.strSeries;
    });

    setSearchRows(contents);

    if (processTilesList.length > 0) {
      setSelectedFileName(processTilesList[0].filename.split('.')[0]);
    }
  }, [processTilesList]);

  useEffect(() => {
    const contents = processTilesList.map((tile, idx) => ({
      ...tile,
      id: idx + 1,
    }));
    setContents(contents);

    //setSearchRows(contents);

    if (processTilesList.length > 0) {
      setSelectedFileName(processTilesList[0].filename.split('.')[0]);
    }

    //Set the ext List for processTilesList
    let tempSet = new Set();

    processTilesList.map((tile, idx) => {
      const ext = tile.filename.split('.')[1];
      tempSet.add(ext);
    });
    const tempArr = Array.from(tempSet);
    setExtList(tempArr);
  }, [processTilesList]);

  const clickNamePattern = (index) => {
    const selection = window.getSelection();

    if (selection) {
      const text = selection.toString();
      const startOffset = selection.anchorOffset;
      const endOffset = selection.extentOffset;
      if (startOffset > -1 && endOffset > -1) {
        let namePatternsPrimaryValue = [...namePattern];
        for (var i = 0; i < namePatternsPrimaryValue.length; i++) {
          if (index === i) {
            namePatternsPrimaryValue[index].text = text;
            namePatternsPrimaryValue[index].start = startOffset;
            namePatternsPrimaryValue[index].end = endOffset;
            for (let j = startOffset; j < endOffset; j++) {
              document.getElementById('filename' + j.toString()).style.color =
                namePatternsPrimaryValue[index].color;
            }
          }
        }
        //console.log(namePatternsPrimaryValue);
        setNamePattern(namePatternsPrimaryValue);
      }
    }
  };

  // ----------------------------------------------------- update button function
  // Convert string to integer of some fields: row, col, field, channel, z, time
  const convertContentStringToInteger = (field, stringData, _moveIndex) => {
    if (stringData === '') {
      return 0;
    }
    let newField = '';
    let intField = -5;
    if (field === 'row') {
      intField = stringData.charCodeAt(0) - 65;
    } else {
      newField = stringData.replace(/\D/g, '');
      intField = parseInt(newField);
    }
    return intField;
  };

  const getNamePatternPerFileForProcessing = (objectPerFile) => {
    let result = {};
    let resultContent = {};
    let moveIndex = 0;
    result[`dimensionChanged`] = false;

    for (let i = 0; i < NAME_PATTERN_ORDER.length; i++) {
      let key = NAME_PATTERN_ORDER[i];
      if (key && objectPerFile !== null) {
        let currentIndex = 0;
        for (let k = 0; k < namePattern.length; k++) {
          if (namePattern[k].field === key) {
            currentIndex = k;
            break;
          }
        }

        let tempString = objectPerFile.filename.slice(
          namePattern[currentIndex].start,
          namePattern[currentIndex].end,
        );

        // console.log(key)
        // console.log("Index ************");
        // console.log(currentIndex)

        if (key === 'id') {
          resultContent[key] = objectPerFile.id;
        } else if (key === 'series') {
          //console.log(tempString);
          // console.log(namePattern);

          const matches = tempString.match(/\d+/);

          const str = objectPerFile.filename;
          const contentArray = str.split('_');
          //console.log(contentArray)
          let tempIdx = 0;

          contentArray.map((item, idx) => {
            if (item[0] === 'p' && idx !== 0) {
              tempIdx = idx;
            }
          });

          let finalResult = contentArray[0];

          for (let i = 1; i < tempIdx; i++) {
            finalResult = finalResult + '_' + contentArray[i];
          }

          if (matches) {
            result[key] = objectPerFile.id;
            resultContent[key] = objectPerFile.id;
          } else {
            result[key] = objectPerFile.id;
            resultContent[key] = objectPerFile.id;
          }

          tempString = objectPerFile.filename.substring(
            namePattern[currentIndex].start + moveIndex,
            namePattern[currentIndex].end + moveIndex,
          );

          result['strSeries'] = tempString;
          resultContent['strSeries'] = tempString;
        } else if (key === 'filename') {
          result[key] = objectPerFile.filename;
          resultContent[key] = objectPerFile.filename;
        } else if (key === 'z') {
          if (tempString === 'z') {
            for (let j = 1; j < 4; j++) {
              tempString = objectPerFile.filename.substring(
                namePattern[currentIndex].start + j,
                namePattern[currentIndex].start + j + 1,
              );
              if (tempString === '_') {
                moveIndex = j + 1;
                tempString = objectPerFile.filename.substring(
                  namePattern[currentIndex].start + 1,
                  namePattern[currentIndex].start + j,
                );
                result[key] = parseInt(tempString) + 1;
                resultContent[key] = objectPerFile.filename.substring(
                  namePattern[currentIndex].start,
                  namePattern[currentIndex].start + j,
                );
              }
            }
          } else {
            result[key] = convertContentStringToInteger(key, tempString);
            resultContent[key] = tempString;
          }
        } else {
          tempString = objectPerFile.filename.substring(
            namePattern[currentIndex].start + moveIndex,
            namePattern[currentIndex].end + moveIndex,
          );

          result[key] = convertContentStringToInteger(key, tempString);
          resultContent[key] = tempString;
        }

        channelPattern.map((channel) => {
          result[channel.label] = channel.text;
          resultContent[channel.label] = channel.text;
        });
      }
    }

    return [result, resultContent];
  };

  const updateNameType = async () => {
    setUpdating(true);

    const newContents = contents.map((oldContent) => ({
      ...oldContent,
      ...getNamePatternPerFileForProcessing(oldContent)[1],
    }));

    //console.log(newContents);
    await updateTilesMetaInfo(newContents);

    await loadTiles();
    //console.log(newContents);

    newContents.map((content) => {
      content.series = content.strSeries;
    });

    setSearchRows(newContents);

    //setUpdating(true);

    setUpdating(false);
  };

  // clear button + change file name
  const resetNamePattern = () => {
    let namePatternsPrimaryValue = [...namePattern];
    for (let i = 0; i < namePatternsPrimaryValue.length; i++) {
      namePatternsPrimaryValue[i].text = '';
      namePatternsPrimaryValue[i].start = 0;
      namePatternsPrimaryValue[i].end = 0;
    }
    setNamePattern(namePatternsPrimaryValue);
  };

  const clearNameType = () => {
    for (let k = 0; k < selectedFileName.length; k++) {
      document.getElementById('filename' + k.toString()).style.color = '#000';
    }
    resetNamePattern();
  };

  const updateNativeSelect = (event) => {
    setSelectedFileName(event.target.value.toString().split('.')[0]);
    resetNamePattern();
  };

  const handleExceptFilesAdd = () => {
    let tempArr = [...exceptFileNameList];
    let ext = extList[currentExt];
    if (exceptFileWord === '' && ext == undefined) return;
    if (ext == undefined) {
      processTilesList.map((tile) => {
        if (tile.filename.includes(exceptFileWord)) {
          tempArr.push(tile.filename);
        }
      });
    } else if (exceptFileWord === '') {
      processTilesList.map((tile) => {
        if (tile.filename.includes('.' + ext)) {
          tempArr.push(tile.filename);
        }
      });
    } else {
      processTilesList.map((tile) => {
        if (
          tile.filename.includes('.' + ext) &&
          tile.filename.includes(exceptFileWord)
        ) {
          tempArr.push(tile.filename);
        }
      });
    }

    const tempSet = new Set(tempArr);
    //console.log(tempArr);
    setExceptFileNameList(Array.from(tempSet));
  };

  const handleExceptFileWordChange = (e) => {
    setExceptFileWord(e.target.value);
  };
  const handleExceptFilesClear = () => {
    setExceptFileNameList([]);
  };

  const handleDeleteFiles = () => {
    if (processTilesList.length === 0) return;
    let tempFileNameList = [...processTilesList];

    exceptFileNameList.map((itemToRemove) => {
      tempFileNameList = tempFileNameList.filter(
        (item) => item.filename !== itemToRemove,
      );
    });
    setProcessTilesList(tempFileNameList);
    setExceptFileWord('');
    setTiles(tempFileNameList);
    setExceptFileNameList([]);
  };

  const handleChangeChannelOptions = (event, idx) => {
    if (event !== undefined && event.target !== undefined) {
      if (event.target.value === '') return;
      let temp = channelPattern;
      temp[idx].text = event.target.value;
      setChannelPattern(temp);
    }
  };

  return (
    <>
      <DialogContent dividers loading={updating}>
        <BoxCenter px={2} py={0}>
          <Typography mr={1}>Example:</Typography>
          <Box
            ref={exampleBox}
            sx={{ height: 30, position: 'relative', width: '100%' }}
          >
            <Box
              sx={{ top: 0, left: 0, position: 'absolute', display: 'flex' }}
            >
              {selectedFileName.split('').map((item, index) => (
                <strong key={index}>
                  <span
                    id={'filename' + index.toString()}
                    className="mb-0 font-bolder font-20"
                    style={{ userSelect: 'none', fontFamily: 'monospace' }}
                  >
                    {item === ' ' ? <>&nbsp;</> : item}
                  </span>
                </strong>
              ))}
            </Box>
            <Box
              sx={{
                top: 0,
                left: 0,
                position: 'absolute',
                color: 'transparent',
                fontFamily: 'monospace',
              }}
              className="mb-0 font-bolder font-20"
            >
              {selectedFileName}
            </Box>
          </Box>
          <select
            className="border-none ml-1 mb-0 showOnlyDropDownBtn"
            value={selectedFileName}
            onChange={(event) => updateNativeSelect(event)}
            style={{ border: 'none' }}
          >
            {contents.map((c, index) => {
              return (
                <option key={index} value={c.filename}>
                  {c.filename}
                </option>
              );
            })}
          </select>
        </BoxCenter>

        <BoxBetween mb={1}>
          {namePattern.map((pattern, idx) => {
            return (
              <div key={idx} className="pattern-section border">
                <Button
                  size="small"
                  className="pattern-item-button"
                  variant="contained"
                  onClick={() => clickNamePattern(idx)}
                  sx={{
                    bgcolor: pattern.color,
                  }}
                >
                  {pattern.label}
                </Button>
                <TextField
                  id={pattern.label}
                  value={pattern.text}
                  size="small"
                  variant="standard"
                  inputProps={{ sx: { textAlign: 'center' } }}
                />
              </div>
            );
          })}
        </BoxBetween>

        <Button
          onClick={() => {
            setShowExceptFilesFlag(!showExceptFilesFlag);
          }}
        >
          Except Files
        </Button>
        {showExceptFilesFlag && (
          <Box px={1} py={0}>
            <Paper>
              <Row>
                <Typography
                  style={{
                    fontSize: '16px',
                    left: 12,
                    marginLeft: 12,
                    paddingLeft: 12,
                    color: 'blue',
                  }}
                >
                  Except Files
                </Typography>
                <Col xs={1}> </Col>
                <Col xs={2}>
                  <FormControl>
                    <FormHelperText>
                      <Typography>Word</Typography>
                    </FormHelperText>
                    <TextField
                      id="outlined-basic"
                      variant="outlined"
                      size="small"
                      value={exceptFileWord}
                      onChange={handleExceptFileWordChange}
                    />
                  </FormControl>
                </Col>
                <Col xs={2}>
                  <FormControl>
                    <FormHelperText>
                      <Typography>Format</Typography>
                    </FormHelperText>
                    <Select
                      displayEmpty
                      onChange={(e) => {
                        setCurrentExt(e.target.value);
                      }}
                      size="small"
                    >
                      {extList.map((item, index) => (
                        <MenuItem value={index}>{item}</MenuItem>
                      ))}
                    </Select>
                    <hr />
                    <Button
                      variant="contained"
                      onClick={handleExceptFilesAdd}
                      style={{ bottom: 5 }}
                      size="small"
                    >
                      Add
                    </Button>
                  </FormControl>
                </Col>

                <Col
                  xs={4}
                  style={{
                    maxHeight: '120px',
                    overflow: 'auto',
                    margin: '1px',
                  }}
                >
                  <BoxBetween mb={1}>
                    <BoxCenter
                      px={2}
                      py={1}
                      style={{
                        justifyContent: 'center',
                        display: 'flex',
                        width: '100%',
                      }}
                    >
                      <List
                        style={{
                          width: '100%',
                          maxWidth: 360,
                          display: 'flex',
                          justifyContent: 'center',
                          flexDirection: 'column',
                        }}
                        component="nav"
                        aria-label="mailbox folders"
                      >
                        {exceptFileNameList.map((item) => (
                          <>
                            <ListItem button>
                              <ListItemText primary={item} />
                            </ListItem>
                            <Divider />
                          </>
                        ))}
                      </List>
                    </BoxCenter>
                  </BoxBetween>
                </Col>
                <Col xs={2}>
                  <div>
                    <Button
                      variant="contained"
                      color="secondary"
                      style={{ position: 'absolute', bottom: 55 }}
                      onClick={handleExceptFilesClear}
                      size="small"
                    >
                      Reset Lists
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      style={{ position: 'absolute', bottom: 15 }}
                      onClick={handleDeleteFiles}
                      size="small"
                    >
                      Delete
                    </Button>
                  </div>
                </Col>
              </Row>
            </Paper>
          </Box>
        )}

        {/* <Button
          onClick={() => {
            setShowChannelsFlag(!showChannelsFlag);
          }}
        >
          Channels
        </Button>
        {showChannelsFlag && (
          <Box>
            <Paper>
              <Row>
                <BoxBetween mb={1}>
                  {channelPattern.map((pattern, idx) => {
                    return (
                      <div key={idx} className="pattern-section border">
                        <Button
                          size="small"
                          className="pattern-item-button"
                          variant="contained"
                          sx={{
                            bgcolor: pattern.color,
                            color: 'black',
                          }}
                        >
                          {pattern.label}
                        </Button>
                        <TextField
                          id={pattern.label}
                          text={pattern.text}
                          size="small"
                          variant="standard"
                          inputProps={{ sx: { textAlign: 'center' } }}
                          onChange={(e) => handleChangeChannelOptions(e, idx)}
                        />
                      </div>
                    );
                  })}
                </BoxBetween>
              </Row>
            </Paper>
          </Box>
        )} */}

        <DataTable
          rows={searchrows}
          columns={NAME_TABLE_COLUMNS}
          type={'TabNaming'}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <LoadingButton
          variant="contained"
          color="primary"
          onClick={updateNameType}
          loading={updating}
        >
          Update
        </LoadingButton>
        <Button variant="outlined" color="error" onClick={clearNameType}>
          Reset
        </Button>
        <Button variant="outlined" color="warning">
          Cancel
        </Button>
      </DialogActions>
    </>
  );
}
