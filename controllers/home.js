//const user = require("../../modules/user");
const routdata = require("../configs/routes-data");

exports.get = {};
exports.post = {};

//// Index
exports.get.index = async function (req, res) {
    var data = routdata.create(req, "Home");
    //routdata.user(req, data);
    //data.userCostCenters = await user.getCostCenters(req);
    res.render("pages/home/index", data);
};
