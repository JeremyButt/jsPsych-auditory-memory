jsPsych.plugins['volume-setup-button-response'] = (function() {
    let plugin = {};

    plugin.info = {
        name: 'volume-setup-button-response',
        description: '',
        parameters: {
            stimulus: {
                type: jsPsych.plugins.parameterType.OBJECT,
                pretty_name: 'Stimulus',
                default: 5000,
                description: 'The test tone frequency'
            },
            begin_button_label: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Button label',
                default: 'Begin Trial',
                array: false,
                description: 'Label of the button to advance.'
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
            gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 1);
            oscillatorNode.stop(context.currentTime + 1);
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

        html += '<button style="display: inline-block;" id="jspsych-audio-slider-response-begin" class="jspsych-btn">' + trial.begin_button_label + '</button>';

        display_element.innerHTML = html;

        playOscillator(trial.stimulus);

        display_element.querySelector('#jspsych-audio-slider-response-begin').addEventListener('click', function(){
            stopOscillator();
            end_trial();
        });

        let end_trial = function(){

            display_element.innerHTML = '';

            // next trial
            jsPsych.finishTrial();
        };


    };

    return plugin;
})();
