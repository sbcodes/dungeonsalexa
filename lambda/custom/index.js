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
    attributes.stats = rollStats(attributes.race, 12);

    attributes.lastPos = 'entrance roll dice';
    attributes.PCHP = diceRoll(4) * attributes.stats[2];
    attributes.ogreAsleep = 1;
    attributes.ogreAlive = 1;
    attributes.ogreDead = 0;
    attributes.hasTorch = 0;
    attributes.hasKey = 0;

    handlerInput.attributesManager.setSessionAttributes(attributes);

    // Ask for the class
    const speechText =  `<speak>
    Okay, ${name}, we will now roll your stats.
    You rolled a ${attributes.stats[0]} for strength, a ${attributes.stats[1]} for dexterity, a ${attributes.stats[2]} for constitution,
    a ${attributes.stats[3]} for intelligence, a ${attributes.stats[4]} for wisdom, and a ${attributes.stats[5]} for charisma. \n`;
    
    const expositionText =  `You have been tasked by the Great King Galaxathon to explore the dark dingy Dungeon of the recently defeated Queen Rosaline Blackwine, the worst of her name.
    The witch queen's forces were decimated in the war of the Black Scar however rumours swirl that there are still monsters inhabiting her Dungeon. Tread with Caution Adventurer.
    All maps have been lost but you are a brave ${attributes.char_class} and aren’t one to back down from a Challenge.
    Tread forth into the dungeon and retrieve the legendary treasure said to be hidden in the depths. You arrive at the dungeon entrance, a huge looming black Arch casting a long dark shadow compared to the light forest around.
    Heading down the stairs, you forget how long you’ve been going down until after what seems like half an hour you slowly see a light growing brighter. 
    As you enter the dimly lit circular room, the light coming from a great fire up above. In front of you there are three corridors, to the left a brightly lit corridor, in the middle a pitch black corridor and to the right another brightly lit corridor.
    As you’re about to choose you see a shadow across the right path. What do you do? 
    </speak>`;

    return handlerInput.responseBuilder
      // Ask for the user's class
      .speak(speechText + expositionText)
      .getResponse();
  },
};

//barebones
const LeftHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'LeftIntent';
  },
  handle(handlerInput) {
    // Get the session attributes, get the name from the attributes
    const lastPos = attributes.lastPos;
    if (attributes.lastPos != 'entrance roll dice' && attributes.lastPos != 'entrance') {
      return handlerInput.responseBuilder
      .speak('You can\'t go left now!')
      .getResponse();
    } else if(attributes.ogreAsleep === 1){
      const speechText = 'You choose the left Path, as you walk down it the path leads to another circular room seemingly empty. ' +
      'As you step into the room you notice a Huge Sleeping Ogre to the left and you Freeze, hoping he won’t wake up. ' +
      'As you slowly step back the noise of your boots rouses the Ogre, grogy with sleep he hasn’t noticed you yet. Do you: Attack or Retreat?';
      attributes.ogreAsleep = 0;
      //attributes.ogreStats = rollStats(attributes, 4)
      //attributes.ogreHP = diceRoll(2) * attributes.ogreStats[2];
    } else if(attributes.ogreAsleep === 0 && attributes.ogreAlive === 1){
      //ogre awake but not dead
    } else if(attributes.ogreAlive === 0){
      //ogre dead
    }
    handlerInput.attributesManager.setSessionAttributes(attributes);
    return handlerInput.responseBuilder
      // Ask for the user's class
      .speak(speechText)
      .reprompt('Attack the ogre or flee?')
      .getResponse();
  },
};

const RightHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RightIntent';
  },
  handle(handlerInput) {
    // Get the session attributes, get the name from the attributes
    const lastPos = attributes.lastPos;
    if (attributes.lastPos != 'entrance roll dice' && attributes.lastPos != 'entrance') {
      return handlerInput.responseBuilder
      .speak('You can\'t go right now!')
      .getResponse();
    } else if(attributes.boulderPushed === 0){
      // Boulder in the way user needs to move it
    } else if(attributes.boulderPushed === 1){
      // Boulder pushed go straight to the chest
    }
    handlerInput.attributesManager.setSessionAttributes(attributes);
    return handlerInput.responseBuilder
      // Ask for the user's class
      .speak(speechText)
      .reprompt('What do you do with the boulder?')
      .getResponse();
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
function rollStats(race, diceSides){
  var str = diceRoll(diceSides);
  var dex = diceRoll(diceSides);
  var con = diceRoll(diceSides);
  var int = diceRoll(diceSides);
  var wis = diceRoll(diceSides);
  var cha = diceRoll(diceSides);
  if(race === 'Human'){
    str++;
    dex++;
    con++;
    int++;
    wis++;
    cha++;
  } else if(race === 'Dwarf'){
    str += 2;
    con += 2;
    wis--;
    cha--;
  } else if(race === 'Elf'){
    dex += 2;
    int += 2;
    con--;
    str--;
  }

  stats = [str, dex, con, int, wis, cha]
  return stats;
}

function rollStatsEnemy(attributes, diceSides){
  var str = diceRoll(diceSides);
  var dex = diceRoll(diceSides);
  var con = diceRoll(diceSides);
  var int = diceRoll(diceSides);
  var wis = diceRoll(diceSides);
  var cha = diceRoll(diceSides);

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
