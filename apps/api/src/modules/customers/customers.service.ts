import prisma from '../../config/database';
import { ApiError, parsePagination, buildPaginationMeta } from '../../utils';
import { UpdateCustomerStatusInput } from './customers.validation';

export async function getCustomers(storeId: string, query: Record<string, unknown>) {
  const { page, limit, skip, search, sortBy, sortOrder } = parsePagination(query, 'createdAt', 'desc');

  const where: any = { storeId };

  if (query.isActive !== undefined) {
    where.isActive = query.isActive === 'true';
  }

  if (search) {
    where.OR = [
      { email: { contains: search } },
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { phone: { contains: search } },
    ];
  }

  const [total, customers] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    }),
  ]);

  // Exclude password hashes
  const items = customers.map(({ passwordHash: _, ...customer }) => ({
    ...customer,
    ordersCount: customer._count.orders,
  }));

  return {
    items,
    meta: buildPaginationMeta(total, page, limit),
  };
}

export async function getCustomerById(storeId: string, id: string) {
  const customer = await prisma.customer.findFirst({
    where: { id, storeId },
    include: {
      addresses: true,
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { items: true },
      },
    },
  });

  if (!customer) {
    throw ApiError.notFound('Customer not found');
  }

  const { passwordHash: _, ...customerWithoutPassword } = customer;
  return customerWithoutPassword;
}

export async function updateCustomerStatus(storeId: string, id: string, data: UpdateCustomerStatusInput) {
  const customer = await prisma.customer.findFirst({
    where: { id, storeId },
  });

  if (!customer) throw ApiError.notFound('Customer not found');

  const updated = await prisma.customer.update({
    where: { id },
    data: { isActive: data.isActive },
  });

  const { passwordHash: _, ...result } = updated;
  return result;
}

export async function deleteCustomer(storeId: string, id: string) {
  const customer = await prisma.customer.findFirst({
    where: { id, storeId },
  });

  if (!customer) throw ApiError.notFound('Customer not found');

  await prisma.customer.delete({
    where: { id },
  });

  return { success: true, message: 'Customer deleted successfully' };
}
