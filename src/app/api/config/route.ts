import { NextResponse } from 'next/server'

export async function GET() {
  const isPasswordRequired = !!process.env.PASSWORDS
  return NextResponse.json({ isPasswordRequired })
}
