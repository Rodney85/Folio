import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    name?: string;
    type?: string;
    image?: string;
    url?: string;
}

export const SEO: React.FC<SEOProps> = ({
    title = 'CarFolio - The Definitive Automotive Portfolio',
    description = 'Showcase your builds, manage modifications, and monetize your passion. CarFolio is the ultimate platform for car enthusiasts.',
    name = 'CarFolio',
    type = 'website',
    image = '/mac.png',
    url,
}) => {
    const siteUrl = 'https://www.carfolio.cc'; // Updated domain
    const currentUrl = url ? url : siteUrl;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title}</title>
            <meta name='description' content={description} />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="canonical" href={currentUrl} />

            {/* Facebook tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:site_name" content={name} />

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content={type === 'article' ? 'summary_large_image' : 'summary'} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "SoftwareApplication",
                    "name": name,
                    "applicationCategory": "LifestyleApplication",
                    "operatingSystem": "Web",
                    "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "USD"
                    },
                    "description": description,
                    "image": image,
                    "url": currentUrl
                })}
            </script>
        </Helmet>
    );
};
