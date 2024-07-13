import * as React from 'react';
import MLMethodSelection from './contents/dlml/MLMethodSelection';
import MLTrainingContainer from './contents/dlml/MLTrainingContainer';
import MLObjectBrightness from './contents/dlml/MLObjectBrightness';
import { useState, useEffect } from 'react';
import MLSelectTarget from './contents/dlml/MLSelectTarget';
import Count from './contents/dlml/Count';
import MLObjectClass from './contents/dlml/MLObjectClass';
import MLClassObjectStatus from './contents/dlml/MLClassObjectStatus';
import { Divider } from 'semantic-ui-react';
import SmallCard from '../custom/SmallCard';
import { Modal } from 'antd';
import Icon from '@mdi/react';
import { mdiImageCheck, mdiImageOutline } from '@mdi/js';
import { COLORS } from '@/constants';
import store from '@/reducers';
import Draggable from 'react-draggable';
import ProgressBar from '@ramonak/react-progress-bar';
import {
  Box,
  DialogTitle,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  ToggleButtonGroup,
  Typography,
  tabsClasses,
} from '@mui/material';
import { ToggleButton } from 'react-bootstrap';
import { connect } from 'react-redux';

const mapStateToProps = (state) => ({
  showMLPopUPDialog: state.measure.showMLPopUPDialog,
});

const MLPopUPContainer = (props) => {
  const [visible, setVisible] = React.useState(false);
  const [disabled, setDisabled] = useState(true);

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

  React.useEffect(() => {
    setVisible(props.showMLPopUPDialog);
  }, [props]);

  const close = (event, reason) => {
    // useFlagsStore.setState({ MLDialogICTSelectFlag: false });
    store.dispatch({
      type: 'UPDATE_ML_POPUP_DIALOG_STATUS',
      payload: false,
    });
  };

  return (
    <>
      <Modal
        mask={false}
        maskClosable={false}
        keyboard={false}
        wrapClassName="aaa"
        width={527}
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
            <DialogTitle>ML Method</DialogTitle>
          </div>
        }
        visible={visible}
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
        <div className="mx-3 my-2" style={{ width: 450 }}>
          <MLObjectBrightness />
          <Divider sx={{ padding: '16px 0px' }} />
          <MLSelectTarget />
          <Divider sx={{ padding: '16px 0px' }} />
          <Count />
          <Divider sx={{ padding: '16px 0px' }} />
          <MLObjectClass />
          <Divider />
          <MLClassObjectStatus />
        </div>
      </Modal>
    </>
  );
};

export default connect(mapStateToProps)(MLPopUPContainer);
