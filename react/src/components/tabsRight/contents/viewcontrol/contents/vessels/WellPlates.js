import React, { useEffect, useState } from 'react';
import {
  VESSEL_WELLPLATE_RATIO,
  VESSEL_WELLPLATE_MAX_HEIGHT,
  VESSEL_WELLPLATE_MAX_FONTSIZE,
} from '@/constants';
import classnames from 'classnames';
import { connect } from 'react-redux';
import store from '@/reducers';

const mapStateToProps = (state) => ({
  isFilesAvailable: state.files.isFilesAvailable,
  content: state.files.content,
});

const WellPlates = (props) => {
  const areaRatio = props.areaPercentage * 0.01;

  var calculateDRect = {};
  var activeHolesNumbers = [];
  if (props.width * VESSEL_WELLPLATE_RATIO > VESSEL_WELLPLATE_MAX_HEIGHT) {
    calculateDRect.height = VESSEL_WELLPLATE_MAX_HEIGHT;
    calculateDRect.width = calculateDRect.height / VESSEL_WELLPLATE_RATIO;
  } else {
    calculateDRect.width = props.width;
    calculateDRect.height = props.width * VESSEL_WELLPLATE_RATIO;
  }
  const a_rows = props.rows + (props.showName ? 1 : 0);
  const a_cols = props.cols + (props.showName ? 1 : 0);
  let radiusCalculated =
    calculateDRect.width / a_cols > calculateDRect.height / a_rows
      ? calculateDRect.height / a_rows
      : calculateDRect.width / a_cols;
  const [showNumber, setShowNumber] = useState(props.showNumber);
  const [showName, setShowName] = useState(props.showName);
  const [width, setWidth] = useState(props.width);
  const [rows, setRows] = useState(props.rows);
  const [cols, setCols] = useState(props.cols);
  const [radious, setRadious] = useState(
    Math.floor(Math.floor(radiusCalculated) * 0.9),
  );
  const [rect, setRect] = useState(calculateDRect);
  const [fontSize, setFontSize] = useState(
    radiusCalculated / 2 > VESSEL_WELLPLATE_MAX_FONTSIZE
      ? VESSEL_WELLPLATE_MAX_FONTSIZE
      : radiusCalculated / 2,
  );
  const [holeClicked, setHoleClicked] = useState(0);
  const [_content, setContent] = useState(props.content);
  const [activeHoles, setActiveHoles] = useState([]);

  // the parameters for the Visual Part
  // In this part, the vessel holes must be enabled for toggling

  const [selectedHolesForVisual, setSelectedHolesForVisual] = useState([0]);

  useEffect(() => {
    if (
      width !== props.width ||
      rows !== props.rows ||
      cols !== props.cols ||
      showName !== props.showName
    ) {
      if (props.width * VESSEL_WELLPLATE_RATIO > VESSEL_WELLPLATE_MAX_HEIGHT) {
        calculateDRect.height = VESSEL_WELLPLATE_MAX_HEIGHT;
        calculateDRect.width = calculateDRect.height / VESSEL_WELLPLATE_RATIO;
      } else {
        calculateDRect.width = props.width;
        calculateDRect.height = props.width * VESSEL_WELLPLATE_RATIO;
      }
      const a_rows = props.rows + (props.showName ? 1 : 0);
      const a_cols = props.cols + (props.showName ? 1 : 0);
      let radiusCalculated =
        calculateDRect.width / a_cols > calculateDRect.height / a_rows
          ? calculateDRect.height / a_rows
          : calculateDRect.width / a_cols;

      setShowNumber(props.showNumber);
      setShowName(props.showName);
      setWidth(props.width);
      setRows(props.rows);
      setCols(props.cols);
      setRadious(Math.floor(Math.floor(radiusCalculated) * 0.9));
      setRect(calculateDRect);

      // let tempArray = [];
      // for (let i = 0; i < props.rows ; i ++){
      //   for (let j = 0; j < props.cols; j ++){
      //     tempArray.push(0);
      //   }
      // }
      // setCheckArrayForSelectedHoles(tempArray);

      setFontSize(
        radiusCalculated / 2 > VESSEL_WELLPLATE_MAX_FONTSIZE
          ? VESSEL_WELLPLATE_MAX_FONTSIZE
          : radiusCalculated / 2,
      );
    }
  }, [props]);

  useEffect(() => {
    if (props.content) {
      let _content = setHoleNumberInArray(
        JSON.parse(JSON.stringify(props.content)),
      );
      let new_array_content = sortArrayBasedOnHoleNumber(_content);
      // console.log("WellPlates.js  useEffect SORTED New Contents for HOLE : ", content);
      setContent(new_array_content);

      store.dispatch({
        type: 'vessel_selectedVesselHolesForVisual',
        content: [
          {
            row: 0,
            col: 1,
          },
        ],
      });
    }
  }, [props.content]);

  const getUniqueSortedNumber = (arr) => {
    if (arr.length === 0) return arr;
    arr = arr.sort(function (a, b) {
      return a * 1 - b * 1;
    });
    var ret = [arr[0]];
    for (var i = 1; i < arr.length; i++) {
      //Start loop at 1: arr[0] can never be a duplicate
      if (arr[i - 1] !== arr[i]) {
        ret.push(arr[i]);
      }
    }
    return ret;
  };

  const holeNumber = (r, c) => {
    r = r + 1;
    return (r - 1) * cols + c;
  };

  const setHoleNumberInArray = (content) => {
    //console.log(content);
    let old_content = [...content];
    let holes = [];
    for (let i = 0; i < old_content.length; i++) {
      let row = old_content[i].row;
      let col = old_content[i].col - 1;
      old_content[i].col = col;
      old_content[i].hole = holeNumber(row, col);
      holes.push(holeNumber(row, col));
    }
    activeHolesNumbers = getUniqueSortedNumber(holes);
    setActiveHoles(activeHolesNumbers);
    //setHoleClicked(activeHolesNumbers[0]);

    setHoleClicked(holeNumber(content[0].row, content[0].col));

    return old_content;
  };

  const sortArrayBasedOnHoleNumber = (content) => {
    let new_array_content = [];
    let old_content = [...content];
    //console.log("Active Holes: ", activeHolesNumbers);
    let maxIterate = Math.max(...activeHolesNumbers) + 1;
    //console.log("Max Holes: ", maxIterate);
    for (let i = 0; i < maxIterate; i++) {
      let data = {};
      let one_array = [];
      for (let j = 0; j < old_content.length; j++) {
        if (i === old_content[j].hole) {
          one_array.push(old_content[j]);
          old_content.slice(j);
        } else {
          continue;
        }
      }
      data['data'] = one_array;
      new_array_content.push(data);
    }
    return new_array_content;
  };

  const _getViewConfigs = (dataHoleChosen) => {
    let old_content = [...dataHoleChosen.data];
    let zPosS = [];
    let timePointS = [];
    let channels = [];
    for (let i = 0; i < old_content.length; i++) {
      let zPos = old_content[i].z;
      let timePoint = old_content[i].time;
      let channel = old_content[i].channel;
      zPosS.push(zPos);
      timePointS.push(timePoint);
      channels.push(channel);
    }
    let maxZPos = Math.max(...zPosS);
    let minZPos = Math.min(...zPosS);
    let maxTimePoint = Math.max(...timePointS);
    let minTimePoint = Math.min(...timePointS);

    let zPosObj = {};
    zPosObj['max'] = maxZPos;
    zPosObj['min'] = minZPos;
    zPosObj['array'] = getUniqueSortedNumber(zPosS);

    let timePointObj = {};
    timePointObj['max'] = maxTimePoint;
    timePointObj['min'] = minTimePoint;
    timePointObj['array'] = getUniqueSortedNumber(timePointS);

    let channelObj = {};
    channelObj['array'] = getUniqueSortedNumber(channels);

    let viewConfigsInObj = {};
    viewConfigsInObj['z'] = zPosObj;
    viewConfigsInObj['time'] = timePointObj;
    viewConfigsInObj['channel'] = channelObj;
    return viewConfigsInObj;
  };

  const handleVesselClick = (e, selectedHolenumber, row, col) => {
    e.preventDefault();

    if (props.type === 'VisualVessel') {
      if (activeHoles.includes(selectedHolenumber)) {
        let tempList = selectedHolesForVisual;
        let itemIndex = selectedHolesForVisual.indexOf(holeNumber(row, col));
        if (itemIndex > -1) {
          tempList.splice(itemIndex, 1);
          setSelectedHolesForVisual(tempList);
        } else {
          tempList.push(holeNumber(row, col));
          setSelectedHolesForVisual(tempList);
        }

        let content = [];
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            if (tempList.includes(holeNumber(i, j))) {
              const tempHole = {
                row: i,
                col: j + 1,
              };
              content.push(tempHole);
            }
          }
        }

        store.dispatch({
          type: 'vessel_selectedVesselHolesForVisual',
          content: content,
        });
      }
    }

    setHoleClicked(selectedHolenumber);

    if (activeHoles.includes(selectedHolenumber)) {
      store.dispatch({
        type: 'vessel_selectedVesselHole',
        content: {
          row: row,
          col: col + 1,
          rowCount: props.rows,
          colCount: props.cols,
        },
      });
    } else {
    }
  };

  const renderWellPlates = () => {
    return (
      <div
        style={{ width: rect.width, height: rect.height }}
        className="d-flex flex-column"
      >
        {showName && (
          <div
            className="d-inline-flex align-center justify-space-around pa-0 ma-0"
            style={{ width: rect.width }}
          >
            {[...Array(cols + 1)].map((x, i) => (
              <div
                key={'col' + i}
                style={{ width: radious, fontSize: fontSize }}
                className="pa-0 ma-0 text-center"
              >
                {i === 0 ? '' : i}
              </div>
            ))}
          </div>
        )}
        <div
          className="d-flex flex-column align-center justify-space-around pa-0 ma-0"
          style={{ width: rect.width, flex: 1 }}
        >
          {[...Array(rows)].map((x, r) => (
            <div
              key={'row' + r}
              className="d-inline-flex align-center justify-space-around pa-0 ma-0"
              style={{ width: rect.width }}
            >
              {showName && (
                <div
                  style={{
                    width: radious,
                    height: radious,
                    fontSize: fontSize,
                  }}
                  className="pa-0 ma-0 text-center"
                >
                  {String.fromCharCode(64 + r + 1)}
                </div>
              )}
              {props.type === 'VisualVessel' &&
                [...Array(cols)].map((x, c) => (
                  <>
                    <div
                      onClick={(e) =>
                        handleVesselClick(e, holeNumber(r, c), r, c)
                      }
                      key={'circle' + holeNumber(r, c)}
                      style={{
                        width: radious,
                        height: radious,
                        zIndex: '100',
                        position: 'relative',
                      }}
                      className={classnames({
                        'd-flex justify-content-center align-items-center border border-dark rounded-circle cursor-pointer': true,
                        'hole-blue': activeHoles.includes(holeNumber(r, c)),
                        'hole-purple':
                          selectedHolesForVisual.includes(holeNumber(r, c)) &&
                          activeHoles.includes(holeNumber(r, c)),
                      })}
                    >
                      {props.showHole && (
                        <div
                          style={{
                            width: radious * areaRatio,
                            height: radious * areaRatio,
                            backgroundColor: '#00a0e9',
                            borderRadius: '50%',
                            position: 'absolute',
                            zIndex: '1',
                          }}
                        ></div>
                      )}
                      <span className="primary--text">
                        {showNumber ? holeNumber(r, c) : ''}
                      </span>
                    </div>
                  </>
                ))}

              {props.type !== 'VisualVessel' &&
                [...Array(cols)].map((x, c) => (
                  <>
                    <div
                      onClick={(e) =>
                        handleVesselClick(e, holeNumber(r, c), r, c)
                      }
                      key={'circle' + holeNumber(r, c)}
                      style={{
                        width: radious,
                        height: radious,
                        zIndex: '100',
                        position: 'relative',
                      }}
                      className={classnames({
                        'd-flex justify-content-center align-items-center border border-dark rounded-circle cursor-pointer': true,
                        'hole-blue': activeHoles.includes(holeNumber(r, c)),
                        'hole-purple':
                          holeNumber(r, c) === holeClicked &&
                          activeHoles.includes(holeNumber(r, c)),
                      })}
                    >
                      {props.showHole && (
                        <div
                          style={{
                            width: radious * areaRatio,
                            height: radious * areaRatio,
                            backgroundColor: '#00a0e9',
                            borderRadius: '50%',
                            position: 'absolute',
                            zIndex: '1',
                          }}
                        ></div>
                      )}
                      <span className="primary--text">
                        {showNumber ? holeNumber(r, c) : ''}
                      </span>
                    </div>
                  </>
                ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{ width: rect.width, height: rect.height }}
      className="border border-dark rounded-0 pa-0 ma-0 text-center"
    >
      {renderWellPlates()}
    </div>
  );
};

export default connect(mapStateToProps)(WellPlates);
