import * as React from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import { useFlagsStore } from '@/state';
import { Button, Col, Row, Image } from 'react-bootstrap';
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
import { mdiImageCheck, mdiImageOutline } from '@mdi/js';
import { COLORS } from '@/constants';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Modal } from 'antd';
import Draggable from 'react-draggable';
import { getMeasureImage } from '@/api/image';
import ProgressBar from '@ramonak/react-progress-bar';
import { TextField, Typography } from '@mui/material';
import Objective from '@/components/tabsRight/contents/viewcontrol/Objective';
import * as Icon from './ModelIcons';

const mapStateToProps = (state) => ({
  showLabelFreeSelectDialog: state.measure.showLabelFreeSelectDialog,
});

const LabelFreeSelectDialog = (props) => {
  const [sensitivity, setSensitivity] = useState(50);

  const [visible, setVisible] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [isTested, setIsTested] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [showFooter, setShowFooter] = useState(true);

  const draggleRef = React.createRef();
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });

  const imagePathForAvivator = useSelector(
    (state) => state.files.imagePathForAvivator,
  );
  const imagePathForOrigin = useSelector(
    (state) => state.files.imagePathForOrigin,
  );

  const labelFreeSegmentResultDirPath = useSelector(
    (state) => state.measure.labelFreeSegmentResultDirPath,
  );

  const [segmentImageList, setSegmentImageList] = useState([]);

  const getSegmentImages = async () => {
    if (
      labelFreeSegmentResultDirPath == undefined ||
      labelFreeSegmentResultDirPath == ''
    )
      return;

    //console.log(labelFreeSegmentResultDirPath)

    let _payload = {
      dir_path: labelFreeSegmentResultDirPath,
      original_image_url: imagePathForOrigin,
    };

    let res = await api_experiment.MLGetLabelFreeSegmentResultImages(_payload);

    let segmentResultList = res.segment_result_list;
    let temp = [];
    segmentResultList.map((item) => {
      let f = item.split('download/?path=')[1];
      let tempPath = process.env.REACT_APP_BASE_API_URL + 'static/' + f;
      temp.push(tempPath);
    });
    setSegmentImageList(temp);
  };
  useEffect(() => {
    getSegmentImages();
  }, [labelFreeSegmentResultDirPath]);

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

  const imgArray = {
    cell1: Icon.imgCyto,
    cell2: Icon.imgCyto,
    cell3: Icon.imgCyto,
    cell4: Icon.imgCyto,
    cell5: Icon.imgCyto,
    cell6: Icon.imgCyto,
    cell7: Icon.imgCyto,
    cell8: Icon.imgCyto,
    cell9: Icon.imgCyto,
    cell10: Icon.imgCyto,
  };

  const ImageBox = () => {
    return segmentImageList.map((item, index) => (
      <div className="m-2" key={index} style={{ width: '65px' }}>
        <div className={'method-img-selected'}>
          <Image
            style={{ margin: '0 auto', width: '65px', height: '65px' }}
            src={item}
            alt="no image"
          />
        </div>
      </div>
    ));
  };

  useEffect(() => {
    setVisible(props.showLabelFreeSelectDialog);
    setIsTested(false);
  }, [props]);

  const close = (event, reason) => {
    // useFlagsStore.setState({ MLDialogICTSelectFlag: false });
    store.dispatch({
      type: 'UPDATE_LABEL_FREE_METHOD_SELECT_DIALOG_STATUS',
      payload: false,
    });
  };

  return (
    <>
      <Modal
        mask={false}
        maskClosable={false}
        keyboard={false}
        wrapClassName="bbb"
        width={900}
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
            onFocus={() => {}}
            onBlur={() => {}}
            // end
          >
            <div className="d-flex border-bottom">
              <DialogTitle>Label Free C0 Method Select Dialog</DialogTitle>
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
                    Set
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ marginRight: '10px' }}
                  >
                    Clear
                  </button>
                  <button
                    onClick={close}
                    className="btn btn-outline-dark"
                    style={{ marginRight: '10px' }}
                  >
                    Close
                  </button>
                </div>,
              ]
        }
        visible={visible}
        //onOk={handleSelectedMethod}
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
        <div className="mx-3 my-2">
          <Row>
            <Col xs={12} class="card border">
              <h6 className="pb-3">All Cells</h6>
              <div className="icon-container border p-2">
                <ImageBox />
              </div>
            </Col>

            <Col xs={12} className="row my-3">
              <Col xs={6} class="card border">
                <h6 className="pb-3">Sensitivity of Judge</h6>
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
              <Col xs={6} className="display-flex justify-content-center">
                <Button className="ms-5">Advance</Button>
                <Button className="mx-3">Setting</Button>
              </Col>
            </Col>

            <Col xs={12} className="row my-3">
              <Button className="ms-3">Judge</Button>
              <Button className="mx-2">Stop</Button>
              <Button>Cancel</Button>
            </Col>

            <Col xs={12} className="row my-3">
              <Col xs={6} class="card border">
                <h6 className="pb-3">Bad</h6>
                <div className="vertical-icon-container border p-2">
                  <ImageBox />
                </div>
              </Col>
              <Col xs={6} class="card border">
                <h6 className="pb-3">Good</h6>
                <div className="vertical-icon-container border p-2">
                  <ImageBox />
                </div>
              </Col>
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

export default connect(mapStateToProps)(LabelFreeSelectDialog);
