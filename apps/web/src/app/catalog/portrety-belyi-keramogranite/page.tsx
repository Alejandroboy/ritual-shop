import { CardsByGroup } from '../../../components/cards-by-group';
import { MaterialEnum, ShapeEnum, OrientationEnum } from '@types';

export default async function HorizontalRectangles() {
  const material = MaterialEnum.WHITE_CERAMIC_GRANITE;

  return <CardsByGroup material={material} />;
}
