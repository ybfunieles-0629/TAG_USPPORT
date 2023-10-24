import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateTagSubTechniqueDto } from './dto/create-tag-sub-technique.dto';
import { UpdateTagSubTechniqueDto } from './dto/update-tag-sub-technique.dto';
import { TagSubTechnique } from './entities/tag-sub-technique.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { MarkingTagService } from '../marking-tag-services/entities/marking-tag-service.entity';

@Injectable()
export class TagSubTechniquesService {
  constructor(
    @InjectRepository(TagSubTechnique)
    private readonly tagSubTecniqueRepository: Repository<TagSubTechnique>,

    @InjectRepository(MarkingTagService)
    private readonly markingTagServiceRepository: Repository<MarkingTagService>,
  ) { }

  async create(createTagSubTechniqueDto: CreateTagSubTechniqueDto) {
    const newTagSubTechnique = plainToClass(TagSubTechnique, createTagSubTechniqueDto);

    const markingTagService: MarkingTagService = await this.markingTagServiceRepository.findOne({
      where: {
        id: createTagSubTechniqueDto.markingTagService,
      },
    });

    if (!markingTagService)
      throw new NotFoundException(`Marking tag service with id ${createTagSubTechniqueDto.markingTagService} not found`);

    newTagSubTechnique.markingTagService = markingTagService;

    await this.tagSubTecniqueRepository.save(newTagSubTechnique);

    return {
      newTagSubTechnique
    };
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.tagSubTecniqueRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'markingTagService',
      ],
    });
  }

  async findOne(id: string) {
    const tagSubTechnique = await this.tagSubTecniqueRepository.findOne({
      where: {
        id,
      },
      relations: [
        'markingTagService',
      ],
    });

    if (!tagSubTechnique)
      throw new NotFoundException(`Tag sub technique with id ${id} not found`);

    return {
      tagSubTechnique
    };
  }

  async update(id: string, updateTagSubTechniqueDto: UpdateTagSubTechniqueDto) {
    const tagSubTechnique = await this.tagSubTecniqueRepository.findOne({
      where: {
        id,
      },
      relations: [
        'markingTagService',
      ],
    });

    if (!tagSubTechnique)
      throw new NotFoundException(`Tag sub technique with id ${id} not found`);

    const updatedTagSubTechnique = plainToClass(TagSubTechnique, updateTagSubTechniqueDto);

    const markingTagService: MarkingTagService = await this.markingTagServiceRepository.findOne({
      where: {
        id: updateTagSubTechniqueDto.markingTagService,
      },
    });

    if (!markingTagService)
      throw new NotFoundException(`Marking tag service with id ${updateTagSubTechniqueDto.markingTagService} not found`);

    updatedTagSubTechnique.markingTagService = markingTagService;

    Object.assign(tagSubTechnique, updatedTagSubTechnique);

    await this.tagSubTecniqueRepository.save(tagSubTechnique);

    return {
      tagSubTechnique
    };
  }

  async desactivate(id: string) {
    const { tagSubTechnique } = await this.findOne(id);

    tagSubTechnique.isActive = !tagSubTechnique.isActive;

    await this.tagSubTecniqueRepository.save(tagSubTechnique);

    return {
      tagSubTechnique
    };
  }

  async remove(id: string) {
    const { tagSubTechnique } = await this.findOne(id);

    await this.tagSubTecniqueRepository.remove(tagSubTechnique);
    
    return {
      tagSubTechnique
    };
  }
}
