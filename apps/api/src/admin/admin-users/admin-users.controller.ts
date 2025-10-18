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
} from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { AdminCreateUserDto } from '../../users/dto/admin-create-user.dto';
import { AdminUpdateUserDto } from '../../users/dto/admin-update-user.dto';
import { AdminGuard } from '../../common/admin.guard';

@UseGuards(AdminGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('list')
  async list(
    @Query('q') q?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(20), ParseIntPipe) take?: number,
  ) {
    if (take! > 100) take = 100;
    return this.usersService.list({ q, skip, take });
  }

  @Get(':id')
  async byId(@Param('id') id: string) {
    console.log('id', id);
    try {
      if (!id) throw new BadRequestException('id required');
      const user = await this.usersService.findByIdAdmin(id);
      console.log('user', user);
      if (!user) throw new NotFoundException('User not found');
      return { user };
    } catch (e) {
      console.log('User error', e);
    }
  }

  @Post()
  async create(@Body() dto: AdminCreateUserDto) {
    const u = await this.usersService.adminCreate(dto);
    const { id, email, name, phone, role } = u;
    return { user: { id, email, name, phone, role } };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
    const u = await this.usersService.adminUpdate({
      targetUserId: id,
      actorRole: 'ADMIN',
      dto,
    });
    return { user: u };
  }
}
