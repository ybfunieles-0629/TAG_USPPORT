import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreateRoleDto } from './dto/create-role.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';

describe('RolesController', () => {
  let rolesController: RolesController;
  let rolesService: RolesService;

  const mockRolesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    desactivate: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [RolesService],
    })
    .overrideProvider(RolesService)
    .useValue(mockRolesService)
    .compile();

    rolesController = moduleRef.get<RolesController>(RolesController);
    rolesService = moduleRef.get<RolesService>(RolesService);
  });

  //* ------ FIND ALL TESTING ------ *//
  describe('findAll', () => {
    it('Should find all the roles', async () => {
      const roles: Role[] = [
        {
          id: '2214d37b-79e8-40f5-a55a-a63cf1e4b4f4',
          name: 'Administrador',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const paginationDto: PaginationDto = { limit: 10, offset: 0 };

      const findAllSpy = jest.spyOn(rolesService, 'findAll').mockResolvedValue(roles);

      const result = await rolesController.findAll(paginationDto);
      expect(result).toBe(roles);
    });

    //* ------ FIND ONE TEST ------ *//
    describe('findOne', () => {
      it('Should find one role', async () => {
        const role: Role = {
          id: '2214d37b-79e8-40f5-a55a-a63cf1e4b4f4',
          name: 'Administrador',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        jest.spyOn(rolesService, 'findOne').mockResolvedValue(role);
        expect(await rolesController.findOne(role.id)).toBe(role);
      });
    });

    //* ------ CREATE TEST ------ *//
    describe('create', () => {
      it('Should create a role', async () => {
        const createRoleDto: CreateRoleDto = {
          name: 'admin-tester',
        };

        const createdRole: Role = {
          id: '2214d37b-79e8-40f5-a55a-a63cf1e4b4f7',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          ...createRoleDto,
        }

        jest.spyOn(rolesService, 'create').mockResolvedValue({ role: createdRole });

        const result = await rolesController.create(createRoleDto);

        expect(result).toEqual({ role: createdRole });
      });

      //* ------ UPDATE TEST ------ *//
      describe('update', () => {
        it('Should update a role', async () => {
          const roleId = '2214d37b-79e8-40f5-a55a-a63cf1e4b4f4';

          const updateRoleDto: UpdateRoleDto = {
            name: 'admin-tester-updated'
          };

          const updatedRole = {
            id: roleId,
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
            ...updateRoleDto,
          };

          // jest.spyOn(rolesService, 'update').mockResolvedValue({ role: updatedRole });

          // const result = await rolesController.update(roleId, updateRoleDto);

          // expect(result).toEqual(updatedRole);
        });

        //* ------ CHANGE STATUS TEST ------ *//
        describe('desactivate', () => {
          it('Should change the isActive status of a role', async () => {
            const roleId = '2214d37b-79e8-40f5-a55a-a63cf1e4b4f4';

            const initialRoleStatus = await rolesController.findOne(roleId);

            const finalRoleStatus: Role = {
              id: roleId,
              name: 'Administrador',
              isActive: !initialRoleStatus.isActive,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            jest.spyOn(rolesService, 'desactivate').mockResolvedValue({ role: finalRoleStatus });

            const result = await rolesService.desactivate(roleId);

            expect(result).toEqual({ role: finalRoleStatus });
          });
        })
      });
    });
  });
});