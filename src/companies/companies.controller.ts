import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Res, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { CompaniesService } from './companies.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) { }

  @Post()
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
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.companiesService.findAll(paginationDto)
  }

  @Get(':term')
  findOne(
    @Param('term') term: string,
  ) {
    return this.companiesService.findOne(term);
  }

  @Get('/download/:file')
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
  desactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.companiesService.desactivate(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.companiesService.remove(id);
  }
}