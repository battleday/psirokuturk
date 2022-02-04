
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
  var loc = window.location.pathname;
  var dir = loc.substring(0, loc.lastIndexOf('/'));
  console.log(dir);
  // This ensures that images appear exactly when we tell them to.
  img_path = 'static/images'
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
        <p class="center"> Welcome to the experiment. <br><br>

        Press any key to begin. <br><br>


        There may be a short delay as the experiment loads. 
        </p>
      </div>
      `,
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
          <p>In this experiment, we are interested in understanding how people make similarity judgements. We will ask you to rate the similarity of different pictures. Each picture is a collection of 2-5 shapes of different shading, and will look something like this: <br>
          <img src='static/images/T_1.svg' style="width:30%;padding:10px;"></img> 
          <br>
          In the <em>familiarization</em> phase, we will present the pictures <b> one at a time </b> so that you can become familiar with them. Simply observe the picture, and when the instruction appears press any key to move on to the next one.<br>
          <br>
          <br>
          In the <em>rating</em> phase, we will present the pictures <b> two at a time</b>, and ask you to rate the similarity of two pictures by clicking a button on the screen. <br>
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
        <p>In this <em>familiarization</em> phase, we will show you the pictures that we will be using in this experiment <b> one at a time </b> so that you can become familiar with them. There will be 25 pictures. 
        <br>
        <br>
        Simply observe the picture, and when the instruction appears press any key to move on to the next one. <br>
        <br>
        Press any key to continue.</p>
        </div>
      `,
      post_trial_gap: 500,
      on_finish: function(){
        drawProgressBar('Progress: familiarization phase')
  document.querySelector('#jspsych-progressbar-container').style.display = 'block';
      }
    };
    timeline.push(train_instructions_block)

    var test_instructions_block = {
      type: "html-keyboard-response",
      stimulus: `
        <div class="instructions">
        <p>In this <em>rating</em> phase, two pictures will appear in the center 
        of the screen at the same time.<br>
        <br>
        We will ask you to rate the similarity of the two pictures. When the instruction appears, click a button to record your rating. <br> <br>
        Click the "1" key if the pictures are not very similar
        <br> 
        Click the "9" key if the pictures are highly similar. <br> 
        Click the other number keys if the similarity is in between these. <br>
        <br>
        Press any key to continue.</p>
        </div>
      `,
      post_trial_gap: 500,
      on_start: function(){
  document.querySelector('#jspsych-progressbar-container').style.display = 'none'},
      on_finish: function(){
        jsPsych.setProgressBar(0)
        drawProgressBar('Progress: rating phase')
  document.querySelector('#jspsych-progressbar-container').style.display = 'block'}
      };


  /////////////////
  // Stimuli //
  /////////////////

  var trainStimuli = formattedStims.concat(formattedTargets).map(
      (function (currentElement) {
    return {stimulus: currentElement}}));

  var train_step = 1 / 25 // 25 training images used in original paper by Gentner

  var testStimuli = balancedTargets.concat(formattedStims).map(function(e, i) {
    return [e, formattedStims.concat(balancedTargets)[i]]});
  var test_step = 1 / (testStimuli.length)

  /////////////////
  // Train trials //
  /////////////////
   var train_watch = {
      type: "html-keyboard-response",
      stimulus: function(){
                var html = `
                <div class="training">
                <img src="${jsPsych.timelineVariable('stimulus')}" width="45%"></img>
                <p> &nbsp </p>
                </div>`;
                return html;
            },
      
      choices: jsPsych.NO_KEYS,
      trial_duration: 3000, // should be 3000
      data: {
        task: 'training_watch'
      }
    }

    var train_respond = {
      type: "html-keyboard-response",
      stimulus: function(){
                var html = `
                <div class="training"> 
                <img src="${jsPsych.timelineVariable('stimulus')}" width="45%"></img>
                <p> Press any key to continue. </p>
                </div>
                `;
                return html;
            },
      data: {
        task: 'training_response'
      },
      on_finish: function(){
        var new_prog = jsPsych.getProgressBarCompleted() + train_step
        jsPsych.setProgressBar(new_prog); // set progress bar to 85% full.
      }
    }

    var train_block = {
      timeline: [train_watch, train_respond],
      timeline_variables: trainStimuli,
      sample: {
        type: 'without-replacement',
        size: 25},
      randomize_order: true
    }

timeline.push(train_block)
  /////////////////
  // Test trials //
  /////////////////

//   The left/right position of the target and the test picture is randomized,
// and counterbalanced on a second display to the subject. 

timeline.push(test_instructions_block)



function test_watch(stim) {
  var test = {
    type: "html-button-response",
    prompt: `<p> How similar are these pictures? <br> </p>`,
    data: {
        task: 'test_watch'
    },
    choices: [],
    trial_duration: 1000,
    stimulus: 
      `
            <div>
            <img src="${stim[0]}" style="width:45%;padding:10px;"></img>
            <img src="${stim[1]}" style="width:45%;padding:10px;"></img>
            <p> &nbsp </p>
            </div>
            <div id="jspsych-html-button-response-btngroup">
            <div class="jspsych-html-button-response-button" 
              style="display: inline-block; margin:'+0px+' '+8px+'" 
              id="jspsych-html-button-response-button-' + 0 +'" data-choice="'+0+'"> 
              <button class="jspsych-btn-ghost">0</button>
              </div>
            </div>
        ` 
    }
  return test
}
function test_respond(stim) {
  var test = {
    type: "html-button-response",
    prompt: `<p> How similar are these pictures? </p>`,
    choices: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    data: {
        task: 'test_respond'
    },
    on_finish: function(){
        var new_prog = jsPsych.getProgressBarCompleted() + test_step
        jsPsych.setProgressBar(new_prog); // set progress bar to 85% full.
      },
    stimulus:`
            <div>
            <img src="${stim[0]}" style="width:45%;padding:10px;"></img>
            <img src="${stim[1]}" style="width:45%;padding:10px;"></img>
            <p> Click a button from 1 (not very similar) to 9 (highly similar). </p>
            </div>
        ` 
    }
  return test
}

var N = testStimuli.length / 2

randomIndices = _.shuffle(Array.from({length: N*2}, (x, i) => i))

// stage 2 is to add permutation
for (let i = 0; i < N*2; i++) {
  index = randomIndices[i]
  timeline.push(test_watch(testStimuli[index]))
  timeline.push(test_respond(testStimuli[index]))
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

// IMPORTANT: REMOVE BELOW AFTER PILOTING

  var debrief = {
    type: "html-keyboard-response",
    on_start: function(){
  document.querySelector('#jspsych-progressbar-container').style.display = 'none'},
    stimulus() {
      return `
      <div class="training"> You  have finished! Thank you. We have automatically recorded your Participant ID. 
      <br> <br>
      Press any key to advance to an annonymous survey, which we are using to collect demographic data. </div>
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
      <br> 
      <br>
      Press any key to finish. </div>
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


