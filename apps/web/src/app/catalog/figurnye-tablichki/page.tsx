import { CardsByGroup } from '../../../components/cards-by-group';
import { MaterialEnum, ShapeEnum, OrientationEnum } from '@types';

export default async function HorizontalOvals() {
  const material = MaterialEnum.CERMET;
  const shape = [ShapeEnum.STAR, ShapeEnum.ARCH, ShapeEnum.HEART];

  return <CardsByGroup material={material} shape={shape} />;
}
