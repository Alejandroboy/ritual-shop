import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  Post,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserShape } from '../auth/decorators/current-user.decorator';

import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { Role } from '@prisma/client';
import { ListUsersQueryDto } from './dto/list-user.query';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async me(@CurrentUser() me: CurrentUserShape) {
    const user = await this.users.findById(me!.userId);
    return { user };
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  async updateMe(
    @CurrentUser() me: CurrentUserShape,
    @Body() dto: UpdateMeDto,
  ) {
    const u = await this.users.updateSelf(me!.userId, dto);
    return { user: u };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @Get('list')
  async list(@Query() query: ListUsersQueryDto) {
    console.log(45);
    return this.users.list(query);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @Get(':id')
  async byId(@Param('id') id: string) {
    const u = await this.users.findById(id);
    const { email, name, phone, role } = u;
    return { user: { id, email, name, phone, role } };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post()
  async adminCreate(@Body() dto: AdminCreateUserDto) {
    const u = await this.users.adminCreate(dto);
    const { id, email, name, phone, role } = u;
    return { user: { id, email, name, phone, role } };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @Patch(':id')
  async adminUpdate(
    @CurrentUser() me: CurrentUserShape,
    @Param('id') id: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    const u = await this.users.adminUpdate({
      targetUserId: id,
      actorRole: me!.role as Role,
      dto,
    });
    return { user: u };
  }
}
