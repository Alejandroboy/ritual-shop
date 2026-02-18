import { Controller, Get, Param } from '@nestjs/common';
import { SyncService } from './sync.service';
import { IsString } from 'class-validator';

class GetuserDto {
  @IsString() inn!: string;
  @IsString() userId!: string;
}

@Controller('sync')
export class SyncController {
  constructor(private syncService: SyncService) {}

  @Get(':inn/:userId')
  getUser(@Param() params: GetuserDto) {
    return this.syncService.syncByInn(params.inn, params.userId);
  }
}
