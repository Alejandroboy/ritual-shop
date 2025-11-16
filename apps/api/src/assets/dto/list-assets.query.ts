import { AssetStage } from '@prisma/client';
import { IsEnum, IsOptional, Matches } from 'class-validator';

export class ListAssetsQuery {
  @IsOptional()
  @IsEnum(AssetStage)
  stage?: AssetStage;

  @IsOptional()
  @Matches(/^[01]$/)
  pairs?: '1' | '0';
}

export type ListAssetsQueryPlain = {
  stage?: AssetStage;
  pairs?: '1' | '0';
};
