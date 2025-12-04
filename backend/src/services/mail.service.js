const sgMail = require("@sendgrid/mail");

class MailService {
  constructor() {
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }

  async sendEmail(to, subject, html) {
    // Skip email in development if no API key
    if (!process.env.SENDGRID_API_KEY) {
      console.log("Email notification (not sent - no API key):");
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${html}`);
      return;
    }

    try {
      const msg = {
        to,
        from: process.env.EMAIL_FROM,
        subject,
        html,
      };

      await sgMail.send(msg);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error("Error sending email:", error);
      // Don't throw error to prevent blocking the main operation
    }
  }

  async sendTicketCreatedEmail(ticket, user) {
    const subject = `Ticket Created: ${ticket.subject}`;
    const html = `
      <h2>New Support Ticket Created</h2>
      <p>Hello ${user.name},</p>
      <p>Your support ticket has been created successfully.</p>
      <h3>Ticket Details:</h3>
      <ul>
        <li><strong>Ticket ID:</strong> ${ticket._id}</li>
        <li><strong>Subject:</strong> ${ticket.subject}</li>
        <li><strong>Priority:</strong> ${ticket.priority}</li>
        <li><strong>Status:</strong> ${ticket.status}</li>
      </ul>
      <p>We will get back to you as soon as possible.</p>
      <p>Best regards,<br>Support Team</p>
    `;

    await this.sendEmail(user.email, subject, html);
  }

  async sendTicketAssignedEmail(ticket, agent, owner) {
    // Email to agent
    const agentSubject = `New Ticket Assigned: ${ticket.subject}`;
    const agentHtml = `
      <h2>New Ticket Assigned to You</h2>
      <p>Hello ${agent.name},</p>
      <p>A new support ticket has been assigned to you.</p>
      <h3>Ticket Details:</h3>
      <ul>
        <li><strong>Ticket ID:</strong> ${ticket._id}</li>
        <li><strong>Subject:</strong> ${ticket.subject}</li>
        <li><strong>Priority:</strong> ${ticket.priority}</li>
        <li><strong>Customer:</strong> ${owner.name} (${owner.email})</li>
      </ul>
      <p>Please review and respond to this ticket.</p>
      <p>Best regards,<br>Support Team</p>
    `;

    await this.sendEmail(agent.email, agentSubject, agentHtml);

    // Email to ticket owner
    const ownerSubject = `Ticket Assigned: ${ticket.subject}`;
    const ownerHtml = `
      <h2>Your Ticket Has Been Assigned</h2>
      <p>Hello ${owner.name},</p>
      <p>Your support ticket has been assigned to ${agent.name}.</p>
      <h3>Ticket Details:</h3>
      <ul>
        <li><strong>Ticket ID:</strong> ${ticket._id}</li>
        <li><strong>Subject:</strong> ${ticket.subject}</li>
        <li><strong>Assigned Agent:</strong> ${agent.name}</li>
      </ul>
      <p>You will receive updates as the agent works on your ticket.</p>
      <p>Best regards,<br>Support Team</p>
    `;

    await this.sendEmail(owner.email, ownerSubject, ownerHtml);
  }

  async sendTicketStatusChangedEmail(ticket, user) {
    const subject = `Ticket Status Updated: ${ticket.subject}`;
    const html = `
      <h2>Ticket Status Update</h2>
      <p>Hello ${user.name},</p>
      <p>Your support ticket status has been updated.</p>
      <h3>Ticket Details:</h3>
      <ul>
        <li><strong>Ticket ID:</strong> ${ticket._id}</li>
        <li><strong>Subject:</strong> ${ticket.subject}</li>
        <li><strong>New Status:</strong> <strong>${ticket.status}</strong></li>
      </ul>
      ${
        ticket.status === "resolved"
          ? "<p>Please review the resolution and rate your experience.</p>"
          : ""
      }
      <p>Best regards,<br>Support Team</p>
    `;

    await this.sendEmail(user.email, subject, html);
  }

  async sendTicketCommentEmail(ticket, comment, recipient) {
    const subject = `New Comment on Ticket: ${ticket.subject}`;
    const html = `
      <h2>New Comment Added</h2>
      <p>Hello ${recipient.name},</p>
      <p>A new comment has been added to your ticket.</p>
      <h3>Ticket Details:</h3>
      <ul>
        <li><strong>Ticket ID:</strong> ${ticket._id}</li>
        <li><strong>Subject:</strong> ${ticket.subject}</li>
        <li><strong>Commented by:</strong> ${comment.author.name}</li>
      </ul>
      <h3>Comment:</h3>
      <p>${comment.text}</p>
      <p>Best regards,<br>Support Team</p>
    `;

    await this.sendEmail(recipient.email, subject, html);
  }

  async sendTicketResolvedEmail(ticket, user) {
    const subject = `Ticket Resolved: ${ticket.subject}`;
    const html = `
      <h2>Your Ticket Has Been Resolved</h2>
      <p>Hello ${user.name},</p>
      <p>Great news! Your support ticket has been resolved.</p>
      <h3>Ticket Details:</h3>
      <ul>
        <li><strong>Ticket ID:</strong> ${ticket._id}</li>
        <li><strong>Subject:</strong> ${ticket.subject}</li>
      </ul>
      <p>We hope your issue has been resolved to your satisfaction.</p>
      <p>Please take a moment to rate your experience with our support team.</p>
      <p>Best regards,<br>Support Team</p>
    `;

    await this.sendEmail(user.email, subject, html);
  }
}

module.exports = new MailService();
