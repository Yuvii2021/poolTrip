import { prisma } from "../lib/prisma.js";
import { hasMailConfig, mailer } from "../lib/mailer.js";
import { env } from "../config/env.js";

export async function subscribe(emailRaw: string) {
  const email = emailRaw.trim().toLowerCase();
  const existing = await prisma.subscriber.findUnique({ where: { email } });
  if (existing) {
    return { message: "You're already subscribed! We'll keep you posted." };
  }

  await prisma.subscriber.create({ data: { email } });
  if (hasMailConfig()) {
    await mailer
      .sendMail({
        from: env.mailFrom,
        to: email,
        subject: "Welcome to PoolMyTrips!",
        text: "Thanks for subscribing to PoolMyTrips. You'll now receive the best travel deals and trip updates.",
      })
      .catch(() => undefined);
  }

  return { message: "Thanks for subscribing! We'll send you the best deals." };
}
