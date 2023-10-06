import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreatePermissionDto } from './dto/create-permission.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { Permission } from './entities/permission.entity';

describe('PermissionsController', () => {
  let permissionsController: PermissionsController;
  let permissionsService: PermissionsService;

  const mockPermissionsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deactivate: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [PermissionsService],
    })
    .overrideProvider(PermissionsService)
    .useValue(mockPermissionsService)
    .compile();

    permissionsController = moduleRef.get<PermissionsController>(PermissionsController);
    permissionsService = moduleRef.get<PermissionsService>(PermissionsService);
  });

  //* ------ FIND ALL TESTING ------ *//
  describe('findAll', () => {
    it('Should find all the permissions', async () => {
      const permissions: Permission[] = [
        {
          id: '2214d37b-79e8-40f5-a55a-a63cf1e4b4f4',
          name: 'empresas',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const paginationDto: PaginationDto = { limit: 10, offset: 0 };

      const findAllSpy = jest.spyOn(permissionsService, 'findAll').mockResolvedValue(permissions);

      const result = await permissionsController.findAll(paginationDto);
      
      expect(result).toBe(permissions);
    });

    //* ------ FIND ONE TEST ------ *//
    describe('findOne', () => {
      it('Should find one permission', async () => {
        const permission: Permission = {
          id: '2214d37b-79e8-40f5-a55a-a63cf1e4b4f4',
          name: 'empresas',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        jest.spyOn(permissionsService, 'findOne').mockResolvedValue(permission);

        expect(await permissionsController.findOne(permission.id)).toBe(permission);
      });
    });

    //* ------ CREATE TEST ------ *//
    describe('create', () => {
      it('Should create a permission', async () => {
        const createPermissionDto: CreatePermissionDto = {
          name: 'empresas',
        };

        const createdPermission: Permission = {
          id: '2214d37b-79e8-40f5-a55a-a63cf1e4b4f7',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          ...createPermissionDto,
        }

        jest.spyOn(permissionsService, 'create').mockResolvedValue({ permission: createdPermission });

        const result = await permissionsController.create(createPermissionDto);

        expect(result).toBe({ permission: createdPermission });
      });

      //* ------ UPDATE TEST ------ *//
      describe('update', () => {
        it('Should update a permission', async () => {
          const permissionId = '2214d37b-79e8-40f5-a55a-a63cf1e4b4f4';

          const updatePermissionDto: UpdatePermissionDto = {
            name: 'empresas'
          };

          const updatedPermission = {
            id: permissionId,
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
            ...updatePermissionDto,
          };

          // jest.spyOn(permissionsService, 'update').mockResolvedValue({ permission: updatedPermission });

          // const result = await permissionsController.update(permissionId, updatePermissionDto);

          // expect(result).toEqual(updatedPermission);
        });

        //* ------ CHANGE STATUS TEST ------ *//
        describe('desactivate', () => {
          it('Should change the isActive status of a permission', async () => {
            const permissionId = '2214d37b-79e8-40f5-a55a-a63cf1e4b4f4';

            const initialPermissionStatus = await permissionsController.findOne(permissionId);

            const finalPermissionStatus: Permission = {
              id: permissionId,
              name: 'empresas',
              isActive: !initialPermissionStatus.isActive,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            jest.spyOn(permissionsService, 'desactivate').mockResolvedValue({ permission: finalPermissionStatus });

            const result = await permissionsService.desactivate(permissionId);

            expect(result).toBe({ permission: finalPermissionStatus });
          });
        });
      });
    });
  });
});