# Browser-compatible video transcoding

Kroo transcodes every uploaded video through AWS Elemental MediaConvert into MP4/H.264/AAC before the public gallery uses it. AWS documents MediaConvert as the service for transcoding S3 inputs into delivery-ready outputs, and the MediaConvert job role must be trusted by MediaConvert and allowed to read/write the relevant S3 locations.

## Vercel environment variable

Add:

`AWS_MEDIACONVERT_ROLE_ARN=arn:aws:iam::<ACCOUNT_ID>:role/<MEDIACONVERT_ROLE_NAME>`

Keep AWS credentials and this role ARN in Vercel environment variables, not in Git.

## Vercel/runtime IAM permissions

The IAM identity used by the Next.js server needs:

- `mediaconvert:CreateJob`
- `iam:PassRole` for the MediaConvert service role, restricted with `iam:PassedToService=mediaconvert.amazonaws.com`

Example:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CreateKrooTranscodeJobs",
      "Effect": "Allow",
      "Action": ["mediaconvert:CreateJob"],
      "Resource": "*"
    },
    {
      "Sid": "PassKrooMediaConvertRole",
      "Effect": "Allow",
      "Action": ["iam:PassRole"],
      "Resource": "arn:aws:iam::<ACCOUNT_ID>:role/<MEDIACONVERT_ROLE_NAME>",
      "Condition": {
        "StringLike": {
          "iam:PassedToService": "mediaconvert.amazonaws.com"
        }
      }
    }
  ]
}
```

## MediaConvert service role

The role named by `AWS_MEDIACONVERT_ROLE_ARN` must trust:

`mediaconvert.amazonaws.com`

It also needs S3 access to the Kroo bucket. At minimum, grant read access to the uploaded source objects and write access to the transcoded `media/*/web/*` objects.

Example resource scope:

- `arn:aws:s3:::<BUCKET>`
- `arn:aws:s3:::<BUCKET>/media/*`

If the bucket uses SSE-KMS, add the KMS permissions required by that key.

## Output

An upload such as:

`media/gym/123-example.mov`

produces:

`media/gym/web/123-example_web.mp4`

The public gallery prefers the transcoded file and hides the original source when its web-compatible output exists.

MediaConvert jobs are asynchronous, so a newly uploaded video can take some time to appear while the transcode is running.
