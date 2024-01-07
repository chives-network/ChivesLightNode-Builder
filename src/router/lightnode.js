  // blockRoutes.js

  import express from 'express';
  import syncing from '../syncing.js';

  const router = express.Router();

  router.get('/lightnode/status', syncing.restrictToLocalhost, async (req, res) => {
    const getLightNodeStatusValue = await syncing.chivesLightNodeStatus();
    res.status(200).json(getLightNodeStatusValue).end();
  });

  router.get('/lightnode/nodeurl/:address', syncing.restrictToLocalhost, async (req, res) => {
    const { address } = req.params;
    const getLightNodeStatusValue = await syncing.chivesLightNodeUrl(address);
    res.status(200).json(getLightNodeStatusValue).end();
  });

  export default router;