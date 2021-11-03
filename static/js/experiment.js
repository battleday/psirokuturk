
async function initializeExperiment() {
  LOG_DEBUG('initializeExperiment');

  ///////////
  // Setup //
  ///////////


  // This ensures that images appear exactly when we tell them to.
  jsPsych.pluginAPI.preloadImages(['static/images/T.svg', 'static/images/A.svg', 'static/images/B.svg',
    'static/images/C.svg', 'static/images/D.svg']);

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
      post_trial_gap: 500
    };

    timeline.push(welcome_block)
    /* define instructions trial */
    var instructions_block = {
      type: "html-keyboard-response",
      stimulus: `
        <div class="instructions">
          <p>In this experiment, we will ask you to rate the similarity of different visual stimuli. Each stimulus is a collection of 2-5 shapes of different shading, and will look something like this: <br>
          <img src='static/images/T.svg' style="width:50%;padding:10px;"></img> 
          <br>
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

    var train_instructions_block = {
      type: "html-keyboard-response",
      stimulus: `
        <div class="instructions">
        <p>In this <em>training</em> phase, we will show you the stimuli that we will be using in this experiment <b> one at a time </b> so that you can become familiar with them. 
        <br> 
        <br>
        No response is required, simply observe the stimuli. <br>
        <br>
        Press any key to continue.</p>
        </div>
      `,
      post_trial_gap: 500
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
      post_trial_gap: 500
    };


  /////////////////
  // Stimuli //
  /////////////////

    var trainStimuli = [
      { stimulus: "static/images/T.svg"},
      { stimulus: "static/images/A.svg"},
      { stimulus: "static/images/B.svg"},
      { stimulus: "static/images/C.svg"},
      { stimulus: "static/images/D.svg"}
    ];

    var testStimuli = [
       "static/images/A.svg",
       "static/images/B.svg",
       "static/images/C.svg",
      "static/images/D.svg"
    ];

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
                <div class="training";'><img src="${jsPsych.timelineVariable('stimulus')}" width="80%"></img></div>
                <p></p>`;
                return html;
            },
      
      choices: jsPsych.NO_KEYS,
      stimulus_duration: 3000,
      trial_duration: 4000,
      data: {
        task: 'training'
      }
    }

    var train_block = {
      timeline: [train],
      timeline_variables: trainStimuli,
      repetitions: 2,
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
    stimulus() {
      return `
      <div class="training"> Thank you for finishing! We have automatically recorded your Participant ID. 
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
      options: ["Woman ", "Man", "Non-binary", "Transgender", "Gender non-comforming", "Prefer not to say"], 
      horizontal: true,
      required: true,
      name: 'Gender'
    }, 
    {
      prompt: "How many years of high school and unviersity math education have you had?", 
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
      <div class="training"> Thank you for finishing! Your answers will help us develop these experiments. 
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


