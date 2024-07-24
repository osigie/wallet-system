import { PrismaClient, Prisma } from '@prisma/client';

export interface IPaginationLinks {
  first?: string;
  previous?: string;
  next?: string;
}

export interface Imetadata {
  nextCursor: number;
  previousCursor: number;
  totalCount: string;
}

const baseURL = 'http://localhost';

export async function paginate<T>(
  cursor: number,
  take: number,
  getItemId: (item: T) => number,
  getTotalCountQuery: Prisma.Sql,
  getPaginatedItem: Prisma.Sql,
  prisma: PrismaClient,
  route: string,
  additionalParams?: Record<string, any>,
): Promise<{
  items: T[];
  links: IPaginationLinks;
  metadata: Imetadata;
}> {
  // get paginated item
  const items = await prisma.$queryRaw<T[]>(getPaginatedItem);

  // Fetch total count of items
  const totalCountResult = await prisma.$queryRaw<{ count: bigint }>(
    getTotalCountQuery,
  );

  const totalCount = totalCountResult[0]?.count || BigInt(0);
  const totalCountStr = totalCount.toString();

  // Determine cursors for pagination
  const firstItem = items[0];
  const nextCursor = getItemId(items[items.length - 1]) || null;
  const previousCursor = cursor > 0 ? getItemId(items[0]) : null;

  console.log({ firstItem, nextCursor, previousCursor });

  // Generate pagination links
  const links: IPaginationLinks = {
    first: firstItem
      ? `${baseURL}${route}?cursor=${getItemId(firstItem)}&take=${take}${additionalParams ? `&${new URLSearchParams(additionalParams).toString()}` : ''}`
      : null,
    previous: previousCursor
      ? `${baseURL}${route}?cursor=${previousCursor}&take=${take}${additionalParams ? `&${new URLSearchParams(additionalParams).toString()}` : ''}`
      : null,
    next: nextCursor
      ? `${baseURL}${route}?cursor=${nextCursor}&take=${take}${additionalParams ? `&${new URLSearchParams(additionalParams).toString()}` : ''}`
      : null,
  };

  return {
    items,
    links,
    metadata: {
      nextCursor,
      previousCursor,
      totalCount: totalCountStr,
    },
  };
}
