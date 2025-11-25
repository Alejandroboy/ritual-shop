import { CardsByGroup } from '../../../components/cards-by-group';
import { MaterialEnum, ShapeEnum, OrientationEnum } from '@types';

export default async function HorizontalOvals() {
  const material = MaterialEnum.CERMET;
  const shape = ShapeEnum.OVAL;
  const orientation = OrientationEnum.HORIZONTAL;

  return (
    <CardsByGroup material={material} shape={shape} orientation={orientation} />
  );
}
