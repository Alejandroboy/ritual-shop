import { CardsByGroup } from '../../../components/cards-by-group';
import { MaterialEnum, ShapeEnum, OrientationEnum } from '@types';

export default async function HorizontalRectangles() {
  const material = MaterialEnum.GLASS;

  return <CardsByGroup material={material} />;
}
