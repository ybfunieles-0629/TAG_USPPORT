import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClientsModule } from './clients/clients.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { PrivilegesModule } from './privileges/privileges.module';
import { CommonModule } from './common/common.module';
import { CompaniesModule } from './companies/companies.module';
import { ProductsModule } from './products/products.module';
import { ImagesModule } from './images/images.module';
import { CategoriesModule } from './categories/categories.module';
import { PricesModule } from './prices/prices.module';
import { AddressesModule } from './addresses/addresses.module';
import { BrandsModule } from './brands/brands.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { AdminModule } from './admin/admin.module';
import { SubSupplierProductTypesModule } from './sub-supplier-product-types/sub-supplier-product-types.module';
import { CategoryTagModule } from './category-tag/category-tag.module';
import { CategorySuppliersModule } from './category-suppliers/category-suppliers.module';
import { RefProductsModule } from './ref-products/ref-products.module';
import { VariantReferenceModule } from './variant-reference/variant-reference.module';
import { ColorsModule } from './colors/colors.module';
import { MarkingsModule } from './markings/markings.module';
import { MarkedServicePricesModule } from './marked-service-prices/marked-service-prices.module';
import { MarkingServicePropertiesModule } from './marking-service-properties/marking-service-properties.module';
import { MarkingTagServicesModule } from './marking-tag-services/marking-tag-services.module';
import { PackingsModule } from './packings/packings.module';
import { DeliveryTimesModule } from './delivery-times/delivery-times.module';
import { DisccountModule } from './disccount/disccount.module';
import { DisccountsModule } from './disccounts/disccounts.module';
import { TagDisccountPricesModule } from './tag-disccount-prices/tag-disccount-prices.module';
import { DiscountQuantitiesModule } from './discount-quantities/discount-quantities.module';
import { ListPricesModule } from './list-prices/list-prices.module';
import { SupplierPricesModule } from './supplier-prices/supplier-prices.module';
import { TagSubTechniquesModule } from './tag-sub-techniques/tag-sub-techniques.module';
import { TagSubTechniquePropertiesModule } from './tag-sub-technique-properties/tag-sub-technique-properties.module';
import { ExternalSubTechniquesModule } from './external-sub-techniques/external-sub-techniques.module';
import { LocalTransportPricesModule } from './local-transport-prices/local-transport-prices.module';
import { TransportServicesModule } from './transport-services/transport-services.module';
import { QuoteDetailsModule } from './quote-details/quote-details.module';
import { CartQuotesModule } from './cart-quotes/cart-quotes.module';
import { StatesModule } from './states/states.module';
import { LogosModule } from './logos/logos.module';
import { PurchaseOrderModule } from './purchase-order/purchase-order.module';
import { SwiperHomeModule } from './swiper-home/swiper-home.module';
import { SystemConfigsModule } from './system-configs/system-configs.module';
import { FinancingCostProfitsModule } from './financing-cost-profits/financing-cost-profits.module';
import { OrderListDetailsModule } from './order-list-details/order-list-details.module';
import { OrderRatingsModule } from './order-ratings/order-ratings.module';
import { CommercialQualificationModule } from './commercial-qualification/commercial-qualification.module';
import { StateChangesModule } from './state-changes/state-changes.module';
import { SupplierPurchaseOrdersModule } from './supplier-purchase-orders/supplier-purchase-orders.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      ssl: process.env.STAGE === 'prod' ? true : false,
      extra: {
        ssl: process.env.STAGE === 'prod'
          ? { rejectUnauthorized: false }
          : null,
      },
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true
    }),
    ClientsModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    PrivilegesModule,
    CommonModule,
    CompaniesModule,
    ProductsModule,
    ImagesModule,
    CategoriesModule,
    PricesModule,
    AddressesModule,
    BrandsModule,
    SuppliersModule,
    AdminModule,
    SubSupplierProductTypesModule,
    CategoryTagModule,
    CategorySuppliersModule,
    RefProductsModule,
    VariantReferenceModule,
    ColorsModule,
    MarkingsModule,
    MarkedServicePricesModule,
    MarkingServicePropertiesModule,
    MarkingTagServicesModule,
    PackingsModule,
    DeliveryTimesModule,
    DisccountModule,
    DisccountsModule,
    TagDisccountPricesModule,
    DiscountQuantitiesModule,
    ListPricesModule,
    SupplierPricesModule,
    TagSubTechniquesModule,
    TagSubTechniquePropertiesModule,
    ExternalSubTechniquesModule,
    LocalTransportPricesModule,
    TransportServicesModule,
    QuoteDetailsModule,
    CartQuotesModule,
    StatesModule,
    LogosModule,
    SystemConfigsModule,
    FinancingCostProfitsModule,
    OrderListDetailsModule,
    OrderRatingsModule,
    SwiperHomeModule,
    CommercialQualificationModule,
    StateChangesModule,
    SupplierPurchaseOrdersModule,
    // PurchaseOrderModule,
  ],
})
export class AppModule { }
