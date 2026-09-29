const Project = require('../models/Project');
const SkillProfile = require('../models/SkillProfile');
const Notification = require('../models/Notification');

exports.createProject = async (req, res, next) => {
  try {
    const { title, description, exchangeId, participantIds, skillsUsed, githubUrl, liveUrl, notes, privacy } = req.body;
    const userId = req.user._id;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required.' });
    }

    const participants = [{ userId, role: 'Lead Collaborator', skillsContributed: skillsUsed || [] }];
    if (Array.isArray(participantIds)) {
      participantIds.forEach(pId => {
        if (pId.toString() !== userId.toString()) {
          participants.push({ userId: pId, role: 'Collaborator', skillsContributed: skillsUsed || [] });
        }
      });
    }

    const project = new Project({
      title: title.trim(),
      description: description.trim(),
      exchangeId: exchangeId || null,
      participants,
      skillsUsed: skillsUsed || [],
      githubUrl: githubUrl || '',
      liveUrl: liveUrl || '',
      notes: notes || '',
      privacy: privacy || 'connections',
      status: 'in_progress'
    });

    await project.save();

    // Notify other participants
    for (const p of participants) {
      if (p.userId.toString() !== userId.toString()) {
        await Notification.create({
          recipientId: p.userId,
          senderId: userId,
          type: 'project_collaborator',
          title: 'Project Collaboration Invitation',
          message: `@${req.user.username} added you to a collaborative project: "${project.title}".`,
          link: `/projects/${project._id}`
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Collaborative project created successfully!',
      project
    });
  } catch (err) {
    next(err);
  }
};

exports.getProjects = async (req, res, next) => {
  try {
    const userId = req.user?._id;

    let query = { privacy: 'public' };
    if (userId) {
      query = {
        $or: [
          { privacy: 'public' },
          { privacy: 'connections' },
          { 'participants.userId': userId }
        ]
      };
    }

    const projects = await Project.find(query)
      .populate('participants.userId', 'username displayName avatar location tagline')
      .sort({ updatedAt: -1 });

    return res.json({
      success: true,
      projects
    });
  } catch (err) {
    next(err);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?._id;

    const project = await Project.findById(projectId)
      .populate('participants.userId', 'username displayName avatar bio location tagline');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    // Check privacy
    if (project.privacy === 'private') {
      const isParticipant = project.participants.some(p => p.userId && p.userId._id.toString() === userId?.toString());
      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'This project is private.' });
      }
    }

    return res.json({
      success: true,
      project
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, skillsUsed, status, githubUrl, liveUrl, notes, privacy } = req.body;
    const userId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    const isParticipant = project.participants.some(p => p.userId.toString() === userId.toString());
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this project.' });
    }

    if (title) project.title = title.trim();
    if (description) project.description = description.trim();
    if (skillsUsed) project.skillsUsed = skillsUsed;
    if (githubUrl !== undefined) project.githubUrl = githubUrl.trim();
    if (liveUrl !== undefined) project.liveUrl = liveUrl.trim();
    if (notes !== undefined) project.notes = notes.trim();
    if (privacy) project.privacy = privacy;

    const wasCompleted = project.status === 'completed';
    if (status) project.status = status;

    if (status === 'completed' && !wasCompleted) {
      project.completedAt = new Date();

      // Upgrade SkillPassport verification status to 'Project-Demonstrated' for all participants!
      for (const p of project.participants) {
        const participantProfile = await SkillProfile.findOne({ userId: p.userId });
        if (participantProfile) {
          project.skillsUsed.forEach(skillName => {
            const teachSkill = participantProfile.skillsTeaching.find(s => s.name.toLowerCase() === skillName.toLowerCase());
            if (teachSkill) {
              teachSkill.verificationStatus = 'Project-Demonstrated';
            }
          });
          participantProfile.stats.projectsCompleted += 1;
          await participantProfile.save();
        }

        await Notification.create({
          recipientId: p.userId,
          senderId: userId,
          type: 'project_completed',
          title: 'Project Completed! 🏆',
          message: `Project "${project.title}" marked as complete. Your Skill Passport has been updated with Project-Demonstrated verification!`,
          link: `/passport`
        });
      }
    }

    await project.save();

    return res.json({
      success: true,
      message: 'Project updated successfully.',
      project
    });
  } catch (err) {
    next(err);
  }
};
