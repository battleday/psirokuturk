
async function initializeExperiment() {
  LOG_DEBUG('initializeExperiment');

  ///////////
  // Setup //
  ///////////

  // trials = await $.getJSON 'static/json/rewards/increasing.json'
  const N_TRIAL = 4;

  // This ensures that images appear exactly when we tell them to.
  jsPsych.pluginAPI.preloadImages(['static/images/A.svg', 'static/images/B.svg',
    'static/images/C.svg', 'static/images/D.svg']);

    /* create timeline */
    var timeline = [];


  //////////////////
  // Instructions //
  //////////////////

    var welcome_block = {
      type: "html-keyboard-response",
      stimulus: "Welcome to the experiment. Press any key to begin."
    };

    /* define instructions trial */
    var instructions_block = {
      type: "html-keyboard-response",
      stimulus: `
        <p>In this experiment, two stimuli will appear in the center 
        of the screen. <br>

        Press a key from 1 (not similar) to 9 (very similar) to indicate how similar the 
        stimuli are. <br>
    
        Press any key to continue.</p>
      `,
      post_trial_gap: 500
    };

    /* test trials */
    var test_stimuli = [
      { stimulus: "static/images/A.svg"},
      { stimulus: "static/images/B.svg"},
      { stimulus: "static/images/C.svg"},
      { stimulus: "static/images/D.svg"}
    ];

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


  /////////////////
  // Test trials //
  /////////////////

    var test = {
      type: "html-keyboard-response",
      stimulus: function(){
                var html = `
                <p></p>
                <div style='float: center;'><img src='static/images/T.svg' width="25%"></img><img src="${jsPsych.timelineVariable('stimulus')}" width="25%"></img></div>
                <p></p>`;
                return html;
            },  
      prompt: `<p>How similar are these stimuli? <br> Press a key from 1 (not similar) to 9 (very similar) to indicate how similar the 
        stimuli are. </p>`,
      choices: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      data: {
        task: 'response'
      }
    }

    var test_block = {
      timeline: [fixation, test],
      timeline_variables: test_stimuli,
      repetitions: 1,
      randomize_order: true
    }

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

  var timeline = [
    welcome_block,
    instructions_block,
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


