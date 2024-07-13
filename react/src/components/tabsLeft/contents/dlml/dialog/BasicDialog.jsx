import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import { useFlagsStore } from '@/state';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import { Row, Col, Button, Image } from 'react-bootstrap';
import store from '@/reducers';
import * as Icon from './ModelIcons';
import { isNull } from 'lodash';
import * as api_experiment from '@/api/experiment';
import { getImageUrl } from '@/helpers/file';

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 0 }}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

const BasicDialog = (props) => {
  const DialogBasicFlag = useFlagsStore((store) => store.DialogBasicFlag);
  if (!DialogBasicFlag) {
    useFlagsStore.setState({ IsMethodSetting: false });
  }
  const isMLAdvance = useFlagsStore((store) => store.IsMLAdvance);
  const isDLAdvance = useFlagsStore((store) => store.IsDLAdvance);
  const isAdvance = useFlagsStore((store) => store.IsAdvance);
  const isMethodSetting = useFlagsStore((store) => store.IsMethodSetting);
  const showCellposeDialog = async () => {
    if (isMLAdvance) {
      useFlagsStore.setState({ IsMLAdvance: true });
      useFlagsStore.setState({ DialogBasicFlag: false });
      store.dispatch({ type: 'setMethod', content: selectedMethod });
      store.dispatch({ type: 'set_current_model', content: selectedMethod });
      useFlagsStore.setState({ DialogLockFlag: true });
    } else if (selectedMethod === 'mridge') {
      useFlagsStore.setState({ IsMLAdvance: true });
      useFlagsStore.setState({ DialogBasicFlag: false });
      store.dispatch({ type: 'setMethod', content: selectedMethod });
      store.dispatch({ type: 'set_current_model', content: selectedMethod });
      useFlagsStore.setState({ DialogLockFlag: true });
    } else {
      useFlagsStore.setState({ DialogBasicFlag: false });
      if (isDLAdvance) {
        store.dispatch({ type: 'setMethod', content: selectedMethod });
        store.dispatch({ type: 'set_custom_name', content: 'New Model' });
        store.dispatch({ type: 'set_current_model', content: 'New Model' });
        useFlagsStore.setState({ DialogLockFlag: true });
      } else {
        const state = store.getState();
        if (isNull(state.files.imagePathForAvivator)) {
          alert('Please enter your image file!');
          return;
        }

        let imgPath = '';
        if (typeof state.files.imagePathForAvivator === 'string') {
          imgPath = state.files.imagePathForAvivator;
        } else if (typeof state.files.imagePathForAvivator === 'object') {
          imgPath = state.files.imagePathForAvivator[0].path;
        }
        let exp_name = imgPath.split('/');
        useFlagsStore.setState({ DialogLoadingFlag: true });
        let result = await api_experiment.dlBasicSegment(imgPath, exp_name);
        let imagePathForAvivator = null;
        if (result.data.error) {
          //alert("Error occured while getting the tree")
        } else {
          if (result.data.success === 'NO') {
            alert(
              'Your custom model is not suitable for this image. Please choose another model',
            );
            useFlagsStore.setState({ DialogLoadingFlag: false });
            return;
          }
          let file_path = result.data.success;
          // console.log('exp_name', exp_name, file_path);
          // exp_name = exp_name[exp_name.length - 2];
          // const file = await getImageUrl(exp_name + '/' + file_path, true, true);
          // if (file) imagePathForAvivator = file;
          store.dispatch({
            type: 'set_csv_path_for_result',
            content: result.data.csv_path,
          });
          store.dispatch({
            type: 'set_measure_result_zip_path',
            content: result.data.zip_path,
          });
          imagePathForAvivator = await getImageUrl(file_path, false, true);
          store.dispatch({
            type: 'set_image_path_for_result',
            content: imagePathForAvivator,
          });

          let countPath = await getImageUrl(
            result.data.count_path,
            false,
            true,
          );
          store.dispatch({
            type: 'set_image_path_for_count_result',
            content: countPath,
          });
        }
        // if (imagePathForAvivator.length <= 0) imagePathForAvivator = null;
        store.dispatch({
          type: 'set_image_path_for_avivator',
          content: imagePathForAvivator,
        });
        useFlagsStore.setState({ DialogLoadingFlag: false });
      }
    }
  };
  const close = () => {
    useFlagsStore.setState({ DialogBasicFlag: false });
    useFlagsStore.setState({ IsAdvance: false });
    setUpperTabVal(0);
  };

  const [rightTabVal, setRightTabVal] = useState(0);
  const handleRightTabChange = (newValue) => {
    setRightTabVal(newValue);
  };
  const [upperTabVal, setUpperTabVal] = useState(0);
  const handleUpperTabChange = (newValue) => {
    setUpperTabVal(newValue);
  };
  const [selectedMethod, setSelectedMethod] = useState('tissuenet');
  const handleSelectedMethod = (newValue) => {
    setSelectedMethod(newValue);
  };

  const imgArray = {
    tissuenet: Icon.imgTissueNet,
    ipscAdvance: Icon.imgIPSCAdvance,
    nuclei: Icon.imgNuchel,
    Confluency: Icon.imgNoun9,
    cyto: Icon.imgCyto,
    layer: Icon.imgLayer,
    wafer: Icon.imgWafer,
    livecell: Icon.imgNoun1,
    labelfree: Icon.imgHuman,
    cellPaintingV3: Icon.imgNoun1,
    cyto2: Icon.imgNoun7,
    CP: Icon.imgNoun2,
    CPx: Icon.imgNoun8,
    TN1: Icon.imgNoun20,
    TN2: Icon.imgNoun15,
    TN3: Icon.imgNoun18,
    LC1: Icon.imgNoun9,
    LC2: Icon.imgNoun10,
    LC3: Icon.imgNoun11,
    LC4: Icon.imgNoun12,
    mfiber1: Icon.imgNoun19,
    mfiber2: Icon.imgNoun17,
    mridge: Icon.imgNoun22,
    mouse: Icon.imgMouse,
  };

  const ImageBox = (props) => {
    return (
      <div
        className={
          selectedMethod !== props.methodName
            ? 'border method-img'
            : 'method-img-selected'
        }
        onClick={() => handleSelectedMethod(props.methodName)}
      >
        <Image
          style={{ margin: '0 auto', width: '65px', height: '65px' }}
          src={imgArray[props.methodName]}
          alt="no image"
        />
      </div>
    );
  };

  return (
    <>
      <Dialog open={DialogBasicFlag} onClose={close} maxWidth={'450'}>
        <div className="d-flex border-bottom">
          <DialogTitle>Method Select</DialogTitle>
          <button className="dialog-close-btn" color="primary" onClick={close}>
            &times;
          </button>
        </div>
        <div className="mx-3 my-2" style={{ width: 450 }}>
          <Row>
            <Col xs={12}>
              <div className="card border overflow-auto d-flex p-2">
                {isMethodSetting && (
                  <Tabs value={upperTabVal}>
                    <Tab
                      style={{ fontSize: '12px' }}
                      className="p-1"
                      label="Basic"
                      onFocus={() => handleUpperTabChange(0)}
                    />
                    <Tab
                      style={{ fontSize: '12px' }}
                      className="p-1"
                      label="Advance"
                      onFocus={() => handleUpperTabChange(1)}
                    />
                  </Tabs>
                )}
                <Tabs value={rightTabVal}>
                  <Tab
                    style={{ fontSize: '12px' }}
                    className="p-1"
                    label="Tissue"
                    onFocus={() => handleRightTabChange(0)}
                  />
                  <Tab
                    style={{ fontSize: '12px' }}
                    className="p-1"
                    label="Cell"
                    onFocus={() => handleRightTabChange(1)}
                  />
                  {!upperTabVal && (
                    <Tab
                      style={{ fontSize: '12px' }}
                      className="p-1"
                      label="Material"
                      onFocus={() => handleRightTabChange(2)}
                    />
                  )}
                  {!upperTabVal && (
                    <Tab
                      style={{ fontSize: '12px' }}
                      className="p-1"
                      label="Semicon"
                      onFocus={() => handleRightTabChange(3)}
                    />
                  )}
                  {!upperTabVal && (
                    <Tab
                      style={{ fontSize: '12px' }}
                      className="p-1"
                      label="Others"
                      onFocus={() => handleRightTabChange(4)}
                    />
                  )}
                </Tabs>
                {rightTabVal === 0 && (
                  <TabContainer>
                    <div className="p-3 img-container">
                      <div style={{ width: '65px' }} className="m-2">
                        <ImageBox
                          methodName={isMLAdvance ? 'ipscAdvance' : 'tissuenet'}
                        />
                        <div className="label-text text-center">
                          {isMLAdvance ? 'TissueNt' : 'TissueNt'}
                        </div>
                      </div>
                      {isMLAdvance ? (
                        <></>
                      ) : (
                        <div style={{ width: '65px' }} className="m-2">
                          <ImageBox methodName="mridge" />
                          <div className="label-text text-center">
                            Microridge
                          </div>
                        </div>
                      )}
                      {isMLAdvance ? (
                        <>
                          <div style={{ width: '65px' }} className="m-2">
                            <ImageBox methodName={'mfiber1'} />
                            <div className="label-text text-center">
                              Mfiber1
                            </div>
                          </div>
                          <div style={{ width: '65px' }} className="m-2">
                            <ImageBox methodName={'mfiber2'} />
                            <div className="label-text text-center">
                              Mfiber2
                            </div>
                          </div>
                        </>
                      ) : (
                        <></>
                      )}
                    </div>
                  </TabContainer>
                )}
                {rightTabVal === 1 && (
                  <TabContainer>
                    <div className="p-3 img-container">
                      {!isMLAdvance && (
                        <div style={{ width: '65px' }} className="m-2">
                          <ImageBox methodName="nuclei" />
                          <div className="label-text text-center">Nuclei</div>
                        </div>
                      )}
                      {!isMLAdvance && (
                        <div style={{ width: '65px' }} className="m-2">
                          <ImageBox methodName="Confluency" />
                          <div className="label-text text-center">
                            Confluency Method
                          </div>
                        </div>
                      )}
                      <div style={{ width: '65px' }} className="m-2">
                        <ImageBox methodName="cyto" />
                        <div className="label-text text-center">
                          {!isMLAdvance ? 'Cyto' : 'iCT'}
                        </div>
                      </div>

                      {isMLAdvance && (
                        <div style={{ width: '65px' }} className="m-2">
                          <ImageBox methodName="labelfree" />
                          <div className="label-text text-center">
                            Label-Free
                          </div>
                        </div>
                      )}
                      {isMLAdvance && (
                        <div style={{ width: '65px' }} className="m-2">
                          <ImageBox methodName="cellPaintingV3" />
                          <div className="label-text text-center">
                            CellPaintingV3
                          </div>
                        </div>
                      )}

                      {!isMLAdvance && !upperTabVal && !isAdvance && (
                        <div style={{ width: '65px' }} className="m-2">
                          <ImageBox methodName="livecell" />
                          <div className="label-text text-center">Livecell</div>
                        </div>
                      )}
                      {!isMLAdvance && !upperTabVal && !isAdvance && (
                        <div style={{ width: '65px' }} className="m-2">
                          <ImageBox methodName="cyto2" />
                          <div className="label-text text-center">Cyto2</div>
                        </div>
                      )}
                      {!isMLAdvance && !upperTabVal && !isAdvance && (
                        <div style={{ width: '65px' }} className="m-2">
                          <ImageBox methodName="CP" />
                          <div className="label-text text-center">CP</div>
                        </div>
                      )}
                      {!isMLAdvance && !upperTabVal && !isAdvance && (
                        <div style={{ width: '65px' }} className="m-2">
                          <ImageBox methodName="CPx" />
                          <div className="label-text text-center">CPx</div>
                        </div>
                      )}
                      {!isMLAdvance && !upperTabVal && !isAdvance && (
                        <div style={{ width: '65px' }} className="m-2">
                          <ImageBox methodName="TN1" />
                          <div className="label-text text-center">TN1</div>
                        </div>
                      )}
                      {!isMLAdvance && !upperTabVal && !isAdvance && (
                        <div style={{ width: '65px' }} className="m-2">
                          <ImageBox methodName="TN2" />
                          <div className="label-text text-center">TN2</div>
                        </div>
                      )}
                      {!isMLAdvance && !upperTabVal && !isAdvance && (
                        <div style={{ width: '65px' }} className="m-2">
                          <ImageBox methodName="TN3" />
                          <div className="label-text text-center">TN3</div>
                        </div>
                      )}
                      {!isMLAdvance && !upperTabVal && !isAdvance && (
                        <div style={{ width: '65px' }} className="m-2">
                          <ImageBox methodName="LC1" />
                          <div className="label-text text-center">LC1</div>
                        </div>
                      )}
                      {!isMLAdvance && !upperTabVal && !isAdvance && (
                        <div style={{ width: '65px' }} className="m-2">
                          <ImageBox methodName="LC2" />
                          <div className="label-text text-center">LC2</div>
                        </div>
                      )}
                      {!isMLAdvance && !upperTabVal && !isAdvance && (
                        <div style={{ width: '65px' }} className="m-2">
                          <ImageBox methodName="LC3" />
                          <div className="label-text text-center">LC3</div>
                        </div>
                      )}
                      {!isMLAdvance && !upperTabVal && !isAdvance && (
                        <div style={{ width: '65px' }} className="m-2">
                          <ImageBox methodName="LC4" />
                          <div className="label-text text-center">LC4</div>
                        </div>
                      )}
                    </div>
                  </TabContainer>
                )}
                {rightTabVal === 2 && (
                  <TabContainer>
                    <div className="p-3">
                      <div style={{ width: '65px' }}>
                        <ImageBox methodName="layer" />
                        <div className="label-text text-center">Layer</div>
                      </div>
                    </div>
                  </TabContainer>
                )}
                {rightTabVal === 3 && (
                  <TabContainer>
                    <div className="p-3">
                      <div style={{ width: '65px' }}>
                        <ImageBox methodName="wafer" />
                        <div className="label-text text-center">Wafer</div>
                      </div>
                    </div>
                  </TabContainer>
                )}
                {rightTabVal === 4 && isMLAdvance && (
                  <TabContainer>
                    <div className="p-3">
                      <div style={{ width: '65px' }}>
                        <ImageBox methodName="mouse" />
                        <div className="label-text text-center">
                          Dynamic Mouse Tracking
                        </div>
                      </div>
                    </div>
                  </TabContainer>
                )}
              </div>
            </Col>
          </Row>
        </div>
        <div className="border-top mt-2">
          <DialogActions>
            <Button variant="contained" onClick={showCellposeDialog}>
              Select
            </Button>
            <Button variant="contained" onClick={close}>
              Cancel
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    </>
  );
};
export default BasicDialog;
