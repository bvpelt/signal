import { Injectable, Signal, signal } from '@angular/core';
import { Card } from '../data/card';
import { Order } from '../data/order';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private orders = signal<Order[]>([]);
  private nextOrderId = signal(1);

  // Readonly signal voor externe toegang
  readonly allOrders = this.orders.asReadonly();

  constructor(private loggerservice: LoggerService) {}

  async getOrders(): Promise<Order[]> {
    return this.allOrders();
  }

  async addCardToOrder(
    customerId: number,
    card: Card,
  ): Promise<Signal<Order[]>> {
    // Zoek bestaande order voor deze klant en dit artikel
    const existingOrder = this.orders().find(
      (order) => order.customerid === customerId && order.artikelid === card.id,
    );

    if (existingOrder) {
      // Update bestaande order - voeg 1 toe aan quantity
      const updatedOrder: Order = {
        ...existingOrder,
        quantity: existingOrder.quantity + 1,
        price: card.price,
      };
      this.orders.update((orders) =>
        orders.map((order) =>
          order.id === existingOrder.id ? updatedOrder : order,
        ),
      );
      return this.orders;
    } else {
      // Maak nieuwe order aan met quantity 1
      const newOrder: Order = {
        id: this.nextOrderId(),
        customerid: customerId,
        artikelid: card.id,
        description: card.title,
        quantity: 1,
        price: card.price,
      };

      this.orders.update((orders) => [...orders, newOrder]);
      this.nextOrderId.update((id) => id + 1);
      return this.orders; //newOrder;
    }
  }

  async removeCardFromOrder(
    customerId: number,
    card: Card,
  ): Promise<Order | null> {
    const existingOrder = this.orders().find(
      (order) => order.customerid === customerId && order.artikelid === card.id,
    );

    if (!existingOrder) {
      this.loggerservice.error(
        'OrdersService',
        `No existing order found for customer ${customerId} and card ${card.id}`,
      );
      return null;
    }

    if (existingOrder.quantity <= 1) {
      // Verwijder de hele order als quantity 1 of lager is
      this.orders.update((orders) =>
        orders.filter((order) => order.id !== existingOrder.id),
      );
       this.loggerservice.warning(
        'OrdersService',
        `Order for customer ${customerId} and card ${card.id} removed`,
      );
      return null;
    } else {
      // Verminder de quantity met 1
      const updatedOrder: Order = {
        ...existingOrder,
        quantity: existingOrder.quantity - 1,
      };

      this.orders.update((orders) =>
        orders.map((order) =>
          order.id === existingOrder.id ? updatedOrder : order,
        ),
      );

      return updatedOrder;
    }
  }

  async decrementCardInOrder(
    customerId: number,
    cardId: number,
  ): Promise<Order | null> {
    const existingOrder = this.orders().find(
      (order) => order.customerid === customerId && order.artikelid === cardId,
    );

    if (!existingOrder) {
      return null;
    }

    if (existingOrder.quantity <= 1) {
      // Verwijder order als quantity 1 of minder is
      this.orders.update((orders) =>
        orders.filter((order) => order.id !== existingOrder.id),
      );
      return null;
    } else {
      // Verminder quantity met 1
      const updatedOrder: Order = {
        ...existingOrder,
        quantity: existingOrder.quantity - 1,
      };

      this.orders.update((orders) =>
        orders.map((order) =>
          order.id === existingOrder.id ? updatedOrder : order,
        ),
      );

      return updatedOrder;
    }
  }

  getOrdersByCustomer(customerId: number): Order[] {
    return this.orders().filter((order) => order.customerid === customerId);
  }

  getTotalQuantity(customerId: number): number {
    return this.getOrdersByCustomer(customerId).reduce(
      (sum, order) => sum + order.quantity,
      0,
    );
  }

  getTotalPrice(customerId: number): number {
    return this.getOrdersByCustomer(customerId).reduce(
      (sum, order) => sum + order.quantity * order.price,
      0,
    );
  }

  clearOrders(): void {
    this.orders.set([]);
    this.nextOrderId.set(1);
  }
}
