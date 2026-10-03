"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";


type NewsletterFormProps = {
  theme?:
    "light" |
    "dark";
};


export function NewsletterForm({
  theme =
    "light",
}: NewsletterFormProps) {
  const [
    email,
    setEmail,
  ] = useState(
    ""
  );

  const [
    website,
    setWebsite,
  ] = useState(
    ""
  );

  const [
    status,
    setStatus,
  ] = useState<
    "idle" |
    "loading" |
    "success" |
    "error"
  >(
    "idle"
  );

  const [
    message,
    setMessage,
  ] = useState(
    ""
  );


  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      status ===
      "loading"
    ) {
      return;
    }

    setStatus(
      "loading"
    );

    setMessage(
      ""
    );

    try {
      const response =
        await fetch(
          "/api/newsletter",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                email,
                website,
              }),
          }
        );


      const result =
        (await response.json()) as {
          ok?:
            boolean;

          message?:
            string;
        };


      if (
        !response.ok ||
        !result.ok
      ) {
        throw new Error(
          result.message ??
          "We could not subscribe you right now."
        );
      }


      setStatus(
        "success"
      );

      setMessage(
        result.message ??
        "You're on the list."
      );

      setEmail(
        ""
      );
    } catch (
      error
    ) {
      setStatus(
        "error"
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "We could not subscribe you right now."
      );
    }
  }


  const dark =
    theme ===
    "dark";


  if (
    status ===
    "success"
  ) {
    return (
      <div
        role="status"
        className={
          dark
            ? "rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-left"
            : "rounded-2xl border border-[var(--line)] bg-[#f4f1ea] px-5 py-4"
        }
      >

        <div className="flex items-start gap-3">

          <CheckCircle2
            aria-hidden="true"
            size={
              19
            }
            className={
              dark
                ? "mt-0.5 shrink-0 text-[#d8c8ba]"
                : "mt-0.5 shrink-0 text-[var(--accent)]"
            }
          />


          <div>

            <p
              className={
                dark
                  ? "text-sm font-semibold text-white"
                  : "text-sm font-semibold text-[var(--ink)]"
              }
            >
              Subscription confirmed.
            </p>


            <p
              className={
                dark
                  ? "mt-1 text-sm leading-6 text-white/65"
                  : "mt-1 text-sm leading-6 text-[var(--muted)]"
              }
            >
              {message}
            </p>

          </div>

        </div>

      </div>
    );
  }


  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="w-full"
    >

      <div
        aria-hidden="true"
        className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
      >
        <label htmlFor="newsletter-website">
          Website
        </label>

        <input
          id="newsletter-website"
          name="website"
          type="text"
          tabIndex={
            -1
          }
          autoComplete="off"
          value={
            website
          }
          onChange={(
            event
          ) =>
            setWebsite(
              event.target.value
            )
          }
        />
      </div>


      <div className="flex flex-col gap-2 sm:flex-row">

        <label
          htmlFor={`newsletter-email-${theme}`}
          className="sr-only"
        >
          Email address
        </label>


        <input
          id={`newsletter-email-${theme}`}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          maxLength={
            254
          }
          value={
            email
          }
          onChange={(
            event
          ) => {
            setEmail(
              event.target.value
            );

            if (
              status ===
              "error"
            ) {
              setStatus(
                "idle"
              );

              setMessage(
                ""
              );
            }
          }}
          placeholder="Your email address"
          className={
            dark
              ? "min-h-[50px] min-w-0 flex-1 rounded-full border border-white/15 bg-white px-5 py-3 text-base text-[var(--ink)] outline-none transition placeholder:text-[#7a7a74] focus:border-[#d8c8ba]"
              : "min-h-[50px] min-w-0 flex-1 rounded-full border border-[var(--line)] bg-white px-5 py-3 text-base text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--ink)]"
          }
        />


        <button
          type="submit"
          disabled={
            status ===
            "loading"
          }
          className={
            dark
              ? "inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full bg-[#d8c8ba] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              : "inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          }
        >

          {status ===
          "loading" && (
            <LoaderCircle
              aria-hidden="true"
              size={
                14
              }
              className="animate-spin"
            />
          )}


          <span
            className={
              dark
                ? "text-[var(--ink)]"
                : "text-white"
            }
          >
            {status ===
            "loading"
              ? "Joining..."
              : "Get the Edit"}
          </span>

        </button>

      </div>


      <p
        className={
          dark
            ? "mt-3 text-[11px] leading-5 text-white/45"
            : "mt-3 text-[11px] leading-5 text-[var(--muted)]"
        }
      >
        By subscribing, you agree to receive Venuvella editorial emails. You can unsubscribe at any time.
      </p>


      {status ===
        "error" && (
        <p
          role="alert"
          className={
            dark
              ? "mt-3 text-sm text-[#f0c6c6]"
              : "mt-3 text-sm text-red-700"
          }
        >
          {message}
        </p>
      )}

    </form>
  );
}
