
import mongoose from 'mongoose';
import { Request } from '../models/Request.js';
import { User } from '../models/User.js';
import Notification from '../models/Notification.js';
import { fetchRealGitHubData } from '../services/githubService.js';
import { sendCollaborationEmail, sendRequestDecisionEmail } from '../services/emailService.js';

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
    const { receiverId, receiverUsername, username, projectId, projectTitle, project, message } = req.body;
    const senderId = req.user._id;

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const target = receiverId || receiverUsername || username;
    if (!target) {
      return res.status(400).json({
        success: false,
        message: 'Recipient developer is required',
      });
    }

    // Resolve receiver user by ObjectId or Username
    let receiver = null;
    if (mongoose.Types.ObjectId.isValid(target)) {
      receiver = await User.findById(target);
    }
    
    if (!receiver) {
      const cleanTarget = String(target).toLowerCase().trim().replace(/^@/, '');
      receiver = await User.findOne({ username: cleanTarget });

      // If user doesn't exist in MongoDB yet, try auto-creating from real GitHub data
      if (!receiver) {
        try {
          const ghData = await fetchRealGitHubData(cleanTarget);
          if (ghData && ghData.username) {
            receiver = await User.create({
              githubId: ghData.githubId,
              username: ghData.username,
              name: ghData.name || ghData.username,
              avatarUrl: ghData.avatarUrl,
              bio: ghData.bio || '',
              email: ghData.email || `${ghData.username}@devhub.dev`,
              links: {
                github: `https://github.com/${ghData.username}`,
                website: ghData.website || '',
              },
              stats: ghData.stats,
            });
          }
        } catch {}
      }
    }

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Recipient developer not found',
      });
    }

    // Prevent sending request to yourself
    if (receiver._id.toString() === senderId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a collaboration request to yourself',
      });
    }

    // Validate project if supplied
    let validProjectId = null;
    if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
      const projectExists = await Request.db
        .model('Project')
        .exists({ _id: projectId });
      if (projectExists) {
        validProjectId = projectId;
      }
    }

    // Check existing request to update or create
    const existing = await Request.findOne({
      senderId,
      receiverId: receiver._id,
    });

    let collaborationRequest;
    if (existing) {
      existing.message = message.trim();
      existing.projectTitle = project || projectTitle || 'Collaboration';
      if (validProjectId) existing.projectId = validProjectId;
      existing.status = 'pending';
      existing.updatedAt = new Date();
      await existing.save();
      collaborationRequest = existing;
    } else {
      collaborationRequest = new Request({
        senderId,
        receiverId: receiver._id,
        projectId: validProjectId,
        projectTitle: project || projectTitle || 'Collaboration',
        message: message.trim(),
        status: 'pending',
      });
      await collaborationRequest.save();
    }

    // Get sender information for notification
    const sender = await User.findById(senderId).select(
      'name username avatarUrl'
    );

    const senderName =
      sender?.name || sender?.username || 'A developer';

    // Create notification for receiver
    await Notification.create({
      recipient: receiver._id,
      sender: senderId,
      type: 'collaboration_request',
      title: 'New Collaboration Request',
      message: `${senderName} sent you a collaboration request.`,
      link: '/app/requests',
    });

    // Send email notification to receiver's registered email
    if (receiver.email) {
      sendCollaborationEmail({
        toEmail: receiver.email,
        receiverName: receiver.name || receiver.username,
        senderName,
        message: message.trim(),
        projectTitle: project || projectTitle || 'DevHub Collaboration',
      }).catch((err) => console.error('[RequestController] Email dispatch failed:', err.message));
    }

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
    let { status } = req.body;
    const currentUserId = req.user._id;

    if (status === 'rejected') status = 'declined';

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

    // Send email decision update to original sender's registered email
    if (collaborationRequest.senderId?.email) {
      sendRequestDecisionEmail({
        toEmail: collaborationRequest.senderId.email,
        senderName: collaborationRequest.senderId.name || collaborationRequest.senderId.username,
        responderName: receiverName,
        status: accepted ? 'accepted' : 'declined',
        projectTitle: collaborationRequest.projectTitle || collaborationRequest.projectId?.title || 'DevHub Collaboration',
      }).catch((err) => console.error('[RequestController] Decision email failed:', err.message));
    }

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

/**
 * DELETE /api/requests/:id
 * Sender can cancel their pending request
 */
export const cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;

    const request = await Request.findOneAndDelete({
      _id: id,
      senderId: currentUserId,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found or not authorized to cancel',
      });
    }

    return res.json({ success: true, message: 'Collaboration request cancelled' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
