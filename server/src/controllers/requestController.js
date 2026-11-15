import { Request } from '../models/Request.js';
import { User } from '../models/User.js';

/**
 * GET /api/requests
 * Get all collaboration requests for the logged-in user (incoming and outgoing)
 */
export const getRequests = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Incoming requests (where user is receiver)
    const incoming = await Request.find({ receiverId: currentUserId })
      .populate('senderId', 'username name avatarUrl bio links stats email privacy')
      .populate('projectId', 'title description requiredSkills status')
      .sort({ createdAt: -1 });

    // Outgoing requests (where user is sender)
    const outgoing = await Request.find({ senderId: currentUserId })
      .populate('receiverId', 'username name avatarUrl bio links stats email privacy')
      .populate('projectId', 'title description requiredSkills status')
      .sort({ createdAt: -1 });

    // Format contact visibility: if accepted, expose email and links
    const formatReq = (r, isIncoming) => {
      const obj = r.toObject();
      const partner = isIncoming ? obj.senderId : obj.receiverId;

      if (partner) {
        // If not accepted, respect email privacy
        if (r.status !== 'accepted' && !partner.privacy?.showEmail) {
          delete partner.email;
        }
      }
      return obj;
    };

    res.json({
      success: true,
      incoming: incoming.map((r) => formatReq(r, true)),
      outgoing: outgoing.map((r) => formatReq(r, false)),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/requests
 * Send a new collaboration request to another developer
 */
export const sendRequest = async (req, res) => {
  try {
    const { receiverId, projectId, message } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({
        success: false,
        message: 'receiverId and message are required',
      });
    }

    if (receiverId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a collaboration request to yourself',
      });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Recipient developer not found' });
    }

    // Check if pending request already exists
    const existing = await Request.findOne({
      senderId: req.user._id,
      receiverId,
      projectId: projectId || null,
      status: 'pending',
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A pending collaboration request to this developer already exists',
      });
    }

    const collaborationRequest = new Request({
      senderId: req.user._id,
      receiverId,
      projectId: projectId || null,
      message: message.trim(),
      status: 'pending',
    });

    await collaborationRequest.save();
    await collaborationRequest.populate('receiverId', 'username name avatarUrl');

    res.status(201).json({
      success: true,
      message: `Collaboration invitation sent to @${receiver.username}!`,
      request: collaborationRequest,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/requests/:id
 * Accept or decline a collaboration request
 */
export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'accepted' or 'declined'",
      });
    }

    // Only the receiver can accept or decline
    const collaborationRequest = await Request.findOne({
      _id: id,
      receiverId: req.user._id,
    })
      .populate('senderId', 'username name avatarUrl bio links stats email')
      .populate('projectId', 'title description');

    if (!collaborationRequest) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration request not found or unauthorized',
      });
    }

    collaborationRequest.status = status;
    await collaborationRequest.save();

    res.json({
      success: true,
      message: `Collaboration request ${status}`,
      request: collaborationRequest,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
