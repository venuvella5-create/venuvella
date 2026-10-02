# Affiliate Provider Architecture

`AffiliateProvider` represents a network/provider. `ProviderProduct` maps a Venuvella product to an external provider product.

The application should later expose a provider adapter interface with operations such as:

- `searchProducts`
- `getProduct`
- `importProduct`
- `syncProduct`
- `getAffiliateUrl`
- `checkAvailability`

Amazon-specific code must remain inside its provider adapter. It must never become part of generic Product or Article components.
