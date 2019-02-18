jsPsych.plugins['audio-slider-audio-response'] = (function() {
	let plugin = {};

    plugin.info = {
        name: 'audio-slider-audio-response',
        description: '',
        parameters: {
            stimulus: {
                type: jsPsych.plugins.parameterType.OBJECT,
                pretty_name: 'Stimulus',
                default: {},
                description: 'The sound properties'
            },
            min: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Min slider',
                default: 300,
                description: 'Sets the minimum value of the slider.'
            },
            max: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Max slider',
                default: 3000,
                description: 'Sets the maximum value of the slider',
            },
            start: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Slider starting value',
                default: 1350,
                description: 'Sets the starting value of the slider',
            },
            step: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Step',
                default: 1,
                description: 'Sets the step of the slider'
            },
            reverse_slider: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Reverse selection slider',
                default: false,
                description: 'If true, will reverse selection slider'
            },
            slider_width_px: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Slider width',
                default: 0,
                description: 'Sets the width of the slider'
            },
            labels: {
                type: jsPsych.plugins.parameterType.KEYCODE,
                pretty_name:'Labels',
                default: [],
                array: true,
                description: 'Labels of the slider.',
            },
            fixation: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Fixation',
                default: '<div style="font-size:60px;">+</div>',
                array: false,
                description: 'Fixation before the trial starts'
            },
            fixation_time: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Fixation Time',
                default: 5,
                array: false,
                description: 'Timeout for fixation before the trial starts'
            },
            end_button_label: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Button label',
                default: 'Continue',
                array: false,
                description: 'Label of the button to advance.'
            },
            prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Prompt',
                default: null,
                description: 'Any content here will be displayed below the slider.'
            },
            choices: {
                type: jsPsych.plugins.parameterType.KEYCODE,
                array: true,
                pretty_name: 'Choices',
                default: jsPsych.ALL_KEYS,
                description: 'The keys the subject is allowed to press to respond to the stimulus.'
            },
            trial_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Trial duration',
                default: null,
                description: 'How for selection before it ends.'
            }
        }
    };

    plugin.trial = function(display_element, trial) {

        /**
         * Trial Stimulus Config Format:
         *
         * waveType: one of ['sine', 'square', 'triangle', 'sawtooth'] --> Defaults to 'sine' {NOT REQUIRED}
         * stimulus_freqs: List of stimulus frequencies to run trial on --> Defaults to random generated list {NOT REQUIRED}
         * stimulus_freqs_length: length for randomly generated list of stimulus frequencies --> defaults to randomly generated number {NOT REQUIRED}
         * waitTime: time to wait in between stimulus tones --> Defaults to 2 seconds {NOT REQUIRED}
         *
         * if specifying randomly generated ranges:
         *      stimulus_freqs_rand_quant_start: start of range of randomly generated quantity of samples to be generated.
         *      stimulus_freqs_rand_quant_end: end of range of randomly generated quantity of samples to be generated.
         *      stimulus_freqs_rand_freq_start: start of range of randomly generated frequencies of the samples.
         *      stimulus_freqs_rand_freq_end: start of range of randomly generated frequencies of the samples.
         * **/

        // Define Trial functions
        let playStimulsOscillator = function (freq) {
            loadAndStartOscillator(freq);
            gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.25);
            oscillatorNode.stop(context.currentTime + 1);
        };

        let loadAndStartOscillator = function (freq){
            oscillatorNode = context.createOscillator();
            gainNode = context.createGain();
            oscillatorNode.type = waveType;
            oscillatorNode.frequency.value = freq;
            oscillatorNode.connect(gainNode);
            gainNode.connect(context.destination);
            gainNode.gain.setValueAtTime(0.50, context.currentTime);
            oscillatorNode.start();
        };

        let playResponseOscillator = function (freq){
            stopResponseOscillator();
            loadAndStartOscillator(freq);
        };

        let updateResponseOscillator = function (freq){
          oscillatorNode.frequency.exponentialRampToValueAtTime(freq, context.currentTime + 0.25);
        };

        let stopResponseOscillator = function(){
            gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.25);
            oscillatorNode.stop(context.currentTime + 0.25);
        };

        let getRandomInt = function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        // Initiate Web Audio
        jsPsych.pluginAPI.initAudio();

        let context = jsPsych.pluginAPI.audioContext();
        if(context === null){
            console.log("An Error Occured with the Audio Context");
        }

        // Define Trial Variables
        //Wave Type
        let waveType = '';
        if (['sine', 'square', 'triangle', 'sawtooth'].indexOf(trial.stimulus.waveType) >= 0) {
            waveType = trial.stimulus.waveType;
        }else{
            waveType = 'sine';
        }

        //Stimulus Frequency Samples
        let stimulus_freqs = [];
        let numOfSamples = 0;
        if (!trial.stimulus.hasOwnProperty('stimulus_freqs')) {
            if (!trial.stimulus.hasOwnProperty('stimulus_freqs_length')){
                let set_lengths = [1,3,5];
                numOfSamples = set_lengths[getRandomInt(0,2)];
            }else{
                numOfSamples = trial.stimulus.stimulus_freqs_length;
            }

            let rand_freq_start = 300;
            let rand_freq_end = 3000;
            if (trial.stimulus.hasOwnProperty('stimulus_freqs_rand_freq_start')){
                rand_freq_start = trial.stimulus.stimulus_freqs_rand_freq_start
            }
            if (trial.stimulus.hasOwnProperty('stimulus_freqs_rand_freq_end')){
                rand_freq_end = trial.stimulus.stimulus_freqs_rand_freq_end
            }

            for (let i = 0; i < numOfSamples; i++){
                stimulus_freqs.push(getRandomInt(rand_freq_start, rand_freq_end))
            }
        }else{
            stimulus_freqs = trial.stimulus.stimulus_freqs;
        }

        //Wait Times for Stimulus
        let waitTime = 0;
        if (!trial.stimulus.hasOwnProperty('waitTime')){
            waitTime = 2000;
        }else{
            waitTime = trial.stimulus.waitTime * 1000;
        }

        // Sound nodes
        let gainNode = null;
        let oscillatorNode = null;


        /** Setup Page HTML**/
        // Stimulus HTML
        let html = '<div id="jspsych-audio-slider-response-begin">' + trial.fixation + '</div>';

        html += '<div style="display: none;" id="stimulusNodes" class="divTable">';
        html += '<div class="divTableBody">';
        html += '<div id="soundNodes" class="divTableRow">';
        for(let i=0; i < stimulus_freqs.length; i++){
            html += '<div id="soundNode'+i.toString()+'" class="divTableCell"><img style="height: 50px; width: 50px;" src="img/black.jpg"/></div>'
        }
        html += '</div>';
        html += '<div id="soundIndicators" class="divTableRow">';
        for(let i=0; i < stimulus_freqs.length; i++){
            html += '<div id="soundIndicator'+i.toString()+'" class="divTableCell"><img id="soundIndicatorArrow'+i.toString()+'" style="display: none; height: 50px; width: 50px;" src="img/arrow.png"/></div>'
        }
        html += '</div>';
        html += '</div>';
        html += '</div>';

        let range_style = '';
        if (trial.reverse_slider == true){
            range_style = ' direction: rtl;';
        }

        // Response HTML
        let slider_width_style = '';
        if (trial.slider_width_px != 0){
            slider_width_style += ' width:' + trial.slider_width_px.toString() + 'px; ';
        }
        html += '<div id="jspsych-audio-slider-response-wrapper" style=" display: inline-block;' + slider_width_style + 'margin: 100px 0px;">';
        html += '<div class="jspsych-audio-slider-response-container" id="jspsych-audio-slider-response-container" style="display:none; position:relative; width:100%;">';
        html += '<input type="range" value="'+trial.start+'" min="'+trial.min+'" max="'+trial.max+'" step="'+trial.step+'" style="width: 100%;'+ range_style +'" id="jspsych-audio-slider-response-response"></input>';
        html += '<div>';
        for(let j=0; j < trial.labels.length; j++){
            let width = 100/(trial.labels.length-1);
            let left_offset = (j * (100 /(trial.labels.length - 1))) - (width/2);
            html += '<div style=" position: absolute; left:'+left_offset+'%; text-align: center; width: '+width+'%;">';
            html += '<span style="text-align: center; font-size: 80%;">'+trial.labels[j]+'</span>';
            html += '</div>'
        }
        if (trial.prompt !== null){
            html += '<div id="jspsych-audio-slider-audio-response-prompt" style="display: none">' + trial.prompt + '</div>'
        }
        html += '</div>';
        html += '</div>';


        html += '<button style="display: none; margin-top: 80px;" id="jspsych-audio-slider-response-next" class="jspsych-btn">'+trial.end_button_label+'</button>';
        html += '</div>';


        display_element.innerHTML = html;


        //define variables outside trial scope
        let response = {
            correctFreq: 0,
            guessedFreq: 0
        };
        let randomPick = null;

        // Define Trial
        let trial_procedure = function() {
            document.getElementById('jspsych-audio-slider-response-begin').style.display = 'none';
            document.getElementById('stimulusNodes').style.display = 'table';
            for (let i = 1; i <= stimulus_freqs.length; i++) {
                setTimeout(function() { return function() { document.getElementById("soundIndicatorArrow"+(i-1).toString()).style.display = 'inline-block';}; }(), waitTime*i);
                setTimeout(function(x) { return function() { playStimulsOscillator(stimulus_freqs[x]) }; }(i-1), waitTime*i);
                setTimeout(function() { return function() { document.getElementById("soundIndicatorArrow"+(i-1).toString()).style.display = 'none';}; }(), (waitTime*i)+waitTime);
            }
            randomPick = getRandomInt(0,(stimulus_freqs.length - 1));
            response.correctFreq = stimulus_freqs[randomPick];
            setTimeout(function() { return function() { document.getElementById("soundIndicatorArrow"+(randomPick).toString()).style.display = 'inline-block';}; }(), (waitTime * stimulus_freqs.length)+waitTime);
            setTimeout(function() { return function() { document.getElementById("jspsych-audio-slider-response-container").style.display = 'inline-block';}; }(), (waitTime * stimulus_freqs.length)+waitTime);
            setTimeout(function() { return function() { document.getElementById("jspsych-audio-slider-response-next").style.display = 'inline-block';}; }(), (waitTime * stimulus_freqs.length)+waitTime);
            if (trial.prompt !== null){
                setTimeout(function() { return function() { document.getElementById("jspsych-audio-slider-audio-response-prompt").style.display = 'inline-block';}; }(), (waitTime * stimulus_freqs.length)+waitTime);
            }
        };

        setTimeout(trial_procedure, (trial.fixation_time * 400));

        let started = false;
        let timeout_stopped = false;

        let selection_time_start;
        let selection_time_end;
        let selection_time;
        let idleTime = 0;
        let timerIncrement = function() {
            idleTime = idleTime + 1;
            if (idleTime > 1) {
                stopResponseOscillator();
                timeout_stopped = true;
            }
        };
        let idleInterval = setInterval(timerIncrement, 500);
        let response_event = function(){
            console.log("#jspsych-audio-slider-response-response input activated!");
            if(!started){
                console.log("not started");
                playResponseOscillator(trial.start);
                selection_time_start = context.currentTime;

                // end trial if trial_duration is set
                if (trial.trial_duration !== null) {
                    jsPsych.pluginAPI.setTimeout(function() {
                        selection_time = trial.trial_duration;
                        end_trial();
                    }, trial.trial_duration * 1000);
                }

                started = true;
            } else if (timeout_stopped){
                console.log("timeout_stopped");
                playResponseOscillator(parseFloat(this.value));
                timeout_stopped = false;
            }else{
                updateResponseOscillator(parseFloat(this.value));
                response.guessedFreq = parseFloat(this.value);
                idleTime = 0;
            }
        };
        display_element.querySelector('#jspsych-audio-slider-response-response').addEventListener('input', response_event);

        display_element.querySelector('#jspsych-audio-slider-response-next').addEventListener('click', function(){
            selection_time_end = context.currentTime;
            selection_time = selection_time_end - selection_time_start
            stopResponseOscillator();
            end_trial();
        });

        let end_trial = function(){
            jsPsych.pluginAPI.clearAllTimeouts();

            if(context !== null){
                context.suspend();
            }

            // save data
            let trialdata = {
                "correctFreq": response.correctFreq,
                "stimulus": trial.stimulus,
                "guessedFreq": response.guessedFreq,
                "freq_difference": Math.abs(response.correctFreq - response.guessedFreq),
                "time_to_guess": selection_time,
                "num_samples": numOfSamples,
                "stimulus_freqs": stimulus_freqs,
                "probe_position": randomPick
            };

            display_element.innerHTML = '';

            // next trial
            jsPsych.finishTrial(trialdata);
        };

    };

    return plugin;
})();
