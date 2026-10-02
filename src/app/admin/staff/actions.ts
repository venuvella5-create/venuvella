"use server";

import {
  Prisma,
  UserRole,
} from "@prisma/client";

import {
  revalidatePath,
} from "next/cache";

import {
  requireRole,
} from "@/lib/auth/require-admin";

import {
  hashPassword,
} from "@/lib/auth/password";

import {
  prisma,
} from "@/lib/db/prisma";


export type StaffActionState = {
  ok: boolean;
  message: string;
};


const allowedRoles =
  new Set<UserRole>([
    UserRole.ADMIN,
    UserRole.EDITOR,
    UserRole.AUTHOR,
    UserRole.ANALYST,
  ]);


function normalizeEmail(
  value:
    FormDataEntryValue | null
) {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value
    .trim()
    .toLowerCase();
}


function normalizeOptionalString(
  value:
    FormDataEntryValue | null
) {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const trimmed =
    value.trim();

  return trimmed.length > 0
    ? trimmed
    : null;
}


function parseRole(
  value:
    FormDataEntryValue | null
): UserRole | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  if (
    !allowedRoles.has(
      value as UserRole
    )
  ) {
    return null;
  }

  return value as UserRole;
}


function validatePassword(
  password: string
) {
  if (
    password.length < 12
  ) {
    return "Password must contain at least 12 characters.";
  }

  return null;
}


function isUniqueConstraintError(
  error: unknown
) {
  return (
    error instanceof
      Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}


function getMasterAdminEmail() {
  return (
    process.env.ADMIN_EMAIL
      ?.trim()
      .toLowerCase() ??
    null
  );
}


export async function createStaffAction(
  _previousState:
    StaffActionState,
  formData: FormData
): Promise<StaffActionState> {
  await requireRole([
    "ADMIN",
  ]);


  const name =
    normalizeOptionalString(
      formData.get(
        "name"
      )
    );


  const email =
    normalizeEmail(
      formData.get(
        "email"
      )
    );


  const password =
    String(
      formData.get(
        "password"
      ) ?? ""
    );


  const role =
    parseRole(
      formData.get(
        "role"
      )
    );


  const authorId =
    normalizeOptionalString(
      formData.get(
        "authorId"
      )
    );


  if (!email) {
    return {
      ok: false,
      message:
        "Email is required.",
    };
  }


  if (
    !email.includes("@")
  ) {
    return {
      ok: false,
      message:
        "Enter a valid email address.",
    };
  }


  if (!role) {
    return {
      ok: false,
      message:
        "Select a valid staff role.",
    };
  }


  const passwordError =
    validatePassword(
      password
    );


  if (passwordError) {
    return {
      ok: false,
      message:
        passwordError,
    };
  }


  if (
    role ===
      UserRole.AUTHOR &&
    !authorId
  ) {
    return {
      ok: false,
      message:
        "AUTHOR accounts must be linked to an author profile.",
    };
  }


  if (
    role !==
      UserRole.AUTHOR &&
    authorId
  ) {
    return {
      ok: false,
      message:
        "Only AUTHOR accounts can be linked to an author profile.",
    };
  }


  if (authorId) {
    const author =
      await prisma.author.findUnique({
        where: {
          id:
            authorId,
        },

        select: {
          id: true,
          userId: true,
        },
      });


    if (!author) {
      return {
        ok: false,
        message:
          "The selected author profile does not exist.",
      };
    }


    if (author.userId) {
      return {
        ok: false,
        message:
          "The selected author profile is already linked to another staff account.",
      };
    }
  }


  const passwordHash =
    await hashPassword(
      password
    );


  try {
    await prisma.$transaction(
      async (
        transaction
      ) => {
        const user =
          await transaction.user.create({
            data: {
              name,
              email,
              passwordHash,
              role,
              isActive:
                true,
            },

            select: {
              id: true,
            },
          });


        if (authorId) {
          await transaction.author.update({
            where: {
              id:
                authorId,
            },

            data: {
              userId:
                user.id,
            },
          });
        }
      }
    );
  } catch (error) {
    if (
      isUniqueConstraintError(
        error
      )
    ) {
      return {
        ok: false,
        message:
          "A staff account already exists with that email address.",
      };
    }


    console.error(
      "Failed to create staff account.",
      error
    );


    return {
      ok: false,
      message:
        "Unable to create the staff account.",
    };
  }


  revalidatePath(
    "/admin/staff"
  );


  return {
    ok: true,
    message:
      "Staff account created successfully.",
  };
}


export async function updateStaffAction(
  _previousState:
    StaffActionState,
  formData: FormData
): Promise<StaffActionState> {
  const session =
    await requireRole([
      "ADMIN",
    ]);


  const userId =
    normalizeOptionalString(
      formData.get(
        "userId"
      )
    );


  if (!userId) {
    return {
      ok: false,
      message:
        "Staff account ID is missing.",
    };
  }


  const existingUser =
    await prisma.user.findUnique({
      where: {
        id:
          userId,
      },

      select: {
        id: true,
        email: true,
        role: true,

        author: {
          select: {
            id: true,
          },
        },
      },
    });


  if (!existingUser) {
    return {
      ok: false,
      message:
        "Staff account not found.",
    };
  }


  const name =
    normalizeOptionalString(
      formData.get(
        "name"
      )
    );


  const email =
    normalizeEmail(
      formData.get(
        "email"
      )
    );


  const role =
    parseRole(
      formData.get(
        "role"
      )
    );


  const authorId =
    normalizeOptionalString(
      formData.get(
        "authorId"
      )
    );


  const newPassword =
    String(
      formData.get(
        "password"
      ) ?? ""
    );


  if (!email) {
    return {
      ok: false,
      message:
        "Email is required.",
    };
  }


  if (
    !email.includes("@")
  ) {
    return {
      ok: false,
      message:
        "Enter a valid email address.",
    };
  }


  if (!role) {
    return {
      ok: false,
      message:
        "Select a valid staff role.",
    };
  }


  const masterAdminEmail =
    getMasterAdminEmail();


  const isMasterAdmin =
    masterAdminEmail !==
      null &&
    existingUser.email
      .trim()
      .toLowerCase() ===
      masterAdminEmail;


  if (
    isMasterAdmin &&
    role !== UserRole.ADMIN
  ) {
    return {
      ok: false,
      message:
        "The master administrator role cannot be changed.",
    };
  }


  if (
    session.userId ===
      existingUser.id &&
    role !== UserRole.ADMIN
  ) {
    return {
      ok: false,
      message:
        "You cannot remove your own administrator role.",
    };
  }


  if (
    role ===
      UserRole.AUTHOR &&
    !authorId
  ) {
    return {
      ok: false,
      message:
        "AUTHOR accounts must be linked to an author profile.",
    };
  }


  if (
    role !==
      UserRole.AUTHOR &&
    authorId
  ) {
    return {
      ok: false,
      message:
        "Only AUTHOR accounts can be linked to an author profile.",
    };
  }


  if (newPassword) {
    const passwordError =
      validatePassword(
        newPassword
      );


    if (passwordError) {
      return {
        ok: false,
        message:
          passwordError,
      };
    }
  }


  if (authorId) {
    const author =
      await prisma.author.findUnique({
        where: {
          id:
            authorId,
        },

        select: {
          id: true,
          userId: true,
        },
      });


    if (!author) {
      return {
        ok: false,
        message:
          "The selected author profile does not exist.",
      };
    }


    if (
      author.userId &&
      author.userId !==
        existingUser.id
    ) {
      return {
        ok: false,
        message:
          "The selected author profile is already linked to another staff account.",
      };
    }
  }


  const passwordHash =
    newPassword
      ? await hashPassword(
          newPassword
        )
      : undefined;


  try {
    await prisma.$transaction(
      async (
        transaction
      ) => {
        if (
          existingUser.author &&
          (
            role !==
              UserRole.AUTHOR ||
            existingUser.author.id !==
              authorId
          )
        ) {
          await transaction.author.update({
            where: {
              id:
                existingUser.author.id,
            },

            data: {
              userId:
                null,
            },
          });
        }


        await transaction.user.update({
          where: {
            id:
              existingUser.id,
          },

          data: {
            name,
            email,
            role,

            ...(passwordHash
              ? {
                  passwordHash,
                }
              : {}),
          },
        });


        if (
          role ===
            UserRole.AUTHOR &&
          authorId
        ) {
          await transaction.author.update({
            where: {
              id:
                authorId,
            },

            data: {
              userId:
                existingUser.id,
            },
          });
        }
      }
    );
  } catch (error) {
    if (
      isUniqueConstraintError(
        error
      )
    ) {
      return {
        ok: false,
        message:
          "Another staff account already uses that email address.",
      };
    }


    console.error(
      "Failed to update staff account.",
      error
    );


    return {
      ok: false,
      message:
        "Unable to update the staff account.",
    };
  }


  revalidatePath(
    "/admin/staff"
  );

  revalidatePath(
    `/admin/staff/${existingUser.id}`
  );


  return {
    ok: true,
    message:
      "Staff account updated successfully.",
  };
}


export async function setStaffActiveAction(
  _previousState:
    StaffActionState,
  formData: FormData
): Promise<StaffActionState> {
  const session =
    await requireRole([
      "ADMIN",
    ]);


  const userId =
    normalizeOptionalString(
      formData.get(
        "userId"
      )
    );


  if (!userId) {
    return {
      ok: false,
      message:
        "Staff account ID is missing.",
    };
  }


  const activeValue =
    String(
      formData.get(
        "isActive"
      ) ?? ""
    );


  const isActive =
    activeValue ===
    "true";


  const user =
    await prisma.user.findUnique({
      where: {
        id:
          userId,
      },

      select: {
        id: true,
        email: true,
        isActive: true,
      },
    });


  if (!user) {
    return {
      ok: false,
      message:
        "Staff account not found.",
    };
  }


  if (
    !isActive &&
    user.id ===
      session.userId
  ) {
    return {
      ok: false,
      message:
        "You cannot deactivate your own account.",
    };
  }


  const masterAdminEmail =
    getMasterAdminEmail();


  const isMasterAdmin =
    masterAdminEmail !==
      null &&
    user.email
      .trim()
      .toLowerCase() ===
      masterAdminEmail;


  if (
    !isActive &&
    isMasterAdmin
  ) {
    return {
      ok: false,
      message:
        "The master administrator account cannot be deactivated.",
    };
  }


  await prisma.user.update({
    where: {
      id:
        user.id,
    },

    data: {
      isActive,
    },
  });


  revalidatePath(
    "/admin/staff"
  );

  revalidatePath(
    `/admin/staff/${user.id}`
  );


  return {
    ok: true,

    message:
      isActive
        ? "Staff account activated successfully."
        : "Staff account deactivated successfully.",
  };
}