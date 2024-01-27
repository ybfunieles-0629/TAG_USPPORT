import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PurchaseOrder } from '../purchase-order/entities/purchase-order.entity';
import { SystemConfig } from '../system-configs/entities/system-config.entity';
import { Client } from '../clients/entities/client.entity';
import { OrderListDetail } from '../order-list-details/entities/order-list-detail.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,

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
      .leftJoin('orderListDetails.product', 'product')
      .where('purchaseOrder.createdAt >= :startDate', { startDate })
      .andWhere('purchaseOrder.createdAt < :endDate', { endDate })
      .getMany();

    // Crear un mapa para almacenar las métricas por cliente
    const clientMetricsMap: Map<string, any> = new Map();

    // Calcular las métricas por cliente
    purchaseOrders.forEach((order: PurchaseOrder) => {
      const clientId = order.clientUser;
      if (!clientMetricsMap.has(clientId)) {
        clientMetricsMap.set(clientId, {
          ventas: 0,
          utilidad: 0,
          carritosRealizados: 0,
          itemsCotizados: 0,
          ocRecibidas: 0,
          pedidos: 0
        });
      }

      // Incrementar ventas y utilidad del cliente
      clientMetricsMap.get(clientId).ventas += order.value;
      clientMetricsMap.get(clientId).utilidad += order.businessUtility; // Suponiendo que 'businessUtility' es el campo de utilidad en la orden

      // Incrementar carritos realizados y calcular items cotizados, ocRecibidas y pedidos
      clientMetricsMap.get(clientId).carritosRealizados++;
      order.orderListDetails?.forEach((orderListDetail: OrderListDetail) => {
        clientMetricsMap.get(clientId).itemsCotizados += orderListDetail.productTotalPrice; // Cambiar al campo correcto que representa el precio total del producto
        clientMetricsMap.get(clientId).ocRecibidas++;
        clientMetricsMap.get(clientId).pedidos++;
      });
    });

    // Obtener los 10 principales clientes con más compras
    const top10ClientsInfo: Client[] = await this.clientRepository
      .createQueryBuilder('client')
      .leftJoin('client.cartQuotes', 'cartQuotes')
      // .orderBy('cartQuotes.', 'DESC') // Ordenar por la cantidad de cotizaciones
      .take(10)
      .getMany();

    // Formatear la información de los clientes
    const top10ClientsFormatted = top10ClientsInfo.map((client, index) => {
      const clientId = client.id;
      const metrics = clientMetricsMap.get(clientId);
      return {
        rank: index + 1,
        clientId: clientId,
        ventas: metrics?.ventas || 0,
        utilidad: metrics?.utilidad || 0,
        carritosRealizados: metrics?.carritosRealizados || 0,
        itemsCotizados: metrics?.itemsCotizados || 0,
        ocRecibidas: metrics?.ocRecibidas || 0,
        pedidos: metrics?.pedidos || 0
      };
    });

    return {
      top10Clientes: top10ClientsFormatted
    };
  }
}