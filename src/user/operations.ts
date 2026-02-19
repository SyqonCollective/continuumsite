import { type Prisma, UserRole } from "@prisma/client";
import { type User } from "wasp/entities";
import { HttpError, prisma } from "wasp/server";
import {
  type GetPaginatedUsers,
  type UpdateIsUserAdminById,
  type UpdateUserRoleById,
} from "wasp/server/operations";
import * as z from "zod";
import { SubscriptionStatus } from "../payment/plans";
import { ensureArgsSchemaOrThrowHttpError } from "../server/validation";

const updateUserAdminByIdInputSchema = z.object({
  id: z.string().nonempty(),
  isAdmin: z.boolean(),
});

const updateUserRoleByIdInputSchema = z.object({
  id: z.string().nonempty(),
  role: z.nativeEnum(UserRole),
});

type UpdateUserAdminByIdInput = z.infer<typeof updateUserAdminByIdInputSchema>;
type UpdateUserRoleByIdInput = z.infer<typeof updateUserRoleByIdInputSchema>;

const adminRoles = new Set<UserRole>([UserRole.ADMIN, UserRole.OWNER]);

function isAdminUser(contextUser: { isAdmin?: boolean; role?: UserRole } | null) {
  if (!contextUser) return false;
  if (contextUser.isAdmin) return true;
  return contextUser.role ? adminRoles.has(contextUser.role) : false;
}

export const updateIsUserAdminById: UpdateIsUserAdminById<
  UpdateUserAdminByIdInput,
  User
> = async (rawArgs, context) => {
  const { id, isAdmin } = ensureArgsSchemaOrThrowHttpError(
    updateUserAdminByIdInputSchema,
    rawArgs,
  );

  if (!context.user) {
    throw new HttpError(
      401,
      "Only authenticated users are allowed to perform this operation",
    );
  }

  if (!isAdminUser(context.user)) {
    throw new HttpError(403, "Only admins are allowed to perform this operation");
  }

  const role = isAdmin ? UserRole.ADMIN : UserRole.VIEWER;

  return context.entities.User.update({
    where: { id },
    data: { isAdmin, role },
  });
};

export const updateUserRoleById: UpdateUserRoleById<
  UpdateUserRoleByIdInput,
  User
> = async (rawArgs, context) => {
  const { id, role } = ensureArgsSchemaOrThrowHttpError(
    updateUserRoleByIdInputSchema,
    rawArgs,
  );

  if (!context.user) {
    throw new HttpError(
      401,
      "Only authenticated users are allowed to perform this operation",
    );
  }

  if (!isAdminUser(context.user)) {
    throw new HttpError(403, "Only admins are allowed to perform this operation");
  }

  const targetUser = await context.entities.User.findUnique({
    where: { id },
    select: { id: true, role: true, isAdmin: true },
  });

  if (!targetUser) {
    throw new HttpError(404, "User not found");
  }

  if (targetUser.role === UserRole.OWNER && role !== UserRole.OWNER) {
    const ownerCount = await context.entities.User.count({
      where: { role: UserRole.OWNER },
    });
    if (ownerCount <= 1) {
      throw new HttpError(400, "At least one OWNER account must remain.");
    }
  }

  if (role === UserRole.OWNER && context.user.role !== UserRole.OWNER) {
    throw new HttpError(403, "Only OWNER users can assign OWNER role.");
  }

  return context.entities.User.update({
    where: { id },
    data: {
      role,
      isAdmin: adminRoles.has(role),
    },
  });
};

type GetPaginatedUsersOutput = {
  users: Pick<
    User,
    | "id"
    | "email"
    | "username"
    | "subscriptionStatus"
    | "paymentProcessorUserId"
    | "isAdmin"
    | "role"
  >[];
  totalPages: number;
};

const getPaginatorArgsSchema = z.object({
  skipPages: z.number(),
  filter: z.object({
    emailContains: z.string().nonempty().optional(),
    isAdmin: z.boolean().optional(),
    roleIn: z.array(z.nativeEnum(UserRole)).optional(),
    subscriptionStatusIn: z
      .array(z.nativeEnum(SubscriptionStatus).nullable())
      .optional(),
  }),
});

type GetPaginatedUsersInput = z.infer<typeof getPaginatorArgsSchema>;

export const getPaginatedUsers: GetPaginatedUsers<
  GetPaginatedUsersInput,
  GetPaginatedUsersOutput
> = async (rawArgs, context) => {
  if (!context.user) {
    throw new HttpError(
      401,
      "Only authenticated users are allowed to perform this operation",
    );
  }

  if (!isAdminUser(context.user)) {
    throw new HttpError(403, "Only admins are allowed to perform this operation");
  }

  const {
    skipPages,
    filter: {
      subscriptionStatusIn: subscriptionStatus,
      emailContains,
      isAdmin,
      roleIn,
    },
  } = ensureArgsSchemaOrThrowHttpError(getPaginatorArgsSchema, rawArgs);

  const includeUnsubscribedUsers = !!subscriptionStatus?.some(
    (status) => status === null,
  );
  const desiredSubscriptionStatuses = subscriptionStatus?.filter(
    (status) => status !== null,
  );

  const pageSize = 10;

  const userPageQuery: Prisma.UserFindManyArgs = {
    skip: skipPages * pageSize,
    take: pageSize,
    where: {
      AND: [
        {
          email: {
            contains: emailContains,
            mode: "insensitive",
          },
          isAdmin,
          role: roleIn ? { in: roleIn } : undefined,
        },
        {
          OR: [
            {
              subscriptionStatus: {
                in: desiredSubscriptionStatuses,
              },
            },
            {
              subscriptionStatus: includeUnsubscribedUsers ? null : undefined,
            },
          ],
        },
      ],
    },
    select: {
      id: true,
      email: true,
      username: true,
      isAdmin: true,
      role: true,
      subscriptionStatus: true,
      paymentProcessorUserId: true,
    },
    orderBy: {
      username: "asc",
    },
  };

  const [pageOfUsers, totalUsers] = await prisma.$transaction([
    context.entities.User.findMany(userPageQuery),
    context.entities.User.count({ where: userPageQuery.where }),
  ]);
  const totalPages = Math.ceil(totalUsers / pageSize);

  return {
    users: pageOfUsers,
    totalPages,
  };
};
