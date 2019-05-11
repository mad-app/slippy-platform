import { Router } from 'express';

//import { quick} from './../../lib/commands';
var quick = require("../../lib/commands/quick");
var report = require("../../lib/commands/report");

import { runDockerContainer } from '../../testing/app-builder'
import { runAgents } from '../../testing/distributed-agent-manager'
import { RSA_NO_PADDING } from 'constants';
import { Commander, TestingCommander } from '../../component/controller/commander';


let router: Router = Router();
router.get('/quick', function (req, res, next) {
  // res.render('index', { title: 'Express' });
  res.send("test");
});

router.get('/version', function (req, res, next) {
  // res.render('index', { title: 'Express' });
  res.send("version");
});

router.get('/version2', function (req, res, next) {
  // res.render('index', { title: 'Express' });
  res.send("version2");
});

router.post('/quick', function (req, res, next) {
  // res.render('index', { title: 'Express' });
  console.log(req.body);

  let opts = {
    rate: req.body.rate,
    duration: req.body.duration,
    output: "quick.json",
    quiet: false,
    callback: (data: any) => {
      console.log(data);
      //let html=report(data);
      //console.log(html);
      res.json({
        code: 0,
        report: data
      });
    }
  };

  quick(req.body.url, opts);
});

router.post('/prepare', async (req, res) => {
  try {
    const appName = req.body.appName;
    const topic = req.body.topic;
    const codeId = req.body.codeId;
    let cmd = new TestingCommander();
    await cmd.sendTestCode(appName, topic, codeId);
    res.json({ code: 0, message: 'ok' });
  } catch (err) {
    res.status(500);
    res.send(err);
  }
});

router.post('/start', async (req, res) => {
  try {
    const topic = req.body.topic;
    const codeId = req.body.codeId;
    let cmd = new TestingCommander();
    await cmd.sendStartCommand(topic, codeId);
    res.json({ code: 0, message: 'ok' });
  } catch (err) {
    res.status(500);
    res.send(err);
  }
});

router.post('/execute', async (req, res) => {
  try {
    const appName = req.body.appName;
    const topic = req.body.topic;
    let cmd = new TestingCommander();
    await cmd.sendExcuteCommand(appName, topic);
    res.json({ code: 0, message: 'ok' });
  } catch (err) {
    res.status(500);
    res.send(err);
  }
});

/**
 * POST
 * {
 *   agentImage?: stirng agent image's full name with tag
 *   count?: number,
 *   dockerOptions?: {},
 *   containerEnv?: string[],
 *   networkEndpoint?: string
 * }
 */
router.post('/agent/run', async function (req, res) {
  try {
    let kafkaTopic: string;
    let agentImageName: string;
    let count = 1;
    let dockerOptions: {};
    let containerEnv: string[];
    let networkEndpoint: string;

    if (req.body) {
      kafkaTopic = req.body.kafkaTopic;
      agentImageName = req.body.agentImage;
      count = req.body.count || count;
      dockerOptions = req.body.dockerOptions;
      containerEnv = req.body.containerEnv;
      networkEndpoint = req.body.networkEndpoint;
    }

    if (kafkaTopic) {
      let cmd = new Commander();
      await cmd.createCommand(kafkaTopic);
    }

    let errCount = await runAgents(agentImageName, count, containerEnv, networkEndpoint, dockerOptions)

    res.json({
      runErrorCount: errCount
    });
  } catch (err) {
    res.status(500);
    res.send(err);
  }
});

router.post('/kafka/create', async function (req, res) {
  try {
    const topic = req.body.topic;

    let cmd = new Commander();
    await cmd.createCommand(topic);

    res.send({ message: `created topic: ${topic}` });
  } catch (err) {
    res.status(500);
    res.send(err);
  }
});

router.post('/kafka/publish', async (req, res) => {
  try {
    const topic = req.body.topic;
    const message = req.body.message;

    let cmd = new Commander();
    await cmd.sendCommand(topic, message);

    res.json({ code: 0, message: 'ok' });
  } catch (err) {
    res.status(500);
    res.send(err);
  }
});

export const testingRouter: Router = router;
