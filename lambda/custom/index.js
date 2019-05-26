/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = '<speak><voice name="Matthew">Welcome to Dungeons! What is your name Adventurer?</voice></speak>';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt('<speak><voice name="Matthew">Speak your name Adventurer.</voice></speak>')
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

    const speechText = '<speak><voice name="Matthew">Welcome to Fantasy Land ' + name + '! What is your race? Are you a human, a dwarf, or an elf?</voice></speak>';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt('<speak><voice name="Matthew">What is your character\'s race?</voice></speak>')
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
    const speechText = '<speak><voice name="Matthew">What class are you, ' + name + ' the ' + race + '? Are you a rogue, or a warrior?</voice></speak>';

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
    attributes.litTorch = 1;
    attributes.hasKey = 0;
    attributes.goblinAlive = 1;
    if(attributes.char_class === 'warrior'){
      attributes.damageDice = 6;
    } else{
      attributes.damageDice = 4;
    }
    const speechText =
    '<speak><voice name="Matthew">Okay, ' + name + ', we will now roll your stats. ' + 
    '<prosody volume="loud"><audio src="https://s3.amazonaws.com/hackathonalexa2019/Dice-Roll.mp3"/></prosody> ' +
    'You rolled a ' + attributes.stats[0] + ' for strength, a ' + attributes.stats[1] + ' for dexterity, a ' + attributes.stats[2] + ' for constitution, ' +
    'a ' + attributes.stats[3] + ' for intelligence, a ' + attributes.stats[4] + ' for wisdom, and a ' + attributes.stats[5] + ' for charisma. ' +
    '<break time = "1s"/><audio src="https://s3.amazonaws.com/hackathonalexa2019/Intro.mp3"/>' +
    'Now my friend, you have arrived at the dungeon entrance. Where will you choose to go? To the left, down the middle, or to the right?</voice></speak>';
    attributes.testText = speechText;

    handlerInput.attributesManager.setSessionAttributes(attributes);
    return handlerInput.responseBuilder
      // Ask for the user's class
      .speak(speechText)
      .reprompt('<speak><voice name="Matthew">Do you go left, right or down the middle?</voice></speak>')
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
    var speechText = ""
    if(attributes.litTorch === 1){
      if(attributes.ogreAsleep === 1){
        speechText = '<speak><voice name="Matthew">You choose the middle Path. It leads to another seemingly empty circular room. ' +
        'As you step into the room you notice a Huge Sleeping Ogre to the left and you Freeze, hoping he won’t wake up. ' +
        'As you slowly step back the noise of your boots rouses the Ogre, grogy with sleep he hasn’t noticed you yet. Do you: Attack or Retreat?' +
        '</voice></speak>';
        attributes.lastPos = 'middle';
        
      } else if(attributes.ogreAsleep === 0 && attributes.ogreAlive === 1){
        attributes.lastPos = 'entrance';
      } else if(attributes.ogreAlive === 0){
        attributes.lastPos = 'entrance'
      }
    } else{
      speechText =  '<speak><voice name="Matthew">You make your way down the path but it gets too dark for you to see. ' +
                    'You decide to turn around and try to find another way through the dungeon. You make your way back to the dungeon entrance. ' + 
                    'Now do you go left, or right?</voice></speak>';
    }
    
    handlerInput.attributesManager.setSessionAttributes(attributes);
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt('<speak><voice name="Matthew">Do you attack the ogre or flee?</voice></speak>')
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
      speechText = '<speak><voice name="Matthew">You can\'t go right now!</voice></speak>';
    } else if(attributes.boulderPushed === 0){
      speechText = `<speak><voice name="Matthew">You walk through the right corridor until you come accross a huge boulder blocking your path.
                    Using your level ${attributes.stats[0]} strength, you push the boulder out of your way.
                    Behind the boulder is a secret room. You notice an open chest in front of you.
                    Inside the chest, you find a golden key. Wondering what to do with it, you head back to the dungeon entrance to find a use for the key. 
                    Now where do you go? To the left, or the middle?</voice></speak>`;
      // Set the correct attributes
      attributes.boulderPushed = 1;
      attributes.hasKey = 1;
    } else if(attributes.boulderPushed === 1){
      speechText = '<speak><voice name="Matthew">You have been here already found the mysterious key in the chest.</voice></speak>';
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
    // if (attributes.lastPos != 'entrance roll dice' && attributes.lastPos != 'entrance') {
    //   speechText = '<speak><voice name="Matthew">You can\'t go left now!</voice></speak>';
    // } else {
      speechText =  '<speak><voice name="Matthew">You go down the left corridor. In the distance you see a goblin who has a torch. ' +
                    'He attacks you but since you are an experienced ' + attributes.char_class + ', you are able to defend yourself against his attack. ' +
                    'After a long struggle, you finally kill him and you take his torch in order to help guide your way through the rest of the dungeon. ' +
                    'You go back to the dungeon entrance. Do you go to the right, or down the middle?</voice></speak>';
      // Set the correct attributes
      attributes.hasTorch = 1;
    // }
    attributes.lastPos = 'left'
    handlerInput.attributesManager.setSessionAttributes(attributes);
    return handlerInput.responseBuilder
      // Ask for the user's class
      .speak(speechText)
      .reprompt('<speak><voice name="Matthew">Where do you go?</voice></speak>')
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
    const speechText = '<speak><voice name="Matthew">You light your torch</voice></speak>';

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
    attributes.lastPos = 'middle';
    // Get the session attributes, get the name from the attributes
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const lastPos = attributes.lastPos;
    if (false) {
      return handlerInput.responseBuilder
      .speak('<speak><voice name="Matthew">There is no enemy here to fight!</voice></speak>')
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
        speechText += '<speak><voice name="Matthew">Your attack hits the ogre for ' + dam + ' damage</voice></speak>';
        attributes.ogreHP -= dam;
      } else{
        speechText += '<speak><voice name="Matthew">Your attack missed. </voice></speak>';
      }
      //enemy attacks
      dam = oAttack(attributes);
      if(dam > 0){
        speechText += '<speak><voice name="Matthew">The Ogre hits you for ' + dam + ' damage. </voice></speak>';
        attributes.PCHP -= dam;
        if(attributes.PCHP <= 0){
          speechText += '<speak><voice name="Matthew">You have died</voice></speak>';
          return handlerInput.responseBuilder
          .speak(speechText)
          .getResponse();
        }
      } else{
        speechText += '<speak><voice name="Matthew">The ogres attack whiffed.</voice></speak>';
      }
      if(attributes.ogreHP <= 0){
        attributes.ogreAlive = 0;
        handlerInput.attributesManager.setSessionAttributes(attributes);
        speechText += '<speak><voice name="Matthew">The ogre is slain.</voice></speak>';
        if(attributes.hasKey === 0){
          speechText += '<speak><voice name="Matthew">You notice a door but it is locked.</voice></speak>';
        } else{
          speechText += 'You notice a door and unlock it with your key. You find yourself in a large strange room.</voice></speak>';
        }
        speechText += 'You may attack again.';
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
          speechText += 'Your attack missed. ';
        }
        //enemy attacks
        dam = oAttack(attributes);
        if(dam > 0){
          speechText += 'The goblin hits you for ' + dam + ' damage. ';
          attributes.PCHP -= dam;
          if(attributes.PCHP <= 0){
            speechText += 'You have died';
            return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
          }
        } else{
          speechText += 'The goblin\'s attack whiffed. ';
        }
        if(attributes.goblinHP <= 0){
          attributes.goblinAlive = 0;
          attributes.lastPos = 'goblin';
          handlerInput.attributesManager.setSessionAttributes(attributes);
          speechText += 'The goblin is slain. ';
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
    speechText += 'You may attack again.';
    handlerInput.attributesManager.setSessionAttributes(attributes);
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt('<speak><voice name="Matthew">Attack or flee?</voice></speak>')
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
    const speechText = `Farewell, adventurer ${attributes.name}`;

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
