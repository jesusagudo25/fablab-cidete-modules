//
// mod_stl.js
//   fab modules STL input
//
// Neil Gershenfeld 
// (c) Massachusetts Institute of Technology 2014,5
// 
// This work may be reproduced, modified, distributed, performed, and 
// displayed for any purpose, but must acknowledge the fab modules 
// project. Copyright is retained and must be preserved. The work is 
// provided as is; no warranty is provided, and users accept all 
// liability.
//

define(['require',
   'handlebars',
   'mods/mod_ui',
   'mods/mod_globals',
   'outputs/mod_outputs',
   'mods/mod_file',
   'processes/mod_mesh',
   'processes/mod_mesh_view',
   'text!templates/mod_stl_input_controls.html'],
   function(require) {
   var ui = require('mods/mod_ui');
   var Handlebars = require('handlebars');
   var globals = require('mods/mod_globals');
   var outputs = require('outputs/mod_outputs');
   var fileUtils = require('mods/mod_file');
   var meshUtils = require('processes/mod_mesh');
   var meshView = require('processes/mod_mesh_view');
   var findEl = globals.findEl;
   var mod_stl_input_controls_tpl = Handlebars.compile(require('text!templates/mod_stl_input_controls.html'));
   //
   // mod_load_handler
   //   file load handler
   //
   function mod_load_handler() {
      var file = findEl("mod_file_input")
      file.addEventListener('change', function() {
         mod_stl_read_handler()
         })
      }
   //
   // mod_stl_read_handler
   //    STL read handler
   //
   function mod_stl_read_handler(event) {
      //
      // get input file
      //
      var file_input = findEl("mod_file_input")
      globals.input_file = file_input.files[0]
      globals.input_name = file_input.files[0].name
      globals.input_basename = fileUtils.basename(globals.input_name)
      //
      // read as array buffer
      //
      var file_reader = new FileReader()
      file_reader.onload = mod_stl_load_handler
      file_reader.readAsArrayBuffer(globals.input_file)
      }
   //
   // mod_stl_load_handler
   //    STL load handler
   //
   function mod_stl_load_handler(event) {
      //
      // read mesh
      //
      ui.ui_prompt("reading STL")
      ret = mod_stl_read(event.target.result)
      if (!ret) {
         ui.ui_prompt("must be binary STL")
         return
         }
      //
      // update globals
      //
      globals.mesh.units = 1
      globals.dpi = 1000
      if ((globals.mesh.xmax-globals.mesh.xmin) > (globals.mesh.ymax-globals.mesh.ymin))
         globals.width = Math.floor(0.5+globals.dpi*(globals.mesh.xmax-globals.mesh.xmin)/
            (globals.mesh.s*globals.mesh.units))
      else
         globals.width = Math.floor(0.5+globals.dpi*(globals.mesh.ymax-globals.mesh.ymin)/
            (globals.mesh.s*globals.mesh.units))
      //
      // set up UI
      //
      controls = findEl("mod_input_controls")
      ctx = {
         input_name: globals.input_name,
         mesh_length: globals.mesh.length,
         x_min: globals.mesh.xmin.toFixed(3),
         x_max: globals.mesh.xmax.toFixed(3),
         y_min: globals.mesh.ymin.toFixed(3),
         y_max: globals.mesh.ymax.toFixed(3),
         z_min: globals.mesh.zmin.toFixed(3),
         z_max: globals.mesh.zmax.toFixed(3),
         mesh_units: globals.mesh.units,
         mm_x: (25.4*(globals.mesh.xmax-globals.mesh.xmin)/globals.mesh.units).toFixed(3),
         mm_y: (25.4*(globals.mesh.ymax-globals.mesh.ymin)/globals.mesh.units).toFixed(3),
         mm_z: (25.4*(globals.mesh.zmax-globals.mesh.zmin)/globals.mesh.units).toFixed(3),
         in_x: ((globals.mesh.xmax-globals.mesh.xmin)/globals.mesh.units).toFixed(3),
         in_y: ((globals.mesh.ymax-globals.mesh.ymin)/globals.mesh.units).toFixed(3),
         in_z: ((globals.mesh.zmax-globals.mesh.zmin)/globals.mesh.units).toFixed(3),
         mod_rz: globals.mesh.rz.toFixed(3),
         mod_rx: globals.mesh.rx.toFixed(3),
         mod_dy: globals.mesh.dy.toFixed(3),
         mod_dx: globals.mesh.dx.toFixed(3),
         dpi: globals.dpi,
         width: globals.width
         }
      controls.innerHTML = mod_stl_input_controls_tpl(ctx);
      //
      // event handlers
      //
      findEl("mod_units",false).addEventListener("keyup", function() {
         globals.mesh.units = parseFloat(findEl("mod_units").value);
         findEl("mod_mm").innerHTML =
            (25.4*(globals.mesh.xmax-globals.mesh.xmin)/globals.mesh.units).toFixed(3) + " x " +
            (25.4*(globals.mesh.ymax-globals.mesh.ymin)/globals.mesh.units).toFixed(3) + " x " +
            (25.4*(globals.mesh.zmax-globals.mesh.zmin)/globals.mesh.units).toFixed(3) + " mm";
         findEl("mod_in").innerHTML =
            ((globals.mesh.xmax-globals.mesh.xmin)/globals.mesh.units).toFixed(3) + " x " +
            ((globals.mesh.ymax-globals.mesh.ymin)/globals.mesh.units).toFixed(3) + " x " +
            ((globals.mesh.zmax-globals.mesh.zmin)/globals.mesh.units).toFixed(3) + " in";
         globals.width = Math.floor(0.5+globals.dpi*(globals.mesh.xmax-globals.mesh.xmin)/(globals.mesh.s*globals.mesh.units));
         findEl("mod_px").innerHTML = "width: " + globals.width + " px";
         });
      //
      findEl("mod_rz",false).addEventListener("keyup", function() {
         globals.mesh.rz = Math.PI * parseFloat(this.value) / 180;
         globals.mesh.draw(globals.mesh.s, globals.mesh.dx, globals.mesh.dy, globals.mesh.rx, globals.mesh.rz);
         });
      //
      findEl("mod_rx",false).addEventListener("keyup", function() {
         globals.mesh.rx = Math.PI * parseFloat(this.value) / 180;
         globals.mesh.draw(globals.mesh.s, globals.mesh.dx, globals.mesh.dy, globals.mesh.rx, globals.mesh.rz);
         });
      //
      findEl("mod_dy",false).addEventListener("keyup", function() {
         globals.mesh.dy = parseFloat(this.value);
         globals.mesh.draw(globals.mesh.s, globals.mesh.dx, globals.mesh.dy, globals.mesh.rx, globals.mesh.rz);
         });
      //
      findEl("mod_dx",false).addEventListener("keyup", function() {
         globals.mesh.dx = parseFloat(this.value);
         globals.mesh.draw(globals.mesh.s, globals.mesh.dx, globals.mesh.dy, globals.mesh.rx, globals.mesh.rz);
         });
      //
      findEl("mod_s",false).addEventListener("keyup", function() {
         globals.mesh.s = parseFloat(this.value);
         globals.width = Math.floor(0.5 + globals.dpi * (globals.mesh.xmax - globals.mesh.xmin) / (globals.mesh.s * globals.mesh.units));
         findEl("mod_px").innerHTML = "width: " + globals.width + " px";
         globals.mesh.draw(globals.mesh.s, globals.mesh.dx, globals.mesh.dy, globals.mesh.rx, globals.mesh.rz);
         });
      //
      findEl('show_mesh',false).addEventListener("click", function() {
         ui.ui_clear();
         var label = findEl("mod_processes_label");
         label.style.display = "none";
         var div = findEl("mod_output_controls");
         div.innerHTML = "";
         var div = findEl("mod_process_controls");
         div.innerHTML = "";
         meshView.mesh_draw(globals.mesh);
         });
      //
      findEl("mod_dpi",false).addEventListener("keyup", function() {
         globals.dpi = parseFloat(findEl("mod_dpi").value)
         if ((globals.mesh.xmax-globals.mesh.xmin) > (globals.mesh.ymax-globals.mesh.ymin))
            globals.width = Math.floor(0.5+globals.dpi*(globals.mesh.xmax-globals.mesh.xmin)/
               (globals.mesh.s*globals.mesh.units))
         else
            globals.width = Math.floor(0.5+globals.dpi*(globals.mesh.ymax-globals.mesh.ymin)/
               (globals.mesh.s*globals.mesh.units))
         findEl("mod_px").innerHTML = "width: "+globals.width+" px"
         });
      //
      findEl('calculate_height_map',false).addEventListener("click",function() {
         ui.ui_clear();
         var label = findEl("mod_processes_label");
         label.style.display = "none";
         var div = findEl("mod_output_controls");
         div.innerHTML = "";
         var div = findEl("mod_process_controls");
         div.innerHTML = "";
         var canvas = findEl("mod_input_canvas");
         if ((globals.mesh.xmax-globals.mesh.xmin) > (globals.mesh.ymax-globals.mesh.ymin))
            globals.width = Math.floor(0.5+globals.dpi*(globals.mesh.xmax-globals.mesh.xmin)/
               (globals.mesh.s*globals.mesh.units))
         else
            globals.width = Math.floor(0.5+globals.dpi*(globals.mesh.ymax-globals.mesh.ymin)/
               (globals.mesh.s*globals.mesh.units))
         globals.height = globals.width;
         canvas.width = globals.width;
         canvas.height = globals.width;
         canvas.style.display = "inline";
         var ctx = canvas.getContext("2d");
         var process_canvas = findEl("mod_process_canvas");
         process_canvas.width = globals.width;
         process_canvas.height = globals.width;
         var output_canvas = findEl("mod_output_canvas");
         output_canvas.width = globals.width;
         output_canvas.height = globals.width;
         var img = ctx.getImageData(0,0,canvas.width,canvas.height);
         meshUtils.height_map(globals.mesh,img);
         ctx.putImageData(img,0,0);
         ui.ui_prompt("");
         });
      //
      // draw mesh
      //
      meshView.mesh_draw(globals.mesh)
      //
      // call outputs
      //
      ui.ui_prompt("¿Formato de salida?")
      outputs.init()
      }
   //
   // mod_stl_read
   //    read mesh from STL buffer
   //
   function mod_stl_read(buf) {
      var endian = true
      var xmin = Number.MAX_VALUE
      var xmax = -Number.MAX_VALUE
      var ymin = Number.MAX_VALUE
      var ymax = -Number.MAX_VALUE
      var zmin = Number.MAX_VALUE
      var zmax = -Number.MAX_VALUE
      function getx() {
         var x = view.getFloat32(pos, endian)
         pos += 4
         xmax = Math.max(x,xmax)
         xmin = Math.min(x,xmin)
         return x
         }
      function gety() {
         var y = view.getFloat32(pos, endian)
         pos += 4
         ymax = Math.max(y,ymax)
         ymin = Math.min(y,ymin)
         return y
         }
      function getz() {
         var z = view.getFloat32(pos, endian)
         pos += 4
         zmax = Math.max(z,zmax)
         zmin = Math.min(z,zmin)
         return z
         }
      var view = new DataView(buf)
      //
      // check for binary STL
      //
      if ((view.getUint8(0) == 115) && (view.getUint8(1) == 111) && (view.getUint8(2) == 108) && (view.getUint8(3) == 105) && (view.getUint8(4) == 100))
      //
      // "solid" found, check if binary anyway by multiple of 50 bytes records (Solidworks hack)
      //
      if (Math.floor((view.byteLength - (80 + 4)) / 50) != ((view.byteLength - (80 + 4)) / 50))
         return false
      var ntriangles = view.getUint32(80, endian)
      var pos = 84
      globals.mesh = []
      for (var i = 0; i < ntriangles; ++i) {
         pos += 12
         var x0 = getx()
         var y0 = gety()
         var z0 = getz()
         var x1 = getx()
         var y1 = gety()
         var z1 = getz()
         var x2 = getx()
         var y2 = gety()
         var z2 = getz()
         globals.mesh[globals.mesh.length] = [
            [x0, y0, z0],
            [x1, y1, z1],
            [x2, y2, z2]
         ]
         pos += 2
         }
      globals.mesh.xmin = xmin
      globals.mesh.xmax = xmax
      globals.mesh.ymin = ymin
      globals.mesh.ymax = ymax
      globals.mesh.zmin = zmin
      globals.mesh.zmax = zmax
      globals.mesh.rz = 0
      globals.mesh.rx = 0
      if ((ymax-ymin) < (xmax-xmin)) {
         globals.mesh.dx = 0
         globals.mesh.dy = (ymax-ymin)/(xmax-xmin)-1 // bottom-adjust
         }
      else {
         globals.mesh.dx = (xmax-xmin)/(ymax-ymin)-1 // left-adjust
         globals.mesh.dy = 0
         }
      globals.mesh.s = 1
      return true
      }
   return {
      mod_load_handler: mod_load_handler
      }
   });
