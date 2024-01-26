import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PurchaseOrder } from '../purchase-order/entities/purchase-order.entity';
import { SystemConfig } from '../system-configs/entities/system-config.entity';
import { Client } from '../clients/entities/client.entity';

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
      percentage,
    };
  };

  async getTop10ClientsWithMostPurchases(yearParam: number) {
    const currentDate: Date = new Date();
    const currentYear: number = currentDate.getFullYear();
    const year: number = yearParam || currentYear;

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const purchaseOrders: PurchaseOrder[] = await this.purchaseOrderRepository
      .createQueryBuilder('purchaseOrder')
      .where('purchaseOrder.createdAt >= :startDate', { startDate })
      .andWhere('purchaseOrder.createdAt < :endDate', { endDate })
      .getMany();

    const clientPurchasesMap: Map<string, number> = new Map();
    purchaseOrders.forEach(order => {
      const clientId = order.clientUser;
      if (clientPurchasesMap.has(clientId)) {
        clientPurchasesMap.set(clientId, clientPurchasesMap.get(clientId)! + 1);
      } else {
        clientPurchasesMap.set(clientId, 1);
      }
    });

    const sortedClients = Array.from(clientPurchasesMap.entries()).sort((a, b) => b[1] - a[1]);

    const top10Clients = sortedClients.slice(0, 10);

    const top10ClientsInfo = await Promise.all(
      top10Clients.map(async ([clientId, _]) => {
        const clientInfo = await this.clientRepository.findOne({
          where: {
            id: clientId,
          },
        });
        return {
          clientId,
          clientInfo
        };
      })
    );

    const top10ClientsFormatted = top10ClientsInfo.map((client, index) => {
      return {
        rank: index + 1,
        clientId: client.clientId,
        clientInfo: client.clientInfo
      };
    });

    return top10ClientsFormatted;
  };
}