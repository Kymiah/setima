/********************************************
 *
 * METODOS QUE RETORNAM DADOS PARA SEREM
 * INSERIDOS NA RENDERIZAÇÃO DAS PÁGINAS WEB
 *
 ********************************************/
//const user = require("../modules/user");
//const mysql = require("../modules/mysql");
const server = require("../index");

//// GLOBAL
/** Os dados são inseridos em todas as renderizações das paginas web. */
exports.global = {
};

//// Create Data Obj
/**
 * Cria um objeto com os dados basicos para serem inseridos na renderização de qualquer página web.
 * @param {Request} req
 * @param {string} title Titulo da pagina
 * @param {string} menuName Nome que pode ser usado para identificar a pagina atual nos menus. Formato: dialer/agent-panel
 */
exports.create = function (req, title, menuName=""){
    var pathSpl = req.path.split("/", 3);
    return {
        title: title,
        panelName: pathSpl.length > 1 ? pathSpl[1] : "",
        menuName: menuName,
        params: req.params,
        query: req.query,
        body: req.body,
        dominusSettings: server.settings
    };
};

/**
 * Insere no parametro "dst" os dados essenciais do usuário.
 * @param {Request} req
 * @param {object} data Objeto aonde será inserido os dados. */
exports.user = async function(req, data, getClient=false){
    data.user = user.login.data(req);
    if(getClient)
        data.client = await mysql.dominus.selectFirst("clients", null, {id: data.user.client_id});
};

//// Utils
exports.isMasterPanel = function(req){
    if(!isEmpty(req.body.__fromPathName)){
        return  req.body.__fromPathName.split("/")[1] == "master-panel";
    }else{
        var pathSpl = req.path.split("/", 3);
        return pathSpl.length > 1 && pathSpl[1] == "master-panel";
    }
}