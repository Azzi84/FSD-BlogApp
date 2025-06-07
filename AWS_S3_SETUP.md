# AWS S3 Setup Guide

## Prerequisites
- AWS Account (free tier available)
- Basic knowledge of AWS console

## Step 1: Create AWS Account
1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Follow the registration process
4. Verify your email and add payment method (required even for free tier)

## Step 2: Create S3 Bucket
1. Login to AWS Console
2. Navigate to S3 service
3. Click "Create bucket"
4. Choose a unique bucket name (e.g., `your-blog-images-bucket`)
5. Select a region (recommend `us-east-1` for simplicity)
6. **IMPORTANT**: Uncheck "Block all public access" for public image access
7. Acknowledge the warning about public access
8. Click "Create bucket"

## Step 3: Configure Bucket for Public Access
1. Go to your bucket
2. Click on "Permissions" tab
3. Scroll to "Bucket policy"
4. Add this policy (replace `YOUR-BUCKET-NAME` with your actual bucket name):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
```

## Step 4: Create IAM User
1. Navigate to IAM service in AWS Console
2. Click "Users" → "Add users"
3. Enter username (e.g., `blog-app-user`)
4. Select "Programmatic access"
5. Click "Next: Permissions"
6. Click "Attach policies directly"
7. Search for and select `AmazonS3FullAccess`
8. Click "Next" → "Create user"
9. **IMPORTANT**: Copy the Access Key ID and Secret Access Key

## Step 5: Update Environment Variables
Edit `apps/admin/.env.local`:

```env
AWS_S3_BUCKET_NAME=your-actual-bucket-name
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-actual-access-key-id
AWS_SECRET_ACCESS_KEY=your-actual-secret-access-key
```

## Step 6: Test the Integration
1. Restart your development server
2. Go to create/edit post page
3. Try uploading an image
4. Check if the image appears in your S3 bucket

## Security Notes
- Never commit your `.env.local` file to version control
- The IAM user should only have S3 permissions
- Consider using more restrictive S3 policies for production
- Monitor your AWS usage to avoid unexpected charges

## Troubleshooting
- If uploads fail, check AWS CloudWatch logs
- Verify bucket permissions and IAM user policies
- Ensure environment variables are correctly set
- Check if your region matches in all configurations
