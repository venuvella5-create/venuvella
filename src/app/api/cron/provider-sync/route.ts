import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/db/prisma";

import {
  runProviderSync,
} from "@/lib/affiliate/provider-sync/runProviderSync";


export const dynamic =
  "force-dynamic";


export const runtime =
  "nodejs";


const JOB_NAME =
  "provider-product-sync";


const RUNNING_TIMEOUT_MINUTES =
  30;


function unauthorized() {
  return NextResponse.json(
    {
      ok: false,
      error:
        "Unauthorized",
    },

    {
      status: 401,
    }
  );
}


function getBearerToken(
  request: NextRequest
) {
  const authorization =
    request.headers.get(
      "authorization"
    );


  if (!authorization) {
    return null;
  }


  const prefix =
    "Bearer ";


  if (
    !authorization.startsWith(
      prefix
    )
  ) {
    return null;
  }


  return authorization
    .slice(
      prefix.length
    )
    .trim();
}


async function getAutomationJob() {
  return prisma.automationJob.findUnique({
    where: {
      name:
        JOB_NAME,
    },
  });
}


async function hasRecentRunningJob() {
  const cutoff =
    new Date();


  cutoff.setMinutes(
    cutoff.getMinutes() -
      RUNNING_TIMEOUT_MINUTES
  );


  return prisma.automationLog.findFirst({
    where: {
      jobName:
        JOB_NAME,

      status:
        "RUNNING",

      startedAt: {
        gte:
          cutoff,
      },
    },

    orderBy: {
      startedAt:
        "desc",
    },

    select: {
      id: true,
      startedAt: true,
    },
  });
}


export async function GET(
  request: NextRequest
) {
  const cronSecret =
    process.env.CRON_SECRET;


  if (!cronSecret) {
    console.error(
      "CRON_SECRET is not configured."
    );


    return NextResponse.json(
      {
        ok: false,

        error:
          "Cron synchronization is not configured.",
      },

      {
        status: 503,
      }
    );
  }


  const suppliedToken =
    getBearerToken(
      request
    );


  if (
    !suppliedToken ||
    suppliedToken !==
      cronSecret
  ) {
    return unauthorized();
  }


  /*
   * Check whether administrator has
   * disabled automatic synchronization.
   */

  const automationJob =
    await getAutomationJob();


  if (
    automationJob &&
    !automationJob.enabled
  ) {
    return NextResponse.json(
      {
        ok: true,

        skipped: true,

        reason:
          "Automatic provider synchronization is disabled.",

        job:
          JOB_NAME,

        schedule:
          automationJob.schedule,
      },

      {
        status: 200,
      }
    );
  }


  /*
   * Prevent overlapping executions.
   */

  const runningJob =
    await hasRecentRunningJob();


  if (runningJob) {
    return NextResponse.json(
      {
        ok: false,

        skipped: true,

        reason:
          "Provider synchronization is already running.",

        runningLogId:
          runningJob.id,

        startedAt:
          runningJob.startedAt,
      },

      {
        status: 409,
      }
    );
  }


  try {
    const summary =
      await runProviderSync();


    const updatedJob =
      await getAutomationJob();


    return NextResponse.json(
      {
        ok: true,

        job:
          JOB_NAME,

        schedule:
          updatedJob?.schedule ??
          null,

        summary: {
          processed:
            summary.processed,

          succeeded:
            summary.succeeded,

          failed:
            summary.failed,

          stale:
            summary.stale,

          skipped:
            summary.skipped,
        },

        completedAt:
          new Date().toISOString(),
      },

      {
        status: 200,
      }
    );

  } catch (error) {

    const message =
      error instanceof Error
        ? error.message
        : "Unknown synchronization error";


    console.error(
      "Scheduled provider synchronization failed:",
      error
    );


    return NextResponse.json(
      {
        ok: false,

        job:
          JOB_NAME,

        error:
          message,
      },

      {
        status: 500,
      }
    );
  }
}