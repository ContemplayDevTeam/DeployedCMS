import { NextRequest, NextResponse } from 'next/server'
import { AirtableBackend } from '@/lib/airtable'

// GET - Fetch notifications
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.AIRTABLE_API_KEY
    const baseId = process.env.AIRTABLE_BASE_ID

    if (!apiKey || !baseId) {
      return NextResponse.json(
        { error: 'Airtable configuration missing' },
        { status: 500 }
      )
    }

    const airtable = new AirtableBackend(apiKey, baseId)
    const notifications = await airtable.getNotifications(email, unreadOnly)

    return NextResponse.json({
      success: true,
      notifications
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const { email, type, title, message, relatedImageId, relatedImageUrl } = await request.json()

    if (!email || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Email, type, title, and message are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.AIRTABLE_API_KEY
    const baseId = process.env.AIRTABLE_BASE_ID

    if (!apiKey || !baseId) {
      return NextResponse.json(
        { error: 'Airtable configuration missing' },
        { status: 500 }
      )
    }

    const airtable = new AirtableBackend(apiKey, baseId)
    const notification = await airtable.createNotification(email, {
      type,
      title,
      message,
      relatedImageId,
      relatedImageUrl
    })

    return NextResponse.json({
      success: true,
      notification
    })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

// PATCH - Mark notification(s) as read
export async function PATCH(request: NextRequest) {
  try {
    const { email, notificationId, markAllAsRead } = await request.json()

    const apiKey = process.env.AIRTABLE_API_KEY
    const baseId = process.env.AIRTABLE_BASE_ID

    if (!apiKey || !baseId) {
      return NextResponse.json(
        { error: 'Airtable configuration missing' },
        { status: 500 }
      )
    }

    const airtable = new AirtableBackend(apiKey, baseId)

    if (markAllAsRead && email) {
      await airtable.markAllNotificationsAsRead(email)
      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read'
      })
    } else if (notificationId) {
      await airtable.markNotificationAsRead(notificationId)
      return NextResponse.json({
        success: true,
        message: 'Notification marked as read'
      })
    } else {
      return NextResponse.json(
        { error: 'Either notificationId or markAllAsRead with email is required' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    )
  }
}
