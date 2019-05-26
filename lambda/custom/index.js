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
      .reprompt("Speak your name Adventurer. ")
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

    const speechText = 'Welcome to Fantasy Land ' + name + '! What is your race? Are you a human, a dwarf, or an elf. ';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt('What is your character\'s race? ')
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
    const speechText = 'What class are you, ' + name + ' the ' + race + '? Are you a rogue, or a warrior?';

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

    var name = attributes.name;

    // Get the user's race from the utterance
    var char_class = request.intent.slots.char_class.value;

    // Save the race into the attributes
    attributes.char_class = char_class;
    // Roll the stats and save it into the attributes
    attributes.stats = rollStats(attributes, 6);  //cap to 7?
    attributes.lastPos = 'entrance roll dice';
    attributes.PCHP = diceRoll(4) * attributes.stats[2];
    attributes.ogreAsleep = 1;
    attributes.ogreAlive = 1;
    attributes.ogreDead = 0;
    attributes.boulderPushed = 0;
    attributes.hasTorch = 0;
    attributes.litTorch = 0;
    attributes.hasKey = 0;
    attributes.goblinAlive = 1;
    if(attributes.char_class === 'warrior'){
      attributes.damageDice = 6;
    } else{
      attributes.damageDice = 4;
    }
    const speechText =
    'Okay, ' + name + ', we will now roll your stats. ' + 
    'You rolled a ' + attributes.stats[0] + ' for strength, a ' + attributes.stats[1] + ' for dexterity, a ' + attributes.stats[2] + ' for constitution, ' +
    'a ' + attributes.stats[3] + ' for intelligence, a ' + attributes.stats[4] + ' for wisdom, and a ' + attributes.stats[5] + ' for charisma. ' +
    'You have been tasked by the Great King Galaxathon to explore the dark dingy Dungeon of the recently defeated Queen Rosaline Blackwine, the worst of her name. ' +
    'The witch queen\'s forces were decimated in the war of the Black Scar however rumours swirl that there are still monsters inhabiting her Dungeon. Tread with Caution Adventurer. ' +
    'All maps have been lost but you are a brave ' + attributes.char_class + ' and aren’t one to back down from a Challenge. ' +
    'Tread forth into the dungeon and retrieve the legendary treasure said to be hidden in the depths. You arrive at the dungeon entrance, a huge looming black Arch casting a long dark shadow compared to the light forest around. ' +
    'Heading down the stairs, you forget how long you’ve been going down until after what seems like half an hour you slowly see a light growing brighter. ' +
    'As you enter the dimly lit circular room, the light coming from a great fire up above. In front of you there are three corridors, to the left a brightly lit corridor, in the middle a pitch black corridor and to the right another brightly lit corridor. ' +
    'As you’re about to choose you see a shadow across the right path. What do you do?';
    attributes.testText = speechText;

    handlerInput.attributesManager.setSessionAttributes(attributes);
    return handlerInput.responseBuilder
      // Ask for the user's class
      .speak(speechText)
      .reprompt('Do you go left, right or down the middle?')
      .withSimpleCard('Name Selection', speechText)
      .getResponse();
  },
};

//Potential move of ogre to dark hallway and small enemy to fight for torch

const MiddleHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'MiddleIntent';
  },
  handle(handlerInput) {
    // Get the session attributes, get the name from the attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const lastPos = attributes.lastPos;
    if(attributes.litTorch === 1){
      if(attributes.ogreAsleep === 1){
        const speechText = 'You choose the middle Path, as you walk down it the path leads to another circular room seemingly empty. ' +
        'As you step into the room you notice a Huge Sleeping Ogre to the left and you Freeze, hoping he won’t wake up. ' +
        'As you slowly step back the noise of your boots rouses the Ogre, grogy with sleep he hasn’t noticed you yet. Do you: Attack or Retreat?';
        attributes.lastPos = 'middle';
        
      } else if(attributes.ogreAsleep === 0 && attributes.ogreAlive === 1){
        attributes.lastPos = 'entrance';
      } else if(attributes.ogreAlive === 0){
        attributes.lastPos = 'entrance'
      }
    } else{
      //too dark
    }
    
    handlerInput.attributesManager.setSessionAttributes(attributes);
    return handlerInput.responseBuilder
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
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    // Get the session attributes, get the name from the attributes
    const lastPos = attributes.lastPos;
    if (attributes.lastPos != 'entrance roll dice' && attributes.lastPos != 'entrance') {
      speechText = 'You can\'t go right now!';
    } else if(attributes.boulderPushed === 0){
      speechText = `You walk through the right corridor until you come accross a huge boulder blocking your path.
                    Using your level ${attributes.stats[0]} strength, you push the boulder out of your way.
                    Behind the boulder is a secret room. You notice an open chest in front of you.
                    Inside the chest, you find a golden key. Wondering what to do with it, you head back to the dungeon entrance to find a use for the key. 
                    Now where do you go? To the left, or the middle?`;
      // Set the correct attributes
      attributes.boulderPushed = 1;
      attributes.hasKey = 1;
    } else if(attributes.boulderPushed === 1){
      speechText = `You have been here already found the mysterious key in the chest.`;
    }
    attributes.lastPos = 'right corridor'
    handlerInput.attributesManager.setSessionAttributes(attributes);
    return handlerInput.responseBuilder
      // Ask for the user's class
      .speak(speechText)
      .reprompt('Where do you go?')
      .getResponse();
  },
};

const LeftHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'LeftIntent';
  },
  handle(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    // Get the session attributes, get the name from the attributes
    const lastPos = attributes.lastPos;
    if (attributes.lastPos != 'entrance roll dice' && attributes.lastPos != 'entrance') {
      speechText = 'You can\'t go left now!';
    } else {
      speechText =  'You go down the left corridor. In the distance you see a goblin who has a torch.' +
                    'He attacks you but since you are an experienced ' + attributes.char_class + ' and are able to defend yourself against his attack. ' +
                    'After a long struggle, you finally kill him and you take his torch in order to help guide your way through the rest of the dungeon. ' +
                    'You go back to the dungeon entrance. Do you go to the left, or to the right?';
      // Set the correct attributes
      attributes.hasTorch = 1;
    }
    attributes.lastPos = 'left'
    handlerInput.attributesManager.setSessionAttributes(attributes);
    return handlerInput.responseBuilder
      // Ask for the user's class
      .speak(speechText)
      .reprompt('Where do you go?')
      .getResponse();
  },
};

const LightTorchHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'LightTorchIntent';
  },
  handle(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    attributes.litTorch = 1;
    handlerInput.attributesManager.setSessionAttributes(attributes);

    // Ask for the class
    const speechText = 'You light your torch';

    return handlerInput.responseBuilder
      // Ask for the user's class
      .speak(speechText)
      .getResponse();
  },
};

const AttackHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AttackIntent';
  },
  handle(handlerInput) {
    // Get the session attributes, get the name from the attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const lastPos = attributes.lastPos;
    if (attributes.lastPos != 'left' || attributes.lastPos != 'middle') {
      return handlerInput.responseBuilder
      .speak('There is not enemy here to fight!')
      .getResponse();
    }
    else if(attributes.lastPos === 'middle'){
      if(attributes.ogreAsleep === 1){
        attributes.ogreAsleep = 0;
        attributes.ogreStats = rollStats(4);
        attributes.ogreHP = diceRoll(2) * attributes.ogreStats[0];
      } else if(attributes.ogreAsleep === 0 && attributes.ogreAlive === 1){
        //ogre awake but not dead
        //dex to dodge attacks
        attributes.ogreStats = rollStats(6);
        attributes.ogreHP = diceRoll(4) * attributes.ogreStats[0];
      } else if(attributes.ogreAlive === 0){
        //ogre dead
        //return 
        return handlerInput.responseBuilder
        .speak('The ogre has already perished')
        .getResponse();
      }
  
      //player attacks
      var dam = attack(attributes);
      if(dam > 0){
        speechText = 'Your attack hits the ogre for ' + dam + ' damage';
        attributes.ogreHP -= dam;
      } else{
        speechText = 'Your attack missed. ';
      }
      //enemy attacks
      dam = oAttack(attributes);
      if(dam > 0){
        speechText = 'The Ogre hits you for ' + dam + ' damage. ';
        attributes.PCHP -= dam;
        if(attributes.PCHP <= 0){
          speechText = 'You have died';
          return handlerInput.responseBuilder
          .speak(speechText)
          .getResponse();
        }
      } else{
        speechText = 'The ogres attack whiffed. ';
      }
      if(attributes.ogreHP <= 0){
        attributes.ogreAlive = 0;
        handlerInput.attributesManager.setSessionAttributes(attributes);
        speechText = 'The ogre is slain. ';
        if(attributes.hasKey === 0){
          speechText = 'You notice a door but it is locked.';
        } else{
          speechText = 'You notice a door and unlock it with your key. The End';
        }
        return handlerInput.responseBuilder
        .speak(speechText)
        .getResponse();
      }
    }
    else if(attributes.lastPos === 'left'){
      if(goblinAlive === 1){
        attributes.goblinStats = rollStatsEnemy(3);
        attributes.goblinHP = rollDice(2) * goblinStats[0];
        //player attacks
        var dam = attack(attributes);
        if(dam > 0){
          speechText = 'Your attack hits the goblin for ' + dam + ' damage';
          attributes.goblinHP -= dam;
        } else{
          speechText = 'Your attack missed. ';
        }
        //enemy attacks
        dam = oAttack(attributes);
        if(dam > 0){
          speechText = 'The goblin hits you for ' + dam + ' damage. ';
          attributes.PCHP -= dam;
          if(attributes.PCHP <= 0){
            speechText = 'You have died';
            return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
          }
        } else{
          speechText = 'The goblin\'s attack whiffed. ';
        }
        if(attributes.goblinHP <= 0){
          attributes.goblinAlive = 0;
          attributes.lastPos = 'goblin';
          handlerInput.attributesManager.setSessionAttributes(attributes);
          speechText = 'The goblin is slain. ';
          return handlerInput.responseBuilder
          .speak(speechText)
          .getResponse();
        }
      } else{
        return handlerInput.responseBuilder
        .speak('The goblin has already perished')
        .getResponse();
      }
      
    }
    handlerInput.attributesManager.setSessionAttributes(attributes);
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt('Attack again or flee?')
      .getResponse();
  },
};
//Chest could have trap on it that requires a wisdom check to notice and dex to disarm.


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
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const speechText = `Goodbye ${attributes.name}`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('GOODBYE', speechText)
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

// Roll the PC's stats
function rollStats(attributes, diceSides){
  var str = diceRoll(diceSides);
  var dex = diceRoll(diceSides);
  var con = diceRoll(diceSides);
  var int = diceRoll(diceSides);
  var wis = diceRoll(diceSides);
  var cha = diceRoll(diceSides);
  //rebalance
  if(attributes.race === 'Human'){
    con += 3;
    int += 2;
    wis--;
    cha--
  } else if(attributes.race === 'Dwarf'){
    str += 3;
    con += 2;
    dex--;
    cha--;
  } else if(attributes.race === 'Elf'){
    dex += 3;
    wis += 2;
    con--;
    str--;
  }

  stats = [str, dex, con, int, wis, cha]
  return stats;
}

//roll stats for monsters (no race bonus currently)
function rollStatsEnemy(diceSides){
  var str = diceRoll(diceSides);
  var dex = diceRoll(diceSides);
  var int = diceRoll(diceSides);

  stats = [str, dex, int]
  return stats;
}

// Roll a dice of n sides
function diceRoll(sides){
  return Math.floor((Math.random() * Math.floor(sides)) + 1)
}

function attack(attributes){
  var d;
  var r = rollDice(8);
  if(r >= attributes.ogreStats[1]){
    //attack hits
    d = rollDice(attributes.damageDice);
  } else{
    //attack miss
    d = 0;
  }
  return d;
}
function oAttack(attributes){
  var d;
  var r = rollDice(8);
  if(r >= attributes.stats[1]){
    //attack hits
    d = rollDice(4);
  } else{
    //attack miss
    d = 0;
  }
  return d;
}

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    NameHandler,
    RaceHandler,
    ClassHandler,
    MiddleHandler,
    AttackHandler,
    RightHandler,
    LeftHandler,
    LightTorchHandler,
    LeftHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
