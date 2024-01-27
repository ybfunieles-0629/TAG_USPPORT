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
    purchaseOrders.forEach(order => {
      const clientId = order.clientUser;
      const total = clientSales.get(clientId) || 0;
      clientSales.set(clientId, total + order.value);
    });

    // Ordenar los clientes por ventas
    const sortedClients = Array.from(clientSales.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Calcular métricas por cliente
    const clientsMetrics = await Promise.all(sortedClients.map(async ([clientId, totalSales], index) => {
      const orders = await this.purchaseOrderRepository.count({ where: { clientUser: clientId } });
      const orderDetails = await this.purchaseOrderRepository.find({
        where: { clientUser: clientId },
        relations: ['orderListDetails']
      });

      const itemsCotizados = orderDetails.reduce((acc, order) => {
        order.orderListDetails.forEach(detail => acc += detail.quantities);
        return acc;
      }, 0);

      const totalProducts = orderDetails.reduce((acc, order) => {
        order.orderListDetails.forEach(detail => acc += detail.quantities);
        return acc;
      }, 0);

      return {
        rank: index + 1,
        clientId,
        ventas: totalSales,
        porcentajeSobreVentas: ((totalSales - ventas) / ventas) * 100,
        utilidad: utilidadTotal,
        porcentajeSobreUtilidadTotal: ((utilidadTotal - utilidadTotal) / utilidadTotal) * 100 || 0,
        roi: 0, // No se proporcionó una fórmula clara para calcular ROI
        carritosRealizados: orders,
        itemsCotizados,
        ocRecibidas: orders,
        pedidos: totalProducts
      };
    }));

    return {
      ventas,
      utilidadTotal,
      top10Clientes: clientsMetrics
    };
  }
}