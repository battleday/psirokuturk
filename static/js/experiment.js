
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
                <div><img src='static/images/T.svg' style="width:50%;padding:10px;"></img><img src="${jsPsych.timelineVariable('stimulus')}" style="width:50%;padding:10px;"></img></div>
                `
                return html;
            },  
      prompt: `<p>How similar are these stimuli? <br> Click a button from 1 (not very similar) to 9 (highly similar). </p>`,
      choices: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      data: {
        task: 'response'
      }
    }

    var test_backward = {
      type: "html-button-response",
      stimulus: function(){
                var html = `
                <div><img src="${jsPsych.timelineVariable('stimulus')}" style="width:50%;padding:10px;"></img><img src='static/images/T.svg' style="width:50%;padding:10px;"></img></div>
                `
                return html;
            },  
      prompt: `<p>How similar are these stimuli? <br> Click a button from 1 (not very similar) to 9 (highly similar). </p>`,
      choices: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      data: {
        task: 'response'
      }
    }

    var test_sub_block = {
      timeline: [test, test_backward],
      timeline_variables: test_stimuli,
      repetitions: 1,
      randomize_order: true
    }

    var test_block = {
      timeline: [test_sub_block, fixation],
      timeline_variables: test_stimuli,
      repetitions: 1,
      randomize_order: false
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
  var debrief_block = {
    type: "html-keyboard-response",
    stimulus() {
      return `
        
      <div class="training"> Thank you for finishing! We have automatically recorded your Participant ID. 
      <br> Press any key to complete the experiment. </div>
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


