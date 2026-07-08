import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const staffCount = await prisma.staff.count();
  if (staffCount === 0) {
    await prisma.staff.createMany({
      data: [
        {
          name: "Alex Rivera",
          vrchatUsername: "AlexVRC",
          rank: "Founder",
          bio: "Started Ur Gay Now to build a safe, joyful space for everyone. Loves late-night world hopping.",
          photoUrl: "/placeholder-avatar.svg",
          sortOrder: 1,
          socials: JSON.stringify([{ label: "Twitter", url: "https://twitter.com" }]),
        },
        {
          name: "Sam Patel",
          vrchatUsername: "SammyP",
          rank: "Admin",
          bio: "Keeps the lights on and the vibes immaculate. Event planner and resident DJ.",
          photoUrl: "/placeholder-avatar.svg",
          sortOrder: 2,
          socials: JSON.stringify([]),
        },
        {
          name: "Jordan Lee",
          vrchatUsername: "JordanL",
          rank: "Moderator",
          bio: "Friendly moderator here to help. Ask me anything!",
          photoUrl: "/placeholder-avatar.svg",
          sortOrder: 3,
          socials: JSON.stringify([]),
        },
      ],
    });
    console.log("Seeded staff");
  }

  const annCount = await prisma.announcement.count();
  if (annCount === 0) {
    await prisma.announcement.create({
      data: {
        title: "Welcome to the new Ur Gay Now website!",
        slug: "welcome-to-the-new-site",
        excerpt: "Our official community hub is live. Find announcements, events, rules, and more.",
        content:
          "## We're live! 🎉\n\nWelcome to the brand new **Ur Gay Now** website — your one-stop hub for everything community.\n\n- 📣 Latest announcements\n- 📅 Upcoming events\n- 📖 Rules & guides\n- 👥 Meet the staff\n\nMore updates coming soon. Stay proud! 🏳️‍🌈",
        published: true,
        publishedAt: new Date(),
      },
    });
    console.log("Seeded announcements");
  }

  const eventCount = await prisma.event.count();
  if (eventCount === 0) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    await prisma.event.create({
      data: {
        title: "Community Hangout Night",
        description: "Join us for a relaxed hangout with music, games, and good company. All are welcome!",
        location: "Ur Gay Now VRChat Group",
        vrchatWorldUrl: "https://vrchat.com/home",
        startDateTime: nextWeek,
        published: true,
      },
    });
    console.log("Seeded events");
  }

  const ruleCount = await prisma.rule.count();
  if (ruleCount === 0) {
    await prisma.rule.createMany({
      data: [
        {
          category: "Respect",
          title: "Be kind and respectful",
          content: "Treat everyone with kindness. Harassment, hate speech, or discrimination of any kind is not tolerated.",
          sortOrder: 1,
        },
        {
          category: "Safety",
          title: "No sharing personal info",
          content: "Protect your privacy and others'. Don't share real-life personal details without consent.",
          sortOrder: 2,
        },
        {
          category: "Fun",
          title: "Keep it inclusive",
          content: "This is a welcoming, LGBTQ+ friendly space. Let people be exactly who they are.",
          sortOrder: 3,
        },
      ],
    });
    console.log("Seeded rules");
  }

  const guideCount = await prisma.guide.count();
  if (guideCount === 0) {
    await prisma.guide.createMany({
      data: [
        {
          category: "Getting Started",
          question: "How do I join the community?",
          answer: "Hop into our [Discord](https://discord.com) and say hi! You can also find us in VRChat by searching the group name.",
          sortOrder: 1,
        },
        {
          category: "Getting Started",
          question: "Do I need VRChat to participate?",
          answer: "Not at all! Many members connect through Discord. VRChat is just one of the ways we hang out.",
          sortOrder: 2,
        },
      ],
    });
    console.log("Seeded guides");
  }

  const linkCount = await prisma.link.count();
  if (linkCount === 0) {
    await prisma.link.createMany({
      data: [
        { label: "Twitch", url: "https://twitch.tv", icon: "🎮", sortOrder: 1 },
        { label: "YouTube", url: "https://youtube.com", icon: "▶️", sortOrder: 2 },
        { label: "TikTok", url: "https://tiktok.com", icon: "🎵", sortOrder: 3 },
      ],
    });
    console.log("Seeded links");
  }

  console.log("Seed complete ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
