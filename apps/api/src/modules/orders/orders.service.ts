import prisma from '../../config/database';
import { ApiError, parsePagination, buildPaginationMeta } from '../../utils';
import { UpdateOrderStatusInput, UpdatePaymentStatusInput } from './orders.validation';

export async function getOrders(storeId: string, query: Record<string, unknown>) {
  const { page, limit, skip, search, sortBy, sortOrder } = parsePagination(query, 'createdAt', 'desc');

  const where: any = { storeId };

  if (query.status) {
    where.status = String(query.status);
  }
  
  if (query.paymentStatus) {
    where.paymentStatus = String(query.paymentStatus);
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { customerEmail: { contains: search } },
      { customerName: { contains: search } },
    ];
  }

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        items: true,
      },
    }),
  ]);

  return {
    items: orders,
    meta: buildPaginationMeta(total, page, limit),
  };
}

export async function getOrderById(storeId: string, id: string) {
  const order = await prisma.order.findFirst({
    where: { id, storeId },
    include: {
      items: true,
    },
  });

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  return order;
}

export async function updateOrderStatus(storeId: string, id: string, data: UpdateOrderStatusInput) {
  const order = await getOrderById(storeId, id);
  return prisma.order.update({
    where: { id: order.id },
    data: { status: data.status },
    include: { items: true },
  });
}

export async function updatePaymentStatus(storeId: string, id: string, data: UpdatePaymentStatusInput) {
  const order = await getOrderById(storeId, id);
  return prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: data.paymentStatus },
    include: { items: true },
  });
}

export async function deleteOrder(storeId: string, id: string) {
  const order = await getOrderById(storeId, id);
  await prisma.order.delete({
    where: { id: order.id },
  });
  return { success: true, message: 'Order deleted successfully' };
}
