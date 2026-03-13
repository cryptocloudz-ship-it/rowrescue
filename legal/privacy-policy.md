# TidySheet — Privacy Policy

> **Warning**
> This document is a template. Have it reviewed by qualified legal counsel before use.

**Effective Date:** [Date]
**Last Updated:** [Date]

---

## 1. Introduction

[Company Name] ("Company", "we", "us", or "our"), a company registered in Ireland, operates the TidySheet web application ("Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your personal data when you use the Service.

We are committed to protecting your privacy and processing your personal data in accordance with the General Data Protection Regulation (EU) 2016/679 ("GDPR"), the Data Protection Acts 1988–2018 (Ireland), and other applicable data protection legislation.

## 2. Data Controller

The data controller for the purposes of this Privacy Policy is:

**[Company Name]**
[Address]
[City, County, Eircode]
Ireland

Email: [privacy email]

## 3. Our Privacy-First Architecture

TidySheet is designed as a privacy-first application. **All CSV file processing occurs entirely within your web browser (client-side).** Your file contents are never transmitted to, processed by, or stored on our servers. We have no technical ability to access the contents of files you process using the Service.

## 4. What We Collect

### 4.1 Data We DO Collect

| Data Category | Examples | Legal Basis (GDPR Art. 6) |
|---|---|---|
| **Account Information** | Email address, display name, hashed password (or OAuth provider ID) | Performance of contract (Art. 6(1)(b)) |
| **Billing Metadata** | Stripe customer ID, subscription plan, billing cycle dates, invoice references, country of billing | Performance of contract (Art. 6(1)(b)) |
| **Transactional Email Records** | Email delivery metadata (recipient address, send timestamp, delivery status) via Resend | Performance of contract (Art. 6(1)(b)) |
| **Team Audit Log Metadata** (Team plans) | User ID, action type, timestamp, IP address (truncated) | Legitimate interest (Art. 6(1)(f)) — security and accountability |
| **Analytics Data** (opt-in only) | Page views, feature usage events, session duration, anonymised device/browser type | Consent (Art. 6(1)(a)) |
| **Technical Logs** | Server access logs (IP address, user agent, request path, timestamp) | Legitimate interest (Art. 6(1)(f)) — security and service operation |
| **Cookie Data** | Session identifiers, authentication tokens | See our Cookie Policy |

### 4.2 Data We Do NOT Collect

- **File contents** — CSV files, spreadsheets, or any data contained within your files
- **File names or metadata** — names, sizes, or properties of files you process
- **Processed output** — any data resulting from your use of the cleaning tools
- **Clipboard data** — any data you copy to or from the Service

We have architected the Service so that this data never leaves your device.

## 5. How We Use Your Data

We use the personal data we collect for the following purposes:

- **Service delivery** — creating and managing your account, authenticating your sessions, delivering the Service features you have subscribed to;
- **Billing and payments** — processing payments, managing subscriptions, issuing invoices, and resolving billing enquiries;
- **Communication** — sending transactional emails (account verification, password resets, billing receipts, material service updates);
- **Security** — detecting and preventing fraud, abuse, and security incidents; maintaining audit logs for Team plan accountability;
- **Analytics** (opt-in only) — understanding how features are used to improve the Service;
- **Legal compliance** — fulfilling our obligations under applicable laws, including tax and accounting requirements.

We do not sell your personal data. We do not use your personal data for profiling or automated decision-making.

## 6. Sub-Processors

We use the following sub-processors to operate the Service:

| Sub-Processor | Purpose | Data Processed | Location |
|---|---|---|---|
| **Stripe** | Payment processing | Billing metadata, payment card details (held by Stripe) | USA (EU SCCs / Data Privacy Framework) |
| **Vercel** | Application hosting and CDN | IP address, request metadata | Global edge network (EU region primary); USA (EU SCCs / Data Privacy Framework) |
| **Neon** | PostgreSQL database hosting | Account information, billing metadata, audit log metadata | EU (Frankfurt) |
| **Resend** | Transactional email delivery | Email address, email delivery metadata | USA (EU SCCs / Data Privacy Framework) |

Each sub-processor is contractually bound to process personal data only as instructed by us and to implement appropriate technical and organisational security measures. Where sub-processors are located outside the EEA, transfers are safeguarded by Standard Contractual Clauses (SCCs) approved by the European Commission and/or the EU-U.S. Data Privacy Framework, as applicable.

## 7. Data Retention

| Data Category | Retention Period |
|---|---|
| Account information | Duration of account plus 30 days after deletion request |
| Billing metadata | 7 years from the date of the transaction (Irish tax/accounting obligations) |
| Transactional email records | 12 months |
| Team audit log metadata | Duration of Team subscription plus 90 days |
| Analytics data (opt-in) | 26 months from collection, then aggregated/anonymised |
| Technical/server logs | 90 days |

After the applicable retention period, personal data is securely deleted or irreversibly anonymised.

## 8. Your Rights Under the GDPR

As a data subject, you have the following rights:

| Right | Description |
|---|---|
| **Access** (Art. 15) | Request a copy of the personal data we hold about you. |
| **Rectification** (Art. 16) | Request correction of inaccurate or incomplete personal data. |
| **Erasure** (Art. 17) | Request deletion of your personal data ("right to be forgotten"), subject to legal retention obligations. |
| **Restriction** (Art. 18) | Request restriction of processing in certain circumstances. |
| **Data Portability** (Art. 20) | Receive your personal data in a structured, commonly used, machine-readable format (JSON or CSV) and transmit it to another controller. |
| **Objection** (Art. 21) | Object to processing based on legitimate interest, including for direct marketing purposes. |
| **Withdraw Consent** (Art. 7(3)) | Withdraw consent for analytics at any time without affecting the lawfulness of processing prior to withdrawal. |

To exercise any of these rights, please contact us at [privacy email]. We will respond within 30 days, as required by the GDPR. We may request verification of your identity before fulfilling your request.

## 9. Data Portability

Upon request, we will provide your personal data (account information and billing metadata) in a machine-readable format (JSON or CSV). Since file contents are never stored on our servers, data portability for file contents is inherently satisfied — your data never leaves your device.

## 10. International Transfers

Our primary database is hosted within the European Union (Frankfurt, Germany). Where personal data is transferred outside the EEA (for example, to sub-processors in the United States), we ensure that appropriate safeguards are in place, including:

- Standard Contractual Clauses (SCCs) approved by the European Commission;
- The EU-U.S. Data Privacy Framework, where the recipient is certified;
- Supplementary technical measures where required.

## 11. Security Measures

We implement appropriate technical and organisational measures to protect your personal data, including:

- Encryption in transit (TLS 1.2+) and at rest;
- Secure password hashing (bcrypt or equivalent);
- Role-based access controls for internal systems;
- Regular security reviews and dependency auditing;
- Incident response procedures.

## 12. Children's Privacy

The Service is not directed to individuals under the age of 16. We do not knowingly collect personal data from children. If you become aware that a child has provided us with personal data, please contact us, and we will take steps to delete such data.

## 13. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of material changes by email and/or a prominent notice on the Service prior to the change becoming effective. We encourage you to review this Privacy Policy periodically.

## 14. Complaints

If you believe we have not handled your personal data in accordance with applicable data protection law, you have the right to lodge a complaint with:

**Data Protection Commission (Ireland)**
21 Fitzwilliam Square South
Dublin 2, D02 RD28
Ireland
Website: [https://www.dataprotection.ie](https://www.dataprotection.ie)

You may also lodge a complaint with the supervisory authority in your EU/EEA Member State of residence.

## 15. Contact

For any questions about this Privacy Policy or our data practices, please contact:

**[Company Name]**
[Address]
[City, County, Eircode]
Ireland

Email: [privacy email]
