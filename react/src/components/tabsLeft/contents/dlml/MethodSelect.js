import React from 'react';
import SmallCard from '../../../custom/SmallCard';
import Button from '@mui/material/Button';
import { useFlagsStore } from '@/state';
import BasicDialog from './dialog/BasicDialog';

export default function MethodSelect() {
  const DialogBasicFlag = useFlagsStore((store) => store.DialogBasicFlag);

  const showBasicDialog = () => {
    useFlagsStore.setState({ IsMLAdvance: false });
    useFlagsStore.setState({ IsDLAdvance: false });
    useFlagsStore.setState({ DialogBasicFlag: true });
    useFlagsStore.setState({ LockFlag: true });
    useFlagsStore.setState({ IsAdvance : false});
  };
  const showCustomDialog = () => {
    useFlagsStore.setState({ DialogCustomFlag: true });
    useFlagsStore.setState({ LockFlag: false });
  };
  const onCall = () => {
    useFlagsStore.setState({ IsMLAdvance: false });
    useFlagsStore.setState({ IsDLAdvance: true });
    useFlagsStore.setState({ DialogBasicFlag: true });
    useFlagsStore.setState({ LockFlag: false });
    useFlagsStore.setState({ IsAdvance : true});
  };

  return (
    <div className="">
      <SmallCard title="Method Select">
        <Button
          style={{ color: 'rgb(15, 150, 136)' }}
          onClick={showBasicDialog}
        >
          Basic
        </Button>
        <Button style={{ color: 'rgb(15, 150, 136)' }} onClick={onCall}>
          Advance
        </Button>
        <Button
          style={{ color: 'rgb(15, 150, 136)' }}
          onClick={showCustomDialog}
        >
          Custom
        </Button>
      </SmallCard>
    </div>
  );
}
