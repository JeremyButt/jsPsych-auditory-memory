jsPsych.plugins['volume-setup-button-response'] = (function() {
    let plugin = {};

    plugin.info = {
        name: 'volume-setup-button-response',
        description: '',
        parameters: {
            stimulus: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Stimulus',
                default: 5000,
                description: 'The test tone frequency'
            },
            choices: {
                type: jsPsych.plugins.parameterType.KEYCODE,
                array: true,
                pretty_name: 'Choices',
                default: jsPsych.ALL_KEYS,
                description: 'The keys the subject is allowed to press to respond to the stimulus.'
            },
            prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Prompt',
                default: null,
                description: 'Any content here will be displayed below the stimulus.'
            }
        }
    };

    plugin.trial = function(display_element, trial) {


        let loadAndStartOscillator = function (freq){
            oscillatorNode = context.createOscillator();
            gainNode = context.createGain();
            oscillatorNode.type = 'sine';
            oscillatorNode.frequency.value = freq;
            oscillatorNode.connect(gainNode);
            gainNode.connect(context.destination);
            gainNode.gain.setValueAtTime(0.5, context.currentTime);
            oscillatorNode.start();
        };

        let playOscillator = function (freq){
            loadAndStartOscillator(freq);
        };

        let stopOscillator = function(){
            gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.5);
            oscillatorNode.stop(context.currentTime + 0.5);
        };

        // Initiate Web Audio
        jsPsych.pluginAPI.initAudio();

        let context = jsPsych.pluginAPI.audioContext();
        if(context === null){
            console.log("An Error Occured with the Audio Context");
        }

        // Sound nodes
        let gainNode = null;
        let oscillatorNode = null;


        /** Setup Page HTML**/
        // Stimulus HTML
        let html = '<div>Adjust your computer\'s volume to an appropriate value.</div>';

        html += '<div>' + trial.prompt + '</div>';

        display_element.innerHTML = html;

        playOscillator(trial.stimulus);

        let end_trial = function(){
            stopOscillator();
            display_element.innerHTML = '';

            // next trial
            jsPsych.finishTrial();
        };

        // start the response listener
        let keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
            callback_function: end_trial,
            valid_responses: trial.choices,
            rt_method: 'date',
            persist: false,
            allow_held_key: false
        });

    };

    return plugin;
})();
