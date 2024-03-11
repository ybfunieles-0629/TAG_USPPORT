import { EntitySubscriberInterface, EventSubscriber, InsertEvent, Connection } from 'typeorm';
import { OrderListDetail } from '../entities/order-list-detail.entity';

@EventSubscriber()
export class OrderListDetailSubscriber implements EntitySubscriberInterface<OrderListDetail> {
  constructor(private readonly connection: Connection) { }

  listenTo() {
    return OrderListDetail;
  }

  async beforeInsert(event: InsertEvent<OrderListDetail>) {
    const orderListDetailRepository = this.connection.getRepository(OrderListDetail);
    const orderListDetail = event.entity;
    const lastOrder = await orderListDetailRepository.findOne({
      order: {
        createdAt: 'DESC',
      },
    });

    let nextOrderNumber = 10000;
    let nextOrderClientNumber = 60000;

    if (lastOrder) {
      const lastOrderNumber = parseInt(lastOrder.orderCode.slice(1));
      nextOrderNumber = lastOrderNumber + 1;
      
      const lastOrderClientNumber = parseInt(lastOrder.orderCodeClient.slice(1));
      nextOrderClientNumber = lastOrderClientNumber + 1;
    }

    orderListDetail.orderCode = `O${nextOrderNumber}`;
    orderListDetail.orderCodeClient = `C${nextOrderClientNumber}`;
  }
}