const conns = require("../configs/conns");
const mysql = require("mysql");

class MysqlConn {
    constructor(conf){
        /** Conexão persistente com o banco de dados.
         * @type Pool
         */
        this.conf = conf;
        this.conn = mysql.createPool({
            //multipleStatements: true,
            connectionLimit : 1000,
            host : conf.host,
            port: conf.port,
            user: conf.user,
            password: conf.password,
            database: conf.dbname
        });
        console.log(`mysql connection: ${conf.host}, ${conf.port}, ${conf.user}, ${conf.password}, ${conf.dbname}`);
        this.bakedTables = {};
        this.bake();
    }

    async bake(){
        console.log("baking tables...");
        var tables = await this.query(`SHOW TABLES`);
        for(var i in tables){
            var table = tables[i]["Tables_in_"+this.conf.dbname];
            this.bakedTables[table] = {fields:{}};
            var fields = await this.query(`SHOW COLUMNS FROM ${table}`);
            for(var f in fields){
                var field = fields[f];
                //console.log(field.Field);
                this.bakedTables[table].fields[field.Field] = {name: field.Field, type: field.Type.split('(')[0]};
            }
        }
        console.log("the tables were baked!");
    }

    escape(v){
        if(typeof v == "boolean")
            return v ? 1:0;
        else
            return mysql.escape(v);
    }
    escapeField(v){
        return mysql.escapeId(v);
    }

    /** Executa uma query assincronicamente no banco.
     * @param {string} query
     * @return {Promise}
    */
    async query(queryStr, queryObj){
        return new Promise(resolve => {
            if(isEmpty(queryObj)){
                this.conn.query(queryStr, function(e, r, f){
                    if(e){
                        if(e.errno != 1451/*foreing key*/)
                            console.log(e);
                        resolve(null);
                    }else {  resolve(r); }
                });
            }else{
                this.conn.query(queryStr, queryObj, function(e, r, f){
                    if(e){
                        if(e.errno != 1451/*foreing key*/)
                            console.log(e);
                        resolve(null);
                    } else {
                        resolve(r);
                    }
                });
            }
        });
    }
    /**
     * @param {string} table
     * @param {Array.<string>} fields
     * @param {Object} where
     * @param {object} extra (joins, limit, pagination, order)
     */
    async select(table, fields="*", where=null, extra={}){
        var joins = "";
        var groupJoins = [];
        if(!isEmpty(extra.joins)){
            if((fields == null || fields == "*") && table in this.bakedTables){ // pega os campos pelo bake
                fields = [];
                for(var key in this.bakedTables[table].fields)
                    fields.push(key);
            }
            for(var i in fields)
                fields[i] = table+"."+fields[i] + " AS " +table+"_"+fields[i];
            for(var i in extra.joins){
                var j = extra.joins[i];
                var joinTable = isEmpty(j.alias) ? j.table : j.alias;
                if(!j.fields.includes("id"))
                    j.fields.push("id");
                for(var i in j.fields)
                    fields.push(joinTable+"."+j.fields[i] + " AS " +joinTable+"__"+j.fields[i]);
                joins += ` ${j.type} JOIN ${j.table + (isEmpty(j.alias)?"":(" AS "+j.alias))} ON ${ j.field1.includes(".") ? j.field1 : `${table}.${j.field1}`} = ${joinTable}.${j.field2} `;
                if(j.group == true)
                    groupJoins.push(joinTable);
                //console.log(join);
                //console.log(fields);
            }
        }


        var data = null;
        var fds = isEmpty(fields) || fields=="*" ? "*" : fields.join(",");
        var q = `SELECT ${!isEmpty(extra.pagination) ? "COUNT(*) as count": fds} FROM ${table}`;

        var where = (!isEmpty(where) ? (" WHERE "+this.whereToStr(where)) : "");

        var limit = "";

        var order = "";
        if(!isEmpty(extra.order)){
            order = " ORDER BY ";
            var ords = "";
            for(var i in extra.order)
                ords += (ords==""?"":", ")+i+" "+extra.order[i];
            order += ords;
        }

        if(!isEmpty(extra.pagination)){
            var count = (await this.query(q+where))[0].count;
            limit = " LIMIT "+(extra.pagination.index*extra.pagination.amount)+","+(extra.pagination.amount);
            data = await this.query(q.replace("COUNT(*) as count", fds)+joins+where+order+limit);
            data = {
                results: data,
                pagination: {
                    total: count
                }
            };

        }else if(!isEmpty(extra.limit)){
            limit = " LIMIT "+extra.limit;
            data = await this.query(q+joins+where+order+limit);
        }else{
            data = await this.query(q+joins+where+order);
        }

        // processa o resultado dos joins
        if(joins != "" && data != null){
            var results = data.results ? data.results : data;
            for(var i in results){
                for(var j in results[i]){
                    if(j.includes("__")){
                        var spl = j.split("__", );
                        var joinTable = spl[0];
                        var field = spl[1];
                        if(!groupJoins.includes(joinTable) && joinTable.substring(joinTable.length-1) == "s")
                            joinTable = joinTable.substring(0, joinTable.length-1);
                        if(!(joinTable in results[i]))
                            results[i][joinTable] = {};
                        results[i][joinTable][field] = results[i][j];
                        delete results[i][j];
                    }else{
                        results[i][j.replace(table+"_", "")] = results[i][j];
                        delete results[i][j];
                    }
                }
            }

            // agrupa quando o join retorna varias linhas para um id
            if(groupJoins.length > 0){
                var _results = [];
                var _byId = {};
                for(var i in results){
                    var _r = results[i];
                    if(_r.id != undefined){
                        var _g;
                        if(_r.id in _byId){
                            _g = _byId[_r.id];
                            for(var j in _r){
                                if(typeof _r[j] == "object" && _r[j].id != null && groupJoins.includes(j))
                                    _g[j].push(_r[j]);
                            }
                        }else{
                            _g = _r;
                            _byId[_r.id] = _r;
                            for(var j in _r){
                                if(typeof _r[j] == "object" && groupJoins.includes(j)){
                                    if(_r[j].id != null)
                                        _g[j] = [_r[j]];
                                    else
                                        _g[j] = [];
                                }
                            }
                            _results.push(_g);
                        }
                    }
                }
                if(data.results)
                    data.results = _results;
                else
                    data = _results;
                //console.log(results);
            }
        }

        if(extra.byId === true){
            var rSrc = data.results ? data.results : data;
            var rDest = {};
            for(var i in rSrc)
                rDest[rSrc[i].id] = rSrc[i];
            if(data.results)
                data.results = rDest;
            else
                data = rDest;
        }

        return data;
    }
    async selectFirst(table, fields="*", where=null, extra={}){
        extra.limit = 1;
        var r = await this.select(table, fields, where, extra);
        r = isEmpty(r) || r.length == 0 ? null : r[0];
        return r;
    }
    async update(table, values, where=null, returnQuery=false){
        var q = `UPDATE ${table} SET `;
        var str = "";
        for(var i in values){
            if(i != "id")
                str += (str==""?"":",") + this.escapeField(i) + "=" + this.escape(values[i])
        }
        q += str;
        if(!isEmpty(where)){
            q += " WHERE "+this.whereToStr(where);
        }else if("id" in values){
            q += " WHERE id="+this.escape(values.id);
        }else{
            return null;
        }
        ;
        //console.log(q);
        if(returnQuery)
            return {results: await this.query(q), query: q};
        else
            return await this.query(q);
    }

    async insert(table, values, returnQuery=false){
        var f = "";
        var v = "";
        for(var i in values){
            f += (f==""?"":",") + this.escapeField(i);
            v += (v==""?"":",") + this.escape(values[i]);
        }
        var q = `INSERT INTO ${table} (${f}) VALUES (${v})`;
        //console.log(q);
        if(returnQuery)
            return {results: await this.query(q), query: q};
        else
            return await this.query(q);
    }

    async delete(table, where=null, extras=null, returnQuery=false){
        var q = `DELETE FROM ${table} WHERE ${this.whereToStr(where)}`;
        if(extras!= null && !isEmpty(extras.limit))
            q+= " LIMIT "+extras.limit;

        if(returnQuery)
            return {results: await this.query(q), query: q};
        else
            return await this.query(q);
    }

    async deleteOne(table, where=null, extras={}, returnQuery=false){
        extras.limit = 1;
        return await this.delete(table, where, extras, returnQuery);
    }

    whereToStr(queryObj){
        var self = this;
        function __p(obj, op){
            if(typeof obj == "string"){
                return "("+obj+")";
            }else{
                var _str = "";
                for(var i in obj){
                    if(_str != "")
                        _str+= " "+op.toUpperCase()+" ";
                    if(i == "and" || i == "or"){
                        _str += "(";
                        _str += __p(obj[i], i);
                        _str += ")";
                    }else{
                        if(obj[i] == null)
                            _str += i.includes(" ") ? i : i+" IS NULL";
                        else if(i.includes(" "))
                            _str += i+self.escape(obj[i]);
                        else
                            _str += i+"="+self.escape(obj[i]);
                    }
                }
                return _str;
            }
        }
        return __p(queryObj, "and");
    }
}

//// CONNS
exports.dominus = new MysqlConn(conns.mysql.conns.dominus);