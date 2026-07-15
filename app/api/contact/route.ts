import { NextResponse } from 'next/server';
import { sendContactFormEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { first_name, last_name, email_address, phone_number, message } = data;

    if (!first_name || !last_name || !email_address || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await prisma.contactSubmission.create({
      data: {
        firstName: first_name,
        lastName: last_name,
        email: email_address,
        phone: phone_number || null,
        message: message,
      }
    });

    await sendContactFormEmail(first_name, last_name, email_address, phone_number || '', message);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
