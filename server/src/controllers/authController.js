const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SkillProfile = require('../models/SkillProfile');
const Notification = require('../models/Notification');
const { isUsernameReserved } = require('../utils/reservedUsernames');
const { JWT_SECRET } = require('../middleware/auth');

function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long (12+ recommended)' };
  }
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    return {
      valid: false,
      message: 'Password must include uppercase, lowercase, a number, and a special character'
    };
  }

  return { valid: true };
}

exports.checkUsername = async (req, res, next) => {
  try {
    const rawUsername = req.query.username;
    if (!rawUsername) {
      return res.status(400).json({ success: false, available: false, message: 'Username parameter is required.' });
    }

    const username = rawUsername.trim().toLowerCase();

    // Check length
    if (username.length < 4 || username.length > 20) {
      return res.json({
        success: true,
        available: false,
        reason: 'Username must be between 4 and 20 characters.'
      });
    }

    // Check characters
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.json({
        success: true,
        available: false,
        reason: 'Only letters, numbers, and underscores are allowed (no spaces or special symbols).'
      });
    }

    // Check reserved names
    if (isUsernameReserved(username)) {
      return res.json({
        success: true,
        available: false,
        reason: 'This username is a reserved system keyword.'
      });
    }

    // Check database
    const existing = await User.findOne({ username });
    if (existing) {
      return res.json({
        success: true,
        available: false,
        reason: 'Username is already taken by another member.'
      });
    }

    return res.json({
      success: true,
      available: true,
      message: `${username} is available.`
    });
  } catch (err) {
    next(err);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, password, displayName, avatar } = req.body;

    if (!username || !email || !password || !displayName) {
      return res.status(400).json({
        success: false,
        message: 'All fields (username, email, password, displayName) are required.'
      });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Validate username
    if (cleanUsername.length < 4 || cleanUsername.length > 20 || !/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      return res.status(400).json({
        success: false,
        message: 'Username must be 4–20 characters and contain only letters, numbers, and underscores.'
      });
    }

    if (isUsernameReserved(cleanUsername)) {
      return res.status(400).json({
        success: false,
        message: 'This username is reserved by the platform.'
      });
    }

    // Validate password
    const pwdCheck = validatePasswordStrength(password);
    if (!pwdCheck.valid) {
      return res.status(400).json({
        success: false,
        message: pwdCheck.message
      });
    }

    // Check existing
    const existingUser = await User.findOne({
      $or: [{ username: cleanUsername }, { email: email.trim().toLowerCase() }]
    });

    if (existingUser) {
      const field = existingUser.username === cleanUsername ? 'Username' : 'Email';
      return res.status(400).json({
        success: false,
        message: `${field} is already registered.`
      });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      username: cleanUsername,
      email: email.trim().toLowerCase(),
      passwordHash,
      displayName: displayName.trim(),
      avatar: avatar || { category: 'technical', id: 'tech-cyber-1' },
      security: {
        activeSessions: [{
          sessionId: Math.random().toString(36).substring(2),
          device: req.headers['user-agent'] || 'Web Client',
          ip: req.ip || '127.0.0.1',
          lastActive: new Date()
        }],
        loginHistory: [{
          timestamp: new Date(),
          device: req.headers['user-agent'] || 'Web Client',
          ip: req.ip || '127.0.0.1',
          status: 'success'
        }]
      }
    });

    await user.save();

    // Create empty SkillProfile
    const profile = new SkillProfile({
      userId: user._id,
      skillsTeaching: [],
      skillsLearning: []
    });
    await profile.save();

    // Create Welcome Notification
    await Notification.create({
      recipientId: user._id,
      type: 'skill_verified',
      title: 'Welcome to SkillX!',
      message: 'Your Skill Passport is ready. Complete onboarding to discover compatible peers.',
      link: '/onboarding'
    });

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userSafe = user.toObject();
    delete userSafe.passwordHash;

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to SkillX.',
      token,
      user: userSafe,
      profile
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body; // username or email

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username/Email and password are required.'
      });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ username: cleanIdentifier }, { email: cleanIdentifier }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid login credentials.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      // Record failed attempt
      user.security.loginHistory.push({
        timestamp: new Date(),
        device: req.headers['user-agent'] || 'Web Client',
        ip: req.ip || '127.0.0.1',
        status: 'failed'
      });
      await user.save();

      return res.status(401).json({
        success: false,
        message: 'Invalid login credentials.'
      });
    }

    // Record successful session
    const sessionId = Math.random().toString(36).substring(2);
    user.security.activeSessions.push({
      sessionId,
      device: req.headers['user-agent'] || 'Web Browser',
      ip: req.ip || '127.0.0.1',
      lastActive: new Date()
    });

    user.security.loginHistory.push({
      timestamp: new Date(),
      device: req.headers['user-agent'] || 'Web Browser',
      ip: req.ip || '127.0.0.1',
      status: 'success'
    });

    await user.save();

    const profile = await SkillProfile.findOne({ userId: user._id });

    const token = jwt.sign(
      { userId: user._id, username: user.username, sessionId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userSafe = user.toObject();
    delete userSafe.passwordHash;

    return res.json({
      success: true,
      message: 'Sign in successful.',
      token,
      user: userSafe,
      profile
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    let profile = await SkillProfile.findOne({ userId: req.user._id });

    if (!profile) {
      profile = await SkillProfile.create({
        userId: req.user._id,
        skillsTeaching: [],
        skillsLearning: []
      });
    }

    return res.json({
      success: true,
      user,
      profile
    });
  } catch (err) {
    next(err);
  }
};

exports.saveOnboarding = async (req, res, next) => {
  try {
    const { q1SkillWish, q2BiggestChallenge, q3BestProject, q4LearningHelper, q5Aspiration, skillsTeaching, skillsLearning, tagline } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.onboardingCompleted = true;
    user.onboardingAnswers = {
      q1SkillWish: q1SkillWish || '',
      q2BiggestChallenge: q2BiggestChallenge || '',
      q3BestProject: q3BestProject || '',
      q4LearningHelper: q4LearningHelper || 'Someone who gives practical examples',
      q5Aspiration: q5Aspiration || ''
    };

    if (tagline) {
      user.tagline = tagline;
    }

    await user.save();

    // Update skill profile if provided
    let profile = await SkillProfile.findOne({ userId: user._id });
    if (!profile) {
      profile = new SkillProfile({ userId: user._id });
    }

    if (Array.isArray(skillsTeaching) && skillsTeaching.length > 0) {
      profile.skillsTeaching = skillsTeaching.map(s => ({
        name: s.name.trim(),
        category: s.category || 'General',
        level: s.level || 'Intermediate',
        verificationStatus: 'Self-Declared'
      }));
      profile.stats.skillsTaught = profile.skillsTeaching.length;
    }

    if (Array.isArray(skillsLearning) && skillsLearning.length > 0) {
      profile.skillsLearning = skillsLearning.map(s => ({
        name: s.name.trim(),
        category: s.category || 'General',
        targetLevel: s.targetLevel || 'Intermediate',
        preferredFormat: s.preferredFormat || ['Whiteboard', 'Voice']
      }));
      profile.stats.skillsLearned = profile.skillsLearning.length;
    }

    await profile.save();

    const userSafe = user.toObject();
    delete userSafe.passwordHash;

    return res.json({
      success: true,
      message: 'Onboarding completed! Welcome to your Skill Passport.',
      user: userSafe,
      profile
    });
  } catch (err) {
    next(err);
  }
};

exports.updateAppearance = async (req, res, next) => {
  try {
    const { theme, accent, density, motion } = req.body;
    const user = await User.findById(req.user._id);

    if (theme) user.appearanceSettings.theme = theme;
    if (accent) user.appearanceSettings.accent = accent;
    if (density) user.appearanceSettings.density = density;
    if (motion) user.appearanceSettings.motion = motion;

    await user.save();

    return res.json({
      success: true,
      appearanceSettings: user.appearanceSettings
    });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.'
      });
    }

    const check = validatePasswordStrength(newPassword);
    if (!check.valid) {
      return res.status(400).json({
        success: false,
        message: check.message
      });
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.json({
      success: true,
      message: 'Password successfully updated.'
    });
  } catch (err) {
    next(err);
  }
};

exports.logoutSession = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const user = await User.findById(req.user._id);

    if (sessionId) {
      user.security.activeSessions = user.security.activeSessions.filter(s => s.sessionId !== sessionId);
    } else {
      user.security.activeSessions = [];
    }

    await user.save();

    return res.json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (err) {
    next(err);
  }
};
