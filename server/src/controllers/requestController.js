
import { Request } from '../models/Request.js';
import { User } from '../models/User.js';
import Notification from '../models/Notification.js';

/**
 * GET /api/requests
 * Get all collaboration requests for the logged-in user
 * (incoming and outgoing)
 */
export const getRequests = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Incoming requests
    const incoming = await Request.find({
      receiverId: currentUserId,
    })
      .populate(
        'senderId',
        'username name avatarUrl bio links stats email privacy'
      )
      .populate(
        'projectId',
        'title description requiredSkills status'
      )
      .sort({ createdAt: -1 });

    // Outgoing requests
    const outgoing = await Request.find({
      senderId: currentUserId,
    })
      .populate(
        'receiverId',
        'username name avatarUrl bio links stats email privacy'
      )
      .populate(
        'projectId',
        'title description requiredSkills status'
      )
      .sort({ createdAt: -1 });

    // Format contact visibility
    const formatReq = (request, isIncoming) => {
      const obj = request.toObject();
      const partner = isIncoming ? obj.senderId : obj.receiverId;

      if (partner) {
        if (
          request.status !== 'accepted' &&
          !partner.privacy?.showEmail
        ) {
          delete partner.email;
        }
      }

      return obj;
    };

    return res.json({
      success: true,
      incoming: incoming.map((r) => formatReq(r, true)),
      outgoing: outgoing.map((r) => formatReq(r, false)),
    });
  } catch (err) {
    console.error('Get requests error:', err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * POST /api/requests
 * Send a new collaboration request
 * Creates a notification for the receiver
 */
export const sendRequest = async (req, res) => {
  try {
    const { receiverId, projectId, message } = req.body;
    const senderId = req.user._id;

    // Validate required fields
    if (!receiverId || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'receiverId and message are required',
      });
    }

    // Prevent sending request to yourself
    if (receiverId.toString() === senderId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a collaboration request to yourself',
      });
    }

    // Check recipient
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Recipient developer not found',
      });
    }

    // Validate project if supplied
    if (projectId) {
      const projectExists = await Request.db
        .model('Project')
        .exists({ _id: projectId });

      if (!projectExists) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }
    }

    // Check duplicate pending request
    const existing = await Request.findOne({
      senderId,
      receiverId,
      projectId: projectId || null,
      status: 'pending',
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message:
          'A pending collaboration request to this developer already exists',
      });
    }

    // Create collaboration request
    const collaborationRequest = new Request({
      senderId,
      receiverId,
      projectId: projectId || null,
      message: message.trim(),
      status: 'pending',
    });

    await collaborationRequest.save();

    // Get sender information for notification
    const sender = await User.findById(senderId).select(
      'name username avatarUrl'
    );

    const senderName =
      sender?.name || sender?.username || 'A developer';

    // Create notification for receiver
    await Notification.create({
      recipient: receiverId,
      sender: senderId,
      type: 'collaboration_request',
      title: 'New Collaboration Request',
      message: `${senderName} sent you a collaboration request.`,
      link: '/app/requests',
    });

    // Populate receiver for response
    await collaborationRequest.populate(
      'receiverId',
      'username name avatarUrl'
    );

    return res.status(201).json({
      success: true,
      message: `Collaboration invitation sent to @${receiver.username}!`,
      request: collaborationRequest,
    });
  } catch (err) {
    console.error('Send request error:', err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * PATCH /api/requests/:id
 * Accept or decline a collaboration request
 * Notifies the original sender about the decision
 */
export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const currentUserId = req.user._id;

    // Validate status
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'accepted' or 'declined'",
      });
    }

    // Only receiver can update the request
    const collaborationRequest = await Request.findOne({
      _id: id,
      receiverId: currentUserId,
    })
      .populate(
        'senderId',
        'username name avatarUrl bio links stats email'
      )
      .populate('projectId', 'title description');

    if (!collaborationRequest) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration request not found or unauthorized',
      });
    }

    // Prevent duplicate status changes
    if (collaborationRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This request has already been ${collaborationRequest.status}`,
      });
    }

    // Update request status
    collaborationRequest.status = status;
    await collaborationRequest.save();

    // Notify original sender
    const receiver = await User.findById(currentUserId).select(
      'name username'
    );

    const receiverName =
      receiver?.name || receiver?.username || 'A developer';

    const accepted = status === 'accepted';

    await Notification.create({
      recipient: collaborationRequest.senderId._id,
      sender: currentUserId,
      type: accepted ? 'request_accepted' : 'request_rejected',
      title: accepted
        ? 'Collaboration Request Accepted'
        : 'Collaboration Request Declined',
      message: accepted
        ? `${receiverName} accepted your collaboration request.`
        : `${receiverName} declined your collaboration request.`,
      link: '/app/requests',
    });

    return res.json({
      success: true,
      message: `Collaboration request ${status}`,
      request: collaborationRequest,
    });
  } catch (err) {
    console.error('Update request status error:', err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
