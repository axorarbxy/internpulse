// Verifies the core IDOR-prevention rule: a user who is not a participant
// must never be able to read/send to a conversation, even with a valid JWT.
jest.mock('../models/Conversation', () => ({
  findById: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
}));

const Conversation = require('../models/Conversation');
const conversationService = require('../services/conversationService');

describe('conversationService.isParticipant', () => {
  afterEach(() => jest.clearAllMocks());

  test('returns false when conversation does not exist', async () => {
    Conversation.findById.mockResolvedValue(null);
    const result = await conversationService.isParticipant('conv-1', 'student-c');
    expect(result).toBe(false);
  });

  test('returns false for a user outside the participant list (IDOR case)', async () => {
    Conversation.findById.mockResolvedValue({ participantIds: ['student-a', 'company-b'] });
    const result = await conversationService.isParticipant('conv-1', 'student-c');
    expect(result).toBe(false);
  });

  test('returns true for an actual participant', async () => {
    Conversation.findById.mockResolvedValue({ participantIds: ['student-a', 'company-b'] });
    const result = await conversationService.isParticipant('conv-1', 'student-a');
    expect(result).toBe(true);
  });

  test('scopes conversation reuse to the same internship', async () => {
    Conversation.findOne.mockResolvedValue(null);
    Conversation.create.mockResolvedValue({ _id: 'conv-2' });

    await conversationService.createConversation(['student-a', 'company-b'], 'internship-2');

    expect(Conversation.findOne).toHaveBeenCalledWith({
      participantIds: { $all: ['student-a', 'company-b'], $size: 2 },
      internshipId: 'internship-2',
    });
  });
});
