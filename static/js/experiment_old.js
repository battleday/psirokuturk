
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

    /* define instructions trial */
    var instructions_block = {
      type: "html-keyboard-response",
      stimulus: `
        <div class="instructions">
          <p>In this experiment, we will ask you to rate the similarity of different visual stimuli. <br>
          <br>
          <br>
          In the <em>training</em> phase, we will present the stimuli one at a time. No response is required.<br>
          <br>
          <br>
          In the <em>testing</em> phase, we will ask you to rate the similarity of two stimuli by clicking a button on the screen. <br>
          <br>
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
        <p>In this <em>training</em> phase, we will show you the stimuli that we will be using in this experiment. No response is required. <br>
        <br>
        Press any key to continue.</p>
        </div>
      `,
      post_trial_gap: 500
    };

    var test_instructions_block = {
      type: "html-keyboard-response",
      stimulus: `
        <div class="instructions">
        <p>In this <em>testing</em> phase, two stimuli will appear in the center 
        of the screen. <br>
        <br>
        We will ask you to press a button from 1 (not very similar) to 9 (highly similar) to indicate how similar the 
        stimuli are. <br>
        <br>
        Press any key to continue.</p>
        </div>
      `,
      post_trial_gap: 500
    };


  /////////////////
  // Stimuli //
  /////////////////

    var train_stimuli = [
      { stimulus: "static/images/T.svg"},
      { stimulus: "static/images/A.svg"},
      { stimulus: "static/images/B.svg"},
      { stimulus: "static/images/C.svg"},
      { stimulus: "static/images/D.svg"}
    ];

    var test_stimuli = [
      { stimulus: "static/images/A.svg"},
      { stimulus: "static/images/B.svg"},
      { stimulus: "static/images/C.svg"},
      { stimulus: "static/images/D.svg"}
    ];

  /////////////////
  // Inter-trial //
  /////////////////


    var fixation = {
      type: 'html-keyboard-response',
      stimulus: '<div style="font-size:60px;">+</div>',
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
                <div class="center-image";'><img src="${jsPsych.timelineVariable('stimulus')}" width="50%"></img></div>
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
      timeline_variables: train_stimuli,
      repetitions: 2,
      randomize_order: true
    }

  /////////////////
  // Test trials //
  /////////////////

//   TODO: The left/right position of the target and the test picture was randomized,
// and counterbalanced on a second display to the subject.

    var test = {
      type: "html-button-response",
      stimulus: function(){
                var html = `
                <p></p>
                <div style='float: center;'><img src='static/images/T.svg' width="30%"></img><img src="${jsPsych.timelineVariable('stimulus')}" width="30%"></img></div>
                <p></p>`;
                return html;
            },  
      prompt: `<p>How similar are these stimuli? <br> Click a button from 1 (not very similar) to 9 (highly similar). </p>`,
      choices: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      data: {
        task: 'test_response'
      }
    }

    var test_block = {
      timeline: [fixation, test],
      timeline_variables: test_stimuli,
      repetitions: 1,
      randomize_order: true
    }


  /////////////////////////
  // Debrief functiions //
  /////////////////////////

  function getAverageResponseTime() {

    var trials = jsPsych.data.get().filter({task: 'response'});

    var sum_rt = 0;
    var valid_trial_count = 0;
    for (var i = 0; i < trials.length; i++) {
      if (trials[i].response == 'go' && trials[i].rt > -1) {
        sum_rt += trials[i].rt;
        valid_trial_count++;
      }
    }
    return Math.floor(sum_rt / valid_trial_count);
  }

  var debrief_block = {
    type: "html-keyboard-response",
    // We don't want to
    stimulus() {
      return `
        Your average response time was ${getAverageResponseTime()}.
        Press any key to complete the experiment. Thanks!
      `
    }
  };


  /////////////////////////
  // Experiment timeline //
  /////////////////////////

  // `timeline` determines the high-level structure of the
  // experiment. When developing the experiment, you
  // can comment out blocks you aren't working on
  // so you don't have to click through them to test
  // the section you're working on.

  var timeline = [welcome_block,
    instructions_block,
    train_instructions_block,
    train_block,
    test_instructions_block,
    test_block,
    debrief_block,
  ];

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


