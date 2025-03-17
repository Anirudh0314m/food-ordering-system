const express = require('express');
const router = express.Router();
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Store credentials in a secure location
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, '../../key.json');

// Make sure this file exists and contains your JSON credentials
if (!fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
  console.error('Dialogflow credentials file not found!');
}

const projectId = 'foodbot-gfy9'; // Replace with your project ID
const sessionClient = new dialogflow.SessionsClient();

// Process Dialogflow requests
router.post('/query', async (req, res) => {
  try {
    const { message, sessionId, context = {} } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const session = sessionId || uuid.v4();
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, session);
    
    // Prepare the request
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode: 'en-US',
        },
      },
      queryParams: {
        payload: {
          data: context
        }
      }
    };
    
    // Send request to Dialogflow
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    
    // Prepare and send response
    const response = {
      intent: result.intent ? result.intent.displayName : '',
      parameters: result.parameters ? result.parameters.fields : {},
      fulfillmentText: result.fulfillmentText,
      sessionId: session
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error with Dialogflow:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Add this to your dialogFlow.jsx file for testing
router.post('/test', async (req, res) => {
  try {
    // Simple test message
    const testMessage = req.body.message || "Hello";
    const sessionId = uuid.v4();
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
    
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: testMessage,
          languageCode: 'en-US',
        },
      }
    };
    
    // Send request to Dialogflow
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    
    res.json({
      query: testMessage,
      response: result.fulfillmentText,
      intent: result.intent ? result.intent.displayName : 'None detected',
      confidence: result.intentDetectionConfidence
    });
  } catch (error) {
    console.error('Dialogflow test error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;