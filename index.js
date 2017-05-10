'use strict';

// Declare Access Token for Alexa Skill and API.AI
const ALEXA_APP_ID                  = "amzn1.ask.skill.app.your-skill-id";
const APIAI_CLIENT_ACCESS_TOKEN     = "your-apiai-client-access-token";
const APIAI_DEVELOPER_ACCESS_TOKEN  = "your-apiai-developer-access-token";

// Declare the usage of Alexa SDK and API.AI SDK
var AlexaSdk    = require('alexa-sdk');
var AlexaAwsSdk = require('aws-sdk');
var ApiAiSdk    = require('apiai');
var alexa       = require("alexa-app");

//Skill Name
var skill_name = "AlexaApiAi";

// Generate Alexa Session ID
const alexaSessionId = '<secret_session>';

// Initialize request with API AI Client Token 
var ApiAi = new ApiAiSdk(APIAI_DEVELOPER_ACCESS_TOKEN);

// Define Handler List to be triggered
var handlers = {
    'LaunchRequest': function(){
        var self = this;

        //Set the Alexa Session Id
        //setAlexaSessionId(self.event.session.sessionId);

        //Prepare request for API.AI
        ApiAi.eventRequest({name: 'WELCOME'}, {sessionId: alexaSessionId})
            .on('response', function(response){
                var speech = response.result.fulfillment.speech;    
                self.emit(':ask', speech, speech);
            })
            .on('error', function(error){
                console.error(error.message);
                self.emit(':tell', error.message);
            })       
            .end();
    },

    'AlexaIntent': function(){
        
        var self = this;
        var text = self.event.request.intent.slots.Text.value;

        if (text) {
            ApiAi.textRequest(text, {sessionId: alexaSessionId})
                .on('response', function (response) {
                    var speech = response.result.fulfillment.speech;
                    if (isResponseIncompleted(response)) {
                        self.emit(':ask', speech, speech);
                    } else {
                        self.emit(':tell', speech);
                    }
                })
                .on('error', function (error) {
                    console.error(error.message);
                    self.emit(':tell', error.message);
                })
                .end();
        } else {
            self.emit('Unhandled');
        }
    },

    'AMAZON.CancelIntent': function () {
        this.emit('AMAZON.StopIntent');
    },
    'AMAZON.HelpIntent': function () {
        this.emit('Unhandled');
    },
    'AMAZON.StopIntent': function () {
        var self = this;
        ApiAi.eventRequest({name: 'HUMAN_SUPPORT'}, {sessionId: alexaSessionId})
            .on('response', function (response) {
                self.emit(':tell', response.result.fulfillment.speech);
            })
            .on('error', function (error) {
                console.error(error.message);
                self.emit(':tell', error.message);
            })
            .end();
    },
    'Unhandled': function () {
        var self = this;
        ApiAi.eventRequest({name: 'FALLBACK'}, {sessionId: alexaSessionId})
            .on('response', function (response) {
                var speech = response.result.fulfillment.speech;
                self.emit(':ask', speech, speech);
            })
            .on('error', function (error) {
                console.error(error.message);
                self.emit(':tell', error.message);
            })
            .end();
    }
};

exports.handler = function (event, context) {
    var alexa   = AlexaSdk.handler(event, context);
    alexa.appId = ALEXA_APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

/*function setAlexaSessionId(sessionId) {
    alexaSessionId = sessionId.split('amzn1.echo-api.session.').pop();
}*/




