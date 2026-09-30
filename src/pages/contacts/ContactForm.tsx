import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type {
  Contact,
  ContactSocialMedia,
  CreateContactInput,
} from "@/typings/contact.typings";

interface ContactFormProps {
  initialValues?: Partial<Contact>;
  isSubmitting: boolean;
  onSubmit: (values: CreateContactInput) => void;
}

const PLATFORM_SUGGESTIONS = [
  "Facebook",
  "Instagram",
  "LinkedIn",
  "X (Twitter)",
  "YouTube",
  "Website",
];

const PHONE_PATTERN = /^\d{10}$/;
const EMAIL_PATTERN = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/;

function isValidHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:" && value.startsWith("https://");
  } catch {
    return false;
  }
}

// Only digits, max 10, so letters and spaces can't be typed
function digitsOnly(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

// Cleans numbers saved before this validation existed
// ("+918525023957" -> "8525023957", "08525023957dewxew" -> "8525023957")
function toLocalNumber(value?: string) {
  const digits = (value ?? "").replace(/\D/g, "");

  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);

  return digits.slice(0, 10);
}

export function ContactForm({
  initialValues,
  isSubmitting,
  onSubmit,
}: ContactFormProps) {
  const [contactNumber1, setContactNumber1] = useState(
    toLocalNumber(initialValues?.contactNumber1),
  );
  const [contactNumber2, setContactNumber2] = useState(
    toLocalNumber(initialValues?.contactNumber2),
  );
  const [whatsappNumber, setWhatsappNumber] = useState(
    toLocalNumber(initialValues?.whatsappNumber),
  );
  const [email, setEmail] = useState(initialValues?.email ?? "");
  const [mapUrl, setMapUrl] = useState(initialValues?.location?.mapUrl ?? "");
  const [socialMedia, setSocialMedia] = useState<ContactSocialMedia[]>(
    initialValues?.socialMedia?.map((item) => ({ ...item })) ?? [],
  );

  const [formError, setFormError] = useState<string | null>(null);

  const updateSocial = (
    index: number,
    field: keyof ContactSocialMedia,
    value: string,
  ) => {
    setSocialMedia((current) =>
      current.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const number1 = contactNumber1.trim();
    const number2 = contactNumber2.trim();
    const whatsapp = whatsappNumber.trim();
    const emailValue = email.trim().toLowerCase();
    const map = mapUrl.trim();

    if (!PHONE_PATTERN.test(number1)) {
      setFormError("Contact number 1 must be exactly 10 digits.");
      return;
    }

    if (number2 && !PHONE_PATTERN.test(number2)) {
      setFormError("Contact number 2 must be exactly 10 digits.");
      return;
    }

    if (!PHONE_PATTERN.test(whatsapp)) {
      setFormError("WhatsApp number must be exactly 10 digits.");
      return;
    }

    if (!EMAIL_PATTERN.test(emailValue)) {
      setFormError("Enter a valid email address, e.g. name@example.com.");
      return;
    }

    if (!isValidHttpsUrl(map)) {
      setFormError("Map URL must be a valid link starting with https://");
      return;
    }

    // Drop rows the admin left completely empty
    const rows = socialMedia
      .map((item) => ({ platform: item.platform.trim(), url: item.url.trim() }))
      .filter((item) => item.platform || item.url);

    for (const row of rows) {
      if (!row.platform || !row.url) {
        setFormError("Each social media link needs both a platform and a URL.");
        return;
      }

      if (!isValidHttpsUrl(row.url)) {
        setFormError(`"${row.platform}" link must start with https://`);
        return;
      }
    }

    onSubmit({
      contactNumber1: number1,
      // When editing, "" tells the API to clear a number that was set before
      contactNumber2:
        number2 || (initialValues?.contactNumber2 ? "" : undefined),
      whatsappNumber: whatsapp,
      email: emailValue,
      socialMedia: rows,
      location: { mapUrl: map },
    });
  };

  return (
    <form id="contact-form" onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{formError}</p>
        </div>
      )}

      {/* CONTACT INFORMATION */}
      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Contact Information</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Phone numbers and email shown on your website.
          </p>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="contact-number-1">Contact Number 1</Label>
            <Input
              id="contact-number-1"
              type="tel"
              inputMode="numeric"
              value={contactNumber1}
              onChange={(event) =>
                setContactNumber1(digitsOnly(event.target.value))
              }
              placeholder="10-digit number"
              maxLength={10}
              pattern="\d{10}"
              title="Enter exactly 10 digits"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              10 digits only. No spaces, letters or symbols.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contact-number-2">Contact Number 2</Label>
            <Input
              id="contact-number-2"
              type="tel"
              inputMode="numeric"
              value={contactNumber2}
              onChange={(event) =>
                setContactNumber2(digitsOnly(event.target.value))
              }
              placeholder="Optional, 10-digit number"
              maxLength={10}
              pattern="\d{10}"
              title="Enter exactly 10 digits"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Optional. 10 digits only.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contact-whatsapp">WhatsApp Number</Label>
            <Input
              id="contact-whatsapp"
              type="tel"
              inputMode="numeric"
              value={whatsappNumber}
              onChange={(event) =>
                setWhatsappNumber(digitsOnly(event.target.value))
              }
              placeholder="10-digit number"
              maxLength={10}
              pattern="\d{10}"
              title="Enter exactly 10 digits"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              10 digits only. +91 is added automatically for the WhatsApp link.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contact-email">Email</Label>
            <Input
              id="contact-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value.replace(/\s/g, ""))
              }
              placeholder="info@example.com"
              maxLength={254}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>
      </section>

      {/* SOCIAL MEDIA */}
      <section className="rounded-lg border">
        <div className="flex items-start justify-between gap-4 border-b p-6">
          <div>
            <h2 className="text-lg font-semibold">Social Media</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Links to your social media profiles. Links must start with
              https://
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            onClick={() =>
              setSocialMedia((current) => [
                ...current,
                { platform: "", url: "" },
              ])
            }
          >
            <Plus className="mr-2 size-4" />
            Add Link
          </Button>
        </div>

        <div className="space-y-4 p-6">
          {socialMedia.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No social media links yet. Click "Add Link" to add one.
            </p>
          )}

          <datalist id="social-platforms">
            {PLATFORM_SUGGESTIONS.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>

          {socialMedia.map((item, index) => (
            <div
              key={index}
              className="grid gap-3 md:grid-cols-[200px_1fr_auto] md:items-end"
            >
              <div className="grid gap-2">
                <Label htmlFor={`social-platform-${index}`}>Platform</Label>
                <Input
                  id={`social-platform-${index}`}
                  list="social-platforms"
                  value={item.platform}
                  onChange={(event) =>
                    updateSocial(index, "platform", event.target.value)
                  }
                  placeholder="Instagram"
                  maxLength={50}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`social-url-${index}`}>URL</Label>
                <Input
                  id={`social-url-${index}`}
                  type="url"
                  value={item.url}
                  onChange={(event) =>
                    updateSocial(index, "url", event.target.value.trim())
                  }
                  placeholder="https://instagram.com/yourpage"
                  pattern="https://.*"
                  title="Link must start with https://"
                  disabled={isSubmitting}
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={`Remove ${item.platform || "social media"} link`}
                disabled={isSubmitting}
                onClick={() =>
                  setSocialMedia((current) =>
                    current.filter((_, i) => i !== index),
                  )
                }
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* LOCATION */}
      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Location</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            The map location shown on your website.
          </p>
        </div>

        <div className="grid gap-2 p-6">
          <Label htmlFor="contact-map-url">Map URL</Label>
          <Input
            id="contact-map-url"
            type="url"
            value={mapUrl}
            onChange={(event) => setMapUrl(event.target.value.trim())}
            placeholder="https://www.google.com/maps/embed?pb=..."
            pattern="https://.*"
            title="Link must start with https://"
            required
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground">
            To show a map on your website, use Google Maps → Share → Embed a
            map, and paste only the <code>src</code> URL from the iframe code.
          </p>
        </div>
      </section>
    </form>
  );
}
