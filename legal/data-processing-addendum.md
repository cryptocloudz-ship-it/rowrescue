# RowRescue — Data Processing Addendum

> **Warning**
> This document is a template. Have it reviewed by qualified legal counsel before use.

**Effective Date:** [Date]
**Last Updated:** [Date]

---

## 1. Introduction

This Data Processing Addendum ("DPA") forms part of the agreement between the customer subscribing to a RowRescue Team plan ("Controller", "Customer", "you") and [Company Name], a company registered in Ireland ("Processor", "we", "us", or "our"), collectively the "Parties".

This DPA applies to the extent that the Processor processes personal data on behalf of the Controller in connection with the provision of the RowRescue Service, and such processing is subject to the General Data Protection Regulation (EU) 2016/679 ("GDPR") or other applicable European data protection legislation.

This DPA supplements and is incorporated into the RowRescue Terms of Service.

## 2. Definitions

- **"Personal Data"** has the meaning given in Article 4(1) of the GDPR.
- **"Processing"** has the meaning given in Article 4(2) of the GDPR.
- **"Data Subject"** has the meaning given in Article 4(1) of the GDPR.
- **"Sub-Processor"** means any third party engaged by the Processor to process Personal Data on behalf of the Controller.
- **"Data Breach"** means a breach of security leading to the accidental or unlawful destruction, loss, alteration, unauthorised disclosure of, or access to Personal Data.
- **"SCCs"** means the Standard Contractual Clauses approved by European Commission Implementing Decision (EU) 2021/914.

## 3. Scope and Nature of Processing

### 3.1 Architecture Note

RowRescue's core CSV processing functionality operates entirely client-side (in the user's browser). The Processor does not have access to, and does not process, the contents of files handled by the Service. This DPA governs the limited personal data that the Processor does process on behalf of the Controller in connection with the Team plan.

### 3.2 Categories of Data Subjects

- Team members (employees, contractors, or agents of the Controller invited to the Team plan).

### 3.3 Categories of Personal Data

- Email addresses and display names of team members;
- Team audit log metadata: user identifiers, action types, timestamps, truncated IP addresses;
- Account and authentication data: OAuth identifiers, session metadata.

### 3.4 Purpose of Processing

- Providing and operating the RowRescue Team plan, including user authentication, team member management, and audit logging;
- Billing administration for the Team subscription.

### 3.5 Duration of Processing

Processing continues for the duration of the Controller's Team subscription plus the applicable retention periods set out in the RowRescue Privacy Policy, unless otherwise instructed by the Controller.

## 4. Controller Obligations

The Controller shall:

(a) Ensure it has a lawful basis for the processing of personal data and for instructing the Processor accordingly;
(b) Ensure that data subjects have been informed of the processing in accordance with Articles 13 and 14 of the GDPR;
(c) Be responsible for the accuracy, quality, and legality of the personal data provided to the Processor;
(d) Comply with its obligations under applicable data protection laws.

## 5. Processor Obligations

The Processor shall:

(a) Process Personal Data only on documented instructions from the Controller, unless required to do so by EU or Member State law, in which case the Processor shall inform the Controller of that legal requirement before processing (unless prohibited by law);
(b) Ensure that persons authorised to process the Personal Data have committed themselves to confidentiality or are under an appropriate statutory obligation of confidentiality;
(c) Implement and maintain the technical and organisational security measures described in Section 7;
(d) Comply with the conditions for engaging Sub-Processors as set out in Section 8;
(e) Assist the Controller, taking into account the nature of processing, in responding to requests from data subjects exercising their rights under the GDPR;
(f) Assist the Controller in ensuring compliance with the obligations under Articles 32–36 of the GDPR, taking into account the nature of processing and the information available to the Processor;
(g) At the Controller's choice, delete or return all Personal Data to the Controller after the end of the provision of services, and delete existing copies unless EU or Member State law requires storage of the Personal Data;
(h) Make available to the Controller all information necessary to demonstrate compliance with Article 28 of the GDPR and allow for and contribute to audits and inspections.

## 6. Data Subject Requests

The Processor shall promptly notify the Controller if it receives a request from a data subject relating to the processing of Personal Data under this DPA. The Processor shall not respond to such requests directly unless authorised by the Controller or required by applicable law.

The Processor shall provide reasonable technical and organisational assistance to the Controller in fulfilling its obligations to respond to data subject requests.

## 7. Technical and Organisational Security Measures

The Processor implements and maintains the following measures to protect Personal Data:

### 7.1 Encryption

- Data in transit: TLS 1.2 or higher for all connections;
- Data at rest: AES-256 encryption for database storage.

### 7.2 Access Control

- Role-based access control (RBAC) for all internal systems;
- Multi-factor authentication required for Processor personnel accessing production systems;
- Principle of least privilege enforced across infrastructure.

### 7.3 Infrastructure Security

- Application hosted on Vercel with isolated deployment environments;
- Database hosted on Neon (PostgreSQL) in the EU (Frankfurt) with automated backups;
- Network-level isolation and firewall rules.

### 7.4 Organisational Measures

- Confidentiality obligations for all personnel;
- Regular security awareness training;
- Documented incident response procedures;
- Regular dependency and vulnerability auditing.

### 7.5 Availability and Resilience

- Automated database backups with point-in-time recovery;
- Infrastructure redundancy via Vercel's global edge network;
- Monitoring and alerting for service availability.

## 8. Sub-Processors

### 8.1 General Authorisation

The Controller provides general authorisation for the Processor to engage the Sub-Processors listed in Section 8.3. The Processor shall inform the Controller of any intended additions or replacements of Sub-Processors, giving the Controller a reasonable opportunity (not less than 30 days) to object.

### 8.2 Objection to Sub-Processors

If the Controller objects to a new or replacement Sub-Processor on reasonable data protection grounds, the Parties shall discuss the objection in good faith. If the Parties cannot resolve the objection, the Controller may terminate the affected Service by providing written notice.

### 8.3 Current Sub-Processors

| Sub-Processor | Purpose | Data Processed | Location | Safeguards |
|---|---|---|---|---|
| **Stripe, Inc.** | Payment processing | Billing metadata, payment details | USA | SCCs, Data Privacy Framework |
| **Vercel, Inc.** | Application hosting and CDN | IP addresses, request metadata | Global (EU primary) / USA | SCCs, Data Privacy Framework |
| **Neon, Inc.** | PostgreSQL database hosting | Account data, audit log metadata | EU (Frankfurt) | Data processed within EEA |
| **Resend, Inc.** | Transactional email | Email addresses, delivery metadata | USA | SCCs, Data Privacy Framework |

### 8.4 Sub-Processor Obligations

The Processor shall enter into a written agreement with each Sub-Processor imposing data protection obligations no less protective than those set out in this DPA. The Processor remains fully liable to the Controller for the performance of each Sub-Processor's obligations.

## 9. International Data Transfers

Where Personal Data is transferred outside the EEA, the Processor ensures that appropriate safeguards are in place in accordance with Chapter V of the GDPR, including:

- Standard Contractual Clauses (SCCs) adopted by the European Commission;
- The EU-U.S. Data Privacy Framework, where the Sub-Processor is certified;
- Supplementary technical measures, such as encryption, where required by a transfer impact assessment.

## 10. Data Breach Notification

### 10.1 Notification

The Processor shall notify the Controller without undue delay, and in any event within 48 hours, after becoming aware of a Data Breach affecting Personal Data processed under this DPA.

### 10.2 Content of Notification

The notification shall include, to the extent reasonably available:

(a) A description of the nature of the Data Breach, including the categories and approximate number of data subjects and records concerned;
(b) The name and contact details of the Processor's point of contact;
(c) A description of the likely consequences of the Data Breach;
(d) A description of the measures taken or proposed to address the Data Breach, including measures to mitigate its adverse effects.

### 10.3 Cooperation

The Processor shall cooperate with the Controller and take reasonable steps to assist in the investigation, mitigation, and remediation of the Data Breach.

## 11. Audits

### 11.1 Audit Right

The Controller (or its authorised third-party auditor) may audit the Processor's compliance with this DPA up to once per year, upon reasonable written notice (not less than 30 days), during normal business hours, and subject to reasonable confidentiality obligations.

### 11.2 Audit Facilitation

The Processor shall make available relevant records, systems, and personnel to facilitate the audit. The Processor may satisfy audit requests by providing relevant certifications, audit reports (such as SOC 2), or equivalent documentation.

## 12. Liability

Each Party's liability under this DPA is subject to the limitations of liability set out in the RowRescue Terms of Service, except where applicable law requires otherwise.

## 13. Term and Termination

This DPA shall remain in effect for the duration of the Controller's Team plan subscription. Upon termination, the Processor shall, at the Controller's election, delete or return all Personal Data in accordance with Section 5(g) and the retention periods in the Privacy Policy.

## 14. Governing Law

This DPA shall be governed by and construed in accordance with the laws of Ireland. Any disputes shall be subject to the exclusive jurisdiction of the courts of Ireland.

## 15. Contact

For questions regarding this DPA, please contact:

**[Company Name]**
[Address]
[City, County, Eircode]
Ireland

Email: [privacy email]
