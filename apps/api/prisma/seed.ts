import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SEED_PASSWORD = 'Pathwise123!';

async function main() {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pathwise.dev' },
    update: {
      name: 'Pathwise Admin',
      passwordHash,
      role: 'ADMIN',
    },
    create: {
      name: 'Pathwise Admin',
      email: 'admin@pathwise.dev',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'alex@pathwise.dev' },
    update: {
      name: 'Alex R.',
      passwordHash,
    },
    create: {
      name: 'Alex R.',
      email: 'alex@pathwise.dev',
      passwordHash,
      bootcampProfile: {
        create: {
          rank: 12,
          points: 340,
        },
      },
    },
    include: { bootcampProfile: true },
  });

  const javascriptCore = await prisma.course.upsert({
    where: { slug: 'javascript-core' },
    update: {
      title: 'JavaScript Core',
      description:
        'Master variables, functions, arrays, and async patterns with hands-on markdown lessons.',
      icon: 'code',
      trackKey: 'web',
      sortOrder: 1,
    },
    create: {
      slug: 'javascript-core',
      title: 'JavaScript Core',
      description:
        'Master variables, functions, arrays, and async patterns with hands-on markdown lessons.',
      icon: 'code',
      trackKey: 'web',
      sortOrder: 1,
    },
  });

  const interviewBranding = await prisma.course.upsert({
    where: { slug: 'interview-branding' },
    update: {
      title: 'Interview & Personal Branding',
      description: 'Build a standout portfolio, resume, and interview story that gets you hired.',
      icon: 'briefcase',
      trackKey: 'web',
      sortOrder: 2,
    },
    create: {
      slug: 'interview-branding',
      title: 'Interview & Personal Branding',
      description: 'Build a standout portfolio, resume, and interview story that gets you hired.',
      icon: 'briefcase',
      trackKey: 'web',
      sortOrder: 2,
    },
  });

  const jsLessons = [
    {
      slug: 'variables-and-types',
      title: 'Variables & Types',
      durationMin: 12,
      sortOrder: 1,
      content: `# Variables & Types

Learn how JavaScript stores data with \`let\`, \`const\`, and primitive types.

## Key concepts
- \`const\` for values that should not be reassigned
- \`let\` for values that change over time
- typeof checks for runtime type inspection

## Practice
Declare a \`const\` for your name and a \`let\` counter starting at zero.`,
    },
    {
      slug: 'functions-and-scope',
      title: 'Functions & Scope',
      durationMin: 15,
      sortOrder: 2,
      content: `# Functions & Scope

Functions encapsulate logic. Scope determines where variables are visible.

## Key concepts
- Function declarations vs arrow functions
- Block scope with \`let\`/\`const\`
- Returning values from functions

## Practice
Write a function \`greet(name)\` that returns \`Hello, ${'${name}'}!\`.`,
    },
    {
      slug: 'async-await',
      title: 'Async/Await',
      durationMin: 18,
      sortOrder: 3,
      content: `# Async/Await

Modern JavaScript uses Promises and \`async/await\` for non-blocking I/O.

## Key concepts
- Promises represent future values
- \`async\` functions always return a Promise
- \`await\` pauses until a Promise settles

## Practice
Fetch JSON from an API and log the first item.`,
    },
  ];

  for (const lesson of jsLessons) {
    await prisma.lesson.upsert({
      where: {
        courseId_slug: {
          courseId: javascriptCore.id,
          slug: lesson.slug,
        },
      },
      update: {
        title: lesson.title,
        content: lesson.content,
        durationMin: lesson.durationMin,
        sortOrder: lesson.sortOrder,
      },
      create: {
        courseId: javascriptCore.id,
        ...lesson,
      },
    });
  }

  const brandingLessons = [
    {
      slug: 'portfolio-story',
      title: 'Portfolio Story',
      durationMin: 14,
      sortOrder: 1,
      content: `# Portfolio Story

Your portfolio should tell a clear story: who you are, what you build, and why it matters.

## Checklist
- Hero section with role + value proposition
- 2–3 featured projects with outcomes
- Contact link and GitHub profile`,
    },
    {
      slug: 'interview-framework',
      title: 'Interview Framework',
      durationMin: 16,
      sortOrder: 2,
      content: `# Interview Framework

Use STAR (Situation, Task, Action, Result) to answer behavioral questions.

## Tips
- Lead with impact, not tools
- Quantify results when possible
- Prepare 3 project deep-dives`,
    },
  ];

  for (const lesson of brandingLessons) {
    await prisma.lesson.upsert({
      where: {
        courseId_slug: {
          courseId: interviewBranding.id,
          slug: lesson.slug,
        },
      },
      update: {
        title: lesson.title,
        content: lesson.content,
        durationMin: lesson.durationMin,
        sortOrder: lesson.sortOrder,
      },
      create: {
        courseId: interviewBranding.id,
        ...lesson,
      },
    });
  }

  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: javascriptCore.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      courseId: javascriptCore.id,
    },
  });

  const entitlements = [
    { resourceType: 'readiness', resourceId: 'test', source: 'PURCHASE' as const },
    { resourceType: 'course', resourceId: 'javascript-core', source: 'FREE' as const },
  ];

  for (const entitlement of entitlements) {
    await prisma.entitlement.upsert({
      where: {
        userId_resourceType_resourceId: {
          userId: user.id,
          resourceType: entitlement.resourceType,
          resourceId: entitlement.resourceId,
        },
      },
      update: { source: entitlement.source },
      create: {
        userId: user.id,
        resourceType: entitlement.resourceType,
        resourceId: entitlement.resourceId,
        source: entitlement.source,
      },
    });
  }

  const now = new Date();
  const challengeEndsAt = new Date(now);
  challengeEndsAt.setDate(challengeEndsAt.getDate() + 30);

  await prisma.challenge.upsert({
    where: { slug: 'fizzbuzz' },
    update: {
      title: 'FizzBuzz Challenge',
      description:
        'Write a function that returns "Fizz" for multiples of 3, "Buzz" for multiples of 5, and "FizzBuzz" for both.',
      points: 120,
      startsAt: now,
      endsAt: challengeEndsAt,
      active: true,
      starterCode: `function fizzBuzz(n) {
  // Return "Fizz", "Buzz", "FizzBuzz", or the number as a string
}`,
    },
    create: {
      slug: 'fizzbuzz',
      title: 'FizzBuzz Challenge',
      description:
        'Write a function that returns "Fizz" for multiples of 3, "Buzz" for multiples of 5, and "FizzBuzz" for both.',
      points: 120,
      startsAt: now,
      endsAt: challengeEndsAt,
      active: true,
      starterCode: `function fizzBuzz(n) {
  // Return "Fizz", "Buzz", "FizzBuzz", or the number as a string
}`,
    },
  });

  console.log(`Seeded admin user: ${admin.name} (${admin.email})`);
  console.log(`  Password: ${SEED_PASSWORD}`);
  console.log(`Seeded default user: ${user.name} (${user.id})`);
  console.log(`  Password: ${SEED_PASSWORD}`);
  console.log(`Seeded courses: javascript-core, interview-branding`);
  console.log(`Seeded challenge: fizzbuzz`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
