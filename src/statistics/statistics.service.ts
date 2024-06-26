import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, IsNull, Not, Repository } from 'typeorm';

import { PurchaseOrder } from '../purchase-order/entities/purchase-order.entity';
import { SystemConfig } from '../system-configs/entities/system-config.entity';
import { Client } from '../clients/entities/client.entity';
import { OrderListDetail } from '../order-list-details/entities/order-list-detail.entity';
import { User } from '../users/entities/user.entity';
import { CategorySupplier } from '../category-suppliers/entities/category-supplier.entity';
import { CommercialQualification } from '../commercial-qualification/entities/commercial-qualification.entity';
import { OrderRating } from '../order-ratings/entities/order-rating.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(CategorySupplier)
    private readonly categorySupplierRepository: Repository<CategorySupplier>,

    @InjectRepository(CommercialQualification)
    private readonly commercialQualificationRepository: Repository<CommercialQualification>,

    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(OrderRating)
    private readonly orderRatingRepository: Repository<OrderRating>,

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





  async getCommercialQualificationStatsByMonth(year: number, commercial?: string): Promise<any> {
    const startDate = new Date(year, 0, 1); // Primer día del año
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999); // Último día del año

    const whereOptions: any = {
      createdAt: Between(startDate, endDate), // Filtrar por el año especificado
    };

    if (commercial) {
      whereOptions.purchaseOrder = { commercialUser: commercial }; // Filtrar por el usuario comercial especificado
    }

    const qualifications = await this.commercialQualificationRepository.find({
      where: whereOptions,
      relations: ['purchaseOrder'],
    });

    const statsByMonth = {
      kindness: {},
      responseTime: {},
      quoteTime: {},
    };

    // Inicializar estadísticas por mes y calificación
    for (let month = 0; month < 12; month++) {
      const monthName = new Date(year, month).toLocaleString('default', { month: 'long' }); // Obtener el nombre del mes
      statsByMonth.kindness[monthName] = {};
      statsByMonth.responseTime[monthName] = {};
      statsByMonth.quoteTime[monthName] = {};

      for (let rating = 1; rating <= 5; rating++) {
        statsByMonth.kindness[monthName][rating.toString()] = 0;
        statsByMonth.responseTime[monthName][rating.toString()] = 0;
        statsByMonth.quoteTime[monthName][rating.toString()] = 0;
      }
    }

    // Contar las calificaciones por mes y por tipo
    qualifications.forEach(qualification => {
      const monthName = new Date(qualification.createdAt).toLocaleString('default', { month: 'long' });
      statsByMonth.kindness[monthName][qualification.kindness.toString()]++;
      statsByMonth.responseTime[monthName][qualification.responseTime.toString()]++;
      statsByMonth.quoteTime[monthName][qualification.quoteTime.toString()]++;
    });

    return statsByMonth;
  }

















  async getOrderRatingStatsByMonth(year: number, client?: string): Promise<any> {
    const startDate = new Date(year, 0, 1); // Primer día del año
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999); // Último día del año

    const whereOptions: any = {
      createdAt: Between(startDate, endDate), // Filtrar por el año especificado
    };

    if (client) {
      whereOptions['orderListDetail.purchaseOrder.clientUser'] = client;
    }

    const ratings = await this.orderRatingRepository.find({
      where: whereOptions,
      relations: ['orderListDetail', 'orderListDetail.purchaseOrder'],
    });

    const statsByMonth = {
      deliveryTime: {},
      packingQuality: {},
      productQuality: {},
      markingQuality: {},
    };

    // Inicializar estadísticas por mes y calificación
    for (let month = 0; month < 12; month++) {
      const monthName = new Date(year, month).toLocaleString('default', { month: 'long' }); // Obtener el nombre del mes
      statsByMonth.deliveryTime[monthName] = {};
      statsByMonth.packingQuality[monthName] = {};
      statsByMonth.productQuality[monthName] = {};
      statsByMonth.markingQuality[monthName] = {};

      for (let rating = 1; rating <= 5; rating++) {
        statsByMonth.deliveryTime[monthName][rating.toString()] = 0;
        statsByMonth.packingQuality[monthName][rating.toString()] = 0;
        statsByMonth.productQuality[monthName][rating.toString()] = 0;
        statsByMonth.markingQuality[monthName][rating.toString()] = 0;
      }
    }

    // Contar las calificaciones por mes y por tipo
    ratings.forEach(rating => {
      const monthName = new Date(rating.createdAt).toLocaleString('default', { month: 'long' });
      statsByMonth.deliveryTime[monthName][rating.deliveryTime.toString()]++;
      statsByMonth.packingQuality[monthName][rating.packingQuality.toString()]++;
      statsByMonth.productQuality[monthName][rating.productQuality.toString()]++;
      statsByMonth.markingQuality[monthName][rating.markingQuality.toString()]++;
    });

    return statsByMonth;
  };


















  // REPORTE DE FLUJO DE CAJA
  async getCashFlowReport(year: number, month: number): Promise<any> {
    // const fechaInicio = new Date(year, month - 1, 1); // Inicio del mes seleccionado
    // const fechaFin = new Date(year, month, 0, 23, 59, 59, 999); // Fin del mes seleccionado


    // let montoTotalNoFacturado = 0;
    // let montoTotalVencido = 0;
    // let diasVencimiento = [8, 15, 30, 45, 60];
    // const ordenesVencidasPorDias = {};


    // // Buscar todos los clientes corporativos
    // const clientesCorporativos = await this.userRepository
    //   .createQueryBuilder('user')
    //   .where('user.isCoorporative = :value', { value: 1 })
    //   .leftJoinAndSelect('user.client', 'client')
    //   .andWhere('client.id IS NOT NULL') // Corregido para usar andWhere en lugar de where
    //   .getMany();

    // // Obtener los IDs de los clientes corporativos
    // const idsClientesCorporativos = clientesCorporativos.map(cliente => cliente.id);


    // // Buscar las órdenes asociadas con clientes corporativos y facturadas dentro del mes seleccionado
    // const fechaInicioFormatted = fechaInicio.toISOString().slice(0, 10); // 'YYYY-MM-DD'
    // const fechaFinFormatted = fechaFin.toISOString().slice(0, 10); // 'YYYY-MM-DD'

    // // Buscar las órdenes asociadas con clientes corporativos y facturadas dentro del mes seleccionado
    // const ordenesCorporativas = await this.purchaseOrderRepository
    //   .createQueryBuilder('order')
    //   .leftJoinAndSelect('order.state', 'state') // Cargar la relación con el estado
    //   .where('order.clientUser IN (:...ids)', { ids: idsClientesCorporativos })
    //   // .andWhere('DATE(order.invoiceDueDate) BETWEEN :startDate AND :endDate', {
    //   //   startDate: fechaInicioFormatted,
    //   //   endDate: fechaFinFormatted,
    //   // })
    //   .getMany();


    // // Buscar todas las órdenes en producción para clientes no corporativos
    // const ordenesNoCorporativas = await this.purchaseOrderRepository
    //   .createQueryBuilder('order')
    //   .leftJoinAndSelect('order.state', 'state') // Cargar la relación con el estado
    //   .where('order.clientUser NOT IN (:...ids)', { ids: idsClientesCorporativos })
    //   .andWhere('order.stateId = :state', { state: 'b7fded6c-ac99-48b8-b66b-30d3d8550cff' })
    //   // .andWhere('order.creationDate BETWEEN :startDate AND :endDate', {
    //   //   startDate: fechaInicio,
    //   //   endDate: fechaFin,
    //   // })
    //   .getMany();


    // // Inicializar el contador de órdenes vencidas por días con ceros para cada categoría
    // let TotalordenesVencidasPorDiasAcomuladas = {
    //   '8': 0,
    //   '15': 0,
    //   '30': 0,
    //   '45': 0,
    //   '60': 0,
    //   '60+': 0
    // };

    // ordenesCorporativas.forEach(orden => {
    //   montoTotalNoFacturado += orden.value;
    //   if (orden.state.name.toLowerCase().trim() === 'factura en mora') {
    //     // Convertir orden.invoiceDueDate en un objeto Date
    //     const invoiceDueDate = new Date(orden.invoiceDueDate);
    //     // Verificar si la conversión fue exitosa antes de llamar a getTime()
    //     if (!isNaN(invoiceDueDate.getTime())) {
    //       // Aquí puedes usar invoiceDueDate.getTime() sin preocuparte por errores
    //       const diasVencidos = Math.ceil((fechaFin.getTime() - invoiceDueDate.getTime()) / (1000 * 3600 * 24));
    //       console.log(diasVencidos);
    //       let categoria = '60+';
    //       for (let dias of diasVencimiento) {
    //         if (diasVencidos <= dias) {
    //           categoria = dias.toString();
    //           break;
    //         }
    //       }
    //       TotalordenesVencidasPorDiasAcomuladas[categoria]++;
    //     } else {
    //       // Si la conversión falla, imprime un mensaje de error
    //     }
    //   }
    // });

    // // Recorrer las órdenes corporativas para calcular totales y órdenes vencidas
    // ordenesCorporativas.forEach(orden => {
    //   // Para órdenes no facturadas, sumar al monto total no facturado
    //   if (!orden.invoiceDueDate) {
    //     montoTotalNoFacturado += orden.value;
    //   }

    //   // Para órdenes con facturas vencidas, sumar al monto total vencido y contar los días de vencimiento
    //   if (orden.state.name.toLowerCase().trim() === 'FACTURA EN MORA') {
    //     montoTotalVencido += orden.value;

    //     const diasVencidos = Math.ceil((fechaFin.getTime() - orden.invoiceDueDate.getTime()) / (1000 * 3600 * 24));
    //     const categoriaDiaVencimiento = diasVencimiento.find(dias => dias >= diasVencidos) || '60+';
    //     ordenesVencidasPorDias[categoriaDiaVencimiento] = (ordenesVencidasPorDias[categoriaDiaVencimiento] || 0) + orden.value;
    //   }
    // });

    // // Recorrer las órdenes no corporativas en producción
    // ordenesNoCorporativas.forEach(orden => {
    //   // Para órdenes no facturadas, sumar al monto total no facturado
    //   if (!orden.invoiceDueDate) {
    //     montoTotalNoFacturado += orden.value;
    //   }
    // });

    // // Calcular el total de órdenes vencidas para cada categoría de días vencidos
    // const totalOrdenesVencidasPorDias = Object.values<number>(ordenesVencidasPorDias).reduce((acc, val) => acc + val, 0);

    // // Calcular el total de órdenes vencidas
    // const totalOrdenesVencidas = Object.keys(ordenesVencidasPorDias).length;

    // // Calcular el total de órdenes
    // const totalOrdenes = ordenesCorporativas.length + ordenesNoCorporativas.length;

    // return {
    //   // ordenesCorporativas,
    //   montoTotalVencido,
    //   ordenesVencidasPorDias,
    //   totalOrdenesVencidasPorDias,
    //   totalOrdenesVencidas,
    //   totalOrdenes,
    //   TotalordenesVencidasPorDiasAcomuladas,
    //   montoTotalNoFacturado
    // };

    const today = new Date();
    let startDate: Date;

    // Si el año proporcionado es mayor que el año actual, establecer la fecha actual al primer día del primer mes del año siguiente
    if (year > today.getFullYear()) {
      startDate = new Date(year, 0, 1); // Primer día del año seleccionado
    } else {
      startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }

    // Definir la fecha de fin del mes seleccionado (último día del año seleccionado)
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);


    let montoTotalNoFacturado = 0;
    let montoTotalVencido = 0;
    let diasVencimiento = [8, 15, 30, 45, 60];
    let porFacturar = 0;
    const ordenesVencidasPorDias = {};
    const TotalordenesVencidasPorDiasAcomuladas = {
      '8': 0,
      '15': 0,
      '30': 0,
      '45': 0,
      '60': 0,
      '60+': 0
    };

    const clientesCorporativos = await this.userRepository
      .createQueryBuilder('user')
      .where('user.isCoorporative = :value', { value: 1 })
      .leftJoinAndSelect('user.client', 'client')
      .andWhere('client.id IS NOT NULL')
      .getMany();

    const idsClientesCorporativos = clientesCorporativos.map(cliente => cliente.id);

    const ordenesCorporativas = await this.purchaseOrderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.state', 'state')
      .where('order.clientUser IN (:...ids)', { ids: idsClientesCorporativos })
      .getMany();

    const ordenesNoCorporativas = await this.purchaseOrderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.state', 'state')
      .where('order.clientUser NOT IN (:...ids)', { ids: idsClientesCorporativos })
      .andWhere('order.stateId = :state', { state: 'b7fded6c-ac99-48b8-b66b-30d3d8550cff' })
      .getMany();

    ordenesCorporativas.forEach(orden => {
      montoTotalNoFacturado += orden.value;
      if (orden.state.name.toLowerCase().trim() === 'factura en mora') {
        const diasVencidos = Math.ceil((startDate.getTime() - new Date(orden.invoiceDueDate).getTime()) / (1000 * 3600 * 24));
        let categoria = '60+';
        for (let i = 0; i < diasVencimiento.length; i++) {
          if (diasVencidos <= diasVencimiento[i]) {
            categoria = diasVencimiento[i].toString();
            break;
          }
        }
        TotalordenesVencidasPorDiasAcomuladas[categoria]++;
      }
    });

    ordenesCorporativas.forEach(orden => {
      if (!orden.invoiceDueDate) {
        montoTotalNoFacturado += orden.value;
      }
      if (orden.state.name.toLowerCase().trim() === 'factura en mora') {
        montoTotalVencido += orden.value;
        const diasVencidos = Math.ceil((startDate.getTime() - new Date(orden.invoiceDueDate).getTime()) / (1000 * 3600 * 24));
        let categoriaDiaVencimiento = '';
        for (let i = 0; i < diasVencimiento.length; i++) {
          if (diasVencidos <= diasVencimiento[i]) {
            categoriaDiaVencimiento = diasVencimiento[i].toString();
            break;
          }
        }
        ordenesVencidasPorDias[categoriaDiaVencimiento] = (ordenesVencidasPorDias[categoriaDiaVencimiento] || 0) + orden.value;
      }
    });

    ordenesNoCorporativas.forEach(orden => {
      if (!orden.invoiceDueDate) {
        montoTotalNoFacturado += orden.value;
      }
    });

    const totalOrdenesVencidasPorDias = Object.values<number>(ordenesVencidasPorDias).reduce((acc, val) => acc + val, 0);
    const totalOrdenesVencidas = Object.keys(ordenesVencidasPorDias).length;
    const totalOrdenes = ordenesCorporativas.length + ordenesNoCorporativas.length;

    return {
      montoTotalVencido,
      ordenesVencidasPorDias,
      totalOrdenesVencidasPorDias,
      totalOrdenesVencidas,
      totalOrdenes,
      TotalordenesVencidasPorDiasAcomuladas,
      montoTotalNoFacturado
    };
  }














  // async getPortfolioReport(year: number, month: number): Promise<any> {
  //   const fechaInicio = new Date(year, month - 1, 1); // Inicio del mes seleccionado
  //   const fechaFin = new Date(year, month, 0, 23, 59, 59, 999); // Fin del mes seleccionado

  //   // Buscar todas las órdenes en producción
  //   const ordenesEnProduccion = await this.purchaseOrderRepository.find({
  //     where: {
  //       invoiceDueDate: IsNull(), // Órdenes que no tienen factura
  //       creationDate: Between(fechaInicio, fechaFin),
  //     },
  //   });

  //   console.log(ordenesEnProduccion)
  //   // Obtener el valor total de las órdenes en producción
  //   const montoTotalEnProduccion = ordenesEnProduccion.reduce((acc, orden) => acc + orden.value, 0);

  //   // Buscar todas las órdenes por facturar
  //   const ordenesPorFacturar = await this.purchaseOrderRepository.find({
  //     where: {
  //       invoiceDueDate: IsNull(), // Órdenes que no tienen factura
  //     },
  //   });
  //   console.log(ordenesPorFacturar)

  //   // Buscar todas las órdenes por pagar
  //   const ordenesPorPagar = await this.purchaseOrderRepository.find({
  //     where: {
  //       invoiceDueDate: Not(IsNull()), // Órdenes que tienen factura
  //       state: In(['TODOS LOS PEDIDOS ENTREGADOS', 'NOVEDAD EN PEDIDO RECIBIDO POR EL CLIENTE', 'FACTURADA', 'FACTURA ACEPTADA', 'FACTURA EN MORA']),
  //     },
  //   });

  //   console.log(ordenesPorPagar)
  //   // Buscar todas las órdenes en mora
  //   const ordenesEnMora = await this.purchaseOrderRepository.find({
  //     where: {
  //       invoiceDueDate: Not(IsNull()), // Órdenes que tienen factura
  //       state: {
  //         name: 'FACTURA EN MORA',
  //       },
  //     },
  //   });
  //   console.log(ordenesEnMora)

  //   // Buscar todas las órdenes pagadas
  //   const ordenesPagadasCorporativos = await this.purchaseOrderRepository.find({
  //     where: {
  //       invoiceDueDate: Not(IsNull()), // Órdenes que tienen factura
  //       state: {
  //         name: 'FACTURA PAGADA',
  //       },
  //     },
  //   });
  //   console.log(ordenesPagadasCorporativos)


  //   // Calcular los totales
  //   const totalEnProduccion = montoTotalEnProduccion;
  //   const totalPorFacturar = ordenesPorFacturar.reduce((acc, orden) => acc + orden.value, 0);
  //   const totalPorPagar = ordenesPorPagar.reduce((acc, orden) => acc + orden.value, 0);
  //   const totalEnMora = ordenesEnMora.reduce((acc, orden) => acc + orden.value, 0);
  //   const totalPagadas = ordenesPagadasCorporativos.reduce((acc, orden) => acc + orden.value, 0);

  //   const total = totalEnProduccion + totalPorFacturar + totalPorPagar + totalEnMora + totalPagadas;
  //   console.log(total)
  //   return {
  //     totalEnProduccion,
  //     totalPorFacturar,
  //     totalPorPagar,
  //     totalEnMora,
  //     totalPagadas,
  //     total,
  //   };
  // }




  // REPORTE DE CARTERAS
  async getPortfolioReport(year: number, month: number): Promise<any> {
    const fechaInicio = new Date(year, 0, 1); // Inicio del año seleccionado
    const fechaFin = new Date(year, 11, 31, 23, 59, 59, 999); // Fin del año seleccionado


    let totalPagadas = 0;
    let totalPorPagar = 0;



    // Buscar todas las órdenes en producción para el año seleccionado
    const ordenesEnProduccion = await this.purchaseOrderRepository.find({
      where: {
        invoiceDueDate: IsNull(), // Órdenes que no tienen factura
        creationDate: Between(fechaInicio, fechaFin),
      },
    });

    // Obtener el valor total de las órdenes en producción
    const montoTotalEnProduccion = ordenesEnProduccion.reduce((acc, orden) => acc + orden.value, 0);

    console.log(ordenesEnProduccion)
    // Buscar todas las órdenes por facturar para el año seleccionado
    const ordenesPorFacturar = await this.purchaseOrderRepository.find({
      where: {
        invoiceDueDate: IsNull(), // Órdenes que no tienen factura
        creationDate: Between(fechaInicio, fechaFin),
      },
    });

    // Buscar todas las órdenes por pagar para el año seleccionado
    const ordenesPorPagar = await this.purchaseOrderRepository.find({
      where: {
        // invoiceDueDate: Not(IsNull()), // Órdenes que tienen factura
        state: In(['TODOS LOS PEDIDOS ENTREGADOS', 'NOVEDAD EN PEDIDO RECIBIDO POR EL CLIENTE', 'FACTURADA', 'FACTURA ACEPTADA', 'FACTURA EN MORA']),
        // creationDate: Between(fechaInicio, fechaFin),
      },
    });

    console.log(ordenesPorPagar)


    // Buscar todas las órdenes en mora para el año seleccionado
    const ordenesEnMora = await this.purchaseOrderRepository.find({
      where: {
        invoiceDueDate: Not(IsNull()), // Órdenes que tienen factura
        state: {
          name: 'FACTURA EN MORA',
        },
        creationDate: Between(fechaInicio, fechaFin),
      },
    });

    // Buscar todas las órdenes pagadas para el año seleccionado
    const ordenesPagadasCorporativos = await this.purchaseOrderRepository.find({
      where: {
        invoiceDueDate: Not(IsNull()), // Órdenes que tienen factura
        state: {
          name: 'FACTURA PAGADA',
        },
        creationDate: Between(fechaInicio, fechaFin),
      },
    });

    ordenesPagadasCorporativos.forEach(orden => {
      totalPagadas += orden.value;
    });
    





    
    
    
    const clientesNoCorporativos = await this.userRepository
      .createQueryBuilder('user')
      .where('user.isCoorporative = :value', { value: 0 })
      .leftJoinAndSelect('user.client', 'client')
      .andWhere('client.id IS NOT NULL')
      .getMany();

    const idsClientesNoCorporativos = clientesNoCorporativos.map(cliente => cliente.id);

    console.log(idsClientesNoCorporativos)
    const ordenesNoCorporativas = await this.purchaseOrderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.state', 'state')
      .where('order.clientUser NOT IN (:...ids)', { ids: idsClientesNoCorporativos })
      .andWhere('YEAR(order.creationDate) = :year', { year: year }) // Filtrar por año de creación
      .getMany();

    console.log(ordenesNoCorporativas)
    
    ordenesNoCorporativas.forEach(orden => {
        totalPagadas += orden.value;
    });

    console.log(totalPagadas)


    // Calcular los totales
    const totalEnProduccion = montoTotalEnProduccion;
    const totalPorFacturar = ordenesPorFacturar.reduce((acc, orden) => acc + orden.value, 0);
    const totalEnMora = ordenesEnMora.reduce((acc, orden) => acc + orden.value, 0);

    const total = totalEnProduccion + totalPorFacturar + totalPorPagar + totalEnMora + totalPagadas;

    return {
      totalEnProduccion,
      totalPorFacturar,
      totalPorPagar,
      totalEnMora,
      totalPagadas,
      total,
    };
  }




}