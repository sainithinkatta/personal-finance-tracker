import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { format, addDays, parseISO } from 'https://esm.sh/date-fns@3.6.0';
import { Resend } from 'https://esm.sh/resend@2.0.0';

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

interface EmailResult {
  transactionId: string;
  transactionName: string;
  userEmail: string;
  status: 'sent' | 'failed' | 'skipped';
  reason?: string;
  attempts: number;
  timestamp: string;
}

// Configuration
const CONFIG = {
  MAIL_TRIGGER_INTERVAL_HOURS: 5,
  BATCH_SIZE: 10, // Process 10 emails at a time
  RATE_LIMIT_DELAY_MS: 600, // 600ms between emails (safer than 500ms for 2/sec limit)
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAYS: [1000, 3000, 7000], // Exponential backoff in ms
};

// Utility: Structured logging
const log = {
  info: (message: string, data?: any) => {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      ...data
    }));
  },
  error: (message: string, error?: any, data?: any) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      error: error?.message || error,
      stack: error?.stack,
      ...data
    }));
  },
  warn: (message: string, data?: any) => {
    console.warn(JSON.stringify({
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      ...data
    }));
  }
};

// Utility: Delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Utility: Send email with retry logic
async function sendEmailWithRetry(
  resend: Resend,
  transaction: RecurringTransaction,
  userEmail: string,
  dueDate: string,
  attemptNumber = 1
): Promise<{ success: boolean; error?: any }> {
  try {
    const emailHtml = generateEmailHtml(transaction, dueDate);
    
    const { error: emailError } = await resend.emails.send({
      from: 'Reminders <onboarding@resend.dev>',
      to: [userEmail],
      subject: `Reminder: ${transaction.name} due on ${dueDate}`,
      html: emailHtml,
    });

    if (emailError) {
      // Check if it's a rate limit error
      const isRateLimit = emailError.message?.toLowerCase().includes('rate limit') || 
                         emailError.message?.toLowerCase().includes('too many requests');
      
      if (isRateLimit && attemptNumber < CONFIG.MAX_RETRY_ATTEMPTS) {
        const retryDelay = CONFIG.RETRY_DELAYS[attemptNumber - 1];
        log.warn('Rate limit hit, retrying...', {
          transactionId: transaction.id,
          transactionName: transaction.name,
          attempt: attemptNumber,
          retryAfter: retryDelay
        });
        
        await delay(retryDelay);
        return sendEmailWithRetry(resend, transaction, userEmail, dueDate, attemptNumber + 1);
      }
      
      return { success: false, error: emailError };
    }

    return { success: true };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (attemptNumber < CONFIG.MAX_RETRY_ATTEMPTS) {
      const retryDelay = CONFIG.RETRY_DELAYS[attemptNumber - 1];
      log.warn('Email send failed, retrying...', {
        transactionId: transaction.id,
        attempt: attemptNumber,
        retryAfter: retryDelay,
        error: err.message
      });
      
      await delay(retryDelay);
      return sendEmailWithRetry(resend, transaction, userEmail, dueDate, attemptNumber + 1);
    }
    
    return { success: false, error: err };
  }
}

// Process a batch of transactions
async function processBatch(
  supabaseAdmin: any,
  resend: Resend,
  transactions: RecurringTransaction[],
  batchNumber: number
): Promise<EmailResult[]> {
  log.info('Processing batch', {
    batchNumber,
    batchSize: transactions.length
  });

  const results: EmailResult[] = [];

  for (let i = 0; i < transactions.length; i++) {
    const transaction = transactions[i];
    const startTime = Date.now();
    
    // Add delay between emails (except first email in batch)
    if (i > 0) {
      await delay(CONFIG.RATE_LIMIT_DELAY_MS);
    }

    try {
      // Get user email from auth.users
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
        transaction.user_id
      );

      if (userError || !userData?.user?.email) {
        log.error('Failed to get user email', userError, {
          transactionId: transaction.id,
          userId: transaction.user_id
        });
        
        results.push({
          transactionId: transaction.id,
          transactionName: transaction.name,
          userEmail: 'unknown',
          status: 'failed',
          reason: 'User email not found',
          attempts: 0,
          timestamp: new Date().toISOString()
        });
        continue;
      }

      const userEmail = userData.user.email;
      const dueDate = format(parseISO(transaction.next_due_date), 'MMM dd, yyyy');

      // Send email with retry logic
      const { success, error } = await sendEmailWithRetry(resend, transaction, userEmail, dueDate);

      if (success) {
        // Update last_reminder_sent_at timestamp
        await supabaseAdmin
          .from('recurring_transactions')
          .update({ last_reminder_sent_at: new Date().toISOString() })
          .eq('id', transaction.id);

        const duration = Date.now() - startTime;
        log.info('Email sent successfully', {
          transactionId: transaction.id,
          transactionName: transaction.name,
          userEmail,
          durationMs: duration
        });

        results.push({
          transactionId: transaction.id,
          transactionName: transaction.name,
          userEmail,
          status: 'sent',
          attempts: 1,
          timestamp: new Date().toISOString()
        });
      } else {
        log.error('Email send failed after retries', error, {
          transactionId: transaction.id,
          transactionName: transaction.name,
          userEmail
        });

        results.push({
          transactionId: transaction.id,
          transactionName: transaction.name,
          userEmail,
          status: 'failed',
          reason: error?.message || 'Unknown error',
          attempts: CONFIG.MAX_RETRY_ATTEMPTS,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      log.error('Unexpected error processing transaction', err, {
        transactionId: transaction.id,
        transactionName: transaction.name
      });

      results.push({
        transactionId: transaction.id,
        transactionName: transaction.name,
        userEmail: 'unknown',
        status: 'failed',
        reason: err.message || 'Unexpected error',
        attempts: 0,
        timestamp: new Date().toISOString()
      });
    }
  }

  return results;
}

// Generate email HTML
function generateEmailHtml(transaction: RecurringTransaction, dueDate: string): string {
  return `
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
          align-items: flex-start;
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
              <div class="amount-value">${transaction.currency} ${transaction.amount}</div>
            </div>
            
            <div class="details-grid">
              <div class="detail-row">
                <div class="detail-icon-wrapper">
                  <span class="detail-icon">💳</span>
                </div>
                <div class="detail-content">
                  <div class="detail-label">Transaction Name</div>
                  <div class="detail-value">${transaction.name}</div>
                </div>
              </div>
              
              <div class="detail-row">
                <div class="detail-icon-wrapper">
                  <span class="detail-icon">📁</span>
                </div>
                <div class="detail-content">
                  <div class="detail-label">Category</div>
                  <div class="detail-value">${transaction.category}</div>
                </div>
              </div>
              
              <div class="detail-row">
                <div class="detail-icon-wrapper">
                  <span class="detail-icon">📅</span>
                </div>
                <div class="detail-content">
                  <div class="detail-label">Due Date</div>
                  <div class="detail-value">${dueDate}</div>
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
            You receive reminders every ${CONFIG.MAIL_TRIGGER_INTERVAL_HOURS} hours to help you stay on top of your finances.
          </p>
        </div>
      </div>
    </body>
  </html>
`;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const executionStart = Date.now();
  log.info('Starting recurring transaction reminder check');

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

    // Initialize Resend (single instance for all emails)
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Get today's date in UTC
    const today = new Date();
    const todayString = format(today, 'yyyy-MM-dd');
    
    log.info('Querying transactions', { date: todayString });

    /**
     * Query recurring transactions that need reminders.
     * 
     * IMPORTANT: Only send reminders for ACTIVE plans.
     * Plans with plan_status = 'cancelled' or 'paused' should NOT receive emails.
     */
    const { data: transactions, error: queryError } = await supabaseAdmin
      .from('recurring_transactions')
      .select('*')
      .eq('email_reminder', true)
      .eq('status', 'pending')
      .eq('plan_status', 'active') // Only active plans receive reminders
      .lte('next_due_date', format(addDays(today, 7), 'yyyy-MM-dd')); // Check next 7 days

    if (queryError) {
      log.error('Error querying transactions', queryError);
      throw queryError;
    }

    log.info('Query completed', { 
      transactionsFound: transactions?.length || 0 
    });

    if (!transactions || transactions.length === 0) {
      const result = { 
        message: 'No reminders to send', 
        count: 0,
        executionTimeMs: Date.now() - executionStart 
      };
      log.info('Execution completed', result);
      return new Response(
        JSON.stringify(result),
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
      
      // Check if enough time has passed since last reminder
      if (transaction.last_reminder_sent_at) {
        const lastSentAt = new Date(transaction.last_reminder_sent_at);
        const hoursSinceLastReminder = (today.getTime() - lastSentAt.getTime()) / (1000 * 60 * 60);
        
        return isReminderDue && hoursSinceLastReminder >= CONFIG.MAIL_TRIGGER_INTERVAL_HOURS;
      }
      
      return isReminderDue;
    });

    log.info('Filtering completed', {
      totalTransactions: transactions.length,
      remindersDue: transactionsToRemind.length
    });

    if (transactionsToRemind.length === 0) {
      const result = {
        message: 'No reminders due at this time',
        totalChecked: transactions.length,
        remindersDue: 0,
        executionTimeMs: Date.now() - executionStart
      };
      log.info('Execution completed', result);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Process transactions in batches
    const allResults: EmailResult[] = [];
    const totalBatches = Math.ceil(transactionsToRemind.length / CONFIG.BATCH_SIZE);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * CONFIG.BATCH_SIZE;
      const end = Math.min(start + CONFIG.BATCH_SIZE, transactionsToRemind.length);
      const batch = transactionsToRemind.slice(start, end);

      log.info('Starting batch processing', {
        batchNumber: batchIndex + 1,
        totalBatches,
        batchSize: batch.length
      });

      const batchResults = await processBatch(supabaseAdmin, resend, batch, batchIndex + 1);
      allResults.push(...batchResults);

      // Add delay between batches to further reduce rate limit risk
      if (batchIndex < totalBatches - 1) {
        log.info('Pausing between batches', { delayMs: 2000 });
        await delay(2000);
      }
    }

    // Aggregate results
    const emailsSent = allResults.filter(r => r.status === 'sent').length;
    const emailsFailed = allResults.filter(r => r.status === 'failed').length;

    const result = {
      message: 'Reminder check completed',
      totalChecked: transactions.length,
      remindersDue: transactionsToRemind.length,
      emailsSent,
      emailsFailed,
      batchesProcessed: totalBatches,
      results: allResults,
      executionTimeMs: Date.now() - executionStart
    };

    log.info('Execution completed successfully', {
      totalChecked: result.totalChecked,
      remindersDue: result.remindersDue,
      emailsSent: result.emailsSent,
      emailsFailed: result.emailsFailed,
      executionTimeMs: result.executionTimeMs
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    log.error('Fatal error in send-recurring-reminders function', error, {
      executionTimeMs: Date.now() - executionStart
    });
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        executionTimeMs: Date.now() - executionStart
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
