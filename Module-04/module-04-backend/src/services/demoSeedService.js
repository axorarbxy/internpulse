const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');
const module1Adapter = require('../integration/module1Adapter');
const logger = require('../utils/logger');

async function seedDemoPortal() {
  try {
    const activeInternships = await module1Adapter.getActiveInternships();
    const demoInternship = activeInternships.find((internship) => internship.title === 'Machine Learning Engineer Intern');
    if (!demoInternship?.studentId || !demoInternship?.companyId || !demoInternship.id) return;

    const student = await module1Adapter.getUser(String(demoInternship.studentId));
    if (student.role !== 'STUDENT') return;

    const participantIds = [String(demoInternship.studentId), String(demoInternship.companyId)].sort();
    const users = await module1Adapter.getUsers();
    const institution = users.find((user) => user.role === 'INSTITUTION');
    const seededParticipantSets = [
      { participantIds, internshipId: String(demoInternship.id) },
      ...(institution ? [
        { participantIds: [String(demoInternship.studentId), String(institution.id)].sort() },
        { participantIds: [String(demoInternship.companyId), String(institution.id)].sort() },
      ] : []),
    ];
    const conversations = await Promise.all(seededParticipantSets.map(async ({ participantIds: ids, internshipId }) => {
      const query = { participantIds: { $all: ids, $size: ids.length }, ...(internshipId ? { internshipId } : {}) };
      const existing = await Conversation.findOne(query);
      if (existing) return existing;
      return Conversation.create({ participantIds: ids, ...(internshipId ? { internshipId } : {}) });
    }));

    const notifications = [
      {
        key: 'weekly-check-in',
        type: 'PROGRESS_REMINDER',
        title: 'Weekly progress report due',
        message: 'Add this week’s hours and share a short update with your mentor by Friday.',
      },
      {
        key: 'mentor-review',
        type: 'INTERNSHIP_UPDATE',
        title: 'Mentor review scheduled',
        message: 'Kavita Rao is ready to review your feature pipeline milestone this week.',
      },
      {
        key: 'faculty-check-in',
        type: 'EVALUATION_EVENT',
        title: 'Faculty check-in next week',
        message: 'Your Apex Institute progress check-in is coming up. Keep your weekly report up to date.',
      },
      {
        key: 'internship-welcome',
        type: 'STUDENT_ACTION',
        title: 'Your internship workspace is ready',
        message: 'Your Machine Learning Engineer Intern workspace, milestones, and mentor details are available.',
      },
    ];

    const companyNotifications = [
      {
        key: 'new-applicants',
        type: 'COMPANY_ACTION',
        title: 'New applicants to review',
        message: 'Aditya Joshi and Meera Iyer applied to your Backend Engineering and Cloud & DevOps roles.',
      },
      {
        key: 'interview-stage',
        type: 'EVALUATION_EVENT',
        title: 'Interview stage updated',
        message: 'Priya Sharma is ready for an interview for Frontend Developer Intern.',
      },
      {
        key: 'progress-review',
        type: 'INTERNSHIP_UPDATE',
        title: 'Intern progress needs review',
        message: 'Sneha Kulkarni’s AI Research internship has been flagged for a supervisor check-in.',
      },
    ];

    const institutionNotifications = institution ? [
      {
        key: 'institution-placement-review',
        type: 'EVALUATION_EVENT',
        title: 'Placement review ready',
        message: 'The placement team has new internship progress activity to review.',
      },
      {
        key: 'institution-student-message',
        type: 'MESSAGE_RECEIVED',
        title: 'Student communication channel ready',
        message: 'Your student and company encrypted communication channels are ready. Open Messages to establish keys and send a message.',
      },
    ] : [];

    await Promise.all([
      ...notifications.map(({ key, ...notification }) => Notification.findOneAndUpdate(
      { recipientId: String(demoInternship.studentId), relatedEntityType: 'demo', relatedEntityId: key },
      {
        $setOnInsert: {
          ...notification,
          recipientId: String(demoInternship.studentId),
          relatedEntityType: 'demo',
          relatedEntityId: key,
          isRead: false,
        },
      },
      { upsert: true, new: true },
      )),
      ...companyNotifications.map(({ key, ...notification }) => Notification.findOneAndUpdate(
        { recipientId: String(demoInternship.companyId), relatedEntityType: 'demo', relatedEntityId: `company-${key}` },
        {
          $setOnInsert: {
            ...notification,
            recipientId: String(demoInternship.companyId),
            relatedEntityType: 'demo',
            relatedEntityId: `company-${key}`,
            isRead: false,
          },
        },
        { upsert: true, new: true },
      )),
      ...institutionNotifications.map(({ key, ...notification }) => Notification.findOneAndUpdate(
        { recipientId: String(institution.id), relatedEntityType: 'demo', relatedEntityId: `institution-${key}` },
        { $setOnInsert: { ...notification, recipientId: String(institution.id), relatedEntityType: 'demo', relatedEntityId: `institution-${key}`, isRead: false } },
        { upsert: true, new: true },
      )),
    ]);

    logger.info('Persistent student demo communication data is ready', {
      conversationIds: conversations.map((conversation) => String(conversation._id)),
      notificationCount: notifications.length + companyNotifications.length + institutionNotifications.length,
    });
  } catch (error) {
    logger.warn('Student demo communication data was not seeded', { error: error.message });
  }
}

module.exports = seedDemoPortal;