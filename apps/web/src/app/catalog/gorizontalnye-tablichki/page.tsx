import { CardsByGroup } from '../../../components/cards-by-group';
import { MaterialEnum, ShapeEnum, OrientationEnum, CoverageEnum } from '@types';

export default async function HorizontalRectangles() {
  const material = MaterialEnum.CERMET;
  const shape = ShapeEnum.RECTANGLE;
  const orientation = OrientationEnum.HORIZONTAL;
  const coverage = CoverageEnum.NORMAL;

  return (
    <CardsByGroup
      material={material}
      shape={shape}
      orientation={orientation}
      coverage={coverage}
    />
  );
}
