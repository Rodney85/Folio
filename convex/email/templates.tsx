import * as React from 'react';
import { renderToStaticMarkup } from "react-dom/server";
import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Button,
    Img,
    Hr,
    Link,
    Preview,
    Heading
} from "@react-email/components";

interface EmailTemplateProps {
    firstName?: string;
    actionUrl?: string;
}

const mainStyle = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
    padding: '40px 20px',
    lineHeight: '1.6',
    maxWidth: '600px',
    margin: '0 auto',
};

const h1Style = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#000000',
    marginBottom: '24px',
    letterSpacing: '-0.5px',
};

const pStyle = {
    fontSize: '16px',
    marginBottom: '24px',
    color: '#333333',
};

const buttonStyle = {
    display: 'inline-block',
    padding: '14px 32px',
    backgroundColor: '#000000',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '16px',
    textAlign: 'center' as const,
};

const footerStyle = {
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: '1px solid #eaeaea',
    fontSize: '12px',
    color: '#666666',
    textAlign: 'center' as const,
};

// 1. Welcome Email
// Goal: Excitement + Instant Value + Clear Next Step
export const WelcomeEmail: React.FC<EmailTemplateProps> = ({
    firstName,
    actionUrl,
}) => (
    <div style={mainStyle}>
        <h1 style={h1Style}>{firstName || 'CarFolio Member'}, your garage is ready.</h1>
        <p style={pStyle}>
            Welcome to CarFolio. You're in good company.
        </p>
        <p style={pStyle}>
            We built this platform because tracking a build shouldn't require messy spreadsheets or scattered forum posts. It should be as premium as the parts you're installing.
        </p>
        <p style={pStyle}>
            Your next step is simple: Add your first car and start tracking your modifications.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={buttonStyle}>
                    Add Your First Car
                </a>
            </div>
        )}
        <div style={footerStyle}>
            <p>© {new Date().getFullYear()} CarFolio. All rights reserved.</p>
        </div>
    </div>
);

// 2. Subscription Success
// Goal: Reassurance + Feature Highlight + Usage Prompt
export const SubscriptionSuccessEmail: React.FC<EmailTemplateProps> = ({
    firstName,
    actionUrl,
}) => (
    <div style={mainStyle}>
        <h1 style={h1Style}>Welcome to Pro. Here's what's unlocked.</h1>
        <p style={pStyle}>
            Hi {firstName || 'there'},
        </p>
        <p style={pStyle}>
            You're officially a CarFolio Pro member. Thank you for upgrading.
        </p>
        <p style={pStyle}>
            You now have no limits. Here is what you can do right now:
        </p>
        <ul style={{ ...pStyle, paddingLeft: '20px' }}>
            <li style={{ marginBottom: '10px' }}><strong>Track every build:</strong> Your garage slot limits are gone. Add your entire collection.</li>
            <li style={{ marginBottom: '10px' }}><strong>See your true investment:</strong> Advanced analytics are now active on your dashboard.</li>
            <li style={{ marginBottom: '10px' }}><strong>Monetize your build:</strong> You can now add affiliate links to your parts list.</li>
        </ul>
        <p style={pStyle}>
            Let's put these to use.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={{ ...buttonStyle, backgroundColor: '#0070f3' }}>
                    Go to Dashboard
                </a>
            </div>
        )}
        <div style={footerStyle}>
            <p>© {new Date().getFullYear()} CarFolio. All rights reserved.</p>
        </div>
    </div>
);

// 3. Subscription Failed (Dunning)
// Goal: Empathy + Urgency + Easy Resolution
export const SubscriptionFailedEmail: React.FC<EmailTemplateProps> = ({
    firstName,
    actionUrl,
}) => (
    <div style={mainStyle}>
        <h1 style={{ ...h1Style, color: '#e00000' }}>Action Required: Your Pro renewal failed</h1>
        <p style={pStyle}>
            Hi {firstName || 'there'},
        </p>
        <p style={pStyle}>
            We tried to process your CarFolio Pro renewal today, but the card on file was declined. (This usually just means a card expired or a zip code changed).
        </p>
        <p style={pStyle}>
            Your build data is completely safe. However, to keep your Pro features active, please take 60 seconds to update your payment details.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={{ ...buttonStyle, backgroundColor: '#e00000' }}>
                    Update Payment Method
                </a>
            </div>
        )}
        <p style={pStyle}>
            If you need help, just reply to this email.
        </p>
        <div style={footerStyle}>
            <p>© {new Date().getFullYear()} CarFolio. All rights reserved.</p>
        </div>
    </div>
);

// 4. System Notification
// Goal: Clarity + Brevity
export const SystemNotificationEmail: React.FC<{ message: string }> = ({
    message,
}) => (
    <div style={mainStyle}>
        <h1 style={h1Style}>System Notification</h1>
        <p style={pStyle}>{message}</p>
        <div style={footerStyle}>
            <p>© {new Date().getFullYear()} CarFolio. All rights reserved.</p>
        </div>
    </div>
);

// 5. Subscription Cancelled
// Goal: Feedback + Retention (optional) + Graceful Goodbye
export const SubscriptionCancelledEmail: React.FC<EmailTemplateProps> = ({
    firstName,
    actionUrl,
}) => (
    <div style={mainStyle}>
        <h1 style={h1Style}>Your Pro subscription has been cancelled</h1>
        <p style={pStyle}>
            Hi {firstName || 'there'},
        </p>
        <p style={pStyle}>
            We've successfully cancelled your CarFolio Pro subscription.
        </p>
        <p style={pStyle}>
            You will keep your Pro features until the end of your current billing cycle. After that, your account will move to the free tier. Your data is safe, but advanced analytics and unlimited slots will be locked.
        </p>
        <p style={pStyle}>
            If you ever need Pro features again, the door is always open.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={buttonStyle}>
                    Resubscribe to Pro
                </a>
            </div>
        )}
        <div style={footerStyle}>
            <p>© {new Date().getFullYear()} CarFolio. All rights reserved.</p>
        </div>
    </div>
);

// 6. Refund Processed
// Goal: Confirmation + Trust
export const RefundProcessedEmail: React.FC<{ firstName?: string, message?: string }> = ({
    firstName,
    message,
}) => (
    <div style={mainStyle}>
        <h1 style={h1Style}>Your refund is on the way</h1>
        <p style={pStyle}>
            Hi {firstName || 'User'},
        </p>
        <p style={pStyle}>
            {message || "This is a quick note to confirm we've processed a full refund for your recent transaction."}
        </p>
        <p style={pStyle}>
            Depending on your bank, it usually takes 5-10 business days for the funds to appear on your statement.
        </p>
        <p style={pStyle}>
            If you have any questions, just reply directly to this email.
        </p>
        <div style={footerStyle}>
            <p>© {new Date().getFullYear()} CarFolio. All rights reserved.</p>
        </div>
    </div>
);

// 7. Issue Received ("The Listener")
export const IssueReceivedEmail: React.FC<{ firstName?: string, issueTitle: string }> = ({
    firstName,
    issueTitle,
}) => (
    <div style={mainStyle}>
        <h1 style={h1Style}>We got it: "{issueTitle}"</h1>
        <p style={pStyle}>
            Hi {firstName || 'there'},
        </p>
        <p style={pStyle}>
            Thanks for the heads up. We've received your report regarding <strong>"{issueTitle}"</strong>.
        </p>
        <p style={pStyle}>
            Our engineering team is looking into it now. We build CarFolio based on feedback from builders like you, so we genuinely appreciate you taking the time to report this.
        </p>
        <div style={footerStyle}>
            <p>© {new Date().getFullYear()} CarFolio. All rights reserved.</p>
        </div>
    </div>
);

// 8. Issue Resolved ("The Listener")
export const IssueResolvedEmail: React.FC<{ firstName?: string, issueTitle: string }> = ({
    firstName,
    issueTitle,
}) => (
    <div style={mainStyle}>
        <h1 style={h1Style}>Fixed: "{issueTitle}"</h1>
        <p style={pStyle}>
            Hi {firstName || 'there'},
        </p>
        <p style={pStyle}>
            Good news. The issue you reported (<strong>"{issueTitle}"</strong>) has been fully resolved and deployed to production.
        </p>
        <p style={pStyle}>
            You should be good to go. Thanks again for helping us make the platform better.
        </p>
        <div style={footerStyle}>
            <p>© {new Date().getFullYear()} CarFolio. All rights reserved.</p>
        </div>
    </div>
);

// 9. Garage Limit Reached ("The Upseller")
export const GarageLimitEmail: React.FC<EmailTemplateProps> = ({
    firstName,
    actionUrl,
}) => (
    <div style={mainStyle}>
        <h1 style={h1Style}>You've hit your garage limit</h1>
        <p style={pStyle}>
            Hi {firstName || 'Name'},
        </p>
        <p style={pStyle}>
            Your garage is officially full. You've hit the limit of the free plan.
        </p>
        <p style={pStyle}>
            To add more cars—and unlock advanced financial tracking for your entire collection—you'll need to upgrade to CarFolio Pro.
        </p>
        <p style={pStyle}>
            Pro members get unlimited garage slots, in-depth analytics, and the ability to monetize their builds.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={buttonStyle}>
                    Unlock Unlimited Cars
                </a>
            </div>
        )}
        <div style={footerStyle}>
            <p>© {new Date().getFullYear()} CarFolio. All rights reserved.</p>
        </div>
    </div>
);

// 10. Talent Scout ("The Talent Scout")
export const TalentScoutEmail: React.FC<{ firstName?: string, carModel: string, actionUrl?: string }> = ({
    firstName,
    carModel,
    actionUrl
}) => (
    <div style={mainStyle}>
        <h1 style={h1Style}>Your {carModel} is getting noticed</h1>
        <p style={pStyle}>
            Hi {firstName || 'Name'},
        </p>
        <p style={pStyle}>
            Your <strong>{carModel}</strong> is gaining serious traction. It is currently one of the most viewed builds in the CarFolio community.
        </p>
        <p style={pStyle}>
            Builds with complete profiles get 3x more engagement. Add a few more high-quality photos and double-check your parts list to be considered for our "Featured Builds" homepage.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={buttonStyle}>
                    Update My Build
                </a>
            </div>
        )}
        <div style={footerStyle}>
            <p>© {new Date().getFullYear()} CarFolio. All rights reserved.</p>
        </div>
    </div>
);

// 11. Shop Manager ("The Shop Manager")
export const ShopManagerEmail: React.FC<{ firstName?: string, carModel: string, missingCount: number, actionUrl?: string }> = ({
    firstName,
    carModel,
    missingCount,
    actionUrl
}) => (
    <div style={mainStyle}>
        <h1 style={h1Style}>You're leaving money on the table</h1>
        <p style={pStyle}>
            Hi {firstName || 'Name'},
        </p>
        <p style={pStyle}>
            You currently have <strong>{missingCount} parts</strong> listed on your <strong>{carModel}</strong> right now without purchase links.
        </p>
        <p style={pStyle}>
            When people see your build, they want to know exactly what you bought. By adding your affiliate links to those parts, you turn your build sheet into a passive income stream.
        </p>
        <p style={pStyle}>
            Take 5 minutes to drop your links in.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={buttonStyle}>
                    Add Purchase Links
                </a>
            </div>
        )}
        <div style={footerStyle}>
            <p>© {new Date().getFullYear()} CarFolio. All rights reserved.</p>
        </div>
    </div>
);

// 12. Influencer Stats ("The Influencer")
export const InfluencerEmail: React.FC<{ firstName?: string, viewCount: number, actionUrl?: string }> = ({
    firstName,
    viewCount,
    actionUrl
}) => (
    <div style={mainStyle}>
        <h1 style={h1Style}>{viewCount} people viewed your garage this week</h1>
        <p style={pStyle}>
            Hi {firstName || 'Name'},
        </p>
        <p style={pStyle}>
            Your bio link is working overtime.
        </p>
        <p style={pStyle}>
            <strong>{viewCount} people</strong> visited your CarFolio garage this week.
        </p>
        <p style={pStyle}>
            The best way to keep that momentum going is to post a fresh update. Did you install anything new this week? Add it to the log so your followers can see the progress.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={buttonStyle}>
                    Post an Update
                </a>
            </div>
        )}
        <div style={footerStyle}>
            <p>© {new Date().getFullYear()} CarFolio. All rights reserved.</p>
        </div>
    </div>
);

// 13. Visionary ("The Visionary")
export const VisionaryEmail: React.FC<{ firstName?: string, carModel: string, actionUrl?: string }> = ({
    firstName,
    carModel,
    actionUrl
}) => (
    <div style={mainStyle}>
        <h1 style={h1Style}>Make your {carModel} photos interactive</h1>
        <p style={pStyle}>
            Hi {firstName || 'Name'},
        </p>
        <p style={pStyle}>
            The photos of your <strong>{carModel}</strong> look incredible, but you can take them a step further.
        </p>
        <p style={pStyle}>
            Did you know you can click directly on your photos to tag the exact parts you installed? This creates "Interactive Hotspots" that let viewers see exactly what wheels, suspension, or aero you're running just by hovering over the image.
        </p>
        <p style={pStyle}>
            Try tagging your first photo.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={buttonStyle}>
                    Tag My Photos
                </a>
            </div>
        )}
        <div style={footerStyle}>
            <p>© {new Date().getFullYear()} CarFolio. All rights reserved.</p>
        </div>
    </div>
);

// 14. Build Value ("The Accountant")
export const BuildValueEmail: React.FC<{ firstName?: string, carModel: string, totalValue: number, actionUrl?: string }> = ({
    firstName,
    carModel,
    totalValue,
    actionUrl
}) => (
    <div style={mainStyle}>
        <h1 style={h1Style}>Your Build Update: {carModel}</h1>
        <p style={pStyle}>
            Hi {firstName || 'Name'},
        </p>
        <p style={pStyle}>
            Here is the latest financial summary for your <strong>{carModel}</strong>.
        </p>
        <p style={pStyle}>
            Based on the parts you've logged, you have invested <strong>${totalValue.toLocaleString()}</strong> into this build so far.
        </p>
        <p style={pStyle}>
            Keeping an accurate, up-to-date ledger of every part is the best way to protect your investment for insurance purposes or a future sale.
        </p>
        <p style={pStyle}>
            Missing a recent receipt? Log it now.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={buttonStyle}>
                    Update Build Ledger
                </a>
            </div>
        )}
        <div style={footerStyle}>
            <p>© {new Date().getFullYear()} CarFolio. All rights reserved.</p>
        </div>
    </div>
);

export const renderTemplate = (templateName: string, args: any) => {
    let component: React.ReactElement;

    switch (templateName) {
        case "welcome":
            component = <WelcomeEmail {...args} />;
            break;
        case "subscription_success":
            component = <SubscriptionSuccessEmail {...args} />;
            break;
        case "subscription_failed":
            component = <SubscriptionFailedEmail {...args} />;
            break;
        case "system":
        case "system_notification":
            component = <SystemNotificationEmail message={args.message} />;
            break;
        case "subscription_cancelled":
            component = <SubscriptionCancelledEmail {...args} />;
            break;
        case "refund_processed":
            component = <RefundProcessedEmail {...args} />;
            break;
        case "issue_received":
            component = <IssueReceivedEmail issueTitle={args.subject || "Issue"} {...args} />;
            break;
        case "issue_resolved":
            component = <IssueResolvedEmail issueTitle={args.subject || "Issue"} {...args} />;
            break;
        case "garage_limit":
            component = <GarageLimitEmail {...args} />;
            break;
        case "talent_scout":
            component = <TalentScoutEmail carModel={args.carModel || "Car"} {...args} />;
            break;
        case "shop_manager":
            component = <ShopManagerEmail carModel={args.carModel || "Car"} missingCount={args.missingCount || 0} {...args} />;
            break;
        case "influencer_stats":
            component = <InfluencerEmail viewCount={args.message ? parseInt(args.message) : 0} {...args} />;
            break;
        case "visionary":
        case "visionary_nudge":
            component = <VisionaryEmail carModel={args.carModel || "Car"} {...args} />;
            break;
        case "build_value":
            component = <BuildValueEmail carModel={args.carModel || "Car"} totalValue={args.message ? parseInt(args.message) : 0} {...args} />;
            break;
        default:
            throw new Error(`Unknown template: ${templateName}`);
    }

    // Use native rendering to avoid module resolution issues with @react-email/render in Convex Actions
    // Note: renderToStaticMarkup produces valid HTML but doesn't auto-add DOCTYPE, so we add it.
    const html = "<!DOCTYPE html>" + renderToStaticMarkup(component);

    // We omit plain text version for now as renderToStaticMarkup doesn't support it.
    // Resend/Clients usually handle HTML-only fine.
    const text = "";

    return {
        html,
        text
    };
};
