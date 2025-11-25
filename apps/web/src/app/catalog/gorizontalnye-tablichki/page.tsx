import { CardsByGroup } from '../../../components/cards-by-group';
import { MaterialEnum, ShapeEnum, OrientationEnum } from '@types';

export default async function HorizontalRectangles() {
  const material = MaterialEnum.CERMET;
  const shape = ShapeEnum.RECTANGLE;
  const orientation = OrientationEnum.HORIZONTAL;

  return (
    <CardsByGroup material={material} shape={shape} orientation={orientation} />
  );
}
