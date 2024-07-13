import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import { useFlagsStore } from '@/state';
import { Row, Col, Button, Image, Form } from 'react-bootstrap';
import * as authApi from '@/api/auth';
import store from '@/reducers';
import { isNull } from 'lodash';
import * as api_experiment from '@/api/experiment';
import { getImageUrl } from '@/helpers/file';
import { useEffect } from 'react';

const LockScreen = () => {
  const DialogLockFlag = useFlagsStore((store) => store.DialogLockFlag);
  const [title, setTitle] = React.useState('');
  const isMLAdvance = useFlagsStore((store) => store.IsMLAdvance);
  const isDLAdvance = useFlagsStore((store) => store.IsDLAdvance);
  const [password, setPassword] = React.useState('');
  const state = store.getState();
  const [selectedMethod, setSelectedMethod] = React.useState(
    state.experiment.method,
  );

  const close = () => {
    useFlagsStore.setState({ DialogLockFlag: false });
  };

  const handleInput = (event) => {
    setPassword(event.target.value);
  };

  const handlePasswordInput = async () => {
    let result = await authApi.confirm_password(
      password,
      isMLAdvance || isDLAdvance,
    );
    if (result.data.success === 'NO') {
      alert('Wrong Password');
      return;
    }

    // let user = localStorage.getItem('user');
    // user = JSON.parse(user);
    // result = await authApi.checkPurchase(user.email);
    // if (!result.data.success) {
    //   alert("You didn't purchase any model.");
    //   return;
    // }
    useFlagsStore.setState({ DialogLockFlag: false });

    if (isMLAdvance) {
      if (selectedMethod === 'mfiber1' || selectedMethod === 'mfiber2') {
        store.dispatch({
          type: 'UPDATE_MFIBER_METHOD_DIALOG_STATUS',
          payload: true,
        });
      } else if (selectedMethod === 'mridge') {
        store.dispatch({
          type: 'UPDATE_MRIDGE_METHOD_DIALOG_STATUS',
          payload: true,
        });
      } else if (selectedMethod === 'mouse') {
        store.dispatch({
          type: 'UPDATE_DYNAMIC_MOUSE_METHOD_DIALOG_STATUS',
          payload: true,
        });
      } else if (selectedMethod === 'cyto') {
        // useFlagsStore.setState({ MLDialogICTSelectFlag: true });
        store.dispatch({
          type: 'UPDATE_ICT_METHOD_DIALOG_STATUS',
          payload: true,
        });
      } else if (selectedMethod === 'labelfree') {
        // useFlagsStore.setState({ MLDialogICTSelectFlag: true });
        store.dispatch({
          type: 'UPDATE_LABEL_FREE_METHOD_DIALOG_STATUS',
          payload: true,
        });
      } else if (selectedMethod === 'ipscAdvance') {
        store.dispatch({
          type: 'UPDATE_TISSUE_HP_METHOD_DIALOG_STATUS',
          payload: true,
        });
      } else if (selectedMethod === 'cellPaintingV3') {
        store.dispatch({
          type: 'UPDATE_CELL_PAINTING_V3_METHOD_DIALOG_STATUS',
          payload: true,
        });
      }
    } else {
      if (isDLAdvance) {
        if (selectedMethod === 'Confluency') {
          store.dispatch({
            type: 'UPDATE_CONFLUENCY_METHOD_DIALOG_STATUS',
            payload: true,
          });
        } else {
          store.dispatch({
            type: 'UPDATE_CELL_POSE_DIALOG_STATUS',
            payload: true,
          });
        }
      }
    }
  };

  React.useEffect(() => {
    const state = store.getState();
    setTitle(state.experiment.current_model.custom_name);
  }, []);

  return (
    <>
      <Dialog open={DialogLockFlag} onClose={close} maxWidth={'450'}>
        <div className="d-flex border-bottom">
          <DialogTitle>{title} Method</DialogTitle>
          <button className="dialog-close-btn" color="primary" onClick={close}>
            &times;
          </button>
        </div>
        <div className="mx-3 my-2" style={{ width: 450 }}>
          <Row>
            <Col xs={12}>
              <Form.Label>
                You must enter your password to use {title} method in "ADVANCE"
                function.
              </Form.Label>
            </Col>
            <Col xs={6}>
              <Form.Control
                type="password"
                value={password}
                onChange={handleInput}
              />
            </Col>
            <Col xs={6}>
              {/* <Button variant="primary">callbrate</Button> */}
            </Col>
          </Row>
        </div>
        <div className="border-top mt-2">
          <DialogActions>
            <Button variant="contained" onClick={handlePasswordInput}>
              Confirm
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    </>
  );
};
export default LockScreen;
