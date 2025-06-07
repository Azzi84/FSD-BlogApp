import { NextResponse } from 'next/server';
import { env } from '@repo/env/admin';

export async function GET() {
  console.log('Test endpoint called');
  console.log('Environment variables check:');
  console.log('AWS_S3_BUCKET_NAME:', env.AWS_S3_BUCKET_NAME);
  console.log('AWS_S3_REGION:', env.AWS_S3_REGION);
  console.log('AWS_ACCESS_KEY_ID:', env.AWS_ACCESS_KEY_ID ? 'Present' : 'Missing');
  console.log('AWS_SECRET_ACCESS_KEY:', env.AWS_SECRET_ACCESS_KEY ? 'Present' : 'Missing');

  return NextResponse.json({
    bucket: env.AWS_S3_BUCKET_NAME,
    region: env.AWS_S3_REGION,
    accessKeyPresent: !!env.AWS_ACCESS_KEY_ID,
    secretKeyPresent: !!env.AWS_SECRET_ACCESS_KEY
  });
}
