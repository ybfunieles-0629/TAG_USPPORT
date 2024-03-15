import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';

import { SuscriptionsService } from './suscriptions.service';
import { CreateSuscriptionDto } from './dto/create-suscription.dto';
import { UpdateSuscriptionDto } from './dto/update-suscription.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GetUser } from '../users/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('suscriptions')
export class SuscriptionsController {
  constructor(private readonly suscriptionsService: SuscriptionsService) { }

  @Post()
  create(
    @Body() createSuscriptionDto: CreateSuscriptionDto,
  ) {
    return this.suscriptionsService.create(createSuscriptionDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.suscriptionsService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.suscriptionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSuscriptionDto: UpdateSuscriptionDto,
  ) {
    return this.suscriptionsService.update(id, updateSuscriptionDto);
  };

  @Patch('desactivate/:id')
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.suscriptionsService.desactivate(id);
  };

  @Delete(':email')
  remove(
    @Param('email') email: string
  ) {
    return this.suscriptionsService.remove(email);
  }
}
