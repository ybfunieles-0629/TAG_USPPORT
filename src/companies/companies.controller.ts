import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Res, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

import { CompaniesService } from './companies.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) { }

  @Post()
  @UseGuards(AuthGuard())
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'rutCompanyDocument', maxCount: 1 },
      { name: 'dniRepresentativeDocument', maxCount: 1 },
      { name: 'commerceChamberDocument', maxCount: 1 },
    ])
  )
  create(
    @Body() createCompanyDto: CreateCompanyDto,
    @UploadedFiles() files: Record<string, Express.Multer.File>
  ) {
    return this.companiesService.create(createCompanyDto, files);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.companiesService.findAll(paginationDto)
  }

  @Get(':term')
  @UseGuards(AuthGuard())
  findOne(
    @Param('term') term: string,
  ) {
    return this.companiesService.findOne(term);
  }

  @Get('/download/:file')
  @UseGuards(AuthGuard())
  async downloadFile(
    @Param('file') file: string,
    @Res() res: Response,
  ) {
    const fileStream = await this.companiesService.downloadFromAws(file, res);
  
    fileStream.on('end', () => {
      res.end();
    });
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'rutCompanyDocument', maxCount: 1 },
      { name: 'dniRepresentativeDocument', maxCount: 1 },
      { name: 'commerceChamberDocument', maxCount: 1 },
    ])
  )
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @UploadedFiles() files: Record<string, Express.Multer.File>
  ) {
    return this.companiesService.update(id, updateCompanyDto, files);
  }

  @Patch('/desactivate/:id')
  @UseGuards(AuthGuard())
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.companiesService.desactivate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.companiesService.remove(id);
  }
}