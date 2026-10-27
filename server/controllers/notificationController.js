import Notification from '../models/Notification.js';

export async function getMyNotifications(req, res, next) {
  try {
    const filter = {};
    if (req.user) {
      filter.user = req.user._id;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { readAt: new Date() },
      { new: true }
    );
    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
}

export async function clearAll(req, res, next) {
  try {
    if (req.user) {
      await Notification.deleteMany({ user: req.user._id });
    }
    res.status(200).json({
      success: true,
      message: 'All notifications cleared',
    });
  } catch (error) {
    next(error);
  }
}
