var url = 'http://localhost:3000/';
var curEdit = null;
var backup = null;
var params = 0;
var empty = '';
var addForm;
var schemaAr = [];
var curTable = '';


window.onload = function () {
    getSchemaDB(init);
};

function init(defaultTable) {
    addForm = document.getElementById("formx");
    loadTable(defaultTable);
    getSchema(defaultTable);
    //createAddForm();
    document.getElementById("table").onclick = function (e) {
        delRow(e);
        editRow(e);
    };
    document.getElementById("list").onclick = function (e) {
        if (e.target.tagName != "LI") return;
        var target = e.target;
        getSchema(target.dataset.id);
        loadTable(target.dataset.id);
        curTable = target.dataset.id;
        createAddForm();
    };
    var selectedListItem = document.getElementsByClassName("selected")[0];

    document.getElementById("list").addEventListener('click', function (e) {
        if (e.target.tagName != "LI") return;
        if (e.target == selectedListItem) return;
        var target = e.target;
        selectedListItem.classList.remove('selected');
        target.classList.add('selected');
        selectedListItem = target;

    });
}


function loadTable(table) {
    $.ajax({
        type: 'GET',
        url: "getTable/?table=" + table,
        error: function (xhr, str) {
            console.log('Возникла ошибка: ' + str);
        },
        success: function (xhr, str) {
            var response = JSON.parse(xhr);
            params = drawTable(response);
        }
    });
}

function drawTable(arr) {
    var table = document.getElementById("table");
    var p = [];
    table.innerHTML = '';
    var s = "<thead><tr>";
    for (var i in arr[0]) {
        s += "<th>";
        s += i;
        p.push(i);
        s += "</th>";
    }
    s += '<th class="thEdit">Edit</th><th class="thDel">Delete</th></tr></thead>';
    table.innerHTML += s;
    s = '';
    for (var j = 0; j < arr.length; j++) {
        s += "<tr data-id='" + arr[j].id + "'>";
        for (var i in arr[j]) {
            s += "<td>";
            s += arr[j][i];
            s += "</td>";
        }
        s += '<td class="editBtnTr"></td><td class="delBtnTr"></td></tr>';

    }
    table.innerHTML += s;
    return p;
}

function delRow(e) {
    var target = e.target;
    if (target.tagName != "TD") return;
    if (!target.classList.contains("delBtnTr")) return;
    var conf = confirm("Delete " + e.target.parentNode.dataset.id);
    if (conf) {
        var msg = "id=" + e.target.parentNode.dataset.id;
        msg += "&table=" + curTable;
        $.ajax({
            type: 'POST',
            url: 'delRow',
            data: msg,
            error: function (xhr, str) {
                console.log('Возникла ошибка: ' + str);
            },
            success: function (xhr, str) {
                console.log('Success: ' + str);
            }
        });
        loadTable(curTable);
    }
}

function editRow(e) {
    var target = e.target;
    var id = '';
    if (target.tagName != "TD") return;
    if (!target.classList.contains("editBtnTr")) return;
    if (curEdit != null) {
        curEdit.innerHTML = backup.innerHTML;
        curEdit.classList = '';
    }
    backup = target.parentNode.cloneNode(true);
    var tr = target.parentNode;
    var obj = {};
    for (var j = 0; j < params.length; j++) {
        obj[params[j]] = target.parentNode.children[j].textContent;
    }
    id = obj.id;
    var html = '';
    var arToTR = [];
    for (var i in obj) {
        arToTR.push(obj[i])
    }
    for (var i = 0; i < schemaAr.length; i++) {
        html += "<td>" + schemaAr[i].replace(/VAL/, arToTR[i]) + "</td>";
    }
    html += '<td id="editConfirmBtn"></td>' + '<td id="editCloseBtn">Close</td>';

    tr.classList.add("editable");
    tr.innerHTML = html;
    curEdit = tr;

    document.getElementById("editCloseBtn").addEventListener("click", function (e) {
        curEdit.innerHTML = backup.innerHTML;
        curEdit.classList = empty;
        backup = null;
        curEdit = null;
    });
    document.getElementById("editConfirmBtn").addEventListener("click", function (e) {
        for (var i = 0; i < params.length; i++) {
            obj[params[i]] = tr.children[i].children[0].value;
        }
        var msg = "json=" + JSON.stringify(obj) + "&id=" + id;
        msg += "&table=" + curTable;
        $.ajax({
            type: 'POST',
            url: 'updateRow',
            data: msg,
            error: function (xhr, str) {
                console.log('Возникла ошибка: ' + str);
            },
            success: function (xhr, str) {
                console.log('Success: ' + str);
            }
        });
        loadTable(curTable);
    });

}

function addRow() {
    var msg = $('#formx').serialize();
    msg += "&table=" + curTable;
    $.ajax({
        type: 'POST',
        url: 'addRow',
        data: msg,
        error: function (xhr, str) {
            console.log('Возникла ошибка: ' + str);
        },
        success: function (xhr, str) {
            console.log('Success: ' + str);
        }
    });
    loadTable(curTable);

}

function createAddForm() {
    addForm.innerHTML = '';
    for (var i = 0; i < schemaAr.length; i++) {
        addForm.innerHTML += schemaAr[i].replace(/VAL/, '');
    }
    addForm.innerHTML += '<input value="Add" type="submit">' +
        '<a onclick="this.parentNode.style.height=empty" class="formClose"></a>';

}

function createEditAr(schema) {
    var tmplVC = '<input id="NAME" name="NAME" value="VAL" type="text" placeholder="NAME">';
    var tmplBOOL = '<input id="NAME" name="NAME" value="VAL" min="0" max="1" type="number" placeholder="NAME">';
    var tmplINT = '<input id="NAME" name="NAME" value="VAL"  type="number" placeholder="NAME">';
    var disabled = '<input id="NAME" name="NAME" value="VAL"  disabled>';
    var s = '';
    var ar = [];
    for (var i = 0; i < schema.length; i++) {
        if(schema[i].Extra == "auto_increment"){
            s = disabled.replace(/NAME/g, schema[i].Field);
            ar.push(s);
            continue;
        }
        if (/varchar/.test(schema[i].Type)) {
            s = tmplVC.replace(/NAME/g, schema[i].Field);
            ar.push(s);
        }
        if (/int/.test(schema[i].Type) && !/tinyint/.test(schema[i].Type) && !(/bigint/.test(schema[i].Type)) ) {
            s = tmplINT.replace(/NAME/g, schema[i].Field);
            ar.push(s);
        }
        if (/tinyint/.test(schema[i].Type)) {
            s = tmplBOOL.replace(/NAME/g, schema[i].Field);
            ar.push(s);
        }
        if (/bigint/.test(schema[i].Type)) {
            s = tmplINT.replace(/NAME/g, schema[i].Field);
            ar.push(s);
        }
    }
    return ar;
}

function getSchema(table) {
    $.ajax({
        type: 'GET',
        url: 'getSchemaTable/?table=' + table,
        error: function (xhr, str) {
            console.log('Возникла ошибка: ' + str);
        },
        success: function (xhr, str) {
            var response = JSON.parse(xhr);
            schemaAr = createEditAr(response);
            createAddForm();
        }
    });
}


function getSchemaDB(callback) {
    $.ajax({
        type: 'GET',
        url: 'getSchemaDB',
        error: function (xhr, str) {
            console.log('Возникла ошибка: ' + str);
        },
        success: function (xhr, str) {
            createMenu(xhr);
            callback(xhr[0]);
        }
    });
}

function createMenu(ar) {
    var fr = document.createDocumentFragment();
    curTable = ar[0];
    for (var i = 0; i < ar.length; i++) {
        var li = document.createElement('li');
        li.innerHTML = li.dataset.id = ar[i];
        if (curTable == ar[i]) {
            li.className = 'selected';
        }
        fr.appendChild(li);
    }

    document.getElementById('list').appendChild(fr);
}
