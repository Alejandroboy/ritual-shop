import { Controller, Get, Param } from '@nestjs/common';
import { DaDataService } from './da-data.service';
import { IsString } from 'class-validator';

class GetSuggestionDto {
  @IsString() inn!: string;
}

@Controller('da-data')
export class DaDataController {
  constructor(private daDataService: DaDataService) {}

  @Get('suggestions/:inn')
  getSuggestions(@Param() params: GetSuggestionDto) {
    return this.daDataService.findPartyByInn(params.inn);
  }
}
