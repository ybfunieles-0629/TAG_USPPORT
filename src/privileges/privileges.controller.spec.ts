import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreatePrivilegeDto } from './dto/create-privilege.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UpdatePrivilegeDto } from './dto/update-privilege.dto';
import { PrivilegesController } from './privileges.controller';
import { PrivilegesService } from './privileges.service';
import { Privilege } from './entities/privilege.entity';

describe('PrivilegesController', () => {
  let privilegesController: PrivilegesController;
  let privilegesService: PrivilegesService;

  const mockPrivilegesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    desactivate: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [PrivilegesController],
      providers: [PrivilegesService],
    })
    .overrideProvider(PrivilegesService)
    .useValue(mockPrivilegesService)
    .compile();

    privilegesController = moduleRef.get<PrivilegesController>(PrivilegesController);
    privilegesService = moduleRef.get<PrivilegesService>(PrivilegesService);
  });

  //* ------ FIND ALL TESTING ------ *//
  describe('findAll', () => {
    it('Should find all the privileges', async () => {
      const privileges: Privilege[] = [
        {
          id: '2214d37b-79e8-40f5-a55a-a63cf1e4b4f4',
          name: 'Crear',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const paginationDto: PaginationDto = { limit: 10, offset: 0 };

      const findAllSpy = jest.spyOn(privilegesService, 'findAll').mockResolvedValue(privileges);

      const result = await privilegesController.findAll(paginationDto);
      
      expect(result).toBe(privileges);
    });

    //* ------ FIND ONE TEST ------ *//
    describe('findOne', () => {
      it('Should find one privilege', async () => {
        const privilege: Privilege = {
          id: '2214d37b-79e8-40f5-a55a-a63cf1e4b4f4',
          name: 'Crear',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        jest.spyOn(privilegesService, 'findOne').mockResolvedValue(privilege);

        expect(await privilegesController.findOne(privilege.id)).toBe(privilege);
      });
    });

    //* ------ CREATE TEST ------ *//
    describe('create', () => {
      it('Should create a privilege', async () => {
        const createPrivilegeDto: CreatePrivilegeDto = {
          name: 'crear',
        };

        const createdPrivilege: Privilege = {
          id: '2214d37b-79e8-40f5-a55a-a63cf1e4b4f7',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          ...createPrivilegeDto,
        }

        jest.spyOn(privilegesService, 'create').mockResolvedValue({ privilege: createdPrivilege });

        const result = await privilegesController.create(createPrivilegeDto);

        expect(result).toBe({ privilege: createdPrivilege });
      });

      //* ------ UPDATE TEST ------ *//
      describe('update', () => {
        it('Should update a privilege', async () => {
          const privilegeId = '2214d37b-79e8-40f5-a55a-a63cf1e4b4f4';

          const updatePrivilegeDto: UpdatePrivilegeDto = {
            name: 'crear-updated'
          };

          const updatedPrivilege = {
            id: privilegeId,
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
            ...updatePrivilegeDto,
          };

          // jest.spyOn(privilegesService, 'update').mockResolvedValue({ privilege: updatedprivilege });

          // const result = await privilegesController.update(privilegeId, updateprivilegeDto);

          // expect(result).toEqual(updatedprivilege);
        });

        //* ------ CHANGE STATUS TEST ------ *//
        describe('desactivate', () => {
          it('Should change the isActive status of a privilege', async () => {
            const privilegeId = '2214d37b-79e8-40f5-a55a-a63cf1e4b4f4';

            const initialPrivilegeStatus = await privilegesController.findOne(privilegeId);

            const finalPrivilegeStatus: Privilege = {
              id: privilegeId,
              name: 'Administrador',
              isActive: !initialPrivilegeStatus.isActive,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            jest.spyOn(privilegesService, 'desactivate').mockResolvedValue({ privilege: finalPrivilegeStatus });

            const result = await privilegesService.desactivate(privilegeId);

            expect(result).toBe({ privilege: finalPrivilegeStatus });
          });
        });
      });
    });
  });
});