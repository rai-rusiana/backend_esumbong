import prisma from "../lib/prisma.js";
import { transporter } from "../lib/email.js";
import { formatTime, formatDateTime, parseTimeSafe } from "../lib/formatTime.js"
const baseUrl = process.env.FRONTEND_URL;
if (!baseUrl) {
  throw new Error("FRONTEND_URL is not defined");
}


export const summonResident = async (data, concernId, userId) => {

  const startTime = data.startTime ? new Date(data.startTime) : null;
  const endTime = data.endTime ? new Date(data.endTime) : null;
  const summonDate = data.date ? new Date(data.date) : new Date();


  /* ==========================
     FETCH RESIDENT
  ========================== */
  const resident = await prisma.user.findUnique({
    where: {
      id: data.residentId,
    },
  });

  if (!resident) {
    throw new Error("Resident not found");
  }

  const url = `${baseUrl}/concern/${concernId}`;
  const message = `${resident.fullname} has been summoned regarding a concern.`;
  /* ==========================
     RESIDENT NOTIFICATION + EMAIL
  ========================== */

  await Promise.all([
    prisma.notification.create({
      data: {
        url,
        message,
        type: "summons",
        itemId: concernId,
        userId: resident.id,
      },
    }),
    transporter.sendMail({
      from: `eSumbong <${process.env.EMAIL_USER}>`,
      to: resident.email,
      subject: "Barangay Summon Notice",
      html: `
      <p>Hello <strong>${resident.fullname}</strong>,</p>

      <p>
        You are hereby summoned by the barangay regarding a concern filed in our system.
      </p>

      <p>
        <strong>Date:</strong> ${formatDateTime(summonDate)}<br/>
        <strong>Time:</strong> ${formatTime(startTime)}
        ${endTime ? ` - ${formatTime(endTime)}` : ""}
      </p>

      ${data.files?.length
          ? `<p><strong>Attachments:</strong></p>
             <ul>
               ${data.files
            .map(
              (file) =>
                `<li><a href="${file.url}" target="_blank">${file.type}</a></li>`
            )
            .join("")}
             </ul>`
          : ""
        }

      <p>
        Please ensure your attendance at the barangay office.
      </p>

      <a href="${url}">View Concern</a>
    `,
    }),
  ]);
  /* ==========================
     FETCH OFFICIALS
  ========================== */
  const officials = await prisma.user.findMany({
    where: {
      type: "barangay_official",
    },
    select: {
      id: true,
      email: true,
      fullname: true,
    },
  });

  /* ==========================
     OFFICIALS NOTIFICATION + EMAIL
  ========================== */
  await Promise.all(
    officials.map((official) =>
      Promise.all([
        prisma.notification.create({
          data: {
            url,
            itemId: concernId,
            message,
            type: "concern",
            userId: official.id,
          },
        }),
        transporter.sendMail({
          from: `eSumbong <${process.env.EMAIL_USER}>`,
          to: official.email,
          subject: data.title,
          html: `
            <p>Hello ${official.fullname},</p>
            <p>${data.details}</p>
            ${data.files?.length
              ? `<p>Attachments:</p>
                   <ul>
                     ${data.files
                .map(
                  (file) =>
                    `<li><a href="${file.url}" target="_blank">${file.type}</a></li>`
                )
                .join("")}
                   </ul>`
              : ""
            }
            <a href="${url}">View Concern</a>
          `,
        }),
      ])
    )
  );

  /* ==========================
     CREATE SUMMON RECORD
  ========================== */
  await prisma.concernUpdate.create({
    data: {
      updateMessage: `The resident ${resident.fullname} has been summoned by the barangay official.`,
      status: "inProgress",
      concernId
    }
  })
  await prisma.summons.create({
    data: {
      official: {
        connect: { id: userId }
      },
      resident: { connect: { id: resident.id } },
      remarks: "inProgress",
      startTime: startTime,
      endTime: endTime,
      summonDate,
      concern: { connect: { id: concernId } }, // ✅ fixed typo
      media: {
        create:
          data.files?.map((file) => ({
            url: file.url,
            type: file.type,
          })) || [],
      },
    },
  });
};
