# Visitor tracking — DynamoDB setup

This is the one piece of Phase 1 that has to happen outside the codebase:
creating the table. Nothing in the app can provision AWS resources for you.

Without this table configured, visitor tracking silently runs on the
in-memory adapter (fine for local dev, **not** for production — data is
lost on every deploy/restart and isn't shared across serverless instances).

## 1. Create the table

| Setting | Value |
|---|---|
| Table name | anything — set it as `VISITOR_DYNAMODB_TABLE` |
| Partition key | `pk` (String) |
| Sort key | `sk` (String) |
| Billing mode | On-demand (recommended — traffic is spiky and low-volume) |
| TTL attribute | `ttl` (enable DynamoDB TTL on this attribute) |

## 2. Add a Global Secondary Index named `gsi1`

| Setting | Value |
|---|---|
| Index name | `gsi1` (the adapter hardcodes this name) |
| Partition key | `gsi1pk` (String) |
| Sort key | `gsi1sk` (String) |
| Projection | All |

This index is what lets "recent visitors" and analytics date-range queries
run as a DynamoDB `Query` against a specific day partition (`DAY#2026-08-23`)
instead of a full-table `Scan`. It's required — reads will simply return
nothing without it.

## 3. Set environment variables

```
VISITOR_DYNAMODB_TABLE=<your-table-name>
VISITOR_RETENTION_DAYS=90   # optional, defaults to 90
```

Uses the same `AWS_REGION` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`
already configured for the telemetry and media tables — no separate
credentials needed. The IAM policy for those credentials needs
`dynamodb:PutItem`, `GetItem`, and `Query` on this new table (and its
`gsi1` index).

## Why a separate table instead of reusing the telemetry table

Kept isolated so visitor-data retention/TTL, access patterns, and future
scaling are independent of web-vitals/error telemetry — matches the same
reasoning already documented in `lib/aws/dynamodb-client.ts` for why media
metadata has its own table too.
