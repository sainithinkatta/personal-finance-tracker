import { createClient } from '@supabase/supabase-js';
import { format, addDays, parseISO } from 'date-fns';
import { Resend } from 'resend';


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecurringTransaction {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category: string;
  next_due_date: string;
  currency: string;
  reminder_days_before: number;
  user_timezone: string;
  last_reminder_sent_at: string | null;
}

// Configurable interval for sending reminders (in hours)
const MAIL_TRIGGER_INTERVAL_HOURS = 5;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Starting recurring transaction reminder check...');

    // Get today's date in UTC
    const today = new Date();
    const todayString = format(today, 'yyyy-MM-dd');
    
    console.log(`Checking for reminders due on or before: ${todayString}`);

    // Query recurring transactions that need reminders
    // We check for transactions where: next_due_date - reminder_days_before <= today
    const { data: transactions, error: queryError } = await supabaseAdmin
      .from('recurring_transactions')
      .select('*')
      .eq('email_reminder', true)
      .eq('status', 'pending')
      .lte('next_due_date', format(addDays(today, 7), 'yyyy-MM-dd')); // Check next 7 days

    if (queryError) {
      console.error('Error querying transactions:', queryError);
      throw queryError;
    }

    console.log(`Found ${transactions?.length || 0} transactions with reminders enabled`);

    if (!transactions || transactions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No reminders to send', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Filter transactions that should send reminders today
    const transactionsToRemind = transactions.filter((transaction: RecurringTransaction) => {
      const dueDate = parseISO(transaction.next_due_date);
      const reminderDate = addDays(dueDate, -transaction.reminder_days_before);
      const reminderDateString = format(reminderDate, 'yyyy-MM-dd');
      
      // Check if today matches or is past the reminder date
      const isReminderDue = reminderDateString <= todayString;
      
      // Check if enough time has passed since last reminder (5 hours)
      if (transaction.last_reminder_sent_at) {
        const lastSentAt = new Date(transaction.last_reminder_sent_at);
        const hoursSinceLastReminder = (today.getTime() - lastSentAt.getTime()) / (1000 * 60 * 60);
        
        // Only send if it's been more than MAIL_TRIGGER_INTERVAL_HOURS since last reminder
        return isReminderDue && hoursSinceLastReminder >= MAIL_TRIGGER_INTERVAL_HOURS;
      }
      
      // If never sent before, send if reminder is due
      return isReminderDue;
    });

    console.log(`${transactionsToRemind.length} transactions need reminders today`);

    let emailsSent = 0;
    let emailsFailed = 0;

    // Send reminder emails for each transaction
    // Add delay between sends to respect rate limits (max 2 per second)
    for (let i = 0; i < transactionsToRemind.length; i++) {
      const transaction = transactionsToRemind[i];
      
      // Add 500ms delay between emails (except for first one)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      try {
        // Get user email from auth.users
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
          transaction.user_id
        );

        if (userError || !userData?.user?.email) {
          console.error(`Error getting user email for user ${transaction.user_id}:`, userError);
          emailsFailed++;
          continue;
        }

        const userEmail = userData.user.email;
        const dueDate = format(parseISO(transaction.next_due_date), 'MMM dd, yyyy');

        // Initialize Resend
        const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

        // Send email using Resend - Enhanced Modern Design
const emailHtml = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #1f2937;
          background: #f3f4f6;
          padding: 40px 20px;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .email-wrapper {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 25px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }
        
        .header {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
          padding: 48px 32px;
          text-align: center;
          position: relative;
        }
        
        .header::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 40px;
          background: #ffffff;
          border-radius: 50% 50% 0 0 / 100% 100% 0 0;
        }
        
        .header-icon-wrapper {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          width: 80px;
          height: 80px;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
        
        .header-icon {
          font-size: 40px;
        }
        
        .header h1 {
          color: #ffffff;
          font-size: 32px;
          font-weight: 700;
          margin: 0;
          letter-spacing: -0.5px;
          position: relative;
          z-index: 1;
        }
        
        .header-subtitle {
          color: rgba(255, 255, 255, 0.9);
          font-size: 15px;
          margin-top: 8px;
          position: relative;
          z-index: 1;
        }
        
        .content {
          padding: 20px 32px 40px;
          background: #ffffff !important;
        }
        
        .greeting {
          font-size: 24px;
          font-weight: 700;
          color: #111827 !important;
          margin-bottom: 12px;
        }
        
        .intro-text {
          font-size: 15px;
          color: #6b7280 !important;
          margin-bottom: 32px;
          line-height: 1.7;
        }
        
        .transaction-card {
          background: #ffffff !important;
          border: 2px solid #f3f4f6;
          border-radius: 16px;
          padding: 28px;
          margin: 28px 0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }
        
        .amount-section {
          text-align: center;
          padding: 24px;
          background: #f9fafb !important;
          border-radius: 12px;
          margin-bottom: 24px;
          border: 1px solid #e5e7eb;
        }
        
        .amount-label {
          font-size: 13px;
          font-weight: 600;
          color: #6b7280 !important;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        
        .amount-value {
          font-size: 42px;
          font-weight: 800;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
          letter-spacing: -1px;
        }
        
        .details-grid {
          display: grid;
          gap: 16px;
        }
        
        .detail-row {
          display: flex;
          align-items: center;
          padding: 16px;
          background: #f8f9fa !important;
          border-radius: 10px;
          transition: all 0.2s ease;
        }
        
        .detail-row:hover {
          background: #f3f4f6 !important;
        }
        
        .detail-icon-wrapper {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 10px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-right: 14px;
        }
        
        .detail-icon {
          font-size: 20px;
        }
        
        .detail-content {
          flex: 1;
        }
        
        .detail-label {
          font-size: 12px;
          font-weight: 600;
          color: #9ca3af !important;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        
        .detail-value {
          font-size: 16px;
          font-weight: 600;
          color: #111827 !important;
          line-height: 1.4;
        }
        
        .reminder-note {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
          border-left: 4px solid #f59e0b;
          padding: 18px 20px;
          border-radius: 12px;
          margin: 28px 0;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.15);
        }
        
        .reminder-icon {
          font-size: 24px;
          flex-shrink: 0;
        }
        
        .reminder-note p {
          font-size: 14px;
          color: #92400e !important;
          margin: 0;
          font-weight: 600;
          line-height: 1.5;
        }
        
        .cta-section {
          text-align: center;
          margin: 32px 0;
        }
        
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
          color: #ffffff;
          text-decoration: none;
          padding: 16px 40px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 16px;
          box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);
          transition: all 0.3s ease;
          letter-spacing: 0.3px;
        }
        
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
        }
        
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
          margin: 32px 0;
        }
        
        .footer {
          background: #fafbfc;
          padding: 32px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        
        .footer-text {
          font-size: 13px;
          color: #9ca3af;
          margin: 10px 0;
          line-height: 1.6;
        }
        
        .footer-link {
          color: #6366f1;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
        }
        
        .footer-link:hover {
          color: #8b5cf6;
        }
        
        .footer-logo {
          font-size: 24px;
          margin-bottom: 12px;
        }
        
        @media (max-width: 600px) {
          body { padding: 20px 10px; }
          .email-wrapper { border-radius: 16px; }
          .header { padding: 36px 24px; }
          .header h1 { font-size: 26px; }
          .content { padding: 16px 24px 32px; }
          .transaction-card { padding: 20px; }
          .amount-value { font-size: 36px; }
          .cta-button { padding: 14px 32px; font-size: 15px; }
        }
        
        @media (prefers-color-scheme: dark) {
          body { background: #111827; }
          .email-wrapper { box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3), 0 10px 25px rgba(0, 0, 0, 0.5); }
          .footer { background: #111827; border-top-color: #e5e7eb; }
          .footer-text { color: #9ca3af; }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header">
          <div class="header-icon-wrapper">
            <span class="header-icon">💰</span>
          </div>
          <h1>Transaction Reminder</h1>
          <p class="header-subtitle">Upcoming Payment Notification</p>
        </div>
        
        <div class="content">
          <p class="greeting">Hi there! 👋</p>
          <p class="intro-text">
            You have an upcoming recurring transaction that requires your attention. 
            Please review the details below and ensure sufficient funds are available.
          </p>
          
          <div class="transaction-card">
            <div class="amount-section">
              <div class="amount-label">Payment Amount</div>
              <div class="amount-value">\${transaction.currency} \${transaction.amount}</div>
            </div>
            
            <div class="details-grid">
              <div class="detail-row">
                <div class="detail-icon-wrapper">
                  <span class="detail-icon">💳</span>
                </div>
                <div class="detail-content">
                  <div class="detail-label">Transaction Name</div>
                  <div class="detail-value">\${transaction.name}</div>
                </div>
              </div>
              
              <div class="detail-row">
                <div class="detail-icon-wrapper">
                  <span class="detail-icon">📁</span>
                </div>
                <div class="detail-content">
                  <div class="detail-label">Category</div>
                  <div class="detail-value">\${transaction.category}</div>
                </div>
              </div>
              
              <div class="detail-row">
                <div class="detail-icon-wrapper">
                  <span class="detail-icon">📅</span>
                </div>
                <div class="detail-content">
                  <div class="detail-label">Due Date</div>
                  <div class="detail-value">\${dueDate}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="reminder-note">
            <span class="reminder-icon">⚠️</span>
            <p>Ensure you have sufficient funds in your account to avoid any payment issues.</p>
          </div>
          
          <div class="cta-section">
            <a href="https://personal-finance-tracker-eosin-eight.vercel.app/" class="cta-button">
              View in Dashboard →
            </a>
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-logo">💰</div>
          <p class="footer-text">
            This is an automated reminder from your Personal Expense Tracker.
          </p>
          <p class="footer-text">
            <a href="https://personal-finance-tracker-eosin-eight.vercel.app/" class="footer-link">Manage your recurring transactions</a>
          </p>
          <p class="footer-text" style="margin-top: 20px; font-size: 12px;">
            You receive reminders every \${MAIL_TRIGGER_INTERVAL_HOURS} hours to help you stay on top of your finances.
          </p>
        </div>
      </div>
    </body>
  </html>
`;

        try {
          const { error: emailError } = await resend.emails.send({
            from: 'Reminders <onboarding@resend.dev>',
            to: [userEmail],
            subject: `Reminder: ${transaction.name} due on ${dueDate}`,
            html: emailHtml,
          });

          if (emailError) {
            console.error(`Failed to send email for transaction ${transaction.name}:`, emailError);
            emailsFailed++;
          } else {
            console.log(`Reminder sent successfully for transaction: ${transaction.name} to ${userEmail}`);
            
            // Update last_reminder_sent_at timestamp
            await supabaseAdmin
              .from('recurring_transactions')
              .update({ last_reminder_sent_at: new Date().toISOString() })
              .eq('id', transaction.id);
            
            emailsSent++;
          }
        } catch (emailError: any) {
          console.error(`Error sending email for transaction ${transaction.name}:`, emailError);
          emailsFailed++;
        }

      } catch (error) {
        console.error(`Error processing transaction ${transaction.name}:`, error);
        emailsFailed++;
      }
    }

    const result = {
      message: 'Reminder check completed',
      totalChecked: transactions.length,
      remindersDue: transactionsToRemind.length,
      emailsSent,
      emailsFailed,
    };

    console.log('Summary:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error in send-recurring-reminders function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});