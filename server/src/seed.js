const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const SkillProfile = require('./models/SkillProfile');
const SkillExchange = require('./models/SkillExchange');
const SkillStudio = require('./models/SkillStudio');
const Resource = require('./models/Resource');
const Project = require('./models/Project');
const Review = require('./models/Review');
const Notification = require('./models/Notification');
const DirectMessage = require('./models/DirectMessage');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillx_db';

async function seedDatabase(exitOnComplete = true) {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('Connecting to MongoDB at:', MONGO_URI);
      await mongoose.connect(MONGO_URI);
    }
    console.log('Connected! Clearing existing collections...');

    await Promise.all([
      User.deleteMany({}),
      SkillProfile.deleteMany({}),
      SkillExchange.deleteMany({}),
      SkillStudio.deleteMany({}),
      Resource.deleteMany({}),
      Project.deleteMany({}),
      Review.deleteMany({}),
      Notification.deleteMany({}),
      DirectMessage.deleteMany({})
    ]);

    console.log('Hashing passwords...');
    const defaultPassword = 'Password123!';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    // 1. Create Seed Users
    const usersData = [
      {
        username: 'alex_codes',
        email: 'alex@skillx.dev',
        displayName: 'Alex Rivers',
        avatar: { category: 'cute', id: 'cute-fox' },
        tagline: 'Frontend Architect & React Enthusiast',
        bio: 'Building modern interfaces with React, TypeScript, and clean CSS. Looking to master design systems and Figma.',
        location: 'San Francisco, CA',
        languages: ['English', 'Spanish'],
        onboardingCompleted: true,
        onboardingAnswers: {
          q1SkillWish: 'Figma and Design Systems',
          q2BiggestChallenge: 'Translating complex state trees into intuitive visual cues',
          q3BestProject: 'Building a micro-frontend component registry',
          q4LearningHelper: 'Someone who gives practical examples',
          q5Aspiration: 'Build seamless accessible web experiences with world-class design'
        }
      },
      {
        username: 'cyber_nova',
        email: 'nova@skillx.dev',
        displayName: 'Nova Chen',
        avatar: { category: 'technical', id: 'tech-cyber-1' },
        tagline: 'Offensive Security & Network Defense',
        bio: 'Ethical hacker and Linux kernel explorer. Excited to exchange cybersecurity and network defense for Python automation.',
        location: 'Seattle, WA',
        languages: ['English', 'Mandarin'],
        onboardingCompleted: true,
        onboardingAnswers: {
          q1SkillWish: 'Python backend scripting for security tools',
          q2BiggestChallenge: 'Reverse-engineering proprietary network protocols',
          q3BestProject: 'Constructing an intrusion detection honeynet',
          q4LearningHelper: 'Someone who challenges me',
          q5Aspiration: 'Build autonomous defensive monitoring toolkits for open-source communities'
        }
      },
      {
        username: 'designfox',
        email: 'elena@skillx.dev',
        displayName: 'Elena Rostova',
        avatar: { category: 'creative', id: 'creative-artisan' },
        tagline: 'Principal Product Designer & UX Strategist',
        bio: 'Figma wizard with 6+ years designing user flows and design tokens. Wanting to learn React to bring my prototypes to life.',
        location: 'Berlin, Germany',
        languages: ['English', 'German'],
        onboardingCompleted: true,
        onboardingAnswers: {
          q1SkillWish: 'React and component lifecycle',
          q2BiggestChallenge: 'Developer handoffs and keeping tokens in sync',
          q3BestProject: 'Designing an enterprise data visualization dashboard system',
          q4LearningHelper: 'Someone who explains visually',
          q5Aspiration: 'Code my own production-grade interactive design systems'
        }
      },
      {
        username: 'python_master',
        email: 'harsha@skillx.dev',
        displayName: 'Harsha Vardhan',
        avatar: { category: 'technical', id: 'tech-wizard' },
        tagline: 'Python Specialist & Backend Craftsman',
        bio: 'Python and Flask specialist with strong data structure foundations. Eager to master Cybersecurity and network fundamentals.',
        location: 'Austin, TX',
        languages: ['English', 'Hindi', 'Telugu'],
        onboardingCompleted: true,
        onboardingAnswers: {
          q1SkillWish: 'Cybersecurity and Network Penetration Testing',
          q2BiggestChallenge: 'Understanding network socket vulnerabilities and memory overflow exploits',
          q3BestProject: 'Designing high-throughput asynchronous ETL pipeline in Python',
          q4LearningHelper: 'Someone who explains step-by-step',
          q5Aspiration: 'Architect ultra-secure cloud backend services'
        }
      },
      {
        username: 'cloud_sarah',
        email: 'sarah@skillx.dev',
        displayName: 'Sarah Miller',
        avatar: { category: 'nature', id: 'nature-leaf' },
        tagline: 'Cloud DevOps & Container Architect',
        bio: 'Docker, Kubernetes, and Terraform enthusiast. Seeking to learn Golang and Rust for cloud-native tooling.',
        location: 'Toronto, Canada',
        languages: ['English', 'French'],
        onboardingCompleted: true,
        onboardingAnswers: {
          q1SkillWish: 'Golang concurrency models',
          q2BiggestChallenge: 'Debugging multi-region Kubernetes ingress routing',
          q3BestProject: 'Zero-downtime migration of a legacy monolithic stack to k8s',
          q4LearningHelper: 'Someone who lets me experiment',
          q5Aspiration: 'Create open-source container monitoring CLI tools'
        }
      }
    ];

    const users = [];
    for (const u of usersData) {
      const user = await User.create({
        ...u,
        passwordHash,
        security: {
          activeSessions: [{
            sessionId: 'sample-session-' + u.username,
            device: 'Desktop Browser (Chrome / Windows)',
            ip: '192.168.1.1',
            lastActive: new Date()
          }],
          loginHistory: [{
            timestamp: new Date(),
            device: 'Desktop Browser (Chrome / Windows)',
            ip: '192.168.1.1',
            status: 'success'
          }]
        }
      });
      users.push(user);
    }

    const [alex, nova, elena, harsha, sarah] = users;

    // 2. Create SkillProfiles with realistic badges & verification
    const alexProfile = await SkillProfile.create({
      userId: alex._id,
      skillsTeaching: [
        { name: 'JavaScript', category: 'Software Development', level: 'Advanced', yearsExperience: 4, verificationStatus: 'Peer-Verified', verifiedByCount: 3 },
        { name: 'React', category: 'Software Development', level: 'Advanced', yearsExperience: 3, verificationStatus: 'Peer-Verified', verifiedByCount: 4 },
        { name: 'Node.js', category: 'Software Development', level: 'Intermediate', yearsExperience: 2, verificationStatus: 'Self-Declared', verifiedByCount: 1 }
      ],
      skillsLearning: [
        { name: 'UI/UX', category: 'Design & UI/UX', targetLevel: 'Intermediate', priority: 'High', preferredFormat: ['Whiteboard', 'Voice'] },
        { name: 'Figma', category: 'Design & UI/UX', targetLevel: 'Advanced', priority: 'High', preferredFormat: ['Whiteboard', 'Voice'] }
      ],
      stats: { skillsTaught: 3, skillsLearned: 2, exchangesCompleted: 4, projectsCompleted: 2, teachingHours: 8, learningHours: 7 }
    });

    const novaProfile = await SkillProfile.create({
      userId: nova._id,
      skillsTeaching: [
        { name: 'Cybersecurity', category: 'Security', level: 'Expert', yearsExperience: 6, verificationStatus: 'Peer-Verified', verifiedByCount: 5 },
        { name: 'Linux', category: 'Security', level: 'Advanced', yearsExperience: 5, verificationStatus: 'Peer-Verified', verifiedByCount: 3 },
        { name: 'Networking', category: 'Security', level: 'Advanced', yearsExperience: 4, verificationStatus: 'Self-Declared', verifiedByCount: 1 }
      ],
      skillsLearning: [
        { name: 'Python', category: 'Software Development', targetLevel: 'Intermediate', priority: 'High', preferredFormat: ['Code', 'Voice'] },
        { name: 'Automation', category: 'Software Development', targetLevel: 'Intermediate', priority: 'Medium', preferredFormat: ['Code', 'Whiteboard'] }
      ],
      stats: { skillsTaught: 3, skillsLearned: 2, exchangesCompleted: 5, projectsCompleted: 2, teachingHours: 10, learningHours: 8 }
    });

    const elenaProfile = await SkillProfile.create({
      userId: elena._id,
      skillsTeaching: [
        { name: 'Figma', category: 'Design & UI/UX', level: 'Expert', yearsExperience: 6, verificationStatus: 'Peer-Verified', verifiedByCount: 6 },
        { name: 'UI/UX', category: 'Design & UI/UX', level: 'Expert', yearsExperience: 5, verificationStatus: 'Peer-Verified', verifiedByCount: 5 },
        { name: 'Design Systems', category: 'Design & UI/UX', level: 'Advanced', yearsExperience: 4, verificationStatus: 'Project-Demonstrated', verifiedByCount: 2 }
      ],
      skillsLearning: [
        { name: 'React', category: 'Software Development', targetLevel: 'Intermediate', priority: 'High', preferredFormat: ['Code', 'Whiteboard'] },
        { name: 'CSS Architecture', category: 'Software Development', targetLevel: 'Advanced', priority: 'Medium', preferredFormat: ['Code'] }
      ],
      stats: { skillsTaught: 3, skillsLearned: 2, exchangesCompleted: 6, projectsCompleted: 3, teachingHours: 12, learningHours: 10 }
    });

    const harshaProfile = await SkillProfile.create({
      userId: harsha._id,
      skillsTeaching: [
        { name: 'Python', category: 'Software Development', level: 'Expert', yearsExperience: 6, verificationStatus: 'Peer-Verified', verifiedByCount: 7 },
        { name: 'Flask', category: 'Software Development', level: 'Advanced', yearsExperience: 4, verificationStatus: 'Peer-Verified', verifiedByCount: 4 },
        { name: 'Git', category: 'Software Development', level: 'Intermediate', yearsExperience: 3, verificationStatus: 'Project-Demonstrated', verifiedByCount: 2 }
      ],
      skillsLearning: [
        { name: 'Cybersecurity', category: 'Security', targetLevel: 'Intermediate', priority: 'High', preferredFormat: ['Whiteboard', 'Voice'] },
        { name: 'Networking', category: 'Security', targetLevel: 'Intermediate', priority: 'High', preferredFormat: ['Whiteboard', 'Code'] },
        { name: 'Cloud Security', category: 'Security', targetLevel: 'Elementary', priority: 'Medium', preferredFormat: ['Whiteboard', 'Voice'] }
      ],
      stats: { skillsTaught: 3, skillsLearned: 3, exchangesCompleted: 5, projectsCompleted: 2, teachingHours: 11, learningHours: 9 }
    });

    const sarahProfile = await SkillProfile.create({
      userId: sarah._id,
      skillsTeaching: [
        { name: 'Docker', category: 'Cloud & DevOps', level: 'Advanced', yearsExperience: 4, verificationStatus: 'Peer-Verified', verifiedByCount: 4 },
        { name: 'Kubernetes', category: 'Cloud & DevOps', level: 'Intermediate', yearsExperience: 2, verificationStatus: 'Self-Declared', verifiedByCount: 1 },
        { name: 'CI/CD Pipelines', category: 'Cloud & DevOps', level: 'Advanced', yearsExperience: 3, verificationStatus: 'Project-Demonstrated', verifiedByCount: 2 }
      ],
      skillsLearning: [
        { name: 'Python', category: 'Software Development', targetLevel: 'Intermediate', priority: 'High', preferredFormat: ['Code', 'Voice'] },
        { name: 'Linux', category: 'Security', targetLevel: 'Intermediate', priority: 'Medium', preferredFormat: ['Whiteboard', 'Code'] }
      ],
      stats: { skillsTaught: 3, skillsLearned: 2, exchangesCompleted: 3, projectsCompleted: 1, teachingHours: 6, learningHours: 5 }
    });

    console.log('Skill profiles created.');

    // 3. Create Exchanges:
    // Exchange 1: Harsha (Python) ↔ Nova (Cybersecurity) [Active with Skill Studio!]
    const exchange1 = await SkillExchange.create({
      requesterId: harsha._id,
      recipientId: nova._id,
      offeredSkill: { name: 'Python', category: 'Software Development' },
      requestedSkill: { name: 'Cybersecurity', category: 'Security' },
      preferredFormat: 'Mixed',
      message: "Hey Nova! I'd love to teach you advanced Python and async tooling in exchange for foundational cybersecurity and network penetration fundamentals.",
      status: 'accepted'
    });

    // Create Skill Studio for Exchange 1
    const studio1 = await SkillStudio.create({
      exchangeId: exchange1._id,
      title: 'Python ↔ Cybersecurity Studio',
      topicSkillTeach: 'Python',
      topicSkillLearn: 'Cybersecurity',
      participants: [
        { userId: harsha._id, role: 'host', isOnline: true },
        { userId: nova._id, role: 'participant', isOnline: true }
      ],
      status: 'active',
      sessionSettings: {
        whiteboardPermission: 'everyone',
        codePermission: 'everyone',
        uploadPermission: 'everyone',
        screenSharePermission: 'everyone',
        cameraAllowed: true,
        voiceAllowed: true
      },
      whiteboardElements: [
        {
          id: 'wb-stroke-1',
          type: 'line',
          points: [{ x: 120, y: 150 }, { x: 260, y: 150 }],
          color: '#D4AF37',
          width: 3
        },
        {
          id: 'wb-text-1',
          type: 'text',
          x: 130,
          y: 110,
          text: 'Threat Model vs Socket Server',
          color: '#FFFFFF',
          fontSize: 18
        },
        {
          id: 'wb-rect-1',
          type: 'rect',
          x: 100,
          y: 80,
          width: 320,
          height: 180,
          color: '#D4AF37',
          fill: 'rgba(212, 175, 55, 0.08)'
        }
      ],
      codeSpace: {
        language: 'python',
        code: `# Skill Studio: Python Security Tooling
import socket
import sys

def probe_port(target_host, port):
    """
    Demonstrating a clean non-blocking TCP socket probe.
    Notice how Python's socket interface maps directly to OS syscalls.
    """
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1.0)
        result = sock.connect_ex((target_host, port))
        if result == 0:
            print(f"[+] Port {port} is OPEN on {target_host}")
        else:
            print(f"[-] Port {port} is closed")
        sock.close()
    except Exception as exc:
        print(f"[!] Error inspecting port {port}: {exc}")

if __name__ == '__main__':
    probe_port('127.0.0.1', 8080)
`
      },
      chatMessages: [
        {
          senderId: harsha._id,
          senderName: harsha.displayName,
          senderUsername: harsha.username,
          senderAvatar: harsha.avatar,
          text: "Welcome to our Skill Studio, Nova! I've loaded the initial Python socket scanner snippet in the Code Space.",
          createdAt: new Date(Date.now() - 3600000)
        },
        {
          senderId: nova._id,
          senderName: nova.displayName,
          senderUsername: nova.username,
          senderAvatar: nova.avatar,
          text: "Awesome! I'll walk you through how packet headers interact with OS firewall buffers right on the whiteboard.",
          createdAt: new Date(Date.now() - 3400000)
        }
      ]
    });

    exchange1.studioId = studio1._id;
    await exchange1.save();

    // Add shared resources to Studio 1 with explicit uploader attribution
    await Resource.create({
      studioId: studio1._id,
      exchangeId: exchange1._id,
      uploaderId: nova._id,
      uploaderUsername: nova.username,
      uploaderDisplayName: nova.displayName,
      uploaderAvatar: nova.avatar,
      originalName: 'Network_Defense_Fundamentals.pdf',
      storedFilename: '1727600000000-Network_Defense_Fundamentals.pdf',
      fileType: 'PDF',
      mimeType: 'application/pdf',
      sizeBytes: 2457600, // 2.4 MB
      storagePath: 'uploads/sample-network-defense.pdf',
      description: 'Comprehensive network defense notes covering TCP/IP handshake, OSI model, and firewall rule configurations.'
    });

    await Resource.create({
      studioId: studio1._id,
      exchangeId: exchange1._id,
      uploaderId: harsha._id,
      uploaderUsername: harsha.username,
      uploaderDisplayName: harsha.displayName,
      uploaderAvatar: harsha.avatar,
      originalName: 'Python_Socket_Security_Guide.py',
      storedFilename: '1727600001000-Python_Socket_Security_Guide.py',
      fileType: 'CODE',
      mimeType: 'text/x-python',
      sizeBytes: 14200,
      storagePath: 'uploads/sample-python-sockets.py',
      description: 'Clean asynchronous socket handler code for port scanning and safe banner grabbing.'
    });

    // Exchange 2: Alex (React) ↔ Elena (UI/UX, Figma) [Completed with Reviews & Project!]
    const exchange2 = await SkillExchange.create({
      requesterId: alex._id,
      recipientId: elena._id,
      offeredSkill: { name: 'React', category: 'Software Development' },
      requestedSkill: { name: 'UI/UX', category: 'Design & UI/UX' },
      preferredFormat: 'Whiteboard',
      message: "Hey Elena! Let's team up. I can guide you through React component lifecycles, and I would love your feedback and coaching on design tokens.",
      status: 'completed',
      completionDetails: {
        completedAt: new Date(Date.now() - 86400000 * 2),
        durationMinutes: 90,
        requesterConfirmed: true,
        recipientConfirmed: true
      }
    });

    // 4. Create Collaborative Project between Alex & Elena
    const project1 = await Project.create({
      title: 'Design System Token Bridge',
      description: 'A shared design-system workflow synchronizing Figma variable tokens directly into React Tailwind utility variables with automatic contrast checks.',
      exchangeId: exchange2._id,
      participants: [
        { userId: alex._id, role: 'Lead Frontend Developer', skillsContributed: ['React', 'JavaScript', 'CSS'] },
        { userId: elena._id, role: 'Lead UI/UX Designer', skillsContributed: ['Figma', 'UI/UX', 'Design Systems'] }
      ],
      skillsUsed: ['React', 'Figma', 'UI/UX', 'JavaScript', 'Design Systems'],
      status: 'completed',
      githubUrl: 'https://github.com/skillx-community/design-token-bridge',
      liveUrl: 'https://token-bridge-demo.skillx.dev',
      notes: 'Built during our skill exchange sessions. Demonstrated real-time token synchronization across design and code.',
      privacy: 'public',
      completedAt: new Date(Date.now() - 86400000 * 2)
    });

    // 5. Create Peer Reviews between Alex & Elena
    await Review.create({
      exchangeId: exchange2._id,
      reviewerId: elena._id,
      recipientId: alex._id,
      skillTaught: 'React',
      appreciationChips: [
        '✨ Explained clearly',
        '🧠 Made difficult concepts easier',
        '🚀 Helped me build something',
        '🤝 Easy to collaborate with'
      ],
      personalNote: 'Alex broke down React state and hooks so intuitively! We built our design token bridge in just two sessions. Outstanding peer teacher.',
      visibility: 'public'
    });

    await Review.create({
      exchangeId: exchange2._id,
      reviewerId: alex._id,
      recipientId: elena._id,
      skillTaught: 'UI/UX',
      appreciationChips: [
        '💡 Shared useful knowledge',
        '✨ Explained clearly',
        '💬 Communicated well',
        '⏱ Respectful of time'
      ],
      personalNote: 'Elena has master-level knowledge of visual hierarchy, spacing, and design systems. My frontend code looks 10x more polished now.',
      visibility: 'public'
    });

    // Exchange 3: Pending Proposal from Sarah to Harsha
    await SkillExchange.create({
      requesterId: sarah._id,
      recipientId: harsha._id,
      offeredSkill: { name: 'Docker', category: 'Cloud & DevOps' },
      requestedSkill: { name: 'Python', category: 'Software Development' },
      preferredFormat: 'Code',
      message: 'Hi Harsha! I noticed your mastery in Python. I would love to learn Python scripting for automation, and can teach you Docker multi-stage container optimization.',
      status: 'pending'
    });

    // Create notifications for users
    await Notification.create({
      recipientId: harsha._id,
      senderId: sarah._id,
      type: 'exchange_request',
      title: 'New Skill Exchange Proposal',
      message: '@cloud_sarah wants to exchange skills: Teach Docker ↔ Learn Python.',
      link: '/exchanges'
    });

    await Notification.create({
      recipientId: harsha._id,
      senderId: nova._id,
      type: 'exchange_accepted',
      title: 'Exchange Accepted! 🚀',
      message: '@cyber_nova accepted your skill exchange! Your Skill Studio is active.',
      link: `/studio/${studio1._id}`
    });

    // Seed Direct Messages between peers
    console.log('Seeding Direct Messages...');
    await DirectMessage.create([
      {
        senderId: nova._id,
        recipientId: harsha._id,
        text: 'Hey Harsha! Excited about our Python ↔ Cybersecurity exchange. Ready when you are!',
        isRead: true,
        readAt: new Date(Date.now() - 3600000 * 2)
      },
      {
        senderId: harsha._id,
        recipientId: nova._id,
        text: 'Hey Nova! Awesome, I have already set up a basic script demo in the studio for packet analysis.',
        isRead: true,
        readAt: new Date(Date.now() - 3600000 * 1.5)
      },
      {
        senderId: nova._id,
        recipientId: harsha._id,
        text: 'Sounds great. Let us do a quick sync tonight to review the socket structures.',
        isRead: false
      },
      {
        senderId: elena._id,
        recipientId: alex._id,
        text: 'Hi Alex! Loved your React architecture post. Quick question on token naming conventions.',
        isRead: true,
        readAt: new Date(Date.now() - 3600000 * 5)
      },
      {
        senderId: alex._id,
        recipientId: elena._id,
        text: 'Hey Elena! We usually namespace them by semantic level: sys.color.* vs ref.color.*. Happy to share our config!',
        isRead: false
      }
    ]);

    console.log('Seeding completed successfully!');
    console.log('Test Accounts:');
    console.log('  - alex_codes / Password123!');
    console.log('  - cyber_nova / Password123!');
    console.log('  - designfox / Password123!');
    console.log('  - python_master / Password123!');
    console.log('  - cloud_sarah / Password123!');

    if (exitOnComplete) {
      await mongoose.disconnect();
      process.exit(0);
    }
  } catch (err) {
    console.error('Seeding error:', err);
    if (exitOnComplete) {
      process.exit(1);
    }
    throw err;
  }
}

if (require.main === module) {
  seedDatabase(true);
}

module.exports = { seedDatabase };
