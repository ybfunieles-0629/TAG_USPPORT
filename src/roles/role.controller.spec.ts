import { Test, TestingModule } from '@nestjs/testing';

import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateRoleDto } from './dto/create-role.dto';

describe('RolesController', () => {
  let rolesController: RolesController;
  let rolesService: RolesService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [RolesService],
    }).compile();

    rolesController = moduleRef.get<RolesController>(RolesController);
    rolesService = moduleRef.get<RolesService>(RolesService);
  });

  describe('findAll', () => {
    it('Should find all the roles', async () => {
      const roles =  [
        {
          id: '2214d37b-79e8-40f5-a55a-a63cf1e4b4f4',
          name: 'Administrador',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          permissions: [],
          privileges: [],
        },
      ];

      const paginationDto: PaginationDto = { limit: 10, offset: 0 };

      jest.spyOn(rolesService, 'findAll').mockResolvedValue(roles);
      expect(await rolesController.findAll(paginationDto)).toBe(roles);
    });

    describe('create', () => {
      it('Should create a role', async () => {
        const createRoleDto: CreateRoleDto = {
          name: 'admin-tester',
          permissions: []
        };

        const createdRole = {
          id: '2214d37b-79e8-40f5-a55a-a63cf1e4b4f7',
          ...createRoleDto,
        }

        jest.spyOn(rolesService, 'create').mockResolvedValue(createdRole);
        
        const result = await rolesController.create(createRoleDto);

        expect(result).toEqual({ role: createdRole });
      });

      describe('update', () => {
        it('Should update a role', async () => {
          
        });
      })
    });
  });
});