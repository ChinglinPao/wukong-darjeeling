// vim: ts=4 sw=4

global_polling_status = false;

function polling_is_stopped() {
    return !global_polling_status
}

$(document).ready(function() {
    init();
});

function init()
{
    window.options = {repeat: false};
    // Top bar
    $('#application').click(function() {
        $('#node-editor').parent().removeClass('active');
        $('#application').parent().addClass('active');
        $('#locationTree').parent().removeClass('active');
        window.options.repeat = false;
        application_fill();
    });

    $('#node-editor').click(function() {
        $('#node-editor').parent().addClass('active');
        $('#application').parent().removeClass('active');
        $('#locationTree').parent().removeClass('active');
        window.options.repeat = false;
        $.get('/testrtt', function(data) {
            if (data.status == '1') {
                alert(data.mesg);
            }
            else {
                $('#content').html(data.testrtt);
            }
        });
    });
    
    $('#locationTree').click(function() {
        $('#node-editor').parent().removeClass('active');
        $('#application').parent().removeClass('active');
        $('#locationTree').parent().addClass('active');
        window.options.repeat = false;
        $.post('/loc_tree', function(data) {
                make_tree(data);
                $('#content').append(data.node);
                load_landmark(data.xml);                
        });                    
    });
    
    application_fill();
    
}

function application_fill()
{
    $('#content').empty();
    $('#content').append($('<p><button id="appadd" class="btn btn-primary">Add new application</button></p>'));
    $.ajax({
        url: '/applications',
        type: 'POST',
        dataType: 'json',
        success: function(r) {
            application_fillList(r);
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });

    $('#appadd').click(function() {
        app_name = prompt('Please enter the application name:', 'Application name')
        $.post('/applications/new', {app_name: app_name}, function(data) {
            if (data.status == '1') {
                alert(data.mesg);
            }
            else {
                console.log(data);
                application_fill();
            }
        });
    });
}

function application_fillList(r)
{
    var i;
    var len = r.length;
    var m = $('#content');

    applist = $('<table id=applist></table>');
    for(i=0; i<len; i++) {
        // Html elements
        var appentry = $('<tr class=listitem></tr>');
        var name = $('<td class=appname data-app_id="' + r[i].id + '" id=appname'+i+'><b><i>' + r[i].app_name + '</i></b></td>');
        var act = $('<td class=appact id=appact'+i+'></td>');

        // Acts
        //var monitor = $('<button class=appmonitor data-app_id="' + r[i].id + '" id=appmonitor'+i+'></button>');
        //var deploy = $('<button class=appdeploy data-app_id="' + r[i].id + '" id=appdeploy'+i+'></button>');
        //var remove = $('<button class=appdel data-app_id="' + r[i].id + '" id=appdel'+i+'></button>');
        var remove = $('<button class=close data-app_id="' + r[i].id + '" id=appdel'+i+'>&times;</button>');

        // Enter application
        name.click(function() {
            var topbar;
            var app_id = $(this).data('app_id');

            $('#content').empty();
            $('#content').block({
                message: '<h1>Processing</h1>',
                css: { border: '3px solid #a00' }
            });

            $.post('/applications/' + app_id, function(data) {
                if (data.status == 1) {
                    alert(data.mesg);
                    application_fill();
                } else {
                    // injecting script to create application interface
                    //content_scaffolding(data.topbar, $('<div class="img-rounded" style="height: 100%; padding: 10px;"><iframe width="100%" height="100%" src="/applications/' + app_id + '/fbp/load"></iframe></div>'));
                    //$('#content').html('<div id="topbar"></div><iframe width="100%" height="100%" src="/applications/' + app_id + '/fbp/load"></iframe>');

                    topbar = data.topbar;
                    $.get('/applications/' + app_id + '/deploy', function(data) {
                        if (data.status == 1) {
                            alert(data.mesg);
                            application_fill();
                        } else {
                            // injecting script to create application interface
                            page = $(data.page);
                            console.log(page);
                            content_scaffolding(topbar, page);
                            $('#content').unblock();

                            // Application polling will be optional
                        }
                    });
                }
            });
        });

/*
        monitor.click(function() {
            $('#content').empty();
            var topbar;

            $('#content').block({
                message: '<h1>Processing</h1>',
                css: { border: '3px solid #a00' }
            });

            $.get('/applications/' + app_id, {title: "Monitoring"}, function(data) {
                if (data.status == 1) {
                    alert(data.mesg);
                } else {
                    topbar = data.topbar;
                    $.get('/applications/' + app_id + '/monitor', function(data) {
                        if (data.status == 1) {
                            alert(data.mesg);
                            application_fill();
                        } else {
                            // injecting script to create application interface
                            page = $(data.page);
                            console.log(page);
                            content_scaffolding(topbar, page);
                            $('#content').unblock();
                        }
                    });
                }
            });
        });

        deploy.click(function() {
            $('#content').empty();
            var topbar;

            $('#content').block({
                message: '<h1>Processing</h1>',
                css: { border: '3px solid #a00' }
            });

            $.get('/applications/' + app_id, {title: "Deployment"}, function(data) {
                if (data.status == 1) {
                    alert(data.mesg);
                } else {
                    topbar = data.topbar;
                    $.get('/applications/' + app_id + '/deploy', function(data) {
                        if (data.status == 1) {
                            alert(data.mesg);
                            application_fill();
                        } else {
                            // injecting script to create application interface
                            page = $(data.page);
                            console.log(page);
                            content_scaffolding(topbar, page);
                            $('#content').unblock();
                        }
                    });
                }
            });
        });
*/

        remove.click(function() {
            var app_id = $(this).data('app_id');
            $.ajax({
                type: 'delete',
                url: '/applications/' + app_id,
                success: function(data) {
                    if (data.status == 1) {
                        alert(data.mesg);
                    }

                    application_fill();
                }
            });
        });

        //act.append(monitor);
        //act.append(deploy);
        act.append(remove);

        appentry.append(name);
        appentry.append(act);
        applist.append(appentry);
        //application_setupButtons(i, r[i].id);
    }

    m.append(applist);
}

function start_polling()
{
    // start polling
    window.options = {repeat: true};
}

function stop_polling()
{
    // stop polling
    window.options = {repeat: false};
}

function application_polling(app_id, destination, property)
{
    // stops previous polling
    stop_polling();

    while (!polling_is_stopped()) {};

    // starts a new one
    start_polling();

    // sets default destination
    if (typeof destination == 'undefined') {
        destination = '#mapping-progress';
    }

    // sets default property
    if (typeof property == 'undefined') {
        property = 'all_wukong_status';
    }

    poll('/applications/' + app_id + '/poll', 0, window.options, function(data) {
        //data.wukong_status = data.wukong_status.trim();
        //data.application_status = data.application_status.trim();
        console.log(data);
        $(destination).empty();
        for (var i=0; i<data[property].length; i++) {
            $(destination).append("<pre>[" + data[property][i].level + "] " + data[property][i].msg + "</pre>");
        }
        
        //if (data.wukong_status === "close" || data.application_status === "close") {
            //$('#deploy_results').dialog('close');
        //} else if (!(data.wukong_status === "" && data.application_status === "")) {
            //$('#deploy_results').dialog({modal: true, autoOpen: true, width: 600, height: 300}).dialog('open');
            //$('#deploy_results #wukong_status').text(data.wukong_status);
            //$('#deploy_results #application_status').text(data.application_status);
        //}
    });
}

function content_scaffolding(topbar, editor)
{
    $('#content').append(topbar);
    $('#content').append(editor);
}


/*
function application_setupButtons(i, id)
{
    $('#appmonitor'+i).click(function() {
        alert("not implemented yet");
    });
    $('#appdeploy'+i).click(function() {
        $.get('/applications/' + id + '/deploy', function(data) {
            if (data.status == 1) {
                alert(data.mesg);
            } else {
                deploy_show(data.page, id);
            }
        });
    });
    $('#appdel'+i).click(function() {
        $.ajax({
            type: 'delete',
            url: '/applications/' + id,
            success: function(data) {
                if (data.status == 1) {
                    alert(data.mesg);
                }

                application_fill();
            }
        });
    });
}
*/

/*
function application_setupLink(app_id)
{
    $.post('/applications/' + app_id, function(data) {
        // create application
        $('#content').html('<div id="topbar"></div><iframe width="100%" height="100%" src="/applications/' + app_id + '/fbp/load"></iframe>');
        $('#topbar').append(data.topbar);
        $('#topbar #back').click(function() {
            application_fill();
        });
    });
}
*/

/*
function deploy_show(page, id)
{
    // deployment page
    $('#content').html(page);
    $('#content #back').click(function() {
        application_fill();
    });

    $('#content #deploy').click(function() {
        if ($('#content input').length == 0) {
            alert('The master cannot detect any nearby deployable nodes. Please move them in range of the basestation and try again.');
        } else if ($('#content input[type="checkbox"]:checked').length == 0) {
            alert('Please select at least one node');
        } else {
            var nodes = new Array();
            nodes = _.map($('#content input[type="checkbox"]:checked'), function(elem) {
                return parseInt($(elem).val(), 10);
            });

            console.log(nodes);

            $.post('/applications/' + id + '/deploy', {selected_node_ids: nodes}, function(data) {
                deploy_poll(id, data.version);
            });
        }
    });
}
*/

/*
function deploy_poll(id, version)
{
    $.post('/applications/'+id+'/deploy/poll', {version: version}, function(data) {
        $('#progress #compile_status').html('<p>' + data.deploy_status + '</p>');
        $('#progress #normal').html('<h2>NORMAL</h2><pre>' + data.normal.join('\n') + '</pre>');
        $('#progress #urgent_error').html('<h2>URGENT</h2><pre>' + data.error.urgent.join('\n') + '</pre>');
        $('#progress #critical_error').html('<h2>CRITICAL</h2><pre>' + data.error.critical.join('\n') + '</pre>');

        if (data.compile_status < 0) {
            deploy_poll(id, data.version);
        }
        else {
            $('#progress').dialog({buttons: {Ok: function() {
                $(this).dialog('close');
            }}})
        }
    });
}
*/

// might have to worry about multiple calls :P
function poll(url, version, options, callback)
{
    var forceRepeat = false;
    if (typeof options != 'undefined') {
        // repeat is an object with one key 'repeat', or it will be pass-by-value and therefore can't be stopped
        forceRepeat = options.repeat;
    }

    global_polling_status = true;
    console.log('polling');
    $.post(url, {version: version}, function(data) {
        if (typeof callback != 'undefined') {
            callback(data);
        }

        if (data.ops.indexOf('c') != -1) {
            stop_polling();
        } else if (forceRepeat) {
            setTimeout(function() {
                poll(url, data.version, options, callback);
            }, 1000);
        }

        global_polling_status = false;
    });
}


function display_tree(rt) {
    $('#content').empty();
    $('#content').append('<script type="text/javascript" src="/static/js/jquery.treeview.js"></script>'+
        '<script type="text/javascript" src="/static/js/tree_expand.js"></script>'+
        '<script type="text/javascript" src="/static/js/jquery.cookie.js"></script>'
        );

    var node_data = JSON.parse(rt.loc);
    var tree_level = 0;
    var html_tree = '';
    html_tree = '<table width="100%">';
    html_tree += '<tr><td width="5%"></td><td></td><td></td></tr>';
    html_tree += '<tr><td></td><td>';
    html_tree += '<ul id="display" class="treeview">';
    for(var i=0; i<node_data.length;i++){
          if(node_data[i][1] == tree_level){
              //do nothing
          }else if(node_data[i][1] > tree_level){
            html_tree +='<ul>';
            tree_level = node_data[i][1];
        }else if (node_data[i][1]<tree_level){
          for(var j=0; j<tree_level-node_data[i][1] ;j++){
                  html_tree += '</ul></li>';
              }
              tree_level = node_data[i][1];
        }
        //see locationTree.py, class locationTree.toJason() function for detailed data format
          if(node_data[i][0] === 0){ //this is a tree node
            if (node_data[i][1] === 0){  //root
                  html_tree += '<li id="'+ node_data[i][2][1] +'"><button class="locTreeNode" id='+node_data[i][2][0]+'>'+node_data[i][2][1]+'</button>';
            }else{
                for (var j=i+1;j<node_data.length;++j) {
                    if (node_data[j][1]==node_data[i][1]){
                        html_tree += '<li  id="'+ node_data[i][2][1] +'"><button class="locTreeNode" id='+node_data[i][2][0]+'>'+node_data[i][2][1]+'</button>';
                        break;
                    }
                    if (node_data[j][1]<node_data[i][1]){
                        html_tree += '<li  id="'+ node_data[i][2][1] +'"><button class="locTreeNode" id='+node_data[i][2][0]+'>'+node_data[i][2][1]+'</button>';
                        break;
                    }
                    if (j==node_data.length-1){
                        html_tree += '<li id="'+ node_data[i][2][1] +'"><button class="locTreeNode" id='+node_data[i][2][0]+'>'+node_data[i][2][1]+'</button>';
                    }
                }
            }
          }else if (node_data[i][0] == 1){            //this is a sensor 
                html_tree += '<li id=se'+node_data[i][2][0]+' data-toggle=modal  role=button class="btn" >'+node_data[i][2][0]+node_data[i][2][1]+'</li>';
          }else if(node_data[i][0]==2){               //this is a landmark
                html_tree += '<li id=lm'+node_data[i][2][1]+' data-toggle=modal  role=button class="btn" >'+node_data[i][2][0]+node_data[i][2][1]+'</li>';
          }
        }
    html_tree += '</td><td valign="top">';
    html_tree += '<button id="saveTree">SAVE Landmarks</button>' +
                 '<button id="addNode">ADD Landmark</button>'+
                 '<button id="delNode">DEL Landmark</button>'+
                 '<button type="button" class="set_node">Save Node Configuration</button><br>'+
                 'type <div id="nodeType"></div><br>'+
                 'ID <input id="SensorId" type=text size="10"><br>'+
                 'Location <input id="locName" type=text size="100"><br>'+
                 'Local Coordinate <input id="localCoord" type=text size="100"><br>'+
                 'Global Coordinate <input id="gloCoord" type=text size="100"><br>'+
                 'Size <input id = "size" type=text size="100"><br>'+
                 'Direction <input id = "direction" type=text size="100"><br>'+
                 'Distance Modifier <button id="addModifier">Add Modifier</button> '+ 
                 '<button id="delModifier">Delete Modifier</button><br>' +
                 'start treenode ID<input id = "distmod_start_id" type=text size="20"><br>'+
                 'end treenode ID<input id = "distmod_end_id" type=text size="20"><br>'+
                 'distance<input id = "distmod_distance" type=text size="20"><br>'+
                 'Existing Modifiers <div id="distmod_list"></div><br>';
    html_tree += 'Add/Del Object <input id="node_addDel" type=text size="50"><br>';
//  html_tree += 'add/del location <input id="loc_addDel" type=text size="50">'
    html_tree += '</td></tr></table>';
    $('#content').append(html_tree);
    $("#display").treeview({
  collapsed: true,
  unique: true});
}

