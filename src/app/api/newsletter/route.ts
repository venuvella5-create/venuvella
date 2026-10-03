import {
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/lib/db/prisma";


export const runtime =
  "nodejs";


const emailPattern =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


export async function POST(
  request:
    Request
) {
  try {
    const body =
      (await request.json()) as {
        email?:
          unknown;

        website?:
          unknown;
      };


    const website =
      typeof body.website ===
      "string"
        ? body.website.trim()
        : "";


    if (
      website
    ) {
      return NextResponse.json({
        ok:
          true,

        message:
          "You're on the list.",
      });
    }


    const email =
      typeof body.email ===
      "string"
        ? body.email
            .trim()
            .toLowerCase()
        : "";


    if (
      !email ||
      email.length >
        254 ||
      !emailPattern.test(
        email
      )
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "Enter a valid email address.",
        },
        {
          status:
            400,
        }
      );
    }


    const existing =
      await prisma.newsletterSubscriber.findUnique({
        where: {
          email,
        },

        select: {
          id:
            true,

          confirmedAt:
            true,
        },
      });


    if (
      existing
    ) {
      if (
        !existing.confirmedAt
      ) {
        await prisma.newsletterSubscriber.update({
          where: {
            id:
              existing.id,
          },

          data: {
            confirmedAt:
              new Date(),
          },
        });
      }


      return NextResponse.json({
        ok:
          true,

        message:
          "That email is already subscribed — you're all set.",
      });
    }


    await prisma.newsletterSubscriber.create({
      data: {
        email,

        confirmedAt:
          new Date(),
      },
    });


    return NextResponse.json(
      {
        ok:
          true,

        message:
          "Thanks for joining the Venuvella Edit.",
      },
      {
        status:
          201,
      }
    );
  } catch (
    error
  ) {
    const errorCode =
      typeof error ===
        "object" &&
      error !==
        null &&
      "code" in
        error
        ? String(
            (
              error as {
                code?:
                  unknown;
              }
            ).code
          )
        : "";


    if (
      errorCode ===
      "P2002"
    ) {
      return NextResponse.json({
        ok:
          true,

        message:
          "That email is already subscribed — you're all set.",
      });
    }


    console.error(
      "Newsletter subscription failed:",
      error
    );


    return NextResponse.json(
      {
        ok:
          false,

        message:
          "We could not subscribe you right now. Please try again.",
      },
      {
        status:
          500,
      }
    );
  }
}
