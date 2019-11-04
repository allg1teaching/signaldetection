/* ALLG1 TEACHING ONLINE EXPERIMENTS
 * sdt task  --  results plot
  * 2019
  */

jsPsych.plugins["allg1-sdtres"] = (function () {

  var plugin = {};

  plugin.info = {
    name: "allg1-sdtres",
    parameters: {

    }
  }

  plugin.trial = function (display_element, trial) {
    // create divs to draw stims in
    divs = {}

    function collectData() {
      var formatted_data = {};
      var factor, noiseInt, noiseDescription;

      // calculate results and pack them in an object
      for (factor in Object.keys(noise_factors)) {  // nope
        console.log(factor);
        // set working variables
        noiseInt = Object.keys(noise_factors)[factor];
        noiseDescription = noise_factors[noiseInt];

        type_param = "allg1-sdt";

        formatted_data["n_dots_" + noiseInt] = {
          noise: noiseDescription,
          noise_dotcount: noiseInt,
          hit: jsPsych.data.get().filter({
            trial_type: type_param,
            is_practice: 0,
            n_dots: noiseInt,
            contains_signal: true,
            correct_response: true
          }).count(),  // count # of data points fitting this filter; store as # of hits
          miss: jsPsych.data.get().filter({
            trial_type: type_param,
            is_practice: 0,
            n_dots: noiseInt,
            contains_signal: true,
            correct_response: false
          }).count(), // # of misses
          false_alarm: jsPsych.data.get().filter({
            trial_type: type_param,
            is_practice: 0,
            n_dots: noiseInt,
            contains_signal: false,
            correct_response: false
          }).count(), // # of false alarms
          correct_rejection: jsPsych.data.get().filter({
            trial_type: type_param,
            is_practice: 0,
            n_dots: noiseInt,
            contains_signal: false,
            correct_response: true
          }).count(), // # of correct rejections
          true_positive_rate:  // TPR = (#positives correctly classified)/(# positives)
            jsPsych.data.get().filter({
              trial_type: type_param,
              is_practice: 0,
              n_dots: noiseInt,
              contains_signal: true,
              correct_response: true
            }).count()
            /
            jsPsych.data.get().filter({
              trial_type: type_param,
              is_practice: 0,
              n_dots: noiseInt,
              contains_signal: true
            }).count(),
          false_negative_rate:  // FPR = (#negatives incorrectly classified)/(# negatives)
            jsPsych.data.get().filter({
              trial_type: type_param,
              is_practice: 0,
              n_dots: noiseInt,
              contains_signal: false,
              correct_response: false
            }).count()
            /
            jsPsych.data.get().filter({
              trial_type: type_param,
              is_practice: 0,
              n_dots: noiseInt,
              contains_signal: false
            }).count()
        }
      }

      return formatted_data;
    };

    formatted_data = collectData()

    var plotDiv = document.createElement("div");
    plotDiv.style.width = window.innerWidth * 0.5 + "px";
    plotDiv.style.height = window.innerHeight * 0.5 + "px";
    plotDiv.setAttribute("class", "center-div");
    display_element.appendChild(plotDiv);

    dat1 = {
      x: [formatted_data["n_dots_144"].false_negative_rate],
      y: [formatted_data["n_dots_144"].true_positive_rate],
      mode: 'markers',
      type: 'scatter',
      name: '144 dots',    
      marker: {size: 9}
    }
    dat2 = {
      x: [formatted_data["n_dots_400"].false_negative_rate],
      y: [formatted_data["n_dots_400"].true_positive_rate],
      mode: 'markers',
      type: 'scatter',
      name: '400 dots',    
      marker: {size: 9}
    }
    dat3 = {
      x: [formatted_data["n_dots_900"].false_negative_rate],
      y: [formatted_data["n_dots_900"].true_positive_rate],
      mode: 'markers',
      type: 'scatter',
      name: '900 dots',    
      marker: {size: 9}
    }

    Plotly.plot(
      plotDiv,
      [
        dat1,
        dat2,
        dat3
      ],
      {
        margin: { t: 100 },
        title: 'ROC',
        yaxis: {
          title: 'true positive rate',
          range: [-0.1,1.1]
        },
        xaxis: {
          title: 'false negative rate',
          range: [-0.1,1.1]
        }
      });

    var dlBut = document.createElement("div");
    dlBut.style.height = 0.1 * window.innerHeight + "px";
    dlBut.style.left = "50%";
    dlBut.innerHTML = "<br><input id='clickMe' type='button' value='Download in CSV format' onclick='downloadData();' />";
    dlBut.setAttribute("class", "center-div");
    display_element.appendChild(dlBut);

    var dlBut = document.createElement("div");
    dlBut.style.height = 0.1 * window.innerHeight + "px";
    dlBut.style.left = "50%";
    dlBut.innerHTML = "Press <b>P</b> to finish.";
    dlBut.setAttribute("class", "center-div");
    display_element.appendChild(dlBut);

    var next = function () {
      jsPsych.finishTrial({});
    }

    jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: next,
      valid_responses: ['p'],
      rt_method: 'performance',
      persist: false,
      allow_held_key: false
    });

  };

  return plugin;
})();
