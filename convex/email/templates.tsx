import * as React from 'react';
import { render } from "@react-email/render";

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
        <h1 style={h1Style}>Welcome to the Garage, {firstName || 'CarFolio Member'}.</h1>
        <p style={pStyle}>
            You’ve just joined the ultimate community for automotive enthusiasts. CarFolio isn’t just a tool—it’s where your build’s legacy begins.
        </p>
        <p style={pStyle}>
            Whether you’re tracking a restoration, managing modifications, or showcasing your collection, we’re here to help you document every mile and every bolt.
        </p>
        <p style={pStyle}>
            <strong>Ready to get started?</strong> Complete your profile to unlock the full potential of your garage.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={buttonStyle}>
                    Complete My Profile
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
        <h1 style={h1Style}>You’re officially a Pro.</h1>
        <p style={pStyle}>
            Thanks for upgrading, {firstName || 'member'}. You’ve just unlocked the highest tier of CarFolio.
        </p>
        <p style={pStyle}>
            Here’s what you can do right now:
        </p>
        <ul style={{ ...pStyle, paddingLeft: '20px' }}>
            <li style={{ marginBottom: '10px' }}><strong>Unlimited Garage Slots:</strong> Add as many cars as you want.</li>
            <li style={{ marginBottom: '10px' }}><strong>Advanced Analytics:</strong> Track value and expenses in detail.</li>
            <li style={{ marginBottom: '10px' }}><strong>Priority Features:</strong> Get first access to new tools.</li>
        </ul>
        <p style={pStyle}>
            Jump back into your dashboard to see your new features in action.
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
        <h1 style={{ ...h1Style, color: '#e00000' }}>Action Required: We couldn't process your payment.</h1>
        <p style={pStyle}>
            Hi {firstName || 'there'},
        </p>
        <p style={pStyle}>
            We attempted to renew your CarFolio Pro subscription, but the payment didn't go through. This usually happens due to an expired card or updated bank details.
        </p>
        <p style={pStyle}>
            <strong>Don't worry—your data is safe.</strong> However, to keep your Pro features active and avoid any interruption, please update your payment method.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={{ ...buttonStyle, backgroundColor: '#e00000' }}>
                    Update Payment Method
                </a>
            </div>
        )}
        <p style={pStyle}>
            If you have any questions, simply reply to this email.
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
        <h1 style={h1Style}>We're sorry to see you go.</h1>
        <p style={pStyle}>
            Hi {firstName || 'there'},
        </p>
        <p style={pStyle}>
            Your CarFolio Pro subscription has been cancelled. You'll continue to have access to Pro features until the end of your current billing period.
        </p>
        <p style={pStyle}>
            After that, your account will revert to the free tier. Your car data will remain safe, but some Pro features will be locked.
        </p>
        <p style={pStyle}>
            If you change your mind, we'd love to have you back in the garage.
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
        <h1 style={h1Style}>Refund Processed</h1>
        <p style={pStyle}>
            Hi {firstName || 'User'},
        </p>
        <p style={pStyle}>
            {message || "We've processed a refund for your recent transaction. It may take 5-10 business days to appear on your statement."}
        </p>
        <p style={pStyle}>
            If you have any questions, simply reply to this email.
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
        <h1 style={h1Style}>We got it.</h1>
        <p style={pStyle}>
            Hi {firstName || 'there'},
        </p>
        <p style={pStyle}>
            Thanks for the heads up. We've received your report: <strong>"{issueTitle}"</strong>.
        </p>
        <p style={pStyle}>
            Our team is looking into it. improving CarFolio is a team sport, and we appreciate you being on the roster.
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
        <h1 style={h1Style}>Fixed.</h1>
        <p style={pStyle}>
            Hi {firstName || 'there'},
        </p>
        <p style={pStyle}>
            Great news! The issue you reported (<strong>"{issueTitle}"</strong>) has been resolved.
        </p>
        <p style={pStyle}>
            Thanks for helping us make the garage a better place.
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
        <h1 style={h1Style}>Your garage is full.</h1>
        <p style={pStyle}>
            Hi {firstName || 'Driver'},
        </p>
        <p style={pStyle}>
            You've hit the limit of your current plan. To add more cars to your fleet, you'll need to upgrade to Pro.
        </p>
        <p style={pStyle}>
            <strong>Pro Benefits:</strong> Unlimited cars, advanced analytics, and shoppable builds.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={buttonStyle}>
                    Upgrade to Pro
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
        <h1 style={h1Style}>Your build is turning heads.</h1>
        <p style={pStyle}>
            Hi {firstName || 'Builder'},
        </p>
        <p style={pStyle}>
            Your <strong>{carModel}</strong> is getting serious attention. It's one of the most active builds in the community this week.
        </p>
        <p style={pStyle}>
            Complete your profile to be considered for our "Featured Builds" list.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={buttonStyle}>
                    Complete Profile
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
        <h1 style={h1Style}>Don't leave money on the table.</h1>
        <p style={pStyle}>
            Hi {firstName || 'there'},
        </p>
        <p style={pStyle}>
            You have <strong>{missingCount} parts</strong> on your <strong>{carModel}</strong> without purchase links.
        </p>
        <p style={pStyle}>
            Add affiliate links to your build list to enable "Shoppable Builds" and start earning commissions when others are inspired by your work.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={buttonStyle}>
                    Manage Parts
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
        <h1 style={h1Style}>Your bio link is working overtime.</h1>
        <p style={pStyle}>
            Hi {firstName || 'Influencer'},
        </p>
        <p style={pStyle}>
            <strong>{viewCount} people</strong> visited your garage this week. Your build is inspiring the community.
        </p>
        <p style={pStyle}>
            Keep your profile fresh to keep them coming back.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={buttonStyle}>
                    View Analytics
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
        <h1 style={h1Style}>Visualize your build.</h1>
        <p style={pStyle}>
            Hi {firstName || 'Visionary'},
        </p>
        <p style={pStyle}>
            Your <strong>{carModel}</strong> photos are looking great, but they could be even better.
        </p>
        <p style={pStyle}>
            Tag your modifications with <strong>Interactive Hotspots</strong> to help others see exactly what you've done.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={buttonStyle}>
                    Add Hotspots
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
        <h1 style={h1Style}>Build Update.</h1>
        <p style={pStyle}>
            Hi {firstName || 'Investor'},
        </p>
        <p style={pStyle}>
            You've invested <strong>${totalValue.toLocaleString()}</strong> into your <strong>{carModel}</strong> so far.
        </p>
        <p style={pStyle}>
            Keep tracking every part to have a complete history of your build's value.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={buttonStyle}>
                    View Details
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
        case "visionary_nudge":
            component = <VisionaryEmail carModel={args.carModel || "Car"} {...args} />;
            break;
        case "build_value":
            component = <BuildValueEmail carModel={args.carModel || "Car"} totalValue={args.message ? parseInt(args.message) : 0} {...args} />;
            break;
        default:
            throw new Error(`Unknown template: ${templateName}`);
    }

    const html = render(component);
    const text = render(component, { plainText: true });

    return { html, text };
};
