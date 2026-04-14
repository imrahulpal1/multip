import User from '../models/User.js'

export const getLeaderboard = async (_req, res) => {
  const users = await User.find({}, 'name points badges').sort({ points: -1 }).limit(20)
  res.json(users)
}
