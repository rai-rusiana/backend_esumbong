import nodemailer from "nodemailer"
const email = process.env.EMAIL_USER
const password = process.env.EMAIL_PASS
if (!email || !password) throw new Error("Email and Password not set, please add email and app password")

export const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: email,
    pass: password
  }
})

import { Resend } from "resend";
let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}
export async function sendConcernEmail(
  to,
  fullname,
  title,
  action,
  details,
  url,
  files,
) {
  const safeAction = action || "Updated";
  const safeTitle = title || "No Title";
  const safeDetails = details || "No details provided.";
  const safeUrl = url || "#";

  const attachmentsHtml = files?.length
    ? `<p><strong>Attachments:</strong></p>
       <ul>
         ${files
      .map(
        (file) =>
          `<li><img src="${file.url}" alt="${file.type}" width="120" style="margin-bottom:8px;"/></li>`
      )
      .join("")}
       </ul>`
    : `<p><em>No attachments provided.</em></p>`;

  await resend.emails.send({
    from: "eSumbong <onboarding@resend.dev>",
    to,
    subject: `Concern ${safeAction}: ${safeTitle}`, // ✅ plain string
    html: `
      <p>Hello ${fullname || "User"},</p>
      <p>Your concern "<strong>${safeTitle}</strong>" has been <strong>${safeAction}</strong>.</p>
      <p><strong>Details:</strong></p>
      <p>${safeDetails}</p>
      ${attachmentsHtml}
      <p><a href="${safeUrl}" target="_blank">View Concern</a></p>
      <hr/>
      <p style="font-size:12px;color:#666;">
        This is an automated message from eSumbong.
      </p>
    `,
  });
}
