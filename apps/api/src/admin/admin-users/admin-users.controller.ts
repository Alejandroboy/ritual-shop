import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
  NotFoundException,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { AdminCreateUserDto } from '../../users/dto/admin-create-user.dto';
import { AdminUpdateUserDto } from '../../users/dto/admin-update-user.dto';
import { UserOrdersQueryDto } from '../../users/dto/user-orders.query.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import {
  CurrentUser,
  type CurrentUserShape,
} from '../../auth/decorators/current-user.decorator';

@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN_GOD', 'ADMIN', 'MANAGER')
  @Get('list')
  async list(
    @Query('q') q?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(20), ParseIntPipe) take?: number,
  ) {
    if (take! > 100) take = 100;
    return this.usersService.list({ q, skip, take });
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN_GOD', 'ADMIN', 'MANAGER')
  @Get(':id/orders')
  async getUserOrders(
    @Param('id') id: string,
    @Query() dto: UserOrdersQueryDto,
  ) {
    return this.usersService.getUserOrders(id, dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN_GOD', 'ADMIN', 'MANAGER')
  @Get(':id')
  async byId(@Param('id') id: string) {
    try {
      if (!id) return 'id required';
      const user = await this.usersService.findByIdAdmin(id);
      if (!user) return 'User not found';
      return { user };
    } catch (e) {
      console.log('User error', e);
    }
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN_GOD', 'ADMIN', 'MANAGER')
  @Post()
  async create(@Body() dto: AdminCreateUserDto) {
    const u = await this.usersService.adminCreate(dto);
    const { id, email, name, phone, role } = u;
    return { user: { id, email, name, phone, role } };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN_GOD', 'ADMIN', 'MANAGER')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape,
    @Body() dto: AdminUpdateUserDto,
  ) {
    const u = await this.usersService.adminUpdate({
      targetUserId: id,
      actorRole: user.role,
      dto,
    });
    return { user: u };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN_GOD', 'ADMIN')
  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: CurrentUserShape) {
    return this.usersService.deleteUser(id, user.role);
  }
}
