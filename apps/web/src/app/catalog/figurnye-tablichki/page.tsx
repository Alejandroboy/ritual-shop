import { CardsByGroup } from '../../../components/cards-by-group';
import { MaterialEnum, ShapeEnum, OrientationEnum, CoverageEnum } from '@types';

export default async function HorizontalOvals() {
  const material = MaterialEnum.CERMET;
  const shape = [ShapeEnum.STAR, ShapeEnum.ARCH, ShapeEnum.HEART];
  const coverage = CoverageEnum.NORMAL;

  return <CardsByGroup material={material} shape={shape} coverage={coverage} />;
}
