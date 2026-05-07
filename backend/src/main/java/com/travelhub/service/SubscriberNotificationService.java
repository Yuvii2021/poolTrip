package com.travelhub.service;

import com.travelhub.entity.Subscriber;
import com.travelhub.entity.TravelPackage;
import com.travelhub.entity.User;
import com.travelhub.repository.SubscriberRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriberNotificationService {

    private final SubscriberRepository subscriberRepository;
    private final JavaMailSender mailSender;
    private final Environment environment;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final NumberFormat CURRENCY_FMT = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));

    /**
     * Send a beautiful HTML email to all subscribers about a new package.
     * Runs asynchronously so it doesn't block the API response.
     */
    @Async
    public void notifyNewPackage(TravelPackage pkg, User postedBy) {
        String mailHost = environment.getProperty("spring.mail.host");
        if (mailHost == null || mailHost.isBlank()) {
            log.warn("MAIL not configured. Skipping subscriber notification for package {}", pkg.getId());
            return;
        }

        List<Subscriber> subscribers = subscriberRepository.findAll();
        if (subscribers.isEmpty()) {
            log.info("No subscribers to notify for package {}", pkg.getId());
            return;
        }

        String html = buildEmailHtml(pkg, postedBy);
        String subject = "New Trip Alert: " + pkg.getTitle() + " — " + pkg.getDestinationName();
        String fromAddress = environment.getProperty("spring.mail.username");

        for (Subscriber subscriber : subscribers) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                if (fromAddress != null && !fromAddress.isBlank()) {
                    helper.setFrom(fromAddress);
                }
                helper.setTo(subscriber.getEmail());
                helper.setSubject(subject);
                helper.setText(html, true); // true = HTML
                mailSender.send(message);
            } catch (Exception e) {
                log.warn("Failed to send notification to {}: {}", subscriber.getEmail(), e.getMessage());
            }
        }
        log.info("Sent new-package notification to {} subscribers for package {}", subscribers.size(), pkg.getId());
    }

    private String buildEmailHtml(TravelPackage pkg, User postedBy) {
        String coverImage = "";
        if (pkg.getMediaUrls() != null && !pkg.getMediaUrls().isEmpty()) {
            // Pick first image-like URL for the hero
            coverImage = pkg.getMediaUrls().stream()
                    .filter(url -> url != null && !url.contains("/video/"))
                    .findFirst()
                    .orElse(pkg.getMediaUrls().get(0));
        }

        String price = CURRENCY_FMT.format(pkg.getPrice());
        String discountedPrice = pkg.getDiscountedPrice() != null && pkg.getDiscountedPrice() < pkg.getPrice()
                ? CURRENCY_FMT.format(pkg.getDiscountedPrice())
                : null;

        String startDate = pkg.getStartDate() != null ? pkg.getStartDate().format(DATE_FMT) : "Flexible";
        String duration = pkg.getDurationDays() + "D / " + pkg.getDurationNights() + "N";
        String seats = pkg.getAvailableSeats() + " of " + pkg.getTotalSeats() + " seats available";
        String transport = pkg.getTransportation() != null ? capitalize(pkg.getTransportation().name()) : "—";
        String packageType = pkg.getPackageType() != null
                ? pkg.getPackageType().getIcon() + " " + pkg.getPackageType().getLabel()
                : "";
        String postedByName = postedBy != null ? postedBy.getFullName() : "A fellow traveler";

        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><head><meta charset='UTF-8'></head>");
        sb.append("<body style='margin:0;padding:0;background:#f4f1ec;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;'>");

        // Wrapper
        sb.append("<div style='max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;margin-top:24px;margin-bottom:24px;box-shadow:0 4px 24px rgba(0,0,0,0.08);'>");

        // Hero image
        if (!coverImage.isEmpty()) {
            sb.append("<div style='width:100%;height:280px;overflow:hidden;'>");
            sb.append("<img src='").append(coverImage).append("' alt='").append(escHtml(pkg.getTitle()))
              .append("' style='width:100%;height:100%;object-fit:cover;display:block;' />");
            sb.append("</div>");
        }

        // Content
        sb.append("<div style='padding:28px 32px 20px;'>");

        // Badge + Title
        sb.append("<div style='margin-bottom:6px;'>");
        sb.append("<span style='display:inline-block;padding:4px 12px;border-radius:999px;background:#fef3ec;color:#c45c26;font-size:12px;font-weight:700;'>NEW TRIP</span>");
        if (!packageType.isEmpty()) {
            sb.append(" <span style='display:inline-block;padding:4px 12px;border-radius:999px;background:#f0f5f2;color:#2d5a45;font-size:12px;font-weight:700;'>").append(escHtml(packageType)).append("</span>");
        }
        sb.append("</div>");

        sb.append("<h1 style='margin:10px 0 4px;font-size:24px;font-weight:800;color:#1a1a2e;line-height:1.25;'>").append(escHtml(pkg.getTitle())).append("</h1>");

        // Route
        sb.append("<p style='margin:0 0 16px;font-size:14px;color:#6b7280;font-weight:600;'>");
        sb.append(escHtml(pkg.getOriginName())).append("  ➜  ").append(escHtml(pkg.getDestinationName()));
        sb.append("</p>");

        // Description
        if (pkg.getDescription() != null && !pkg.getDescription().isBlank()) {
            String desc = pkg.getDescription().length() > 200
                    ? pkg.getDescription().substring(0, 200) + "..."
                    : pkg.getDescription();
            sb.append("<p style='margin:0 0 20px;font-size:14px;color:#4b5563;line-height:1.6;'>").append(escHtml(desc)).append("</p>");
        }

        // Info grid (2 columns)
        sb.append("<table style='width:100%;border-collapse:collapse;margin-bottom:20px;' cellpadding='0' cellspacing='0'><tr>");

        // Price
        sb.append("<td style='width:50%;padding:16px;background:#fef9f5;border-radius:12px;vertical-align:top;'>");
        sb.append("<div style='font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;'>Price</div>");
        if (discountedPrice != null) {
            sb.append("<div style='font-size:22px;font-weight:800;color:#c45c26;'>").append(discountedPrice).append("</div>");
            sb.append("<div style='font-size:13px;color:#9ca3af;text-decoration:line-through;'>").append(price).append("</div>");
        } else {
            sb.append("<div style='font-size:22px;font-weight:800;color:#c45c26;'>").append(price).append("</div>");
        }
        sb.append("<div style='font-size:12px;color:#6b7280;'>per person</div>");
        sb.append("</td>");

        sb.append("<td style='width:8px;'></td>"); // spacer

        // Duration
        sb.append("<td style='width:50%;padding:16px;background:#f0f5f2;border-radius:12px;vertical-align:top;'>");
        sb.append("<div style='font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;'>Duration</div>");
        sb.append("<div style='font-size:22px;font-weight:800;color:#2d5a45;'>").append(duration).append("</div>");
        sb.append("<div style='font-size:12px;color:#6b7280;'>Starting ").append(startDate).append("</div>");
        sb.append("</td>");

        sb.append("</tr></table>");

        // Details row
        sb.append("<table style='width:100%;border-collapse:collapse;margin-bottom:20px;' cellpadding='0' cellspacing='0'><tr>");

        sb.append("<td style='padding:12px 16px;background:#f9fafb;border-radius:10px;text-align:center;'>");
        sb.append("<div style='font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:2px;'>Seats</div>");
        sb.append("<div style='font-size:14px;font-weight:700;color:#1a1a2e;'>").append(seats).append("</div>");
        sb.append("</td>");

        sb.append("<td style='width:8px;'></td>");

        sb.append("<td style='padding:12px 16px;background:#f9fafb;border-radius:10px;text-align:center;'>");
        sb.append("<div style='font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:2px;'>Transport</div>");
        sb.append("<div style='font-size:14px;font-weight:700;color:#1a1a2e;'>").append(transport).append("</div>");
        sb.append("</td>");

        sb.append("</tr></table>");

        // Inclusions
        if (pkg.getInclusions() != null && !pkg.getInclusions().isBlank()) {
            sb.append("<div style='margin-bottom:16px;'>");
            sb.append("<div style='font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;'>What's Included</div>");
            sb.append("<div style='font-size:13px;color:#4b5563;line-height:1.6;background:#f9fafb;padding:12px 16px;border-radius:10px;'>")
              .append(escHtml(pkg.getInclusions()).replace("\n", "<br/>"))
              .append("</div>");
            sb.append("</div>");
        }

        // Itinerary highlights (first 3)
        if (pkg.getItinerary() != null && !pkg.getItinerary().isEmpty()) {
            sb.append("<div style='margin-bottom:16px;'>");
            sb.append("<div style='font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;'>Itinerary Highlights</div>");
            sb.append("<div style='font-size:13px;color:#4b5563;line-height:1.6;background:#f9fafb;padding:12px 16px;border-radius:10px;'>");
            int limit = Math.min(pkg.getItinerary().size(), 4);
            for (int i = 0; i < limit; i++) {
                sb.append("<div style='margin-bottom:4px;'>").append("Day ").append(i + 1).append(": ").append(escHtml(pkg.getItinerary().get(i))).append("</div>");
            }
            if (pkg.getItinerary().size() > 4) {
                sb.append("<div style='color:#c45c26;font-weight:600;'>+ ").append(pkg.getItinerary().size() - 4).append(" more days...</div>");
            }
            sb.append("</div>");
            sb.append("</div>");
        }

        // Posted by
        sb.append("<div style='padding:12px 16px;background:#f9fafb;border-radius:10px;margin-bottom:20px;font-size:13px;color:#6b7280;'>");
        sb.append("Posted by <strong style='color:#1a1a2e;'>").append(escHtml(postedByName)).append("</strong>");
        sb.append("</div>");

        // CTA
        sb.append("<div style='text-align:center;margin-bottom:8px;'>");
        sb.append("<a href='http://localhost:5173/package/").append(pkg.getId())
          .append("' style='display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#c45c26,#e07a3a);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px;'>View Full Details</a>");
        sb.append("</div>");

        sb.append("</div>"); // end content

        // Footer
        sb.append("<div style='padding:16px 32px 20px;background:#f9fafb;text-align:center;border-top:1px solid #f0f0f0;'>");
        sb.append("<p style='margin:0;font-size:12px;color:#9ca3af;'>You're receiving this because you subscribed to PoolTrip updates.</p>");
        sb.append("<p style='margin:4px 0 0;font-size:12px;color:#9ca3af;'>PoolTrip — Panchkula, Haryana, India</p>");
        sb.append("</div>");

        sb.append("</div>"); // end wrapper
        sb.append("</body></html>");

        return sb.toString();
    }

    private static String escHtml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }

    private static String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return s.charAt(0) + s.substring(1).toLowerCase().replace("_", " ");
    }
}
