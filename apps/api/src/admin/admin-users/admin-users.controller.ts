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
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'MANAGER')
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
  @Roles('ADMIN', 'MANAGER')
  @Get(':id')
  async byId(@Param('id') id: string) {
    try {
      if (!id) throw new BadRequestException('id required');
      const user = await this.usersService.findByIdAdmin(id);
      if (!user) throw new NotFoundException('User not found');

      return { user };
    } catch (e) {
      console.log('User error', e);
    }
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @Post()
  async create(@Body() dto: AdminCreateUserDto) {
    const u = await this.usersService.adminCreate(dto);
    const { id, email, name, phone, role } = u;
    return { user: { id, email, name, phone, role } };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
    const u = await this.usersService.adminUpdate({
      targetUserId: id,
      actorRole: 'ADMIN',
      dto,
    });
    return { user: u };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
