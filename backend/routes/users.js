// GET /api/users/agents
router.get('/agents', async (req, res) => {
  try {
    const agents = await User.find({ role: 'InsuranceAgent' }).select('_id name');
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch agents' });
  }
});
