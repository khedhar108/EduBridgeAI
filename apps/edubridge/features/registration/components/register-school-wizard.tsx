"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { useActionToast } from "@repo/ui/hooks/use-action-toast";
import { PLATFORM_NAME } from "@/lib/brand";
import { LEGAL_DOCS_IN_FORCE, TERMS_VERSION } from "@/lib/legal/constants";
import { readConsentFromDocument } from "@/lib/legal/consent";
import { PRIVACY_PATH, TERMS_PATH } from "@/lib/legal/paths";
import { suggestSlugFromSchoolName } from "@/lib/tenancy/school-slug";
import {
  checkSlugAction,
  startSchoolRegisterAction,
  type RegisterSchoolState,
} from "../actions/register-school";
import { INDIA_STATES } from "../lib/india-states";

const initial: RegisterSchoolState = {};

const STEPS = ["School", "You", "Workspace"] as const;

function suggestUsername(email: string): string {
  const local = (email.split("@")[0] ?? "").toLowerCase();
  return local
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/^[^a-z0-9]+/, "")
    .replace(/[^a-z0-9]+$/, "")
    .slice(0, 32);
}

export function RegisterSchoolWizard() {
  const [state, formAction, pending] = useActionState(
    startSchoolRegisterAction,
    initial,
  );
  useActionToast(state);
  const [step, setStep] = useState(0);
  const [schoolName, setSchoolName] = useState("");
  const [stateName, setStateName] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugHint, setSlugHint] = useState<string | null>(null);
  const [ticked, setTicked] = useState(false);
  const [alreadyAccepted, setAlreadyAccepted] = useState(false);

  useEffect(() => {
    const stored = readConsentFromDocument();
    setAlreadyAccepted(stored?.termsVersion === TERMS_VERSION);
  }, []);

  useEffect(() => {
    if (!usernameTouched) setUsername(suggestUsername(email));
  }, [email, usernameTouched]);

  useEffect(() => {
    if (!slugTouched) setSlug(suggestSlugFromSchoolName(schoolName));
  }, [schoolName, slugTouched]);

  useEffect(() => {
    if (!slug || step !== 2) return;
    const timer = setTimeout(() => {
      void checkSlugAction(slug).then((result) => {
        setSlugHint(result.available ? null : (result.reason ?? "Unavailable"));
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [slug, step]);

  const canNextSchool =
    schoolName.trim().length >= 2 && stateName.length >= 2 && city.trim().length >= 2;
  const canNextYou =
    fullName.trim().length >= 2 &&
    email.includes("@") &&
    username.length >= 3 &&
    password.length >= 8 &&
    password === passwordConfirm;

  const termsLabel = LEGAL_DOCS_IN_FORCE
    ? `I have read and agree to the ${PLATFORM_NAME} Terms and Privacy Policy`
    : `I acknowledge the draft Terms and Privacy Policy (not yet in force)`;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="country" value="IN" />
      {step !== 0 ? (
        <>
          <input type="hidden" name="schoolName" value={schoolName} />
          <input type="hidden" name="state" value={stateName} />
          <input type="hidden" name="city" value={city} />
          <input type="hidden" name="pincode" value={pincode} />
        </>
      ) : null}
      {step !== 1 ? (
        <>
          <input type="hidden" name="fullName" value={fullName} />
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="username" value={username} />
          <input type="hidden" name="password" value={password} />
          <input type="hidden" name="passwordConfirm" value={passwordConfirm} />
        </>
      ) : null}

      <ol className="flex gap-2" aria-label="Registration steps">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={`flex-1 rounded-full py-1 text-center text-xs font-medium ${
              index === step
                ? "bg-primary/15 text-primary"
                : index < step
                  ? "bg-muted text-foreground"
                  : "bg-muted/50 text-muted-foreground"
            }`}
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <div className="flex flex-col gap-4">
          <Field label="School name" htmlFor="schoolName">
            <Input
              id="schoolName"
              name="schoolName"
              required
              minLength={2}
              className="h-11"
              disabled={pending}
              value={schoolName}
              onChange={(event) => setSchoolName(event.target.value)}
            />
          </Field>
          <Field label="State" htmlFor="state">
            <select
              id="state"
              name="state"
              required
              disabled={pending}
              value={stateName}
              onChange={(event) => setStateName(event.target.value)}
              className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select state</option>
              {INDIA_STATES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>
          <Field label="City" htmlFor="city">
            <Input
              id="city"
              name="city"
              required
              minLength={2}
              className="h-11"
              disabled={pending}
              value={city}
              onChange={(event) => setCity(event.target.value)}
            />
          </Field>
          <Field label="PIN code (optional)" htmlFor="pincode">
            <Input
              id="pincode"
              name="pincode"
              inputMode="numeric"
              maxLength={6}
              className="h-11"
              disabled={pending}
              value={pincode}
              onChange={(event) =>
                setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />
          </Field>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="flex flex-col gap-4">
          <Field label="Your name" htmlFor="fullName">
            <Input
              id="fullName"
              name="fullName"
              required
              minLength={2}
              className="h-11"
              disabled={pending}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </Field>
          <Field label="Official school email" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              required
              className="h-11"
              disabled={pending}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Not Gmail or Yahoo — this domain becomes the school&apos;s official
              inbox.
            </p>
          </Field>
          <Field label="Username" htmlFor="username">
            <Input
              id="username"
              name="username"
              required
              minLength={3}
              maxLength={32}
              className="h-11"
              disabled={pending}
              value={username}
              onChange={(event) => {
                setUsernameTouched(true);
                setUsername(event.target.value.toLowerCase());
              }}
            />
          </Field>
          <Field label="Password" htmlFor="password">
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="h-11"
              disabled={pending}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          <Field label="Confirm password" htmlFor="passwordConfirm">
            <Input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="h-11"
              disabled={pending}
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
            />
          </Field>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col gap-4">
          <Field label="Workspace URL" htmlFor="slug">
            <Input
              id="slug"
              name="slug"
              required
              className="h-11"
              disabled={pending}
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value.toLowerCase());
              }}
            />
            <p className="text-xs text-muted-foreground">
              Local path: /{slug || "your-school-bridge"}
            </p>
            {slugHint ? (
              <p className="text-xs text-destructive">{slugHint}</p>
            ) : null}
          </Field>

          {alreadyAccepted ? (
            <>
              <input type="hidden" name="acceptTerms" value="on" />
              <input type="hidden" name="termsVersion" value={TERMS_VERSION} />
              <p className="text-xs text-muted-foreground">
                You already acknowledged {PLATFORM_NAME} Terms version{" "}
                {TERMS_VERSION}.
              </p>
            </>
          ) : (
            <div className="flex flex-col gap-1">
              <input type="hidden" name="termsVersion" value={TERMS_VERSION} />
              <label className="flex items-start gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  value="on"
                  required
                  checked={ticked}
                  disabled={pending}
                  onChange={(event) => setTicked(event.target.checked)}
                  className="mt-0.5 size-4 rounded border-input accent-primary"
                />
                <span>
                  {termsLabel}{" "}
                  <Link
                    href={TERMS_PATH}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    Terms
                  </Link>
                  {" · "}
                  <Link
                    href={PRIVACY_PATH}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    Privacy
                  </Link>
                </span>
              </label>
            </div>
          )}
        </div>
      ) : null}

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <div className="flex gap-2">
        {step > 0 ? (
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1"
            disabled={pending}
            onClick={() => setStep((current) => current - 1)}
          >
            Back
          </Button>
        ) : null}
        {step < 2 ? (
          <Button
            type="button"
            className="h-11 flex-1"
            disabled={
              pending || (step === 0 ? !canNextSchool : !canNextYou)
            }
            onClick={() => setStep((current) => current + 1)}
          >
            Continue
          </Button>
        ) : (
          <Button type="submit" className="h-11 flex-1" disabled={pending}>
            {pending ? <Spinner className="size-4" /> : null}
            Create school
          </Button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}
