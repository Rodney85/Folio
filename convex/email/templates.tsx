import * as React from 'react';
import { renderToStaticMarkup } from "react-dom/server";

interface EmailTemplateProps {
    firstName?: string;
    actionUrl?: string;
}

const mainStyle = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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
export const WelcomeEmail: React.FC<EmailTemplateProps> = ({ firstName, actionUrl }) => (
    <div style={mainStyle}>
        <h1 style={h1Style}>The build starts here, {firstName || 'Builder'}.</h1>
        <p style={pStyle}>
            You didn't just sign up for another app. You claimed a permanent home for every car, every mod, and every milestone that defines your passion.
        </p>
        <p style={pStyle}>
            Most enthusiasts spend thousands on their builds and share them in a caption. You're done with that.
        </p>
        <p style={pStyle}>
            <strong>First things first</strong> — complete your profile and add your first car. Your legacy doesn't document itself.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={buttonStyle}>Build My Garage</a>
            </div>
        )}
        <div style={footerStyle}>
            <p>© {new Date().getFullYear()} CarFolio. All rights reserved.</p>
        </div>
    </div>
);

// 2. Subscription Success
export const SubscriptionSuccessEmail: React.FC<EmailTemplateProps> = ({ firstName, actionUrl }) => (
    <div style={mainStyle}>
        <h1 style={h1Style}>Pro. Unlocked. Let's go.</h1>
        <p style={pStyle}>
            Welcome to the top tier, {firstName || 'Builder'}.
        </p>
        <p style={pStyle}>
            Your garage just got a serious upgrade. Here's what's now in your toolkit:
        </p>
        <ul style={{ ...pStyle, paddingLeft: '20px' }}>
            <li style={{ marginBottom: '10px' }}><strong>Unlimited Car Slots</strong> — No cap. Ever. Add the whole fleet.</li>
            <li style={{ marginBottom: '10px' }}><strong>Shoppable Builds</strong> — Tag your parts. Drop your links. Start earning.</li>
            <li style={{ marginBottom: '10px' }}><strong>Analytics Dashboard</strong> — See who's watching, what they're clicking, and what's resonating.</li>
            <li style={{ marginBottom: '10px' }}><strong>Ad-Free Profile</strong> — Your build takes center stage. Nothing else.</li>
        </ul>
        <p style={pStyle}>
            Go make something worth showcasing.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={buttonStyle}>Open My Dashboard</a>
            </div>
        )}
        <div style={footerStyle}>
            <p>© {new Date().getFullYear()} CarFolio. All rights reserved.</p>
        </div>
    </div>
);

// 3. Subscription Failed (Dunning)
export const SubscriptionFailedEmail: React.FC<EmailTemplateProps> = ({ firstName, actionUrl }) => (
    <div style={mainStyle}>
        <h1 style={h1Style}>Quick heads up, {firstName || 'Builder'}.</h1>
        <p style={pStyle}>
            We tried to process your Pro renewal — but something didn't go through. Expired card, updated details — it happens.
        </p>
        <p style={pStyle}>
            <strong>Your build data is completely safe.</strong> But your Pro features will pause unless you update your payment method before your grace period ends.
        </p>
        <p style={pStyle}>
            Two minutes to fix it. Don't let billing be the reason your garage goes quiet.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={buttonStyle}>Update Payment Method</a>
            </div>
        )}
        <p style={pStyle}>
            Questions? Just reply to this email — we're real people.
        </p>
        <div style={footerStyle}>
            <p>© {new Date().getFullYear()} CarFolio. All rights reserved.</p>
        </div>
    </div>
);

// 4. Subscription Cancelled
export const SubscriptionCancelledEmail: React.FC<EmailTemplateProps> = ({ firstName, actionUrl }) => (
    <div style={mainStyle}>
        <h1 style={h1Style}>Noted, {firstName || 'Builder'}. The garage stays yours.</h1>
        <p style={pStyle}>
            Your Pro subscription has been cancelled. You'll keep full Pro access until the end of your current billing period — nothing gets cut off early.
        </p>
        <p style={pStyle}>
            After that, your account moves to the free tier. All your car data stays intact, but shoppable builds, unlimited slots, and analytics will be paused.
        </p>
        <p style={pStyle}>
            If you ever want to come back — the door's open.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={buttonStyle}>Reactivate Pro</a>
            </div>
        )}
        <div style={footerStyle}>
            <p>© {new Date().getFullYear()} CarFolio. All rights reserved.</p>
        </div>
    </div>
);

// 5. Refund Processed
export const RefundProcessedEmail: React.FC<{ firstName?: string, message?: string }> = ({ firstName }) => (
    <div style={mainStyle}>
        <h1 style={h1Style}>Refund on its way, {firstName || 'Builder'}.</h1>
        <p style={pStyle}>
            Your refund has been processed and is heading back to you. Allow 5–10 business days for it to appear on your statement depending on your bank.
        </p>
        <p style={pStyle}>
            If anything looks off or you have questions, just reply here — we'll sort it out.
        </p>
        <div style={footerStyle}>
            <p>© {new Date().getFullYear()} CarFolio. All rights reserved.</p>
        </div>
    </div>
);

// 6. System Notification
export const SystemNotificationEmail: React.FC<{ message?: string, firstName?: string }> = ({ message, firstName }) => (
    <div style={mainStyle}>
        <h1 style={h1Style}>Heads up, {firstName || 'Builder'}.</h1>
        <p style={pStyle}>{message}</p>
        <p style={pStyle}>Questions? Reply directly to this email.</p>
        <div style={footerStyle}>
            <p>© {new Date().getFullYear()} CarFolio. All rights reserved.</p>
        </div>
    </div>
);

// 7. Issue Received
export const IssueReceivedEmail: React.FC<{ firstName?: string, issueTitle: string }> = ({ firstName, issueTitle }) => (
    <div style={mainStyle}>
        <h1 style={h1Style}>Got it, {firstName || 'Builder'}. We're on it.</h1>
        <p style={pStyle}>
            Your report — <strong>"{issueTitle}"</strong> — is in our hands. The team has been notified and we're looking into it.
        </p>
        <p style={pStyle}>
            We'll follow up once we have an update. Building something great is a team effort, and feedback like yours is what keeps CarFolio sharp.
        </p>
        <p style={pStyle}>
            Thanks for keeping the garage honest.
        </p>
        <div style={footerStyle}>
            <p>© {new Date().getFullYear()} CarFolio. All rights reserved.</p>
        </div>
    </div>
);

// 8. Issue Resolved
export const IssueResolvedEmail: React.FC<{ firstName?: string, issueTitle: string }> = ({ firstName, issueTitle }) => (
    <div style={mainStyle}>
        <h1 style={h1Style}>Wrench down. Fixed.</h1>
        <p style={pStyle}>
            Hey {firstName || 'Builder'}, good news — the issue you flagged (<strong>"{issueTitle}"</strong>) has been resolved and the fix is live.
        </p>
        <p style={pStyle}>
            Thanks for taking the time to report it. You made CarFolio better for every builder in here.
        </p>
        <div style={footerStyle}>
            <p>© {new Date().getFullYear()} CarFolio. All rights reserved.</p>
        </div>
    </div>
);

// 9. Garage Limit Reached
export const GarageLimitEmail: React.FC<EmailTemplateProps> = ({ firstName, actionUrl }) => (
    <div style={mainStyle}>
        <h1 style={h1Style}>Three cars in. The real fleet starts now.</h1>
        <p style={pStyle}>
            Hey {firstName || 'Builder'}, you've hit the limit on your free garage slots — which means you've got cars worth showcasing.
        </p>
        <p style={pStyle}>
            Upgrade to Pro and add as many builds as you want. Unlimited slots, shoppable parts, full analytics, and an ad-free profile — all for less than a tank of gas a month.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={buttonStyle}>Unlock Unlimited Slots</a>
            </div>
        )}
        <div style={footerStyle}>
            <p>© {new Date().getFullYear()} CarFolio. All rights reserved.</p>
        </div>
    </div>
);

// 10. Talent Scout
export const TalentScoutEmail: React.FC<{ firstName?: string, carModel: string, actionUrl?: string }> = ({ firstName, carModel, actionUrl }) => (
    <div style={mainStyle}>
        <h1 style={h1Style}>People are stopping to look, {firstName || 'Builder'}.</h1>
        <p style={pStyle}>
            Your <strong>{carModel}</strong> is one of the most viewed builds in the community this week. Heads are turning — and the algorithm didn't put it there. Your work did.
        </p>
        <p style={pStyle}>
            Finish your profile to be considered for our <strong>Featured Builds</strong> spotlight and get it in front of even more eyes.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={buttonStyle}>Complete My Profile</a>
            </div>
        )}
        <div style={footerStyle}>
            <p>© {new Date().getFullYear()} CarFolio. All rights reserved.</p>
        </div>
    </div>
);

// 11. Shop Manager
export const ShopManagerEmail: React.FC<{ firstName?: string, carModel: string, missingCount: number, actionUrl?: string }> = ({ firstName, carModel, missingCount, actionUrl }) => (
    <div style={mainStyle}>
        <h1 style={h1Style}>{missingCount} parts. Zero links. Zero earnings.</h1>
        <p style={pStyle}>
            Hey {firstName || 'Builder'}, your <strong>{carModel}</strong> has <strong>{missingCount} parts</strong> with no affiliate link attached.
        </p>
        <p style={pStyle}>
            Every time someone asks <em>"what wheels are those?"</em> or <em>"where'd you get that intake?"</em> — that's a sale waiting to happen. Add your links, turn on Shoppable Builds, and start getting paid for the knowledge you're already giving away for free.
        </p>
        <p style={pStyle}>
            Takes five minutes. Pays indefinitely.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={buttonStyle}>Add My Links</a>
            </div>
        )}
        <div style={footerStyle}>
            <p>© {new Date().getFullYear()} CarFolio. All rights reserved.</p>
        </div>
    </div>
);

// 12. Influencer
export const InfluencerEmail: React.FC<{ firstName?: string, viewCount: number, actionUrl?: string }> = ({ firstName, viewCount, actionUrl }) => (
    <div style={mainStyle}>
        <h1 style={h1Style}>{viewCount} people walked through your garage this week, {firstName || 'Builder'}.</h1>
        <p style={pStyle}>
            Your profile isn't just sitting there — it's working. Enthusiasts are finding your builds, exploring your mods, and clicking your parts.
        </p>
        <p style={pStyle}>
            Keep your build updated and your links active to make sure every visit counts.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={buttonStyle}>View My Analytics</a>
            </div>
        )}
        <div style={footerStyle}>
            <p>© {new Date().getFullYear()} CarFolio. All rights reserved.</p>
        </div>
    </div>
);

// 13. Visionary
export const VisionaryEmail: React.FC<{ firstName?: string, carModel: string, actionUrl?: string }> = ({ firstName, carModel, actionUrl }) => (
    <div style={mainStyle}>
        <h1 style={h1Style}>Great photos. Now make them interactive.</h1>
        <p style={pStyle}>
            Hey {firstName || 'Builder'}, your <strong>{carModel}</strong> gallery is looking clean — but right now people are guessing what they're looking at.
        </p>
        <p style={pStyle}>
            Add <strong>Interactive Hotspots</strong> to your photos and let viewers tap directly on your mods to see exactly what you've done. It's the difference between a photo and a build story.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={buttonStyle}>Add Hotspots</a>
            </div>
        )}
        <div style={footerStyle}>
            <p>© {new Date().getFullYear()} CarFolio. All rights reserved.</p>
        </div>
    </div>
);

// 14. Build Value
export const BuildValueEmail: React.FC<{ firstName?: string, carModel: string, totalValue: number, actionUrl?: string }> = ({ firstName, carModel, totalValue, actionUrl }) => (
    <div style={mainStyle}>
        <h1 style={h1Style}>Running tally on the {carModel}, {firstName || 'Builder'}.</h1>
        <p style={pStyle}>
            You've put <strong>${totalValue.toLocaleString()}</strong> into this build so far — and that number tells a story.
        </p>
        <p style={pStyle}>
            Every part tracked is proof of what this car is worth. Keep your list complete and you'll always have a full record when it's time to sell, insure, or just flex the receipts.
        </p>
        {actionUrl && (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <a href={actionUrl} style={buttonStyle}>View Build Value</a>
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
            component = <SystemNotificationEmail firstName={args.firstName} message={args.message} />;
            break;
        case "subscription_cancelled":
            component = <SubscriptionCancelledEmail {...args} />;
            break;
        case "refund_processed":
            component = <RefundProcessedEmail {...args} />;
            break;
        case "issue_received":
            component = <IssueReceivedEmail firstName={args.firstName} issueTitle={args.subject || "Issue"} {...args} />;
            break;
        case "issue_resolved":
            component = <IssueResolvedEmail firstName={args.firstName} issueTitle={args.subject || "Issue"} {...args} />;
            break;
        case "garage_limit":
            component = <GarageLimitEmail {...args} />;
            break;
        case "talent_scout":
            component = <TalentScoutEmail firstName={args.firstName} carModel={args.carModel || "Car"} {...args} />;
            break;
        case "shop_manager":
            component = <ShopManagerEmail firstName={args.firstName} carModel={args.carModel || "Car"} missingCount={args.missingCount || 0} {...args} />;
            break;
        case "influencer_stats":
            component = <InfluencerEmail firstName={args.firstName} viewCount={args.message ? parseInt(args.message) : 0} {...args} />;
            break;
        case "visionary":
        case "visionary_nudge":
            component = <VisionaryEmail firstName={args.firstName} carModel={args.carModel || "Car"} {...args} />;
            break;
        case "build_value":
            component = <BuildValueEmail firstName={args.firstName} carModel={args.carModel || "Car"} totalValue={args.message ? parseInt(args.message) : 0} {...args} />;
            break;
        default:
            throw new Error(`Unknown template: ${templateName}`);
    }

    const html = "<!DOCTYPE html>" + renderToStaticMarkup(component);
    const text = "";

    return { html, text };
};
