import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PurchaseOrder } from '../purchase-order/entities/purchase-order.entity';
import { SystemConfig } from '../system-configs/entities/system-config.entity';
import { Client } from '../clients/entities/client.entity';
import { OrderListDetail } from '../order-list-details/entities/order-list-detail.entity';
import { User } from '../users/entities/user.entity';
import { CategorySupplier } from '../category-suppliers/entities/category-supplier.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(CategorySupplier)
    private readonly categorySupplierRepository: Repository<CategorySupplier>,

    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(SystemConfig)
    private readonly systemConfigRepository: Repository<SystemConfig>,
  ) { }

  async getStatistics() {
    const systemConfig: SystemConfig[] = await this.systemConfigRepository.find();
    const salesGoal: number = systemConfig[0].salesGoal;

    const purchaseOrders: PurchaseOrder[] = await this.purchaseOrderRepository.find();
    const missingForTheGoal: number = purchaseOrders.reduce((acc, order) => acc + order.value, 0);

    let minValue = Math.min(missingForTheGoal, salesGoal);
    let maxValue = Math.max(missingForTheGoal, salesGoal);

    const percentage: number = (minValue / maxValue) * 100;

    return {
      salesGoal,
      missingForTheGoal,
      percentage: percentage.toFixed(2),
    };
  };

  async getTop10ClientsWithMostPurchases(yearParam: number) {
    const currentDate: Date = new Date();
    const currentYear: number = currentDate.getFullYear();
    const year: number = yearParam || currentYear;

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    // Obtener todas las órdenes de compra dentro del año especificado
    const purchaseOrders: PurchaseOrder[] = await this.purchaseOrderRepository
      .createQueryBuilder('purchaseOrder')
      .leftJoinAndSelect('purchaseOrder.orderListDetails', 'orderListDetails')
      .leftJoinAndSelect('orderListDetails.product', 'product')
      .where('purchaseOrder.createdAt >= :startDate', { startDate })
      .andWhere('purchaseOrder.createdAt < :endDate', { endDate })
      .getMany();

    // Calcular ventas totales y utilidad total
    let ventas = 0;
    let utilidadTotal = 0;
    purchaseOrders.forEach(order => {
      ventas += order.value;
      utilidadTotal += order.businessUtility;
    });

    // Asegurarse de que la utilidad no sea negativa
    utilidadTotal = Math.max(0, utilidadTotal);

    // Obtener las ventas por cliente
    const clientSales: Map<string, number> = new Map();
    const clientTotalValue: Map<string, number> = new Map(); // Map para almacenar el total de compras de cada cliente
    const clientTotalUtility: Map<string, number> = new Map(); // Map para almacenar la utilidad total de compras de cada cliente
    purchaseOrders.forEach(order => {
      const clientId = order.clientUser;
      const total = clientSales.get(clientId) || 0;
      clientSales.set(clientId, total + order.value);

      const totalValue = clientTotalValue.get(clientId) || 0;
      clientTotalValue.set(clientId, totalValue + order.value); // Agregar el valor de la compra al total del cliente

      const totalUtility = clientTotalUtility.get(clientId) || 0;
      clientTotalUtility.set(clientId, totalUtility + order.businessUtility); // Agregar la utilidad de la compra al total del cliente
    });

    // Ordenar los clientes por total de compras
    const sortedClients = Array.from(clientTotalValue.entries())
      .sort((a, b) => b[1] - a[1]) // Ordenar de mayor a menor por valor total de compras
      .slice(0, 10);

    // Calcular métricas por cliente
    const clientsMetrics = await Promise.all(sortedClients.map(async ([clientId, totalSales], index) => {
      const client = await this.clientRepository.findOne({
        where: {
          id: clientId,
        },
        relations: [
          'user',
        ],
      });

      // Obtener el cliente por su ID
      const orders = await this.purchaseOrderRepository.count({ where: { clientUser: clientId } });
      const orderDetails = await this.purchaseOrderRepository.find({
        where: { clientUser: clientId },
        relations: ['orderListDetails']
      });

      const itemsCotizados = orderDetails.reduce((acc, orderDetail) => {
        orderDetail.orderListDetails.forEach(detail => acc += detail.quantities);
        return acc;
      }, 0);

      const totalProducts = orderDetails.reduce((acc, orderDetail) => {
        orderDetail.orderListDetails.forEach(detail => acc += detail.quantities);
        return acc;
      }, 0);

      // Calcular la utilidad total del cliente
      const clientUtility = clientTotalUtility.get(clientId) || 0;

      // Calcular ROI
      const roi = utilidadTotal !== 0 ? clientUtility / ventas : 0;

      return {
        rank: index + 1,
        clientId,
        clientName: client?.user?.name || 'Unknown', // Obtener el nombre del cliente
        ventas: totalSales,
        porcentajeSobreVentas: ((ventas - totalSales) / ventas) * 100,
        porcentajeSobreUtilidad: (clientUtility / utilidadTotal) * 100,
        utilidad: clientUtility,
        roi,
        carritosRealizados: orders,
        itemsCotizados,
        ocRecibidas: orders,
        pedidos: totalProducts,
        ticket: ((totalSales - orders))
      };
    }));

    return {
      ventas,
      utilidadTotal,
      top10Clientes: clientsMetrics
    };
  };


  // ticket: ((totalSales - orders))
  // porcentajeSobreUtilidad: (utitilidadTotal ) * 100,
  // porcentajeSobreVentas: ((ventas - totalSales) / ventas) * 100,

  async getStatsForYears(startYear: number, endYear: number) {
    // Validar que el año de inicio sea menor que el año de fin
    if (startYear > endYear) {
      throw new Error('El año de inicio no puede ser mayor que el año de fin.');
    }

    const statsByYear = [];

    let previousYearSales = 0; // Variable para almacenar las ventas del año anterior

    for (let year = startYear; year <= endYear; year++) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

      // Obtener todas las órdenes de compra dentro del año actual
      const purchaseOrders: PurchaseOrder[] = await this.purchaseOrderRepository
        .createQueryBuilder('purchaseOrder')
        .leftJoinAndSelect('purchaseOrder.orderListDetails', 'orderListDetails')
        .leftJoinAndSelect('orderListDetails.product', 'product')
        .where('purchaseOrder.createdAt >= :startDate', { startDate })
        .andWhere('purchaseOrder.createdAt < :endDate', { endDate })
        .getMany();

      // Calcular ventas totales y utilidad total
      let ventas = 0;
      let utilidadTotal = 0;
      purchaseOrders.forEach(order => {
        ventas += order.value;
        utilidadTotal += order.businessUtility;
      });

      // Asegurarse de que la utilidad no sea negativa
      utilidadTotal = Math.max(0, utilidadTotal);

      // Calcular el ROI
      const roi = ventas !== 0 ? utilidadTotal / ventas : 0;

      // Calcular el total de pedidos
      const totalOrders = purchaseOrders.length;

      // Calcular el total de ítems cotizados
      const totalItemsCotizados = purchaseOrders.reduce((acc, order) => {
        order.orderListDetails.forEach(detail => acc += detail.quantities);
        return acc;
      }, 0);

      // Calcular el total de productos pedidos
      const totalProducts = purchaseOrders.reduce((acc, order) => {
        order.orderListDetails.forEach(detail => acc += detail.quantities);
        return acc;
      }, 0);

      // Calcular la diferencia con respecto al año anterior
      const difference = ventas - previousYearSales;

      // Actualizar las ventas del año anterior para el próximo ciclo
      previousYearSales = ventas;

      // Agregar estadísticas por año al arreglo
      statsByYear.push({
        year,
        ventas,
        utilidadTotal,
        roi,
        totalOrders,
        totalItemsCotizados,
        totalProducts,
        difference,
        carritosRealizados: totalOrders,
        pedidos: totalOrders,
        ratioEficienciaProductos: totalItemsCotizados / totalProducts,
        ticketPromedio: ventas / totalOrders
      });
    }

    return statsByYear;
  }

  async getCommercialReportsForYear(yearParam: number) {
    const currentDate: Date = new Date();
    const currentYear: number = currentDate.getFullYear();
    const year: number = yearParam || currentYear;

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    // Obtener todas las órdenes de compra dentro del año especificado con su información de aprobación de usuario
    const purchaseOrders: PurchaseOrder[] = await this.purchaseOrderRepository
      .createQueryBuilder('purchaseOrder')
      .leftJoinAndSelect('purchaseOrder.orderListDetails', 'orderListDetails')
      .leftJoinAndSelect('orderListDetails.product', 'product')
      .where('purchaseOrder.createdAt >= :startDate', { startDate })
      .andWhere('purchaseOrder.createdAt < :endDate', { endDate })
      .getMany();

    // Calcular los informes comerciales para cada orden
    const commercialReports: any[] = [];
    await Promise.all(purchaseOrders.map(async (order) => {
      const userApproval = order.userApproval;

      if (userApproval) {
        const userId = userApproval;

        // Verificar si ya se ha calculado el informe comercial para este usuario
        const existingReport = commercialReports.find(report => report.userId === userId);

        if (!existingReport) {
          // Obtener la información del usuario comercial
          const user = await this.userRepository.findOne({
            where: {
              id: userId,
            },
          });

          // Calcular las ventas y la utilidad para este comercial
          const totalSalesYear = order.value;
          const totalUtilityYear = order.businessUtility;

          // Asegurarse de que la utilidad no sea negativa
          const utilityYear = Math.max(0, totalUtilityYear);

          // Calcular los porcentajes
          const salesPercentage = totalSalesYear !== 0 ? (totalSalesYear / totalSalesYear) * 100 : 0;
          const utilityPercentage = utilityYear !== 0 ? (utilityYear / totalSalesYear) * 100 : 0;

          // Crear el informe comercial
          commercialReports.push({
            userId: userId,
            commercialName: user?.name || 'Unknown',
            totalSalesYear: totalSalesYear,
            salesPercentage: salesPercentage,
            totalUtilityYear: utilityYear,
            utilityPercentage: utilityPercentage
          });
        } else {
          // Si ya se ha calculado el informe comercial para este usuario, actualizar los valores
          existingReport.totalSalesYear += order.value;
          existingReport.totalUtilityYear += order.businessUtility;
          existingReport.salesPercentage = existingReport.totalSalesYear !== 0 ?
            (existingReport.totalSalesYear / existingReport.totalSalesYear) * 100 : 0;
          existingReport.utilityPercentage = existingReport.totalUtilityYear !== 0 ?
            (existingReport.totalUtilityYear / existingReport.totalSalesYear) * 100 : 0;
        }
      }
    }));

    // Ordenar los informes comerciales por ventas totales del año
    const sortedCommercialReports = commercialReports.sort((a, b) => b.totalSalesYear - a.totalSalesYear);

    return sortedCommercialReports;
  };

  async getCategoryReportsForYear(yearParam: number) {
    const currentDate: Date = new Date();
    const currentYear: number = currentDate.getFullYear();
    const year: number = yearParam || currentYear;

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    // Obtener todas las órdenes de compra dentro del año especificado con la información de las categorías de los productos
    const purchaseOrders: PurchaseOrder[] = await this.purchaseOrderRepository
      .createQueryBuilder('purchaseOrder')
      .leftJoinAndSelect('purchaseOrder.orderListDetails', 'orderListDetails')
      .leftJoinAndSelect('orderListDetails.product', 'product')
      .leftJoinAndSelect('product.refProduct', 'refProduct')
      .where('purchaseOrder.createdAt >= :startDate', { startDate })
      .andWhere('purchaseOrder.createdAt < :endDate', { endDate })
      .getMany();

    // Calcular los informes de categoría para cada orden
    const categoryReports: any[] = [];
    await Promise.all(purchaseOrders.map(async (order) => {
      await Promise.all(order.orderListDetails.map(async (orderListDetail) => {
        const mainCategory = orderListDetail.product.refProduct.mainCategory;

        if (mainCategory) {
          const categoryId = mainCategory;

          // Verificar si ya se ha calculado el informe de categoría para esta categoría
          const existingReport = categoryReports.find(report => report.categoryId === categoryId);

          if (!existingReport) {
            // Obtener la información de la categoría
            const category = await this.categorySupplierRepository.findOne({
              where: {
                id: categoryId,
              },
            });

            // Calcular las ventas y la utilidad para esta categoría
            const totalSalesYear = order.value;
            const totalUtilityYear = order.businessUtility;

            // Asegurarse de que la utilidad no sea negativa
            const utilityYear = Math.max(0, totalUtilityYear);

            // Calcular los porcentajes
            const salesPercentage = totalSalesYear !== 0 ? (totalSalesYear / totalSalesYear) * 100 : 0;
            const utilityPercentage = totalSalesYear !== 0 ? (utilityYear / totalSalesYear) * 100 : 0;

            // Crear el informe de categoría
            categoryReports.push({
              categoryId: categoryId,
              categoryName: category?.name || 'Unknown',
              totalSalesYear: totalSalesYear,
              salesPercentage: salesPercentage,
              totalUtilityYear: utilityYear,
              utilityPercentage: utilityPercentage
            });
          } else {
            // Si ya se ha calculado el informe de categoría para esta categoría, actualizar los valores
            existingReport.totalSalesYear += order.value;
            existingReport.totalUtilityYear += order.businessUtility;
            existingReport.salesPercentage = existingReport.totalSalesYear !== 0 ?
              (existingReport.totalSalesYear / existingReport.totalSalesYear) * 100 : 0;
            existingReport.utilityPercentage = existingReport.totalUtilityYear !== 0 ?
              (existingReport.totalUtilityYear / existingReport.totalSalesYear) * 100 : 0;
          }
        }
      }));
    }));

    // Ordenar los informes de categoría por ventas totales del año
    const sortedCategoryReports = categoryReports.sort((a, b) => b.totalSalesYear - a.totalSalesYear);

    return sortedCategoryReports;
  }
}