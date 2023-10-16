import { Module } from '@nestjs/common';
import { CompaniesModule } from 'src/companies/companies.module';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [
    RolesModule,
    CompaniesModule,
    
  ],
  exports: []
})
export class CommonModule { }