import SmallCard from '../../../custom/SmallCard';
import CustomButton from '../../../custom/CustomButton';
import {
  mdiCog,
  mdiChartAreaspline,
  mdiContrastCircle,
  mdiAlphaWBoxOutline,
  mdiAlphaBBoxOutline,
} from '@mdi/js';
export default function FVO() {
  const handle_AVG = () => {
    // console.log("Select-1")
  };
  const handle_DPC = () => {
    // console.log("Select-2")
  };
  const handle_WB = () => {
    // console.log("Select-3")
  };
  const handle_BB = () => {
    // console.log("Select-4")
  };
  const handle_Set = () => {
    // console.log("Select-5")
  };
  return (
    <SmallCard title="Field of View Optimization">
      <CustomButton icon={mdiChartAreaspline} label="AVG" click={handle_AVG} />
      <CustomButton icon={mdiContrastCircle} label="DPC" click={handle_DPC} />
      <CustomButton icon={mdiAlphaWBoxOutline} label="WB" click={handle_WB} />
      <CustomButton icon={mdiAlphaBBoxOutline} label="BB" click={handle_BB} />
      <CustomButton icon={mdiCog} label="Set" click={handle_Set} />
    </SmallCard>
  );
}
