import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '@repo/env/admin';

const s3Client = new S3Client({
  region: env.AWS_S3_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(request: NextRequest) {
  console.log('Upload API called');
  try {
    console.log('Parsing form data...');
    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.log('File received:', file ? file.name : 'No file');
    if (!file) {
      console.log('No file provided in request');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }    // Generate a unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `posts/${timestamp}-${sanitizedFileName}`;

    console.log('Generated filename:', fileName);
    console.log('File size:', file.size);
    console.log('File type:', file.type);

    // Convert file to buffer
    console.log('Converting file to buffer...');
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log('Buffer size:', buffer.length);

    // Upload to S3
    console.log('Creating S3 command...');
    console.log('Bucket:', env.AWS_S3_BUCKET_NAME);
    console.log('Region:', env.AWS_S3_REGION);
      const command = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      // Removed ACL: 'public-read' since bucket doesn't allow ACLs
    });

    console.log('Uploading to S3...');
    await s3Client.send(command);
    console.log('S3 upload successful');

    // Generate the public URL
    const imageUrl = `https://${env.AWS_S3_BUCKET_NAME}.s3.${env.AWS_S3_REGION}.amazonaws.com/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      imageUrl: imageUrl,
      fileName: fileName 
    });
  } catch (error) {
    console.error('Error uploading to S3:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return NextResponse.json(
      { error: 'Failed to upload image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Generate a presigned URL for direct upload (alternative method)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');
    const fileType = searchParams.get('fileType');

    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'fileName and fileType are required' }, { status: 400 });
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `posts/${timestamp}-${sanitizedFileName}`;    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      // Removed ACL: 'public-read' since bucket doesn't allow ACLs
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes

    const imageUrl = `https://${env.AWS_S3_BUCKET_NAME}.s3.${env.AWS_S3_REGION}.amazonaws.com/${key}`;

    return NextResponse.json({
      signedUrl,
      imageUrl,
      key
    });

  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
