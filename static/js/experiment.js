
async function initializeExperiment() {
  LOG_DEBUG('initializeExperiment');

function drawProgressBar(msg) {
    document.querySelector('.jspsych-display-element').insertAdjacentHTML('afterbegin',
      '<div id="jspsych-progressbar-container">'+
      '<span>'+
      msg+ 
      '</span>'+
      '<div id="jspsych-progressbar-outer">'+
        '<div id="jspsych-progressbar-inner"></div>'+
      '</div></div>');
  }
  ///////////
  // Setup //
  ///////////
 
  // This ensures that images appear exactly when we tell them to.
  img_path = 'stimuli/img'
  stimNames = ['A', 'B', 'C', 'D'];
  stimNums = Array.from({length: 6}, (_, i) => i + 1).map(String);

  f = (a, b) => [].concat(...a.map(a => b.map(b => [].concat(a, b))));
  cartesian = (a, b, ...c) => b ? cartesian(f(a, b), ...c) : a;

  stimIdentifiers =  cartesian(stimNums, stimNames); // so stim and targetd ordered by sets
  targetIdentifiers = cartesian(stimNums, ['T']); // so stim and targetd ordered by sets

  formattedStims = stimIdentifiers.map(function (currentElement) {
    return img_path + '/' + currentElement[1] + '_' + currentElement[0] + '.svg'});
  
  formattedTargets = targetIdentifiers.map(function (currentElement) {
    return img_path + '/' + currentElement[1] + '_' + currentElement[0] + '.svg'});
  balancedTargets = formattedTargets.reduce((m,i) => m.concat([i,i,i,i]), []);
  
  jsPsych.pluginAPI.preloadImages(formattedStims.concat(formattedTargets));

    /* create timeline */
    var timeline = [];

  //////////////////
  // Instructions //
  //////////////////

    var welcome_block = {
      type: "html-keyboard-response",
      stimulus: `
      <div class="instructions">
        <p class="center">Welcome to the experiment. Press any key to begin.</p>
      </div>
      `,
      post_trial_gap: 500,
      on_start: function(){
  document.querySelector('#jspsych-progressbar-container').style.display = 'none';
}
    };

    timeline.push(welcome_block)
    /* define instructions trial */
    var instructions_block = {
      type: "html-keyboard-response",
      stimulus: `
        <div class="instructions">
          <p>In this experiment, we are interested in understanding how people make similarity judgements. We will ask you to rate the similarity of different visual stimuli. Each stimulus is a collection of 2-5 shapes of different shading, and will look something like this: <br>
          <img src='static/images/T.svg' style="width:30%;padding:10px;"></img> 
          <br>
          In the <em>training</em> phase, we will present the stimuli <b> one at a time </b> so that you can become familiar with them. No response is required, and you will not be tested on them later.<br>
          <br>
          <br>
          In the <em>testing</em> phase, we will present the stimuli <b> two at a time</b>, and ask you to rate the similarity of two stimuli by clicking a button on the screen. <br>
          <br>
          <br>
          Press any key to continue.</p>
        </div>
      `,
      post_trial_gap: 500
    };

    timeline.push(instructions_block)

    var train_instructions_block = {
      type: "html-keyboard-response",
      stimulus: `
        <div class="instructions">
        <p>In this <em>training</em> phase, we will show you the stimuli that we will be using in this experiment <b> one at a time </b> so that you can become familiar with them. There will be five stimuli, repeated twice. 
        <br> 
        <br>
        No response is required, simply observe the stimuli. <br>
        <br>
        Press any key to continue.</p>
        </div>
      `,
      post_trial_gap: 500,
      on_finish: function(){
        drawProgressBar('Training Progress')
  document.querySelector('#jspsych-progressbar-container').style.display = 'block';
      }
    };
    timeline.push(train_instructions_block)

    var test_instructions_block = {
      type: "html-keyboard-response",
      stimulus: `
        <div class="instructions">
        <p>In this <em>testing</em> phase, two stimuli will appear in the center 
        of the screen at the same time.<br>
        <br>
        We will ask you to press a button from 1 (not very similar) to 9 (highly similar) to indicate how similar the 
        stimuli are. <br>
        <br>
        A cross will appear in between trials, and will look like this: <br><br><br> <font size=100px>+</font> <br><br><br>
        Press any key to continue.</p>
        </div>
      `,
      post_trial_gap: 500,
      on_start: function(){
  document.querySelector('#jspsych-progressbar-container').style.display = 'none'},
      on_finish: function(){
        jsPsych.setProgressBar(0)
        drawProgressBar('Testing Progress')
  document.querySelector('#jspsych-progressbar-container').style.display = 'block'}
    };


  /////////////////
  // Stimuli //
  /////////////////

    var trainStimuli = formattedStims.concat(formattedTargets).map(
      (function (currentElement) {
    return {stimulus: currentElement}}));

    var train_step = 1 / 25 // 25 training images used in original paper by Gentner

    var testStimuli = balancedTargets.map(function(e, i) {
    return [e, formattedStims[i]]});
  var test_step = 1 / (testStimuli.length * 2)
  /////////////////
  // Inter-trial //
  /////////////////


    var fixation = {
      type: 'html-keyboard-response',
      stimulus: '<div class="training" style="font-size:100px;">+</div>',
      choices: jsPsych.NO_KEYS,
      trial_duration: function(){
        return jsPsych.randomization.sampleWithoutReplacement([250, 500, 750, 1000, 1250, 1500, 1750, 2000], 1)[0];
      },
      data: {
        task: 'fixation'
      }
    }


  /////////////////
  // Train trials //
  /////////////////
   var train = {
      type: "html-keyboard-response",
      stimulus: function(){
                var html = `
                <div class="training";'><img src="${jsPsych.timelineVariable('stimulus')}" width="45%"></img></div>
                <p></p>`;
                return html;
            },
      
      choices: jsPsych.NO_KEYS,
      stimulus_duration: 3000,
      trial_duration: 4000,
      data: {
        task: 'training'
      },
      on_finish: function(){
        var new_prog = jsPsych.getProgressBarCompleted() + train_step
        jsPsych.setProgressBar(new_prog); // set progress bar to 85% full.
      }
    }

    var train_block = {
      timeline: [train],
      timeline_variables: trainStimuli,
      sample: {
        type: 'without-replacement',
        size: 25}
      randomize_order: true
    }

timeline.push(train_block)
  /////////////////
  // Test trials //
  /////////////////

//   The left/right position of the target and the test picture is randomized,
// and counterbalanced on a second display to the subject. 

timeline.push(test_instructions_block)
function test_R(stim) {
  var test = {
    type: "html-button-response",
    prompt: `<p>How similar are these stimuli? <br> Click a button from 1 (not very similar) to 9 (highly similar). </p>`,
    choices: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    data: {
        task: 'response_R'
    },
    on_finish: function(){
        var new_prog = jsPsych.getProgressBarCompleted() + test_step
        jsPsych.setProgressBar(new_prog); // set progress bar to 85% full.
      },
    stimulus:`
            <div>
            <img src='static/images/T.svg' style="width:45%;padding:10px;"></img>
            <img src="${stim}" style="width:45%;padding:10px;"></img>
            </div>
        ` 
    }
  return test
}

function test_L(stim) {
  var test = {
    type: "html-button-response",
    prompt: `<p>How similar are these stimuli? <br> Click a button from 1 (not very similar) to 9 (highly similar). </p>`,
    choices: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    data: {
        task: 'response_L'
    },
    on_finish: function(){
        var new_prog = jsPsych.getProgressBarCompleted() + test_step
        jsPsych.setProgressBar(new_prog); // set progress bar to 85% full.
      },
    stimulus:`
            <div>
            <img src="${stim}" style="width:45%;padding:10px;"></img>
            <img src='static/images/T.svg' style="width:45%;padding:10px;"></img>
            </div>
        ` 
    }
  return test
}

var N = testStimuli.length
var stimDoubled = testStimuli.concat(testStimuli)

var side = _.shuffle(Array(N/2).fill(0).concat(Array(N/2).fill(1)))
let secondSide = Array(N).fill(1).map((v, i) => v - side[i])
var sideDoubled = side.concat(secondSide)

randomIndices = _.shuffle(Array.from({length: N*2}, (x, i) => i))

// stage 2 is to add permutation
for (let i = 0; i < N*2; i++) {
  index = randomIndices[i]
  sideDoubled[index] ? timeline.push(test_L(stimDoubled[index])) : timeline.push(test_R(stimDoubled[index]))
  if (i === (N*2)-1) { break; }
  timeline.push(fixation)
  
}


  /////////////////////////
  // Debrief functiions //
  /////////////////////////

  // function getAverageResponseTime() {

  //   var trials = jsPsych.data.get().filter({task: 'response'});

  //   var sum_rt = 0;
  //   for (var i = 0; i < trials.length; i++) {
  //       sum_rt += trials[i].rt;
  //     }
  //   return trials
  //   // return Math.floor(sum_rt / trials.length);
  // }
// <div class="training"> Your average response time was ${getAverageResponseTime()}.<br>

  var debrief = {
    type: "html-keyboard-response",
    on_start: function(){
  document.querySelector('#jspsych-progressbar-container').style.display = 'none'},
    stimulus() {
      return `
      <div class="training"> You  have finished! Thank you. We have automatically recorded your Participant ID. 
      <br> Press any key to advance to an annonymous survey, which we are using for piloting. </div>
      `
    }
  };

  var survey = {
    type: "survey-multi-select",
    questions: [
    {
      prompt: "What is your age?", 
      options: ["10-20", "21-30", "31-40", "41-50", "51-60", "60+", "Prefer not to say"], 
      horizontal: true,
      required: true,
      name: 'Age'
    }, 
    {
      prompt: "How would you describe your gender?", 
      options: ["Woman ", "Man", "Non-binary", "Transgender", "Gender non-conforming", "Prefer not to say"], 
      horizontal: true,
      required: true,
      name: 'Gender'
    }, 
    {
      prompt: "How many years of high school and university math education have you had?", 
      options: ["0-2", "3-4", "5-6", "7-8", "8-9", "10+", "Prefer not to say"], 
      horizontal: true,
      required: true,
      name: 'Math'
    }
  ], 
    preamble: `<div>This is a short survey to help us design further experiments. 
    We would be most grateful if you could answer to the best of your ability. There is an option 
    to not provide an answer to each question. </div>`,
    };

  var thankyou = {
    type: "html-keyboard-response",
    stimulus() {
      return `
      <div class="training"> Thank you for finishing the survey! Your answers will help us develop these experiments. 
      <br> Press any key to finish. </div>
      `
    }
  };

timeline.push(debrief)
timeline.push(survey)
timeline.push(thankyou)

  /////////////////////////
  // Experiment timeline //
  /////////////////////////

  // `timeline` determines the high-level structure of the
  // experiment. When developing the experiment, you
  // can comment out blocks you aren't working on
  // so you don't have to click through them to test
  // the section you're working on.

  // var timeline = [welcome_block,
  //   instructions_block,
  //   train_instructions_block,
  //   train_block,
  //   test_instructions_block,
  //   test_block,
  //   debrief_block,
  // ];

  if (searchParams.get('skip') != null) {
    timeline.splice(0, parseInt(searchParams.get('skip')))
  }

  return startExperiment({
    timeline,
    exclusions: {
      min_width: 800,
      min_height: 600
    },
  });
};


