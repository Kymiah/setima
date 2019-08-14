const server = require("../index");
const fs = require("fs");
var root = __dirname.replace("/configs", "").replace("\\configs", "");
var ctr;

/********************************************
 *
 * ROTAS SEM FILTRO DE AUTORIZAÇÃO
 *
 ********************************************/

//// FONTS
server.app.get('/fonts/**.*', function (req, res) { res.sendFile(root+"/views/"+req.path); });

//// IMAGES
server.app.get('/imgs/**.*', function (req, res) { res.sendFile(root+"/views/"+req.path); });

//// SCRIPTS
server.app.get('/scripts/**.*', function (req, res) { res.sendFile(root+"/views/"+req.path); });
server.app.get('/pages/**.js', function (req, res) { res.sendFile(root+"/views/"+req.path); });


//// CSS
server.app.get('/css/**.css', function (req, res) { res.sendFile(root+"/views/"+req.path); });

//// ERRORS
server.app.get('/error/**', function(req, res){ res.render(root+"/views/pages/"+req.path);  });

//// SERVER ROOT
server.app.get('/', function(req, res){ res.redirect("/home"); });

//// Root/Home
  ctr = require("../controllers/home");
  //auth.route.get('/client-panel', ctr.get.index, "");
  server.app.get('/home', ctr.get.index);

 /********************************************
 *
 //// <u> LOGINS </u>
 *
 ********************************************/

   ///: User
   /*ctr = require("../controllers/login/user");
   server.app.get('/login/user', ctr.get.login);
   server.app.get('/login/user/logout', ctr.get.logout);
   // actions
   server.app.post('/login/user', ctr.post.login);
   server.app.post('/login/user/recovery-password', ctr.post.recoveryPassword);*/

/********************************************
 *
 ////  <u> MASTER PANEL </u>
 *
 ********************************************/

  //// Root/Home
  /*ctr = require("../controllers/master-panel/home");
  auth.route.get('/master-panel', ctr.get.index, null, true, false);
  auth.route.get('/master-panel/home', ctr.get.index, null, true, false);
  ///: Asterisk
  auth.route.get('/asterisk/write-all', async function(req, res){
    if(require.resolve("../modules/asterisk-utils") in require.cache) delete require.cache[require.resolve("../modules/asterisk-utils")];
    if(require.resolve("../modules/asterisk-writer") in require.cache) delete require.cache[require.resolve("../modules/asterisk-writer")];
    const astutils = require("../modules/asterisk-utils");
    var mask = new astutils.WriteMask(astutils.WriteMask.types.ALL);
    await require("../modules/asterisk-writer").write(mask);
    activity.log(req, activity.types.AST_WRITE_ALL, mask.toString(), null, "master-panel");
    res.end();
  }, null, true, false);*/

/********************************************
 *
 //// <u> CLIENT PANEL </u>
 *
 ********************************************/
  //// Root/Home
  /*ctr = require("../controllers/client-panel/home");
  auth.route.get('/client-panel', ctr.get.index, "");
  auth.route.get('/client-panel/home', ctr.get.index, "");

  //// GENERAL
  ///: Extens
  ctr = require("../controllers/client-panel/general/extens");
  auth.route.get('/client-panel/general/extens', ctr.get.index, "Painel do Cliente/Geral/Ramais/Listar");
  auth.route.get('/client-panel/general/extens/list', ctr.get.list, "Painel do Cliente/Geral/Ramais/Listar");
  auth.route.get('/client-panel/general/extens/add', ctr.get.add, "Painel do Cliente/Geral/Ramais/Adicionar");
  auth.route.get('/client-panel/general/extens/edit/:id', ctr.get.edit, "Painel do Cliente/Geral/Ramais/Editar");
  // actions
  auth.route.post('/client-panel/general/extens/list', ctr.post.list, "Painel do Cliente/Geral/Ramais/Listar");
  auth.route.post('/client-panel/general/extens/delete', ctr.post.delete, "Painel do Cliente/Geral/Ramais/Deletar");
  auth.route.post('/client-panel/general/extens/save', ctr.post.save, ["Painel do Cliente/Geral/Ramais/Adicionar", "Painel do Cliente/Ativo/Ramais/Editar"]);
  auth.route.post('/client-panel/general/extens/set-active', ctr.post.setActive, "Painel do Cliente/Geral/Ramais/Editar");

*/


  ///: Trunks

  // actions

  ///: Dial Plans
 
  // actions
  


  //// TOOLS
  ///: Reports


  //// ADMIN
 