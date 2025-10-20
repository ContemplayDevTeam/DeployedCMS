require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  const email = 'ben@contemplay.ai'
  const password = 'Ftbllooa2$'

  console.log('🔐 Creating admin account...')

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Check if admin already exists
    const existing = await prisma.user.findUnique({
      where: { email }
    })

    if (existing) {
      console.log('✅ Admin already exists, updating password...')
      const existingPrefs = existing.preferences || {}
      await prisma.user.update({
        where: { email },
        data: {
          preferences: {
            ...existingPrefs,
            hashedPassword,
            isAdmin: true,
            workspaceCode: 'admin'
          }
        }
      })
      console.log('✅ Admin password updated!')
    } else {
      console.log('🆕 Creating new admin account...')
      await prisma.user.create({
        data: {
          firebaseUid: `admin_${Date.now()}`,
          email,
          preferences: {
            hashedPassword,
            isAdmin: true,
            workspaceCode: 'admin',
            accountSetupComplete: true
          }
        }
      })
      console.log('✅ Admin account created!')
    }

    console.log(`
✅ Admin account ready:
   Email: ${email}
   Password: ${password}
   Status: Super Admin
`)

  } catch (error) {
    console.error('❌ Error creating admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
