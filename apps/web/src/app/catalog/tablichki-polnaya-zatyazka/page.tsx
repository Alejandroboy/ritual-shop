import { CardsByGroup } from '../../../components/cards-by-group';
import { MaterialEnum, ShapeEnum, OrientationEnum, CoverageEnum } from '@types';

export default async function HorizontalRectangles() {
  const material = MaterialEnum.CERMET;
  const coverage = CoverageEnum.FULL_WRAP;

  return <CardsByGroup material={material} />;
}
