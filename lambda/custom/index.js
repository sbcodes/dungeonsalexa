/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to Dungeons! What is your name, Adventurer?';
    

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt("Speak your name Adventurer.")
      .withSimpleCard('Welcome', speechText)
      .getResponse();
  },
};

const NameHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'NameIntent';
  },
  handle(handlerInput) {
    var name = this.event.request.intent.slots.name.value;
    //save name into attributes
    const attributes = handlerInput.attributeManager.getSessionAttributes();
    attributes.name = name;
    handlerInput.attributeManager.setSessionAttributes(attributes);

    const speechText = 'Welcome to the world ' + name + '! What is your race? You may be a human, a dwarf or an elf.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt('What is your character\'s race?')
      .withSimpleCard('Name Selection', speechText)
      .getResponse();
  },
};

const RaceHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RaceIntent';
  },
  handle(handlerInput) {
    // Get the session attributes, get the name from the attributes
    const attributes = handlerInput.attributeManager.getSessionAttributes();
    const name = attributes.name;

    // Get the user's race from the utterance
    var race = this.event.request.intent.slots.race.value;

    // Save the race into the attributes
    attributes.race = race;
    handlerInput.attributeManager.setSessionAttributes(attributes);

    // Ask for the class
    const speechText = 'What class are you,' + name + '? Are you a rogue, or a warrior?';

    return handlerInput.responseBuilder
      // Ask for the user's class
      .speak(speechText)
      .reprompt('What is your character\'s class? Rogue, or warrior?')
      .withSimpleCard('Name Selection', speechText)
      .getResponse();
  },
};

const ClassHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ClassIntent';
  },
  handle(handlerInput) {
    // Get the session attributes, get the name from the attributes
    const attributes = handlerInput.attributeManager.getSessionAttributes();

    // Get the user's race from the utterance
    var char_class = this.event.request.intent.slots.class.value;

    // Save the race into the attributes
    attributes.char_class = char_class;
    handlerInput.attributeManager.setSessionAttributes(attributes);

    // Ask for the class
    const speechText = 'Okay, we will now roll your stats.';
    const dataText = 'Your name is ' + attributes.name + ', your race is ' + attributes.race + ', your class is ' + attributes.char_class;

    return handlerInput.responseBuilder
      // Ask for the user's class
      .speak(speechText + dataText)
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

// Roll the user's stats
function rollStats(){

}

// Roll a dice of n sides
function diceRoll(sides){
  return Math.floor((Math.random() * Math.floor(sides)) + 1)
}

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    NameHandler,
    RaceHandler,
    ClassHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
