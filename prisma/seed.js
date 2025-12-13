// import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient()
// async function main() {
//   await prisma.user.upsert({
//     where: { email: 'alice@example.com' },
//     update: {},
//     create: {
//       email: 'alice@example.com',
//       name: 'Alice Student',
//       password: '$2b$10$invalidhashforseedonly'
//     }
//   })
// }
// main().finally(() => prisma.$disconnect())
// import { PrismaClient } from '@prisma/client'
// import bcrypt from 'bcrypt'

// const prisma = new PrismaClient()
// async function main() {
//   const passwordHash = await bcrypt.hash('AdminPass123!', 10)
//   const admin = await prisma.user.upsert({
//     where: { email: 'admin@example.com' },
//     update: {},
//     create: {
//       email: 'admin@example.com',
//       name: 'Admin User',
//       password: passwordHash,
//       role: 'ADMIN'
//     }
//   })

//   const instructorHash = await bcrypt.hash('InstructorPass123!', 10)
//   const instructor = await prisma.user.upsert({
//     where: { email: 'instructor@example.com' },
//     update: {},
//     create: {
//       email: 'instructor@example.com',
//       name: 'Instructor User',
//       password: instructorHash,
//       role: 'INSTRUCTOR'
//     }
//   })

//   const course = await prisma.course.upsert({
//     where: { slug: 'intro-to-js' },
//     update: {},
//     create: {
//       title: 'Intro to JavaScript',
//       slug: 'intro-to-js',
//       description: 'Learn JS fundamentals',
//       ownerId: instructor.id,
//       modules: {
//         create: [
//           { title: 'Basics', content: 'Variables, types', order: 1 },
//           { title: 'Functions', content: 'Declaration, expression', order: 2 }
//         ]
//       }
//     },
//     include: { modules: true }
//   })

//   console.log({ admin: admin.email, instructor: instructor.email, course: course.title })
// }
// main()
//   .catch(e => { console.error(e); process.exit(1) })
//   .finally(async () => { await prisma.$disconnect() })
// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Hash passwords
  const adminPass = await bcrypt.hash('AdminPass123!', 10);
  const instructorPass = await bcrypt.hash('InstructorPass123!', 10);

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPass,
      role: 'ADMIN',
    },
  });

  // Create Instructor User
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@example.com' },
    update: {},
    create: {
      email: 'instructor@example.com',
      name: 'Instructor User',
      password: instructorPass,
      role: 'INSTRUCTOR',
    },
  });

  // Create Course + Modules
  const course = await prisma.course.upsert({
    where: { slug: 'intro-to-js' },
    update: {},
    create: {
      title: 'Intro to JavaScript',
      slug: 'intro-to-js',
      description: 'Learn JS fundamentals',
      ownerId: instructor.id,
      modules: {
        create: [
          { title: 'Basics', content: 'Variables, types', order: 1 },
          { title: 'Functions', content: 'Declaration, expression', order: 2 },
        ],
      },
    },
    include: { modules: true },
  });

  console.log({
    admin: admin.email,
    instructor: instructor.email,
    course: course.title,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
