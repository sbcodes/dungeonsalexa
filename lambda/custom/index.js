/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = '<speak>Welcome to Dungeons! What is your name Adventurer?</speak>';

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
    const request = handlerInput.requestEnvelope.request;
    var name = request.intent.slots.name.value;
    // Save name into attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    attributes.name = name;
    handlerInput.attributesManager.setSessionAttributes(attributes);

    const speechText = 'Welcome to the world ' + name + '! What is your race? Are you a human, a dwarf, or an elf.';

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
    const request = handlerInput.requestEnvelope.request;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const name = attributes.name;

    // Get the user's race from the utterance
    var race = request.intent.slots.race.value;

    // Save the race into the attributes
    attributes.race = race;
    handlerInput.attributesManager.setSessionAttributes(attributes);

    // Ask for the class
    const speechText = 'What class are you,' + name + ' the ' + race + '? Are you a rogue, or a warrior?';

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
    const request = handlerInput.requestEnvelope.request;
    // Get the session attributes, get the name from the attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    // Get the user's race from the utterance
    var char_class = request.intent.slots.char_class.value;

    // Save the race into the attributes
    attributes.char_class = char_class;
    // Roll the stats and save it into the attributes
    attributes.stats = rollStats(attributes, 12);

    handlerInput.attributesManager.setSessionAttributes(attributes);

    // Ask for the class
    const speechText =  '<speak>Okay, ' + char_class + ', we will now roll your stats. ' +
                        '<audio src=\'http://s3.amazonaws.com/hackathonalexa2019/Dice-Roll.mp3\'>' +
                        'You rolled a ' + String.valueOf(stats[0]) + ' for strength. ' +
                        '<audio src=\'http://s3.amazonaws.com/hackathonalexa2019/Dice-Roll.mp3\'>' +
                        'You rolled a ' + String.valueOf(stats[1]) + ' for dexterity. ' +
                        '<audio src=\'http://s3.amazonaws.com/hackathonalexa2019/Dice-Roll.mp3\'>' +
                        'You rolled a ' + String.valueOf(stats[2]) + ' for constitution. ' +
                        '<audio src=\'http://s3.amazonaws.com/hackathonalexa2019/Dice-Roll.mp3\'>' +
                        'You rolled a ' + String.valueOf(stats[3]) + ' for intelligence. ' +
                        '<audio src=\'http://s3.amazonaws.com/hackathonalexa2019/Dice-Roll.mp3\'>' +
                        'You rolled a ' + String.valueOf(stats[4]) + ' for wisdom. ' +
                        '<audio src=\'http://s3.amazonaws.com/hackathonalexa2019/Dice-Roll.mp3\'>' +
                        'You rolled a ' + String.valueOf(stats[5]) + ' for charisma.';

    return handlerInput.responseBuilder
      // Ask for the user's class
      .speak(speechText);
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
function rollStats(attributes, diceSides){
  var str = diceRoll(diceSides);
  var dex = diceRoll(diceSides);
  var con = diceRoll(diceSides);
  var int = diceRoll(diceSides);
  var wis = diceRoll(diceSides);
  var cha = diceRoll(diceSides);
  if(attributes.race === 'Human'){
    str++;
    dex++;
    con++;
    int++;
    wis++;
    cha++;
  } else if(attributes.race === 'Dwarf'){
    str += 2;
    con += 2;
    wis--;
    cha--;
  } else if(attributes.race === 'Elf'){
    dex += 2;
    int += 2;
    con--;
    str--;
  }

  stats = [str, dex, con, int, wis, cha]
  return stats;
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
