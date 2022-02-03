//
// mod_othermill.js
//   fab modules othermill output
//   based on mod_G.js
//
// Ezra Spier
// Changes (c) Other Machine Company 2016, 
// Based on mod_G.js, (c) Massachusetts Institute of Technology 2014 
// 
// This work may be reproduced, modified, distributed, performed, and 
// displayed for any purpose, but must acknowledge the fab modules 
// project. Copyright is retained and must be preserved. The work is 
// provided as is; no warranty is provided, and users accept all 
// liability.
//

define(['require', 'handlebars', 'mods/mod_ui', 'mods/mod_globals', 'text!templates/mod_othermill_controls.html'], function(require) {

   var ui = require('mods/mod_ui');
   var globals = require('mods/mod_globals');
   var Handlebars = require('handlebars')
   var mod_othermill_controls_tpl = Handlebars.compile(require('text!templates/mod_othermill_controls.html'))
   var findEl = globals.findEl

   var label = findEl("mod_inputs_label")
   var input = label.innerHTML
   if (input == "path (.svg)") {
      //
      // vector input processes
      //
   } else {
      //
      // raster input processes
      //
      mod_add_process([
         ["name", "7/16 plywood (1/8 mill)"],
         ["module", "othermill"],
         ["controls", "mod_path_image_22D_controls"],
         ["routine", "mod_othermill_path"],
         ["command", "gedit"],
         ["diameter", "3.175"],
         ["cut_speed", "25"],
         ["plunge_speed", "6.35"],
         ["spindle_speed", "16400"],
         ["offsets", "1"],
         ["overlap", "0"],
         ["error", "1.1"],
         ["merge", "1.5"],
         ["depth", "3.175"],
         ["thickness", "11.11"],
      ])
      mod_add_process([
         ["name", "1/2 HDPE (1/8 mill)"],
         ["module", "othermill"],
         ["controls", "mod_path_image_22D_controls"],
         ["routine", "mod_othermill_path"],
         ["command", "gedit"],
         ["diameter", "3.175"],
         ["cut_speed", "10"],
         ["plunge_speed", ".6"],
         ["spindle_speed", "16400"],
         ["offsets", "1"],
         ["overlap", "0"],
         ["error", "1.1"],
         ["merge", "1.5"],
         ["depth", "3.175"],
         ["thickness", "12.7"],
      ])
      mod_add_process([
         ["name", "foam rough cut (1/8)"],
         ["module", "othermill"],
         ["controls", "mod_path_image_25D_controls"],
         ["routine", "mod_othermill_path"],
         ["command", "gedit"],
         ["cut_speed", "25"],
         ["plunge_speed", "8.3"],
         ["spindle_speed", "16400"],
         ["depth", "3.175"],
         ["diameter", "3.175"],
         ["overlap", "50"],
         ["offsets", "-1"],
         ["error", "1.1"],
         ["merge", "1.5"],
      ])
      mod_add_process([
         ["name", "foam finish cut (1/8)"],
         ["module", "othermill"],
         ["controls", "mod_path_image_3D_controls"],
         ["routine", "mod_othermill_path"],
         ["command", "gedit"],
         ["cut_speed", "25"],
         ["plunge_speed", "8.3"],
         ["spindle_speed", "16400"],
         ["diameter", "3.175"],
         ["length", "25.4"],
         ["overlap", "90"],
         ["error", "1.1"],
      ])
      mod_add_process([
         ["name", "PCB traces (1/64)"],
         ["module", "othermill"],
         ["controls", "mod_path_image_21D_controls"],
         ["routine", "mod_othermill_path"],
         ["command", "gedit"],
         ["cut_speed", "6.35"],
         ["plunge_speed", "6.35"],
         ["spindle_speed", "16400"],
         ["depth", "0.15"],
         ["diameter", "0.4"],
         ["offsets", "4"],
         ["overlap", "50"],
         ["error", "1.1"],
         ["merge", "1.5"],
      ])
      mod_add_process([
         ["name", "PCB outline (1/32)"],
         ["module", "othermill"],
         ["controls", "mod_path_image_22D_controls"],
         ["routine", "mod_othermill_path"],
         ["command", "gedit"],
         ["cut_speed", "25"],
         ["plunge_speed", "6.35"],
         ["spindle_speed", "16400"],
         ["depth", "0.6"],
         ["thickness", "1.7"],
         ["diameter", "0.79"],
         ["offsets", "1"],
         ["error", "1.1"],
         ["merge", "1.5"],
      ])
      mod_add_process([
         ["name", "PCB traces (0.010)"],
         ["module", "othermill"],
         ["controls", "mod_path_image_21D_controls"],
         ["routine", "mod_othermill_path"],
         ["command", "gedit"],
         ["cut_speed", "2"],
         ["plunge_speed", "1"],
         ["spindle_speed", "16400"],
         ["depth", "0.1"],
         ["diameter", "0.254"],
         ["offsets", "1"],
         ["overlap", "50"],
         ["error", "1.1"],
         ["merge", "1.5"],
      ])
   }
   //
   // mod_load_handler
   //   file load handler
   //

   function mod_load_handler() {
      globals.output = "othermill"
      ui.ui_prompt("¿Proceso?")
      var controls = findEl("mod_output_controls")
      controls.innerHTML = mod_othermill_controls_tpl();
      var label = findEl("mod_processes_label")
      label.innerHTML = "Proceso"
      label.style.display = "block"
      label.onclick = function(e) {
         ui.ui_clear()
         ui.ui_show_input()
         ui.ui_menu_process()
      }
      label.onmouseover = function(e) {
         this.style.background = ui.defaults.highlight_background_color
      }
      label.onmouseout = function(e) {
         this.style.background = ui.defaults.background_color
      }
   }
   //
   // mod_othermill_path
   //    convert path to G code
   //

   function mod_othermill_path(path) {
      globals.type = ".nc"
      var dx = globals.width / globals.dpi
      var nx = globals.width
      var cut_speed = 60 * parseFloat(findEl("mod_cut_speed").value) / 25.4
      var plunge_speed = 60 * parseFloat(findEl("mod_plunge_speed").value) / 25.4
      var jog_height = parseFloat(findEl("mod_jog_height").value) / 25.4
      var spindle_speed = parseFloat(findEl("mod_spindle_speed").value)
      var tool = findEl("mod_tool").value
      var scale = dx / (nx - 1)
      var xoffset = 0
      var yoffset = 0
      var zoffset = 0
      str = "%\n" // tape start
      // Clear all state: XY plane, inch mode, cancel diameter compensation, cancel length offset
      // coordinate system 1, cancel motion, non-incremental motion, feed/minute mode
      str += "G17\n"
      str += "G20\n"
      str += "G40\n"
      str += "G49\n"
      // Othermill assumes G55 coordinate system
      str += "G55\n"
      str += "G80\n"
      str += "G90\n"
      str += "G94\n"
      str += "T" + tool + "M06\n" // tool selection, tool change
      str += "F" + cut_speed.toFixed(4) + "\n" // feed rate
      str += "S" + spindle_speed + "\n" // spindle speed
      if (findEl("mod_coolant_on").checked)
         str += "M08\n" // coolant on
      str += "G00Z" + jog_height.toFixed(4) + "\n" // move up before starting spindle
      str += "M03\n" // spindle on clockwise
      str += "G04 P1\n" // give spindle 1 second to spin up
      //
      // follow segments
      //
      for (var seg = 0; seg < path.length; ++seg) {
         var x = xoffset + scale * path[seg][0][0]
         var y = yoffset + scale * path[seg][0][1]
         var z = zoffset + scale * path[seg][0][2]
         //
         // move up to starting point
         //
         str += "Z" + jog_height.toFixed(4) + "\n"
         str += "G00X" + x.toFixed(4) + "Y" + y.toFixed(4) + "Z" + jog_height.toFixed(4) + "\n"
         //
         // move down
         //
         str += "G01Z" + z.toFixed(4) + " F" + plunge_speed.toFixed(4) + "\n"
         str += "F" + cut_speed.toFixed(4) + "\n" //restore XY feed rate
         for (var pt = 1; pt < path[seg].length; ++pt) {
            //
            // move to next point
            //
            x = xoffset + scale * path[seg][pt][0]
            y = yoffset + scale * path[seg][pt][1]
            z = zoffset + scale * path[seg][pt][2]
            str += "G01X" + x.toFixed(4) + "Y" + y.toFixed(4) + "Z" + z.toFixed(4) + "\n"
         }
      }
      //
      // finish
      //
      str += "G00Z" + jog_height.toFixed(4) + "\n" // move up before stopping spindle
      str += "M05\n" // spindle stop
      if (findEl("mod_coolant_on").checked)
         str += "M09\n" // coolant off
      str += "M30\n" // program end and reset
      str += "%\n" // tape end
      //
      // return string
      //
      return str
   }

   return {
      mod_load_handler: mod_load_handler,
      mod_othermill_path: mod_othermill_path
   }

});
